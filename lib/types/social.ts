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
 * Notification as returned by the API.
 */
export interface NotificationResponse {
  id: string
  type: 'NEW_FOLLOWER' | 'REVIEW_LIKED' | 'REVIEW_COMMENTED'
  read: boolean
  createdAt: string
  actor: {
    id: string
    username: string
    displayName: string | null
    avatarUrl: string | null
  }
  reviewId: string | null
  commentId: string | null
}
