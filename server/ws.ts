// ============================================
// GGLOG — WebSocket Notification Server
// ============================================
// Standalone WebSocket server for realtime
// notification delivery. Designed to run:
//
//   • Locally alongside Next.js (npm run dev:ws)
//   • Independently on Render  (npm run ws)
//
// Authentication:
//   Production (cross-domain):
//     Browser fetches a short-lived ticket from
//     POST /api/auth/ws-ticket, then connects
//     with ?ticket=<token>. Server validates the
//     ticket against the WsTicket table.
//
//   Local development:
//     Falls back to parsing the `gglog_session`
//     cookie from the WebSocket upgrade request
//     (same-origin, cookie is sent automatically).
//
// Notification delivery:
//   Production:
//     Polls the Notification table for new rows
//     targeting connected users (the in-memory
//     wsEmitter cannot bridge Vercel → Render).
//
//   Local development:
//     Also receives events via wsEmitter (shared
//     Node process with Next.js dev server).
//
// Connection management:
//   userId → Set<WebSocket> (multi-tab support)
//
// Start:
//   npm run dev:ws   (local, with file watching)
//   npm run ws       (production / Render)
// ============================================

import 'dotenv/config'
import { createServer, type IncomingMessage, type ServerResponse } from 'http'
import { WebSocketServer, WebSocket } from 'ws'
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

const WS_PORT = parseInt(
  process.env.PORT ?? process.env.WS_PORT ?? '3001',
  10
)

const WS_POLL_INTERVAL_MS = parseInt(
  process.env.WS_POLL_INTERVAL_MS ?? '2000',
  10
)

/**
 * Parse allowed origins from the WS_ALLOWED_ORIGINS env var.
 * Falls back to common local development origins.
 */
function getAllowedOrigins(): Set<string> {
  const envOrigins = process.env.WS_ALLOWED_ORIGINS
  if (envOrigins) {
    return new Set(
      envOrigins.split(',').map((o) => o.trim()).filter(Boolean)
    )
  }
  // Default: allow local development origins only
  return new Set([
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ])
}

