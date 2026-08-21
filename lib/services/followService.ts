// ============================================
// GGLOG — Follow Service
// ============================================
// All follow/unfollow logic lives here.
// Routes should call these functions rather
// than writing follow logic inline.
//
// Security:
//   - followerId is always derived from the session (requireAuth)
//   - never trust userId from request body
//
// Transactions:
//   Follow: Follow + Activity + Notification (atomic for Follow+Activity)
//   Unfollow: delete Follow row
// ============================================

import { prisma } from '@/lib/db'
import { Errors } from '@/lib/errors'
import { createNotification } from '@/lib/services/notificationService'
import type { FollowRelationship } from '@/lib/types/social'
import type { PublicUser } from '@/lib/types/user'
import { buildPaginatedResult, type PaginatedResult } from '@/lib/pagination/cursor'

// ---- Relationship ----

/**
 * Get the follow relationship between two users.
 *
 *   following  = viewerId follows targetId
 *   followedBy = targetId follows viewerId
 *   mutual     = both
 */
export async function getFollowRelationship(
  viewerId: string,
  targetId: string
): Promise<FollowRelationship> {
  const [following, followedBy] = await Promise.all([
    prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: viewerId, followingId: targetId } },
      select: { followerId: true },
    }),
    prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: targetId, followingId: viewerId } },
      select: { followerId: true },
    }),
  ])

  const isFollowing = following !== null
  const isFollowedBy = followedBy !== null

  return {
    following: isFollowing,
    followedBy: isFollowedBy,
    mutual: isFollowing && isFollowedBy,
  }
}

/**
 * Check if `followerId` follows `followingId`.
 */
export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  const row = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId, followingId } },
    select: { followerId: true },
  })
  return row !== null
}

// ---- Counts ----

export async function getFollowerCount(userId: string): Promise<number> {
  return prisma.follow.count({ where: { followingId: userId } })
}

export async function getFollowingCount(userId: string): Promise<number> {
  return prisma.follow.count({ where: { followerId: userId } })
}

// ---- Follow ----

/**
 * Follow a user.
 *
 * - Prevents self-follow (throws CONFLICT)
 * - Idempotent: if already following, returns current relationship without error
 * - Creates Follow + Activity in a transaction
 * - Fire-and-forget Notification after commit
 *
 * @param followerId - the authenticated user doing the following
 * @param targetId   - the user to follow
 */
export async function followUser(
  followerId: string,
  targetId: string
): Promise<FollowRelationship> {
  if (followerId === targetId) {
    throw Errors.conflict('You cannot follow yourself.')
  }

  // Verify target user exists
  const target = await prisma.user.findUnique({
    where: { id: targetId },
    select: { id: true },
  })
  if (!target) {
    throw Errors.notFound('User')
  }

  // Check if already following — idempotent
  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId, followingId: targetId } },
    select: { followerId: true },
  })

  if (!existing) {
    // Create Follow + Activity atomically
    await prisma.$transaction([
      prisma.follow.create({
        data: { followerId, followingId: targetId },
      }),
      prisma.activity.create({
        data: {
          actorId: followerId,
          type: 'FOLLOWED_USER',
        },
      }),
    ])

    // Fire-and-forget notification
    void createNotification({
      userId: targetId,
      actorId: followerId,
      type: 'NEW_FOLLOWER',
    })
  }

  return getFollowRelationship(followerId, targetId)
}

// ---- Unfollow ----

/**
 * Unfollow a user.
 *
 * Safe if the follow relationship doesn't exist (idempotent).
 *
 * @param followerId - the authenticated user doing the unfollowing
 * @param targetId   - the user to unfollow
 */
export async function unfollowUser(
  followerId: string,
  targetId: string
): Promise<FollowRelationship> {
  if (followerId === targetId) {
    throw Errors.conflict('You cannot unfollow yourself.')
  }

  // deleteMany is safe: no error if row doesn't exist
  await prisma.follow.deleteMany({
    where: { followerId, followingId: targetId },
  })

  return getFollowRelationship(followerId, targetId)
}

// ---- Lists ----

const userPreviewSelect = {
  id: true,
  username: true,
  profile: {
    select: { displayName: true, avatarUrl: true, bio: true },
  },
} as const

function serializePublicUser(
  row: Awaited<ReturnType<typeof prisma.user.findUnique>> & {
    profile: { displayName: string | null; avatarUrl: string | null; bio: string | null } | null
  }
): PublicUser {
  return {
    id: row!.id,
    username: row!.username,
    displayName: row!.profile?.displayName ?? null,
    avatarUrl: row!.profile?.avatarUrl ?? null,
    bio: row!.profile?.bio ?? null,
  }
}

/**
 * Get paginated list of a user's followers.
 */
export async function getFollowers(
  userId: string,
  limit: number,
  cursor: { id: string; createdAt: string } | null
): Promise<PaginatedResult<PublicUser>> {
  const rows = await prisma.follow.findMany({
    where: {
      followingId: userId,
      ...(cursor
        ? {
            OR: [
              { createdAt: { lt: new Date(cursor.createdAt) } },
              { createdAt: new Date(cursor.createdAt), followerId: { lt: cursor.id } },
            ],
          }
        : {}),
    },
    orderBy: [{ createdAt: 'desc' }],
    take: limit + 1,
    select: {
      followerId: true,
      createdAt: true,
      follower: { select: userPreviewSelect },
    },
  })

  const hasMore = rows.length > limit
  const items = hasMore ? rows.slice(0, limit) : rows
  const lastItem = items[items.length - 1]

  const nextCursor =
    hasMore && lastItem
      ? Buffer.from(
          JSON.stringify({ id: lastItem.followerId, createdAt: lastItem.createdAt.toISOString() })
        ).toString('base64url')
      : null

  return {
    items: items.map((r) =>
      serializePublicUser(r.follower as Parameters<typeof serializePublicUser>[0])
    ),
    nextCursor,
    hasMore,
  }
}

/**
 * Get paginated list of users that `userId` follows.
 */
export async function getFollowing(
  userId: string,
  limit: number,
  cursor: { id: string; createdAt: string } | null
): Promise<PaginatedResult<PublicUser>> {
  const rows = await prisma.follow.findMany({
    where: {
      followerId: userId,
      ...(cursor
        ? {
            OR: [
              { createdAt: { lt: new Date(cursor.createdAt) } },
              { createdAt: new Date(cursor.createdAt), followingId: { lt: cursor.id } },
            ],
          }
        : {}),
    },
    orderBy: [{ createdAt: 'desc' }],
    take: limit + 1,
    select: {
      followingId: true,
      createdAt: true,
      following: { select: userPreviewSelect },
    },
  })

  const hasMore = rows.length > limit
  const items = hasMore ? rows.slice(0, limit) : rows
  const lastItem = items[items.length - 1]

  const nextCursor =
    hasMore && lastItem
      ? Buffer.from(
          JSON.stringify({ id: lastItem.followingId, createdAt: lastItem.createdAt.toISOString() })
        ).toString('base64url')
      : null

  return {
    items: items.map((r) =>
      serializePublicUser(r.following as Parameters<typeof serializePublicUser>[0])
    ),
    nextCursor,
    hasMore,
  }
}
