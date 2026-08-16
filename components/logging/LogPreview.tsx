"use client";

// ============================================
// GGLOG — Log Preview Card (Logging Page)
// ============================================
// Sticky sidebar card showing a live preview
// of the diary entry as the user fills it out.
// ============================================

import type { LogGameData } from "@/app/dashboard/log/page";

type LogEntryStatus = "PLAYING" | "COMPLETED" | "DROPPED" | "REPLAYED";
type LogEntryVisibility = "PUBLIC" | "FOLLOWERS" | "PRIVATE";

interface LogPreviewProps {
  game: LogGameData;
  rating: number;
  playedAt: Date;
  status: LogEntryStatus;
  review: string;
  visibility: LogEntryVisibility;
  spoiler: boolean;
  tags: string[];
}

const MONTHS_SHORT = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];

function PreviewStars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-px">
      {[1, 2, 3, 4, 5].map((star) => {
        let fill: "full" | "half" | "empty" = "empty";
        if (rating >= star) fill = "full";
        else if (rating >= star - 0.5) fill = "half";

        return (
          <span key={star} className="relative text-sm">
            <span className="text-border">★</span>
            {fill !== "empty" && (
              <span
                className="absolute inset-0 text-lime"
                style={fill === "half" ? { clipPath: "inset(0 50% 0 0)" } : undefined}
              >
                ★
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}

function StatusBadge({ status }: { status: LogEntryStatus }) {
  const statusClass = `status-${status.toLowerCase()}`;
  return (
    <span className={`status-badge ${statusClass}`}>
      {status}
    </span>
  );
}

export default function LogPreview({
  game,
  rating,
  playedAt,
  status,
  review,
  visibility,
  spoiler,
  tags,
}: LogPreviewProps) {
  const dateStr = `${playedAt.getDate()} ${MONTHS_SHORT[playedAt.getMonth()]} ${playedAt.getFullYear()}`;

  return (
    <div className="border border-border bg-surface sticky top-20">
      {/* Header */}
      <div className="border-b border-border px-4 py-3">
        <span className="font-pixel text-[9px] text-text-muted tracking-wider">
          DIARY ENTRY PREVIEW
        </span>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Game Info */}
        <div className="flex gap-3">
          {/* Mini Cover */}
          <div className="w-12 h-16 bg-surface-lighter border border-border flex-shrink-0 overflow-hidden">
            {game.coverUrl ? (
              <img
                src={game.coverUrl.replace("t_cover_big", "t_cover_small")}
                alt={game.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="font-pixel text-[5px] text-text-muted/30">
                  {game.name.substring(0, 3)}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-pixel text-[10px] text-text tracking-wider truncate">
              {game.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={status} />
            </div>
          </div>
        </div>

        {/* Rating */}
        {rating > 0 && (
          <div className="flex items-center gap-2">
            <PreviewStars rating={rating} />
            <span className="font-mono text-[10px] text-text-dim">
              {rating}/5
            </span>
          </div>
        )}

        {/* Date */}
        <div className="font-mono text-[10px] text-text-dim tracking-wider">
          📅 {dateStr}
        </div>

        {/* Review Preview */}
        {review && (
          <div className="border-t border-border/50 pt-3">
            {spoiler && (
              <span className="font-space text-[8px] text-warning tracking-wider mb-1 block">
                ⚠ CONTAINS SPOILERS
              </span>
            )}
            <p className="font-mono text-[11px] text-text-dim leading-relaxed tracking-wide line-clamp-4">
              {review}
            </p>
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="font-space text-[7px] text-lime/60 bg-lime/5 border border-lime/10 px-1.5 py-0.5 tracking-wider"
              >
                {tag}
              </span>
            ))}
            {tags.length > 4 && (
              <span className="font-mono text-[7px] text-text-muted/40 px-1.5 py-0.5">
                +{tags.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Visibility */}
        <div className="border-t border-border/50 pt-3">
          <span className="font-mono text-[9px] text-text-muted/60 tracking-wider">
            👁️ {visibility}
          </span>
        </div>
      </div>
    </div>
  );
}
