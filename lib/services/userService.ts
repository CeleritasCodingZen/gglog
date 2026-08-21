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
import { getFollowRelationship, getFollowerCount, getFollowingCount } from '@/lib/services/followService'
import type { PublicUser, UserProfile, UserStats } from '@/lib/types/user'

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
