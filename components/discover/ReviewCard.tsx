// ============================================
// GGLOG — Discover: ReviewCard
// ============================================
// Archive-style review entry.
// Real like/unlike with optimistic UI.
// Expandable CommentSection.
// ============================================

"use client";

import { useState } from "react";
import { apiPost, apiDelete } from "@/lib/api";
import CommentSection from "./CommentSection";
import type { ReviewResponse } from "@/lib/types/review";

interface ReviewCardProps {
  review: ReviewResponse;
  currentUserId: string;
  currentUsername: string;
  index: number;
}

interface LikeResponse {
  liked: boolean;
  likeCount: number;
}

function StarDisplay({ rating }: { rating: number }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span
        key={i}
        className={i <= Math.round(rating) ? "star-filled" : "star-empty"}
      >
        ★
      </span>
    );
  }
  return (
    <span className="inline-flex gap-[1px] text-[13px] leading-none">{stars}</span>
  );
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

export default function ReviewCard({
  review,
  currentUserId,
  currentUsername,
  index,
}: ReviewCardProps) {
  const [liked, setLiked] = useState(review.hasLiked);
  const [likeCount, setLikeCount] = useState(review.likeCount);
  const [likeLoading, setLikeLoading] = useState(false);

  async function handleLike() {
    if (likeLoading) return;

    const optimisticLiked = !liked;
    const optimisticCount = likeCount + (optimisticLiked ? 1 : -1);

    // Optimistic update
    setLiked(optimisticLiked);
    setLikeCount(optimisticCount);
    setLikeLoading(true);

    try {
      if (optimisticLiked) {
        const data = await apiPost<LikeResponse>(
          `/api/reviews/${review.id}/like`
        );
        setLikeCount(data.likeCount);
      } else {
        const data = await apiDelete<LikeResponse>(
          `/api/reviews/${review.id}/like`
        );
        setLikeCount(data.likeCount);
      }
    } catch {
      // Rollback
      setLiked(!optimisticLiked);
      setLikeCount(likeCount);
    } finally {
      setLikeLoading(false);
    }
  }

  return (
    <article
      className="review-card-animate border border-border bg-surface hover:border-border-active transition-colors duration-300"
      style={{ animationDelay: `${0.15 + index * 0.1}s` }}
    >
      {/* Top lime accent */}
      <div className="h-px bg-lime/10" />

      <div className="p-5">
        {/* Author + game header */}
        <div className="mb-4">
          {/* Author */}
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-6 h-6 bg-bg border border-border flex items-center justify-center flex-shrink-0">
              <span className="font-[family-name:var(--font-press-start)] text-[6px] text-lime/50">
                {review.user.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <a
              href={`/dashboard/profile/${review.user.username}`}
              className="font-[family-name:var(--font-press-start)] text-[8px] text-lime hover:glow-lime transition-all tracking-wider"
            >
              {review.user.username}
            </a>
            <span className="font-mono text-[9px] text-text-muted tracking-wider">
              reviewed
            </span>
          </div>

          {/* Game title */}
          <p className="font-[family-name:var(--font-press-start)] text-[10px] text-text tracking-wider pl-8">
            {review.game.name}
          </p>
        </div>

        {/* Review excerpt */}
        <blockquote className="font-mono text-[11px] text-text-dim leading-relaxed tracking-wide border-l border-border/60 pl-3 mb-4 italic line-clamp-4">
          &ldquo;{review.body}&rdquo;
        </blockquote>

        {/* Footer: timestamp + like + comments + CTA */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border">
          {/* Left: controls */}
          <div className="flex items-center gap-4">
            <span className="font-mono text-[9px] text-text-muted tracking-wider">
              {timeAgo(review.createdAt)}
            </span>

            {/* Like button */}
            <button
              onClick={handleLike}
              disabled={likeLoading}
              className={`
                font-mono text-[11px] tracking-wider
                transition-colors duration-150
                disabled:opacity-50
                ${liked ? "text-lime" : "text-text-muted hover:text-lime"}
              `}
              title={liked ? "Unlike" : "Like"}
            >
              {liked ? "♥" : "♡"} {likeCount}
            </button>

            {/* Comment toggle */}
            <CommentSection
              reviewId={review.id}
              initialCommentCount={review.commentCount}
              currentUserId={currentUserId}
              currentUsername={currentUsername}
            />
          </div>

          {/* Right: read full */}
          {review.logEntryId && (
            <a
              href={`/dashboard/diary`}
              id={`review-read-${review.id}`}
              className="
                font-[family-name:var(--font-press-start)] text-[7px] tracking-wider
                border border-border text-text-muted
                px-3 py-1.5
                hover:border-lime/40 hover:text-lime
                transition-all duration-200
                btn-press
              "
            >
              [ READ ]
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
