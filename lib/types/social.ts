// ============================================
// GGLOG — Social Response Types
// ============================================

/**
 * The follow relationship from the current viewer's perspective.
 *
 *   following  = viewer follows the target user
 *   followedBy = target user follows the viewer
 *   mutual     = both follow each other
 */
export interface FollowRelationship {
  following: boolean
  followedBy: boolean
  mutual: boolean
}

/**
 * Generic cursor-paginated response envelope.
 */
export interface PaginatedResponse<T> {
  items: T[]
  nextCursor: string | null
  hasMore: boolean
}

/**
 * Notification actor as returned by the API.
 */
export interface NotificationActorResponse {
  id: string
  username: string
  displayName: string | null
  avatarUrl: string | null
}

/**
 * Notification as returned by the API.
 *
 * Type names are mapped from Prisma enums to frontend-friendly names:
 *   NEW_FOLLOWER     → FOLLOW
 *   REVIEW_LIKED     → REVIEW_LIKE
 *   REVIEW_COMMENTED → REVIEW_COMMENT
 */
export interface NotificationResponse {
  id: string
  type: 'FOLLOW' | 'REVIEW_LIKE' | 'REVIEW_COMMENT'
  actor: NotificationActorResponse
  review: {
    id: string
    game: {
      id: string
      name: string
      coverUrl: string | null
    } | null
  } | null
  comment: {
    id: string
    body: string
  } | null
  isRead: boolean
  createdAt: string
}
