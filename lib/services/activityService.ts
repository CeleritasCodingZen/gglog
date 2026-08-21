// ============================================
// GGLOG — Activity Service
// ============================================
// Central record of user actions. All activity
// creation flows through this service to keep
// routes clean and logic consistent.
//
// Activity records are IMMUTABLE after creation.
// Never update or delete activities.
// ============================================

import { prisma } from '@/lib/db'
import type { ActivityType } from '@/src/generated/prisma'
import type { ActivityResponse } from '@/lib/types/activity'
import { buildPaginatedResult, type PaginatedResult } from '@/lib/pagination/cursor'

interface CreateActivityInput {
  actorId: string
  type: ActivityType
  gameId?: string | null
  logEntryId?: string | null
  reviewId?: string | null
  listId?: string | null
}

/**
 * Create an activity record.
 *
 * Called internally by other services (followService, reviewService, etc.)
 * rather than directly from route handlers.
 *
 * Returns the created activity. Throws on DB error.
 */
export async function createActivity(input: CreateActivityInput) {
  return prisma.activity.create({
    data: {
      actorId: input.actorId,
      type: input.type,
      gameId: input.gameId ?? null,
      logEntryId: input.logEntryId ?? null,
      reviewId: input.reviewId ?? null,
      listId: input.listId ?? null,
    },
  })
}

// ---- Select shape for activity queries ----

const activitySelect = {
  id: true,
  type: true,
  createdAt: true,
  logEntryId: true,
  actor: {
    select: {
      id: true,
      username: true,
      profile: {
        select: { displayName: true, avatarUrl: true },
      },
    },
  },
  game: {
    select: { id: true, igdbId: true, name: true, coverUrl: true, slug: true },
  },
  review: {
    select: { id: true, body: true, spoiler: true },
  },
  list: {
    select: { id: true, title: true },
  },
} as const

function serializeActivity(
  row: Awaited<ReturnType<typeof prisma.activity.findFirst>> & {
    actor: { id: string; username: string; profile: { displayName: string | null; avatarUrl: string | null } | null }
    game: { id: string; igdbId: number; name: string; coverUrl: string | null; slug: string | null } | null
    review: { id: string; body: string; spoiler: boolean } | null
    list: { id: string; title: string } | null
  }
): ActivityResponse {
  return {
    id: row!.id,
    type: row!.type,
    createdAt: row!.createdAt.toISOString(),
    logEntryId: row!.logEntryId,
    actor: {
      id: row!.actor.id,
      username: row!.actor.username,
      displayName: row!.actor.profile?.displayName ?? null,
      avatarUrl: row!.actor.profile?.avatarUrl ?? null,
    },
    game: row!.game
      ? {
          id: row!.game.id,
          igdbId: row!.game.igdbId,
          name: row!.game.name,
          coverUrl: row!.game.coverUrl,
          slug: row!.game.slug,
        }
      : null,
    review: row!.review
      ? { id: row!.review.id, body: row!.review.body, spoiler: row!.review.spoiler }
      : null,
    list: row!.list ? { id: row!.list.id, title: row!.list.title } : null,
  }
}

/**
 * Get paginated activity for a specific user.
 *
 * @param userId - the actor whose activity to fetch
 * @param limit  - items per page
 * @param cursor - opaque cursor from previous page
 */
export async function getUserActivity(
  userId: string,
  limit: number,
  cursor: { id: string; createdAt: string } | null
): Promise<PaginatedResult<ActivityResponse>> {
  const rows = await prisma.activity.findMany({
    where: {
      actorId: userId,
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
    select: activitySelect,
  })

  // The select shape is compatible but Prisma types it differently
  // We cast through unknown after asserting the shape is correct
  const typedRows = rows as unknown as Array<Parameters<typeof serializeActivity>[0]>
  const result = buildPaginatedResult(
    typedRows.map((r) => ({ ...r, createdAt: r.createdAt })),
    limit
  )

  return {
    items: result.items.map(serializeActivity),
    nextCursor: result.nextCursor,
    hasMore: result.hasMore,
  }
}
