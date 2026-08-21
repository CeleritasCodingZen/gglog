// ============================================
// GGLOG — Review Validation Schemas
// ============================================
// Extends the base reviewSchema from schemas.ts
// with additional schemas for standalone review
// CRUD operations.
// ============================================

import { z } from 'zod'
// Re-export base schema for consumers
export { reviewSchema, type ReviewInput } from './schemas'

const VALID_VISIBILITIES = ['PUBLIC', 'FOLLOWERS', 'PRIVATE'] as const

/**
 * Schema for updating an existing review.
 * All fields are optional — partial updates allowed.
 */
export const updateReviewSchema = z.object({
  body: z
    .string()
    .min(1, 'Review body cannot be empty.')
    .max(2000, 'Review must be at most 2000 characters.')
    .optional(),
  visibility: z.enum(VALID_VISIBILITIES).optional(),
  spoiler: z.boolean().optional(),
})

export type UpdateReviewInput = z.infer<typeof updateReviewSchema>
