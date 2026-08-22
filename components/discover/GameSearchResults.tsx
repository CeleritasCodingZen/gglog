// ============================================
// GGLOG — Discover: GameSearchResults
// ============================================
// Results panel for the GAMES search tab.
// Shows compact game records with review counts.
// ============================================

"use client";

import type { DiscoverGame } from "@/data/mockDiscover";

interface GameSearchResultsProps {
  games: DiscoverGame[];
  searchQuery?: string;
}

export default function GameSearchResults({ games, searchQuery }: GameSearchResultsProps) {
  return (
    <section>
      {/* Section heading */}
      <div className="flex items-center gap-3 mb-5">
        <h2 className="font-[family-name:var(--font-press-start)] text-[11px] text-text tracking-wider">
          GAME ARCHIVE_
        </h2>
        <div className="flex-1 h-px bg-border" />
        <span className="font-mono text-[9px] text-text-muted tracking-wider">
          [{games.length}]
        </span>
      </div>

      {games.length === 0 ? (
        <div className="border border-border bg-surface/40 p-8 text-center">
          <p className="font-[family-name:var(--font-press-start)] text-[9px] text-text-muted tracking-wider mb-3">
            NO RECORDS FOUND_
          </p>
          <p className="font-mono text-[11px] text-text-muted/60 tracking-wider">
            No games matching:
          </p>
          {searchQuery && (
            <p className="font-mono text-[11px] text-text-dim/60 tracking-wider mt-1">
              &quot;{searchQuery}&quot;
            </p>
          )}
        </div>
      ) : (
        <div className="border border-border bg-surface divide-y divide-border">
          {games.map((game, index) => (
            <a
              key={game.id}
              href={game.gameUrl}
              id={`game-result-${game.id}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-surface-light transition-colors duration-150 group"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-[8px] text-text-muted/30 tracking-wider w-5 text-right flex-shrink-0">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="font-[family-name:var(--font-press-start)] text-[8px] text-text tracking-wider group-hover:text-lime transition-colors duration-200">
                  {game.title}
                </span>
              </div>
              <span className="font-mono text-[9px] text-text-muted tracking-wider flex-shrink-0">
                {game.reviewCount} REV
              </span>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
