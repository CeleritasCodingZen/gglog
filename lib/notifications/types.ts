// ============================================
// GGLOG — Notification Types
// ============================================
// Frontend types for the notification system.
// Designed to map directly to the future backend
// response shape without modification.
// ============================================

/**
 * The user who triggered a notification.
 * Matches the existing PublicUser shape from
 * lib/types/user.ts (subset).
 */
export interface NotificationActor {
  id: string
  username: string
  displayName: string | null
  avatarUrl: string | null
}

/**
 * Notification type identifiers.
 *
 * These map to the Prisma NotificationType enum:
 *   NEW_FOLLOWER     → FOLLOW
 *   REVIEW_LIKED     → REVIEW_LIKE
 *   REVIEW_COMMENTED → REVIEW_COMMENT
 *
 * The frontend uses slightly shorter names for
 * readability; the future API adapter can map
 * between the two.
 */
export type NotificationType =
  | 'FOLLOW'
  | 'REVIEW_LIKE'
  | 'REVIEW_COMMENT'

/**
 * Partial game reference attached to review-related
 * notifications. Contains only what the UI needs.
 */
export interface NotificationGame {
  id: string
  name: string
  coverUrl: string | null
}

/**
 * Partial review reference for like/comment
 * notifications.
 */
export interface NotificationReview {
  id: string
  game: NotificationGame | null
}

/**
 * Partial comment reference for comment
 * notifications. Body is truncated for
 * display in the notification panel.
 */
export interface NotificationComment {
  id: string
  body: string
}

/**
 * A single notification as consumed by UI components.
 *
 * Future API responses should return this shape (or
 * be adapted to it in the API layer).
 */
export interface Notification {
  id: string
  type: NotificationType
  actor: NotificationActor
  review: NotificationReview | null
  comment: NotificationComment | null
  isRead: boolean
  createdAt: string // ISO 8601
}

/**
 * State shape exposed by the NotificationProvider.
 */
export interface NotificationState {
  /** All notifications, newest first. */
  notifications: Notification[]
  /** Count of notifications where isRead === false. */
  unreadCount: number
  /** Mark a single notification as read. */
  markAsRead: (id: string) => void
  /** Mark all notifications as read. */
  markAllAsRead: () => void
  /** Add a new notification (e.g. from WebSocket). */
  addNotification: (notification: Notification) => void
  /** Dismiss (delete) a single notification. */
  dismissNotification: (id: string) => void
}
