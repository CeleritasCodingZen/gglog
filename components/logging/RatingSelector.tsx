"use client";

// ============================================
// GGLOG — Rating Selector (Logging Page)
// ============================================
// Interactive 5-star rating with half-star
// support. Hover preview + click to set.
// ============================================

import { useState, useCallback } from "react";

interface RatingSelectorProps {
  value: number; // 0–5, supports 0.5
  onChange: (rating: number) => void;
}

export default function RatingSelector({ value, onChange }: RatingSelectorProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const displayRating = hoverRating ?? value;

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>, starIndex: number) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const half = x < rect.width / 2;
      setHoverRating(half ? starIndex + 0.5 : starIndex + 1);
    },
    []
  );

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>, starIndex: number) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const half = x < rect.width / 2;
      const newRating = half ? starIndex + 0.5 : starIndex + 1;
      // Toggle off if clicking same rating
      onChange(newRating === value ? 0 : newRating);
    },
    [value, onChange]
  );

  const getStarFill = (starIndex: number): "full" | "half" | "empty" => {
    const rating = displayRating;
    if (rating >= starIndex + 1) return "full";
    if (rating >= starIndex + 0.5) return "half";
    return "empty";
  };

  return (
    <section className="log-section">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-pixel text-[10px] text-text tracking-wider flex items-center gap-2">
          <span className="text-lime">⭐</span>
          YOUR EXPERIENCE
        </h2>
        <span className="font-mono text-[9px] text-text-muted/40 tracking-wider border border-border/50 px-2 py-0.5">
          FILL
        </span>
      </div>

      <div className="flex items-center gap-5">
        {/* Stars */}
        <div
          className="flex items-center gap-1"
          onMouseLeave={() => setHoverRating(null)}
        >
          {[0, 1, 2, 3, 4].map((starIndex) => {
            const fill = getStarFill(starIndex);
            return (
              <button
                key={starIndex}
                type="button"
                onMouseMove={(e) => handleMouseMove(e, starIndex)}
                onClick={(e) => handleClick(e, starIndex)}
                className="rating-star relative w-8 h-8 md:w-10 md:h-10 flex items-center justify-center cursor-pointer transition-transform duration-100 hover:scale-110"
              >
                {/* Empty star (background) */}
                <span className="absolute inset-0 flex items-center justify-center text-xl md:text-2xl text-border select-none">
                  ★
                </span>

                {/* Filled star */}
                {fill !== "empty" && (
                  <span
                    className={`
                      absolute inset-0 flex items-center justify-center
                      text-xl md:text-2xl text-lime select-none
                      ${fill === "half" ? "rating-star-half" : ""}
                    `}
                    style={
                      fill === "half"
                        ? { clipPath: "inset(0 50% 0 0)" }
                        : undefined
                    }
                  >
                    ★
                  </span>
                )}

                {/* Glow effect */}
                {fill !== "empty" && (
                  <span className="absolute inset-0 flex items-center justify-center text-xl md:text-2xl text-lime/30 blur-sm select-none pointer-events-none">
                    ★
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Rating Number */}
        <div className="flex items-baseline gap-1">
          <span className="font-terminal text-3xl md:text-4xl text-lime glow-lime">
            {displayRating > 0 ? displayRating.toFixed(1).replace(".0", "") : "—"}
          </span>
          <span className="font-mono text-[11px] text-text-muted tracking-wider">
            {displayRating > 0 ? "/5" : ""}
          </span>
        </div>
      </div>

      {/* Rating hint */}
      {value === 0 && (
        <p className="font-mono text-[10px] text-text-muted/40 mt-3 tracking-wider">
          // CLICK TO RATE — HALF STARS SUPPORTED
        </p>
      )}
    </section>
  );
}
