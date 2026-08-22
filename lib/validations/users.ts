// ============================================
// GGLOG — User Validation Schemas
// ============================================

import { z } from 'zod'

/**
 * Validates a username path parameter.
 * Used by API routes that receive a username in the URL.
 */
export const usernameParamSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters.')
    .max(30, 'Username must be at most 30 characters.')
    .regex(
      /^[a-zA-Z0-9_]+$/,
      'Username may only contain letters, numbers, and underscores.'
    ),
})

export type UsernameParam = z.infer<typeof usernameParamSchema>

/**
 * Validates the `q` search query for user search.
 * Empty/whitespace query is allowed and returns default discoverable users.
 */
export const userSearchSchema = z.object({
  q: z
    .string()
    .trim()
    .max(50, 'Search query must be at most 50 characters.')
    .default(''),
})

export type UserSearchInput = z.infer<typeof userSearchSchema>
