"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  BookMarked,
  CheckCircle2,
  GraduationCap,
  PackageCheck,
  ShoppingBag,
  Sparkles,
  X,
} from "lucide-react";

import { AiDrawer } from "@/components/AiDrawer";
import { AuthModal, type AuthTab } from "@/components/AuthModal";
import { AuthProvider, useAuth } from "@/components/AuthProvider";
import { CampusExchange } from "@/components/CampusExchange";
import { ContactModal } from "@/components/ContactModal";
import { GearExchange } from "@/components/GearExchange";
import { Header } from "@/components/Header";
import { KnowledgeVault } from "@/components/KnowledgeVault";
import { ListResourceModal } from "@/components/ListResourceModal";
import { OnboardingModal } from "@/components/OnboardingModal";

import { NOTE_SETS, SEED_LISTINGS, SEED_TRANSACTIONS } from "@/lib/data";
import {
  isSupabaseConfigured,
  rowToListing,
  supabase,
  toListingsRow,
  type ListingsRow,
} from "@/lib/supabase";
import type {
  Branch,
  ExchangeTransaction,
  GearCategory,
  GearListing,
  ListingType,
  NoteSet,
  NoteUnit,
  TabId,
  Year,
} from "@/lib/types";

const TABS: Array<{ id: TabId; label: string; short: string; icon: typeof ShoppingBag }> = [
  { id: "gear", label: "Gear Exchange", short: "Gear", icon: ShoppingBag },
  { id: "vault", label: "Knowledge Vault & AI Assistant", short: "Vault", icon: BookMarked },
  { id: "exchange", label: "Verified Exchange & QR Handoff", short: "Handoff", icon: PackageCheck },
];

const TAB_HINTS: Record<TabId, string> = {
  gear:
    "Rent, sell or donate within campus. Meet only at verified IOE spots and confirm handoffs in the Verified Exchange tab.",
  vault:
    "Unit-wise SPPU notes, faculty-verified. Download the PDF or open the AI drawer to ask about any single unit.",
  exchange:
    "Scan the QR at the meetup spot, read out the 4-digit PIN, and escrow is released to the seller.",
};

interface AiContext {
  noteSet: NoteSet;
  unit: NoteUnit | null;
}

export default function CampusHubPage() {
  return (
    <AuthProvider>
      <CampusHub />
    </AuthProvider>
  );
}

