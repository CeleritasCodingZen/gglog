// ============================================
// GGLOG — WebSocket Notification Server
// ============================================
// Standalone WebSocket server for realtime
// notification delivery. Runs alongside the
// Next.js dev server on a separate port.
//
// Authentication:
//   Parses the `gglog_session` cookie from the
//   WebSocket upgrade request and validates it
//   against the Session table in PostgreSQL.
//
// Connection management:
//   userId → Set<WebSocket> (multi-tab support)
//
// Start:
//   npm run dev:ws
//   OR
//   npx tsx --watch server/ws.ts
// ============================================

import 'dotenv/config'
import { WebSocketServer, WebSocket } from 'ws'
import type { IncomingMessage } from 'http'
import { PrismaClient } from '../src/generated/prisma'
import { PrismaNeon } from '@prisma/adapter-neon'
import { SESSION_COOKIE_NAME } from '../lib/auth-constants'
import { wsEmitter } from '../lib/wsEmitter'

// ---- Prisma client (standalone — not sharing Next.js instance) ----

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
})
const prisma = new PrismaClient({ adapter })

// ---- Configuration ----

const WS_PORT = parseInt(process.env.WS_PORT ?? '3001', 10)

// ---- Connection Manager ----

class NotificationConnectionManager {
  private connections = new Map<string, Set<WebSocket>>()

  connect(userId: string, socket: WebSocket): void {
    let sockets = this.connections.get(userId)
    if (!sockets) {
      sockets = new Set()
      this.connections.set(userId, sockets)
    }
    sockets.add(socket)
    console.log(`[WS] Connected user ${userId} (${sockets.size} tab(s))`)
  }

  disconnect(userId: string, socket: WebSocket): void {
    const sockets = this.connections.get(userId)
    if (!sockets) return

    sockets.delete(socket)
    if (sockets.size === 0) {
      this.connections.delete(userId)
    }
    console.log(`[WS] Disconnected user ${userId} (${sockets?.size ?? 0} tab(s) remaining)`)
  }

  sendToUser(userId: string, data: unknown): void {
    const sockets = this.connections.get(userId)
    if (!sockets || sockets.size === 0) return

    const message = JSON.stringify(data)

    for (const socket of sockets) {
      if (socket.readyState === WebSocket.OPEN) {
        try {
          socket.send(message)
        } catch (err) {
          console.error(`[WS] Failed to send to user ${userId}:`, err)
          // Do NOT delete the notification — DB is source of truth
        }
      }
    }
  }

  isUserConnected(userId: string): boolean {
    const sockets = this.connections.get(userId)
    return !!sockets && sockets.size > 0
  }

  get connectedUserCount(): number {
    return this.connections.size
  }
}

const connectionManager = new NotificationConnectionManager()

// ---- Cookie parser ----

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  const cookies: Record<string, string> = {}
  if (!cookieHeader) return cookies

  for (const pair of cookieHeader.split(';')) {
    const [key, ...rest] = pair.trim().split('=')
    if (key) {
      cookies[key.trim()] = decodeURIComponent(rest.join('=').trim())
    }
  }
  return cookies
}

// ---- Session authentication ----

async function authenticateRequest(req: IncomingMessage): Promise<string | null> {
  const cookies = parseCookies(req.headers.cookie)
  const sessionToken = cookies[SESSION_COOKIE_NAME]

  if (!sessionToken) {
    return null
  }

  try {
    const session = await prisma.session.findUnique({
      where: { sessionToken },
      select: { userId: true, expiresAt: true },
    })

    if (!session) return null
    if (session.expiresAt < new Date()) return null

    return session.userId
  } catch (err) {
    console.error('[WS] Session authentication failed:', err)
    return null
  }
}

// ---- WebSocket Server ----

const wss = new WebSocketServer({ port: WS_PORT })

wss.on('connection', async (socket: WebSocket, req: IncomingMessage) => {
  const userId = await authenticateRequest(req)

  if (!userId) {
    console.log('[WS] Rejected unauthenticated connection')
    socket.close(4001, 'Unauthorized')
    return
  }

  connectionManager.connect(userId, socket)

  // Send a welcome message so the client knows auth succeeded
  socket.send(JSON.stringify({ type: 'connected', payload: { userId } }))

  // Handle ping/pong for keepalive
  socket.on('pong', () => {
    // Connection is alive
  })

  socket.on('close', () => {
    connectionManager.disconnect(userId, socket)
  })

  socket.on('error', (err) => {
    console.error(`[WS] Socket error for user ${userId}:`, err)
    connectionManager.disconnect(userId, socket)
  })
})

// ---- Keepalive ping ----

const PING_INTERVAL_MS = 30_000

const pingInterval = setInterval(() => {
  wss.clients.forEach((socket) => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.ping()
    }
  })
}, PING_INTERVAL_MS)

wss.on('close', () => {
  clearInterval(pingInterval)
})

// ---- Listen for notification events from the emitter ----

wsEmitter.onNotification((event) => {
  const { recipientId, notification } = event

  if (connectionManager.isUserConnected(recipientId)) {
    connectionManager.sendToUser(recipientId, {
      type: 'notification',
      payload: notification,
    })
    console.log(`[WS] Notification delivered to user ${recipientId}`)
  }
})

// ---- Startup ----

console.log(`[WS] GGLOG Notification Server running on port ${WS_PORT}`)
console.log(`[WS] Authenticating via "${SESSION_COOKIE_NAME}" cookie`)
