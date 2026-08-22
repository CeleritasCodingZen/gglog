// ============================================
// GGLOG — Follow List Modal
// ============================================
// Modal dialog to view Followers or Following users
// with cursor pagination, follow/unfollow toggle,
// and full GGLOG terminal aesthetic.
// ============================================

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
import type { PublicUser } from "@/lib/types/user";
import type { PaginatedResult } from "@/lib/pagination/cursor";

export type FollowListType = "followers" | "following";

interface FollowListModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  initialType?: FollowListType;
  currentUserId?: string;
  currentUsername?: string;
}

export default function FollowListModal({
  isOpen,
  onClose,
  username,
  initialType = "followers",
  currentUserId,
  currentUsername,
}: FollowListModalProps) {
  const [activeType, setActiveType] = useState<FollowListType>(initialType);
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  // Track follow state for each user in the list: { [userId]: boolean }
  const [followState, setFollowState] = useState<Record<string, boolean>>({});
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  const modalRef = useRef<HTMLDivElement>(null);

  // Sync activeType when initialType changes upon opening
  useEffect(() => {
    if (isOpen) {
      setActiveType(initialType);
    }
  }, [isOpen, initialType]);

  // Fetch users whenever modal opens or activeType / username changes
  const fetchUsers = useCallback(async (type: FollowListType) => {
    if (!username) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<PaginatedResult<PublicUser>>(
        `/api/users/${encodeURIComponent(username)}/${type}?limit=20`
      );
      setUsers(data.items);
      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch {
      setError("FAILED TO LOAD FOLLOW GRAPH_");
      setUsers([]);
      setNextCursor(null);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    if (isOpen) {
      void fetchUsers(activeType);
    } else {
      setUsers([]);
      setNextCursor(null);
      setHasMore(false);
      setError(null);
    }
  }, [isOpen, activeType, fetchUsers]);

  // Load more with cursor pagination
  const handleLoadMore = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const data = await apiGet<PaginatedResult<PublicUser>>(
        `/api/users/${encodeURIComponent(username)}/${activeType}?limit=20&cursor=${encodeURIComponent(nextCursor)}`
      );
      setUsers((prev) => [...prev, ...data.items]);
      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch {
      setError("FAILED TO LOAD MORE PLAYERS_");
    } finally {
      setLoadingMore(false);
    }
  };

  // Follow / Unfollow mutation with optimistic UI
  const handleToggleFollow = async (targetUser: PublicUser) => {
    const isCurrentlyFollowing = followState[targetUser.id] ?? (activeType === "following" && currentUsername === username);
    const newFollowingState = !isCurrentlyFollowing;

    // Optimistic update
    setFollowState((prev) => ({ ...prev, [targetUser.id]: newFollowingState }));
    setActionLoading((prev) => ({ ...prev, [targetUser.id]: true }));

    try {
      if (newFollowingState) {
        await apiPost(`/api/users/${encodeURIComponent(targetUser.username)}/follow`);
      } else {
        await apiDelete(`/api/users/${encodeURIComponent(targetUser.username)}/follow`);
      }
    } catch {
      // Rollback on failure
      setFollowState((prev) => ({ ...prev, [targetUser.id]: isCurrentlyFollowing }));
    } finally {
      setActionLoading((prev) => ({ ...prev, [targetUser.id]: false }));
    }
  };

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center pt-[8vh] pb-10 px-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-bg/90 backdrop-blur-sm" />

      {/* Modal Box */}
      <div
        ref={modalRef}
        className="relative w-full max-w-lg border border-border bg-surface shadow-2xl flex flex-col max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="border-b border-border px-5 py-3.5 flex items-center justify-between bg-surface-light">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] text-lime/60 tracking-[0.2em]">
              // {username.toUpperCase()} //
            </span>
            <span className="font-[family-name:var(--font-press-start)] text-[10px] text-text tracking-wider">
              {activeType.toUpperCase()}
            </span>
          </div>

          <button
            onClick={onClose}
            className="font-mono text-[11px] text-text-muted hover:text-warning transition-colors"
          >
            [ESC]
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-border bg-bg/50">
          <button
            onClick={() => setActiveType("followers")}
            className={`
              flex-1 py-2.5 text-center font-[family-name:var(--font-press-start)] text-[8px] tracking-wider transition-colors
              ${activeType === "followers"
                ? "bg-lime/10 text-lime border-b-2 border-b-lime"
                : "text-text-muted hover:text-text-dim border-b-2 border-b-transparent"
              }
            `}
          >
            FOLLOWERS
          </button>
          <button
            onClick={() => setActiveType("following")}
            className={`
              flex-1 py-2.5 text-center font-[family-name:var(--font-press-start)] text-[8px] tracking-wider transition-colors
              ${activeType === "following"
                ? "bg-lime/10 text-lime border-b-2 border-b-lime"
                : "text-text-muted hover:text-text-dim border-b-2 border-b-transparent"
              }
            `}
          >
            FOLLOWING
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {/* Loading State */}
          {loading && (
            <div className="py-12 text-center">
              <span className="font-mono text-[11px] text-lime tracking-wider glow-lime cursor-blink">
                SCANNING ARCHIVE...
              </span>
              <div className="mt-3">
                <div className="w-40 h-1 bg-border mx-auto overflow-hidden">
                  <div className="w-1/2 h-full bg-lime animate-pulse" />
                </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="py-10 text-center">
              <p className="font-[family-name:var(--font-press-start)] text-[9px] text-warning tracking-wider mb-2">
                {error}
              </p>
              <button
                onClick={() => fetchUsers(activeType)}
                className="font-mono text-[10px] text-lime border border-lime/40 px-3 py-1.5 hover:bg-lime hover:text-bg transition-all mt-3 btn-press"
              >
                [ RETRY ]
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && users.length === 0 && (
            <div className="py-12 text-center border border-border/50 bg-bg/40 p-6">
              <p className="font-[family-name:var(--font-press-start)] text-[9px] text-text-muted tracking-wider mb-2">
                {activeType === "followers"
                  ? "NO FOLLOWERS FOUND_"
                  : "NOT FOLLOWING ANYONE_"}
              </p>
              <p className="font-mono text-[10px] text-text-muted/60 tracking-wider">
                {activeType === "followers"
                  ? "This archive has no incoming connections yet."
                  : "This player is not following any accounts yet."}
              </p>
            </div>
          )}

          {/* Users List */}
          {!loading && !error && users.length > 0 && (
            <div className="divide-y divide-border/40 border border-border bg-bg/60">
              {users.map((targetUser) => {
                const isSelf = targetUser.id === currentUserId || targetUser.username === currentUsername;
                const isFollowing = followState[targetUser.id] ?? (activeType === "following" && currentUsername === username);
                const isUpdating = actionLoading[targetUser.id] ?? false;

                return (
                  <div
                    key={targetUser.id}
                    className="flex items-center justify-between p-3 hover:bg-surface-light/60 transition-colors"
                  >
                    {/* User Identity */}
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Avatar initial */}
                      <div className="w-8 h-8 bg-bg border border-border flex items-center justify-center flex-shrink-0">
                        <span className="font-[family-name:var(--font-press-start)] text-[8px] text-lime/60">
                          {targetUser.username.charAt(0).toUpperCase()}
                        </span>
                      </div>

                      {/* Username + Display name */}
                      <div className="min-w-0">
                        <Link
                          href={isSelf ? "/dashboard" : `/dashboard/profile/${targetUser.username}`}
                          onClick={onClose}
                          className="font-[family-name:var(--font-press-start)] text-[8px] text-text hover:text-lime transition-colors truncate block"
                        >
                          {targetUser.username}
                        </Link>
                        {targetUser.displayName && (
                          <p className="font-mono text-[9px] text-text-muted truncate">
                            {targetUser.displayName}
                          </p>
                        )}
                        {targetUser.bio && (
                          <p className="font-mono text-[8px] text-text-muted/60 truncate max-w-xs">
                            {targetUser.bio}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action */}
                    <div className="flex-shrink-0 ml-3">
                      {isSelf ? (
                        <span className="font-mono text-[8px] text-text-muted/40 tracking-wider px-2 py-1">
                          YOU
                        </span>
                      ) : (
                        <button
                          onClick={() => handleToggleFollow(targetUser)}
                          disabled={isUpdating}
                          className={`
                            font-[family-name:var(--font-press-start)] text-[7px] tracking-wider
                            border px-2.5 py-1.5 transition-all btn-press
                            ${isFollowing
                              ? "border-lime/30 text-lime bg-lime/10"
                              : "border-border text-text-muted hover:border-lime/40 hover:text-lime"
                            }
                            disabled:opacity-50 disabled:cursor-not-allowed
                          `}
                        >
                          {isUpdating ? "..." : isFollowing ? "✓ FOLLOWING" : "+ FOLLOW"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Load More Button */}
          {!loading && hasMore && (
            <div className="pt-2 text-center">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="
                  w-full py-2.5
                  font-[family-name:var(--font-press-start)] text-[8px] tracking-wider
                  border border-border text-text-muted
                  hover:border-lime/40 hover:text-lime
                  transition-all duration-150
                  btn-press
                  disabled:opacity-50
                "
              >
                {loadingMore ? "LOADING MORE..." : "[ LOAD MORE PLAYERS ]"}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-4 py-2 flex items-center justify-between bg-surface-light">
          <span className="font-mono text-[8px] text-text-muted/40 tracking-wider">
            {users.length} {activeType.toUpperCase()} ARCHIVED
          </span>
          <span className="font-mono text-[8px] text-text-muted/40 tracking-wider">
            ESC TO CLOSE
          </span>
        </div>
      </div>
    </div>
  );
}
