import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { signupSchema } from '@/lib/validations/auth'
import { apiSuccess, apiError, Errors } from '@/lib/errors'
import { createSession, sanitizeUser } from '@/lib/auth'

// ============================================
// POST /api/auth/signup
// ============================================

export async function POST(request: NextRequest) {
  try {
    // ---- Parse & validate body ----
    const body = await request.json().catch(() => null)
    if (!body) {
      return apiError(Errors.badRequest('Request body is required.'))
    }

    const parsed = signupSchema.safeParse(body)
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]
      return apiError(
        Errors.badRequest(firstIssue?.message ?? 'Invalid request body.', 'VALIDATION_ERROR')
      )
    }

    const { username, email, password } = parsed.data

    // ---- Check for existing username ----
    const existingUsername = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    })
    if (existingUsername) {
      return apiError(Errors.conflict('Username is already taken.'))
    }

    // ---- Check for existing email ----
    const existingEmail = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })
    if (existingEmail) {
      return apiError(Errors.conflict('Email is already registered.'))
    }

    // ---- Hash password ----
    const passwordHash = await bcrypt.hash(password, 12)

    // ---- Create User + Profile in a transaction ----
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          username,
          email,
          passwordHash,
          profile: {
            create: {
              displayName: username,
            },
          },
        },
        include: {
          profile: true,
        },
      })
      return newUser
    })

    // ---- Create session & set cookie ----
    await createSession(user.id)

    // ---- Return safe user (never expose passwordHash) ----
    return apiSuccess({ user: sanitizeUser(user) }, 201)
  } catch (error) {
    return apiError(error)
  }
}
