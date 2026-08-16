"use client";

// ============================================
// GGLOG — Profile Tabs
// ============================================

interface ProfileTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TABS = ["DIARY", "REVIEWS", "LISTS", "WATCHLIST", "ACTIVITY"];

export default function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
  return (
    <div className="border-b border-border">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          {TABS.map((tab) => {
            const isActive = tab === activeTab;
            return (
              <button
                key={tab}
                onClick={() => onTabChange(tab)}
                className={`
                  relative font-pixel text-[10px] tracking-wider
                  px-4 py-4
                  transition-colors duration-200
                  whitespace-nowrap
                  ${isActive
                    ? "text-text"
                    : "text-text-muted hover:text-text-dim"
                  }
                `}
              >
                {tab}
                {isActive && <span className="profile-tab-indicator" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
