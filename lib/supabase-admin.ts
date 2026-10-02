/**
 * Server-side Supabase helpers for the password-reset routes.
 *
 * The browser client in `lib/supabase.ts` uses the anon key, which cannot write
 * OTP columns: `users` has Row Level Security enabled with no write policy (see
 * `supabase/schema.sql`), so the reset flow would fail with a permission error.
 *
 * These routes run only on the server and therefore use the service role key,
 * which bypasses RLS. That key must never reach client code, so this module is
 * imported exclusively from `app/api/auth/**`.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

/**
 * Returns an RLS-bypassing client, or `null` when the service role key is
 * missing so callers can return a clear 503 instead of a confusing 400.
 */
export function adminSupabase(): SupabaseClient | null {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return null;

  cached = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

export const RESET_OTP_TTL_MINUTES = 10;

/** Email validation shared with the client so both ends agree on the rules. */
export const EMAIL_PATTERN = /^[^\s@]+@(met\.edu\.in|gmail\.com)$/i;

/** Normalises an address for lookups; Supabase stores them lower-cased. */
export function normaliseEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isAllowedEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email.trim());
}

/** Cryptographically-strong 6-digit code, zero-padded. */
export function generateOtp(): string {
  const value = crypto.getRandomValues(new Uint32Array(1))[0];
  return String(100000 + (value % 900000)).padStart(6, "0");
}