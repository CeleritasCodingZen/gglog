import { apiSuccess, apiError } from '@/lib/errors'
import { clearSession } from '@/lib/auth'

// ============================================
// POST /api/auth/logout
// ============================================

export async function POST() {
  try {
    await clearSession()
    return apiSuccess({ message: 'Signed out successfully.' })
  } catch (error) {
    return apiError(error)
  }
}
