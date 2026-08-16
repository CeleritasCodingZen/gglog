"use client";

import { useEffect, useRef, useState } from "react";

interface XPBarProps {
  level: number;
  currentXP: number;
  maxXP: number;
  className?: string;
}

export default function XPBar({
  level,
  currentXP,
  maxXP,
  className = "",
}: XPBarProps) {
  const [width, setWidth] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          // Small delay for dramatic effect
          setTimeout(() => {
            setWidth((currentXP / maxXP) * 100);
          }, 300);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [currentXP, maxXP]);

  return (
    <div ref={ref} className={className}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-[family-name:var(--font-press-start)] text-text-dim">
          LVL {level}
        </span>
        <span className="text-xs font-[family-name:var(--font-jetbrains)] text-text-dim">
          {currentXP} / {maxXP} XP
        </span>
      </div>
      <div className="xp-bar-track">
        <div
          className="xp-bar-fill"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}
