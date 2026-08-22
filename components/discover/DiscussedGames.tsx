// ============================================
// GGLOG — Discover: DiscussedGames
// ============================================
// Compact sidebar list of currently discussed games.
// ============================================

"use client";

import { useState } from "react";
import type { DiscoverGame } from "@/data/mockDiscover";

interface DiscussedGamesProps {
  games: DiscoverGame[];
}

export default function DiscussedGames({ games }: DiscussedGamesProps) {
  const [activeGame, setActiveGame] = useState<string | null>(null);

  return (
    <div className="border border-border bg-surface">
      {/* Panel header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <span className="font-mono text-[8px] text-lime/50 tracking-[0.2em]">
          // CURRENTLY DISCUSSED
        </span>
      </div>

      {/* Game list */}
      <div className="divide-y divide-border">
        {games.map((game, index) => (
          <a
            key={game.id}
            href={game.gameUrl}
            id={`discussed-game-${game.id}`}
            onMouseEnter={() => setActiveGame(game.id)}
            onMouseLeave={() => setActiveGame(null)}
            className={`
              flex items-center justify-between px-4 py-2.5
              transition-colors duration-150 cursor-pointer
              ${activeGame === game.id ? "bg-surface-light" : ""}
              group
            `}
          >
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-[8px] text-text-muted/25 w-3 flex-shrink-0">
                {index + 1}
              </span>
              <span
                className={`
                  font-[family-name:var(--font-press-start)] text-[7px] tracking-wider transition-colors duration-150
                  ${activeGame === game.id ? "text-lime" : "text-text-dim"}
                `}
              >
                {game.title}
              </span>
            </div>
            <span className="font-mono text-[8px] text-text-muted tracking-wider flex-shrink-0">
              {game.reviewCount} REV
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
