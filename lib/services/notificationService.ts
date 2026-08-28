// ============================================
// GGLOG — Notification Service
// ============================================
// Creates and manages in-app notifications.
//
// Notification creation is fire-and-forget:
// failures are logged but never abort the
// primary operation (follow, like, comment).
//
// Notifications are IMMUTABLE after creation
// except for the `read` flag.
//
// After persisting a notification, the service
// emits a realtime event via wsEmitter so the
// WebSocket server can deliver it to connected
// clients immediately.
// ============================================

import { prisma } from '@/lib/db'
import type { NotificationType as PrismaNotificationType } from '@/src/generated/prisma'
import type { NotificationResponse } from '@/lib/types/social'
import { buildPaginatedResult, type PaginatedResult } from '@/lib/pagination/cursor'
import { wsEmitter } from '@/lib/wsEmitter'

// ---- Type mapping ----

/**
 * Map Prisma NotificationType enum to frontend-friendly names.
 */
const NOTIFICATION_TYPE_MAP: Record<PrismaNotificationType, NotificationResponse['type']> = {
  NEW_FOLLOWER: 'FOLLOW',
  REVIEW_LIKED: 'REVIEW_LIKE',
  REVIEW_COMMENTED: 'REVIEW_COMMENT',
}

// ---- Input ----

interface CreateNotificationInput {
  userId: string   // recipient
  actorId: string  // who triggered
  type: PrismaNotificationType
  reviewId?: string | null
  commentId?: string | null
}

// ---- Enriched select ----

const notificationSelect = {
  id: true,
  type: true,
  read: true,
  createdAt: true,
  actor: {
    select: {
      id: true,
      username: true,
      profile: {
        select: { displayName: true, avatarUrl: true },
      },
    },
  },
  review: {
    select: {
      id: true,
      game: {
        select: { id: true, name: true, coverUrl: true },
      },
    },
  },
  comment: {
    select: {
      id: true,
      body: true,
    },
  },
} as const

// ---- Row type ----

type NotificationRow = {
  id: string
  type: PrismaNotificationType
  read: boolean
  createdAt: Date
  actor: {
    id: string
    username: string
    profile: { displayName: string | null; avatarUrl: string | null } | null
  }
  review: {
    id: string
    game: { id: string; name: string; coverUrl: string | null }
  } | null
  comment: {
    id: string
    body: string
  } | null
}

// ---- Serialization ----

function serializeNotification(row: NotificationRow): NotificationResponse {
  return {
    id: row.id,
    type: NOTIFICATION_TYPE_MAP[row.type],
    isRead: row.read,
    createdAt: row.createdAt.toISOString(),
    actor: {
      id: row.actor.id,
      username: row.actor.username,
      displayName: row.actor.profile?.displayName ?? null,
      avatarUrl: row.actor.profile?.avatarUrl ?? null,
    },
    review: row.review
      ? {
          id: row.review.id,
          game: row.review.game
            ? {
                id: row.review.game.id,
                name: row.review.game.name,
                coverUrl: row.review.game.coverUrl,
              }
            : null,
        }
      : null,
    comment: row.comment
      ? {
          id: row.comment.id,
          body: row.comment.body,
        }
      : null,
  }
}

// ---- Create ----

/**
 * Create a notification.
 *
 * Fire-and-forget: callers should not await or catch this in their
 * primary transaction. Call it after the transaction commits.
 *
 * Silently skips self-notifications (userId === actorId).
 *
 * After persisting, emits a realtime event via wsEmitter for
 * WebSocket delivery to connected clients.
 */
export async function createNotification(input: CreateNotificationInput): Promise<void> {
  // Never notify someone about their own actions
  if (input.userId === input.actorId) return

  try {
    const created = await prisma.notification.create({
      data: {
        userId: input.userId,
        actorId: input.actorId,
        type: input.type,
        reviewId: input.reviewId ?? null,
        commentId: input.commentId ?? null,
      },
      select: notificationSelect,
    })

    const serialized = serializeNotification(created as unknown as NotificationRow)

    // Emit for WebSocket delivery — fire-and-forget
    wsEmitter.emitNotification({
      recipientId: input.userId,
      notification: serialized,
    })
  } catch (err) {
    // Do not crash the caller — log and move on
    console.error('[notificationService] Failed to create notification:', err)
  }
}

// ---- Read operations ----

/**
 * Mark a single notification as read.
 * Only the notification's owner may mark it read.
 */
export async function markNotificationRead(
  notificationId: string,
  userId: string
): Promise<void> {
  await prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { read: true },
  })
}

/**
 * Mark all of a user's notifications as read.
 */
export async function markAllNotificationsRead(userId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  })
}

/**
 * Delete (dismiss) a single notification.
 * Only the notification's owner may delete it.
 *
 * Uses deleteMany with userId filter to enforce ownership
 * in a single query — no extra lookup needed.
 *
 * Deleting the Notification row does NOT affect the
 * underlying Follow, ReviewLike, Comment, or Activity.
 */
export async function deleteNotification(
  notificationId: string,
  userId: string
): Promise<void> {
  await prisma.notification.deleteMany({
    where: { id: notificationId, userId },
  })
}

/**
 * Count unread notifications for a user.
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: { userId, read: false },
  })
}

/**
 * Get paginated notifications for a user (newest first).
 */
export async function getNotifications(
  userId: string,
  limit: number,
  cursor: { id: string; createdAt: string } | null
): Promise<PaginatedResult<NotificationResponse>> {
  const rows = await prisma.notification.findMany({
    where: {
      userId,
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
    select: notificationSelect,
  })

  const typedRows = rows as unknown as (NotificationRow & { createdAt: Date })[]
  const result = buildPaginatedResult(
    typedRows.map((r) => ({ ...r, createdAt: r.createdAt })),
    limit
  )

  return {
    items: result.items.map(serializeNotification),
    nextCursor: result.nextCursor,
    hasMore: result.hasMore,
  }
}
