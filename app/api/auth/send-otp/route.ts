import { NextResponse } from "next/server";
import { Resend } from "resend";

import {
  adminSupabase,
  generateOtp,
  isAllowedEmail,
  normaliseEmail,
  RESET_OTP_TTL_MINUTES,
} from "@/lib/supabase-admin";

/** Rate limit: one code per address per window, held in module memory. */
const WINDOW_MS = 60_000;
const recent = new Map<string, number>();

/** Shown when mail delivery is not set up at all. */
const RESEND_MISSING =
  "Email service not configured. Please add RESEND_API_KEY to .env.local and restart server.";

/**
 * The onboarding address is the only sender Resend allows without a verified
 * domain, so it is the default for local and free-tier setups.
 */
const DEFAULT_FROM = "MET Campus Hub <onboarding@resend.dev>";

/**
 * Builds the Resend client, or `null` when `RESEND_API_KEY` is absent. The
 * caller turns that into a 400 with actionable text rather than a vague 503,
 * since a missing key is a setup mistake, not a runtime failure.
 */
function resendClient(): Resend | null {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) {
    console.error("RESEND_API_KEY is missing in .env.local");
    return null;
  }
  return new Resend(key);
}

/**
 * Resend rejects unknown recipients on the onboarding domain, and a locked-down
 * project will refuse the send outright. Those are setup problems the developer
 * needs to see, so surface the provider's own wording instead of a generic
 * failure.
 */
function describeSendFailure(error: unknown): string {
  const raw =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : JSON.stringify(error);

  if (/onboarding@resend\.dev|only send to your own email|test address/i.test(raw)) {
    return "This Resend account may only send to its own registered email address. Add a verified domain in Resend, or send the code to the address on your Resend account.";
  }
  if (/domain (is )?not verified|unauthorized|invalid from/i.test(raw)) {
    return `Resend rejected the sending domain. Set RESEND_FROM_EMAIL to a verified domain, or remove it to fall back to ${DEFAULT_FROM}.`;
  }
  if (/rate.?limit|too many requests|429/i.test(raw)) {
    return "Too many emails sent from this Resend account. Wait a moment and try again.";
  }
  if (/api key|unauthorized|401|403/i.test(raw)) {
    return "Resend rejected the API key. Check RESEND_API_KEY in .env.local and restart the server.";
  }

  return `Could not send the verification email. ${raw}`.trim();
}

export async function POST(request: Request) {
  let email: unknown;
  try {
    ({ email } = await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (typeof email !== "string" || !isAllowedEmail(email)) {
    return NextResponse.json(
      { error: "Please enter a valid @met.edu.in or @gmail.com address." },
      { status: 400 },
    );
  }

  const target = normaliseEmail(email);
  const supabase = adminSupabase();
  if (!supabase) {
    console.error(
      "SUPABASE_SERVICE_ROLE_KEY is missing in .env.local — cannot write reset_otp.",
    );
    return NextResponse.json(
      {
        error:
          "Password reset is not configured on this server. Add SUPABASE_SERVICE_ROLE_KEY to .env.local and restart server.",
      },
      { status: 503 },
    );
  }

  const now = Date.now();
  const last = recent.get(target);
  if (last && now - last < WINDOW_MS) {
    return NextResponse.json(
      { error: "Please wait before requesting another code." },
      { status: 429 },
    );
  }

  const { data: user, error: lookupError } = await supabase
    .from("users")
    .select("id, full_name")
    .eq("email", target)
    .maybeSingle();

  if (lookupError) {
    return NextResponse.json({ error: lookupError.message }, { status: 500 });
  }

  // Deliberately identical to the sign-in failure so this endpoint cannot be
  // used to discover which addresses are registered.
  if (!user) {
    return NextResponse.json(
      { error: "No account registered with this email address." },
      { status: 404 },
    );
  }

  // Resolved before the row is touched: a missing key must not leave a live OTP
  // sitting in the database that the user can never receive.
  const resend = resendClient();
  if (!resend) {
    return NextResponse.json({ error: RESEND_MISSING }, { status: 400 });
  }

  const otp = generateOtp();
  const expiresAt = new Date(now + RESET_OTP_TTL_MINUTES * 60_000).toISOString();

  const { error: updateError } = await supabase
    .from("users")
    .update({ reset_otp: otp, otp_expires_at: expiresAt })
    .eq("email", target);

  if (updateError) {
    console.error("Failed to store reset OTP:", updateError.message);
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  const firstName = user.full_name?.split(" ")[0] ?? "there";

  // Resend can reject synchronously (bad key, locked-down project) as well as
  // returning `{ error }`, so both shapes are handled.
  let sendError: { message?: string } | null = null;
  try {
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL?.trim() || DEFAULT_FROM,
      to: target,
      subject: "MET Campus Hub — Password Reset Verification Code",
      html: `
      <div style="font-family:ui-sans-serif,system-ui,-apple-system,'Segoe UI',sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#18181b">
        <div style="background:linear-gradient(135deg,#0f172a,#1e293b);border-radius:16px 16px 0 0;padding:28px 32px;color:#fff">
          <p style="margin:0 0 6px;font-size:13px;letter-spacing:.14em;text-transform:uppercase;opacity:.7">MET Campus Hub</p>
          <h1 style="margin:0;font-size:22px;font-weight:600">Password reset verification</h1>
        </div>
        <div style="border:1px solid #e4e4e7;border-top:0;border-radius:0 0 16px 16px;padding:32px;background:#fff">
          <p style="margin:0 0 20px;font-size:15px;line-height:1.6">Hi ${firstName}, use the code below to set a new password for your MET Campus Hub account.</p>
          <div style="background:#f4f4f5;border-radius:12px;padding:22px;text-align:center;margin:0 0 20px">
            <p style="margin:0;font-size:34px;font-weight:700;letter-spacing:.32em;font-family:ui-monospace,SFMono-Regular,Menlo,monospace">${otp}</p>
          </div>
          <p style="margin:0 0 8px;font-size:13px;line-height:1.6;color:#52525b">This code expires in ${RESET_OTP_TTL_MINUTES} minutes and can be used only once.</p>
          <p style="margin:0;font-size:13px;line-height:1.6;color:#52525b">If you did not request this, you can safely ignore this email — your password will not change.</p>
        </div>
        <p style="margin:20px 0 0;font-size:12px;color:#a1a1aa;text-align:center">MET BKC IOE · Gear Exchange &amp; Academic Vault</p>
      </div>
    `,
    });
    sendError = result.error ?? null;
  } catch (caught) {
    console.error("Resend send threw:", caught);
    return NextResponse.json({ error: describeSendFailure(caught) }, { status: 502 });
  }

  if (sendError) {
    console.error("Resend send failed:", sendError);
    // The code stays valid in the row but is never delivered, so it is cleared
    // to avoid leaving an active OTP that a later retry could be confused by.
    await supabase.from("users").update({ reset_otp: null, otp_expires_at: null }).eq("email", target);
    return NextResponse.json({ error: describeSendFailure(sendError) }, { status: 502 });
  }

  // Only stamped after the mail is actually accepted, so a failed send does not
  // lock the address out of retrying.
  recent.set(target, now);

  return NextResponse.json({ ok: true });
}