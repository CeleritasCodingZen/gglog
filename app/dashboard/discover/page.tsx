// ============================================
// GGLOG — Dashboard: Discover Page
// ============================================
// Authenticated social discovery page.
// Protected by ProtectedRoute.
//
// Data flow:
//   PEOPLE tab    → /api/users/search?q=
//   REVIEWS tab   → /api/reviews/discover
//   FOLLOWING tab  → /api/activity/feed
//
// All data via real API calls with cursor pagination.
// ============================================

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import ProtectedRoute from "@/components/providers/ProtectedRoute";
import { useAuth } from "@/components/providers/AuthContext";
import { apiGet } from "@/lib/api";

// Layout components
import DiscoverNavbar from "@/components/discover/DiscoverNavbar";
import DiscoverHeader from "@/components/discover/DiscoverHeader";
import DiscoverSearch, { type SearchTab } from "@/components/discover/DiscoverSearch";
import PlayerGrid from "@/components/discover/PlayerGrid";
import ReviewFeed from "@/components/discover/ReviewFeed";
import ReviewSpotlight from "@/components/discover/ReviewSpotlight";
import FollowingFeed from "@/components/discover/FollowingFeed";
import SystemNote from "@/components/discover/SystemNote";
import Footer from "@/components/Footer";

// Types
import type { SearchUserResult } from "@/lib/services/userService";
import type { ReviewResponse } from "@/lib/types/review";
import type { FeedItem } from "@/lib/types/feed";
import type { PaginatedResult } from "@/lib/pagination/cursor";

import "./discover.css";

// ─────────────────────────────────────────────
// Inner page — uses auth context
// ─────────────────────────────────────────────

