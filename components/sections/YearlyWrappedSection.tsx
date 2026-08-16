"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CountUpNumber from "../ui/CountUpNumber";

gsap.registerPlugin(ScrollTrigger);

const STATS = [
  { value: 47, suffix: "", label: "GAMES PLAYED", icon: "🎮" },
  { value: 326, suffix: "", label: "HOURS LOGGED", icon: "⏱️" },
  { value: 4.2, suffix: "", label: "AVG RATING", icon: "⭐", decimals: 1 },
];

export default function YearlyWrappedSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(
      contentRef.current,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          toggleActions: "play none none none",
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  return (
    <section ref={sectionRef} className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Section header */}
        <div className="mb-12">
          <span className="font-[family-name:var(--font-jetbrains)] text-xs text-text-muted tracking-widest">
            // 2026_GAMING_REPORT
          </span>
          <div className="mt-1 w-full h-px bg-gradient-to-r from-border via-border to-transparent" />
        </div>

        <div ref={contentRef} className="relative">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-surface border border-border -z-10" />
          <div
            className="absolute inset-0 -z-10 opacity-[0.02]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(204,255,0,0.5) 1px, transparent 1px),
                linear-gradient(90deg, rgba(204,255,0,0.5) 1px, transparent 1px)
              `,
              backgroundSize: "20px 20px",
            }}
          />

          <div className="p-6 md:p-10">
            {/* Year title */}
            <div className="text-center mb-10">
              <h2 className="font-[family-name:var(--font-press-start)] text-xl md:text-2xl text-text">
                2026
              </h2>
              <span className="font-[family-name:var(--font-vt323)] text-lg text-text-dim">
                GAMING REPORT
              </span>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
              {STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="text-center p-6 bg-bg/50 border border-border/50"
                >
                  <div className="text-2xl mb-2">{stat.icon}</div>
                  <div className="font-[family-name:var(--font-press-start)] text-2xl md:text-3xl text-lime glow-lime">
                    <CountUpNumber
                      end={stat.value}
                      duration={2}
                      suffix={stat.suffix}
                      decimals={stat.decimals || 0}
                    />
                  </div>
                  <div className="font-[family-name:var(--font-press-start)] text-[8px] text-text-dim mt-3 tracking-wider">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Top game */}
            <div className="text-center border-t border-border/50 pt-8">
              <span className="font-[family-name:var(--font-jetbrains)] text-xs text-text-dim uppercase tracking-widest">
                Top Game of the Year
              </span>
              <div className="font-[family-name:var(--font-press-start)] text-lg md:text-xl text-warning mt-3">
                ELDEN RING
              </div>
              <div className="font-[family-name:var(--font-vt323)] text-lg text-text-dim mt-1">
                127 HOURS · ★★★★★
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
