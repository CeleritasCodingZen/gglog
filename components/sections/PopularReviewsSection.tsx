"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";

gsap.registerPlugin(ScrollTrigger);

const REVIEWS = [
  {
    game: "ELDEN RING",
    studio: "FromSoftware",
    image: "/images/elden-ring.png",
    rating: 10,
    reviewer: "ALEX",
    date: "MAR 2026",
    excerpt:
      "A masterpiece that redefines open-world design. Every corner rewards curiosity. The Lands Between will haunt you long after the credits roll.",
    tags: ["OPEN WORLD", "RPG", "SOULS-LIKE"],
    hoursPlayed: 127,
    status: "COMPLETED" as const,
  },
  {
    game: "CYBERPUNK 2077",
    studio: "CD Projekt Red",
    image: "/images/cyberpunk-2077.png",
    rating: 8,
    reviewer: "SOUNAVA",
    date: "FEB 2026",
    excerpt:
      "Night City is a technical marvel. The story hits hard, the characters stay with you. Phantom Liberty elevated the entire experience.",
    tags: ["RPG", "OPEN WORLD", "SCI-FI"],
    hoursPlayed: 89,
    status: "COMPLETED" as const,
  },
  {
    game: "HOLLOW KNIGHT",
    studio: "Team Cherry",
    image: "/images/hollow-knight.png",
    rating: 9,
    reviewer: "MAYA",
    date: "JAN 2026",
    excerpt:
      "Hallownest is one of the most atmospheric worlds in gaming. The difficulty is demanding but fair. A metroidvania benchmark.",
    tags: ["METROIDVANIA", "INDIE", "EXPLORATION"],
    hoursPlayed: 62,
    status: "COMPLETED" as const,
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 10 }, (_, i) => (
        <span
          key={i}
          className={`text-[10px] ${i < rating ? "text-warning" : "text-border"}`}
        >
          ★
        </span>
      ))}
      <span className="font-[family-name:var(--font-press-start)] text-[9px] text-lime glow-lime ml-2">
        {rating}/10
      </span>
    </div>
  );
}

export default function PopularReviewsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const cards = cardsRef.current.filter(Boolean);

    gsap.fromTo(
      cards,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.15,
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
    <section ref={sectionRef} id="community" className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Section header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <span className="font-[family-name:var(--font-jetbrains)] text-xs text-text-muted tracking-widest">
              // POPULAR_REVIEWS
            </span>
            <div className="mt-1 w-64 h-px bg-gradient-to-r from-border to-transparent" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse" />
            <span className="font-[family-name:var(--font-press-start)] text-[8px] text-text-muted">
              TRENDING
            </span>
          </div>
        </div>

        {/* Reviews */}
        <div className="space-y-4">
          {REVIEWS.map((review, i) => (
            <div
              key={review.game}
              ref={(el) => { cardsRef.current[i] = el; }}
              className="
                group bg-surface border border-border
                hover:border-border-active
                transition-all duration-300 cursor-pointer
                overflow-hidden
              "
            >
              <div className="flex flex-col md:flex-row">
                {/* Image */}
                <div className="relative w-full md:w-48 lg:w-56 h-48 md:h-auto shrink-0 scanline-overlay overflow-hidden">
                  <Image
                    src={review.image}
                    alt={review.game}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 224px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-surface z-[3] hidden md:block" />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent z-[3] md:hidden" />
                </div>

                {/* Content */}
                <div className="flex-1 p-5 md:p-6 flex flex-col justify-between min-w-0">
                  <div>
                    {/* Top row: game + rating */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                      <div>
                        <h3 className="font-[family-name:var(--font-press-start)] text-xs md:text-sm text-text group-hover:text-lime transition-colors duration-300">
                          {review.game}
                        </h3>
                        <p className="font-[family-name:var(--font-jetbrains)] text-[11px] text-text-dim mt-1">
                          {review.studio}
                        </p>
                      </div>
                      <StarRating rating={review.rating} />
                    </div>

                    {/* Excerpt */}
                    <p className="font-[family-name:var(--font-jetbrains)] text-sm text-text-dim leading-relaxed mb-4 line-clamp-2">
                      &ldquo;{review.excerpt}&rdquo;
                    </p>
                  </div>

                  {/* Bottom row: tags + meta */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {review.tags.map((tag) => (
                        <span
                          key={tag}
                          className="font-[family-name:var(--font-press-start)] text-[6px] text-text-muted border border-border px-2 py-1 tracking-wider"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="font-[family-name:var(--font-jetbrains)] text-[10px] text-text-muted">
                        {review.hoursPlayed}h played
                      </span>
                      <span className="font-[family-name:var(--font-jetbrains)] text-[10px] text-text-muted">
                        by <span className="text-text">{review.reviewer}</span>
                      </span>
                      <span className="font-[family-name:var(--font-jetbrains)] text-[10px] text-text-muted">
                        {review.date}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom active line on hover */}
              <div className="h-px w-0 group-hover:w-full bg-lime/40 transition-all duration-500" />
            </div>
          ))}
        </div>

        {/* View all link */}
        <div className="mt-8 text-center">
          <a
            href="#"
            className="
              inline-flex items-center gap-2
              font-[family-name:var(--font-press-start)] text-[9px] text-text-dim
              border border-border px-5 py-3
              hover:border-lime hover:text-lime
              transition-all duration-300 btn-press
            "
          >
            VIEW ALL REVIEWS &gt;
          </a>
        </div>
      </div>
    </section>
  );
}
