// ============================================
// GGLOG — User Profile API
// ============================================
// GET /api/users/:username
//
// Public endpoint. Returns:
//   - Public user data (no sensitive fields)
//   - Aggregate stats
//   - Follow relationship (if viewer is authenticated)
//
// Returns 404 for unknown usernames.
// ============================================

import { NextRequest } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/errors'
import { getUserProfile } from '@/lib/services/userService'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params

    // Optionally authenticated — relationship only shown if authed
    const viewer = await getCurrentUser()

    const profile = await getUserProfile(username, viewer?.id ?? null)

    return apiSuccess(profile)
  } catch (error) {
    return apiError(error)
  }
}
