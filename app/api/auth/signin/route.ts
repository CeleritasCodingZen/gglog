import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { signinSchema } from '@/lib/validations/auth'
import { apiSuccess, apiError, Errors } from '@/lib/errors'
import { createSession, sanitizeUser } from '@/lib/auth'


export async function POST(request: NextRequest) {
  try {
    
    const body = await request.json().catch(() => null)
    if (!body) {
      return apiError(Errors.badRequest('Request body is required.'))
    }

    const parsed = signinSchema.safeParse(body)
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]
      return apiError(
        Errors.badRequest(firstIssue?.message ?? 'Invalid request body.', 'VALIDATION_ERROR')
      )
    }

    const { usernameOrEmail, password } = parsed.data

    //Find user by username OR email 

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: usernameOrEmail },
          { email: usernameOrEmail.toLowerCase() },
        ],
      },
      include: {
        profile: true,
      },
    })

    if (!user || !user.passwordHash) {
      // User doesn't exist or is an OAuth-only account (no password)
      return apiError(Errors.invalidCredentials())
    }

    // ---- Verify password ----
    const passwordValid = await bcrypt.compare(password, user.passwordHash)
    if (!passwordValid) {
      return apiError(Errors.invalidCredentials())
    }

    // ---- Create session & set cookie ----
    await createSession(user.id)

    // ---- Return safe user ----
    return apiSuccess({ user: sanitizeUser(user) })
  } catch (error) {
    return apiError(error)
  }
}
