// ============================================
// GGLOG — User Service
// ============================================
// Fetches public user profiles and stats.
// Never exposes: passwordHash, sessions, email
// (email is kept internal — not part of public profile).
//
// Stats are computed with count() queries —
// no full record retrieval for aggregates.
// ============================================

import { prisma } from '@/lib/db'
import { Errors } from '@/lib/errors'
import { getFollowRelationship, getFollowerCount, getFollowingCount, isFollowing } from '@/lib/services/followService'
import type { PublicUser, UserProfile, UserStats } from '@/lib/types/user'
import { buildPaginatedResult, type PaginatedResult } from '@/lib/pagination/cursor'

/**
 * Find a user by username.
 * Returns null if not found (use for existence checks).
 */
export async function getUserByUsername(username: string) {
  return prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      createdAt: true,
      profile: {
        select: { displayName: true, avatarUrl: true, bio: true },
      },
    },
  })
}

/**
 * Build a PublicUser from a raw DB row.
 */
export function serializePublicUser(user: {
  id: string
  username: string
  profile: { displayName: string | null; avatarUrl: string | null; bio: string | null } | null
}): PublicUser {
  return {
    id: user.id,
    username: user.username,
    displayName: user.profile?.displayName ?? null,
    avatarUrl: user.profile?.avatarUrl ?? null,
    bio: user.profile?.bio ?? null,
  }
}

/**
 * Get aggregate stats for a user.
 * Uses count() for all aggregates — no full list retrieval.
 */
export async function getUserStats(userId: string): Promise<UserStats> {
  const [gamesLogged, reviews, lists, followers, following] = await Promise.all([
    prisma.logEntry.count({ where: { userId } }),
    prisma.review.count({ where: { userId } }),
    prisma.list.count({ where: { userId } }),
    getFollowerCount(userId),
    getFollowingCount(userId),
  ])

  return { gamesLogged, reviews, lists, followers, following }
}

/**
 * Get a full public profile for a user by username.
 *
 * @param username  - the profile to look up
 * @param viewerId  - the authenticated viewer (null = unauthenticated)
 *
 * Throws NOT_FOUND if the user doesn't exist.
 */
export async function getUserProfile(
  username: string,
  viewerId: string | null
): Promise<UserProfile> {
  const user = await getUserByUsername(username)
  if (!user) throw Errors.notFound('User')

  const [stats, relationship] = await Promise.all([
    getUserStats(user.id),
    // Only compute relationship when there's a viewer who isn't the profile owner
    viewerId && viewerId !== user.id
      ? getFollowRelationship(viewerId, user.id)
      : Promise.resolve(null),
  ])

  return {
    user: serializePublicUser(user),
    stats,
    relationship,
  }
}

/**
 * Get the follow relationship from the viewer's perspective.
 * Convenience re-export for routes that need it separately.
 */
export { getFollowRelationship as getUserRelationship }

// ---- Search ----

export interface SearchUserResult extends PublicUser {
  followerCount: number
  followingCount: number
  gameCount: number
  reviewCount: number
  isFollowing: boolean
}

/**
 * Search users by username or display name (case-insensitive).
 *
 * @param query     - search string
 * @param viewerId  - the authenticated viewer (for isFollowing status)
 * @param limit     - page size
 * @param cursor    - opaque pagination cursor
 */
export async function searchUsers(
  query: string,
  viewerId: string,
  limit: number,
  cursor: { id: string; createdAt: string } | null
): Promise<PaginatedResult<SearchUserResult>> {
  const trimmed = query.trim()

  const rows = await prisma.user.findMany({
    where: {
      ...(trimmed
        ? {
            OR: [
              { username: { contains: trimmed, mode: 'insensitive' as const } },
              { profile: { displayName: { contains: trimmed, mode: 'insensitive' as const } } },
            ],
          }
        : {}),
      // Exclude the viewer from their own results
      NOT: { id: viewerId },
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
    select: {
      id: true,
      username: true,
      createdAt: true,
      profile: { select: { displayName: true, avatarUrl: true, bio: true } },
      _count: { select: { followers: true, following: true, logEntries: true, reviews: true } },
    },
  })

  const result = buildPaginatedResult(
    rows as Array<(typeof rows)[number] & { createdAt: Date }>,
    limit
  )

  // Batch check which users the viewer follows
  const ids = result.items.map((r) => r.id)
  const follows = ids.length > 0
    ? await prisma.follow.findMany({
        where: { followerId: viewerId, followingId: { in: ids } },
        select: { followingId: true },
      })
    : []
  const followingSet = new Set(follows.map((f) => f.followingId))

  return {
    items: result.items.map((r) => ({
      id: r.id,
      username: r.username,
      displayName: r.profile?.displayName ?? null,
      avatarUrl: r.profile?.avatarUrl ?? null,
      bio: r.profile?.bio ?? null,
      followerCount: r._count.followers,
      followingCount: r._count.following,
      gameCount: r._count.logEntries,
      reviewCount: r._count.reviews,
      isFollowing: followingSet.has(r.id),
    })),
    nextCursor: result.nextCursor,
    hasMore: result.hasMore,
  }
}
