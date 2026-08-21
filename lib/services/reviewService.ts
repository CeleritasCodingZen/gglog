// ============================================
// GGLOG — Review Service
// ============================================
// Standalone review CRUD. A review must belong
// to a LogEntry owned by the same user.
//
// The /api/games/log route creates reviews inline
// during game logging — that flow is NOT replaced.
// This service handles:
//   - Standalone review updates/deletes
//   - Fetching reviews with visibility enforcement
//
// Ownership rule enforced at every write:
//   session user → find review → verify userId → proceed
//
// Visibility: canViewReview() from permissions layer
// ============================================

import { prisma } from '@/lib/db'
import { Errors } from '@/lib/errors'
import { canViewReview } from '@/lib/permissions/visibility'
import { isFollowing } from '@/lib/services/followService'
import { createActivity } from '@/lib/services/activityService'
import type { ReviewResponse } from '@/lib/types/review'
import type { UpdateReviewInput } from '@/lib/validations/reviews'
import type { Visibility } from '@/src/generated/prisma'
import { buildPaginatedResult, type PaginatedResult } from '@/lib/pagination/cursor'

// ---- Select shapes ----

const reviewSelect = {
  id: true,
  body: true,
  spoiler: true,
  visibility: true,
  createdAt: true,
  updatedAt: true,
  logEntryId: true,
  userId: true,
  gameId: true,
  user: {
    select: {
      id: true,
      username: true,
      profile: { select: { displayName: true, avatarUrl: true } },
    },
  },
  game: {
    select: { id: true, igdbId: true, name: true, coverUrl: true, slug: true },
  },
  _count: {
    select: { likes: true, comments: true },
  },
} as const

type ReviewRow = {
  id: string
  body: string
  spoiler: boolean
  visibility: Visibility
  createdAt: Date
  updatedAt: Date
  logEntryId: string
  userId: string
  gameId: string
  user: {
    id: string
    username: string
    profile: { displayName: string | null; avatarUrl: string | null } | null
  }
  game: { id: string; igdbId: number; name: string; coverUrl: string | null; slug: string | null }
  _count: { likes: number; comments: number }
}

function serializeReview(row: ReviewRow, hasLiked: boolean): ReviewResponse {
  return {
    id: row.id,
    body: row.body,
    spoiler: row.spoiler,
    visibility: row.visibility,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    logEntryId: row.logEntryId,
    likeCount: row._count.likes,
    commentCount: row._count.comments,
    hasLiked,
    user: {
      id: row.user.id,
      username: row.user.username,
      displayName: row.user.profile?.displayName ?? null,
      avatarUrl: row.user.profile?.avatarUrl ?? null,
    },
    game: {
      id: row.game.id,
      igdbId: row.game.igdbId,
      name: row.game.name,
      coverUrl: row.game.coverUrl,
      slug: row.game.slug,
    },
  }
}

// ---- Visibility helper ----

async function assertCanViewReview(
  review: { userId: string; visibility: Visibility },
  viewerId: string | null
): Promise<void> {
  let isFollower = false
  if (viewerId && viewerId !== review.userId) {
    isFollower = await isFollowing(viewerId, review.userId)
  }

  const allowed = canViewReview({
    viewerId,
    ownerId: review.userId,
    visibility: review.visibility,
    isFollower,
  })

  if (!allowed) {
    // Return 404 to avoid leaking existence of private content
    throw Errors.notFound('Review')
  }
}

// ---- Read ----

/**
 * Get a single review by ID.
 * Enforces visibility — throws NOT_FOUND if viewer cannot access.
 */
export async function getReview(
  reviewId: string,
  viewerId: string | null
): Promise<ReviewResponse> {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: reviewSelect,
  })

  if (!review) throw Errors.notFound('Review')
  await assertCanViewReview(review, viewerId)

  let hasLiked = false
  if (viewerId) {
    const like = await prisma.reviewLike.findUnique({
      where: { userId_reviewId: { userId: viewerId, reviewId } },
      select: { userId: true },
    })
    hasLiked = like !== null
  }

  return serializeReview(review as ReviewRow, hasLiked)
}

/**
 * Get paginated reviews for a specific game.
 * Filters to PUBLIC reviews only for non-owners.
 */
export async function getReviewsForGame(
  gameId: string,
  viewerId: string | null,
  limit: number,
  cursor: { id: string; createdAt: string } | null
): Promise<PaginatedResult<ReviewResponse>> {
  const rows = await prisma.review.findMany({
    where: {
      gameId,
      // For simplicity: show only PUBLIC reviews in game-level listings
      visibility: 'PUBLIC',
      ...(cursor
        ? {
            OR: [
              { createdAt: { lt: new Date(cursor.createdAt) } },
              { createdAt: new Date(cursor.createdAt), id: { lt: cursor.id } },
            ],
          }
        : {}),
    },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: limit + 1,
    select: reviewSelect,
  })

  const typedRows = rows as unknown as ReviewRow[]
  const result = buildPaginatedResult(typedRows, limit)

  // Batch fetch liked status for the viewer
  let likedSet = new Set<string>()
  if (viewerId && result.items.length > 0) {
    const ids = result.items.map((r) => r.id)
    const likes = await prisma.reviewLike.findMany({
      where: { userId: viewerId, reviewId: { in: ids } },
      select: { reviewId: true },
    })
    likedSet = new Set(likes.map((l) => l.reviewId))
  }

  return {
    items: result.items.map((r) => serializeReview(r, likedSet.has(r.id))),
    nextCursor: result.nextCursor,
    hasMore: result.hasMore,
  }
}

