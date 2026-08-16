"use client";

// ============================================
// GGLOG — Stats Panel (Sidebar HUD)
// ============================================

import { useEffect, useRef, useState } from "react";
import type { PlayerStats } from "@/data/mockProfile";
import CountUpNumber from "@/components/ui/CountUpNumber";

interface StatsPanelProps {
  stats: PlayerStats;
}

function GenreBar({
  name,
  percentage,
  color,
  delay,
}: {
  name: string;
  percentage: number;
  color: string;
  delay: number;
}) {
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
          setTimeout(() => setWidth(percentage), delay);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [percentage, delay]);

  // Map color names to CSS fill classes
  const fillClass =
    color === "bg-lime"
      ? "fill-lime"
      : color === "bg-warning"
        ? "fill-warning"
        : color.includes("muted/60")
          ? "fill-dim"
          : "fill-muted";

  return (
    <div ref={ref} className="flex items-center gap-3">
      <span className="font-space text-[10px] text-text-dim tracking-wider w-[72px] flex-shrink-0 uppercase">
        {name}
      </span>
      <div className="genre-bar-track">
        <div
          className={`genre-bar-fill ${fillClass}`}
          style={{ width: `${width}%` }}
        />
      </div>
      <span className="font-space text-[10px] text-text-muted tracking-wider w-[32px] text-right flex-shrink-0">
        {percentage}%
      </span>
    </div>
  );
}

export default function StatsPanel({ stats }: StatsPanelProps) {
  return (
    <div className="profile-fade-4">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-5">
        <span className="font-space text-[10px] text-text-muted tracking-[0.15em] uppercase">
          SYS_MONITOR // STATS
        </span>
        <span className="font-space text-[9px] text-lime/50 tracking-[0.1em] uppercase">
          [ACTIVE]
        </span>
      </div>

      {/* ── Big Numbers ── */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-surface border border-border p-4">
          <p className="font-space text-[9px] text-text-muted tracking-[0.12em] uppercase mb-1.5">
            GAMES LOGGED (YTD)
          </p>
          <CountUpNumber
            end={stats.gamesLoggedYTD}
            duration={2}
            className="font-pixel text-2xl text-lime glow-lime"
          />
        </div>
        <div className="bg-surface border border-border p-4">
          <p className="font-space text-[9px] text-text-muted tracking-[0.12em] uppercase mb-1.5">
            HOURS CONNECTED
          </p>
          <CountUpNumber
            end={stats.hoursConnected}
            duration={2.5}
            className="font-pixel text-2xl text-text"
          />
        </div>
      </div>

      {/* ── Genre Distribution ── */}
      <div>
        <p className="font-space text-[9px] text-text-muted tracking-[0.15em] uppercase mb-4">
          GENRE_DISTRIBUTION.DAT
        </p>
        <div className="space-y-3">
          {stats.genres.map((genre, i) => (
            <GenreBar
              key={genre.name}
              name={genre.name}
              percentage={genre.percentage}
              color={genre.color}
              delay={300 + i * 150}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
