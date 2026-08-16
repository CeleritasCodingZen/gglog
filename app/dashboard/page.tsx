"use client";

// ============================================
// GGLOG — Dashboard (Profile + Dashboard Merged)
// ============================================
// The single authenticated landing page. Contains
// the full player profile view with diary, stats,
// collections, and all profile tabs.
// ============================================

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/providers/ProtectedRoute";
import { useAuth } from "@/components/providers/AuthContext";
import { apiGet } from "@/lib/api";

// Profile components
import ProfileNavbar from "@/components/profile/ProfileNavbar";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileTabs from "@/components/profile/ProfileTabs";
import DiaryTimeline from "@/components/profile/DiaryTimeline";
import StatsPanel from "@/components/profile/StatsPanel";
import CollectionCards from "@/components/profile/CollectionCards";
import Footer from "@/components/Footer";

// Mock data
import { MOCK_PROFILE_STATS, MOCK_PLAYER_STATS, MOCK_BIO_QUOTE } from "@/data/mockProfile";
import { MOCK_DIARY_ENTRIES } from "@/data/mockDiary";
import { MOCK_COLLECTIONS } from "@/data/mockCollections";

import "./dashboard.css";

function DashboardContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("DIARY");
  const [diaryEntries, setDiaryEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchDiary() {
      try {
        setLoading(true);
        setError(false);
        const data = await apiGet<{ entries: any[] }>("/api/diary");
        setDiaryEntries(data.entries);
      } catch (err) {
        console.error("Failed to fetch diary:", err);
        setError(true);
        // Fall back to mock entries on failure
        setDiaryEntries(MOCK_DIARY_ENTRIES);
      } finally {
        setLoading(false);
      }
    }

    fetchDiary();
  }, []);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-bg">
      {/* ── Navbar ── */}
      <ProfileNavbar />

      {/* ── Profile Header ── */}
      <ProfileHeader
        user={user}
        stats={MOCK_PROFILE_STATS}
        bioQuote={MOCK_BIO_QUOTE}
      />

      {/* ── Tabs ── */}
      <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* ── Main Content ── */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-10">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
          {/* ── Left Column (70%) ── */}
          <div className="flex-1 min-w-0 lg:max-w-[70%]">
            {activeTab === "DIARY" && (
              loading ? (
                <div className="border border-border bg-surface/50 p-10 text-center">
                  <p className="font-mono text-[11px] text-lime tracking-wider cursor-blink glow-lime">
                    LOADING DIARY FILES...
                  </p>
                </div>
              ) : error ? (
                <div className="space-y-4">
                  <div className="border border-warning/30 bg-warning/5 p-4 text-center">
                    <p className="font-pixel text-[9px] text-warning tracking-wider mb-2">
                      SYS_WARNING: DIARY_FEED_ERROR_DEGRADED_STATE
                    </p>
                    <p className="font-mono text-[11px] text-text-dim">
                      Failed to fetch archived log entries. Showing local cache.
                    </p>
                  </div>
                  <DiaryTimeline entries={diaryEntries} />
                </div>
              ) : diaryEntries.length === 0 ? (
                <div className="border border-border bg-surface/50 p-12 text-center">
                  <p className="font-pixel text-[10px] text-text-muted tracking-wider mb-3">
                    DIARY FILE IS EMPTY_
                  </p>
                  <p className="font-mono text-[11px] text-text-muted/60 tracking-wider">
                    You have not logged any games yet. Click the + LOG button in the header or search to archive your first entry.
                  </p>
                </div>
              ) : (
                <DiaryTimeline entries={diaryEntries} />
              )
            )}

            {activeTab === "REVIEWS" && (
              <PlaceholderTab label="REVIEWS" description="Your game reviews will appear here." />
            )}

            {activeTab === "LISTS" && (
              <PlaceholderTab label="LISTS" description="Your curated game lists will appear here." />
            )}

            {activeTab === "WATCHLIST" && (
              <PlaceholderTab label="WATCHLIST" description="Games on your radar will appear here." />
            )}

            {activeTab === "ACTIVITY" && (
              <PlaceholderTab label="ACTIVITY" description="Your recent activity feed will appear here." />
            )}
          </div>

          {/* ── Right Column (30%) ── */}
          <aside className="w-full lg:w-[30%] flex-shrink-0">
            <StatsPanel stats={MOCK_PLAYER_STATS} />
            <CollectionCards collections={MOCK_COLLECTIONS} />
          </aside>
        </div>
      </main>

      {/* ── Footer ── */}
      <Footer />
    </div>
  );
}

/**
 * Placeholder for tabs that aren't fully built yet.
 */
function PlaceholderTab({ label, description }: { label: string; description: string }) {
  return (
    <div className="border border-border bg-surface/50 p-10 text-center">
      <p className="font-pixel text-[11px] text-text-muted tracking-wider mb-2">
        {label}_
      </p>
      <p className="font-space text-[11px] text-text-muted/60 tracking-wider">
        {description}
      </p>
      <p className="font-mono text-[10px] text-text-muted/30 tracking-wider mt-4">
        // MODULE PENDING DEPLOYMENT
      </p>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