/**
 * Get paginated reviews for a specific user.
 * Respects visibility based on the viewer's relationship.
 */
export async function getReviewsForUser(
  userId: string,
  viewerId: string | null,
  limit: number,
  cursor: { id: string; createdAt: string } | null
): Promise<PaginatedResult<ReviewResponse>> {
  // Determine visibility filter
  let visibilityFilter: Visibility[] = ['PUBLIC']
  if (viewerId === userId) {
    // Owner sees all their own reviews
    visibilityFilter = ['PUBLIC', 'FOLLOWERS', 'PRIVATE']
  } else if (viewerId) {
    const follower = await isFollowing(viewerId, userId)
    if (follower) visibilityFilter = ['PUBLIC', 'FOLLOWERS']
  }

  const rows = await prisma.review.findMany({
    where: {
      userId,
      visibility: { in: visibilityFilter },
      ...(cursor
        ? {
            OR: [
              { createdAt: { lt: new Date(cursor.createdAt) } },
              { createdAt: new Date(cursor.createdAt), id: { lt: cursor.id } },
            ],
          }
        : {}),
    },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: limit + 1,
    select: reviewSelect,
  })

  const typedRows = rows as unknown as ReviewRow[]
  const result = buildPaginatedResult(typedRows, limit)

  let likedSet = new Set<string>()
  if (viewerId && result.items.length > 0) {
    const ids = result.items.map((r) => r.id)
    const likes = await prisma.reviewLike.findMany({
      where: { userId: viewerId, reviewId: { in: ids } },
      select: { reviewId: true },
    })
    likedSet = new Set(likes.map((l) => l.reviewId))
  }

  return {
    items: result.items.map((r) => serializeReview(r, likedSet.has(r.id))),
    nextCursor: result.nextCursor,
    hasMore: result.hasMore,
  }
}

// ---- Write ----

/**
 * Create a standalone review for an existing LogEntry.
 *
 * Requires the LogEntry to belong to the authenticated user and to
 * not already have a review attached.
 */
export async function createReview(
  userId: string,
  logEntryId: string,
  input: { body: string; visibility: Visibility; spoiler: boolean }
): Promise<ReviewResponse> {
  // Verify LogEntry ownership
  const logEntry = await prisma.logEntry.findUnique({
    where: { id: logEntryId },
    select: { userId: true, gameId: true, review: { select: { id: true } } },
  })

  if (!logEntry) throw Errors.notFound('Log entry')
  if (logEntry.userId !== userId) throw Errors.forbidden()
  if (logEntry.review) throw Errors.conflict('A review already exists for this log entry.')

  const review = await prisma.$transaction(async (tx) => {
    const created = await tx.review.create({
      data: {
        userId,
        gameId: logEntry.gameId,
        logEntryId,
        body: input.body,
        visibility: input.visibility,
        spoiler: input.spoiler,
      },
      select: reviewSelect,
    })

    await tx.activity.create({
      data: {
        actorId: userId,
        type: 'REVIEWED_GAME',
        gameId: logEntry.gameId,
        logEntryId,
        reviewId: created.id,
      },
    })

    return created
  })

  // Use createActivity from service for consistency on standalone creation
  // (transaction already handles it above — no double creation needed)

  return serializeReview(review as unknown as ReviewRow, false)
}

/**
 * Update an existing review.
 *
 * Ownership check: review.userId must match the authenticated user.
 */
export async function updateReview(
  reviewId: string,
  userId: string,
  input: UpdateReviewInput
): Promise<ReviewResponse> {
  const existing = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { userId: true },
  })

  if (!existing) throw Errors.notFound('Review')
  if (existing.userId !== userId) throw Errors.forbidden()

  const updated = await prisma.review.update({
    where: { id: reviewId },
    data: {
      ...(input.body !== undefined ? { body: input.body } : {}),
      ...(input.visibility !== undefined ? { visibility: input.visibility } : {}),
      ...(input.spoiler !== undefined ? { spoiler: input.spoiler } : {}),
    },
    select: reviewSelect,
  })

  return serializeReview(updated as unknown as ReviewRow, false)
}

/**
 * Delete a review.
 *
 * Ownership check: review.userId must match the authenticated user.
 */
export async function deleteReview(reviewId: string, userId: string): Promise<void> {
  const existing = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { userId: true },
  })

  if (!existing) throw Errors.notFound('Review')
  if (existing.userId !== userId) throw Errors.forbidden()

  await prisma.review.delete({ where: { id: reviewId } })
}
