// ============================================
// GGLOG — Discover: DiscoverHeader
// ============================================
// Compact technical header with tag line and
// live system status panel on the right.
// ============================================

"use client";

import { SYSTEM_STATS } from "@/data/mockDiscover";

export default function DiscoverHeader() {
  return (
    <section className="discover-header-bg border-b border-border pt-20 pb-8 md:pt-24 md:pb-10 relative overflow-hidden">
      {/* Decorative corner label */}
      <div
        className="absolute top-[72px] right-4 md:right-8 font-mono text-[8px] text-text-muted/15 tracking-[0.2em] select-none"
        aria-hidden="true"
      >
        SECTOR: ARCHIVE_//DISCOVER
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-12">
          {/* ── Left: Headline ── */}
          <div className="flex-1 min-w-0 discover-fade-1">
            {/* Prefix label */}
            <p className="font-mono text-[9px] text-lime/60 tracking-[0.2em] mb-3">
              // DISCOVERY_INDEX_
            </p>

            {/* Main heading */}
            <h1 className="font-[family-name:var(--font-press-start)] text-xl md:text-2xl text-text tracking-wider leading-[1.6] mb-4">
              FIND PLAYERS.
              <br />
              READ REVIEWS.
              <br />
              <span className="text-lime glow-lime">FOLLOW TASTE.</span>
            </h1>

            {/* Supporting copy */}
            <p className="font-mono text-[11px] text-text-dim leading-relaxed tracking-wide max-w-md">
              Explore the GGLOG archive through the people who use it.
              <br />
              Find players, read their reviews and follow their journeys.
            </p>
          </div>

          {/* ── Right: System Status Panel ── */}
          <div className="discover-fade-2 flex-shrink-0">
            <div className="border border-border bg-surface p-4 min-w-[200px] relative">
              {/* Panel top bar */}
              <div className="absolute top-0 left-0 right-0 h-px bg-lime/20" />

              {/* Header row */}
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[9px] text-text-muted tracking-[0.15em] uppercase">
                  SYS.STATUS
                </span>
                <span className="flex items-center gap-1.5 font-mono text-[9px] text-lime tracking-wider">
                  <span className="inline-block w-1.5 h-1.5 bg-lime rounded-full online-badge shadow-[0_0_4px_rgba(204,255,0,0.5)]" />
                  ONLINE
                </span>
              </div>

              {/* Divider */}
              <div className="border-t border-border mb-3" />

              {/* Stats */}
              <div className="space-y-2">
                {[
                  { label: "USERS", value: SYSTEM_STATS.users },
                  { label: "REVIEWS", value: SYSTEM_STATS.reviews },
                  { label: "ACTIVE", value: SYSTEM_STATS.active },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between gap-6">
                    <span className="font-mono text-[9px] text-text-muted tracking-[0.15em]">
                      {label}
                    </span>
                    <span className="font-[family-name:var(--font-press-start)] text-[9px] text-text tabular-nums">
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Panel bottom bar */}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-lime/10" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
