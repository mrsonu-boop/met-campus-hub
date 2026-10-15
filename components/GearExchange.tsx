"use client";

import { MapPin, ShieldCheck, Sparkles, User } from "lucide-react";

import { LISTING_TYPE_LABEL, TYPE_FILTERS } from "@/lib/data";
import { CATEGORY_ICON, CONDITION_STYLES, TYPE_STYLES, formatPrice } from "@/lib/ui";
import type { GearCategory, GearListing, ListingType } from "@/lib/types";

interface GearExchangeProps {
  listings: GearListing[];
  category: GearCategory | "All Items";
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
  typeFilter,
  onTypeFilterChange,
  onContact,
  search,
  branchFiltered,
  yearFiltered,
  onResetFilters,
}: GearExchangeProps) {
  const hasFilters =
    Boolean(search) ||
    category !== "All Items" ||
    typeFilter !== "All" ||
    branchFiltered ||
    yearFiltered;

  return (
    <section className="animate-fade-up space-y-4">
      {/* Type filter + result meta */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="order-2 text-sm text-muted sm:order-1">
          <span className="font-medium text-fg">{listings.length}</span>{" "}
          {listings.length === 1 ? "item" : "items"} on the market
          {hasFilters && <span className="text-faint"> · filtered</span>}
        </p>

        <div className="order-1 flex shrink-0 items-center gap-1 self-start rounded-xl border border-line bg-elevated/60 p-1 sm:order-2">
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

        {hasFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="order-3 hidden text-xs text-muted underline-offset-4 transition hover:text-brand hover:underline sm:block"
          >
            Reset filters
          </button>
        )}
      </div>

      {/* Marketplace grid — 1 column on mobile, 3 on desktop. */}
      {listings.length === 0 ? (
        <div className="rounded-xl border border-line bg-surface flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-elevated">
            <Sparkles className="h-5 w-5 text-faint" />
          </div>
          <div>
            <p className="text-sm font-medium text-fg">No items found</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted">
              {emptyCopy(search, category, typeFilter, branchFiltered || yearFiltered)}
            </p>
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
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
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

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
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

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-line bg-surface transition hover:border-line-strong hover:shadow-sm">
      {/* Product image / placeholder with overlay tags. */}
      <div className="relative flex aspect-[4/3] items-center justify-center border-b border-line bg-elevated">
        <Icon className="h-12 w-12 text-faint" strokeWidth={1.5} aria-hidden />

        {/* Department / Year tag — top-left */}
        <span className="absolute left-2.5 top-2.5 rounded-md border border-line bg-surface/95 px-2 py-0.5 font-mono text-[10px] font-medium text-fg">
          {listing.year} {listing.branch}
        </span>

        {/* Condition badge — top-right */}
        <span
          className={`absolute right-2.5 top-2.5 rounded-md border px-2 py-0.5 text-[10px] font-medium ${
            CONDITION_STYLES[listing.condition]
          }`}
        >
          {listing.condition}
        </span>

        {listing.featured && (
          <span className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1 rounded-md border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-300">
            <Sparkles className="h-2.5 w-2.5" />
            Featured
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <div>
          <h3 className="text-[15px] font-semibold leading-snug tracking-tight text-fg">
            {listing.title}
          </h3>
          <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted">
            {listing.subtitle}
          </p>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
            {formatPrice(listing.price, listing.priceUnit)}
          </span>
          <span
            className={`rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${type.badge}`}
          >
            {type.label}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted">
          <span className="inline-flex min-w-0 items-center gap-1">
            <User className="h-3 w-3 shrink-0 text-faint" />
            <span className="truncate">{listing.seller}</span>
            {listing.verified && (
              <ShieldCheck className="h-3 w-3 shrink-0 text-brand" aria-label="Verified seller" />
            )}
          </span>
          <span className="inline-flex min-w-0 items-center gap-1">
            <MapPin className="h-3 w-3 shrink-0 text-faint" />
            <span className="truncate">{listing.spot}</span>
          </span>
        </div>

        <button
          type="button"
          onClick={() => onContact(listing)}
          className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          <WhatsAppIcon className="h-4 w-4" />
          Chat on WhatsApp
        </button>
      </div>
    </article>
  );
}