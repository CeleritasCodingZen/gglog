// ============================================
// GGLOG — Mark Notification Read API
// ============================================
// PATCH /api/notifications/:id/read
//   Mark a single notification as read.
//
// Requires authentication.
// Only the notification's owner can mark it read.
// ============================================

import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/errors'
import { markNotificationRead } from '@/lib/services/notificationService'

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await requireAuth()

    // markNotificationRead uses updateMany with userId filter,
    // so it only affects notifications owned by the current user.
    await markNotificationRead(id, user.id)

    return apiSuccess({ success: true })
  } catch (error) {
    return apiError(error)
  }
}
