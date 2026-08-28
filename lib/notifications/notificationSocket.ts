// ============================================
// GGLOG — Notification WebSocket Client
// ============================================
// Browser-side WebSocket client for realtime
// notification delivery.
//
// Features:
//   - Automatic reconnection with exponential backoff
//   - Subscribe/unsubscribe pattern
//   - Graceful degradation (dashboard still works without WS)
//   - Connection lifecycle management
//
// Usage:
//   const unsub = notificationSocket.subscribe((notification) => {
//     addNotification(notification)
//   })
//   notificationSocket.connect()
//   // later:
//   unsub()
//   notificationSocket.disconnect()
// ============================================

import type { Notification } from './types'

type NotificationHandler = (notification: Notification) => void

// ---- WebSocket event envelope ----

interface WsNotificationEvent {
  type: 'notification'
  payload: Notification
}

interface WsConnectedEvent {
  type: 'connected'
  payload: { userId: string }
}

type WsEvent = WsNotificationEvent | WsConnectedEvent

// ---- Constants ----

const DEFAULT_WS_URL = 'ws://localhost:3001'
const INITIAL_RETRY_MS = 1000
const MAX_RETRY_MS = 30_000
const BACKOFF_FACTOR = 2

// ---- Client ----

class NotificationSocketClient {
  private socket: WebSocket | null = null
  private handlers = new Set<NotificationHandler>()
  private retryMs = INITIAL_RETRY_MS
  private retryTimer: ReturnType<typeof setTimeout> | null = null
  private intentionalClose = false
  private _connected = false

  get connected(): boolean {
    return this._connected
  }

  /**
   * Open a WebSocket connection.
   * The browser will send cookies automatically (same-origin),
   * enabling session-based authentication.
   */
  connect(): void {
    // Don't connect on the server (SSR)
    if (typeof window === 'undefined') return

    // Already connected or connecting
    if (this.socket?.readyState === WebSocket.OPEN || this.socket?.readyState === WebSocket.CONNECTING) {
      return
    }

    this.intentionalClose = false
    this.clearRetryTimer()

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL ?? DEFAULT_WS_URL

    try {
      this.socket = new WebSocket(wsUrl)
    } catch {
      if (process.env.NODE_ENV === 'development') {
        console.log('[WS] Failed to create WebSocket connection')
      }
      this.scheduleReconnect()
      return
    }

    this.socket.onopen = () => {
      this._connected = true
      this.retryMs = INITIAL_RETRY_MS
      if (process.env.NODE_ENV === 'development') {
        console.log('[WS] Connected')
      }
    }

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data as string) as WsEvent

        if (data.type === 'notification') {
          const notification = (data as WsNotificationEvent).payload
          for (const handler of this.handlers) {
            handler(notification)
          }
        }

        if (data.type === 'connected' && process.env.NODE_ENV === 'development') {
          console.log('[WS] Authenticated')
        }
      } catch {
        // Ignore malformed messages
      }
    }

    this.socket.onclose = () => {
      this._connected = false

      if (!this.intentionalClose) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[WS] Disconnected — scheduling reconnect')
        }
        this.scheduleReconnect()
      }
    }

    this.socket.onerror = () => {
      // onclose will fire after onerror — reconnect handled there
      this._connected = false
    }
  }

  /**
   * Intentionally close the connection. No reconnect.
   */
  disconnect(): void {
    this.intentionalClose = true
    this._connected = false
    this.clearRetryTimer()

    if (this.socket) {
      this.socket.close()
      this.socket = null
    }
  }

  /**
   * Subscribe to notification events.
   * Returns an unsubscribe function.
   */
  subscribe(handler: NotificationHandler): () => void {
    this.handlers.add(handler)
    return () => {
      this.handlers.delete(handler)
    }
  }

  // ---- Reconnection ----

  private scheduleReconnect(): void {
    if (this.intentionalClose) return

    this.clearRetryTimer()

    this.retryTimer = setTimeout(() => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[WS] Reconnecting in ${this.retryMs}ms...`)
      }
      this.connect()
    }, this.retryMs)

    // Exponential backoff
    this.retryMs = Math.min(this.retryMs * BACKOFF_FACTOR, MAX_RETRY_MS)
  }

  private clearRetryTimer(): void {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer)
      this.retryTimer = null
    }
  }
}

/**
 * Singleton notification socket client.
 * Safe to import from any component — only connects
 * when explicitly called.
 */
export const notificationSocket = new NotificationSocketClient()
