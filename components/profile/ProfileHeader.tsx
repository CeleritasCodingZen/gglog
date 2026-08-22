"use client";

// ============================================
// GGLOG — Profile Header
// ============================================
// Large horizontal player identity section with
// avatar, username, stats, and action buttons.
// ============================================

import { useState } from "react";
import type { User } from "@/lib/types";
import type { ProfileStats } from "@/data/mockProfile";
import CountUpNumber from "@/components/ui/CountUpNumber";
import FollowListModal, { type FollowListType } from "./FollowListModal";

interface ProfileHeaderProps {
  user: User;
  stats: ProfileStats;
  bioQuote: string;
}

export default function ProfileHeader({ user, stats, bioQuote }: ProfileHeaderProps) {
  const displayName = user.profile?.displayName || user.username;
  const [followModalOpen, setFollowModalOpen] = useState(false);
  const [followModalType, setFollowModalType] = useState<FollowListType>("followers");

  const openFollowModal = (type: FollowListType) => {
    setFollowModalType(type);
    setFollowModalOpen(true);
  };

  const statItems = [
    { value: stats.gamesLogged, label: "GAMES LOGGED" },
    { value: stats.reviews, label: "REVIEWS", highlight: true },
    { value: stats.lists, label: "LISTS" },
    {
      value: stats.followers,
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
    <>
      <section className="profile-grid-bg border-b border-border pt-20 pb-10 md:pt-24 md:pb-12 relative overflow-hidden">
        {/* Coordinate label */}
        <div
          className="absolute top-20 right-6 md:right-10 font-mono text-[9px] text-text-muted/20 tracking-[0.2em] select-none profile-fade-1"
          aria-hidden="true"
        >
          ID: 99-21A4-A6
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-8 lg:gap-12">
            {/* ── Left: Avatar ── */}
            <div className="profile-fade-1 flex-shrink-0">
              <div className="avatar-placeholder w-[120px] h-[120px] md:w-[140px] md:h-[140px]">
                <div className="text-center z-10 relative">
                  <div className="font-mono text-[8px] text-text-muted/40 tracking-wider uppercase leading-relaxed">
                    <span className="text-text-muted/60">VOID LOG:</span> ENTR_//4
                    <br />
                    PLAYER IMAGE
                  </div>
                </div>
              </div>
              {/* Online badge */}
              <div className="flex items-center justify-center gap-1.5 mt-2">
                <span className="online-badge w-2 h-2 bg-lime rounded-full inline-block shadow-[0_0_6px_rgba(204,255,0,0.4)]" />
                <span className="font-space text-[9px] text-lime tracking-[0.12em] font-bold uppercase">
                  ONLINE
                </span>
              </div>
            </div>

            {/* ── Center: Identity + Stats ── */}
            <div className="flex-1 min-w-0 profile-fade-2">
              {/* Username */}
              <h1 className="font-pixel text-3xl md:text-4xl lg:text-5xl text-text tracking-wider leading-none">
                {displayName.toUpperCase()}
              </h1>

              {/* Quote */}
              <p className="font-mono text-sm text-text-dim mt-3 tracking-wide">
                &gt; {bioQuote}
              </p>

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
                        className="font-bold text-text group-hover:text-lime"
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
            <div className="flex-shrink-0 flex flex-col gap-2.5 profile-fade-3">
              <button
                className="
                  font-space text-[11px] tracking-[0.12em] uppercase
                  border border-lime text-lime
                  px-6 py-3
                  hover:bg-lime hover:text-bg
                  transition-all duration-200
                  btn-press
                "
              >
                &gt; [ EDIT PROFILE ]
              </button>
              <button
                className="
                  font-space text-[11px] tracking-[0.12em] uppercase
                  border border-border text-text-dim
                  px-6 py-3
                  hover:border-text-muted hover:text-text
                  transition-all duration-200
                "
              >
                &gt; SHARE_SYS_LINK
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Follow List Modal */}
      <FollowListModal
        isOpen={followModalOpen}
        onClose={() => setFollowModalOpen(false)}
        username={user.username}
        initialType={followModalType}
        currentUserId={user.id}
        currentUsername={user.username}
      />
    </>
  );
}
