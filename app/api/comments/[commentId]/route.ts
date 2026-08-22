// ============================================
// GGLOG — Delete Comment API
// ============================================
// DELETE /api/comments/:commentId
//
// Requires authentication.
// Only the comment owner can delete their comment.
// Returns 403 if another user attempts deletion.
// Returns 404 if comment doesn't exist.
// ============================================

import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/errors'
import { deleteComment } from '@/lib/services/commentService'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const { commentId } = await params
    const viewer = await requireAuth()

    await deleteComment(commentId, viewer.id)

    return apiSuccess({ deleted: true })
  } catch (error) {
    return apiError(error)
  }
}
