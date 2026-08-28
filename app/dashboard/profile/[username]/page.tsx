"use client";

// ============================================
// GGLOG — Public User Profile Page
// ============================================
// Displays another user's profile with:
//   - avatar, username, display name, bio
//   - follower / following / games / reviews stats
//   - follow / unfollow button
//   - followers / following modal
//
// Data: GET /api/users/:username
// Follow: POST/DELETE /api/users/:username/follow
// ============================================

import { useState, useEffect, useCallback, use } from "react";
import ProtectedRoute from "@/components/providers/ProtectedRoute";
import { useAuth } from "@/components/providers/AuthContext";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
import DiscoverNavbar from "@/components/discover/DiscoverNavbar";
import FollowListModal, { type FollowListType } from "@/components/profile/FollowListModal";
import CountUpNumber from "@/components/ui/CountUpNumber";
import Footer from "@/components/Footer";
import type { UserProfile } from "@/lib/types/user";
import type { FollowRelationship } from "@/lib/types/social";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

function ProfileContent({ username }: { username: string }) {
  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Follow state
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  // Follow modal
  const [followModalOpen, setFollowModalOpen] = useState(false);
  const [followModalType, setFollowModalType] = useState<FollowListType>("followers");

  const isSelf = currentUser?.username === username;

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<UserProfile>(`/api/users/${encodeURIComponent(username)}`);
      setProfile(data);
      setFollowerCount(data.stats.followers);
      setIsFollowing(data.relationship?.following ?? false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load profile.";
      if (message.includes("not found") || message.includes("Not found")) {
        setError("PROFILE_NOT_FOUND");
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  async function handleFollow() {
    if (followLoading || isSelf || !profile) return;

    const optimisticFollowing = !isFollowing;
    const optimisticCount = followerCount + (optimisticFollowing ? 1 : -1);

    setIsFollowing(optimisticFollowing);
    setFollowerCount(optimisticCount);
    setFollowLoading(true);

    try {
      if (optimisticFollowing) {
        await apiPost<FollowRelationship>(`/api/users/${encodeURIComponent(username)}/follow`);
      } else {
        await apiDelete<FollowRelationship>(`/api/users/${encodeURIComponent(username)}/follow`);
      }
    } catch {
      setIsFollowing(!optimisticFollowing);
      setFollowerCount(followerCount);
    } finally {
      setFollowLoading(false);
    }
  }

  function openFollowModal(type: FollowListType) {
    setFollowModalType(type);
    setFollowModalOpen(true);
  }

  if (!currentUser) return null;

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen bg-bg">
        <DiscoverNavbar />
        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-24 pb-16">
          <div className="border border-border bg-surface p-12 text-center">
            <span className="font-mono text-[11px] text-lime tracking-wider cursor-blink glow-lime">
              LOADING PROFILE...
            </span>
            <div className="mt-4">
              <div className="w-48 mx-auto h-1 bg-border overflow-hidden">
                <div className="w-1/2 h-full bg-lime animate-pulse" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ── Error / Not Found ──
  if (error || !profile) {
    return (
      <div className="min-h-screen bg-bg">
        <DiscoverNavbar />
        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-24 pb-16">
          <div className="border border-border bg-surface p-12 text-center">
            <span className="font-pixel text-[11px] text-warning tracking-wider">
              {error === "PROFILE_NOT_FOUND" ? "PROFILE NOT FOUND_" : "FAILED TO LOAD PROFILE_"}
            </span>
            <p className="font-mono text-[11px] text-text-muted/60 tracking-wider mt-3">
              {error === "PROFILE_NOT_FOUND"
                ? `No player found with username "${username}".`
                : error || "An unexpected error occurred."}
            </p>
            <div className="flex items-center justify-center gap-3 mt-6">
              <a
                href="/dashboard/discover"
                className="font-pixel text-[9px] tracking-wider text-bg bg-lime border border-lime hover:bg-transparent hover:text-lime px-5 py-2.5 transition-all duration-200 btn-press"
              >
                ← DISCOVER
              </a>
              {error !== "PROFILE_NOT_FOUND" && (
                <button
                  onClick={fetchProfile}
                  className="font-mono text-[10px] text-lime border border-lime/40 px-4 py-2 hover:bg-lime hover:text-bg transition-all btn-press"
                >
                  [ RETRY ]
                </button>
              )}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const { user: profileUser, stats } = profile;
  const displayName = profileUser.displayName || profileUser.username;

  const statItems = [
    { value: stats.gamesLogged, label: "GAMES LOGGED" },
    { value: stats.reviews, label: "REVIEWS", highlight: true },
    { value: stats.lists, label: "LISTS" },
    {
      value: followerCount,
      label: "FOLLOWERS",
      onClick: () => openFollowModal("followers"),
    },
    {
      value: stats.following,
      label: "FOLLOWING",
      onClick: () => openFollowModal("following"),
    },
  ];

  return (
    <div className="min-h-screen bg-bg">
      <DiscoverNavbar />

      {/* ── Profile Header ── */}
      <section className="profile-grid-bg border-b border-border pt-20 pb-10 md:pt-24 md:pb-12 relative overflow-hidden">
        {/* Coordinate label */}
        <div
          className="absolute top-20 right-6 md:right-10 font-mono text-[9px] text-text-muted/20 tracking-[0.2em] select-none"
          aria-hidden="true"
        >
          {"// PLAYER_ARCHIVE"}
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-8 lg:gap-12">
            {/* ── Left: Avatar ── */}
            <div className="flex-shrink-0">
              <div className="avatar-placeholder w-[120px] h-[120px] md:w-[140px] md:h-[140px]">
                <div className="text-center z-10 relative">
                  <span className="font-[family-name:var(--font-press-start)] text-3xl text-lime/60">
                    {profileUser.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* ── Center: Identity + Stats ── */}
            <div className="flex-1 min-w-0">
              {/* Username */}
              <h1 className="font-pixel text-3xl md:text-4xl lg:text-5xl text-text tracking-wider leading-none">
                {displayName.toUpperCase()}
              </h1>

              {/* Handle */}
              {profileUser.displayName && (
                <p className="font-mono text-[11px] text-text-muted tracking-wider mt-1.5">
                  @{profileUser.username}
                </p>
              )}

              {/* Bio */}
              {profileUser.bio && (
                <p className="font-mono text-sm text-text-dim mt-3 tracking-wide">
                  &gt; {profileUser.bio}
                </p>
              )}

              {/* Stats Row */}
              <div className="flex flex-wrap items-center gap-2.5 mt-5">
                {statItems.map((stat) =>
                  stat.onClick ? (
                    <button
                      key={stat.label}
                      onClick={stat.onClick}
                      title={`View ${stat.label.toLowerCase()}`}
                      className="
                        flex items-center gap-2 px-3 py-1.5
                        border border-border text-[11px] font-space tracking-wider
                        bg-surface/60 text-text-dim
                        hover:border-lime/40 hover:text-lime hover:bg-lime/5
                        transition-all duration-150 cursor-pointer btn-press
                      "
                    >
                      <CountUpNumber
                        end={stat.value}
                        duration={1.8}
                        className="font-bold text-text"
                      />
                      <span className="uppercase">{stat.label}</span>
                    </button>
                  ) : (
                    <div
                      key={stat.label}
                      className={`
                        flex items-center gap-2 px-3 py-1.5
                        border text-[11px] font-space tracking-wider
                        ${
                          stat.highlight
                            ? "bg-lime/10 border-lime/25 text-lime"
                            : "bg-surface/60 border-border text-text-dim"
                        }
                      `}
                    >
                      <CountUpNumber
                        end={stat.value}
                        duration={1.8}
                        className={`font-bold ${stat.highlight ? "text-lime" : "text-text"}`}
                      />
                      <span className="uppercase">{stat.label}</span>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* ── Right: Actions ── */}
            <div className="flex-shrink-0 flex flex-col gap-2.5">
              {isSelf ? (
                <a
                  href="/dashboard"
                  className="
                    font-space text-[11px] tracking-[0.12em] uppercase
                    border border-lime text-lime
                    px-6 py-3 text-center
                    hover:bg-lime hover:text-bg
                    transition-all duration-200
                    btn-press
                  "
                >
                  &gt; [ MY DASHBOARD ]
                </a>
              ) : (
                <button
                  onClick={handleFollow}
                  disabled={followLoading}
                  className={`
                    font-space text-[11px] tracking-[0.12em] uppercase
                    border px-6 py-3
                    transition-all duration-200
                    btn-press
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${
                      isFollowing
                        ? "border-lime/30 text-lime bg-lime/10 hover:bg-transparent hover:border-warning hover:text-warning"
                        : "border-lime text-lime hover:bg-lime hover:text-bg"
                    }
                  `}
                >
                  {followLoading ? "..." : isFollowing ? "✓ FOLLOWING" : "+ FOLLOW"}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Content ── */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-10">
        <div className="border border-border bg-surface/50 p-10 text-center">
          <p className="font-pixel text-[10px] text-text-muted tracking-wider mb-3">
            PLAYER ARCHIVE_
          </p>
          <p className="font-mono text-[11px] text-text-muted/60 tracking-wider">
            {isSelf
              ? "Visit your dashboard to view your diary, reviews, and lists."
              : `${displayName}'s diary and reviews will be accessible here in a future update.`}
          </p>
          <p className="font-mono text-[10px] text-text-muted/30 tracking-wider mt-4">
            {"// MODULE PENDING DEPLOYMENT"}
          </p>
        </div>
      </main>

      <Footer />

      {/* Follow List Modal */}
      <FollowListModal
        isOpen={followModalOpen}
        onClose={() => setFollowModalOpen(false)}
        username={username}
        initialType={followModalType}
        currentUserId={currentUser.id}
        currentUsername={currentUser.username}
      />
    </div>
  );
}

export default function UserProfilePage({ params }: ProfilePageProps) {
  const { username } = use(params);

  return (
    <ProtectedRoute>
      <ProfileContent username={username} />
    </ProtectedRoute>
  );
}
