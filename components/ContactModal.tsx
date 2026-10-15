"use client";

import { useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { Check, MessageCircle, Phone, ShieldCheck, X } from "lucide-react";

import { LISTING_TYPE_LABEL } from "@/lib/data";
import { CATEGORY_ICON, formatPrice, normalisePhone } from "@/lib/ui";
import type { GearListing } from "@/lib/types";

interface ContactModalProps {
  listing: GearListing | null;
  onClose: () => void;
}

export function ContactModal({ listing, onClose }: ContactModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!listing) return;
    const timer = window.setTimeout(() => closeRef.current?.focus(), 60);

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [listing, onClose]);

  if (!listing) return null;

  const Icon = CATEGORY_ICON[listing.category];
  const digits = normalisePhone(listing.phone);
  const whatsappText = encodeURIComponent(
    `Hi ${listing.seller}, I saw your "${listing.title}" listing on MET Campus Hub (${listing.price === null ? "free" : formatPrice(listing.price, listing.priceUnit)}). Is it still available?`,
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-title"
    >
      <div
        className="absolute inset-0 animate-fade-in bg-sunken/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      <div className="relative w-full max-w-md animate-scale-in overflow-hidden rounded-t-2xl border border-line bg-surface shadow-2xl shadow-black/60 sm:rounded-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-line p-5">
          <div className="flex min-w-0 items-start gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${
                listing.listingType === "sale"
                  ? "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                  : "border-brand/20 bg-emerald-500/10 text-brand"
              }`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 id="contact-title" className="truncate text-sm font-semibold text-fg">
                {listing.title}
              </h2>
              <p className="mt-0.5 text-xs text-muted">
                {LISTING_TYPE_LABEL[listing.listingType]} ·{" "}
                <span className="text-brand">
                  {formatPrice(listing.price, listing.priceUnit)}
                </span>
              </p>
            </div>
          </div>

          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded-md p-1.5 text-muted transition hover:bg-elevated hover:text-fg"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <dl className="space-y-2 rounded-lg border border-line bg-sunken/60 p-3.5 text-xs">
            <Row label="Seller">
              <span className="text-muted">
                {listing.seller}
                {listing.verified && (
                  <ShieldCheck className="ml-1.5 inline h-3 w-3 text-brand" aria-label="Verified" />
                )}
              </span>
            </Row>
            <Row label="Condition">
              <span className="text-muted">{listing.condition}</span>
            </Row>
            <Row label="Meetup spot">
              <span className="text-muted">{listing.spot}</span>
            </Row>
            <Row label="Listing ID">
              <span className="font-mono text-muted">{listing.id}</span>
            </Row>
          </dl>

          <div className="rounded-lg border border-brand/20 bg-brand/[0.06] p-3.5">
            <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-brand">
              <Phone className="h-3 w-3" />
              Phone
            </p>
            <a
              href={`tel:${digits}`}
              className="mt-1 block font-mono text-base font-semibold text-fg underline-offset-4 transition hover:text-brand hover:underline"
            >
              {listing.phone}
            </a>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <a
              href={`https://wa.me/${digits}?text=${whatsappText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
            <a
              href={`tel:${digits}`}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-line-strong bg-elevated px-3 py-2.5 text-sm font-medium text-fg transition hover:border-line hover:bg-sunken"
            >
              <Phone className="h-4 w-4" />
              Call now
            </a>
          </div>

          <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-faint">
            <Check className="mt-0.5 h-3 w-3 shrink-0 text-faint" />
            Always inspect the item before paying. Confirm the handoff in the Campus Exchange tab so
            escrow is released safely.
          </p>
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className="truncate text-right">{children}</dd>
    </div>
  );
}

/** Shared by the listing dialog so the submit button can show a pending state. */
export function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-primary gap-2"
    >
      {pending ? "Publishing…" : "Publish to Campus Exchange"}
    </button>
  );
}
