// ============================================
// GGLOG — Google OAuth Helpers (server-side only)
// ============================================
//
// Provides the low-level primitives for the Google
// OAuth 2.0 Authorization Code flow with OIDC:
//
//   1. Building the Google authorization URL
//   2. Exchanging the authorization code for tokens
//   3. Verifying and extracting claims from the
//      Google ID token using jose (JWKS)
//
// This file must NEVER be imported from client code.
// The Google client secret is accessed here.
// ============================================

import { createRemoteJWKSet, jwtVerify } from 'jose'

// ---- Configuration ----

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!

/**
 * Build the redirect URI dynamically based on the current environment.
 *
 * - Production (Vercel): uses VERCEL_PROJECT_PRODUCTION_URL or VERCEL_URL
 * - Development: defaults to localhost:3000
 */
function getRedirectUri(): string {
  // Vercel sets these automatically
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}/api/auth/google/callback`
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/api/auth/google/callback`
  }
  // Local development
  return 'http://localhost:3000/api/auth/google/callback'
}

// Google OAuth endpoints
const GOOGLE_AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token'
const GOOGLE_JWKS_URI = 'https://www.googleapis.com/oauth2/v3/certs'

// Cached JWKS key set for ID token verification
const googleJWKS = createRemoteJWKSet(new URL(GOOGLE_JWKS_URI))

// ---- Authorization URL ----

/**
 * Build the Google OAuth 2.0 authorization URL.
 *
 * Requests the minimum scopes needed for authentication:
 *   openid — OIDC ID token
 *   email  — verified email address
 *   profile — display name, picture
 */
export function getGoogleAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: getRedirectUri(),
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'online',  // No refresh token needed
    prompt: 'select_account', // Always show account chooser
  })

  return `${GOOGLE_AUTH_ENDPOINT}?${params.toString()}`
}

// ---- Token Exchange ----

interface GoogleTokenResponse {
  id_token: string
  access_token: string
  token_type: string
  expires_in: number
  scope: string
}

/**
 * Exchange an authorization code for Google tokens (server-side).
 *
 * Returns the raw token response. We only need the `id_token`
 * for authentication — the access token is not persisted.
 */
export async function exchangeCodeForTokens(code: string): Promise<GoogleTokenResponse> {
  const response = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: getRedirectUri(),
      grant_type: 'authorization_code',
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'unknown')
    console.error('[Google OAuth] Token exchange failed:', response.status, errorBody)
    throw new Error('Failed to exchange authorization code for tokens.')
  }

  return response.json()
}

// ---- ID Token Verification ----

/**
 * Verified Google identity — the trusted claims extracted
 * from a validated Google ID token.
 */
export interface GoogleIdentity {
  /** Google account ID — stable, unique identifier */
  sub: string
  /** Verified email address */
  email: string
  /** Whether Google has verified this email */
  emailVerified: boolean
  /** Full display name */
  name: string | undefined
  /** Given (first) name */
  givenName: string | undefined
  /** Family (last) name */
  familyName: string | undefined
  /** Profile picture URL */
  picture: string | undefined
}

/**
 * Verify a Google ID token and extract the identity claims.
 *
 * Performs full cryptographic verification:
 *   - Signature validation against Google's public JWKS keys
 *   - Issuer check (accounts.google.com)
 *   - Audience check (our client ID)
 *   - Expiration check
 *
 * Throws if the token is invalid for any reason.
 */
export async function verifyGoogleIdToken(idToken: string): Promise<GoogleIdentity> {
  const { payload } = await jwtVerify(idToken, googleJWKS, {
    issuer: ['https://accounts.google.com', 'accounts.google.com'],
    audience: GOOGLE_CLIENT_ID,
  })

  // Extract claims
  const sub = payload.sub
  const email = payload.email as string | undefined
  const emailVerified = payload.email_verified as boolean | undefined
  const name = payload.name as string | undefined
  const givenName = payload.given_name as string | undefined
  const familyName = payload.family_name as string | undefined
  const picture = payload.picture as string | undefined

  if (!sub) {
    throw new Error('Google ID token missing sub claim.')
  }

  if (!email) {
    throw new Error('Google ID token missing email claim.')
  }

  if (!emailVerified) {
    throw new Error('Google email is not verified.')
  }

  return {
    sub,
    email: email.toLowerCase(),
    emailVerified: true,
    name,
    givenName,
    familyName,
    picture,
  }
}
