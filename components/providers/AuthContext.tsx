"use client";

// ============================================
// GGLOG — Auth Context Provider
// ============================================
//
// Wraps the entire app so every component can
// access the current user via `useAuth()`.
//
// On mount, it calls GET /api/auth/me to restore
// the session from the HTTP-only cookie. If the
// cookie is missing or expired, `user` stays null.
// ============================================

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { apiGet, apiPost } from "@/lib/api";
import type { User, AuthData } from "@/lib/types";

interface AuthContextValue {
  /** Current authenticated user, or null if not logged in. */
  user: User | null;
  /** True while the initial session check is in progress. */
  loading: boolean;
  /** Sign out — clears session, redirects to /auth. */
  logout: () => Promise<void>;
  /** Re-fetch the current user from /api/auth/me. */
  refreshUser: () => Promise<void>;
  /** Directly set user (used by auth page after signup/signin). */
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  /** Fetch current session from the backend. */
  const refreshUser = useCallback(async () => {
    try {
      const data = await apiGet<AuthData>("/api/auth/me");
      setUser(data.user);
    } catch {
      // No valid session — that's fine
      setUser(null);
    }
  }, []);

  /** Restore session on mount. */
  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, [refreshUser]);

  /** Sign out and redirect. */
  const logout = useCallback(async () => {
    try {
      await apiPost("/api/auth/logout");
    } catch {
      // Even if the API call fails, clear local state
    }
    setUser(null);
    router.push("/auth");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshUser, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Access the auth context.
 *
 * Must be used inside `<AuthProvider>`.
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
