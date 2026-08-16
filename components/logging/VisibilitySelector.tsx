"use client";

// ============================================
// GGLOG — Visibility Selector (Logging Page)
// ============================================
// Three options: PUBLIC, FOLLOWERS, PRIVATE.
// ============================================

import type { LogEntryVisibility } from "@/data/mockGames";

interface VisibilitySelectorProps {
  value: LogEntryVisibility;
  onChange: (visibility: LogEntryVisibility) => void;
}

const OPTIONS: { value: LogEntryVisibility; label: string; icon: string }[] = [
  { value: "PUBLIC", label: "PUBLIC", icon: "◉" },
  { value: "FOLLOWERS", label: "FOLLOWERS", icon: "◎" },
  { value: "PRIVATE", label: "PRIVATE", icon: "🔒" },
];

export default function VisibilitySelector({ value, onChange }: VisibilitySelectorProps) {
  return (
    <section className="log-section">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-pixel text-[10px] text-text tracking-wider flex items-center gap-2">
          <span className="text-lime">👁️</span>
          WHO CAN SEE THIS?
        </h2>
        <span className="font-mono text-[9px] text-text-muted/40 tracking-wider border border-border/50 px-2 py-0.5">
          {value}
        </span>
      </div>

      <div className="flex flex-wrap gap-3">
        {OPTIONS.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={`
                font-space text-[10px] tracking-wider
                border px-4 py-2.5
                transition-all duration-200 btn-press
                flex items-center gap-2
                ${selected
                  ? "border-lime text-lime bg-lime/8 glow-lime-box"
                  : "border-border text-text-dim hover:border-border-active hover:text-text"
                }
              `}
            >
              <span className="text-xs">{opt.icon}</span>
              {opt.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
