// ============================================
// GGLOG — Social Feed API
// ============================================
// GET /api/feed
//
// Authenticated endpoint. Returns the activity
// feed for the current user — events from users
// they follow, ordered by createdAt DESC.
//
// PRIVATE review/list activities are excluded.
//
// Query params:
//   cursor  - pagination cursor (opaque)
//   limit   - items per page (default 20, max 50)
//
// Returns empty feed for users with no follows.
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
