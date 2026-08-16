import { apiSuccess, apiError, Errors } from '@/lib/errors'
import { getSession, sanitizeUser } from '@/lib/auth'

// ============================================
// GET /api/auth/me
// ============================================

export async function GET() {
  try {
    const result = await getSession()

    if (!result) {
      return apiError(Errors.unauthenticated())
    }

    return apiSuccess({ user: sanitizeUser(result.user) })
  } catch (error) {
    return apiError(error)
  }
}
