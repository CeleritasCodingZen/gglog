// ============================================
// GGLOG — Discover: ReviewFeed
// ============================================
// Feed of ReviewCards using real ReviewResponse data.
// ============================================

"use client";

import ReviewCard from "./ReviewCard";
import type { ReviewResponse } from "@/lib/types/review";

interface ReviewFeedProps {
  reviews: ReviewResponse[];
  currentUserId: string;
  currentUsername: string;
  searchQuery?: string;
  isLoading?: boolean;
  sectionTitle?: string;
}

export default function ReviewFeed({
  reviews,
  currentUserId,
  currentUsername,
  searchQuery,
  isLoading,
  sectionTitle = "RECENTLY ARCHIVED REVIEWS_",
}: ReviewFeedProps) {
  return (
    <section>
      {/* Section heading */}
      <div className="flex items-center gap-3 mb-5">
        <h2 className="font-[family-name:var(--font-press-start)] text-[11px] text-text tracking-wider">
          {sectionTitle}
        </h2>
        <div className="flex-1 h-px bg-border" />
        {!isLoading && (
          <span className="font-mono text-[9px] text-text-muted tracking-wider">
            [{reviews.length}]
          </span>
        )}
      </div>

      {isLoading ? (
        <LoadingState />
      ) : reviews.length === 0 ? (
        <NoResults query={searchQuery} />
      ) : (
        <div className="space-y-3">
          {reviews.map((review, index) => (
            <ReviewCard
              key={review.id}
              review={review}
              currentUserId={currentUserId}
              currentUsername={currentUsername}
              index={index}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function LoadingState() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="border border-border bg-surface/50 p-5 animate-pulse"
          style={{ height: "160px" }}
        />
      ))}
    </div>
  );
}

function NoResults({ query }: { query?: string }) {
  return (
    <div className="border border-border bg-surface/40 p-8 text-center">
      <p className="font-[family-name:var(--font-press-start)] text-[9px] text-text-muted tracking-wider mb-3">
        NO REVIEWS FOUND_
      </p>
      {query && (
        <p className="font-mono text-[11px] text-text-dim/60 tracking-wider mt-1">
          &quot;{query}&quot;
        </p>
      )}
    </div>
  );
}
