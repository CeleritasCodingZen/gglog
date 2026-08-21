// ============================================
// GGLOG — Activity Response Types
// ============================================

/**
 * Actor embedded in activity and feed responses.
 */
export interface ActivityActor {
  id: string
  username: string
  displayName: string | null
  avatarUrl: string | null
}

/**
 * Minimal game info embedded in activity responses.
 */
export interface ActivityGame {
  id: string
  igdbId: number
  name: string
  coverUrl: string | null
  slug: string | null
}

/**
 * Minimal review info embedded in activity responses.
 */
export interface ActivityReview {
  id: string
  body: string
  spoiler: boolean
}

/**
 * Minimal list info embedded in activity responses.
 */
export interface ActivityList {
  id: string
  title: string
}

/**
 * Activity event as returned by the API.
 */
export interface ActivityResponse {
  id: string
  type: 'LOGGED_GAME' | 'REVIEWED_GAME' | 'LIKED_REVIEW' | 'CREATED_LIST' | 'FOLLOWED_USER'
  createdAt: string
  actor: ActivityActor
  game: ActivityGame | null
  review: ActivityReview | null
  list: ActivityList | null
  logEntryId: string | null
}
