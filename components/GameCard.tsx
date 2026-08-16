"use client";

import { useRef } from "react";
import Image from "next/image";

interface GameCardProps {
  title: string;
  studio: string;
  status: "COMPLETED" | "PLAYING" | "BACKLOG";
  rating: string;
  imageSrc: string;
  className?: string;
}

export default function GameCard({
  title,
  studio,
  status,
  rating,
  imageSrc,
  className = "",
}: GameCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    cardRef.current.style.transform = `
      perspective(600px)
      rotateY(${x * 8}deg)
      rotateX(${-y * 8}deg)
      scale(1.02)
    `;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = "perspective(600px) rotateY(0deg) rotateX(0deg) scale(1)";
  };

  const statusColors = {
    COMPLETED: "text-lime border-lime bg-lime/10",
    PLAYING: "text-warning border-warning bg-warning/10",
    BACKLOG: "text-text-dim border-border bg-surface",
  };

  return (
    <div
      ref={cardRef}
      className={`
        relative w-[200px] md:w-[220px]
        bg-surface border border-border
        transition-transform duration-300 ease-out
        cursor-pointer group
        ${className}
      `}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* Card image with scanline overlay */}
      <div className="relative aspect-[3/4] overflow-hidden scanline-overlay">
        <Image
          src={imageSrc}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="220px"
        />
        {/* Gradient fade */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent z-[3]" />
      </div>

      {/* Card info */}
      <div className="p-3 space-y-2">
        <h3 className="font-[family-name:var(--font-press-start)] text-[8px] text-text leading-tight">
          {title}
        </h3>
        <p className="font-[family-name:var(--font-jetbrains)] text-[10px] text-text-dim">
          {studio}
        </p>

        <div className="flex items-center justify-between pt-1">
          <span
            className={`
              font-[family-name:var(--font-press-start)] text-[6px]
              border px-2 py-1
              ${statusColors[status]}
            `}
          >
            {status}
          </span>
          <span className="font-[family-name:var(--font-press-start)] text-[8px] text-lime glow-lime">
            ★ {rating}
          </span>
        </div>
      </div>

      {/* Hover glow border */}
      <div className="absolute inset-0 border border-lime/0 group-hover:border-lime/30 transition-all duration-300 pointer-events-none" />

      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-lime/30 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-lime/30 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-lime/30 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-lime/30 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
