import type { Metadata } from "next";
import { Press_Start_2P, VT323, JetBrains_Mono, Space_Mono } from "next/font/google";
import { AuthProvider } from "@/components/providers/AuthContext";
import { NotificationProvider } from "@/components/providers/NotificationProvider";
import "./globals.css";

const pressStart = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start",
  display: "swap",
});

const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-vt323",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GGLOG — Your Gaming Archive",
  description:
    "Track every adventure. Review every masterpiece. Remember every world. GGlog is your personal gaming archive — a retro-futuristic terminal for the modern gamer.",
  keywords: ["gaming", "archive", "game tracker", "reviews", "backlog", "gaming journal"],
  openGraph: {
    title: "GGLOG — Your Gaming Archive",
    description: "Track every adventure. Review every masterpiece. Remember every world.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${pressStart.variable} ${vt323.variable} ${jetbrainsMono.variable} ${spaceMono.variable}`}
    >
      <body className="min-h-screen bg-bg text-text antialiased">
        {/* CRT Scanlines */}
        <div className="crt-scanlines" aria-hidden="true" />
        {/* Film Grain Noise */}
        <div className="noise-overlay" aria-hidden="true" />
        {/* Main Content */}
        <AuthProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
