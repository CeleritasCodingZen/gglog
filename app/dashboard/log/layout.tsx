import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GGLOG — Log Entry",
  description: "Create a new diary entry in your gaming archive.",
};

export default function LogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
