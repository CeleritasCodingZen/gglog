// ============================================
// GGLOG — User Search API
// ============================================
// GET /api/users/search?q=&cursor=&limit=
//
// Authenticated endpoint.
// Searches username and displayName (case-insensitive).
// Returns paginated SearchUserResult list.
// Excludes the viewer from results.
// ============================================

import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { apiSuccess, apiError, Errors } from '@/lib/errors'
import { searchUsers } from '@/lib/services/userService'
import { parsePaginationParams } from '@/lib/pagination/cursor'
import { userSearchSchema } from '@/lib/validations/users'

export async function GET(request: NextRequest) {
  try {
    const viewer = await requireAuth()
    const sp = request.nextUrl.searchParams

    const parsed = userSearchSchema.safeParse({ q: sp.get('q') ?? '' })
    if (!parsed.success) {
      throw Errors.badRequest(parsed.error.issues[0]?.message ?? 'Invalid search query.')
    }

    const { cursor, limit } = parsePaginationParams(sp)
    const result = await searchUsers(parsed.data.q, viewer.id, limit, cursor)

    return apiSuccess(result)
  } catch (error) {
    return apiError(error)
  }
}