function DiscoverContent() {
  const { user } = useAuth();

  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<SearchTab>("PEOPLE");

  // PEOPLE data
  const [users, setUsers] = useState<SearchUserResult[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [usersNextCursor, setUsersNextCursor] = useState<string | null>(null);
  const [usersHasMore, setUsersHasMore] = useState(false);
  const [usersLoadingMore, setUsersLoadingMore] = useState(false);

  // REVIEWS data (community discover feed)
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsNextCursor, setReviewsNextCursor] = useState<string | null>(null);
  const [reviewsHasMore, setReviewsHasMore] = useState(false);
  const [reviewsLoadingMore, setReviewsLoadingMore] = useState(false);

  // FOLLOWING activity feed
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [feedNextCursor, setFeedNextCursor] = useState<string | null>(null);
  const [feedHasMore, setFeedHasMore] = useState(false);
  const [feedLoadingMore, setFeedLoadingMore] = useState(false);

  // Prevent duplicate loads via ref
  const loadingRef = useRef({ users: false, reviews: false, feed: false });

  // ── Load Users ──
  const loadUsers = useCallback(async (q: string) => {
    if (loadingRef.current.users) return;
    loadingRef.current.users = true;
    setUsersLoading(true);
    setUsersError(null);
    try {
      const params = new URLSearchParams({ limit: "20" });
      const trimmed = q.trim();
      if (trimmed) {
        params.set("q", trimmed);
      }

      const data = await apiGet<PaginatedResult<SearchUserResult>>(
        `/api/users/search?${params}`
      );
      setUsers(data.items);
      setUsersNextCursor(data.nextCursor);
      setUsersHasMore(data.hasMore);
    } catch {
      setUsers([]);
      setUsersNextCursor(null);
      setUsersHasMore(false);
      setUsersError("FAILED TO QUERY PLAYERS ARCHIVE_");
    } finally {
      setUsersLoading(false);
      loadingRef.current.users = false;
    }
  }, []);

  const loadMoreUsers = useCallback(async () => {
    if (!usersNextCursor || usersLoadingMore) return;
    setUsersLoadingMore(true);
    try {
      const params = new URLSearchParams({ limit: "20", cursor: usersNextCursor });
      const trimmed = query.trim();
      if (trimmed) {
        params.set("q", trimmed);
      }

      const data = await apiGet<PaginatedResult<SearchUserResult>>(
        `/api/users/search?${params}`
      );

      setUsers((prev) => {
        const existingIds = new Set(prev.map((u) => u.id));
        const newItems = data.items.filter((u) => !existingIds.has(u.id));
        return [...prev, ...newItems];
      });
      setUsersNextCursor(data.nextCursor);
      setUsersHasMore(data.hasMore);
    } catch {
      // Silent — user can retry
    } finally {
      setUsersLoadingMore(false);
    }
  }, [usersNextCursor, usersLoadingMore, query]);

  // ── Load Reviews ──
  const loadReviews = useCallback(async () => {
    if (loadingRef.current.reviews) return;
    loadingRef.current.reviews = true;
    setReviewsLoading(true);
    try {
      const data = await apiGet<PaginatedResult<ReviewResponse>>(
        "/api/reviews/discover?limit=20"
      );
      setReviews(data.items);
      setReviewsNextCursor(data.nextCursor);
      setReviewsHasMore(data.hasMore);
    } catch {
      setReviews([]);
      setReviewsNextCursor(null);
      setReviewsHasMore(false);
    } finally {
      setReviewsLoading(false);
      loadingRef.current.reviews = false;
    }
  }, []);

  const loadMoreReviews = useCallback(async () => {
    if (!reviewsNextCursor || reviewsLoadingMore) return;
    setReviewsLoadingMore(true);
    try {
      const data = await apiGet<PaginatedResult<ReviewResponse>>(
        `/api/reviews/discover?limit=20&cursor=${encodeURIComponent(reviewsNextCursor)}`
      );

      setReviews((prev) => {
        const existingIds = new Set(prev.map((r) => r.id));
        const newItems = data.items.filter((r) => !existingIds.has(r.id));
        return [...prev, ...newItems];
      });
      setReviewsNextCursor(data.nextCursor);
      setReviewsHasMore(data.hasMore);
    } catch {
      // Silent
    } finally {
      setReviewsLoadingMore(false);
    }
  }, [reviewsNextCursor, reviewsLoadingMore]);

  // ── Load Feed ──
  const loadFeed = useCallback(async () => {
    if (loadingRef.current.feed) return;
    loadingRef.current.feed = true;
    setFeedLoading(true);
    try {
      const data = await apiGet<PaginatedResult<FeedItem>>(
        "/api/activity/feed?limit=20"
      );
      setFeedItems(data.items);
      setFeedNextCursor(data.nextCursor);
      setFeedHasMore(data.hasMore);
    } catch {
      setFeedItems([]);
      setFeedNextCursor(null);
      setFeedHasMore(false);
    } finally {
      setFeedLoading(false);
      loadingRef.current.feed = false;
    }
  }, []);

  const loadMoreFeed = useCallback(async () => {
    if (!feedNextCursor || feedLoadingMore) return;
    setFeedLoadingMore(true);
    try {
      const data = await apiGet<PaginatedResult<FeedItem>>(
        `/api/activity/feed?limit=20&cursor=${encodeURIComponent(feedNextCursor)}`
      );

      setFeedItems((prev) => {
        const existingIds = new Set(prev.map((f) => f.id));
        const newItems = data.items.filter((f) => !existingIds.has(f.id));
        return [...prev, ...newItems];
      });
      setFeedNextCursor(data.nextCursor);
      setFeedHasMore(data.hasMore);
    } catch {
      // Silent
    } finally {
      setFeedLoadingMore(false);
    }
  }, [feedNextCursor, feedLoadingMore]);

  // ── Load community reviews + feed on mount ──
  useEffect(() => {
    void loadReviews();
    void loadFeed();
  }, [loadReviews, loadFeed]);

  // ── Search users with debounce or immediate on empty ──
  useEffect(() => {
    if (activeTab !== "PEOPLE") return;

    if (!query.trim()) {
      void loadUsers("");
      return;
    }

    const timeout = setTimeout(() => {
      void loadUsers(query);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, activeTab, loadUsers]);

  if (!user) return null;

  // ── Derived: searched reviews from already-loaded list ──
  const searchedReviews = query.trim()
    ? reviews.filter(
        (r) =>
          r.game.name.toLowerCase().includes(query.toLowerCase()) ||
          r.user.username.toLowerCase().includes(query.toLowerCase()) ||
          r.body.toLowerCase().includes(query.toLowerCase())
      )
    : reviews;

  // Spotlight: first review in the discover feed
  const spotlightReview = reviews[0] ?? null;

  return (
    <div className="min-h-screen bg-bg">
      <DiscoverNavbar />
      <DiscoverHeader />

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-10">
        {/* Search */}
        <div className="mb-8">
          <DiscoverSearch
            query={query}
            onQueryChange={setQuery}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        {/* Two-column layout */}
        <div className="discover-layout">
          {/* ── LEFT — main content ── */}
          <div className="discover-main-col space-y-10">

            {/* PEOPLE tab */}
            {activeTab === "PEOPLE" && (
              <>
                <PlayerGrid
                  users={users}
                  currentUserId={user.id}
                  searchQuery={query.trim() || undefined}
                  isLoading={usersLoading}
                  error={usersError}
                  onRetry={() => loadUsers(query)}
                  hasMore={usersHasMore}
                  loadingMore={usersLoadingMore}
                  onLoadMore={loadMoreUsers}
                />

                {!query.trim() && (
                  <>
                    <ReviewFeed
                      reviews={reviews}
                      currentUserId={user.id}
                      currentUsername={user.username}
                      isLoading={reviewsLoading}
                    />
                    {spotlightReview && (
                      <ReviewSpotlight
                        review={spotlightReview}
                        currentUserId={user.id}
                        currentUsername={user.username}
                      />
                    )}
                  </>
                )}
              </>
            )}

            {/* REVIEWS tab */}
            {activeTab === "REVIEWS" && (
              <>
                <ReviewFeed
                  reviews={searchedReviews}
                  currentUserId={user.id}
                  currentUsername={user.username}
                  searchQuery={query.trim() || undefined}
                  isLoading={reviewsLoading}
                  hasMore={!query.trim() ? reviewsHasMore : false}
                  loadingMore={reviewsLoadingMore}
                  onLoadMore={loadMoreReviews}
                />
                {!query.trim() && spotlightReview && (
                  <ReviewSpotlight
                    review={spotlightReview}
                    currentUserId={user.id}
                    currentUsername={user.username}
                  />
                )}
              </>
            )}

            {/* FOLLOWING tab — activity feed from followed users */}
            {activeTab === "FOLLOWING" && (
              <FollowingFeed
                items={feedItems}
                isLoading={feedLoading}
                hasMore={feedHasMore}
                loadingMore={feedLoadingMore}
                onLoadMore={loadMoreFeed}
              />
            )}
          </div>

          {/* ── RIGHT — sidebar ── */}
          <aside className="discover-side-col space-y-4">
            <SystemNote />

            {/* Archive version label */}
            <div className="px-1">
              <p className="font-mono text-[8px] text-text-muted/20 tracking-[0.2em]">
                {"// ARCHIVE_VER 1.0.0"}
              </p>
              <p className="font-mono text-[8px] text-text-muted/15 tracking-[0.15em] mt-1">
                SECTOR: DISCOVERY_INDEX
              </p>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// ─────────────────────────────────────────────
// Page export — wrapped in ProtectedRoute
// ─────────────────────────────────────────────

export default function DiscoverPage() {
  return (
    <ProtectedRoute>
      <DiscoverContent />
    </ProtectedRoute>
  );
}
