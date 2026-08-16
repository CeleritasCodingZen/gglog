"use client";

// ============================================
// GGLOG — Game Header (Logging Page)
// ============================================
// Displays the selected game with cover image,
// title, developer, year, genres, and change button.
// ============================================

import type { LogGameData } from "@/app/dashboard/log/page";

interface GameHeaderProps {
  game: LogGameData;
  onChangeGame: () => void;
}

export default function GameHeader({ game, onChangeGame }: GameHeaderProps) {
  const releaseYear = game.releaseDate
    ? new Date(game.releaseDate).getFullYear()
    : null;

  return (
    <section className="log-section">
      {/* Section Label */}
      <div className="flex items-center gap-2 mb-5">
        <span className="font-mono text-[11px] text-lime/60 tracking-wider">
          &gt;&gt;
        </span>
        <span className="font-pixel text-[9px] text-text-muted tracking-wider">
          INITIATING DIARY ENTRY
        </span>
      </div>

      <div className="flex gap-5">
        {/* Cover Image */}
        <div className="log-cover-placeholder w-[100px] h-[130px] md:w-[120px] md:h-[155px] flex-shrink-0 relative overflow-hidden">
          {game.coverUrl ? (
            <img
              src={game.coverUrl}
              alt={game.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 z-[2]">
              <span className="font-pixel text-[6px] text-text-muted/30 tracking-widest">
                COVER
              </span>
              <span className="font-pixel text-[5px] text-text-muted/20 tracking-wider">
                {game.name.substring(0, 8)}
              </span>
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-[3] pointer-events-none" />
        </div>

        {/* Game Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <h1 className="font-pixel text-base md:text-lg text-text tracking-wider leading-tight glow-lime mb-3">
            {game.name}
          </h1>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {releaseYear && (
              <>
                <span className="font-space text-[11px] text-text-dim tracking-wider">
                  {releaseYear}
                </span>
                <span className="font-mono text-[8px] text-text-muted">›</span>
              </>
            )}
            <span className="font-space text-[11px] text-text-dim tracking-wider">
              {game.genres.map((g) => g.name).join(" / ")}
            </span>
          </div>

          {/* Summary (truncated) */}
          {game.summary && (
            <p className="font-mono text-[10px] text-text-muted/60 leading-relaxed tracking-wide line-clamp-2 mb-3">
              {game.summary}
            </p>
          )}

          {/* Change Game */}
          <button
            onClick={onChangeGame}
            className="
              inline-flex items-center gap-1.5
              font-pixel text-[8px] text-text-dim
              border border-border hover:border-lime hover:text-lime
              px-3 py-2
              transition-all duration-200
              btn-press self-start
            "
          >
            ↻ CHANGE GAME
          </button>
        </div>
      </div>
    </section>
  );
}