const allowedOrigins = getAllowedOrigins()

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

  get connectedUserIds(): string[] {
    return Array.from(this.connections.keys())
  }

  get connectedUserCount(): number {
    return this.connections.size
  }

  closeAll(): void {
    for (const [, sockets] of this.connections) {
      for (const socket of sockets) {
        try {
          socket.close(1001, 'Server shutting down')
        } catch {
          // Ignore close errors during shutdown
        }
      }
    }
    this.connections.clear()
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

// ---- Authentication: ticket-based (production) ----

async function authenticateByTicket(ticketToken: string): Promise<string | null> {
  try {
    const ticket = await prisma.wsTicket.findUnique({
      where: { token: ticketToken },
      select: { id: true, userId: true, expiresAt: true, used: true },
    })

    if (!ticket) return null
    if (ticket.used) return null
    if (ticket.expiresAt < new Date()) return null

    // Mark as used (single-use)
    await prisma.wsTicket.update({
      where: { id: ticket.id },
      data: { used: true },
    })

    return ticket.userId
  } catch (err) {
    console.error('[WS] Ticket authentication failed:', err)
    return null
  }
}

// ---- Authentication: cookie-based (local dev fallback) ----

async function authenticateByCookie(req: IncomingMessage): Promise<string | null> {
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

// ---- Unified authentication ----

async function authenticateRequest(req: IncomingMessage): Promise<string | null> {
  // 1. Try ticket-based auth (production path)
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`)
  const ticket = url.searchParams.get('ticket')

  if (ticket) {
    return authenticateByTicket(ticket)
  }

  // 2. Fall back to cookie-based auth (local dev)
  return authenticateByCookie(req)
}

// ---- Origin validation ----

function isOriginAllowed(origin: string | undefined): boolean {
  // No origin header = non-browser client (e.g. curl, server-to-server)
  // Allow these for health checks, but WebSocket upgrade checks are separate
  if (!origin) return true

  return allowedOrigins.has(origin)
}

// ---- HTTP server (health endpoint + WebSocket upgrade) ----

const httpServer = createServer((req: IncomingMessage, res: ServerResponse) => {
  // Health check endpoint for Render
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({
      status: 'ok',
      connectedUsers: connectionManager.connectedUserCount,
    }))
    return
  }

  // All other HTTP requests get 404
  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ error: 'Not found' }))
})

// ---- WebSocket Server ----

const wss = new WebSocketServer({
  server: httpServer,
  verifyClient: ({ req }, callback) => {
    const origin = req.headers.origin
    if (!isOriginAllowed(origin)) {
      console.log(`[WS] Rejected connection from disallowed origin: ${origin}`)
      callback(false, 403, 'Forbidden')
      return
    }
    callback(true)
  },
})

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

// ---- Listen for notification events from the emitter (local dev) ----
// In local dev, both Next.js and this server share the same Node
// process globals, so wsEmitter events fire across both.

wsEmitter.onNotification((event) => {
  const { recipientId, notification } = event

  if (connectionManager.isUserConnected(recipientId)) {
    connectionManager.sendToUser(recipientId, {
      type: 'notification',
      payload: notification,
    })
    console.log(`[WS] Notification delivered to user ${recipientId} (emitter)`)
  }
})

// ---- Database polling for notifications (production) ----
// In production (Vercel + Render), the in-memory wsEmitter cannot
// bridge processes. The WS server polls the DB for new notifications
// targeting connected users.

let lastPollTime = new Date()

// Notification select shape matching notificationService serialization
const notificationPollSelect = {
  id: true,
  type: true,
  read: true,
  createdAt: true,
  actor: {
    select: {
      id: true,
      username: true,
      profile: {
        select: { displayName: true, avatarUrl: true },
      },
    },
  },
  review: {
    select: {
      id: true,
      game: {
        select: { id: true, name: true, coverUrl: true },
      },
    },
  },
  comment: {
    select: {
      id: true,
      body: true,
    },
  },
} as const

/**
 * Map Prisma NotificationType enum to frontend-friendly names.
 * Mirrors the mapping in notificationService.ts.
 */
const NOTIFICATION_TYPE_MAP: Record<string, string> = {
  NEW_FOLLOWER: 'FOLLOW',
  REVIEW_LIKED: 'REVIEW_LIKE',
  REVIEW_COMMENTED: 'REVIEW_COMMENT',
}

type PollNotificationRow = {
  id: string
  type: string
  read: boolean
  createdAt: Date
  actor: {
    id: string
    username: string
    profile: { displayName: string | null; avatarUrl: string | null } | null
  }
  review: {
    id: string
    game: { id: string; name: string; coverUrl: string | null }
  } | null
  comment: {
    id: string
    body: string
  } | null
}

function serializePollNotification(row: PollNotificationRow) {
  return {
    id: row.id,
    type: NOTIFICATION_TYPE_MAP[row.type] ?? row.type,
    isRead: row.read,
    createdAt: row.createdAt.toISOString(),
    actor: {
      id: row.actor.id,
      username: row.actor.username,
      displayName: row.actor.profile?.displayName ?? null,
      avatarUrl: row.actor.profile?.avatarUrl ?? null,
    },
    review: row.review
      ? {
          id: row.review.id,
          game: row.review.game
            ? {
                id: row.review.game.id,
                name: row.review.game.name,
                coverUrl: row.review.game.coverUrl,
              }
            : null,
        }
      : null,
    comment: row.comment
      ? {
          id: row.comment.id,
          body: row.comment.body,
        }
      : null,
  }
}

// Track which notification IDs we have already delivered via poll
// to avoid sending duplicates (the emitter may also deliver them locally).
const deliveredNotificationIds = new Set<string>()

// Cap the set size to prevent unbounded memory growth
const MAX_DELIVERED_IDS = 10_000

function trackDeliveredId(id: string): void {
  deliveredNotificationIds.add(id)
  if (deliveredNotificationIds.size > MAX_DELIVERED_IDS) {
    // Prune oldest entries (Set iteration is insertion-order)
    const iterator = deliveredNotificationIds.values()
    const toRemove = deliveredNotificationIds.size - MAX_DELIVERED_IDS
    for (let i = 0; i < toRemove; i++) {
      const oldest = iterator.next().value
      if (oldest) deliveredNotificationIds.delete(oldest)
    }
  }
}

async function pollNotifications(): Promise<void> {
  const connectedUserIds = connectionManager.connectedUserIds
  if (connectedUserIds.length === 0) {
    lastPollTime = new Date()
    return
  }

  try {
    const newNotifications = await prisma.notification.findMany({
      where: {
        userId: { in: connectedUserIds },
        createdAt: { gt: lastPollTime },
      },
      orderBy: { createdAt: 'asc' },
      select: {
        ...notificationPollSelect,
        userId: true,
      },
    })

    const now = new Date()

    for (const row of newNotifications) {
      // Skip if already delivered (by emitter or previous poll)
      if (deliveredNotificationIds.has(row.id)) continue

      const serialized = serializePollNotification(row as unknown as PollNotificationRow)

      if (connectionManager.isUserConnected(row.userId)) {
        connectionManager.sendToUser(row.userId, {
          type: 'notification',
          payload: serialized,
        })
        trackDeliveredId(row.id)
        console.log(`[WS] Notification delivered to user ${row.userId} (poll)`)
      }
    }

    lastPollTime = now
  } catch (err) {
    console.error('[WS] Notification poll failed:', err)
  }
}

const pollInterval = setInterval(pollNotifications, WS_POLL_INTERVAL_MS)

// ---- Ticket cleanup (every 5 minutes) ----

const TICKET_CLEANUP_INTERVAL_MS = 5 * 60 * 1000

const ticketCleanupInterval = setInterval(async () => {
  try {
    const result = await prisma.wsTicket.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { used: true },
        ],
      },
    })
    if (result.count > 0) {
      console.log(`[WS] Cleaned up ${result.count} expired/used ticket(s)`)
    }
  } catch (err) {
    console.error('[WS] Ticket cleanup failed:', err)
  }
}, TICKET_CLEANUP_INTERVAL_MS)

// ---- Graceful shutdown ----

let isShuttingDown = false

async function gracefulShutdown(signal: string): Promise<void> {
  if (isShuttingDown) return
  isShuttingDown = true

  console.log(`[WS] Received ${signal}, shutting down gracefully...`)

  // Stop accepting new connections
  httpServer.close()

  // Clear all intervals
  clearInterval(pingInterval)
  clearInterval(pollInterval)
  clearInterval(ticketCleanupInterval)

  // Close all WebSocket connections
  connectionManager.closeAll()

  // Close the WebSocket server
  wss.close()

  // Disconnect Prisma
  try {
    await prisma.$disconnect()
  } catch {
    // Ignore disconnect errors during shutdown
  }

  console.log('[WS] Shutdown complete')
  process.exit(0)
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

// ---- Start ----

httpServer.listen(WS_PORT, '0.0.0.0', () => {
  console.log(`[WS] GGLOG Notification Server running on 0.0.0.0:${WS_PORT}`)
  console.log(`[WS] Health check: http://0.0.0.0:${WS_PORT}/health`)
  console.log(`[WS] Allowed origins: ${[...allowedOrigins].join(', ')}`)
  console.log(`[WS] Notification poll interval: ${WS_POLL_INTERVAL_MS}ms`)
})
