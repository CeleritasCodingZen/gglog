// ============================================
// GGLOG — Rate Limit Tests
// ============================================
// Standalone test script for the rate-limit module.
// Run with: npx tsx lib/__tests__/rate-limit.test.ts
//
// Uses no test framework — tsx is already a project
// dependency. Tests use simple assert-style checks.
// ============================================

import { rateLimit, getClientIp, rateLimitResponse, _resetStore } from '../rate-limit'
import type { RateLimitConfig, RateLimitResult } from '../rate-limit'
import { NextRequest } from 'next/server'

let passed = 0
let failed = 0

function assert(condition: boolean, message: string): void {
  if (condition) {
    passed++
    console.log(`  ✓ ${message}`)
  } else {
    failed++
    console.error(`  ✗ ${message}`)
  }
}

function describe(name: string, fn: () => void): void {
  console.log(`\n${name}`)
  fn()
}

// Helper to create a mock NextRequest with custom headers
function mockRequest(headers: Record<string, string> = {}): NextRequest {
  const req = new NextRequest('http://localhost:3000/api/test', {
    headers: new Headers(headers),
  })
  return req
}

// ---- Tests ----

describe('getClientIp', () => {
  assert(
    getClientIp(mockRequest({ 'x-forwarded-for': '1.2.3.4' })) === '1.2.3.4',
    'extracts IP from x-forwarded-for'
  )

  assert(
    getClientIp(mockRequest({ 'x-forwarded-for': '1.2.3.4, 10.0.0.1, 10.0.0.2' })) === '1.2.3.4',
    'takes first IP from x-forwarded-for chain'
  )

  assert(
    getClientIp(mockRequest({ 'x-forwarded-for': ' 1.2.3.4 ' })) === '1.2.3.4',
    'trims whitespace from x-forwarded-for'
  )

  assert(
    getClientIp(mockRequest({ 'x-real-ip': '5.6.7.8' })) === '5.6.7.8',
    'falls back to x-real-ip when x-forwarded-for is missing'
  )

  assert(
    getClientIp(mockRequest({ 'x-forwarded-for': '1.2.3.4', 'x-real-ip': '5.6.7.8' })) === '1.2.3.4',
    'prefers x-forwarded-for over x-real-ip'
  )

  assert(
    getClientIp(mockRequest({})) === 'unknown',
    'returns "unknown" when no IP headers present'
  )

  assert(
    getClientIp(mockRequest({ 'x-forwarded-for': '::1' })) === '::1',
    'handles IPv6 addresses'
  )

  assert(
    getClientIp(mockRequest({ 'x-forwarded-for': '2001:db8::1, 10.0.0.1' })) === '2001:db8::1',
    'handles IPv6 in forwarded chain'
  )

  assert(
    getClientIp(mockRequest({ 'x-forwarded-for': '' })) === 'unknown',
    'returns "unknown" for empty x-forwarded-for'
  )
})

describe('rateLimit — below limit', () => {
  _resetStore()
  const config: RateLimitConfig = { limit: 5, windowMs: 60000 }

  const result = rateLimit('test:below', config)
  assert(result.success === true, 'first request is allowed')
  assert(result.remaining === 4, 'remaining is limit - 1')
  assert(result.limit === 5, 'limit matches config')
})

describe('rateLimit — at limit', () => {
  _resetStore()
  const config: RateLimitConfig = { limit: 3, windowMs: 60000 }

  rateLimit('test:at', config) // 1
  rateLimit('test:at', config) // 2
  const result = rateLimit('test:at', config) // 3 — last allowed
  assert(result.success === true, 'request at limit is allowed')
  assert(result.remaining === 0, 'remaining is 0 at limit')
})

describe('rateLimit — above limit', () => {
  _resetStore()
  const config: RateLimitConfig = { limit: 3, windowMs: 60000 }

  rateLimit('test:above', config) // 1
  rateLimit('test:above', config) // 2
  rateLimit('test:above', config) // 3

  const result = rateLimit('test:above', config) // 4 — blocked
  assert(result.success === false, 'request above limit is blocked')
  assert(result.remaining === 0, 'remaining is 0 when blocked')
  assert(result.resetMs > 0, 'resetMs is positive when blocked')
})

