// ============================================
// GGLOG — Review Like / Unlike API
// ============================================
// POST   /api/reviews/:reviewId/like  — like
// DELETE /api/reviews/:reviewId/like  — unlike
//
// Both require authentication.
// userId is always derived from the session — never from the body.
// Both operations are idempotent.
//
// Returns: { liked: boolean, likeCount: number }
// ============================================

import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/errors'
import { likeReview, unlikeReview, getReviewLikeCount, hasLikedReview } from '@/lib/services/reviewLikeService'

/**
 * POST /api/reviews/:reviewId/like
 * Like a review. Idempotent.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const { reviewId } = await params
    const viewer = await requireAuth()

    await likeReview(viewer.id, reviewId)

    const likeCount = await getReviewLikeCount(reviewId)

    return apiSuccess({ liked: true, likeCount })
  } catch (error) {
    return apiError(error)
  }
}

/**
 * DELETE /api/reviews/:reviewId/like
 * Unlike a review. Safe if not liked.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const { reviewId } = await params
    const viewer = await requireAuth()

    await unlikeReview(viewer.id, reviewId)

    const likeCount = await getReviewLikeCount(reviewId)

    return apiSuccess({ liked: false, likeCount })
  } catch (error) {
    return apiError(error)
  }
}
