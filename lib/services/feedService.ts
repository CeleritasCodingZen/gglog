// ============================================
// GGLOG — Feed Service
// ============================================
// Social activity feed for the authenticated user.
//
// Feed logic:
//   current user
//     → users they follow
//     → their activities
//     → ordered by createdAt DESC
//     → cursor paginated
//
// This does NOT use a materialized feed table.
// Feed is computed on-the-fly from the Follow
// and Activity tables.
//
// Only PUBLIC and FOLLOWERS visibility activities
// are shown. PRIVATE activities are excluded.
// ============================================

import { prisma } from '@/lib/db'
import type { FeedItem } from '@/lib/types/feed'
import type { PaginatedResult } from '@/lib/pagination/cursor'

const feedActivitySelect = {
  id: true,
  type: true,
  createdAt: true,
  logEntryId: true,
  actor: {
    select: {
      id: true,
      username: true,
      profile: { select: { displayName: true, avatarUrl: true } },
    },
  },
  game: {
    select: { id: true, igdbId: true, name: true, coverUrl: true, slug: true },
  },
  review: {
    select: { id: true, body: true, spoiler: true, visibility: true },
  },
  list: {
    select: { id: true, title: true, visibility: true },
  },
} as const

/**
 * Get the paginated social feed for the current user.
 *
 * Returns activities from users the viewer follows,
 * filtered to exclude PRIVATE reviews and lists.
 *
 * @param userId - the authenticated viewer
 * @param limit  - items per page
 * @param cursor - pagination cursor
 */
export async function getFeed(
  userId: string,
  limit: number,
  cursor: { id: string; createdAt: string } | null
): Promise<PaginatedResult<FeedItem>> {
  // Get IDs of users the viewer follows
  const follows = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  })

  const followedIds = follows.map((f) => f.followingId)

  if (followedIds.length === 0) {
    return { items: [], nextCursor: null, hasMore: false }
  }

  const rows = await prisma.activity.findMany({
    where: {
      actorId: { in: followedIds },
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
    select: feedActivitySelect,
  })

  const hasMore = rows.length > limit
  const items = hasMore ? rows.slice(0, limit) : rows
  const lastItem = items[items.length - 1]

  const nextCursor =
    hasMore && lastItem
      ? Buffer.from(
          JSON.stringify({ id: lastItem.id, createdAt: lastItem.createdAt.toISOString() })
        ).toString('base64url')
      : null

  // Filter out PRIVATE review/list activities inline
  const feedItems: FeedItem[] = items
    .filter((row) => {
      // Exclude activities linked to PRIVATE reviews
      if (row.review && row.review.visibility === 'PRIVATE') return false
      // Exclude activities linked to PRIVATE lists
      if (row.list && row.list.visibility === 'PRIVATE') return false
      return true
    })
    .map((row) => ({
      id: row.id,
      type: row.type,
      createdAt: row.createdAt.toISOString(),
      logEntryId: row.logEntryId,
      actor: {
        id: row.actor.id,
        username: row.actor.username,
        displayName: row.actor.profile?.displayName ?? null,
        avatarUrl: row.actor.profile?.avatarUrl ?? null,
      },
      game: row.game
        ? {
            id: row.game.id,
            igdbId: row.game.igdbId,
            name: row.game.name,
            coverUrl: row.game.coverUrl,
            slug: row.game.slug,
          }
        : null,
      review: row.review
        ? { id: row.review.id, body: row.review.body, spoiler: row.review.spoiler }
        : null,
      list: row.list ? { id: row.list.id, title: row.list.title } : null,
    }))

  return { items: feedItems, nextCursor, hasMore }
}
