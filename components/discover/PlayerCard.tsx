import { useState } from "react";
import { apiPost, apiDelete } from "@/lib/api";
import type { SearchUserResult } from "@/lib/services/userService";
import FollowListModal from "@/components/profile/FollowListModal";

interface PlayerCardProps {
  user: SearchUserResult;
  /** The authenticated current user's ID — prevents self-follow */
  currentUserId: string;
  index: number;
}

interface FollowResponse {
  following: boolean;
  followedBy: boolean;
  mutual: boolean;
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

function getInitial(username: string): string {
  return username.charAt(0).toUpperCase();
}

export default function PlayerCard({ user, currentUserId, index }: PlayerCardProps) {
  const [following, setFollowing] = useState(user.isFollowing);
  const [followerCount, setFollowerCount] = useState(user.followerCount);
  const [loading, setLoading] = useState(false);
  const [followModalOpen, setFollowModalOpen] = useState(false);

  const isSelf = user.id === currentUserId;

  async function handleFollow() {
    if (loading || isSelf) return;

    const optimisticFollowing = !following;
    const optimisticCount = followerCount + (optimisticFollowing ? 1 : -1);

    // Optimistic update
    setFollowing(optimisticFollowing);
    setFollowerCount(optimisticCount);
    setLoading(true);

    try {
      if (optimisticFollowing) {
        await apiPost<FollowResponse>(`/api/users/${user.username}/follow`);
      } else {
        await apiDelete<FollowResponse>(`/api/users/${user.username}/follow`);
      }
    } catch {
      // Rollback on failure
      setFollowing(!optimisticFollowing);
      setFollowerCount(followerCount);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="player-card-animate bg-surface border border-border hover:border-border-active transition-colors duration-300 group"
      style={{ animationDelay: `${0.1 + index * 0.08}s` }}
    >
      <div className="p-4">
        {/* Top row: avatar + identity */}
        <div className="flex items-start gap-3 mb-4">
          {/* Avatar */}
          <div className="avatar-placeholder w-10 h-10 flex-shrink-0">
            <span className="font-[family-name:var(--font-press-start)] text-[10px] text-lime/60 z-10 relative">
              {getInitial(user.username)}
            </span>
          </div>

          {/* Username / displayName */}
          <div className="flex-1 min-w-0">
            <p className="font-[family-name:var(--font-press-start)] text-[9px] text-text tracking-wider leading-tight mb-1">
              {user.username}
            </p>
            {user.displayName && (
              <p className="font-mono text-[10px] text-text-muted tracking-wider truncate">
                {user.displayName}
              </p>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 mb-3 border-t border-border pt-3">
          <div className="flex-1 text-center">
            <p className="font-[family-name:var(--font-press-start)] text-[8px] text-text leading-none mb-1">
              {user.gameCount}
            </p>
            <p className="font-mono text-[7px] text-text-muted tracking-wider uppercase">
              GAMES
            </p>
          </div>
          <div className="w-px h-6 bg-border" />
          <div className="flex-1 text-center">
            <p className="font-[family-name:var(--font-press-start)] text-[8px] text-text leading-none mb-1">
              {user.reviewCount}
            </p>
            <p className="font-mono text-[7px] text-text-muted tracking-wider uppercase">
              REVIEWS
            </p>
          </div>
          <div className="w-px h-6 bg-border" />
          <button
            onClick={() => setFollowModalOpen(true)}
            title="View followers"
            className="flex-1 text-center hover:bg-lime/5 transition-colors p-1 rounded-none cursor-pointer group/followers"
          >
            <p className="font-[family-name:var(--font-press-start)] text-[8px] text-lime glow-lime leading-none mb-1 group-hover/followers:underline">
              {formatCount(followerCount)}
            </p>
            <p className="font-mono text-[7px] text-text-muted tracking-wider uppercase group-hover/followers:text-lime">
              FOLLOWERS
            </p>
          </button>
        </div>

        {/* Bio (if present) */}
        {user.bio && (
          <p className="font-mono text-[9px] text-text-muted/70 tracking-wide leading-relaxed mb-3 line-clamp-2">
            {user.bio}
          </p>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <a
            href={`/dashboard/profile/${user.username}`}
            id={`player-view-${user.id}`}
            className="
              flex-1 text-center
              font-[family-name:var(--font-press-start)] text-[7px] tracking-wider
              border border-border text-text-dim
              py-2 px-3
              hover:border-border-active hover:text-text
              transition-all duration-200
              btn-press
            "
          >
            &gt; VIEW
          </a>

          {!isSelf && (
            <button
              id={`player-follow-${user.id}`}
              onClick={handleFollow}
              disabled={loading}
              className={`
                flex-1 text-center
                font-[family-name:var(--font-press-start)] text-[7px] tracking-wider
                border py-2 px-3
                transition-all duration-200
                btn-press
                disabled:opacity-50 disabled:cursor-not-allowed
                ${
                  following
                    ? "border-lime/30 text-lime bg-lime/8"
                    : "border-border text-text-muted hover:border-lime/40 hover:text-lime"
                }
              `}
            >
              {loading ? "..." : following ? "✓ FOLLOWING" : "+ FOLLOW"}
            </button>
          )}

          {isSelf && (
            <span className="flex-1 text-center font-mono text-[8px] text-text-muted/40 tracking-wider py-2">
              YOU
            </span>
          )}
        </div>
      </div>

      {/* Follow List Modal */}
      <FollowListModal
        isOpen={followModalOpen}
        onClose={() => setFollowModalOpen(false)}
        username={user.username}
        initialType="followers"
        currentUserId={currentUserId}
      />
    </div>
  );
}
