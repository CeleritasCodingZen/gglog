"use client";

// ============================================
// GGLOG — Diary Timeline
// ============================================
// Vertical timeline rendering diary entries with
// date headers and connecting line.
// ============================================

import type { DiaryEntry } from "@/data/mockDiary";
import type { DiaryEntryResponse } from "@/lib/types";
import DiaryCard from "./DiaryCard";

interface DiaryTimelineProps {
  entries: (DiaryEntry | DiaryEntryResponse)[];
}

function isApiEntry(entry: any): entry is DiaryEntryResponse {
  return entry && entry.game && typeof entry.game.name === "string";
}

function mapApiToDiaryEntry(apiEntry: DiaryEntryResponse): DiaryEntry {
  const playedAtStr = apiEntry.playedAt
    ? apiEntry.playedAt.split("T")[0]
    : new Date(apiEntry.createdAt).toISOString().split("T")[0];

  return {
    id: apiEntry.id,
    game: {
      title: apiEntry.game.name,
      coverPlaceholder: !apiEntry.game.coverUrl,
      coverUrl: apiEntry.game.coverUrl ?? undefined,
    },
    status: apiEntry.status as any,
    rating: apiEntry.rating ?? 0,
    platform: apiEntry.game.platforms && apiEntry.game.platforms.length > 0
      ? apiEntry.game.platforms[0].name.toUpperCase()
      : "UNKNOWN",
    playtime: "N/A",
    playedAt: playedAtStr,
    sysTime: new Date(apiEntry.createdAt).toTimeString().split(" ")[0],
    description: apiEntry.review?.body ?? "Logged without a review.",
    tags: apiEntry.tags || [],
  };
}

function formatDate(isoDate: string): string {
  const d = new Date(isoDate);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}

export default function DiaryTimeline({ entries }: DiaryTimelineProps) {
  return (
    <div className="diary-timeline">
      {entries.map((item, index) => {
        const entry = isApiEntry(item) ? mapApiToDiaryEntry(item) : item;
        return (
          <div key={entry.id} className="relative mb-8 last:mb-0">
            {/* Timeline dot */}
            <div
              className={`diary-timeline-dot ${
                entry.status === "COMPLETED" || entry.status === "PLAYING"
                  ? "active"
                  : ""
              }`}
            />

            {/* Date Header */}
            <div className="flex items-center gap-4 mb-3 font-mono text-[11px] tracking-wider">
              <span className="text-text-dim">
                LOG_DATE: {formatDate(entry.playedAt)}
              </span>
              <span className="text-text-muted/40">—</span>
              <span className="text-text-muted/40">
                SYS_TIME: {entry.sysTime}
              </span>
            </div>

            {/* Card */}
            <DiaryCard entry={entry} index={index} />
          </div>
        );
      })}
    </div>
  );
}
