import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { GearListing } from "@/lib/types";

/**
 * Row shapes expected in Postgres. Keep these in sync with the SQL in
 * `supabase/schema.sql`.
 */
export interface ListingsRow {
  id: string;
  title: string;
  subtitle: string | null;
  category: string;
  listing_type: string;
  price: number | null;
  price_unit: string | null;
  condition: string;
  seller: string;
  branch: string;
  year: string;
  spot: string;
  phone: string;
  posted_ago: string;
  featured: boolean;
  verified: boolean;
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

/** Postgres snake_case -> the app's camelCase `GearListing`. */
export function rowToListing(row: ListingsRow): GearListing {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle ?? "",
    category: row.category as GearListing["category"],
    listingType: row.listing_type as GearListing["listingType"],
    price: row.price,
    priceUnit: (row.price_unit as GearListing["priceUnit"]) ?? undefined,
    condition: row.condition as GearListing["condition"],
    seller: row.seller,
    branch: row.branch as GearListing["branch"],
    year: row.year as GearListing["year"],
    spot: row.spot,
    phone: row.phone,
    postedAgo: row.posted_ago ?? "Just now",
    featured: Boolean(row.featured),
    verified: Boolean(row.verified),
  };
}

/** `GearListing` -> Postgres row. `email`-style normalisation is the caller's job. */
export function listingToRow(listing: GearListing): ListingsRow {
  return {
    id: listing.id,
    title: listing.title,
    subtitle: listing.subtitle,
    category: listing.category,
    listing_type: listing.listingType,
    price: listing.price,
    price_unit: listing.priceUnit ?? null,
    condition: listing.condition,
    seller: listing.seller,
    branch: listing.branch,
    year: listing.year,
    spot: listing.spot,
    phone: listing.phone,
    posted_ago: listing.postedAgo,
    featured: Boolean(listing.featured),
    verified: Boolean(listing.verified),
  };
}