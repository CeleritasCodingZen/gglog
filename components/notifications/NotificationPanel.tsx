"use client";

// ============================================
// GGLOG — Notification Panel
// ============================================
// Dropdown popover containing the notification
// list with a header and footer. Handles
// click-outside and Escape to close.
// ============================================

import { useEffect, useRef, useCallback } from "react";
import { useNotifications } from "@/components/providers/NotificationProvider";
import NotificationList from "./NotificationList";

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationPanel({
  isOpen,
  onClose,
}: NotificationPanelProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    }

    // Delay to avoid closing immediately from the bell click
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleMarkAll = useCallback(() => {
    markAllAsRead();
  }, [markAllAsRead]);

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      className="
        absolute top-full right-0 mt-2
        w-[calc(100vw-2rem)] sm:w-[380px]
        border border-border bg-bg
        shadow-[0_4px_24px_rgba(0,0,0,0.6)]
        z-[150]
      "
      role="dialog"
      aria-label="Notifications"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="font-pixel text-[9px] text-lime tracking-wider glow-lime">
            NOTIFICATIONS_
          </span>
          {unreadCount > 0 && (
            <span className="font-mono text-[9px] text-text-muted tracking-wider">
              ({unreadCount})
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAll}
            className="
              font-mono text-[9px] text-text-muted
              hover:text-lime transition-colors
              tracking-wider
            "
            type="button"
          >
            MARK ALL READ
          </button>
        )}
      </div>

      {/* Notification list */}
      <NotificationList
        notifications={notifications}
        onRead={markAsRead}
        onClose={onClose}
      />

      {/* Footer */}
      <div className="border-t border-border px-4 py-2.5 text-center">
        <span className="font-mono text-[9px] text-text-muted/30 tracking-[0.15em]">
          {"// SIGNAL_FEED v1.0"}
        </span>
      </div>
    </div>
  );
}
