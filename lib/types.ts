// ============================================
// GGLOG — Shared Frontend Types
// ============================================

/**
 * User profile — matches the shape returned by
 * the backend's `sanitizeUser()` helper.
 */
export interface Profile {
  id: string
  displayName: string | null
  bio: string | null
  avatarUrl: string | null
}

/**
 * Authenticated user — the safe, client-visible
 * subset of the User model (no passwordHash, etc.).
 */
export interface User {
  id: string
  username: string
  email: string
  createdAt: string
  updatedAt: string
  profile: Profile | null
}

/**
 * Standard API success envelope.
 */
export interface ApiSuccessResponse<T = unknown> {
  success: true
  data: T
}

/**
 * Standard API error envelope.
 */
export interface ApiErrorResponse {
  success: false
  error: {
    code: string
    message: string
  }
}

/**
 * Union of all possible API response shapes.
 */
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse

/**
 * Auth endpoint data — the `data` field returned
 * by signup, signin, and me routes.
 */
export interface AuthData {
  user: User
}

/**
 * Structured API error thrown by the API client.
 * Contains HTTP status, machine-readable code, and
 * a human-readable message.
 */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// ============================================
// Game & Logging API Types
// ============================================

/**
 * A single game result from the IGDB search API.
 * Returned by GET /api/games/search.
 */
export interface GameSearchResult {
  igdbId: number
  name: string
  slug: string | null
  summary: string | null
  coverUrl: string | null
  releaseDate: Date | null
  rating: number | null
  ratingCount: number | null
  genres: { id: number; name: string }[]
  platforms: { id: number; name: string }[]
}

/**
 * A game as stored in our database.
 * Returned within diary entries and log responses.
 */
export interface GameResponse {
  id: string
  igdbId: number
  name: string
  slug: string | null
  summary: string | null
  coverUrl: string | null
  releaseDate: string | null
  igdbRating: number | null
  genres: { id: number; name: string }[]
  platforms: { id: number; name: string }[]
}

/**
 * A diary entry from GET /api/diary.
 */
export interface DiaryEntryResponse {
  id: string
  playedAt: string | null
  rating: number | null
  status: string
  liked: boolean
  replay: boolean
  tags: string[]
  createdAt: string
  game: GameResponse
  review: {
    id: string
    body: string
    spoiler: boolean
    visibility: string
  } | null
}

/**
 * Diary feed response shape.
 */
export interface DiaryFeedResponse {
  entries: DiaryEntryResponse[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

/**
 * Response from POST /api/games/log.
 */
export interface LogGameResponse extends DiaryEntryResponse {}

