// ============================================
// GGLOG — Comment Service
// ============================================
// Comments belong to reviews.
//
// Security:
//   - userId always derived from session, never from body
//   - Only the comment owner can update/delete
//   - Viewer must be able to see the review to comment
//
// Notifications:
//   - Review owner is notified on new comment
//   - Exception: no notification if commenter == review owner
// ============================================

import { prisma } from '@/lib/db'
import { Errors } from '@/lib/errors'
import { canViewReview } from '@/lib/permissions/visibility'
import { isFollowing } from '@/lib/services/followService'
import { createNotification } from '@/lib/services/notificationService'
import type { CommentResponse } from '@/lib/types/review'
import type { CreateCommentInput, UpdateCommentInput } from '@/lib/validations/comments'
import type { Visibility } from '@/src/generated/prisma'
import { buildPaginatedResult, type PaginatedResult } from '@/lib/pagination/cursor'

const commentSelect = {
  id: true,
  body: true,
  createdAt: true,
  updatedAt: true,
  userId: true,
  user: {
    select: {
      id: true,
      username: true,
      profile: { select: { displayName: true, avatarUrl: true } },
    },
  },
} as const

type CommentRow = {
  id: string
  body: string
  createdAt: Date
  updatedAt: Date
  userId: string
  user: {
    id: string
    username: string
    profile: { displayName: string | null; avatarUrl: string | null } | null
  }
}

function serializeComment(row: CommentRow): CommentResponse {
  return {
    id: row.id,
    body: row.body,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    user: {
      id: row.user.id,
      username: row.user.username,
      displayName: row.user.profile?.displayName ?? null,
      avatarUrl: row.user.profile?.avatarUrl ?? null,
    },
  }
}

/**
 * Assert that the viewer can see the given review.
 * Throws NOT_FOUND if not permitted.
 */
async function assertCanViewReview(
  review: { userId: string; visibility: Visibility },
  viewerId: string | null
): Promise<void> {
  let follower = false
  if (viewerId && viewerId !== review.userId) {
    follower = await isFollowing(viewerId, review.userId)
  }

  const allowed = canViewReview({
    viewerId,
    ownerId: review.userId,
    visibility: review.visibility,
    isFollower: follower,
  })

  if (!allowed) throw Errors.notFound('Review')
}

// ---- Read ----

/**
 * Get paginated comments for a review.
 * Respects review visibility.
 *
 * @param reviewId - the review whose comments to fetch
 * @param viewerId - the viewer (null = unauthenticated)
 * @param limit    - items per page
 * @param cursor   - pagination cursor
 */
export async function getComments(
  reviewId: string,
  viewerId: string | null,
  limit: number,
  cursor: { id: string; createdAt: string } | null
): Promise<PaginatedResult<CommentResponse>> {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { userId: true, visibility: true },
  })

  if (!review) throw Errors.notFound('Review')
  await assertCanViewReview(review, viewerId)

  const rows = await prisma.comment.findMany({
    where: {
      reviewId,
      ...(cursor
        ? {
            OR: [
              { createdAt: { gt: new Date(cursor.createdAt) } },
              { createdAt: new Date(cursor.createdAt), id: { gt: cursor.id } },
            ],
          }
        : {}),
    },
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    take: limit + 1,
    select: commentSelect,
  })

  const typedRows = rows as unknown as CommentRow[]
  const result = buildPaginatedResult(typedRows, limit)

  return {
    items: result.items.map(serializeComment),
    nextCursor: result.nextCursor,
    hasMore: result.hasMore,
  }
}

// ---- Write ----

/**
 * Create a comment on a review.
 *
 * - Viewer must be able to see the review
 * - userId is always from the session (passed in, never from body)
 * - Notifies review owner (unless commenting on own review)
 */
export async function createComment(
  userId: string,
  reviewId: string,
  input: CreateCommentInput
): Promise<CommentResponse> {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { userId: true, visibility: true },
  })

  if (!review) throw Errors.notFound('Review')
  await assertCanViewReview(review, userId)

  const comment = await prisma.comment.create({
    data: {
      userId,
      reviewId,
      body: input.body,
    },
    select: commentSelect,
  })

  // Fire-and-forget: notify review owner (skip if self-commenting)
  if (review.userId !== userId) {
    void createNotification({
      userId: review.userId,
      actorId: userId,
      type: 'REVIEW_COMMENTED',
      reviewId,
      commentId: comment.id,
    })
  }

  return serializeComment(comment as unknown as CommentRow)
}

/**
 * Update a comment.
 *
 * Only the comment's owner may update it.
 */
export async function updateComment(
  commentId: string,
  userId: string,
  input: UpdateCommentInput
): Promise<CommentResponse> {
  const existing = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { userId: true },
  })

  if (!existing) throw Errors.notFound('Comment')
  if (existing.userId !== userId) throw Errors.forbidden()

  const updated = await prisma.comment.update({
    where: { id: commentId },
    data: { body: input.body },
    select: commentSelect,
  })

  return serializeComment(updated as unknown as CommentRow)
}

/**
 * Delete a comment.
 *
 * Only the comment's owner may delete it.
 */
export async function deleteComment(commentId: string, userId: string): Promise<void> {
  const existing = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { userId: true },
  })

  if (!existing) throw Errors.notFound('Comment')
  if (existing.userId !== userId) throw Errors.forbidden()

  await prisma.comment.delete({ where: { id: commentId } })
}
