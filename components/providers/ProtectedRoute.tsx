"use client";

// ============================================
// GGLOG — Protected Route Guard
// ============================================
//
// Wrap any page that requires authentication.
//
//   <ProtectedRoute>
//     <DashboardContent />
//   </ProtectedRoute>
//
// While the session is being checked, a terminal-
// style loading screen is shown. If the user is
// not authenticated, they are redirected to /auth.
// ============================================

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthContext";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth");
    }
  }, [loading, user, router]);

  // ---- Loading state ----
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="text-center">
          <p className="font-pixel text-lime text-[11px] tracking-wide glow-lime">
            AUTHENTICATING
            <span
              style={{ animation: "blink 1s step-end infinite" }}
            >
              _
            </span>
          </p>
          <p className="font-space text-text-muted text-[10px] tracking-[0.15em] mt-3 uppercase">
            VERIFYING SESSION...
          </p>
        </div>
      </div>
    );
  }

  // ---- Not authenticated — redirect in progress ----
  if (!user) {
    return null;
  }

  // ---- Authenticated — render page ----
  return <>{children}</>;
}
