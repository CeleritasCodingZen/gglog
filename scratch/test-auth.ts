/**
 * GGlog Auth API — Test Script
 * 
 * Tests all auth endpoints: signup, signin, me, logout.
 * Run with: npx tsx scratch/test-auth.ts
 */

const BASE = 'http://localhost:3000/api/auth'

interface TestResult {
  name: string
  pass: boolean
  status: number
  body: Record<string, unknown>
  cookie?: string
}

const results: TestResult[] = []

async function test(
  name: string,
  url: string,
  opts: RequestInit,
  expect: { status: number; success: boolean; checkFn?: (body: Record<string, unknown>) => boolean }
) {
  const res = await fetch(url, opts)
  const body = await res.json()
  const cookie = res.headers.get('set-cookie') ?? undefined

  const statusOk = res.status === expect.status
  const successOk = body.success === expect.success
  const customOk = expect.checkFn ? expect.checkFn(body) : true
  const pass = statusOk && successOk && customOk

  results.push({ name, pass, status: res.status, body, cookie })

  const icon = pass ? '✅' : '❌'
  console.log(`${icon} ${name}`)
  console.log(`   Status: ${res.status} (expected ${expect.status})`)
  console.log(`   Success: ${body.success} (expected ${expect.success})`)
  if (!pass) {
    console.log(`   Body:`, JSON.stringify(body, null, 2))
  }
  if (cookie) {
    const httpOnly = cookie.toLowerCase().includes('httponly')
    const hasToken = JSON.stringify(body).includes('session')
    console.log(`   Cookie HttpOnly: ${httpOnly}`)
    if (hasToken && body.data?.sessionToken) {
      console.log(`   ⚠️ SESSION TOKEN LEAKED IN JSON BODY!`)
    }
  }
  console.log()
  return { body, cookie, status: res.status }
}

async function run() {
  console.log('='.repeat(60))
  console.log('GGLOG Auth API Test Suite')
  console.log('='.repeat(60))
  console.log()

  // Track session cookie across requests
  let sessionCookie = ''

  // ---- TEST 1: Valid signup ----
  const t1 = await test(
    '1. Signup — valid data',
    `${BASE}/signup`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'sounava',
        email: 'sounava@gglog.dev',
        password: 'password123',
      }),
    },
    {
      status: 201,
      success: true,
      checkFn: (b: any) => {
        const user = b.data?.user
        return (
          user?.username === 'sounava' &&
          user?.email === 'sounava@gglog.dev' &&
          user?.profile?.displayName === 'sounava' &&
          !user?.passwordHash &&
          !user?.sessionToken
        )
      },
    }
  )
  if (t1.cookie) sessionCookie = t1.cookie.split(';')[0]

  // ---- TEST 2: Duplicate username ----
  await test(
    '2. Signup — duplicate username',
    `${BASE}/signup`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'sounava',
        email: 'different@gglog.dev',
        password: 'password123',
      }),
    },
    { status: 409, success: false }
  )

  // ---- TEST 3: Duplicate email ----
  await test(
    '3. Signup — duplicate email',
    `${BASE}/signup`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'newuser',
        email: 'sounava@gglog.dev',
        password: 'password123',
      }),
    },
    { status: 409, success: false }
  )

  // ---- TEST 4: Invalid email ----
  await test(
    '4. Signup — invalid email',
    `${BASE}/signup`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'validuser',
        email: 'not-an-email',
        password: 'password123',
      }),
    },
    { status: 400, success: false }
  )

  // ---- TEST 5: Short password ----
  await test(
    '5. Signup — short password',
    `${BASE}/signup`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'validuser',
        email: 'valid@gglog.dev',
        password: 'short',
      }),
    },
    { status: 400, success: false }
  )

  // ---- TEST 6: Signin — correct credentials ----
  const t6 = await test(
    '6. Signin — correct credentials',
    `${BASE}/signin`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usernameOrEmail: 'sounava',
        password: 'password123',
      }),
    },
    {
      status: 200,
      success: true,
      checkFn: (b: any) => {
        const user = b.data?.user
        return user?.username === 'sounava' && !user?.passwordHash
      },
    }
  )
  if (t6.cookie) sessionCookie = t6.cookie.split(';')[0]

  // ---- TEST 7: Signin — wrong password ----
  await test(
    '7. Signin — wrong password (generic error)',
    `${BASE}/signin`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usernameOrEmail: 'sounava',
        password: 'wrongpassword',
      }),
    },
    {
      status: 401,
      success: false,
      checkFn: (b: any) => b.error?.code === 'INVALID_CREDENTIALS',
    }
  )

  // ---- TEST 8: Signin — nonexistent user (same generic error) ----
  await test(
    '8. Signin — nonexistent user (same generic error)',
    `${BASE}/signin`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usernameOrEmail: 'doesnotexist',
        password: 'password123',
      }),
    },
    {
      status: 401,
      success: false,
      checkFn: (b: any) => b.error?.code === 'INVALID_CREDENTIALS',
    }
  )

  // ---- TEST 9: GET /me — with session ----
  await test(
    '9. GET /me — authenticated',
    `${BASE}/me`,
    {
      method: 'GET',
      headers: { Cookie: sessionCookie },
    },
    {
      status: 200,
      success: true,
      checkFn: (b: any) => b.data?.user?.username === 'sounava',
    }
  )

  // ---- TEST 10: GET /me — without session ----
  await test(
    '10. GET /me — no session (401)',
    `${BASE}/me`,
    { method: 'GET' },
    { status: 401, success: false }
  )

  // ---- TEST 11: Logout ----
  const t11 = await test(
    '11. Logout — with session',
    `${BASE}/logout`,
    {
      method: 'POST',
      headers: { Cookie: sessionCookie },
    },
    { status: 200, success: true }
  )

  // ---- TEST 12: GET /me — after logout ----
  await test(
    '12. GET /me — after logout (401)',
    `${BASE}/me`,
    {
      method: 'GET',
      headers: { Cookie: sessionCookie },
    },
    { status: 401, success: false }
  )

  // ---- TEST 13: Signin by email ----
  await test(
    '13. Signin — by email (case-insensitive)',
    `${BASE}/signin`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usernameOrEmail: 'sounava@gglog.dev',
        password: 'password123',
      }),
    },
    { status: 200, success: true }
  )

  // ---- Summary ----
  console.log('='.repeat(60))
  const passed = results.filter((r) => r.pass).length
  const total = results.length
  console.log(`Results: ${passed}/${total} tests passed`)
  if (passed === total) {
    console.log('🎉 All tests passed!')
  } else {
    console.log('⚠️  Some tests failed:')
    results
      .filter((r) => !r.pass)
      .forEach((r) => console.log(`   ❌ ${r.name}`))
  }
  console.log('='.repeat(60))
}

run().catch(console.error)
