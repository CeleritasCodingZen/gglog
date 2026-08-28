"use client";

// ============================================
// GGLOG — Notification Item
// ============================================
// Single notification row. Renders the actor
// avatar, message, timestamp, and read indicator.
//
// Pure display component — receives all data
// via props. No API calls, no state management.
// ============================================

import { useCallback } from "react";
import Link from "next/link";
import type { Notification } from "@/lib/notifications/types";
import {
  getNotificationMessage,
  getNotificationHref,
  formatRelativeTime,
} from "@/lib/notifications/notificationUtils";
import { useNotifications } from "@/components/providers/NotificationProvider";

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: string) => void;
  onClose: () => void;
}

export default function NotificationItem({
  notification,
  onRead,
  onClose,
}: NotificationItemProps) {
  const { dismissNotification } = useNotifications();
  const { actorName, action, target } = getNotificationMessage(notification);
  const href = getNotificationHref(notification);
  const timeAgo = formatRelativeTime(notification.createdAt);

  const handleClick = useCallback(() => {
    if (!notification.isRead) {
      onRead(notification.id);
    }
    onClose();
  }, [notification.id, notification.isRead, onRead, onClose]);

  const handleDismiss = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dismissNotification(notification.id);
  }, [notification.id, dismissNotification]);

  const content = (
    <div
      className={`
        flex items-start gap-3 pl-4 pr-8 py-3
        border-b border-border/30
        transition-colors duration-150
        cursor-pointer group
        ${notification.isRead
          ? "bg-transparent hover:bg-surface-light/50"
          : "bg-lime/[0.03] hover:bg-lime/[0.06]"
        }
      `}
    >
      {/* Unread indicator */}
      <div className="flex-shrink-0 pt-1.5 w-2">
        {!notification.isRead && (
          <span
            className="block w-1.5 h-1.5 bg-lime shadow-[0_0_6px_rgba(204,255,0,0.4)]"
            aria-label="Unread"
          />
        )}
      </div>

      {/* Actor avatar */}
      <div className="flex-shrink-0 w-7 h-7 bg-surface border border-border flex items-center justify-center">
        <span className="font-[family-name:var(--font-press-start)] text-[6px] text-text-muted">
          {notification.actor.username.charAt(0).toUpperCase()}
        </span>
      </div>

      {/* Message body */}
      <div className="flex-1 min-w-0">
        <p
          className={`
            font-mono text-[11px] leading-relaxed tracking-wide
            ${notification.isRead ? "text-text-dim" : "text-text"}
          `}
        >
          <span
            className={`
              font-space font-bold
              ${notification.isRead
                ? "text-text-dim"
                : "text-lime group-hover:glow-lime"
              }
            `}
          >
            {actorName}
          </span>{" "}
          {action}
          {target && (
            <>
              {" "}
              <span className="text-text">{target}</span>
            </>
          )}
        </p>

        {/* Comment preview */}
        {notification.type === "REVIEW_COMMENT" && notification.comment && (
          <p className="font-mono text-[10px] text-text-muted/60 mt-1 truncate tracking-wide">
            &quot;{notification.comment.body.length > 80
              ? `${notification.comment.body.slice(0, 80)}…`
              : notification.comment.body}&quot;
          </p>
        )}

        {/* Timestamp */}
        <span
          className={`
            font-mono text-[9px] tracking-wider mt-1 block
            ${notification.isRead ? "text-text-muted/40" : "text-text-muted/60"}
          `}
        >
          {timeAgo}
        </span>
      </div>

      {/* Type icon */}
      <div className="flex-shrink-0 pt-0.5">
        <NotificationTypeIcon
          type={notification.type}
          isRead={notification.isRead}
        />
      </div>
    </div>
  );

  const dismissBtn = (
    <button
      onClick={handleDismiss}
      className="
        absolute top-3.5 right-2.5
        flex items-center justify-center
        w-4 h-4
        text-text-muted/40 hover:text-warning
        hover:bg-surface-light/30
        transition-all duration-150
        z-10
        opacity-60 md:opacity-0 md:group-hover/notif:opacity-100 md:focus-visible:opacity-100
      "
      aria-label="Dismiss notification"
      type="button"
    >
      <svg
        width="8"
        height="8"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="square"
        aria-hidden="true"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  );

  return (
    <div className="relative group/notif">
      {href ? (
        <Link href={href} onClick={handleClick} className="block">
          {content}
        </Link>
      ) : (
        <button
          onClick={handleClick}
          className="block w-full text-left"
          type="button"
        >
          {content}
        </button>
      )}
      {dismissBtn}
    </div>
  );
}

// ---- Type-specific icon ----

function NotificationTypeIcon({
  type,
  isRead,
}: {
  type: Notification["type"];
  isRead: boolean;
}) {
  const color = isRead ? "text-text-muted/30" : "text-text-muted/60";

  switch (type) {
    case "FOLLOW":
      return (
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="square"
          className={color}
          aria-hidden="true"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <line x1="19" y1="8" x2="19" y2="14" />
          <line x1="22" y1="11" x2="16" y2="11" />
        </svg>
      );

    case "REVIEW_LIKE":
      return (
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="square"
          className={color}
          aria-hidden="true"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      );

    case "REVIEW_COMMENT":
      return (
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="square"
          className={color}
          aria-hidden="true"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      );
  }
}
