// ============================================
// GGLOG — Single Review API
// ============================================
// GET /api/reviews/:reviewId
//
// Optionally authenticated.
// Enforces visibility: PUBLIC / FOLLOWERS / PRIVATE.
// Returns 404 if the viewer cannot see the review
// (to avoid leaking existence of private content).
// ============================================

import { NextRequest } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/errors'
import { getReview } from '@/lib/services/reviewService'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const { reviewId } = await params
    const viewer = await getCurrentUser()

    const review = await getReview(reviewId, viewer?.id ?? null)

    return apiSuccess({ review })
  } catch (error) {
    return apiError(error)
  }
}
