// ============================================
// GGLOG — Discover: PlayerGrid
// ============================================
// Grid of PlayerCard components.
// Handles loading, empty, and error states.
// ============================================

"use client";

import PlayerCard from "./PlayerCard";
import type { SearchUserResult } from "@/lib/services/userService";

interface PlayerGridProps {
  users: SearchUserResult[];
  currentUserId: string;
  searchQuery?: string;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
}

export default function PlayerGrid({
  users,
  currentUserId,
  searchQuery,
  isLoading,
  error,
  onRetry,
  hasMore,
  loadingMore,
  onLoadMore,
}: PlayerGridProps) {
  return (
    <section>
      {/* Section heading */}
      <div className="flex items-center gap-3 mb-5">
        <h2 className="font-[family-name:var(--font-press-start)] text-[11px] text-text tracking-wider">
          PLAYERS WORTH KNOWING_
        </h2>
        <div className="flex-1 h-px bg-border" />
        {!isLoading && !error && (
          <span className="font-mono text-[9px] text-text-muted tracking-wider">
            [{users.length}]
          </span>
        )}
      </div>

      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <div className="border border-border bg-surface/40 p-8 text-center">
          <p className="font-[family-name:var(--font-press-start)] text-[9px] text-warning tracking-wider mb-2">
            {error}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="font-mono text-[10px] text-lime border border-lime/40 px-3 py-1.5 hover:bg-lime hover:text-bg transition-all mt-2 btn-press"
            >
              [ RETRY ]
            </button>
          )}
        </div>
      ) : users.length === 0 ? (
        <NoResults query={searchQuery} type="PLAYERS" />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {users.map((user, index) => (
              <PlayerCard
                key={user.id}
                user={user}
                currentUserId={currentUserId}
                index={index}
              />
            ))}
          </div>

          {/* Load More */}
          {hasMore && onLoadMore && (
            <div className="mt-6 text-center">
              <button
                onClick={onLoadMore}
                disabled={loadingMore}
                className="
                  font-[family-name:var(--font-press-start)] text-[8px] tracking-wider
                  border border-border text-text-muted
                  px-6 py-2.5
                  hover:border-lime/40 hover:text-lime
                  transition-all duration-200
                  btn-press
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                {loadingMore ? "LOADING..." : "[ LOAD MORE PLAYERS ]"}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

function LoadingState() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="border border-border bg-surface/50 p-4 animate-pulse"
          style={{ height: "180px" }}
        />
      ))}
    </div>
  );
}

function NoResults({ query, type }: { query?: string; type: string }) {
  return (
    <div className="border border-border bg-surface/40 p-8 text-center">
      <p className="font-[family-name:var(--font-press-start)] text-[9px] text-text-muted tracking-wider mb-3">
        {query ? "NO RECORDS FOUND_" : "NO PLAYERS FOUND_"}
      </p>
      <p className="font-mono text-[11px] text-text-muted/60 tracking-wider">
        {query ? `No ${type.toLowerCase()} matching:` : "The player archive has no records matching this query."}
      </p>
      {query && (
        <p className="font-mono text-[11px] text-text-dim/60 tracking-wider mt-1">
          &quot;{query}&quot;
        </p>
      )}
    </div>
  );
}
