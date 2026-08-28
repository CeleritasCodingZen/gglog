"use client";

// ============================================
// GGLOG — Notification List
// ============================================
// Renders a scrollable list of NotificationItem
// components. Handles empty state internally.
// ============================================

import type { Notification } from "@/lib/notifications/types";
import NotificationItem from "./NotificationItem";
import NotificationEmpty from "./NotificationEmpty";

interface NotificationListProps {
  notifications: Notification[];
  onRead: (id: string) => void;
  onClose: () => void;
}

export default function NotificationList({
  notifications,
  onRead,
  onClose,
}: NotificationListProps) {
  if (notifications.length === 0) {
    return <NotificationEmpty />;
  }

  return (
    <div className="max-h-[60vh] md:max-h-[420px] overflow-y-auto">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRead={onRead}
          onClose={onClose}
        />
      ))}
    </div>
  );
}
