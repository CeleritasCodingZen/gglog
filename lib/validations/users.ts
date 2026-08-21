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
