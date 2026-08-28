// ============================================
// GGLOG — Mark All Notifications Read API
// ============================================
// PATCH /api/notifications/read-all
//   Mark all of the current user's unread
//   notifications as read.
//
// Requires authentication.
// ============================================

import { requireAuth } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/errors'
import { markAllNotificationsRead } from '@/lib/services/notificationService'

export async function PATCH() {
  try {
    const user = await requireAuth()

    await markAllNotificationsRead(user.id)

    return apiSuccess({ success: true })
  } catch (error) {
    return apiError(error)
  }
}
