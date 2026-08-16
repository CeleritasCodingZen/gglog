"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import GameCard from "../GameCard";

const GAMES = [
  {
    title: "ELDEN RING",
    studio: "FromSoftware",
    status: "COMPLETED" as const,
    rating: "10/10",
    imageSrc: "/images/elden.png",
  },
  {
    title: "CYBERPUNK 2077",
    studio: "CD Projekt Red",
    status: "PLAYING" as const,
    rating: "7/10",
    imageSrc: "/images/cyberpunk.png",
  },
  {
    title: "HOLLOW KNIGHT",
    studio: "Team Cherry",
    status: "BACKLOG" as const,
    rating: "—",
    imageSrc: "/images/hollow.png",
  },
];

export default function GameCardStack() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // Infinite floating animation for each card
    cardsRef.current.forEach((card, i) => {
      if (!card) return;

      gsap.to(card, {
        y: `+=${8 + i * 3}`,
        duration: 3 + i * 0.5,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: i * 0.8,
      });

      gsap.to(card, {
        rotateZ: (i % 2 === 0 ? 1 : -1) * 1.5,
        duration: 4 + i * 0.5,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: i * 0.3,
      });
    });

    return () => {
      cardsRef.current.forEach((card) => {
        if (card) gsap.killTweensOf(card);
      });
    };
  }, []);

  // Parallax on mouse
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        const depth = (i + 1) * 4;
        gsap.to(card, {
          x: x * depth,
          rotateY: x * 3,
          duration: 0.6,
          ease: "power2.out",
          overwrite: "auto",
        });
      });
    };

    const container = containerRef.current;
    container?.addEventListener("mousemove", handleMouseMove);
    return () => container?.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[420px] md:h-[500px] flex items-center justify-center"
      style={{ perspective: "800px" }}
    >
      {GAMES.map((game, i) => {
        // Stagger cards with offset positions
        const positions = [
          { top: "10%", left: "5%", zIndex: 3 },
          { top: "20%", left: "35%", zIndex: 2 },
          { top: "5%", left: "55%", zIndex: 1 },
        ];

        const pos = positions[i];
        return (
          <div
            key={game.title}
            ref={(el) => { cardsRef.current[i] = el; }}
            className="absolute"
            style={{
              top: pos.top,
              left: pos.left,
              zIndex: pos.zIndex,
            }}
          >
            <GameCard {...game} />
          </div>
        );
      })}

      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-lime/5 blur-3xl pointer-events-none" />
    </div>
  );
}
