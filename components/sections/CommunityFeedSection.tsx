"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const FEED_ENTRIES: { tag: string; tagColor: string; content: React.JSX.Element; rating: string | null; time: string }[] = [
  {
    tag: "USER CONNECTED",
    tagColor: "text-lime",
    content: (
      <>
        <span className="text-text font-bold">ALEX</span> completed{" "}
        <span className="text-text font-bold">WITCHER 3</span>
      </>
    ),
    rating: "★★★★★",
    time: "2M AGO",
  },
  {
    tag: "MILESTONE",
    tagColor: "text-warning",
    content: (
      <>
        <span className="text-text font-bold">MAYA</span> added{" "}
        <span className="text-text font-bold">HOLLOW KNIGHT</span> to backlog
      </>
    ),
    rating: null,
    time: "5M AGO",
  },
  {
    tag: "REVIEW",
    tagColor: "text-lime",
    content: (
      <>
        <span className="text-text font-bold">RISHABH</span> rated{" "}
        <span className="text-text font-bold">SEKIRO</span>
      </>
    ),
    rating: "★★★★☆",
    time: "18M AGO",
  },
  {
    tag: "USER CONNECTED",
    tagColor: "text-lime",
    content: (
      <>
        <span className="text-text font-bold">PRIYA</span> completed{" "}
        <span className="text-text font-bold">CELESTE</span>
      </>
    ),
    rating: "★★★★★",
    time: "32M AGO",
  },
  {
    tag: "MILESTONE",
    tagColor: "text-warning",
    content: (
      <>
        <span className="text-text font-bold">KAI</span> reached{" "}
        <span className="text-lime font-bold">100 GAMES</span> logged
      </>
    ),
    rating: null,
    time: "1H AGO",
  },
];

export default function CommunityFeedSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const rowsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const rows = rowsRef.current.filter(Boolean);

    gsap.fromTo(
      rows,
      { opacity: 0, x: -20 },
      {
        opacity: 1,
        x: 0,
        duration: 0.4,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  return (
    <div ref={sectionRef} className="flex-1">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-[family-name:var(--font-press-start)] text-[10px] text-text tracking-wide">
          // COMMUNITY_FEED.exe
        </h2>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" />
          <span className="font-[family-name:var(--font-jetbrains)] text-[10px] text-lime uppercase">
            Live
          </span>
        </div>
      </div>

      {/* Feed entries */}
      <div className="bg-surface border border-border">
        {FEED_ENTRIES.map((entry, i) => (
          <div
            key={i}
            ref={(el) => { rowsRef.current[i] = el; }}
            className="
              flex items-center gap-3 px-4 py-3
              border-b border-border/50 last:border-b-0
              hover:bg-surface-light transition-colors duration-200
              group cursor-default
            "
          >
            {/* Tag */}
            <span
              className={`
                font-[family-name:var(--font-press-start)] text-[6px]
                ${entry.tagColor}
                border border-current px-1.5 py-0.5
                shrink-0 opacity-70
              `}
            >
              [{entry.tag}]
            </span>

            {/* Content */}
            <div className="flex-1 font-[family-name:var(--font-jetbrains)] text-xs text-text-dim min-w-0 truncate">
              {entry.content}
            </div>

            {/* Rating */}
            {entry.rating && (
              <span className="text-warning text-xs shrink-0">
                {entry.rating}
              </span>
            )}

            {/* Time */}
            <span className="font-[family-name:var(--font-jetbrains)] text-[10px] text-text-muted shrink-0">
              {entry.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
