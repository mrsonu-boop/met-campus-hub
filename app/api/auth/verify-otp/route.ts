import { NextResponse } from "next/server";

import { adminSupabase, isAllowedEmail, normaliseEmail } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  let payload: { email?: unknown; otp?: unknown; newPassword?: unknown };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { email, otp, newPassword } = payload;

  if (typeof email !== "string" || !isAllowedEmail(email)) {
    return NextResponse.json(
      { error: "Please enter a valid @met.edu.in or @gmail.com address." },
      { status: 400 },
    );
  }

  if (typeof otp !== "string" || !/^\d{6}$/.test(otp.trim())) {
    return NextResponse.json({ error: "Invalid or expired OTP code." }, { status: 400 });
  }

  if (typeof newPassword !== "string" || newPassword.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters." },
      { status: 400 },
    );
  }

  const supabase = adminSupabase();
  if (!supabase) {
    console.error(
      "SUPABASE_SERVICE_ROLE_KEY is missing in .env.local — cannot verify reset OTP.",
    );
    return NextResponse.json(
      {
        error:
          "Password reset is not configured on this server. Add SUPABASE_SERVICE_ROLE_KEY to .env.local and restart server.",
      },
      { status: 503 },
    );
  }

  const { data: user, error: lookupError } = await supabase
    .from("users")
    .select("id, reset_otp, otp_expires_at")
    .eq("email", normaliseEmail(email))
    .maybeSingle();

  if (lookupError) {
    console.error("OTP lookup failed:", lookupError.message);
    return NextResponse.json({ error: lookupError.message }, { status: 500 });
  }

  // One message for "no such account", "wrong code" and "expired code" so the
  // endpoint reveals nothing about which emails or codes exist.
  const expired = !user?.otp_expires_at || new Date(user.otp_expires_at) <= new Date();
  if (!user || !user.reset_otp || user.reset_otp !== otp.trim() || expired) {
    return NextResponse.json({ error: "Invalid or expired OTP code." }, { status: 400 });
  }

  const { error: updateError } = await supabase
    .from("users")
    // Clearing both columns makes the code single-use.
    .update({ password: newPassword, reset_otp: null, otp_expires_at: null })
    .eq("id", user.id);

  if (updateError) {
    console.error("Password update failed:", updateError.message);
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}