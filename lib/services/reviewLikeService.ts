// ============================================
// GGLOG — Review Like Service
// ============================================
// Uses the existing ReviewLike model.
// Composite PK [userId, reviewId] prevents
// duplicate likes at the database level.
//
// Like: ReviewLike + Notification (atomic for the like)
// Unlike: delete ReviewLike row
// ============================================

import { prisma } from '@/lib/db'
import { Errors } from '@/lib/errors'
import { canViewReview } from '@/lib/permissions/visibility'
import { isFollowing } from '@/lib/services/followService'
import { createNotification } from '@/lib/services/notificationService'
import type { Visibility } from '@/src/generated/prisma'

/**
 * Like a review.
 *
 * - Idempotent: if already liked, returns without error
 * - Respects review visibility
 * - Creates Notification only on first like
 * - Does NOT create Activity (likes are not feed items in v1)
 *
 * @param userId   - the authenticated user doing the liking
 * @param reviewId - the review to like
 */
export async function likeReview(userId: string, reviewId: string): Promise<void> {
  // Verify review exists and viewer can see it
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { userId: true, visibility: true },
  })

  if (!review) throw Errors.notFound('Review')

  let follower = false
  if (userId !== review.userId) {
    follower = await isFollowing(userId, review.userId)
  }

  const allowed = canViewReview({
    viewerId: userId,
    ownerId: review.userId,
    visibility: review.visibility as Visibility,
    isFollower: follower,
  })
  if (!allowed) throw Errors.notFound('Review')

  // Attempt insert — composite PK prevents duplicates
  const existing = await prisma.reviewLike.findUnique({
    where: { userId_reviewId: { userId, reviewId } },
    select: { userId: true },
  })

  if (existing) {
    // Already liked — idempotent success
    return
  }

  await prisma.reviewLike.create({
    data: { userId, reviewId },
  })

  // Fire-and-forget notification to review owner
  void createNotification({
    userId: review.userId,
    actorId: userId,
    type: 'REVIEW_LIKED',
    reviewId,
  })
}

/**
 * Unlike a review.
 *
 * Safe if the like doesn't exist (idempotent).
 */
export async function unlikeReview(userId: string, reviewId: string): Promise<void> {
  await prisma.reviewLike.deleteMany({
    where: { userId, reviewId },
  })
}

/**
 * Check if a user has liked a review.
 */
export async function hasLikedReview(userId: string, reviewId: string): Promise<boolean> {
  const row = await prisma.reviewLike.findUnique({
    where: { userId_reviewId: { userId, reviewId } },
    select: { userId: true },
  })
  return row !== null
}

/**
 * Get the total like count for a review.
 * Uses count() — no full record retrieval.
 */
export async function getReviewLikeCount(reviewId: string): Promise<number> {
  return prisma.reviewLike.count({ where: { reviewId } })
}
