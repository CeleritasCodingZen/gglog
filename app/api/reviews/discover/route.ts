// ============================================
// GGLOG — Review Discovery API
// ============================================
// GET /api/reviews/discover?cursor=&limit=&gameId=
//
// Authenticated endpoint.
// Returns latest PUBLIC reviews from any user.
// Used on the Discover page community review feed.
// ============================================

import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/errors'
import { getDiscoverReviews } from '@/lib/services/reviewService'
import { parsePaginationParams } from '@/lib/pagination/cursor'

export async function GET(request: NextRequest) {
  try {
    const viewer = await requireAuth()
    const sp = request.nextUrl.searchParams
    const { cursor, limit } = parsePaginationParams(sp)
    const gameId = sp.get('gameId') ?? undefined

    const result = await getDiscoverReviews(viewer.id, limit, cursor, gameId)

    return apiSuccess(result)
  } catch (error) {
    return apiError(error)
  }
}
