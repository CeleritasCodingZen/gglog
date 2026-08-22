// ============================================
// GGLOG — Activity Feed API
// ============================================
// GET /api/activity/feed?cursor=&limit=
//
// Authenticated endpoint.
// Returns activities from users the viewer follows.
// Delegates to feedService.getFeed().
//
// This is the activity-level feed (LOGGED_GAME,
// REVIEWED_GAME, FOLLOWED_USER, CREATED_LIST).
//
// For a reviews-only feed, use /api/reviews/discover.
// ============================================

import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/errors'
import { getFeed } from '@/lib/services/feedService'
import { parsePaginationParams } from '@/lib/pagination/cursor'

export async function GET(request: NextRequest) {
  try {
    const viewer = await requireAuth()
    const { cursor, limit } = parsePaginationParams(request.nextUrl.searchParams)

    const result = await getFeed(viewer.id, limit, cursor)

    return apiSuccess(result)
  } catch (error) {
    return apiError(error)
  }
}
