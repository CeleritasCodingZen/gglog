"use client";

// ============================================
// GGLOG — Log Entry Page
// ============================================
// The full diary entry composer. Reads igdbId
// from search params, fetches game data via API,
// manages all form state, and submits to the
// POST /api/games/log endpoint.
// ============================================

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProtectedRoute from "@/components/providers/ProtectedRoute";
import ProfileNavbar from "@/components/profile/ProfileNavbar";
import Footer from "@/components/Footer";
import { apiGet, apiPost } from "@/lib/api";
import type { GameSearchResult, LogGameResponse } from "@/lib/types";

// Logging components
import GameHeader from "@/components/logging/GameHeader";
import CalendarPicker from "@/components/logging/CalendarPicker";
import RatingSelector from "@/components/logging/RatingSelector";
import StatusSelector from "@/components/logging/StatusSelector";
import ReviewEditor from "@/components/logging/ReviewEditor";
import TagSelector from "@/components/logging/TagSelector";
import VisibilitySelector from "@/components/logging/VisibilitySelector";
import LogPreview from "@/components/logging/LogPreview";
import ArchiveButton from "@/components/logging/ArchiveButton";

import "./log.css";

// Status/Visibility types matching the backend enums
type LogEntryStatus = "PLAYING" | "COMPLETED" | "DROPPED" | "REPLAYED";
type LogEntryVisibility = "PUBLIC" | "FOLLOWERS" | "PRIVATE";

// Adapted game type for logging components (works with both mock and API data)
export interface LogGameData {
  igdbId: number;
  name: string;
  coverUrl: string | null;
  summary: string | null;
  genres: { id: number; name: string }[];
  platforms: { id: number; name: string }[];
  releaseDate: string | Date | null;
}

function LogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const igdbId = searchParams.get("igdbId");

  // ── Game loading state ──
  const [game, setGame] = useState<LogGameData | null>(null);
  const [gameLoading, setGameLoading] = useState(true);
  const [gameError, setGameError] = useState<string | null>(null);

  // Fetch game data from IGDB via search API on mount
  useEffect(() => {
    const fetchGame = async () => {
      setGameLoading(true);
      setGameError(null);

      if (!igdbId) {
        setGameError("No IGDB ID provided.");
        setGameLoading(false);
        return;
      }

      const parsedId = parseInt(igdbId, 10);
      if (isNaN(parsedId)) {
        setGameError("Invalid IGDB ID.");
        setGameLoading(false);
        return;
      }

      try {
        // Search for the specific game by its IGDB ID
        const results = await apiGet<GameSearchResult[]>(
          `/api/games/search?q=${encodeURIComponent(igdbId)}`
        );
        // Find the exact match by igdbId
        const match = results.find((g) => g.igdbId === parsedId);
        if (match) {
          setGame({
            igdbId: match.igdbId,
            name: match.name,
            coverUrl: match.coverUrl,
            summary: match.summary,
            genres: match.genres,
            platforms: match.platforms,
            releaseDate: match.releaseDate,
          });
        } else if (results.length > 0) {
          // If exact match not found but we have results, use first
          const first = results[0];
          setGame({
            igdbId: first.igdbId,
            name: first.name,
            coverUrl: first.coverUrl,
            summary: first.summary,
            genres: first.genres,
            platforms: first.platforms,
            releaseDate: first.releaseDate,
          });
        } else {
          setGameError("IGDB returned no game matching this ID.");
        }
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : "Network error.";
        setGameError(`Failed fetching IGDB: ${errMsg}`);
      } finally {
        setGameLoading(false);
      }
    };

    fetchGame();
  }, [igdbId]);

  // ── Form State ──
  const [playedAt, setPlayedAt] = useState<Date>(new Date());
  const [rating, setRating] = useState<number>(0);
  const [status, setStatus] = useState<LogEntryStatus>("COMPLETED");
  const [review, setReview] = useState("");
  const [spoiler, setSpoiler] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<LogEntryVisibility>("PUBLIC");
  const [archiving, setArchiving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Handlers ──
  const handleChangeGame = useCallback(() => {
    router.push("/dashboard");
  }, [router]);

  const handleArchive = useCallback(async () => {
    if (!game) return;
    setError(null);

    try {
      await apiPost<LogGameResponse>("/api/games/log", {
        igdbId: game.igdbId,
        rating: rating > 0 ? rating : null,
        playedAt: playedAt.toISOString(),
        status,
        replay: status === "REPLAYED",
        review: review.trim() || undefined,
        visibility,
        spoiler,
        tags,
      });

      // On success
      setArchiving(true);

      // Wait approximately 1200ms
      await new Promise((r) => setTimeout(r, 1200));

      // Redirect to dashboard after successful archive
      router.push("/dashboard");
    } catch (err) {
      setArchiving(false);
      const errMsg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errMsg);
      throw err;
    }
  }, [game, rating, playedAt, status, review, spoiler, tags, visibility, router]);

  const handleSaveDraft = useCallback(() => {
    console.log("DRAFT SAVED:", { igdbId, rating, playedAt, status, review, spoiler, tags, visibility });
  }, [igdbId, rating, playedAt, status, review, spoiler, tags, visibility]);

  const handleCancel = useCallback(() => {
    router.push("/dashboard");
  }, [router]);

  // ── Loading Game ──
  if (gameLoading) {
    return (
      <div className="min-h-screen bg-bg">
        <ProfileNavbar />
        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-24 pb-16">
          <div className="border border-border bg-surface p-12 text-center">
            <span className="font-mono text-[11px] text-lime tracking-wider cursor-blink glow-lime">
              LOADING GAME DATA
            </span>
            <div className="mt-4">
              <div className="xp-bar-track w-48 mx-auto">
                <div className="xp-bar-fill animate-pulse" style={{ width: "60%" }} />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ── No Game / Error ──
  if (!game || gameError) {
    return (
      <div className="min-h-screen bg-bg">
        <ProfileNavbar />
        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-24 pb-16">
          <div className="border border-border bg-surface p-12 text-center">
            <span className="font-pixel text-[11px] text-warning tracking-wider">
              {gameError ? "GAME_LOAD_ERROR" : "NO GAME SELECTED_"}
            </span>
            <p className="font-mono text-[11px] text-text-muted/60 tracking-wider mt-3">
              {gameError || "Search for a game from your dashboard to start logging."}
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="
                mt-6 font-pixel text-[9px] tracking-wider
                text-bg bg-lime border border-lime
                hover:bg-transparent hover:text-lime
                px-5 py-2.5
                transition-all duration-200 btn-press
              "
            >
              ← BACK TO DASHBOARD
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ── Main Logging UI ──
  return (
    <div className="min-h-screen bg-bg log-grid-bg">
      <ProfileNavbar />

      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-20 pb-16">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* ── Left Column (Form) ── */}
          <div className="flex-1 min-w-0 lg:max-w-[68%] space-y-0">
            <div className="log-section-animate" style={{ animationDelay: "0.1s" }}>
              <GameHeader game={game} onChangeGame={handleChangeGame} />
            </div>

            <div className="log-section-animate" style={{ animationDelay: "0.2s" }}>
              <CalendarPicker value={playedAt} onChange={setPlayedAt} />
            </div>

            <div className="log-section-animate" style={{ animationDelay: "0.3s" }}>
              <RatingSelector value={rating} onChange={setRating} />
            </div>

            <div className="log-section-animate" style={{ animationDelay: "0.35s" }}>
              <StatusSelector value={status} onChange={setStatus} />
            </div>

            <div className="log-section-animate" style={{ animationDelay: "0.4s" }}>
              <ReviewEditor
                value={review}
                onChange={setReview}
                spoiler={spoiler}
                onSpoilerChange={setSpoiler}
              />
            </div>

            <div className="log-section-animate" style={{ animationDelay: "0.45s" }}>
              <TagSelector value={tags} onChange={setTags} />
            </div>

            <div className="log-section-animate" style={{ animationDelay: "0.5s" }}>
              <VisibilitySelector value={visibility} onChange={setVisibility} />
            </div>
          </div>

          {/* ── Right Column (Preview + Actions) ── */}
          <aside className="w-full lg:w-[32%] flex-shrink-0 space-y-4">
            <div className="log-section-animate" style={{ animationDelay: "0.25s" }}>
              <LogPreview
                game={game}
                rating={rating}
                playedAt={playedAt}
                status={status}
                review={review}
                visibility={visibility}
                spoiler={spoiler}
                tags={tags}
              />
            </div>

            <div className="log-section-animate" style={{ animationDelay: "0.4s" }}>
              {error && (
                <div className="mb-4 border border-warning/30 bg-surface p-4 text-left font-mono">
                  <span className="font-pixel text-[9px] text-warning tracking-wider block mb-1">
                    ARCHIVE_FAILED_
                  </span>
                  <span className="text-[10px] text-text-muted">
                    {error}
                  </span>
                </div>
              )}
              <ArchiveButton
                onArchive={handleArchive}
                onSaveDraft={handleSaveDraft}
                onCancel={handleCancel}
                archiving={archiving}
              />
            </div>
          </aside>
        </div>

        {/* Footer System Line */}
        <div className="mt-10 border-t border-border pt-4 flex items-center justify-between">
          <span className="font-mono text-[9px] text-text-muted/30 tracking-wider">
            [ SYSTEM READY ] &gt; LOG_COMPOSER_V1
          </span>
          <span className="font-mono text-[9px] text-text-muted/30 tracking-wider">
            {"// IGDB_CONNECTED"}
          </span>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function LogPage() {
  return (
    <ProtectedRoute>
      <Suspense
        fallback={
          <div className="min-h-screen bg-bg flex items-center justify-center">
            <span className="font-mono text-[11px] text-lime tracking-wider cursor-blink glow-lime">
              LOADING LOG COMPOSER
            </span>
          </div>
        }
      >
        <LogContent />
      </Suspense>
    </ProtectedRoute>
  );
}
