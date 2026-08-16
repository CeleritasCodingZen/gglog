"use client";

// ============================================
// GGLOG — Tag Selector (Logging Page)
// ============================================
// Preset tag chips + custom tag input.
// ============================================

import { useState, useCallback } from "react";

interface TagSelectorProps {
  value: string[];
  onChange: (tags: string[]) => void;
}

const PRESET_TAGS = [
  "MASTERPIECE",
  "HARDCORE",
  "LORE-HEAVY",
  "EXPLORATION",
  "CHILL",
  "COMPETITIVE",
  "STORY-RICH",
  "ATMOSPHERIC",
  "CO-OP",
  "SPEEDRUN",
];

export default function TagSelector({ value, onChange }: TagSelectorProps) {
  const [customTag, setCustomTag] = useState("");

  const toggleTag = useCallback(
    (tag: string) => {
      if (value.includes(tag)) {
        onChange(value.filter((t) => t !== tag));
      } else {
        onChange([...value, tag]);
      }
    },
    [value, onChange]
  );

  const addCustomTag = useCallback(() => {
    const tag = customTag.trim().toUpperCase().replace(/\s+/g, "-");
    if (tag && !value.includes(tag)) {
      onChange([...value, tag]);
    }
    setCustomTag("");
  }, [customTag, value, onChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addCustomTag();
      }
    },
    [addCustomTag]
  );

  return (
    <section className="log-section">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-pixel text-[10px] text-text tracking-wider flex items-center gap-2">
          <span className="text-lime">🏷️</span>
          TAGS
        </h2>
        <span className="font-mono text-[9px] text-text-muted/40 tracking-wider border border-border/50 px-2 py-0.5">
          {value.length}/10
        </span>
      </div>

      {/* Preset Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {PRESET_TAGS.map((tag) => {
          const selected = value.includes(tag);
          return (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`
                font-space text-[9px] tracking-wider
                border px-3 py-1.5
                transition-all duration-200
                ${selected
                  ? "border-lime text-lime bg-lime/10"
                  : "border-border text-text-muted hover:border-border-active hover:text-text-dim"
                }
              `}
            >
              {selected ? "✕" : "+"} {tag}
            </button>
          );
        })}
      </div>

      {/* Custom Tag Input */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center border border-border bg-surface/30 px-3 py-2">
          <span className="font-mono text-[10px] text-text-muted/40 mr-2">+</span>
          <input
            type="text"
            value={customTag}
            onChange={(e) => setCustomTag(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="TAG..."
            maxLength={20}
            className="
              flex-1 bg-transparent outline-none
              font-space text-[10px] text-text tracking-wider
              placeholder:text-text-muted/30
              uppercase
            "
          />
        </div>
        <button
          onClick={addCustomTag}
          disabled={!customTag.trim()}
          className={`
            font-pixel text-[8px] tracking-wider
            border px-3 py-2
            transition-all duration-200
            ${customTag.trim()
              ? "border-lime text-lime hover:bg-lime hover:text-bg"
              : "border-border text-text-muted/30 cursor-not-allowed"
            }
          `}
        >
          ADD
        </button>
      </div>
    </section>
  );
}
