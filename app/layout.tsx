import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MET Campus Hub | Gear Exchange & Academic Vault",
  description:
    "Campus equipment exchange, verified academic notes and AI study assistant for MET BKC IOE Nashik students. Rent, sell and hand over resources right inside campus.",
  applicationName: "MET Campus Hub",
  keywords: [
    "MET BKC",
    "IOE campus",
    "SPPU",
    "engineering students",
    "campus marketplace",
    "study notes",
    "engineering calculator",
  ],
  authors: [{ name: "MET Campus Hub" }],
  openGraph: {
    title: "MET Campus Hub",
    description:
      "Swap calculators, drafter sets and textbooks across campus. Download unit-wise verified notes and ask the AI study assistant.",
    type: "website",
    siteName: "MET Campus Hub",
  },
  twitter: {
    card: "summary_large_image",
    title: "MET Campus Hub",
    description: "Campus equipment exchange + academic repository for engineering students.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body className="min-h-dvh bg-canvas text-fg antialiased">
        <ThemeProvider>
          <div className="relative z-10 flex min-h-dvh flex-col">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}
