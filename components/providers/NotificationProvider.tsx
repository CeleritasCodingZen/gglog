"use client";

// ============================================
// GGLOG — Notification Provider
// ============================================
// Central state management for notifications.
//
// Lifecycle:
//   1. On mount (when user is authenticated):
//      - Fetch initial notifications from GET /api/notifications
//      - Fetch unread count from GET /api/notifications/unread-count
//      - Open WebSocket connection for realtime events
//   2. On WebSocket event:
//      - Add notification to state (deduped by ID)
//      - Increment unread count
//   3. On mark-as-read:
//      - Optimistic UI update
//      - PATCH /api/notifications/:id/read
//   4. On mark-all-read:
//      - Optimistic UI update
//      - PATCH /api/notifications/read-all
//   5. On unmount:
//      - Disconnect WebSocket
//
// All notification UI reads from this context.
// Transport logic lives in notificationApi.ts
// and notificationSocket.ts.
// ============================================

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import type { Notification, NotificationState } from "@/lib/notifications/types";
import { sortNotifications } from "@/lib/notifications/notificationUtils";
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  dismissNotification as apiDismissNotification,
} from "@/lib/notifications/notificationApi";
import { notificationSocket } from "@/lib/notifications/notificationSocket";
import { useAuth } from "@/components/providers/AuthContext";

const NotificationContext = createContext<NotificationState | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const initializedRef = useRef(false);

  // ---- Hydrate from API on mount (when authenticated) ----

  useEffect(() => {
    if (!user) {
      // Not logged in — reset state
      setNotifications([]);
      setUnreadCount(0);
      initializedRef.current = false;
      return;
    }

    if (initializedRef.current) return;
    initializedRef.current = true;

    // Fetch initial data
    async function hydrate() {
      try {
        const [notifResult, count] = await Promise.all([
          fetchNotifications(),
          fetchUnreadCount(),
        ]);
        setNotifications(sortNotifications(notifResult.items));
        setUnreadCount(count);
      } catch (err) {
        // Dashboard still works without notifications
        if (process.env.NODE_ENV === "development") {
          console.error("[NotificationProvider] Hydration failed:", err);
        }
      }
    }

    hydrate();
  }, [user]);

  // ---- WebSocket connection lifecycle ----

  useEffect(() => {
    if (!user) {
      notificationSocket.disconnect();
      return;
    }

    // Subscribe to realtime notification events
    const unsubscribe = notificationSocket.subscribe((notification) => {
      setNotifications((prev) => {
        // Prevent duplicates
        if (prev.some((n) => n.id === notification.id)) return prev;
        return [notification, ...prev];
      });
      setUnreadCount((prev) => prev + 1);
    });

    notificationSocket.connect();

    return () => {
      unsubscribe();
      notificationSocket.disconnect();
    };
  }, [user]);

  // ---- Refetch on reconnect ----

  useEffect(() => {
    if (!user) return;

    // When reconnecting, refetch to catch missed notifications
    const handleVisibility = async () => {
      if (document.visibilityState === "visible" && user) {
        try {
          const count = await fetchUnreadCount();
          setUnreadCount(count);
        } catch {
          // Ignore — non-critical
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [user]);

  // ---- Actions ----

  const markAsRead = useCallback((id: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    // Persist
    markNotificationRead(id).catch((err) => {
      if (process.env.NODE_ENV === "development") {
        console.error("[NotificationProvider] markAsRead failed:", err);
      }
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);

    // Persist
    markAllNotificationsRead().catch((err) => {
      if (process.env.NODE_ENV === "development") {
        console.error("[NotificationProvider] markAllAsRead failed:", err);
      }
    });
  }, []);

  const dismissingIds = useRef(new Set<string>());

  const dismissNotification = useCallback((id: string) => {
    if (dismissingIds.current.has(id)) return;
    dismissingIds.current.add(id);

    let removedNotification: Notification | undefined;
    let wasUnread = false;

    setNotifications((prev) => {
      const match = prev.find((n) => n.id === id);
      if (match) {
        removedNotification = match;
        wasUnread = !match.isRead;
      }
      return prev.filter((n) => n.id !== id);
    });

    if (wasUnread) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    apiDismissNotification(id)
      .then(() => {
        dismissingIds.current.delete(id);
      })
      .catch((err) => {
        dismissingIds.current.delete(id);
        if (process.env.NODE_ENV === "development") {
          console.error("[NotificationProvider] dismissNotification failed:", err);
        }
        // Rollback on error
        if (removedNotification) {
          setNotifications((prev) => sortNotifications([...prev, removedNotification!]));
          if (wasUnread) {
            setUnreadCount((prev) => prev + 1);
          }
        }
      });
  }, []);

  const addNotification = useCallback((notification: Notification) => {
    setNotifications((prev) => {
      if (prev.some((n) => n.id === notification.id)) return prev;
      return [notification, ...prev];
    });
    setUnreadCount((prev) => prev + 1);
  }, []);

  const value = useMemo<NotificationState>(
    () => ({
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      addNotification,
      dismissNotification,
    }),
    [notifications, unreadCount, markAsRead, markAllAsRead, addNotification, dismissNotification]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

/**
 * Access notification state from any component
 * within the NotificationProvider.
 */
export function useNotifications(): NotificationState {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return ctx;
}
