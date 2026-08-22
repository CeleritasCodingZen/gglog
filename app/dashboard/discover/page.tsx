// ============================================
// GGLOG — Dashboard: Discover Page
// ============================================
// Authenticated social discovery page.
// Protected by ProtectedRoute.
//
// Data flow:
//   PEOPLE tab  → /api/users/search?q=
//   REVIEWS tab → /api/reviews/discover
//   GAMES tab   → /api/reviews/discover (by game, future)
//   FOLLOWING   → /api/activity/feed
//   SIDEBAR     → /api/reviews/discover (discussed games stat)
//
// All mock data replaced with real API calls.
// ============================================

"use client";

import { useState, useEffect, useCallback } from "react";
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
import DiscussedGames from "@/components/discover/DiscussedGames";
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

  // REVIEWS data (community discover feed)
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // FOLLOWING activity feed
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [feedLoading, setFeedLoading] = useState(false);

  const loadUsers = useCallback(async (q: string) => {
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
    } catch {
      setUsers([]);
      setUsersError("FAILED TO QUERY PLAYERS ARCHIVE_");
    } finally {
      setUsersLoading(false);
    }
  }, []);

  // ── Load community reviews on mount ──
  useEffect(() => {
    loadReviews();
    loadFeed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const loadReviews = useCallback(async () => {
    setReviewsLoading(true);
    try {
      const data = await apiGet<PaginatedResult<ReviewResponse>>(
        "/api/reviews/discover?limit=20"
      );
      setReviews(data.items);
    } catch {
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  }, []);

  const loadFeed = useCallback(async () => {
    setFeedLoading(true);
    try {
      const data = await apiGet<PaginatedResult<FeedItem>>(
        "/api/activity/feed?limit=20"
      );
      setFeedItems(data.items);
    } catch {
      setFeedItems([]);
    } finally {
      setFeedLoading(false);
    }
  }, []);

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

            {/* FOLLOWING tab (bonus — show feed from followed users) */}
            {activeTab === "GAMES" && (
              <FollowingFeed
                items={feedItems}
                isLoading={feedLoading}
              />
            )}
          </div>

          {/* ── RIGHT — sidebar ── */}
          <aside className="discover-side-col space-y-4">
            <SystemNote />
            <DiscussedGames games={[]} />

            {/* Archive version label */}
            <div className="px-1">
              <p className="font-mono text-[8px] text-text-muted/20 tracking-[0.2em]">
                // ARCHIVE_VER 1.0.0
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
