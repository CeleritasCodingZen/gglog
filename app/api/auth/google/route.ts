// ============================================
// GGLOG — Google OAuth Initiation
// ============================================
// GET /api/auth/google
//
// Starts the Google OAuth 2.0 Authorization Code
// flow. Generates a cryptographically secure state
// value for CSRF protection, stores it in a short-
// lived HttpOnly cookie, and redirects the browser
// to Google's authorization endpoint.
//
// Optional query parameter:
//   ?next=/dashboard — safe redirect target after
//   successful authentication.
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

import { getGoogleAuthUrl } from '@/lib/google'

// State cookie name and TTL
const OAUTH_STATE_COOKIE = 'gglog_oauth_state'
const STATE_TTL_SECONDS = 600 // 10 minutes

/**
 * Validate that a redirect target is a safe internal path.
 * Replicates the same logic used in the auth page.
 */
function isSafeRedirectPath(path: string): boolean {
  if (!path.startsWith('/')) return false
  if (path.startsWith('//')) return false
  if (path.includes('\\')) return false
  try {
    const url = new URL(path, 'http://localhost')
    if (url.origin !== 'http://localhost') return false
  } catch {
    return false
  }
  return true
}

export async function GET(request: NextRequest) {
  // ---- Generate CSRF state ----
  const state = crypto.randomBytes(32).toString('hex')

  // ---- Determine redirect target ----
  const nextParam = request.nextUrl.searchParams.get('next')
  const redirectAfter = nextParam && isSafeRedirectPath(nextParam)
    ? nextParam
    : '/dashboard'

  // ---- Store state + redirect in cookie ----
  // Encode as JSON so we can carry both values in one cookie
  const statePayload = JSON.stringify({ state, next: redirectAfter })

  const isProduction = process.env.NODE_ENV === 'production'

  // ---- Build Google authorization URL & redirect ----
  const authUrl = getGoogleAuthUrl(state)
  const response = NextResponse.redirect(authUrl)

  response.cookies.set(OAUTH_STATE_COOKIE, statePayload, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: STATE_TTL_SECONDS,
  })

  return response
}
