// ============================================
// GGLOG — Comment Validation Schemas
// ============================================

import { z } from 'zod'

/**
 * Create comment body.
 */
export const createCommentSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, 'Comment cannot be empty.')
    .max(1000, 'Comment must be at most 1000 characters.'),
})

/**
 * Update comment body (partial).
 */
export const updateCommentSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, 'Comment cannot be empty.')
    .max(1000, 'Comment must be at most 1000 characters.'),
})

export type CreateCommentInput = z.infer<typeof createCommentSchema>
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>
