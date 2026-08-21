// ============================================
// GGLOG — Followers List API
// ============================================
// GET /api/users/:username/followers
//
// Public endpoint. Returns paginated list of
// users who follow the given user.
//
// Query params:
//   cursor  - pagination cursor (opaque)
//   limit   - items per page (default 20, max 50)
// ============================================

import { NextRequest } from 'next/server'
import { apiSuccess, apiError, Errors } from '@/lib/errors'
import { getUserByUsername } from '@/lib/services/userService'
import { getFollowers } from '@/lib/services/followService'
import { parsePaginationParams } from '@/lib/pagination/cursor'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params
    const user = await getUserByUsername(username)
    if (!user) throw Errors.notFound('User')

    const { cursor, limit } = parsePaginationParams(request.nextUrl.searchParams)

    const result = await getFollowers(user.id, limit, cursor)

    return apiSuccess(result)
  } catch (error) {
    return apiError(error)
  }
}
