import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'
import { AppError, Errors } from '@/lib/errors'
import crypto from 'crypto'
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_MS } from '@/lib/auth-constants'

// Re-export so existing consumers can still import from '@/lib/auth'
export { SESSION_COOKIE_NAME } from '@/lib/auth-constants'

// ============================================
// GGLOG — Authentication & Session Helpers
// ============================================

/**
 * Build cookie options appropriate for the current environment.
 */
function getCookieOptions(maxAge?: number) {
  const isProduction = process.env.NODE_ENV === 'production'
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: maxAge ?? Math.floor(SESSION_MAX_AGE_MS / 1000), // seconds
  }
}

/**
 * Safe user object — strips passwordHash, sessionToken, and other sensitive fields.
 * This is the shape returned to API clients.
 */
export function sanitizeUser(user: {
  id: string
  username: string
  email: string
  createdAt: Date
  updatedAt: Date
  profile?: {
    id: string
    displayName: string | null
    bio: string | null
    avatarUrl: string | null
  } | null
}) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    profile: user.profile
      ? {
          id: user.profile.id,
          displayName: user.profile.displayName,
          bio: user.profile.bio,
          avatarUrl: user.profile.avatarUrl,
        }
      : null,
  }
}

/**
 * Create a new session for a user.
 *
 * - Generates a cryptographically random session token
 * - Stores it in the Session table with an expiry
 * - Sets an HTTP-only cookie on the response
 */
export async function createSession(userId: string): Promise<void> {
  const sessionToken = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_MS)

  await prisma.session.create({
    data: {
      sessionToken,
      userId,
      expiresAt,
    },
  })

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, getCookieOptions())
}

/**
 * Get the current session and associated user.
 *
 * Returns `null` if there is no valid session (no cookie, expired, or deleted).
 */
export async function getSession() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!sessionToken) {
    return null
  }

  const session = await prisma.session.findUnique({
    where: { sessionToken },
    include: {
      user: {
        include: {
          profile: true,
        },
      },
    },
  })

  if (!session) {
    return null
  }

  // Check expiry
  if (session.expiresAt < new Date()) {
    // Clean up expired session
    await prisma.session.delete({ where: { id: session.id } }).catch(() => {})
    cookieStore.delete(SESSION_COOKIE_NAME)
    return null
  }

  return {
    session,
    user: session.user,
  }
}

/**
 * Require an authenticated user.
 *
 * Throws a 401 AppError if there is no valid session.
 * Use in protected API routes:
 *
 * @example
 *   const user = await requireAuth()
 */
export async function requireAuth() {
  const result = await getSession()

  if (!result) {
    throw Errors.unauthenticated()
  }

  return result.user
}

/**
 * Get the current user without throwing.
 *
 * Returns the user if authenticated, `null` otherwise.
 */
export async function getCurrentUser() {
  const result = await getSession()
  return result?.user ?? null
}

/**
 * Clear the current session — delete from DB and remove cookie.
 */
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (sessionToken) {
    await prisma.session
      .deleteMany({ where: { sessionToken } })
      .catch(() => {})
  }

  cookieStore.set(SESSION_COOKIE_NAME, '', {
    ...getCookieOptions(0),
    maxAge: 0,
  })
}
