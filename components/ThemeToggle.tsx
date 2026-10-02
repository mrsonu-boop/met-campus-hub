"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

/**
 * Sun/moon switch. Both icons are stacked in a fixed-size box and cross-fade
 * with a slight rotation + scale, so the swap reads as one continuous motion
 * rather than a hard swap.
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // The server has no idea which theme is active; render the neutral frame until
  // the client knows, otherwise the icon would flip on hydration.
  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={mounted ? `Switch to ${isDark ? "light" : "dark"} mode` : "Toggle theme"}
      title={mounted ? `Switch to ${isDark ? "light" : "dark"} mode` : "Toggle theme"}
      className={`group relative inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line bg-elevated text-muted transition hover:border-line-strong hover:text-fg ${className}`}
    >
      <span className="relative block h-[18px] w-[18px]">
        <AnimatePresence initial={false} mode="wait">
          <motion.span
            key={mounted ? (isDark ? "moon" : "sun") : "placeholder"}
            initial={{ opacity: 0, rotate: -75, scale: 0.55 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 75, scale: 0.55 }}
            transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {mounted && isDark ? (
              <Moon className="h-[18px] w-[18px]" strokeWidth={1.75} />
            ) : (
              <Sun className="h-[18px] w-[18px]" strokeWidth={1.75} />
            )}
          </motion.span>
        </AnimatePresence>
      </span>
      <span className="pointer-events-none absolute inset-0 rounded-[inherit] bg-brand opacity-0 transition-opacity duration-200 group-hover:opacity-[0.07]" />
    </button>
  );
}