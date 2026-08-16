"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const TRAITS = [
  { label: "OPEN WORLD", icon: "🌍", level: 92 },
  { label: "RPG", icon: "⚔️", level: 88 },
  { label: "LORE HUNTER", icon: "📜", level: 76 },
  { label: "COMPLETIONIST", icon: "🏆", level: 71 },
  { label: "STORY DRIVEN", icon: "📖", level: 65 },
  { label: "SOULS-LIKE", icon: "💀", level: 58 },
];

export default function GamingDNASection() {
  const sectionRef = useRef<HTMLElement>(null);
  const nodesRef = useRef<(HTMLDivElement | null)[]>([]);
  const titleRef = useRef<HTMLDivElement>(null);
  const archetypeRef = useRef<HTMLDivElement>(null);
  const [barsVisible, setBarsVisible] = useState(false);

  useEffect(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 75%",
        toggleActions: "play none none none",
        onEnter: () => setBarsVisible(true),
      },
    });

    tl.fromTo(
      titleRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }
    )
      .fromTo(
        archetypeRef.current,
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.6, ease: "power3.out" },
        "-=0.2"
      )
      .fromTo(
        nodesRef.current.filter(Boolean),
        { opacity: 0, scale: 0.8, y: 20 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: "power3.out",
        },
        "-=0.3"
      );

    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  return (
    <section ref={sectionRef} id="archive" className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Section header */}
        <div ref={titleRef} className="mb-12">
          <span className="font-[family-name:var(--font-jetbrains)] text-xs text-text-muted tracking-widest">
            // YOUR_GAMING_DNA
          </span>
          <div className="mt-1 w-full h-px bg-gradient-to-r from-border via-border to-transparent" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12 items-center">
          {/* Left — Archetype */}
          <div ref={archetypeRef} className="text-center lg:text-left">
            <span className="font-[family-name:var(--font-jetbrains)] text-xs text-text-dim uppercase tracking-widest">
              Your Archetype
            </span>
            <h2 className="font-[family-name:var(--font-press-start)] text-2xl md:text-3xl text-lime glow-lime-strong mt-3">
              THE EXPLORER
            </h2>
            <p className="font-[family-name:var(--font-jetbrains)] text-sm text-text-dim mt-4 max-w-sm mx-auto lg:mx-0">
              You seek vast horizons, hidden lore, and the satisfaction of uncovering every secret. No map marker goes unchecked.
            </p>

            {/* Archetype icon */}
            <div className="mt-6 inline-flex items-center gap-2 border border-border px-4 py-2 bg-surface">
              <span className="text-xl">🧭</span>
              <span className="font-[family-name:var(--font-press-start)] text-[8px] text-text-dim">
                ARCHETYPE // EXPLORER
              </span>
            </div>
          </div>

          {/* Right — Skill tree nodes */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {TRAITS.map((trait, i) => (
              <div
                key={trait.label}
                ref={(el) => { nodesRef.current[i] = el; }}
                className="
                  relative bg-surface border border-border p-4
                  hover:border-lime/30 hover:glow-lime-box
                  transition-all duration-300 group cursor-default
                "
              >
                {/* Icon */}
                <div className="text-xl mb-2">{trait.icon}</div>

                {/* Label */}
                <h4 className="font-[family-name:var(--font-press-start)] text-[7px] text-text leading-tight mb-3">
                  {trait.label}
                </h4>

                {/* Level bar — animates from 0 on scroll */}
                <div className="w-full h-1.5 bg-bg border border-border/50">
                  <div
                    className="h-full bg-lime/70 transition-all duration-[1200ms] ease-out"
                    style={{
                      width: barsVisible ? `${trait.level}%` : "0%",
                      transitionDelay: `${i * 100}ms`,
                    }}
                  />
                </div>
                <span className="font-[family-name:var(--font-vt323)] text-xs text-text-dim mt-1 block">
                  {trait.level}%
                </span>

                {/* Active dot */}
                <div className="absolute top-2 right-2 w-1 h-1 bg-lime rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </div>

        {/* Connecting lines decoration */}
        <div className="hidden lg:block relative mt-8">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>
      </div>
    </section>
  );
}
