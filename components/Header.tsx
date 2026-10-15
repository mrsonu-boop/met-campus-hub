"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  GraduationCap,
  Headphones,
  HelpCircle,
  LogOut,
  Plus,
  ShieldCheck,
} from "lucide-react";

import { ThemeToggle } from "@/components/ThemeToggle";
import { initials, useAuth } from "@/components/AuthProvider";
import { BRANCHES, YEARS } from "@/lib/data";
import type { Branch, Year } from "@/lib/types";

interface HeaderProps {
  branch: Branch | "All";
  onBranchChange: (value: Branch | "All") => void;
  year: Year | "All";
  onYearChange: (value: Year | "All") => void;
  onListResource: () => void;
  onSignIn: () => void;
  onHowToUse: () => void;
}

const SELECT_CLASS =
  "input h-9 cursor-pointer appearance-none py-0 pr-8";

export function Header({
  branch,
  onBranchChange,
  year,
  onYearChange,
  onListResource,
  onSignIn,
  onHowToUse,
}: HeaderProps) {
  const { user, isAuthenticated, signOut } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/70 backdrop-blur-xl">
      {/* ── Trust banner ────────────────────────────────────────────── */}
      <div className="border-b border-emerald-600/20 bg-emerald-600/[0.06]">
        <p className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-2 gap-y-0.5 px-4 py-1.5 text-center text-[11px] font-medium text-emerald-800 dark:text-emerald-300">
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" />
            Verified MET BKC Campus Marketplace
          </span>
          <span className="text-emerald-600/50 dark:text-emerald-400/40">•</span>
          <span>Direct Connect</span>
          <span className="text-emerald-600/50 dark:text-emerald-400/40">•</span>
          <span>Zero Fees</span>
        </p>
      </div>
      {/* ── Top bar ─────────────────────────────────────────────────── */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-elevated">
            <span className="font-mono text-[13px] font-semibold tracking-tight text-brand">
              MET
            </span>
            <span className="pointer-events-none absolute inset-0 rounded-[inherit] bg-brand/10" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="truncate text-[15px] font-semibold tracking-tight text-fg">
                MET Campus Hub
              </span>
              <span className="pill border-brand/25 bg-brand/10 text-brand">
                <span className="font-mono uppercase tracking-wide">MET BKC IOE</span>
              </span>
            </div>
            <p className="hidden text-xs text-muted sm:block">
              Campus gear &amp; study notes for MET students
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              window.open(
                "mailto:support@metbkc.edu.in?subject=MET%20Campus%20Hub%20Support",
                "_self",
              )
            }
            className="hidden items-center gap-2 rounded-lg border border-line bg-elevated px-3 py-2 text-sm font-medium text-muted transition hover:border-line-strong hover:text-fg md:inline-flex"
          >
            <Headphones className="h-4 w-4" />
            Contact Support
          </button>

          <button
            type="button"
            onClick={onHowToUse}
            className="inline-flex items-center gap-2 rounded-lg border border-line bg-elevated px-3 py-2 text-sm font-medium text-muted transition hover:border-line-strong hover:text-fg"
          >
            <HelpCircle className="h-4 w-4 text-brand" />
            <span className="hidden sm:inline">How to Use</span>
          </button>

          <button
            type="button"
            onClick={onListResource}
            className="btn-primary group gap-2 px-3.5 py-2"
          >
            <Plus className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" />
            <span className="hidden sm:inline">List Resource</span>
            <span className="sm:hidden">List</span>
          </button>

          <ThemeToggle />

          {/* Identity slot: Sign In button, or the student profile badge. */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen((prev) => !prev)}
                aria-expanded={profileOpen}
                aria-haspopup="menu"
                className="flex items-center gap-2 rounded-lg border border-line bg-elevated py-1 pl-1 pr-2 transition hover:border-line-strong"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand/12 text-[11px] font-semibold text-brand">
                  {initials(user.name)}
                </span>
                <span className="hidden min-w-0 text-left leading-tight lg:block">
                  <span className="block truncate text-xs font-semibold text-fg">
                    {user.name.split(" ")[0]}
                  </span>
                  <span className="block truncate text-[10px] text-muted">
                    {user.year} {user.department}
                  </span>
                </span>
                <ChevronDown
                  className={`h-3.5 w-3.5 shrink-0 text-muted transition-transform duration-200 ${
                    profileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    role="menu"
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                    className="panel absolute right-0 top-[calc(100%+0.5rem)] z-40 w-60 origin-top-right overflow-hidden p-1.5"
                  >
                    <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/12 text-xs font-semibold text-brand">
                        {initials(user.name)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-fg">{user.name}</p>
                        <p className="truncate text-[11px] text-muted">{user.email}</p>
                      </div>
                    </div>

                    <dl className="space-y-1 rounded-lg bg-elevated px-2.5 py-2 text-[11px]">
                      <div className="flex justify-between gap-2">
                        <dt className="text-faint">Department</dt>
                        <dd className="truncate font-medium text-muted">{user.department}</dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt className="text-faint">Year</dt>
                        <dd className="font-medium text-muted">{user.year}</dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt className="text-faint">PRN</dt>
                        <dd className="font-mono font-medium text-muted">{user.prn}</dd>
                      </div>
                    </dl>

                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setProfileOpen(false);
                        signOut();
                      }}
                      className="mt-1 flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-muted transition hover:bg-elevated hover:text-fg"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Log Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              type="button"
              onClick={onSignIn}
              className="inline-flex items-center gap-2 rounded-lg border border-line bg-elevated px-3 py-2 text-sm font-semibold text-fg transition hover:border-line-strong"
            >
              <GraduationCap className="h-4 w-4 text-brand" />
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* ── Branch / year filter row ────────────────────────────────── */}
      <div className="border-t border-line bg-elevated/40">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p className="text-xs text-muted">Filter the market by department and year</p>

          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center">
            <div className="relative">
              <select
                value={branch}
                onChange={(event) => onBranchChange(event.target.value as Branch | "All")}
                aria-label="Filter by branch"
                className={SELECT_CLASS}
              >
                <option value="All">All Branches</option>
                {BRANCHES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-faint" />
            </div>

            <div className="relative">
              <select
                value={year}
                onChange={(event) => onYearChange(event.target.value as Year | "All")}
                aria-label="Filter by year"
                className={SELECT_CLASS}
              >
                <option value="All">All Years</option>
                {YEARS.map((option) => (
                  <option key={option} value={option}>
                    Year {option}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-faint" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}