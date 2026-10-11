"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, PackagePlus, X } from "lucide-react";

import { CATEGORIES, CONDITIONS, LISTING_TYPE_LABEL, MEET_SPOTS } from "@/lib/data";
import { CATEGORY_ICON, normalisePhone } from "@/lib/ui";
import type { GearCondition, GearListing, ListingType, NewListingDraft } from "@/lib/types";
import { SubmitButton } from "./ContactModal";

interface ListResourceModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (listing: GearListing) => void;
}

const EMPTY_DRAFT: NewListingDraft = {
  title: "",
  category: "Calculators",
  listingType: "rent",
  price: "",
  condition: "Good",
  spot: MEET_SPOTS[0],
  phone: "",
};

const FIELD_CLASS =
  "h-9 w-full rounded-lg border border-line bg-sunken px-3 text-sm text-fg placeholder:text-faint outline-none transition hover:border-line-strong focus:border-brand/60 focus:ring-2 focus:ring-brand/15";

const LABEL_CLASS = "mb-1.5 block text-xs font-medium text-muted";

const TYPE_OPTIONS: ListingType[] = ["rent", "sale", "donate"];

export function ListResourceModal({ open, onClose, onSubmit }: ListResourceModalProps) {
  const [draft, setDraft] = useState<NewListingDraft>(EMPTY_DRAFT);
  const [errors, setErrors] = useState<Partial<Record<keyof NewListingDraft, string>>>({});
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setDraft(EMPTY_DRAFT);
    setErrors({});
    const timer = window.setTimeout(() => titleRef.current?.focus(), 80);

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const priceRequired = draft.listingType !== "donate";

  function update<K extends keyof NewListingDraft>(key: K, value: NewListingDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: Partial<Record<keyof NewListingDraft, string>> = {};

    if (draft.title.trim().length < 4) next.title = "Give the item a clear name (min 4 characters).";

    const digits = draft.phone.replace(/\D/g, "");
    if (digits.length < 10) next.phone = "Enter a 10-digit phone number so buyers can reach you.";

    if (priceRequired) {
      const parsed = Number(draft.price);
      if (!draft.price.trim() || Number.isNaN(parsed) || parsed < 0) {
        next.price = "Enter a price, or switch to Free / Donation.";
      }
    }

    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }

    const price = priceRequired ? Math.round(Number(draft.price)) : null;
    const phone = normalisePhone(draft.phone);

    onSubmit({
      id: `gear-${Date.now().toString(36)}`,
      title: draft.title.trim(),
      subtitle: `${draft.condition} · ${draft.spot}`,
      category: draft.category,
      listingType: draft.listingType,
      price,
      priceUnit: draft.listingType === "rent" ? "semester" : "one-time",
      condition: draft.condition as GearCondition,
      seller: "You · just listed",
      branch: "Computer",
      year: "TE",
      spot: draft.spot,
      phone: `+91 ${phone.slice(-10, -5)} ${phone.slice(-5)}`,
      postedAgo: "Just now",
      verified: true,
    });

    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="list-title"
    >
      <div
        className="absolute inset-0 animate-fade-in bg-sunken/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      <div className="relative max-h-[92dvh] w-full max-w-lg animate-scale-in overflow-y-auto rounded-t-3xl border border-line/80 bg-white/90 shadow-2xl shadow-black/50 backdrop-blur-md dark:bg-[#171411]/90 scroll-thin sm:rounded-3xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-line bg-surface/95 px-5 py-4 backdrop-blur">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-brand/25 bg-emerald-500/10">
              <PackagePlus className="h-5 w-5 text-brand" />
            </div>
            <div>
              <h2 id="list-title" className="text-sm font-semibold tracking-tight text-fg">
                List New Resource
              </h2>
              <p className="mt-0.5 text-xs text-muted">
                Goes live on the Gear Exchange instantly
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded-md p-1.5 text-muted transition hover:bg-elevated hover:text-fg"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          {/* Title */}
          <div>
            <label htmlFor="draft-title" className={LABEL_CLASS}>
              Title
            </label>
            <input
              ref={titleRef}
              id="draft-title"
              value={draft.title}
              onChange={(event) => update("title", event.target.value)}
              placeholder="e.g. Casio FX-991EX Scientific Calculator"
              className={FIELD_CLASS}
              aria-invalid={Boolean(errors.title)}
            />
            {errors.title && <p className="mt-1 text-xs text-rose-600 dark:text-rose-300">{errors.title}</p>}
          </div>

          {/* Category */}
          <div>
            <span className={LABEL_CLASS}>Category</span>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
              {CATEGORIES.filter((c): c is Exclude<typeof c, "All Items"> => c !== "All Items").map(
                (option) => {
                  const Icon = CATEGORY_ICON[option];
                  const active = draft.category === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => update("category", option)}
                      aria-pressed={active}
                      className={`flex flex-col items-center gap-1.5 rounded-lg border px-2 py-2.5 text-[11px] font-medium transition ${
                        active
                          ? "border-brand/40 bg-emerald-500/10 text-brand"
                          : "border-line bg-sunken text-muted hover:border-line-strong hover:text-fg"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-center leading-tight">{option}</span>
                    </button>
                  );
                },
              )}
            </div>
          </div>

          {/* Deal type */}
          <div>
            <span className={LABEL_CLASS}>Listing type</span>
            <div className="grid grid-cols-3 gap-1.5">
              {TYPE_OPTIONS.map((option) => {
                const active = draft.listingType === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => update("listingType", option)}
                    aria-pressed={active}
                    className={`rounded-lg border px-2 py-2 text-xs font-medium transition ${
                      active
                        ? option === "sale"
                          ? "border-indigo-500/40 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300"
                          : "border-brand/40 bg-emerald-500/10 text-brand"
                        : "border-line bg-sunken text-muted hover:border-line-strong hover:text-fg"
                    }`}
                  >
                    {LISTING_TYPE_LABEL[option]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price */}
          <div className={priceRequired ? "" : "opacity-50"}>
            <label htmlFor="draft-price" className={LABEL_CLASS}>
              {draft.listingType === "rent" ? "Price per semester (₹)" : "Price (₹)"}
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-muted">
                ₹
              </span>
              <input
                id="draft-price"
                type="number"
                min={0}
                disabled={!priceRequired}
                value={draft.price}
                onChange={(event) => update("price", event.target.value)}
                placeholder={priceRequired ? "50" : "Free / Donation"}
                className={`${FIELD_CLASS} pl-7`}
                aria-invalid={Boolean(errors.price)}
              />
            </div>
            {errors.price && <p className="mt-1 text-xs text-rose-600 dark:text-rose-300">{errors.price}</p>}
          </div>

          {/* Condition */}
          <div>
            <label htmlFor="draft-condition" className={LABEL_CLASS}>
              Condition
            </label>
            <div className="relative">
              <select
                id="draft-condition"
                value={draft.condition}
                onChange={(event) => update("condition", event.target.value as GearCondition)}
                className={`${FIELD_CLASS} appearance-none pr-8`}
              >
                {CONDITIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
            </div>
          </div>

          {/* Meetup spot */}
          <div>
            <label htmlFor="draft-spot" className={LABEL_CLASS}>
              Campus meetup spot
            </label>
            <div className="relative">
              <select
                id="draft-spot"
                value={draft.spot}
                onChange={(event) => update("spot", event.target.value)}
                className={`${FIELD_CLASS} appearance-none pr-8`}
              >
                {MEET_SPOTS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="draft-phone" className={LABEL_CLASS}>
              Phone number
            </label>
            <input
              id="draft-phone"
              type="tel"
              inputMode="tel"
              value={draft.phone}
              onChange={(event) => update("phone", event.target.value)}
              placeholder="+91 98204 55120"
              className={`${FIELD_CLASS} font-mono`}
              aria-invalid={Boolean(errors.phone)}
            />
            {errors.phone && <p className="mt-1 text-xs text-rose-600 dark:text-rose-300">{errors.phone}</p>}
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-line pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm font-medium text-muted transition hover:bg-elevated hover:text-fg"
            >
              Cancel
            </button>
            <SubmitButton />
          </div>
        </form>
      </div>
    </div>
  );
}
