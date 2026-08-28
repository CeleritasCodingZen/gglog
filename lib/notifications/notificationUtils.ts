// ============================================
// GGLOG — Notification Utilities
// ============================================
// Pure functions for formatting and computing
// notification display data. No side effects,
// no state, no API calls.
// ============================================

import type { Notification, NotificationType } from './types'

/**
 * Human-readable message for a notification.
 *
 * Returns a structured object so the UI can
 * bold/style the actor name independently.
 */
export function getNotificationMessage(notification: Notification): {
  actorName: string
  action: string
  target: string | null
} {
  const actorName = notification.actor.displayName ?? notification.actor.username

  switch (notification.type) {
    case 'FOLLOW':
      return { actorName, action: 'followed you', target: null }

    case 'REVIEW_LIKE':
      return {
        actorName,
        action: 'liked your review of',
        target: notification.review?.game?.name ?? 'a game',
      }

    case 'REVIEW_COMMENT':
      return {
        actorName,
        action: 'commented on your review of',
        target: notification.review?.game?.name ?? 'a game',
      }
  }
}

/**
 * Compute the destination path for a notification.
 *
 * Returns null if the destination cannot be determined
 * (missing data). The caller should handle null gracefully.
 */
export function getNotificationHref(notification: Notification): string | null {
  switch (notification.type) {
    case 'FOLLOW':
      return `/dashboard/profile/${encodeURIComponent(notification.actor.username)}`

    case 'REVIEW_LIKE':
    case 'REVIEW_COMMENT':
      // TODO: Link to /dashboard/review/:reviewId once the review detail page exists
      if (notification.review?.id) {
        return null // No review detail page exists yet
      }
      return null
  }
}

/**
 * Relative time string (e.g. "5m ago", "2h ago").
 *
 * Intentionally minimal — no external dependency.
 */
export function formatRelativeTime(isoDate: string): string {
  const now = Date.now()
  const then = new Date(isoDate).getTime()
  const diffMs = now - then

  if (diffMs < 0) return 'just now'

  const seconds = Math.floor(diffMs / 1000)
  if (seconds < 60) return 'just now'

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`

  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

/**
 * Sort notifications newest-first.
 */
export function sortNotifications(notifications: Notification[]): Notification[] {
  return [...notifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

/**
 * Icon label for a notification type (used in aria-labels).
 */
export function getNotificationTypeLabel(type: NotificationType): string {
  switch (type) {
    case 'FOLLOW':
      return 'New follower'
    case 'REVIEW_LIKE':
      return 'Review liked'
    case 'REVIEW_COMMENT':
      return 'New comment'
  }
}
