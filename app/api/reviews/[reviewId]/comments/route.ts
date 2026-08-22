// ============================================
// GGLOG — Review Comments API
// ============================================
// GET  /api/reviews/:reviewId/comments — list comments
// POST /api/reviews/:reviewId/comments — create comment
//
// GET is optionally authenticated (visibility check).
// POST requires authentication.
//
// userId always comes from the session, never the body.
// Sorted chronologically (ASC) for conversation style.
// ============================================

import { NextRequest } from 'next/server'
import { requireAuth, getCurrentUser } from '@/lib/auth'
import { apiSuccess, apiError, Errors } from '@/lib/errors'
import { getComments, createComment } from '@/lib/services/commentService'
import { parsePaginationParams } from '@/lib/pagination/cursor'
import { createCommentSchema } from '@/lib/validations/comments'

/**
 * GET /api/reviews/:reviewId/comments
 * Paginated comments (ASC order, conversation style).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const { reviewId } = await params
    const viewer = await getCurrentUser()
    const { cursor, limit } = parsePaginationParams(request.nextUrl.searchParams)

    const result = await getComments(reviewId, viewer?.id ?? null, limit, cursor)

    return apiSuccess(result)
  } catch (error) {
    return apiError(error)
  }
}

/**
 * POST /api/reviews/:reviewId/comments
 * Create a comment on a review.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const { reviewId } = await params
    const viewer = await requireAuth()

    const body = await request.json().catch(() => null)
    if (!body) throw Errors.badRequest('Request body is required.')

    const parsed = createCommentSchema.safeParse(body)
    if (!parsed.success) {
      throw Errors.badRequest(parsed.error.issues[0]?.message ?? 'Invalid comment body.')
    }

    const comment = await createComment(viewer.id, reviewId, parsed.data)

    return apiSuccess({ comment }, 201)
  } catch (error) {
    return apiError(error)
  }
}