describe('rateLimit — window reset', () => {
  _resetStore()
  // Use a tiny window that we can wait out
  const config: RateLimitConfig = { limit: 1, windowMs: 50 }

  const first = rateLimit('test:reset', config)
  assert(first.success === true, 'first request allowed')

  const blocked = rateLimit('test:reset', config)
  assert(blocked.success === false, 'second request blocked')

  // Wait for the window to expire
  const startWait = Date.now()
  while (Date.now() - startWait < 60) {
    // busy-wait
  }

  const afterReset = rateLimit('test:reset', config)
  assert(afterReset.success === true, 'request allowed after window expires')
})

describe('rateLimit — different IPs have independent buckets', () => {
  _resetStore()
  const config: RateLimitConfig = { limit: 2, windowMs: 60000 }

  rateLimit('signin:1.1.1.1', config) // IP A: 1
  rateLimit('signin:1.1.1.1', config) // IP A: 2
  const blockedA = rateLimit('signin:1.1.1.1', config) // IP A: blocked
  assert(blockedA.success === false, 'IP A is blocked after exceeding limit')

  const allowedB = rateLimit('signin:2.2.2.2', config) // IP B: 1
  assert(allowedB.success === true, 'IP B is still allowed (independent bucket)')
})

describe('rateLimit — different endpoints have independent limits', () => {
  _resetStore()
  const signinConfig: RateLimitConfig = { limit: 2, windowMs: 60000 }
  const searchConfig: RateLimitConfig = { limit: 5, windowMs: 60000 }

  // Exhaust signin limit
  rateLimit('signin:1.1.1.1', signinConfig)
  rateLimit('signin:1.1.1.1', signinConfig)
  const blockedSignin = rateLimit('signin:1.1.1.1', signinConfig)
  assert(blockedSignin.success === false, 'signin is blocked')

  // Search should still work for the same IP
  const allowedSearch = rateLimit('search:1.1.1.1', searchConfig)
  assert(allowedSearch.success === true, 'search is still allowed (independent endpoint bucket)')
})

describe('rateLimit — concurrent requests cannot bypass', () => {
  _resetStore()
  const config: RateLimitConfig = { limit: 5, windowMs: 60000 }

  // Simulate rapid sequential requests (synchronous, so this tests the
  // atomic nature of the counter in Node.js single-threaded execution)
  const results: RateLimitResult[] = []
  for (let i = 0; i < 10; i++) {
    results.push(rateLimit('test:concurrent', config))
  }

  const allowed = results.filter(r => r.success).length
  const blocked = results.filter(r => !r.success).length
  assert(allowed === 5, `exactly ${config.limit} requests allowed (got ${allowed})`)
  assert(blocked === 5, `remaining ${10 - config.limit} requests blocked (got ${blocked})`)
})

describe('rateLimitResponse', () => {
  const result: RateLimitResult = {
    success: false,
    limit: 10,
    remaining: 0,
    resetMs: 30000,
  }

  const response = rateLimitResponse(result)

  assert(response.status === 429, 'returns HTTP 429')
  assert(response.headers.get('Retry-After') === '30', 'includes Retry-After header in seconds')

  // Check response body matches GGLOG's error envelope
  // Note: We can't easily parse the body synchronously from NextResponse,
  // so we verify the structure via the response status and headers
})

describe('rateLimitResponse — body structure', async () => {
  const result: RateLimitResult = {
    success: false,
    limit: 10,
    remaining: 0,
    resetMs: 45000,
  }

  const response = rateLimitResponse(result)
  const body = await response.json()

  assert(body.success === false, 'body.success is false')
  assert(body.error.code === 'RATE_LIMITED', 'body.error.code is RATE_LIMITED')
  assert(
    body.error.message === 'Too many requests. Please try again later.',
    'body.error.message matches expected text'
  )
})

describe('rateLimit — resetMs is accurate', () => {
  _resetStore()
  const config: RateLimitConfig = { limit: 1, windowMs: 60000 }

  const first = rateLimit('test:timing', config)
  assert(first.resetMs > 0, 'resetMs is positive on first request')
  assert(first.resetMs <= 60000, 'resetMs does not exceed window')

  const blocked = rateLimit('test:timing', config)
  assert(blocked.resetMs > 0, 'blocked request has positive resetMs')
  assert(blocked.resetMs <= 60000, 'blocked resetMs does not exceed window')
})

// ---- Summary ----

console.log(`\n${'='.repeat(40)}`)
console.log(`Results: ${passed} passed, ${failed} failed`)
console.log('='.repeat(40))

if (failed > 0) {
  process.exit(1)
}
