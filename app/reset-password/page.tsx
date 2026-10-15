"use client";

import React, { useCallback, useEffect, useState } from "react";
import { createClient, type SupabaseClient, type Session } from "@supabase/supabase-js";
import { CheckCircle2, Eye, EyeOff, Lock, ShieldCheck, X } from "lucide-react";

let resetSupabase: SupabaseClient | null = null;

function getResetSupabaseClient(): SupabaseClient | null {
  if (typeof window === "undefined") return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  if (!resetSupabase) {
    resetSupabase = createClient(url, anonKey);
  }
  return resetSupabase;
}

type Toast = { tone: "success" | "error"; message: string } | null;

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [sessionError, setSessionError] = useState("");
  const [toast, setToast] = useState<Toast>(null);

  const notify = useCallback((tone: "success" | "error", message: string) => {
    setToast({ tone, message });
    setTimeout(() => setToast(null), 4500);
  }, []);

  useEffect(() => {
    const supabase = getResetSupabaseClient();
    if (!supabase) {
      setSessionError(
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
      );
      return;
    }

    let active = true;

    const handleSession = (session: Session | null) => {
      if (!active) return;
      if (session) {
        setReady(true);
        setSessionError("");
      } else {
        setSessionError(
          "No valid reset session found. Please open the password reset link from your email again."
        );
      }
    };

    const checkSession = (attempt: number) => {
      supabase.auth
        .getSession()
        .then(({ data }) => {
          if (!active) return;
          if (data.session) {
            setReady(true);
            setSessionError("");
            return;
          }
          // The reset link carries its token in the URL hash; Supabase
          // exchanges it asynchronously, so retry a couple of times.
          if (attempt < 3) {
            window.setTimeout(() => checkSession(attempt + 1), 700);
          } else {
            handleSession(null);
          }
        })
        .catch(() => handleSession(null));
    };

    checkSession(0);

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        handleSession(session);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      notify("error", "Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      notify("error", "Passwords do not match. Please re-enter them.");
      return;
    }

    const supabase = getResetSupabaseClient();
    if (!supabase) {
      notify("error", "Supabase is not configured on this deployment.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) {
        notify("error", error.message);
        return;
      }

      notify("success", "Password updated successfully. Redirecting to login...");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        window.location.href = "/";
      }, 1600);
    } catch (err) {
      notify("error", err instanceof Error ? err.message : "Could not update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased flex flex-col">
      <div className="bg-zinc-900 text-zinc-300 text-xs py-2 px-4 text-center font-medium border-b border-zinc-800">
        MET BKC Campus Hub &bull; Secure Password Reset
      </div>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm w-full max-w-md p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black">
              M
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-600" />
              <h1 className="text-xl font-bold text-slate-900">Set a New Password</h1>
            </div>
          </div>
          <p className="text-xs text-slate-500 mb-5">
            Choose a strong password for your MET Campus Hub student account.
          </p>

          {sessionError && (
            <div className="mb-4 flex items-start gap-2 text-xs font-semibold text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <span>{sessionError}</span>
            </div>
          )}

          {ready && !sessionError && (
            <div className="mb-4 flex items-start gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <span>Reset session verified. You can set your new password now.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 pr-11 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confirm New Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Re-enter new password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white py-2.5 rounded-lg text-sm font-semibold transition"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>

          <p className="text-[11px] text-slate-500 flex items-start gap-1.5 border-t border-slate-100 pt-3 mt-4">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
            <span>
              Your reset session is valid for a short window. If it expires, request a new link
              from the Log In screen.
            </span>
          </p>
        </div>
      </main>

      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-[60] text-xs font-medium px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 max-w-xs text-white ${
            toast.tone === "success" ? "bg-slate-900" : "bg-rose-700"
          }`}
        >
          {toast.tone === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <X className="w-4 h-4 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