function CampusHub() {
  const { isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>("gear");

  // Global filters — shared by every tab.
  const [search, setSearch] = useState("");
  const [branch, setBranch] = useState<Branch | "All">("All");
  const [year, setYear] = useState<Year | "All">("All");

  // Tab-local filters.
  const [category, setCategory] = useState<GearCategory | "All Items">("All Items");
  const [typeFilter, setTypeFilter] = useState<ListingType | "All">("All");

  // Collections.
  const [listings, setListings] = useState<GearListing[]>(SEED_LISTINGS);
  const [transactions, setTransactions] = useState<ExchangeTransaction[]>(SEED_TRANSACTIONS);
  const [activeTxnId, setActiveTxnId] = useState<string | null>(SEED_TRANSACTIONS[0].id);

  // Overlays.
  const [contactListing, setContactListing] = useState<GearListing | null>(null);
  const [listModalOpen, setListModalOpen] = useState(false);
  const [aiContext, setAiContext] = useState<AiContext | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  const [authOpen, setAuthOpen] = useState(false);
  const [authIntent, setAuthIntent] = useState<string | null>(null);
  const [authTab, setAuthTab] = useState<AuthTab>("signin");

  const toastTimer = useRef<number | null>(null);

  /* ── Cloud sync ────────────────────────────────────────────────
   * Pull the shared exchange from Supabase on load. An empty table (or no
   * Supabase config at all) falls back to the bundled seed so the page is
   * never empty. */
  useEffect(() => {
    if (!supabase) return;

    let cancelled = false;

    void (async () => {
      try {
        const { data, error } = await supabase
          .from("listings")
          .select("*")
          .order("created_at", { ascending: false });
        if (cancelled || error || !data || data.length === 0) return;
        setListings((data as ListingsRow[]).map(rowToListing));
      } catch {
        // Network hiccup — the seed data already on screen stays in play.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // First-time visitors see the three-step guide once; "How to Use" reopens it.
  useEffect(() => {
    try {
      if (!window.localStorage.getItem("met_hub_onboarding")) setOnboardingOpen(true);
    } catch {
      // localStorage unavailable (private mode) — just show the guide.
      setOnboardingOpen(true);
    }
  }, []);

  const dismissOnboarding = useCallback(() => {
    try {
      window.localStorage.setItem("met_hub_onboarding", "1");
    } catch {
      /* never block closing the guide */
    }
    setOnboardingOpen(false);
  }, []);

  /**
   * Writes a new listing to Supabase and returns the stored row.
   *
   * The `listings.id` column is a `uuid`, so the app's readable `gear-…` id
   * cannot be used as the primary key. A UUID is generated here instead and the
   * id returned by Postgres becomes the listing's identity, which keeps
   * contact/handoff actions pointing at the right row.
   *
   * Returns `null` when the write fails, so the caller can keep the optimistic
   * copy and surface the failure rather than pretending it was saved.
   */
  const persistListing = useCallback(
    async (listing: GearListing): Promise<ListingsRow | null> => {
      if (!supabase) return null;
      try {
        const id = crypto.randomUUID();
        const createdAt = new Date().toISOString();
        const { data, error } = await supabase
          .from("listings")
          .insert(toListingsRow(listing, id, createdAt))
          .select()
          .single();

        if (error) {
          console.error("Supabase listing insert failed:", error.message);
          return null;
        }
        return (data ?? { ...toListingsRow(listing, id, createdAt) }) as ListingsRow;
      } catch (error) {
        console.error("Supabase listing insert failed:", error);
        return null;
      }
    },
    [],
  );

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3600);
  }, []);

  /**
   * Protected actions (list a resource, contact a seller) route through here so
   * a signed-out visitor always lands on the auth dialog with the reason
   * explained, instead of silently doing nothing.
   */
  const requireAuth = useCallback(
    (intent: string, run: () => void) => {
      if (isAuthenticated) {
        run();
        return;
      }
      setAuthIntent(intent);
      setAuthTab("signin");
      setAuthOpen(true);
    },
    [isAuthenticated],
  );

  const query = search.trim().toLowerCase();

  /* ── Gear Exchange ─────────────────────────────────────────────── */
  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      if (branch !== "All" && listing.branch !== branch) return false;
      if (year !== "All" && listing.year !== year) return false;
      if (category !== "All Items" && listing.category !== category) return false;
      if (typeFilter !== "All" && listing.listingType !== typeFilter) return false;
      if (query) {
        const haystack = [
          listing.title,
          listing.subtitle,
          listing.seller,
          listing.spot,
          listing.category,
          listing.branch,
          listing.year,
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
  }, [branch, category, listings, query, typeFilter, year]);

  /* ── Knowledge Vault ───────────────────────────────────────────── */
  const filteredNoteSets = useMemo(() => {
    return NOTE_SETS.filter((noteSet) => {
      if (branch !== "All" && noteSet.branch !== branch) return false;
      if (year !== "All" && noteSet.semester !== year) return false;
      if (query) {
        const haystack = [
          noteSet.subject,
          noteSet.courseCode,
          noteSet.description,
          noteSet.units.map((unit) => `${unit.unit} ${unit.topics.join(" ")}`).join(" "),
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
  }, [branch, query, year]);

  /* ── Handoff tracker ───────────────────────────────────────────── */
  const filteredTransactions = useMemo(() => {
    return transactions.filter((txn) => {
      if (branch !== "All" && txn.branch !== branch) return false;
      if (year !== "All" && txn.year !== year) return false;
      if (query && !`${txn.item} ${txn.counterparty} ${txn.meetSpot}`.toLowerCase().includes(query)) {
        return false;
      }
      return true;
    });
  }, [branch, query, transactions, year]);

  const resetFilters = useCallback(() => {
    setCategory("All Items");
    setTypeFilter("All");
  }, []);

  const handleNewListing = useCallback(
    (listing: GearListing) => {
      // Optimistic: show it immediately with a local id, then swap in the
      // Postgres row once the insert resolves so the card carries the real
      // uuid that contact/handoff actions depend on.
      setListings((prev) => [listing, ...prev]);
      setActiveTab("gear");
      setCategory("All Items");
      setTypeFilter("All");

      void (async () => {
        const row = await persistListing(listing);

        if (!row) {
          // Local mode (no Supabase) — nothing to reconcile.
          if (isSupabaseConfigured()) {
            showToast(`"${listing.title}" is visible here but could not be synced.`);
          } else {
            showToast(`"${listing.title}" is live on the Gear Exchange.`);
          }
          return;
        }

        setListings((prev) =>
          prev.map((item) => (item.id === listing.id ? rowToListing(row) : item)),
        );
        showToast(`"${listing.title}" is live on the Gear Exchange.`);
      })();
    },
    [persistListing, showToast],
  );

  const handleStatusChange = useCallback(
    (id: string, status: ExchangeTransaction["status"]) => {
      setTransactions((prev) => prev.map((txn) => (txn.id === id ? { ...txn, status } : txn)));
      showToast(
        status === "verified"
          ? "Handoff verified — escrow released to the seller."
          : "Transaction reopened and moved back to the active queue.",
      );
    },
    [showToast],
  );

  const counts: Record<TabId, number> = {
    gear: filteredListings.length,
    vault: filteredNoteSets.length,
    exchange: filteredTransactions.length,
  };

  return (
    <>
      <Header
        search={search}
        onSearchChange={setSearch}
        branch={branch}
        onBranchChange={setBranch}
        year={year}
        onYearChange={setYear}
        onListResource={() =>
          requireAuth("Sign in to publish a resource to the campus exchange.", () =>
            setListModalOpen(true),
          )
        }
        onFocusSearch={() => setSearch((prev) => prev)}
        onSignIn={() => {
          setAuthIntent(null);
          setAuthTab("signin");
          setAuthOpen(true);
        }}
        onHowToUse={() => setOnboardingOpen(true)}
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Hero — elegant serif headline over the pastel glass. */}
        <section className="animate-fade-up mb-7">
          <span className="pill border-brand/25 bg-brand/[0.07] text-brand">
            MET BKC IOE &middot; Nashik
          </span>
          <h1 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-fg sm:text-[2.6rem] sm:leading-[1.1]">
            Study smarter, every single day.
          </h1>
          <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-muted sm:text-[15px]">
            Rent or swap campus gear, grab SPPU-aligned notes, and ask the AI
            assistant &mdash; all from one place, right here at MET.
          </p>
        </section>

        {/* Segmented control — floating pill nav */}
        <div className="mb-5 flex flex-col gap-3">
          <div
            role="tablist"
            aria-label="Campus Hub sections"
            className="scroll-thin -mx-1 flex gap-1 overflow-x-auto rounded-full border border-line/80 bg-white/60 p-1 shadow-sm backdrop-blur-md dark:bg-white/[0.06]"
          >
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  type="button"
                  aria-selected={active}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    active ? "text-canvas" : "text-muted hover:text-fg"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="hub-tab-pill"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      className="absolute inset-0 rounded-full bg-black shadow-[0_6px_16px_-6px_rgb(0_0_0/0.5)]"
                    />
                  )}
                  <Icon className={`relative z-10 h-4 w-4 ${active ? "text-white" : "text-brand"}`} />
                  <span className="relative z-10 hidden sm:inline">{tab.label}</span>
                  <span className="relative z-10 sm:hidden">{tab.short}</span>
                  <span
                    className={`relative z-10 rounded-full px-1.5 py-0.5 font-mono text-[10px] ${
                      active ? "bg-white/20 text-white" : "bg-white/70 text-faint dark:bg-white/10"
                    }`}
                  >
                    {counts[tab.id]}
                  </span>
                </button>
              );
            })}
          </div>

          <p className="flex items-start gap-2 text-xs leading-relaxed text-muted">
            <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-brand" />
            {TAB_HINTS[activeTab]}
          </p>
        </div>

        {/* Active tab content */}
        {activeTab === "gear" && (
          <GearExchange
            listings={filteredListings}
            category={category}
            onCategoryChange={setCategory}
            typeFilter={typeFilter}
            onTypeFilterChange={setTypeFilter}
            onContact={(listing) =>
              requireAuth("Sign in so the seller knows who is messaging them.", () =>
                setContactListing(listing),
              )
            }
            search={search}
            branchFiltered={branch !== "All"}
            yearFiltered={year !== "All"}
            onResetFilters={resetFilters}
          />
        )}

        {activeTab === "vault" && (
          <KnowledgeVault
            noteSets={filteredNoteSets}
            onAskAi={(noteSet, unit) => setAiContext({ noteSet, unit })}
          />
        )}

        {activeTab === "exchange" && (
          <CampusExchange
            transactions={filteredTransactions}
            activeId={activeTxnId}
            onSelect={setActiveTxnId}
            onStatusChange={handleStatusChange}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-line bg-surface/50">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 px-4 py-6 text-xs text-faint sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <p className="inline-flex items-center gap-1.5">
            <GraduationCap className="h-3.5 w-3.5" />
            MET Campus Hub — a student-run exchange for MET BKC IOE, SPPU curriculum.
          </p>
          <p className="font-mono">
            Handoffs protected by QR + PIN escrow · Built with Next.js 15
          </p>
        </div>
      </footer>

      {/* Toast */}
      {toast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-5 z-[60] flex justify-center px-4">
          <div className="card pointer-events-auto flex max-w-md animate-fade-up items-start gap-2.5 px-4 py-3 glow-emerald">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
            <p className="text-sm text-fg">{toast}</p>
            <button
              type="button"
              onClick={() => setToast(null)}
              aria-label="Dismiss"
              className="-mr-1 shrink-0 rounded p-0.5 text-muted transition hover:text-fg"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Overlays */}
      <ContactModal listing={contactListing} onClose={() => setContactListing(null)} />

      <ListResourceModal
        open={listModalOpen}
        onClose={() => setListModalOpen(false)}
        onSubmit={handleNewListing}
      />

      <AuthModal
        open={authOpen}
        intent={authIntent}
        initialTab={authTab}
        onClose={() => {
          setAuthOpen(false);
          setAuthIntent(null);
        }}
      />

      {aiContext && (
        <AiDrawer
          noteSet={aiContext.noteSet}
          unit={aiContext.unit}
          onClose={() => setAiContext(null)}
        />
      )}

      <OnboardingModal open={onboardingOpen} onClose={dismissOnboarding} />

      {/* Screen-reader announcement of the active identity. */}
      <p className="sr-only" aria-live="polite">
        {user ? `Signed in as ${user.name}, ${user.year} ${user.department}.` : "Signed out."}
      </p>
    </>
  );
}