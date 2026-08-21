// ============================================
// GGLOG — Follow / Unfollow API
// ============================================
// POST   /api/users/:username/follow  — follow
// DELETE /api/users/:username/follow  — unfollow
//
// Both require authentication.
// Returns the current FollowRelationship.
// Self-follow returns 409 CONFLICT.
// Target not found returns 404.
// ============================================

import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { apiSuccess, apiError, Errors } from '@/lib/errors'
import { getUserByUsername } from '@/lib/services/userService'
import { followUser, unfollowUser } from '@/lib/services/followService'

async function resolveTarget(username: string) {
  const target = await getUserByUsername(username)
  if (!target) throw Errors.notFound('User')
  return target
}

/**
 * POST /api/users/:username/follow
 * Follow the target user.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params
    const viewer = await requireAuth()
    const target = await resolveTarget(username)

    const relationship = await followUser(viewer.id, target.id)

    return apiSuccess(relationship)
  } catch (error) {
    return apiError(error)
  }
}

/**
 * DELETE /api/users/:username/follow
 * Unfollow the target user.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params
    const viewer = await requireAuth()
    const target = await resolveTarget(username)

    const relationship = await unfollowUser(viewer.id, target.id)

    return apiSuccess(relationship)
  } catch (error) {
    return apiError(error)
  }
}
