// ============================================
// GGLOG — Discover: FollowingFeed
// ============================================
// Social activity feed from followed users.
// Shows LOGGED_GAME, REVIEWED_GAME, CREATED_LIST,
// FOLLOWED_USER events.
// Data from GET /api/activity/feed
// ============================================

"use client";

import type { FeedItem } from "@/lib/types/feed";

interface FollowingFeedProps {
  items: FeedItem[];
  isLoading?: boolean;
}

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(isoString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function activityVerb(type: FeedItem["type"]): string {
  switch (type) {
    case "LOGGED_GAME":
      return "logged";
    case "REVIEWED_GAME":
      return "reviewed";
    case "CREATED_LIST":
      return "created list";
    case "FOLLOWED_USER":
      return "followed someone";
    default:
      return "did something";
  }
}

function FeedEntry({ item }: { item: FeedItem }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border/50 last:border-b-0">
      {/* Avatar */}
      <div className="w-7 h-7 bg-bg border border-border flex items-center justify-center flex-shrink-0">
        <span className="font-[family-name:var(--font-press-start)] text-[7px] text-lime/50">
          {item.actor.username.charAt(0).toUpperCase()}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-baseline gap-1.5 mb-1">
          <a
            href={`/dashboard/profile/${item.actor.username}`}
            className="font-[family-name:var(--font-press-start)] text-[8px] text-lime hover:glow-lime transition-all tracking-wider"
          >
            {item.actor.username}
          </a>
          <span className="font-mono text-[9px] text-text-muted tracking-wider">
            {activityVerb(item.type)}
          </span>
          {item.game && (
            <span className="font-[family-name:var(--font-press-start)] text-[8px] text-text tracking-wider truncate max-w-[200px]">
              {item.game.name}
            </span>
          )}
          {item.list && (
            <span className="font-[family-name:var(--font-press-start)] text-[8px] text-text tracking-wider truncate max-w-[200px]">
              {item.list.title}
            </span>
          )}
        </div>

        {/* Review excerpt if present */}
        {item.review && !item.review.spoiler && (
          <p className="font-mono text-[9px] text-text-muted/60 tracking-wide leading-relaxed italic line-clamp-2">
            &ldquo;{item.review.body}&rdquo;
          </p>
        )}
        {item.review?.spoiler && (
          <p className="font-mono text-[9px] text-warning/40 tracking-wider">
            [ SPOILER — HIDDEN ]
          </p>
        )}

        <span className="font-mono text-[8px] text-text-muted/30 tracking-wider">
          {timeAgo(item.createdAt)}
        </span>
      </div>
    </div>
  );
}

export default function FollowingFeed({ items, isLoading }: FollowingFeedProps) {
  return (
    <section>
      {/* Section heading */}
      <div className="flex items-center gap-3 mb-5">
        <h2 className="font-[family-name:var(--font-press-start)] text-[11px] text-text tracking-wider">
          FOLLOWING FEED_
        </h2>
        <div className="flex-1 h-px bg-border" />
      </div>

      {isLoading ? (
        <div className="border border-border bg-surface/50 p-8 animate-pulse" style={{ height: "200px" }} />
      ) : items.length === 0 ? (
        <div className="border border-border bg-surface/40 p-8 text-center">
          <p className="font-[family-name:var(--font-press-start)] text-[9px] text-text-muted tracking-wider mb-3">
            FOLLOW GRAPH EMPTY_
          </p>
          <p className="font-mono text-[11px] text-text-muted/60 tracking-wide leading-relaxed">
            Follow players to populate your archive feed.
          </p>
        </div>
      ) : (
        <div className="border border-border bg-surface px-4">
          {items.map((item) => (
            <FeedEntry key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}
