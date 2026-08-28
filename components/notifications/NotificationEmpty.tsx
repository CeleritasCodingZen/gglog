"use client";

// ============================================
// GGLOG — Notification Empty State
// ============================================

export default function NotificationEmpty() {
  return (
    <div className="px-5 py-10 text-center">
      <span className="font-pixel text-[9px] text-text-muted tracking-wider">
        NO SIGNALS DETECTED_
      </span>
      <p className="font-mono text-[10px] text-text-muted/40 tracking-wider mt-2">
        {"// AWAITING INCOMING TRANSMISSIONS"}
      </p>
    </div>
  );
}
