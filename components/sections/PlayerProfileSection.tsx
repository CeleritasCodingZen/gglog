"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import XPBar from "../ui/XPBar";

gsap.registerPlugin(ScrollTrigger);

const STATS = [
  { label: "GAMES LOGGED", value: "42" },
  { label: "HOURS PLAYED", value: "1,247" },
  { label: "AVG RATING", value: "8.3" },
];

export default function PlayerProfileSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(
      sectionRef.current,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  return (
    <div ref={sectionRef} className="w-full lg:w-80 shrink-0">
      {/* Header */}
      <h2 className="font-[family-name:var(--font-press-start)] text-[10px] text-text tracking-wide mb-4">
        // PLAYER: OFFLINE_
      </h2>

      <div className="bg-surface border border-border p-5">
        {/* Avatar + Info */}
        <div className="flex items-center gap-4 mb-5">
          {/* Pixel avatar placeholder */}
          <div className="w-14 h-14 bg-surface-light border-2 border-border flex items-center justify-center shrink-0">
            <span className="font-[family-name:var(--font-press-start)] text-lg text-lime">S</span>
          </div>
          <div>
            <h3 className="font-[family-name:var(--font-press-start)] text-[10px] text-text">
              SOUNAVA
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-[family-name:var(--font-vt323)] text-sm text-text-dim">
                LVL 27
              </span>
              <span className="text-text-muted">·</span>
              <span className="font-[family-name:var(--font-vt323)] text-sm text-lime">
                ARCHIVIST
              </span>
            </div>
          </div>
        </div>

        {/* XP Bar */}
        <XPBar level={27} currentXP={7420} maxXP={10000} className="mb-5" />

        {/* Stats */}
        <div className="space-y-3 pt-3 border-t border-border/50">
          {STATS.map((stat) => (
            <div key={stat.label} className="flex items-center justify-between">
              <span className="font-[family-name:var(--font-jetbrains)] text-[10px] text-text-dim uppercase tracking-wider">
                ▸ {stat.label}
              </span>
              <span className="font-[family-name:var(--font-press-start)] text-[10px] text-text">
                {stat.value}
              </span>
            </div>
          ))}
        </div>

        {/* Rank badge */}
        <div className="mt-5 pt-4 border-t border-border/50 text-center">
          <span className="font-[family-name:var(--font-press-start)] text-[7px] text-text-muted tracking-widest">
            RANK
          </span>
          <div className="font-[family-name:var(--font-press-start)] text-xs text-lime glow-lime mt-1">
            ◆ ARCHIVIST ◆
          </div>
        </div>
      </div>
    </div>
  );
}
