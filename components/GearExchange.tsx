"use client";

import { Clock, MapPin, ShieldCheck, Sparkles, User } from "lucide-react";

import { CATEGORIES, LISTING_TYPE_LABEL, TYPE_FILTERS } from "@/lib/data";
import { CATEGORY_ICON, CONDITION_STYLES, TYPE_STYLES, formatPrice } from "@/lib/ui";
import type { GearCategory, GearListing, ListingType } from "@/lib/types";

interface GearExchangeProps {
  listings: GearListing[];
  category: GearCategory | "All Items";
  onCategoryChange: (value: GearCategory | "All Items") => void;
  typeFilter: ListingType | "All";
  onTypeFilterChange: (value: ListingType | "All") => void;
  onContact: (listing: GearListing) => void;
  search: string;
  branchFiltered: boolean;
  yearFiltered: boolean;
  onResetFilters: () => void;
}

export function GearExchange({
  listings,
  category,
  onCategoryChange,
  typeFilter,
  onTypeFilterChange,
  onContact,
  search,
  branchFiltered,
  yearFiltered,
  onResetFilters,
}: GearExchangeProps) {
  const hasFilters =
    Boolean(search) || category !== "All Items" || typeFilter !== "All" || branchFiltered || yearFiltered;

  return (
    <section className="animate-fade-up space-y-5">
      {/* Category pills */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="scroll-thin -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
          {CATEGORIES.map((option) => {
            const active = category === option;
            const Icon = option === "All Items" ? Sparkles : CATEGORY_ICON[option];
            return (
              <button
                key={option}
                type="button"
                onClick={() => onCategoryChange(option)}
                aria-pressed={active}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                  active
                    ? "border-brand/40 bg-brand/10 text-brand"
                    : "border-line bg-surface/60 text-muted hover:border-line-strong hover:text-fg"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {option}
              </button>
            );
          })}
        </div>

        <div className="flex shrink-0 items-center gap-1 self-start rounded-lg border border-line bg-elevated/60 p-1">
          {TYPE_FILTERS.map((option) => {
            const active = typeFilter === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => onTypeFilterChange(option)}
                aria-pressed={active}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                  active ? "bg-surface text-fg shadow-sm" : "text-muted hover:text-fg"
                }`}
              >
                {option === "All" ? "All" : LISTING_TYPE_LABEL[option]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Result meta */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">
          <span className="font-medium text-fg">{listings.length}</span>{" "}
          {listings.length === 1 ? "resource" : "resources"} available
          {hasFilters && <span className="text-faint"> · filtered</span>}
        </p>
        {hasFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="text-xs text-muted underline-offset-4 transition hover:text-brand hover:underline"
          >
            Reset filters
          </button>
        )}
      </div>

      {/* Grid */}
      {listings.length === 0 ? (
        <div className="card flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-elevated">
            <Sparkles className="h-5 w-5 text-faint" />
          </div>
          <div>
            <p className="text-sm font-medium text-fg">No resources found</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted">{emptyCopy(
              search,
              category,
              typeFilter,
              branchFiltered || yearFiltered,
            )}</p>
          </div>
          {hasFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="rounded-lg border border-line bg-elevated px-3 py-1.5 text-xs font-medium text-fg transition hover:bg-line"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {listings.map((listing) => (
            <GearCard key={listing.id} listing={listing} onContact={onContact} />
          ))}
        </div>
      )}
    </section>
  );
}

function emptyCopy(
  search: string,
  category: GearCategory | "All Items",
  typeFilter: ListingType | "All",
  branchOrYear: boolean,
): string {
  if (search) {
    return `No results for "${search}". Try a broader term like "calculator", "drafter" or "textbook".`;
  }
  if (branchOrYear) {
    return "No listings match those branch / year filters yet. Widen them, or list the first resource yourself.";
  }
  if (category !== "All Items") {
    return `No gear listed under ${category} on campus right now. Be the first to post one.`;
  }
  if (typeFilter !== "All") {
    return `No resources available under ${LISTING_TYPE_LABEL[typeFilter].toLowerCase()} yet.`;
  }
  return "The exchange is empty. List the first resource for your branch.";
}

function GearCard({
  listing,
  onContact,
}: {
  listing: GearListing;
  onContact: (listing: GearListing) => void;
}) {
  const Icon = CATEGORY_ICON[listing.category];
  const type = TYPE_STYLES[listing.listingType];
  const donate = listing.price === null;

  return (
    <article className="card card-hover group flex flex-col overflow-hidden">
      {/* Accent rail keyed to the listing type */}
      <div className={`h-0.5 w-full ${type.dot} opacity-80`} />

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-transform duration-200 group-hover:scale-105 ${type.iconBox}`}
          >
            <Icon className="h-5 w-5" strokeWidth={1.75} />
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium ${type.badge}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${type.dot}`} />
              {type.label}
            </span>
            {listing.featured && (
              <span className="pill border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300">
                <Sparkles className="h-2.5 w-2.5" />
                Featured
              </span>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-[15px] font-semibold leading-snug tracking-tight text-fg transition-colors group-hover:text-brand">
            {listing.title}
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-muted">{listing.subtitle}</p>
        </div>

        <div className="flex items-baseline gap-1.5">
          <span
            className={`text-2xl font-semibold tracking-tight ${
              listing.listingType === "sale" && !donate ? "text-fg" : type.accentText
            }`}
          >
            {formatPrice(listing.price, listing.priceUnit)}
          </span>
          {listing.price !== null && listing.priceUnit === "semester" && (
            <span className="text-xs text-muted">/ semester</span>
          )}
        </div>

        <dl className="grid grid-cols-2 items-center gap-x-3 gap-y-2 border-t border-line pt-3 text-xs">
          <div>
            <dt className="sr-only">Condition</dt>
            <dd>
              <span
                className={`inline-flex items-center rounded border px-1.5 py-0.5 font-medium ${CONDITION_STYLES[listing.condition]}`}
              >
                {listing.condition}
              </span>
            </dd>
          </div>
          <div className="text-right">
            <dt className="sr-only">Branch and year</dt>
            <dd className="font-mono text-muted">
              {listing.year} · {listing.branch}
            </dd>
          </div>
          <div className="col-span-2 flex items-center gap-1.5">
            <dt className="sr-only">Seller</dt>
            <dd className="flex min-w-0 items-center gap-1.5">
              <User className="h-3 w-3 shrink-0 text-faint" />
              <span className="truncate text-muted">{listing.seller}</span>
              {listing.verified && (
                <ShieldCheck className="h-3 w-3 shrink-0 text-brand" aria-label="Verified seller" />
              )}
            </dd>
          </div>
        </dl>

        <div className="mt-auto space-y-3 pt-1">
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <MapPin className="h-3 w-3 shrink-0 text-faint" />
            <span className="truncate">{listing.spot}</span>
          </div>

          <button
            type="button"
            onClick={() => onContact(listing)}
            className="w-full rounded-lg bg-fg px-3 py-2 text-sm font-semibold text-canvas transition hover:opacity-90"
          >
            Contact Seller
          </button>

          <div className="flex items-center justify-between text-[11px] text-faint">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-2.5 w-2.5" />
              {listing.postedAgo}
            </span>
            <span className="font-mono">{listing.id}</span>
          </div>
        </div>
      </div>
    </article>
  );
}