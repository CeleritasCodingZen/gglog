// ============================================
// GGLOG — Discover: ReviewSpotlight
// ============================================
// Large featured review section — typography focused.
// Supports both real ReviewResponse and mock data.
// ============================================

"use client";

import type { ReviewResponse } from "@/lib/types/review";
import type { DiscoverReview } from "@/data/mockDiscover";

interface ReviewSpotlightProps {
  review: ReviewResponse | DiscoverReview;
  currentUserId?: string;
  currentUsername?: string;
}

function StarDisplay({ rating }: { rating: number }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars.push(<span key={i} className="star-filled">★</span>);
    } else if (rating >= i - 0.5) {
      stars.push(<span key={i} className="text-lime/50">★</span>);
    } else {
      stars.push(<span key={i} className="star-empty">★</span>);
    }
  }
  return (
    <span className="inline-flex gap-[2px] text-[16px] leading-none">
      {stars}
    </span>
  );
}

export default function ReviewSpotlight({ review }: ReviewSpotlightProps) {
  const gameTitle =
    "game" in review && typeof review.game === "object" && review.game !== null
      ? review.game.name
      : typeof (review as DiscoverReview).game === "string"
        ? (review as DiscoverReview).game
        : "FEATURED GAME";

  const authorUsername =
    "user" in review && review.user
      ? review.user.username
      : "author" in review && review.author
        ? (review as DiscoverReview).author.username
        : "ARCHIVIST";

  const authorProfileUrl =
    "user" in review && review.user
      ? `/dashboard/profile/${review.user.username}`
      : "author" in review && review.author
        ? (review as DiscoverReview).author.profileUrl
        : "/dashboard";

  const bodyText =
    "body" in review && typeof review.body === "string"
      ? review.body
      : "excerpt" in review && typeof (review as DiscoverReview).excerpt === "string"
        ? (review as DiscoverReview).excerpt
        : "";

  const reviewUrl =
    "logEntryId" in review && review.logEntryId
      ? "/dashboard/diary"
      : "reviewUrl" in review
        ? (review as DiscoverReview).reviewUrl
        : "/dashboard/diary";

  const rating =
    "rating" in review && typeof (review as any).rating === "number"
      ? (review as any).rating
      : 5;

  return (
    <section>
      {/* Section heading */}
      <div className="flex items-center gap-3 mb-5">
        <h2 className="font-mono text-[9px] text-lime/50 tracking-[0.2em]">
          // REVIEW SPOTLIGHT
        </h2>
        <div className="flex-1 h-px bg-border" />
      </div>

      <div className="border border-border bg-surface relative overflow-hidden">
        {/* Left lime accent bar */}
        <div className="absolute left-0 top-0 bottom-0 w-px bg-lime/30" />

        <div className="pl-6 pr-5 py-6">
          {/* Game title */}
          <p className="font-[family-name:var(--font-press-start)] text-[11px] text-lime glow-lime tracking-wider mb-1">
            {gameTitle}
          </p>

          {/* Author */}
          <div className="flex items-center gap-2 mb-4">
            <span className="font-mono text-[10px] text-text-muted tracking-wider">
              reviewed by
            </span>
            <a
              href={authorProfileUrl}
              className="font-[family-name:var(--font-press-start)] text-[8px] text-text hover:text-lime transition-colors tracking-wider"
            >
              {authorUsername}
            </a>
          </div>

          {/* Stars */}
          <div className="mb-5">
            <StarDisplay rating={rating} />
          </div>

          {/* Large excerpt */}
          <blockquote className="font-mono text-[12px] text-text-dim leading-[1.9] tracking-wide max-w-2xl mb-6">
            &ldquo;{bodyText}&rdquo;
          </blockquote>

          {/* Actions */}
          <div className="flex items-center gap-3 flex-wrap">
            <a
              href={reviewUrl}
              id="spotlight-read-full"
              className="
                font-[family-name:var(--font-press-start)] text-[8px] tracking-wider
                bg-lime text-bg border border-lime
                px-4 py-2
                hover:bg-transparent hover:text-lime
                transition-all duration-200
                btn-press
              "
            >
              [ READ FULL REVIEW ]
            </a>
            <a
              href={authorProfileUrl}
              id="spotlight-view-player"
              className="
                font-[family-name:var(--font-press-start)] text-[8px] tracking-wider
                border border-border text-text-muted
                px-4 py-2
                hover:border-border-active hover:text-text
                transition-all duration-200
                btn-press
              "
            >
              [ VIEW PLAYER ]
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
