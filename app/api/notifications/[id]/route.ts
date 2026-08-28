// ============================================
// GGLOG — Delete (Dismiss) Notification API
// ============================================
// DELETE /api/notifications/:id
//   Dismiss a single notification.
//
// Requires authentication.
// Only the notification's owner can delete it.
// ============================================

import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/errors'
import { deleteNotification } from '@/lib/services/notificationService'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await requireAuth()

    await deleteNotification(id, user.id)

    return apiSuccess({ success: true })
  } catch (error) {
    return apiError(error)
  }
}
