"use client";

import { useEffect, useRef } from "react";
import { Search } from "lucide-react";

import { CATEGORY_FILTERS } from "@/lib/data";
import type { GearCategory } from "@/lib/types";

interface HeroSectionProps {
  search: string;
  onSearchChange: (value: string) => void;
  category: GearCategory | "All Items";
  onCategoryChange: (value: GearCategory | "All Items") => void;
}

export function HeroSection({
  search,
  onSearchChange,
  category,
  onCategoryChange,
}: HeroSectionProps) {
  const searchRef = useRef<HTMLInputElement>(null);

  // Ctrl/⌘ + K focuses the marketplace search, Escape clears it.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
      if (event.key === "Escape" && document.activeElement === searchRef.current) {
        onSearchChange("");
        searchRef.current?.blur();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onSearchChange]);

  return (
    <section className="mb-6">
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-md border border-brand/25 bg-brand/[0.07] px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wide text-brand">
          MET BKC IOE · Nashik
        </span>
        <h1 className="mx-auto mt-3 max-w-3xl text-2xl font-bold tracking-tight text-fg sm:text-4xl">
          Buy &amp; Sell Pre-Loved Academic Gear on Campus
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-muted">
          Calculators, drafters, SPPU textbooks and hostel gear, straight from your batch. No listing
          fees, no commissions.
        </p>
      </div>

      <div className="mx-auto mt-5 max-w-2xl">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
          <input
            ref={searchRef}
            id="marketplace-search"
            type="text"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search calculators, drafters, lab coats, books..."
            aria-label="Search campus gear"
            className="input h-12 pl-11 pr-16 text-base"
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 select-none items-center gap-0.5 rounded border border-line bg-elevated px-1.5 py-0.5 font-mono text-[10px] text-muted sm:flex">
            Ctrl <span className="text-faint">+</span> K
          </kbd>
        </div>

        {/* Category filter chips */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {CATEGORY_FILTERS.map((option) => {
            const active = category === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onCategoryChange(option.value)}
                aria-pressed={active}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                  active
                    ? "border-brand bg-emerald-600 text-white"
                    : "border-line bg-surface text-muted hover:border-line-strong hover:text-fg"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}