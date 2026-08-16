"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  {
    icon: "📋",
    title: "LOG GAMES",
    description: "Keep a permanent record of every title you conquer.",
    code: "log.add()",
  },
  {
    icon: "✍️",
    title: "WRITE REVIEWS",
    description: "Share your unvarnished thoughts with the network.",
    code: "review.write()",
  },
  {
    icon: "🔍",
    title: "DISCOVER",
    description: "Find your next obsession through terminal data.",
    code: "db.search()",
  },
  {
    icon: "🔗",
    title: "CONNECT",
    description: "Follow archivists. Observe their journey.",
    code: "net.link()",
  },
];

export default function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const cards = cardsRef.current.filter(Boolean);

    gsap.fromTo(
      cards,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.12,
        ease: "power3.out",
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
    <section ref={sectionRef} id="discover" className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Section header */}
        <div className="mb-12">
          <span className="font-[family-name:var(--font-jetbrains)] text-xs text-text-muted tracking-widest">
            // SYSTEM_FEATURES
          </span>
          <div className="mt-1 w-full h-px bg-gradient-to-r from-border via-border to-transparent" />
        </div>

        {/* Feature cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((feature, i) => (
            <div
              key={feature.title}
              ref={(el) => { cardsRef.current[i] = el; }}
              className={`
                relative bg-surface border border-border p-6
                transition-all duration-300 group cursor-pointer
                ${hoveredIndex === i ? "border-lime/40 glow-lime-box" : ""}
              `}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Icon */}
              <div
                className={`
                  text-2xl mb-4 transition-transform duration-300
                  ${hoveredIndex === i ? "scale-110" : ""}
                `}
              >
                {feature.icon}
              </div>

              {/* Title */}
              <h3 className="font-[family-name:var(--font-press-start)] text-[10px] text-text mb-3 tracking-wide">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="font-[family-name:var(--font-jetbrains)] text-xs text-text-dim leading-relaxed">
                {feature.description}
              </p>

              {/* Terminal command on hover */}
              <div
                className={`
                  mt-4 pt-3 border-t border-border/50
                  font-[family-name:var(--font-vt323)] text-sm text-lime
                  transition-all duration-300
                  ${hoveredIndex === i ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}
                `}
              >
                &gt; {feature.code}
                <span className="animate-pulse">_</span>
              </div>

              {/* Active indicator line */}
              <div
                className={`
                  absolute bottom-0 left-0 h-[2px] bg-lime transition-all duration-300
                  ${hoveredIndex === i ? "w-full" : "w-0"}
                `}
              />

              {/* Corner markers */}
              <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 border-t border-r border-text-muted/30 group-hover:border-lime/50 transition-colors" />
              <div className="absolute bottom-1.5 left-1.5 w-1.5 h-1.5 border-b border-l border-text-muted/30 group-hover:border-lime/50 transition-colors" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
