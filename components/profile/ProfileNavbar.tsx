"use client";

// ============================================
// GGLOG — Profile Navbar
// ============================================
// Dedicated navbar for the profile page with
// PROFILE active, search, avatar, and LOG button.
// ============================================

import { useEffect, useState } from "react";
import Link from "next/link";
import GlitchText from "@/components/ui/GlitchText";
import { useAuth } from "@/components/providers/AuthContext";
import GameSearchModal from "@/components/search/GameSearchModal";
import NotificationBell from "@/components/notifications/NotificationBell";

const NAV_LINKS = [
  { label: "GAMES", href: "#games" },
  { label: "COMMUNITY", href: "#community" },
  { label: "DISCOVER", href: "/dashboard/discover" },
  { label: "PROFILE", href: "/dashboard", active: true },
];

export default function ProfileNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Global keyboard shortcut: Ctrl+K to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <nav
        className={`
          fixed top-0 left-0 right-0 z-[100]
          border-b border-border
          transition-all duration-300
          ${scrolled ? "bg-bg/95 backdrop-blur-sm py-2" : "bg-bg/90 backdrop-blur-sm py-3"}
        `}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
          {/* Left — Logo */}
          <Link href="/" className="flex items-center gap-1">
            <GlitchText
              text="GGLOG"
              as="span"
              className="font-[family-name:var(--font-press-start)] text-sm text-lime glow-lime"
              periodicGlitch
              glitchInterval={15000}
            />
            <span className="font-[family-name:var(--font-press-start)] text-sm text-lime glow-lime">
              _
            </span>
          </Link>

          {/* Center — Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`
                  relative font-[family-name:var(--font-press-start)] text-[9px] tracking-wider
                  px-4 py-2 transition-colors duration-200
                  ${link.active
                    ? "text-lime"
                    : "text-text-dim hover:text-text"
                  }
                `}
              >
                {link.label}
                {link.active && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[2px] bg-lime shadow-[0_0_8px_rgba(204,255,0,0.3)]" />
                )}
              </Link>
            ))}
          </div>

          {/* Right — Actions */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              className="text-text-dim hover:text-lime transition-colors p-1.5"
              aria-label="Search games"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </button>

            {/* Notifications */}
            <NotificationBell />

            {/* Avatar */}
            <div className="w-7 h-7 bg-surface border border-border flex items-center justify-center">
              <span className="font-[family-name:var(--font-press-start)] text-[7px] text-text-muted">
                {user?.username?.charAt(0).toUpperCase() || "?"}
              </span>
            </div>

            {/* Log Button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="
                hidden sm:flex items-center gap-1.5
                font-[family-name:var(--font-press-start)] text-[8px]
                bg-lime text-bg
                border border-lime
                px-3 py-2
                hover:bg-transparent hover:text-lime
                transition-all duration-200
                btn-press
              "
            >
              + LOG
            </button>

            {/* Logout */}
            <button
              onClick={logout}
              className="
                font-[family-name:var(--font-press-start)] text-[8px]
                text-text-dim hover:text-warning
                border border-border hover:border-warning
                px-3 py-2
                transition-all duration-200
              "
            >
              LOGOUT_
            </button>
          </div>
        </div>
      </nav>

      {/* Game Search Modal */}
      <GameSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
