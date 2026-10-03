import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { GearListing } from "@/lib/types";

/**
 * Row shapes expected in Postgres. Keep these in sync with the SQL in
 * `supabase/schema.sql`.
 */
/**
 * Mirrors the live `listings` table. Note the naming differs from this app's
 * domain model: `type` (not `listing_type`), `seller_name`, `seller_contact`
 * and `meetup_spot`, and `id` is a Postgres `uuid` rather than free text.
 * Only these columns exist — see `toListingsRow` for how the rest of the
 * listing maps onto them.
 */
export interface ListingsRow {
  id: string;
  title: string;
  category: string;
  type: string;
  price: number;
  condition: string;
  seller_name: string;
  seller_contact: string;
  meetup_spot: string;
  branch: string;
  created_at: string;
}

export interface UsersRow {
  id: string;
  full_name: string;
  email: string;
  password: string;
  department: string;
  year: string;
  prn: string;
  /** Transient 6-digit code written by /api/auth/send-otp, null when unused. */
  reset_otp: string | null;
  /** ISO-8601 expiry; compared against now() server-side only. */
  otp_expires_at: string | null;
}

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * The project ships without Supabase credentials, and `createClient(undefined,
 * undefined)` throws at import time — which would take down the whole app. The
 * client is therefore created only when both variables are present, and every
 * call site treats `null` as "run on the local store instead".
 */
export const supabase: SupabaseClient | null =
  URL && ANON_KEY ? createClient(URL, ANON_KEY, { auth: { persistSession: false } }) : null;

export function isSupabaseConfigured(): boolean {
  return supabase !== null;
}

/**
 * `rent`/`donate` are part of the app's vocabulary but the table's `type`
 * column only carries the sale vocabulary, so both are stored as their own
 * values and read back faithfully.
 */
const LISTING_TYPES = ["rent", "sale", "donate"] as const;

/** Postgres row -> the app's camelCase `GearListing`. */
export function rowToListing(row: ListingsRow): GearListing {
  const type = LISTING_TYPES.includes(row.type as (typeof LISTING_TYPES)[number])
    ? (row.type as GearListing["listingType"])
    : "sale";

  return {
    id: row.id,
    title: row.title,
    subtitle: "",
    category: row.category as GearListing["category"],
    listingType: type,
    price: Number(row.price),
    priceUnit: type === "rent" ? "semester" : "one-time",
    condition: row.condition as GearListing["condition"],
    seller: row.seller_name,
    branch: row.branch as GearListing["branch"],
    year: "SE",
    spot: row.meetup_spot,
    phone: row.seller_contact,
    postedAgo: formatAge(row.created_at),
    featured: false,
    verified: false,
  };
}

/** The app's `GearListing` -> the Postgres row shape. */
export function toListingsRow(listing: GearListing, id: string, createdAt: string): ListingsRow {
  return {
    id,
    title: listing.title,
    category: listing.category,
    type: listing.listingType,
    price: Number(listing.price ?? 0),
    condition: listing.condition,
    seller_name: listing.seller,
    seller_contact: listing.phone,
    meetup_spot: listing.spot,
    branch: listing.branch,
    created_at: createdAt,
  };
}

/** Renders `created_at` as the short "2h ago" label the cards show. */
function formatAge(createdAt: string): string {
  const elapsed = Date.now() - new Date(createdAt).getTime();
  if (!Number.isFinite(elapsed) || elapsed < 0) return "Just now";

  const minutes = Math.floor(elapsed / 60_000);
  if (minutes < 60) return minutes <= 1 ? "Just now" : `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return days === 1 ? "1d ago" : `${days}d ago`;
}