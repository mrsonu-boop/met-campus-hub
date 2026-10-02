import {
  BookOpen,
  Calculator,
  PenTool,
  Shirt,
  type LucideIcon,
} from "lucide-react";

import type { GearCategory, ListingType } from "@/lib/types";

/** Category -> Lucide icon, so cards read at a glance. */
export const CATEGORY_ICON: Record<GearCategory, LucideIcon> = {
  Textbooks: BookOpen,
  Calculators: Calculator,
  "Drawing Drafters": PenTool,
  "Lab Coats": Shirt,
};

/**
 * Distinct colour treatment per listing type. Each colour is tuned for both
 * themes: the `-600` step reads on off-white, the `-300` step reads on obsidian.
 */
export const TYPE_STYLES: Record<
  ListingType,
  { label: string; badge: string; dot: string; accentText: string; iconBox: string }
> = {
  rent: {
    label: "Rent",
    badge:
      "border-emerald-600/25 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/25 dark:text-emerald-300",
    dot: "bg-emerald-500 dark:bg-emerald-400",
    accentText: "text-emerald-700 dark:text-emerald-300",
    iconBox:
      "border-emerald-600/20 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/20 dark:text-emerald-300",
  },
  sale: {
    label: "Sale",
    badge:
      "border-indigo-600/25 bg-indigo-500/10 text-indigo-700 dark:border-indigo-400/25 dark:text-indigo-300",
    dot: "bg-indigo-500 dark:bg-indigo-400",
    accentText: "text-indigo-700 dark:text-indigo-300",
    iconBox:
      "border-indigo-600/20 bg-indigo-500/10 text-indigo-700 dark:border-indigo-400/20 dark:text-indigo-300",
  },
  donate: {
    label: "Free / Donation",
    badge:
      "border-teal-600/25 bg-teal-500/10 text-teal-700 dark:border-teal-300/25 dark:text-teal-200",
    dot: "bg-teal-500 dark:bg-teal-300",
    accentText: "text-teal-700 dark:text-teal-200",
    iconBox:
      "border-teal-600/20 bg-teal-500/10 text-teal-700 dark:border-teal-300/20 dark:text-teal-200",
  },
};

export const ACCENT_STYLES: Record<
  string,
  { text: string; ring: string; iconBg: string; bar: string }
> = {
  emerald: {
    text: "text-emerald-700 dark:text-emerald-300",
    ring: "ring-emerald-500/20",
    iconBg:
      "border-emerald-600/20 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/20 dark:text-emerald-300",
    bar: "bg-emerald-500 dark:bg-emerald-400",
  },
  indigo: {
    text: "text-indigo-700 dark:text-indigo-300",
    ring: "ring-indigo-500/20",
    iconBg:
      "border-indigo-600/20 bg-indigo-500/10 text-indigo-700 dark:border-indigo-400/20 dark:text-indigo-300",
    bar: "bg-indigo-500 dark:bg-indigo-400",
  },
  violet: {
    text: "text-violet-700 dark:text-violet-300",
    ring: "ring-violet-500/20",
    iconBg:
      "border-violet-600/20 bg-violet-500/10 text-violet-700 dark:border-violet-400/20 dark:text-violet-300",
    bar: "bg-violet-500 dark:bg-violet-400",
  },
  sky: {
    text: "text-sky-700 dark:text-sky-300",
    ring: "ring-sky-500/20",
    iconBg:
      "border-sky-600/20 bg-sky-500/10 text-sky-700 dark:border-sky-400/20 dark:text-sky-300",
    bar: "bg-sky-500 dark:bg-sky-400",
  },
  amber: {
    text: "text-amber-700 dark:text-amber-300",
    ring: "ring-amber-500/20",
    iconBg:
      "border-amber-600/20 bg-amber-500/10 text-amber-700 dark:border-amber-400/20 dark:text-amber-300",
    bar: "bg-amber-500 dark:bg-amber-400",
  },
  rose: {
    text: "text-rose-700 dark:text-rose-300",
    ring: "ring-rose-500/20",
    iconBg:
      "border-rose-600/20 bg-rose-500/10 text-rose-700 dark:border-rose-400/20 dark:text-rose-300",
    bar: "bg-rose-500 dark:bg-rose-400",
  },
};

export const CONDITION_STYLES: Record<string, string> = {
  "Like New":
    "text-emerald-700 border-emerald-600/20 bg-emerald-500/[0.07] dark:text-emerald-300 dark:border-emerald-400/20",
  Good: "text-muted border-line bg-elevated",
  Fair: "text-amber-700 border-amber-600/20 bg-amber-500/[0.07] dark:text-amber-300 dark:border-amber-400/20",
};

export function formatPrice(price: number | null, unit?: "semester" | "one-time"): string {
  if (price === null) return "FREE";
  if (unit === "semester") return `₹${price}/sem`;
  return `₹${price.toLocaleString("en-IN")}`;
}

/**
 * Normalises a stored phone number for `wa.me` / `tel:` links.
 * Listings may hold "+91 98204 55120", "098204 55120" or a bare 10-digit
 * number, so the country code is added only when it is actually missing —
 * prefixing blindly would produce an unusable 14-digit number.
 */
export function normalisePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "").replace(/^0+/, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  if (digits.length === 11 && digits.startsWith("0")) return `91${digits.slice(1)}`;
  return digits;
}