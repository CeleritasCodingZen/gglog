// ============================================
// GGLOG — Unread Notification Count API
// ============================================
// GET /api/notifications/unread-count
//   Lightweight endpoint returning unread count.
//
// Requires authentication.
// ============================================

import { requireAuth } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/errors'
import { getUnreadNotificationCount } from '@/lib/services/notificationService'

export async function GET() {
  try {
    const user = await requireAuth()
    const count = await getUnreadNotificationCount(user.id)

    return apiSuccess({ count })
  } catch (error) {
    return apiError(error)
  }
}
