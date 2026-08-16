import { z } from 'zod'

// ============================================
// GGLOG — Zod Validation Schemas
// ============================================
// All request body validations in one place.
// Moved from lib/validations/auth.ts to support
// game logging schemas alongside auth schemas.
// ============================================

// ---- Auth Schemas ----

/**
 * Signup request body.
 */
export const signupSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters.')
    .max(30, 'Username must be at most 30 characters.')
    .regex(
      /^[a-zA-Z0-9_]+$/,
      'Username may only contain letters, numbers, and underscores.'
    ),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Invalid email address.'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .max(128, 'Password must be at most 128 characters.'),
})

/**
 * Signin request body.
 */
export const signinSchema = z.object({
  usernameOrEmail: z
    .string()
    .trim()
    .min(1, 'Username or email is required.'),
  password: z
    .string()
    .min(1, 'Password is required.'),
})

/**
 * Profile update request body.
 */
export const profileUpdateSchema = z.object({
  displayName: z
    .string()
    .trim()
    .max(50, 'Display name must be at most 50 characters.')
    .optional(),
  bio: z
    .string()
    .trim()
    .max(500, 'Bio must be at most 500 characters.')
    .optional(),
  avatarUrl: z
    .string()
    .url('Invalid avatar URL.')
    .optional()
    .nullable(),
})

// ---- Game Logging Schemas ----

const VALID_STATUSES = ['PLAYING', 'COMPLETED', 'DROPPED', 'REPLAYED'] as const
const VALID_VISIBILITIES = ['PUBLIC', 'FOLLOWERS', 'PRIVATE'] as const

/**
 * Log entry creation — core fields.
 */
export const logEntrySchema = z.object({
  igdbId: z.number().int().positive('IGDB ID must be a positive integer.'),
  playedAt: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true
        const d = new Date(val)
        if (isNaN(d.getTime())) return false
        // Cannot be in the future (allow same day)
        const today = new Date()
        today.setHours(23, 59, 59, 999)
        return d <= today
      },
      { message: 'Date cannot be in the future.' }
    ),
  rating: z
    .number()
    .min(0.5, 'Rating must be at least 0.5.')
    .max(5, 'Rating must be at most 5.')
    .multipleOf(0.5, 'Rating must be in 0.5 increments.')
    .optional()
    .nullable(),
  status: z.enum(VALID_STATUSES).default('COMPLETED'),
  replay: z.boolean().optional().default(false),
  liked: z.boolean().optional().default(false),
  tags: z
    .array(z.string().max(30))
    .max(10, 'Maximum 10 tags.')
    .optional()
    .default([]),
  // Review fields (optional — only create Review if body is present)
  review: z
    .string()
    .min(1, 'Review cannot be empty.')
    .max(2000, 'Review must be at most 2000 characters.')
    .optional(),
  visibility: z.enum(VALID_VISIBILITIES).optional().default('PUBLIC'),
  spoiler: z.boolean().optional().default(false),
})

/**
 * Review creation body validation.
 */
export const reviewSchema = z.object({
  body: z
    .string()
    .min(1, 'Review body cannot be empty.')
    .max(2000, 'Review must be at most 2000 characters.'),
  visibility: z.enum(VALID_VISIBILITIES).optional().default('PUBLIC'),
  spoiler: z.boolean().optional().default(false),
})

/**
 * Log entry with review body validation. Alias of logEntrySchema.
 */
export const logWithReviewSchema = logEntrySchema

// ---- Type Exports ----

export type SignupInput = z.infer<typeof signupSchema>
export type SigninInput = z.infer<typeof signinSchema>
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>
export type LogEntryInput = z.infer<typeof logEntrySchema>
export type ReviewInput = z.infer<typeof reviewSchema>
export type LogWithReviewInput = z.infer<typeof logWithReviewSchema>

