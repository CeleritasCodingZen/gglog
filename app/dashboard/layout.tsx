import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GGLOG — Dashboard",
  description: "Your personal gaming archive. Track every adventure, review every masterpiece, manage your gaming journey.",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
