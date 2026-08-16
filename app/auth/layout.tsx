import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GGLOG — Authenticate",
  description:
    "Sign in or create your GGLOG gaming archive account. Identify yourself, player.",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
