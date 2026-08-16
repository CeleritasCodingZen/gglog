import { NextResponse } from 'next/server'

// ============================================
// GGLOG — Consistent API Error Handling
// ============================================

/**
 * Structured API error with HTTP status code and machine-readable error code.
 */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string
  ) {
    super(message)
    this.name = 'AppError'
  }
}

// ---- Common Error Factories ----

export const Errors = {
  badRequest: (message: string, code = 'BAD_REQUEST') =>
    new AppError(400, code, message),

  invalidCredentials: () =>
    new AppError(401, 'INVALID_CREDENTIALS', 'Invalid username/email or password.'),

  unauthenticated: () =>
    new AppError(401, 'UNAUTHENTICATED', 'You must be signed in to access this resource.'),

  forbidden: () =>
    new AppError(403, 'FORBIDDEN', 'You do not have permission to access this resource.'),

  notFound: (resource = 'Resource') =>
    new AppError(404, 'NOT_FOUND', `${resource} not found.`),

  conflict: (message: string) =>
    new AppError(409, 'CONFLICT', message),

  internal: () =>
    new AppError(500, 'INTERNAL_ERROR', 'An unexpected error occurred.'),
} as const

// ---- Response Helpers ----

/**
 * Return a success JSON response.
 *
 * @example
 *   return apiSuccess({ user }, 201)
 */
export function apiSuccess<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ success: true, data }, { status })
}

/**
 * Return an error JSON response.
 *
 * Accepts either an AppError (structured) or a generic Error (mapped to 500).
 * Never exposes stack traces or internal details to the client.
 *
 * @example
 *   return apiError(Errors.conflict('Username already taken.'))
 */
export function apiError(error: unknown): NextResponse {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      },
      { status: error.statusCode }
    )
  }

  // Unknown/unexpected errors — log server-side, return generic to client
  console.error('[API Error]', error)
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred.',
      },
    },
    { status: 500 }
  )
}
