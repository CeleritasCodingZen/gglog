// ============================================
// GGLOG — WebSocket Ticket API
// ============================================
// POST /api/auth/ws-ticket
//
//   Issues a short-lived, single-use ticket that
//   the browser uses to authenticate the WebSocket
//   connection on the Render-hosted WS server.
//
//   Flow:
//     1. Browser calls this route (Vercel) with
//        the normal gglog_session cookie.
//     2. Route validates the session, generates a
//        cryptographically random ticket, stores it
//        in the WsTicket table with a 60 s expiry.
//     3. Browser connects to WSS with ?ticket=<token>
//     4. WS server validates the ticket against DB.
//
//   Requires authentication (gglog_session cookie).
// ============================================

import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { apiSuccess, apiError } from '@/lib/errors'
import crypto from 'crypto'

const TICKET_TTL_MS = 60_000 // 60 seconds

export async function POST() {
  try {
    const user = await requireAuth()

    const token = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + TICKET_TTL_MS)

    await prisma.wsTicket.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    })

    return apiSuccess({ ticket: token })
  } catch (error) {
    return apiError(error)
  }
}
