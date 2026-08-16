"use client";

// ============================================
// GGLOG — Status Selector (Logging Page)
// ============================================
// Four toggle buttons for game completion status.
// ============================================

import type { LogEntryStatus } from "@/data/mockGames";

interface StatusSelectorProps {
  value: LogEntryStatus;
  onChange: (status: LogEntryStatus) => void;
}

const STATUSES: { value: LogEntryStatus; label: string }[] = [
  { value: "PLAYING", label: "PLAYING" },
  { value: "COMPLETED", label: "COMPLETED" },
  { value: "DROPPED", label: "DROPPED" },
  { value: "REPLAYED", label: "REPLAYED" },
];

export default function StatusSelector({ value, onChange }: StatusSelectorProps) {
  return (
    <section className="log-section">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-pixel text-[10px] text-text tracking-wider flex items-center gap-2">
          <span className="text-lime">🎮</span>
          GAME STATUS
        </h2>
      </div>

      <div className="flex flex-wrap gap-3">
        {STATUSES.map((status) => {
          const selected = value === status.value;
          return (
            <button
              key={status.value}
              onClick={() => onChange(status.value)}
              className={`
                font-space text-[10px] tracking-wider
                border px-4 py-2.5
                transition-all duration-200 btn-press
                ${selected
                  ? "border-lime text-lime bg-lime/8 glow-lime-box"
                  : "border-border text-text-dim hover:border-border-active hover:text-text"
                }
              `}
            >
              <span className="mr-1.5">›</span>
              {status.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
