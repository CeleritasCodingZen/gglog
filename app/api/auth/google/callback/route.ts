// ============================================
// GGLOG — Google OAuth Callback
// ============================================
// GET /api/auth/google/callback
//
// Handles the redirect back from Google after the
// user consents. Validates the CSRF state, exchanges
// the authorization code for tokens, verifies the
// Google ID token, resolves or creates the GGLOG
// user, creates a session using the EXISTING session
// system, and redirects to the app.
//
// Error handling:
//   On any failure, redirects to /auth?error=<code>
//   with a machine-readable error code. The auth
//   page displays the appropriate message.
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createSession } from '@/lib/auth'
import { exchangeCodeForTokens, verifyGoogleIdToken } from '@/lib/google'

// State cookie name (must match initiation route)
const OAUTH_STATE_COOKIE = 'gglog_oauth_state'

/**
 * Build a redirect URL to the auth page with an error code.
 */
function authErrorRedirect(request: NextRequest, errorCode: string): NextResponse {
  const url = new URL('/auth', request.nextUrl.origin)
  url.searchParams.set('error', errorCode)
  const response = NextResponse.redirect(url)
  // Always clear the state cookie on error
  response.cookies.delete(OAUTH_STATE_COOKIE)
  return response
}

/**
 * Generate a unique username from the Google profile name.
 *
 * Strategy:
 *   1. Build a base from givenName or name (lowercase, alphanumeric + underscore)
 *   2. If taken, append random digits until unique
 *   3. Fallback to "player_XXXXX" if no usable name
 */
async function generateUniqueUsername(
  name: string | undefined,
  givenName: string | undefined,
): Promise<string> {
  // Build a base username from the Google name
  const raw = (givenName || name || '').trim()
  let base = raw
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')  // Replace non-alphanumeric
    .replace(/_+/g, '_')          // Collapse multiple underscores
    .replace(/^_|_$/g, '')        // Trim leading/trailing underscores

  // Enforce minimum length
  if (base.length < 3) {
    base = 'player'
  }

  // Truncate if too long (leave room for suffix)
  if (base.length > 20) {
    base = base.slice(0, 20)
  }

  // Try the base username first
  const existing = await prisma.user.findUnique({
    where: { username: base },
    select: { id: true },
  })

  if (!existing) return base

  // Append random digits until unique (max 10 attempts)
  for (let i = 0; i < 10; i++) {
    const suffix = Math.floor(Math.random() * 10000)
    const candidate = `${base}_${suffix}`
    const taken = await prisma.user.findUnique({
      where: { username: candidate },
      select: { id: true },
    })
    if (!taken) return candidate
  }

  // Last resort: fully random
  const fallback = `player_${Date.now().toString(36)}`
  return fallback
}

export async function GET(request: NextRequest) {
  try {
    // ---- Check for OAuth error from Google ----
    const oauthError = request.nextUrl.searchParams.get('error')
    if (oauthError) {
      console.warn('[Google OAuth] User denied or error from Google:', oauthError)
      return authErrorRedirect(request, 'oauth_denied')
    }

    // ---- Read authorization code ----
    const code = request.nextUrl.searchParams.get('code')
    if (!code) {
      console.error('[Google OAuth] Missing authorization code')
      return authErrorRedirect(request, 'missing_code')
    }

    // ---- Validate CSRF state ----
    const receivedState = request.nextUrl.searchParams.get('state')
    const stateCookie = request.cookies.get(OAUTH_STATE_COOKIE)?.value

    if (!receivedState || !stateCookie) {
      console.error('[Google OAuth] Missing state or state cookie')
      return authErrorRedirect(request, 'invalid_state')
    }

    let storedState: string
    let redirectAfter: string = '/dashboard'

    try {
      const parsed = JSON.parse(stateCookie)
      storedState = parsed.state
      redirectAfter = parsed.next || '/dashboard'
    } catch {
      console.error('[Google OAuth] Failed to parse state cookie')
      return authErrorRedirect(request, 'invalid_state')
    }

    if (receivedState !== storedState) {
      console.error('[Google OAuth] State mismatch — possible CSRF')
      return authErrorRedirect(request, 'invalid_state')
    }

    // ---- Exchange code for tokens (server-side) ----
    let idToken: string
    try {
      const tokens = await exchangeCodeForTokens(code)
      idToken = tokens.id_token
    } catch (err) {
      console.error('[Google OAuth] Token exchange failed:', err)
      return authErrorRedirect(request, 'token_exchange_failed')
    }

    // ---- Verify ID token (signature, issuer, audience, expiry) ----
    let googleIdentity
    try {
      googleIdentity = await verifyGoogleIdToken(idToken)
    } catch (err) {
      console.error('[Google OAuth] ID token verification failed:', err)
      return authErrorRedirect(request, 'invalid_token')
    }

    const { sub, email, name, givenName, familyName, picture } = googleIdentity

    // ---- Account Resolution ----

    // CASE A: Find existing OAuth account by provider + sub
    const existingAccount = await prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider: 'google',
          providerAccountId: sub,
        },
      },
      include: {
        user: { include: { profile: true } },
      },
    })

    let userId: string

    if (existingAccount) {
      // Already linked — sign in as this user
      userId = existingAccount.userId
    } else {
      // CASE B/C: Google account not yet linked
      const existingUser = await prisma.user.findUnique({
        where: { email },
        select: { id: true, accounts: { where: { provider: 'google' } } },
      })

      if (existingUser) {
        // CASE D check: Is a different Google account already linked to this user?
        // (This shouldn't normally happen since we searched by sub first,
        //  but guard against edge cases)
        if (existingUser.accounts.length > 0) {
          console.error('[Google OAuth] User already has a different Google account linked')
          return authErrorRedirect(request, 'account_conflict')
        }

        // CASE B: Link Google to existing user
        await prisma.account.create({
          data: {
            userId: existingUser.id,
            provider: 'google',
            providerAccountId: sub,
          },
        })

        // Update profile picture if not set
        if (picture) {
          await prisma.profile.updateMany({
            where: { userId: existingUser.id, avatarUrl: null },
            data: { avatarUrl: picture },
          })
        }

        userId = existingUser.id
      } else {
        // CASE C: Create new user + profile + account
        const username = await generateUniqueUsername(name, givenName)
        const displayName = name || givenName || username

        const newUser = await prisma.$transaction(async (tx) => {
          const user = await tx.user.create({
            data: {
              username,
              email,
              // passwordHash is null — OAuth-only account
              profile: {
                create: {
                  displayName,
                  avatarUrl: picture || null,
                },
              },
              accounts: {
                create: {
                  provider: 'google',
                  providerAccountId: sub,
                },
              },
            },
            include: { profile: true },
          })
          return user
        })

        userId = newUser.id
      }
    }

    // ---- Create session using EXISTING session system ----
    await createSession(userId)

    // ---- Redirect to authenticated destination ----
    const redirectUrl = new URL(redirectAfter, request.nextUrl.origin)
    const response = NextResponse.redirect(redirectUrl)

    // Clear the state cookie (single-use)
    response.cookies.delete(OAUTH_STATE_COOKIE)

    return response
  } catch (error) {
    // Catch-all: log server-side, redirect with generic error
    console.error('[Google OAuth] Unexpected error in callback:', error)
    return authErrorRedirect(request, 'server_error')
  }
}
