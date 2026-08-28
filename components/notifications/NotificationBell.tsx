"use client";

// ============================================
// GGLOG — Notification Bell
// ============================================
// Bell icon with unread badge. Toggles the
// NotificationPanel on click.
//
// Reads unreadCount from NotificationProvider.
// This component should be placed in every
// authenticated navbar.
// ============================================

import { useState, useCallback } from "react";
import { useNotifications } from "@/components/providers/NotificationProvider";
import NotificationPanel from "./NotificationPanel";

export default function NotificationBell() {
  const { unreadCount } = useNotifications();
  const [panelOpen, setPanelOpen] = useState(false);

  const togglePanel = useCallback(() => {
    setPanelOpen((prev) => !prev);
  }, []);

  const closePanel = useCallback(() => {
    setPanelOpen(false);
  }, []);

  return (
    <div className="relative">
      <button
        onClick={togglePanel}
        className="
          relative p-1.5
          text-text-dim hover:text-lime
          transition-colors duration-150
        "
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        aria-expanded={panelOpen}
        aria-haspopup="dialog"
        type="button"
      >
        {/* Bell SVG */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="square"
          aria-hidden="true"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span
            className="
              absolute -top-0.5 -right-0.5
              min-w-[14px] h-[14px]
              flex items-center justify-center
              bg-lime text-bg
              font-[family-name:var(--font-press-start)] text-[6px]
              leading-none px-[3px]
              shadow-[0_0_8px_rgba(204,255,0,0.4)]
            "
            aria-hidden="true"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Panel */}
      <NotificationPanel isOpen={panelOpen} onClose={closePanel} />
    </div>
  );
}
