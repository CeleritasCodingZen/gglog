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
// ============================================

import { prisma } from '@/lib/db'
import type { NotificationType } from '@/src/generated/prisma'
import type { NotificationResponse } from '@/lib/types/social'
import { buildPaginatedResult, type PaginatedResult } from '@/lib/pagination/cursor'

interface CreateNotificationInput {
  userId: string   // recipient
  actorId: string  // who triggered
  type: NotificationType
  reviewId?: string | null
  commentId?: string | null
}

/**
 * Create a notification.
 *
 * Fire-and-forget: callers should not await or catch this in their
 * primary transaction. Call it after the transaction commits.
 *
 * Silently skips self-notifications (userId === actorId).
 */
export async function createNotification(input: CreateNotificationInput): Promise<void> {
  // Never notify someone about their own actions
  if (input.userId === input.actorId) return

  try {
    await prisma.notification.create({
      data: {
        userId: input.userId,
        actorId: input.actorId,
        type: input.type,
        reviewId: input.reviewId ?? null,
        commentId: input.commentId ?? null,
      },
    })
  } catch (err) {
    // Do not crash the caller — log and move on
    console.error('[notificationService] Failed to create notification:', err)
  }
}

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
 * Count unread notifications for a user.
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: { userId, read: false },
  })
}

const notificationSelect = {
  id: true,
  type: true,
  read: true,
  createdAt: true,
  reviewId: true,
  commentId: true,
  actor: {
    select: {
      id: true,
      username: true,
      profile: {
        select: { displayName: true, avatarUrl: true },
      },
    },
  },
} as const

function serializeNotification(
  row: Awaited<ReturnType<typeof prisma.notification.findFirst>> & {
    actor: {
      id: string
      username: string
      profile: { displayName: string | null; avatarUrl: string | null } | null
    }
  }
): NotificationResponse {
  return {
    id: row!.id,
    type: row!.type,
    read: row!.read,
    createdAt: row!.createdAt.toISOString(),
    reviewId: row!.reviewId,
    commentId: row!.commentId,
    actor: {
      id: row!.actor.id,
      username: row!.actor.username,
      displayName: row!.actor.profile?.displayName ?? null,
      avatarUrl: row!.actor.profile?.avatarUrl ?? null,
    },
  }
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

  const typedRows = rows as unknown as Array<Parameters<typeof serializeNotification>[0]>
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
