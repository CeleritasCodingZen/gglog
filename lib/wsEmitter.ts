// ============================================
// GGLOG — WebSocket Event Emitter
// ============================================
// In-memory bridge between the notification
// service and the WebSocket server.
//
// Flow:
//   notificationService.createNotification()
//     → wsEmitter.emit('notification', { recipientId, notification })
//     → WebSocket server delivers to connected clients
//
// Both the Next.js backend (dev server) and the
// WS server import this singleton. Works because
// they share the same Node process globals.
// ============================================

import { EventEmitter } from 'events'

export interface WsNotificationEvent {
  recipientId: string
  notification: unknown // serialized Notification object
}

class NotificationEmitter extends EventEmitter {
  emitNotification(event: WsNotificationEvent): void {
    this.emit('notification', event)
  }

  onNotification(handler: (event: WsNotificationEvent) => void): void {
    this.on('notification', handler)
  }
}

// Singleton — survives HMR in dev via globalThis
const globalForWs = globalThis as unknown as {
  __gglog_ws_emitter: NotificationEmitter | undefined
}

export const wsEmitter =
  globalForWs.__gglog_ws_emitter ?? new NotificationEmitter()

if (process.env.NODE_ENV !== 'production') {
  globalForWs.__gglog_ws_emitter = wsEmitter
}
