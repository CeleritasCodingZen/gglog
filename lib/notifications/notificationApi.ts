// ============================================
// GGLOG — Notification API Client
// ============================================
// Real API functions for the notification system.
//
// Routes:
//   GET   /api/notifications           — paginated list
//   GET   /api/notifications/unread-count — unread badge count
//   PATCH /api/notifications/:id/read  — mark one read
//   PATCH /api/notifications/read-all  — mark all read
//
// Uses the existing apiGet/apiPatch from lib/api.ts.
// All requests include credentials (HTTP-only cookie).
// ============================================

import type { Notification } from './types'
import { apiGet, apiPatch, apiDelete } from '@/lib/api'

interface PaginatedNotifications {
  items: Notification[]
  nextCursor: string | null
  hasMore: boolean
}

interface UnreadCountResponse {
  count: number
}

/**
 * Fetch paginated notifications from the backend.
 */
export async function fetchNotifications(cursor?: string | null): Promise<PaginatedNotifications> {
  const params = new URLSearchParams({ limit: '20' })
  if (cursor) {
    params.set('cursor', cursor)
  }
  return apiGet<PaginatedNotifications>(`/api/notifications?${params.toString()}`)
}

/**
 * Fetch the unread notification count.
 */
export async function fetchUnreadCount(): Promise<number> {
  const data = await apiGet<UnreadCountResponse>('/api/notifications/unread-count')
  return data.count
}

/**
 * Mark a single notification as read on the backend.
 */
export async function markNotificationRead(id: string): Promise<void> {
  await apiPatch(`/api/notifications/${id}/read`)
}

/**
 * Mark all notifications as read on the backend.
 */
export async function markAllNotificationsRead(): Promise<void> {
  await apiPatch('/api/notifications/read-all')
}

/**
 * Dismiss (delete) a single notification on the backend.
 */
export async function dismissNotification(id: string): Promise<void> {
  await apiDelete(`/api/notifications/${id}`)
}

