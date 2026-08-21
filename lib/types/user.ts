// ============================================
// GGLOG — User Response Types
// ============================================

/**
 * Public user data — safe to expose in API responses.
 * Never includes passwordHash or session info.
 */
export interface PublicUser {
  id: string
  username: string
  displayName: string | null
  avatarUrl: string | null
  bio: string | null
}

/**
 * Aggregate stats for a user's public profile.
 */
export interface UserStats {
  gamesLogged: number
  reviews: number
  lists: number
  followers: number
  following: number
}

/**
 * Full profile response returned by GET /api/users/:username.
 * The `relationship` field is null for unauthenticated requests
 * or when viewing your own profile.
 */
export interface UserProfile {
  user: PublicUser
  stats: UserStats
  relationship: import('./social').FollowRelationship | null
}
