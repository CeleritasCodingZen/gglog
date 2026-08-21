// ============================================
// GGLOG — Visibility / Permission Layer
// ============================================
// Pure functions that determine whether a given
// viewer may access content based on its
// Visibility setting.
//
// Rules:
//   PUBLIC    → anyone can view
//   FOLLOWERS → owner + followers can view
//   PRIVATE   → owner only
//
// These functions are intentionally pure: they
// take data as arguments rather than hitting the
// DB themselves. The caller is responsible for
// loading the required data (e.g. isFollower flag).
// ============================================

export type VisibilityValue = 'PUBLIC' | 'FOLLOWERS' | 'PRIVATE'

interface CanViewOptions {
  /** ID of the person trying to view the content. Null = unauthenticated. */
  viewerId: string | null
  /** ID of the content's owner. */
  ownerId: string
  /** Visibility setting on the content. */
  visibility: VisibilityValue
  /**
   * Whether the viewer already follows the owner.
   * Required for FOLLOWERS checks; callers must pre-fetch this when relevant.
   * Defaults to false if omitted.
   */
  isFollower?: boolean
}

/**
 * Determine whether a viewer can access a piece of content.
 *
 * @example
 *   const allowed = canView({ viewerId: user.id, ownerId: review.userId, visibility: review.visibility, isFollower })
 *   if (!allowed) throw Errors.notFound('Review')
 */
export function canView({ viewerId, ownerId, visibility, isFollower = false }: CanViewOptions): boolean {
  // Owner always has access
  if (viewerId === ownerId) return true

  switch (visibility) {
    case 'PUBLIC':
      return true

    case 'FOLLOWERS':
      return isFollower

    case 'PRIVATE':
      return false
  }
}

/**
 * Check if a viewer can see content belonging to a user.
 * This is a convenience wrapper identical to `canView` but
 * named clearly for user-level content gates.
 */
export function canViewUserContent(options: CanViewOptions): boolean {
  return canView(options)
}

/**
 * Check if a viewer can see a specific review.
 */
export function canViewReview(options: CanViewOptions): boolean {
  return canView(options)
}

/**
 * Check if a viewer can see a list.
 */
export function canViewList(options: CanViewOptions): boolean {
  return canView(options)
}

/**
 * Check if a viewer can see an activity item.
 * Activity inherits the content's visibility setting.
 */
export function canViewActivity(options: CanViewOptions): boolean {
  return canView(options)
}
