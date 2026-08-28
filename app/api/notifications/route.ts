// ============================================
// GGLOG — Notifications API
// ============================================
// GET /api/notifications
//   Paginated notifications for the current user.
//   Newest first, cursor-based pagination.
//
// Requires authentication.
// ============================================

import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/errors'
import { getNotifications } from '@/lib/services/notificationService'
import { parsePaginationParams } from '@/lib/pagination/cursor'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { cursor, limit } = parsePaginationParams(request.nextUrl.searchParams)

    const result = await getNotifications(user.id, limit, cursor)

    return apiSuccess(result)
  } catch (error) {
    return apiError(error)
  }
}
