// ============================================
// GGLOG — Rate Limiting
// ============================================
// In-memory fixed-window rate limiter for API
// route protection. Provides per-IP throttling
// with independent buckets per endpoint.
//
// DEPLOYMENT NOTE:
// This is a process-local rate limiter. On Vercel,
// each serverless instance maintains its own state.
// An attacker distributing requests across instances
// may partially bypass limits. This is an accepted
// tradeoff at current scale. To upgrade to distributed
// rate limiting, swap the internal storage to
// @upstash/ratelimit — the public API stays the same.
//
// FAILURE POLICY:
// - Auth endpoints: fail-closed (block on error)
// - Game search: fail-open (allow on error)
// ============================================

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// ---- Types ----

export interface RateLimitConfig {
  /** Maximum number of requests allowed in the window. */
  limit: number
  /** Window duration in milliseconds. */
  windowMs: number
}

export interface RateLimitResult {
  /** Whether the request is allowed. */
  success: boolean
  /** The configured limit for this bucket. */
  limit: number
  /** Remaining requests in the current window. */
  remaining: number
  /** Milliseconds until the current window resets. */
  resetMs: number
}

// ---- Centralized Rate Limit Configuration ----

/**
 * Rate limit policies for each protected endpoint.
 *
 * These values balance security with usability:
 * - signin:     Strict — bcrypt is expensive, brute-force is the primary threat
 * - signup:     Very strict — legitimate users rarely create multiple accounts
 * - gameSearch: Moderate — allows rapid search sessions with 200ms debounce
 */
export const RATE_LIMITS = {
  signin: {
    limit: 10,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  signup: {
    limit: 5,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  gameSearch: {
    limit: 30,
    windowMs: 60 * 1000, // 1 minute
  },
} as const satisfies Record<string, RateLimitConfig>

// ---- Internal Storage ----

interface RateLimitEntry {
  count: number
  resetAt: number
}

/**
 * Process-local storage for rate limit counters.
 * Keys are formatted as `${endpoint}:${ip}`.
 */
const store = new Map<string, RateLimitEntry>()

/**
 * Periodic cleanup of expired entries to prevent unbounded memory growth.
 * Runs every 60 seconds. Uses unref() so it doesn't prevent process exit.
 */
const CLEANUP_INTERVAL_MS = 60 * 1000

const cleanupTimer = setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (now >= entry.resetAt) {
      store.delete(key)
    }
  }
}, CLEANUP_INTERVAL_MS)

// Allow Node.js to exit even if the timer is still running
if (typeof cleanupTimer === 'object' && 'unref' in cleanupTimer) {
  cleanupTimer.unref()
}

// ---- IP Extraction ----

/**
 * Extract the client's IP address from request headers.
 *
 * Priority:
 * 1. `x-forwarded-for` — set by Vercel's reverse proxy (trusted)
 * 2. `x-real-ip` — alternative proxy header
 * 3. `"unknown"` — deterministic fallback (shared bucket, not a crash)
 *
 * The function:
 * - Takes the first IP from x-forwarded-for (client IP in proxy chain)
 * - Trims whitespace
 * - Handles both IPv4 and IPv6
 * - Never returns empty string or undefined
 */
export function getClientIp(request: NextRequest): string {
  // x-forwarded-for may contain: "client, proxy1, proxy2"
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    const clientIp = forwarded.split(',')[0]?.trim()
    if (clientIp) return clientIp
  }

  const realIp = request.headers.get('x-real-ip')?.trim()
  if (realIp) return realIp

  return 'unknown'
}

// ---- Rate Limiter ----

/**
 * Check and update the rate limit for a given key.
 *
 * This function is synchronous — Node.js is single-threaded, so there
 * are no race conditions between reading and incrementing the counter.
 * This provides atomic check-and-increment semantics without locks.
 *
 * @param key   Unique identifier for the rate-limit bucket (e.g. "signin:1.2.3.4")
 * @param config  The rate limit policy to apply
 * @returns       Whether the request is allowed, plus metadata
 */
export function rateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now()
  const entry = store.get(key)

  // Window has expired or no entry exists — start fresh
  if (!entry || now >= entry.resetAt) {
    const resetAt = now + config.windowMs
    store.set(key, { count: 1, resetAt })
    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - 1,
      resetMs: config.windowMs,
    }
  }

  // Within current window — check the count
  const resetMs = Math.max(0, entry.resetAt - now)

  if (entry.count < config.limit) {
    entry.count++
    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - entry.count,
      resetMs,
    }
  }

  // Limit exceeded
  return {
    success: false,
    limit: config.limit,
    remaining: 0,
    resetMs,
  }
}

// ---- Response Helper ----

/**
 * Build a 429 Too Many Requests response matching GGLOG's
 * standard error envelope: `{ success: false, error: { code, message } }`.
 *
 * Includes a `Retry-After` header (in seconds) so clients know
 * when to retry.
 */
export function rateLimitResponse(result: RateLimitResult): NextResponse {
  const retryAfterSeconds = Math.ceil(result.resetMs / 1000)

  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many requests. Please try again later.',
      },
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfterSeconds),
      },
    }
  )
}

// ---- Test Helpers ----

/**
 * Reset all rate limit state. ONLY for use in tests.
 * @internal
 */
export function _resetStore(): void {
  store.clear()
}
