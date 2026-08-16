// ============================================
// GGLOG — Auth Constants
// ============================================
//
// Shared constants used by both the Edge middleware
// and the server-side auth helpers. This file must
// NOT import any Node.js-only modules (Prisma,
// crypto, etc.) since it's consumed by middleware
// running in the Edge Runtime.
// ============================================

export const SESSION_COOKIE_NAME = 'gglog_session'
export const SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000 // 30 days
