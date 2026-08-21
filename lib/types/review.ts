// ============================================
// GGLOG — Review & Comment Response Types
// ============================================

/**
 * Game info embedded in review responses.
 */
export interface ReviewGameInfo {
  id: string
  igdbId: number
  name: string
  coverUrl: string | null
  slug: string | null
}

/**
 * Author info embedded in review/comment responses.
 */
export interface ReviewAuthor {
  id: string
  username: string
  displayName: string | null
  avatarUrl: string | null
}

/**
 * Full review as returned by the API.
 */
export interface ReviewResponse {
  id: string
  body: string
  spoiler: boolean
  visibility: 'PUBLIC' | 'FOLLOWERS' | 'PRIVATE'
  createdAt: string
  updatedAt: string
  likeCount: number
  commentCount: number
  hasLiked: boolean // current viewer has liked
  user: ReviewAuthor
  game: ReviewGameInfo
  logEntryId: string
}

/**
 * Comment as returned by the API.
 */
export interface CommentResponse {
  id: string
  body: string
  createdAt: string
  updatedAt: string
  user: ReviewAuthor
}
