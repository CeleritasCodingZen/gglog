"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import GlitchText from "./ui/GlitchText";
import { useAuth } from "@/components/providers/AuthContext";

const NAV_LINKS = [
  { label: "GAMES", href: "#games" },
  { label: "COMMUNITY", href: "#community" },
  { label: "DISCOVER", href: "#discover" },
  { label: "PROFILE", href: "/dashboard" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`
        fixed top-0 left-0 right-0 z-[100]
        border-b border-border
        transition-all duration-300
        ${scrolled
          ? "bg-bg/95 backdrop-blur-sm py-2"
          : "bg-bg/80 backdrop-blur-sm py-3 md:py-4"
        }
      `}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
        {/* Left — Logo */}
        <div className="flex items-center gap-2">
          <GlitchText
            text="GGLOG"
            as="span"
            className="font-[family-name:var(--font-press-start)] text-sm md:text-base text-lime glow-lime"
            periodicGlitch
            glitchInterval={12000}
          />
          <span className="text-[9px] font-[family-name:var(--font-jetbrains)] text-text-muted border border-border px-1.5 py-0.5 leading-none">
            v1.0
          </span>
        </div>

        {/* Center — Links (desktop) */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link, i) => (
            <div key={link.label} className="flex items-center">
              <a
                href={link.href}
                className="
                  font-[family-name:var(--font-press-start)] text-[9px] tracking-wider
                  text-text-dim hover:text-lime
                  px-3 py-2
                  transition-colors duration-200
                  relative group
                "
              >
                {link.label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-px bg-lime group-hover:w-full transition-all duration-300" />
              </a>
              {i < NAV_LINKS.length - 1 && (
                <span className="text-text-muted text-[10px] font-[family-name:var(--font-jetbrains)] select-none">//</span>
              )}
            </div>
          ))}
        </div>

        {/* Right — Actions (desktop) */}
        <div className="hidden md:flex items-center gap-3">
          {loading ? (
            /* Skeleton while checking session */
            <span className="font-[family-name:var(--font-press-start)] text-[9px] text-text-muted">
              ...
            </span>
          ) : user ? (
            /* Authenticated — show username + logout */
            <>
              <Link
                href="/dashboard"
                className="
                  font-[family-name:var(--font-press-start)] text-[9px]
                  text-lime
                  px-3 py-2
                  transition-all duration-200
                  hover:glow-lime
                "
              >
                {user.username.toUpperCase()}_
              </Link>
              <button
                onClick={logout}
                className="
                  font-[family-name:var(--font-press-start)] text-[9px]
                  text-text-dim hover:text-warning
                  border border-border hover:border-warning
                  px-3 py-2
                  transition-all duration-200
                "
              >
                LOGOUT_
              </button>
            </>
          ) : (
            /* Not authenticated — show login + join */
            <>
              <Link
                href="/auth"
                className="
                  font-[family-name:var(--font-press-start)] text-[9px]
                  text-text-dim hover:text-text
                  border border-transparent hover:border-border
                  px-3 py-2
                  transition-all duration-200
                "
              >
                LOGIN_
              </Link>
              <Link
                href="/auth"
                className="
                  font-[family-name:var(--font-press-start)] text-[9px]
                  text-bg bg-lime hover:bg-transparent hover:text-lime
                  border border-lime
                  px-4 py-2
                  transition-all duration-200
                  btn-press
                "
              >
                JOIN GGLOG_
              </Link>
            </>
          )}
        </div>

        {/* Mobile — Hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden flex flex-col gap-1.5 p-2"
          aria-label="Toggle menu"
        >
          <span className={`block w-5 h-px bg-lime transition-transform duration-200 ${mobileOpen ? "rotate-45 translate-y-[3.5px]" : ""}`} />
          <span className={`block w-5 h-px bg-lime transition-opacity duration-200 ${mobileOpen ? "opacity-0" : ""}`} />
          <span className={`block w-5 h-px bg-lime transition-transform duration-200 ${mobileOpen ? "-rotate-45 -translate-y-[3.5px]" : ""}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-bg/98 border-t border-border">
          <div className="px-4 py-4 space-y-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="
                  block font-[family-name:var(--font-press-start)] text-[10px]
                  text-text-dim hover:text-lime
                  py-3 px-2 border-b border-border/50
                  transition-colors
                "
              >
                // {link.label}
              </a>
            ))}
            <div className="flex gap-3 pt-4">
              {loading ? null : user ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="font-[family-name:var(--font-press-start)] text-[9px] text-lime border border-lime px-4 py-2"
                  >
                    {user.username.toUpperCase()}_
                  </Link>
                  <button
                    onClick={() => { setMobileOpen(false); logout(); }}
                    className="font-[family-name:var(--font-press-start)] text-[9px] text-text-dim border border-border px-4 py-2"
                  >
                    LOGOUT_
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth"
                    onClick={() => setMobileOpen(false)}
                    className="font-[family-name:var(--font-press-start)] text-[9px] text-text-dim border border-border px-4 py-2"
                  >
                    LOGIN_
                  </Link>
                  <Link
                    href="/auth"
                    onClick={() => setMobileOpen(false)}
                    className="font-[family-name:var(--font-press-start)] text-[9px] text-bg bg-lime border border-lime px-4 py-2"
                  >
                    JOIN GGLOG_
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
