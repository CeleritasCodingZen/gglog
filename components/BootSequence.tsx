"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const BOOT_LINES = [
  { text: "GGLOG ARCHIVE SYSTEM", delay: 0 },
  { text: "INITIALIZING...", delay: 200 },
  { text: "LOADING DATABASE...", delay: 500 },
  { text: "CONNECTING PLAYER PROFILE...", delay: 800 },
  { text: "SYSTEM READY_", delay: 1100 },
];

export default function BootSequence({ onComplete }: { onComplete: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef<(HTMLDivElement | null)[]>([]);
  const [visibleLines, setVisibleLines] = useState<number[]>([]);

  useEffect(() => {
    // Show lines sequentially
    BOOT_LINES.forEach((line, i) => {
      setTimeout(() => {
        setVisibleLines((prev) => [...prev, i]);
      }, line.delay);
    });

    // Fade out the overlay
    const exitTimer = setTimeout(() => {
      if (overlayRef.current) {
        gsap.to(overlayRef.current, {
          opacity: 0,
          duration: 0.3,
          ease: "power2.inOut",
          onComplete: () => {
            onComplete();
          },
        });
      }
    }, 1400);

    return () => {
      clearTimeout(exitTimer);
    };
  }, [onComplete]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[10000] bg-bg flex items-center justify-center"
    >
      {/* Scanline effect on boot */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(204,255,0,0.01) 2px, rgba(204,255,0,0.01) 4px)",
        }}
      />

      <div className="w-full max-w-lg px-8">
        {BOOT_LINES.map((line, i) => (
          <div
            key={i}
            ref={(el) => { linesRef.current[i] = el; }}
            className={`
              font-[family-name:var(--font-vt323)] text-lg md:text-xl
              mb-2 transition-all duration-150
              ${visibleLines.includes(i) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"}
              ${i === BOOT_LINES.length - 1 ? "text-lime glow-lime mt-4" : "text-text-dim"}
            `}
          >
            {visibleLines.includes(i) && (
              <span>
                {i < BOOT_LINES.length - 1 && (
                  <span className="text-text-muted mr-2">&gt;</span>
                )}
                {line.text}
              </span>
            )}
          </div>
        ))}

        {/* Loading bar */}
        <div className="mt-6 xp-bar-track">
          <div
            className="xp-bar-fill transition-all duration-[1200ms] ease-out"
            style={{
              width: visibleLines.length === BOOT_LINES.length ? "100%" : `${(visibleLines.length / BOOT_LINES.length) * 80}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
