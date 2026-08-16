"use client";

// ============================================
// GGLOG — Game Search Modal
// ============================================
// Full-screen overlay for searching the game
// database. Triggered from dashboard/navbar.
// ============================================

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiGet } from "@/lib/api";
import type { GameSearchResult } from "@/lib/types";

interface GameSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GameSearchModal({ isOpen, onClose }: GameSearchModalProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GameSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [error, setError] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setResults([]);
      setHasSearched(false);
      setSelectedIndex(-1);
      setError(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Search on query change (debounced)
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setHasSearched(false);
      setSelectedIndex(-1);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      setError(false);
      try {
        const data = await apiGet<GameSearchResult[]>(`/api/games/search?q=${encodeURIComponent(query)}`);
        setResults(data);
        setHasSearched(true);
        setSelectedIndex(-1);
      } catch {
        setError(true);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, -1));
      }
      if (e.key === "Enter" && selectedIndex >= 0 && results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    },
    [results, selectedIndex, onClose]
  );

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && resultsRef.current) {
      const items = resultsRef.current.querySelectorAll("[data-result-item]");
      items[selectedIndex]?.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  const handleSelect = (game: GameSearchResult) => {
    router.push(`/dashboard/log?igdbId=${game.igdbId}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center pt-[10vh]"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-bg/90 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-2xl mx-4 border border-border bg-surface"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="border-b border-border px-5 py-3 flex items-center justify-between">
          <span className="font-pixel text-[9px] text-lime tracking-wider glow-lime">
            SEARCH DATABASE_
          </span>
          <button
            onClick={onClose}
            className="font-mono text-[11px] text-text-muted hover:text-warning transition-colors"
          >
            [ESC]
          </button>
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
          <span className="font-terminal text-xl text-lime glow-lime select-none">
            &gt;
          </span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search games..."
            className="
              flex-1 bg-transparent outline-none
              font-mono text-sm text-text
              placeholder:text-text-muted/40
              tracking-wider
            "
            autoComplete="off"
            spellCheck={false}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="font-mono text-[10px] text-text-muted hover:text-lime transition-colors"
            >
              CLEAR
            </button>
          )}
        </div>

        {/* Results Area */}
        <div ref={resultsRef} className="max-h-[50vh] overflow-y-auto">
          {/* Loading */}
          {loading && (
            <div className="px-5 py-10 text-center">
              <div className="inline-block">
                <span className="font-mono text-[11px] text-lime tracking-wider glow-lime cursor-blink">
                  SCANNING DATABASE
                </span>
              </div>
              <div className="mt-3">
                <div className="xp-bar-track w-48 mx-auto">
                  <div
                    className="xp-bar-fill animate-pulse"
                    style={{ width: "60%" }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="px-5 py-10 text-center">
              <span className="font-pixel text-[9px] text-warning tracking-wider">
                DATABASE_ERROR
              </span>
              <p className="font-mono text-[11px] text-text-muted mt-2">
                Failed to query game archive. Try again.
              </p>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && hasSearched && results.length === 0 && (
            <div className="px-5 py-10 text-center">
              <span className="font-pixel text-[9px] text-text-muted tracking-wider">
                NO MATCHES IN DATABASE_
              </span>
              <p className="font-mono text-[11px] text-text-muted/60 mt-2">
                No games found for &quot;{query}&quot;
              </p>
            </div>
          )}

          {/* Results List */}
          {!loading && !error && results.length > 0 && (
            <div>
              <div className="px-5 py-2 border-b border-border/50">
                <span className="font-mono text-[10px] text-text-muted tracking-wider">
                  {results.length} RESULT{results.length !== 1 ? "S" : ""} FOUND
                </span>
              </div>
              {results.map((game, i) => (
                <button
                  key={game.igdbId}
                  data-result-item
                  onClick={() => handleSelect(game)}
                  className={`
                    w-full flex items-center gap-4 px-5 py-4
                    border-b border-border/30
                    transition-all duration-150
                    text-left group
                    ${selectedIndex === i
                      ? "bg-lime/5 border-l-2 border-l-lime"
                      : "hover:bg-surface-lighter border-l-2 border-l-transparent"
                    }
                  `}
                >
                  {/* Cover */}
                  <div className="w-12 h-16 bg-surface-lighter border border-border flex-shrink-0 flex items-center justify-center relative overflow-hidden">
                    {game.coverUrl ? (
                      <img
                        src={game.coverUrl.replace("t_thumb", "t_cover_small")}
                        alt={game.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="font-pixel text-[5px] text-text-muted/30 tracking-wider">
                        {game.name.substring(0, 3)}
                      </span>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 pointer-events-none" />
                  </div>

                  {/* Game Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`
                      font-pixel text-[10px] tracking-wider leading-relaxed truncate
                      ${selectedIndex === i ? "text-lime" : "text-text group-hover:text-lime"}
                      transition-colors
                    `}>
                      {game.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      {game.releaseDate && (
                        <>
                          <span className="font-mono text-[10px] text-text-muted tracking-wider">
                            {new Date(game.releaseDate).getFullYear()}
                          </span>
                          <span className="text-text-muted text-[8px]">|</span>
                        </>
                      )}
                      {game.rating && (
                        <span className="font-mono text-[10px] text-lime/60 tracking-wider">
                          ★ {(game.rating / 20).toFixed(1)}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2 mt-1.5">
                      {game.genres.slice(0, 3).map((genre) => (
                        <span
                          key={genre.id}
                          className="font-space text-[8px] text-lime/60 bg-lime/5 border border-lime/10 px-1.5 py-0.5 tracking-wider"
                        >
                          {genre.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Select Action */}
                  <span className={`
                    font-pixel text-[8px] tracking-wider flex-shrink-0
                    border px-2 py-1 transition-all
                    ${selectedIndex === i
                      ? "text-bg bg-lime border-lime"
                      : "text-text-muted border-border group-hover:text-lime group-hover:border-lime"
                    }
                  `}>
                    SELECT
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Idle state */}
          {!loading && !error && !hasSearched && (
            <div className="px-5 py-10 text-center">
              <span className="font-mono text-[11px] text-text-muted/40 tracking-wider">
                // TYPE TO SEARCH THE ARCHIVE
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-5 py-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-mono text-[9px] text-text-muted/40 tracking-wider">
              ↑↓ NAVIGATE
            </span>
            <span className="font-mono text-[9px] text-text-muted/40 tracking-wider">
              ↵ SELECT
            </span>
          </div>
          <span className="font-mono text-[9px] text-text-muted/40 tracking-wider">
            ESC CLOSE
          </span>
        </div>
      </div>
    </div>
  );
}
