"use client";

// ============================================
// GGLOG — Diary Card
// ============================================
// Individual diary entry card with game placeholder,
// status badge, rating, and description.
// ============================================

import type { DiaryEntry, GameStatus } from "@/data/mockDiary";

interface DiaryCardProps {
  entry: DiaryEntry;
  index: number;
}

function StatusBadge({ status }: { status: GameStatus }) {
  const statusClass = `status-${status.toLowerCase()}`;
  return (
    <span className={`status-badge ${statusClass}`}>
      {status.replace("_", " ")}
    </span>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="star-rating" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= rating ? "star-filled" : "star-empty"}>
          ★
        </span>
      ))}
    </span>
  );
}

export default function DiaryCard({ entry, index }: DiaryCardProps) {
  return (
    <div
      className="diary-entry-animate bg-surface border border-border hover:border-border-active transition-colors duration-300"
      style={{ animationDelay: `${0.15 + index * 0.12}s` }}
    >
      <div className="flex flex-col sm:flex-row gap-0">
        {/* ── Game Image Placeholder ── */}
        <div className="diary-img-placeholder w-full sm:w-[160px] h-[100px] sm:h-auto flex-shrink-0 relative">
          {entry.game.coverUrl && (
            <img
              src={entry.game.coverUrl}
              alt={entry.game.title}
              className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-luminosity z-0"
            />
          )}
          <span className="font-mono text-[7px] text-text-muted/30 tracking-wider z-10 relative uppercase">
            VOID LOG: ENTR_//{ index + 1}
          </span>
          <span className="font-mono text-[8px] text-text-muted/20 tracking-wider z-10 relative uppercase">
            {entry.game.title.split(":")[0]?.substring(0, 18)}
          </span>
        </div>

        {/* ── Content ── */}
        <div className="flex-1 p-4 sm:p-5 min-w-0">
          {/* Title Row */}
          <div className="flex flex-wrap items-start gap-2 mb-2">
            <StatusBadge status={entry.status} />
            <h3 className="font-pixel text-[10px] md:text-[11px] text-text tracking-wider leading-relaxed">
              {entry.game.title}
            </h3>
          </div>

          {/* Meta Row */}
          <div className="flex flex-wrap items-center gap-2 mb-3 font-space text-[10px] text-text-dim tracking-wider">
            <StarRating rating={entry.rating} />
            <span className="text-text-muted">|</span>
            <span>PLATFORM: {entry.platform}</span>
            <span className="text-text-muted">|</span>
            <span>PLAYTIME: {entry.playtime}</span>
          </div>

          {/* Description */}
          <p className="font-mono text-[12px] text-text-dim leading-relaxed tracking-wide line-clamp-4">
            {entry.description}
          </p>

          {/* Tags */}
          {entry.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {entry.tags.map((tag) => (
                <span
                  key={tag}
                  className="font-space text-[9px] text-lime/70 bg-lime/5 border border-lime/15 px-2 py-1 tracking-wider uppercase"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
