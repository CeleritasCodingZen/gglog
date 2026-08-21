// ============================================
// GGLOG — List Validation Schemas
// ============================================

import { z } from 'zod'

const VALID_VISIBILITIES = ['PUBLIC', 'FOLLOWERS', 'PRIVATE'] as const

/**
 * Create a new list.
 */
export const createListSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'List title cannot be empty.')
    .max(100, 'List title must be at most 100 characters.'),
  description: z
    .string()
    .trim()
    .max(500, 'Description must be at most 500 characters.')
    .optional()
    .nullable(),
  visibility: z.enum(VALID_VISIBILITIES).optional().default('PUBLIC'),
})

/**
 * Update an existing list (partial).
 */
export const updateListSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'List title cannot be empty.')
    .max(100, 'List title must be at most 100 characters.')
    .optional(),
  description: z
    .string()
    .trim()
    .max(500, 'Description must be at most 500 characters.')
    .optional()
    .nullable(),
  visibility: z.enum(VALID_VISIBILITIES).optional(),
})

/**
 * Add a game to a list.
 */
export const addGameToListSchema = z.object({
  igdbId: z.number().int().positive('IGDB ID must be a positive integer.'),
})

/**
 * Reorder list items — provide the full ordered array of game IDs.
 */
export const reorderListSchema = z.object({
  gameIds: z.array(z.string()).min(1, 'At least one game ID is required.'),
})

export type CreateListInput = z.infer<typeof createListSchema>
export type UpdateListInput = z.infer<typeof updateListSchema>
export type AddGameToListInput = z.infer<typeof addGameToListSchema>
export type ReorderListInput = z.infer<typeof reorderListSchema>
