// ============================================
// GGLOG — Feed Response Types
// ============================================

import type { ActivityActor, ActivityGame, ActivityReview, ActivityList } from './activity'

/**
 * A single item in the social feed.
 *
 * The feed is the activity stream of users the viewer follows,
 * ordered by createdAt DESC with cursor pagination.
 *
 * Enough data is embedded to render feed cards without
 * additional API calls.
 */
export interface FeedItem {
  id: string
  type: 'LOGGED_GAME' | 'REVIEWED_GAME' | 'LIKED_REVIEW' | 'CREATED_LIST' | 'FOLLOWED_USER'
  createdAt: string
  actor: ActivityActor
  game: ActivityGame | null
  review: ActivityReview | null
  list: ActivityList | null
  logEntryId: string | null
}
