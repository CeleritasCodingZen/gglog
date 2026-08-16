"use client";

// ============================================
// GGLOG — Review Editor (Logging Page)
// ============================================
// Large textarea with character counter and
// spoiler toggle.
// ============================================

import { useState, useCallback } from "react";

interface ReviewEditorProps {
  value: string;
  onChange: (text: string) => void;
  spoiler: boolean;
  onSpoilerChange: (spoiler: boolean) => void;
  maxLength?: number;
}

export default function ReviewEditor({
  value,
  onChange,
  spoiler,
  onSpoilerChange,
  maxLength = 1500,
}: ReviewEditorProps) {
  const [focused, setFocused] = useState(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (e.target.value.length <= maxLength) {
        onChange(e.target.value);
      }
    },
    [onChange, maxLength]
  );

  const charPercent = Math.round((value.length / maxLength) * 100);
  const isNearLimit = charPercent > 80;

  return (
    <section className="log-section">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-pixel text-[10px] text-text tracking-wider flex items-center gap-2">
          <span className="text-lime">💬</span>
          YOUR THOUGHTS
        </h2>

        {/* Spoiler Toggle */}
        <button
          onClick={() => onSpoilerChange(!spoiler)}
          className={`
            flex items-center gap-2
            font-space text-[10px] tracking-wider
            transition-colors duration-200
            ${spoiler ? "text-warning" : "text-text-muted/60 hover:text-text-muted"}
          `}
        >
          <span
            className={`
              w-3.5 h-3.5 border flex items-center justify-center
              transition-all duration-200
              ${spoiler
                ? "border-warning bg-warning/20"
                : "border-border"
              }
            `}
          >
            {spoiler && (
              <span className="text-[8px] text-warning">✓</span>
            )}
          </span>
          CONTAINS SPOILER
        </button>
      </div>

      {/* Textarea */}
      <div
        className={`
          relative border transition-colors duration-200
          ${focused
            ? "border-lime/50"
            : "border-border hover:border-border-active"
          }
        `}
      >
        <textarea
          value={value}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="A masterpiece of world-building and punishing combat..."
          rows={6}
          className="
            w-full bg-surface/50 p-4
            font-mono text-[12px] text-text leading-relaxed tracking-wide
            placeholder:text-text-muted/30
            resize-none outline-none
          "
          spellCheck={false}
        />

        {/* Character Counter */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <span
            className={`
              font-mono text-[10px] tracking-wider
              ${isNearLimit ? "text-warning" : "text-text-muted/40"}
            `}
          >
            {value.length}/{maxLength}
          </span>
        </div>
      </div>
    </section>
  );
}
