import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
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

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz"],
  style: ["normal"],
});

export const metadata: Metadata = {
  title: "MET Campus Hub — Gear Exchange & Academic Vault",
  description:
    "Campus equipment exchange, verified academic notes and AI study assistant for MET BKC IOE students. Rent, sell and hand over resources right inside campus.",
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
    { media: "(prefers-color-scheme: light)", color: "#fbfbf9" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0a08" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} ${fraunces.variable}`} suppressHydrationWarning>
      <body className="min-h-dvh bg-canvas text-fg antialiased">
        <ThemeProvider>
          {/* Ambient backdrop: dot-grid + warm pastel mesh (peach + mint/teal). */}
          <div className="pointer-events-none fixed inset-0 z-0">
            <div className="grid-bg noise-mask absolute inset-0 opacity-[0.18] dark:opacity-[0.12]" />
            <div className="absolute -top-40 left-1/4 h-[30rem] w-[46rem] -translate-x-1/2 rounded-full bg-[#ffd9b8]/[0.5] blur-[110px] dark:bg-[#7c4a22]/[0.35]" />
            <div className="absolute -top-24 right-[-4rem] h-[26rem] w-[34rem] rounded-full bg-[#a8e6ce]/[0.5] blur-[110px] dark:bg-[#1d5c4a]/[0.35]" />
            <div className="absolute bottom-[-8rem] left-[-4rem] h-[24rem] w-[30rem] rounded-full bg-[#ffe3c7]/[0.4] blur-[120px] dark:bg-[#6b5030]/[0.25]" />
          </div>
          <div className="relative z-10 flex min-h-dvh flex-col">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}
