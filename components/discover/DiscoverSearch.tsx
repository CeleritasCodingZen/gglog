// ============================================
// GGLOG — Discover: DiscoverSearch
// ============================================
// Search bar with tab filter (PEOPLE / REVIEWS / GAMES)
// and frontend-only filtering of mock data.
// ============================================

"use client";

export type SearchTab = "PEOPLE" | "REVIEWS" | "FOLLOWING";

interface DiscoverSearchProps {
  query: string;
  onQueryChange: (q: string) => void;
  activeTab: SearchTab;
  onTabChange: (tab: SearchTab) => void;
}

const TABS: SearchTab[] = ["PEOPLE", "REVIEWS", "FOLLOWING"];

export default function DiscoverSearch({
  query,
  onQueryChange,
  activeTab,
  onTabChange,
}: DiscoverSearchProps) {
  return (
    <div className="discover-fade-3">
      {/* Label */}
      <p className="font-mono text-[9px] text-lime/50 tracking-[0.2em] mb-3">
        // SEARCH ARCHIVE
      </p>

      {/* Search field */}
      <div className="relative mb-4">
        {/* Icon */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="square"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>

        <input
          id="discover-search-input"
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="SEARCH PLAYERS, REVIEWS OR GAMES..."
          className="
            w-full bg-surface border border-border
            pl-10 pr-12 py-3.5
            font-mono text-[11px] text-text
            placeholder:text-text-muted/40 placeholder:tracking-wider
            tracking-wider
            focus:outline-none focus:border-lime/50 focus:bg-surface-light
            transition-colors duration-200
            caret-lime
          "
          autoComplete="off"
          spellCheck={false}
        />

        {/* Shortcut hint */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <span className="font-mono text-[8px] text-text-muted/30 tracking-wider border border-border/40 px-1.5 py-0.5">
            {query ? "ESC" : "/"}
          </span>
        </div>
      </div>

      {/* Tab filters */}
      <div className="flex items-center gap-1.5">
        {TABS.map((tab) => (
          <button
            key={tab}
            id={`discover-tab-${tab.toLowerCase()}`}
            onClick={() => onTabChange(tab)}
            className={`
              font-[family-name:var(--font-press-start)] text-[8px] tracking-wider
              px-3 py-1.5
              border transition-all duration-200
              btn-press
              ${
                activeTab === tab
                  ? "bg-lime/10 border-lime/40 text-lime"
                  : "bg-transparent border-border text-text-muted hover:border-border-active hover:text-text-dim"
              }
            `}
          >
            [ {tab} ]
          </button>
        ))}
      </div>
    </div>
  );
}
