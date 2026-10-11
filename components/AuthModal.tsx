"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  AtSign,
  CheckCircle2,
  GraduationCap,
  Hash,
  
  Lock,
  MailCheck,
  ShieldCheck,
  User,
  X,
} from "lucide-react";

import {
  ACADEMIC_YEARS,
  ALLOWED_EMAIL_DOMAINS,
  DEPARTMENTS,
  MET_EMAIL_DOMAIN,
  initials,
  INVALID_EMAIL_MESSAGE,
  isValidEmail,
  useAuth,
  type RegistrationDraft,
} from "@/components/AuthProvider";
import type { Branch, Year } from "@/lib/types";

export type AuthTab = "signin" | "register";

type AuthView = AuthTab | "reset-identify" | "reset-verify";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  /** Shown as a banner when the modal was triggered by a protected action. */
  intent?: string | null;
  initialTab?: AuthTab;
}

const EMPTY_REGISTER: RegistrationDraft = {
  name: "",
  email: "",
  department: "Computer",
  year: "SE",
  prn: "",
  password: "",
};

/** Bumped on each failed attempt to re-trigger the shake keyframes. */
function useShake(active: boolean) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (active) setTick((n) => n + 1);
  }, [active]);
  return tick;
}

export function AuthModal({ open, onClose, intent, initialTab = "signin" }: AuthModalProps) {
  const { signIn, register } = useAuth();

  const [view, setView] = useState<AuthView>(initialTab);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [errorTick, setErrorTick] = useState(0);
  const closeRef = useRef<HTMLButtonElement>(null);

  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [draft, setDraft] = useState<RegistrationDraft>(EMPTY_REGISTER);

  const [resetEmail, setResetEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const fail = (message: string) => {
    setError(message);
    setErrorTick((n) => n + 1);
  };

  // Reset whenever the dialog is re-opened so stale errors never leak in.
  useEffect(() => {
    if (!open) return;
    setView(initialTab);
    setError(null);
    setSuccess(null);
    setPending(false);
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    const timer = window.setTimeout(() => closeRef.current?.focus(), 60);

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [initialTab, onClose, open]);

  const signInShake = useShake(errorTick > 0 && view === "signin");
  const newPasswordShake = useShake(errorTick > 0 && view === "reset-verify");

  const preview = useMemo(() => initials(draft.name) || "MC", [draft.name]);

  if (!open) return null;

  const alertClass =
    "flex items-start gap-2 rounded-lg border px-3 py-2 text-xs";

  async function handleSignIn(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!signInEmail.trim() || !signInPassword) {
      fail("Both MET email and password are required.");
      return;
    }
    if (!isValidEmail(signInEmail)) {
      fail(INVALID_EMAIL_MESSAGE);
      return;
    }

    setPending(true);
    try {
      await signIn(signInEmail, signInPassword);
      onClose();
    } catch (caught) {
      fail(caught instanceof Error ? caught.message : "Could not sign you in.");
    } finally {
      setPending(false);
    }
  }

  async function handleRegister(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const required: Array<[keyof RegistrationDraft, string]> = [
      ["name", "Full name"],
      ["email", "MET email"],
      ["prn", "PRN / Roll No."],
      ["password", "Password"],
    ];
    const missing = required.find(([key]) => !draft[key].trim());
    if (missing) {
      fail(`${missing[1]} is required.`);
      return;
    }
    if (!isValidEmail(draft.email)) {
      fail(INVALID_EMAIL_MESSAGE);
      return;
    }
    if (draft.password.length < 6) {
      fail("Password must be at least 6 characters.");
      return;
    }

    setPending(true);
    try {
      await register(draft);
      onClose();
    } catch (caught) {
      fail(caught instanceof Error ? caught.message : "Could not create your account.");
    } finally {
      setPending(false);
    }
  }

  /**
   * Step 1 -> 2. The server both verifies the address and mails the code, so
   * there is no client-side account enumeration and no hard-coded OTP.
   */
  async function handleIdentify(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const email = resetEmail.trim();
    if (!email) {
      fail("Enter your email address.");
      return;
    }
    if (!isValidEmail(email)) {
      fail(INVALID_EMAIL_MESSAGE);
      return;
    }

    setPending(true);
    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        fail(data.error ?? "Could not send a verification code. Please try again.");
        return;
      }

      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
      setView("reset-verify");
    } catch {
      fail("Network error. Please check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  /** Step 3 -> 4 -> 5. */
  async function handleReset(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!/^\d{6}$/.test(otp.trim())) {
      fail("Enter the 6-digit code from your email.");
      return;
    }
    if (newPassword.length < 6) {
      fail("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      fail("New password and confirmation do not match.");
      return;
    }

    setPending(true);
    try {
      // The server owns OTP validation, expiry and the single-use clear.
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: resetEmail.trim(),
          otp: otp.trim(),
          newPassword,
        }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        fail(data.error ?? "Could not reset your password. Please try again.");
        return;
      }

      setSuccess("Password reset successfully! Please log in.");
      // Land back on Sign In with the address already filled in.
      window.setTimeout(() => {
        setSignInEmail(resetEmail.trim());
        setSignInPassword("");
        setOtp("");
        setNewPassword("");
        setConfirmPassword("");
        setSuccess(null);
        setView("signin");
      }, 1500);
    } catch {
      fail("Network error. Please check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-4">
      <div
        className="absolute inset-0 animate-fade-in bg-black/55 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        className="card relative flex max-h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-b-none sm:rounded-b-[var(--radius-card)]"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line bg-elevated">
              <GraduationCap className="h-5 w-5 text-brand" />
            </div>
            <div className="min-w-0">
              <h2 id="auth-title" className="text-sm font-semibold tracking-tight text-fg">
                {view === "reset-identify"
                  ? "Reset password"
                  : view === "reset-verify"
                    ? "Verify & choose a new password"
                    : "Student access"}
              </h2>
              <p className="mt-0.5 text-xs text-muted">
                {view === "reset-identify" || view === "reset-verify"
                  ? "Recover access to your campus account"
                  : `Sign in with your ${ALLOWED_EMAIL_DOMAINS[0].slice(1)} or personal Gmail address`}
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

        {/* Triggered-by banner */}
        {intent && (
          <div className="flex items-start gap-2 border-b border-line bg-brand/[0.07] px-5 py-2.5">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
            <p className="text-xs text-muted">{intent}</p>
          </div>
        )}

        {/* Segmented tabs — hidden inside the reset sub-flow. */}
        {view === "signin" || view === "register" ? (
          <div className="relative grid grid-cols-2 gap-1 border-b border-line px-3 pt-3">
            {(
              [
                { id: "signin" as const, label: "Sign In" },
                { id: "register" as const, label: "Register" },
              ] satisfies Array<{ id: AuthTab; label: string }>
            ).map((item) => {
              const active = view === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setView(item.id);
                    setError(null);
                  }}
                  role="tab"
                  aria-selected={active}
                  className={`relative rounded-t-lg px-3 py-2.5 text-sm font-medium transition ${
                    active ? "text-fg" : "text-muted hover:text-fg"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="auth-tab-underline"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-brand"
                    />
                  )}
                  {item.label}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center gap-2 border-b border-line px-5 py-2.5">
            <button
              type="button"
              onClick={() => {
                setView("signin");
                setError(null);
                setSuccess(null);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted transition hover:text-fg"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Sign In
            </button>
          </div>
        )}

        {/* Body */}
        <div className="scroll-thin min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {view === "signin" && (
            <form onSubmit={handleSignIn} className="space-y-3.5">
              <Field label="MET email" icon={<AtSign className="h-3.5 w-3.5" />}>
                <input
                  type="email"
                  value={signInEmail}
                  onChange={(event) => {
                    setSignInEmail(event.target.value);
                    setError(null);
                  }}
                  placeholder="student@met.edu.in or name@gmail.com"
                  aria-label="MET email"
                  autoComplete="email"
                  className="input"
                />
              </Field>

              <Field label="Password" icon={<Lock className="h-3.5 w-3.5" />}>
                <div className="relative">
                  <motion.input
                    key={`signin-password-${signInShake}`}
                    animate={errorTick > 0 ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
                    transition={{ duration: 0.42 }}
                    type="password"
                    value={signInPassword}
                    onChange={(event) => {
                      setSignInPassword(event.target.value);
                      setError(null);
                    }}
                    placeholder="••••••••"
                    aria-label="Password"
                    aria-invalid={Boolean(error)}
                    autoComplete="current-password"
                    className={`input pr-20 ${
                      error
                        ? "border-rose-500/60 ring-2 ring-rose-500/20 dark:border-rose-400/60"
                        : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setView("reset-identify");
                      setError(null);
                      setSuccess(null);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-1.5 py-1 text-[11px] font-medium text-muted transition hover:text-brand"
                  >
                    Forgot Password?
                  </button>
                </div>
              </Field>

              <SubmitButton pending={pending} label="Sign In" />
            </form>
          )}

          {view === "register" && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <Field label="Full name" icon={<User className="h-3.5 w-3.5" />}>
                <input
                  type="text"
                  value={draft.name}
                  onChange={(event) => {
                    setDraft((prev) => ({ ...prev, name: event.target.value }));
                    setError(null);
                  }}
                  placeholder="Prathamesh Thorwat"
                  aria-label="Full name"
                  className="input"
                />
              </Field>

              <Field label="MET email" icon={<AtSign className="h-3.5 w-3.5" />}>
                <input
                  type="email"
                  value={draft.email}
                  onChange={(event) => {
                    setDraft((prev) => ({ ...prev, email: event.target.value }));
                    setError(null);
                  }}
                  placeholder="student@met.edu.in or name@gmail.com"
                  aria-label="MET email"
                  className="input"
                />
                <span className="mt-1.5 block text-[11px] leading-relaxed text-faint">
                  Supports official MET campus emails (@met.edu.in) and personal Gmail accounts
                  (@gmail.com).
                </span>
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Department" icon={<GraduationCap className="h-3.5 w-3.5" />}>
                  <select
                    value={draft.department}
                    onChange={(event) =>
                      setDraft((prev) => ({ ...prev, department: event.target.value as Branch }))
                    }
                    aria-label="Department"
                    className="input cursor-pointer"
                  >
                    {DEPARTMENTS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Academic year" icon={<GraduationCap className="h-3.5 w-3.5" />}>
                  <select
                    value={draft.year}
                    onChange={(event) =>
                      setDraft((prev) => ({ ...prev, year: event.target.value as Year }))
                    }
                    aria-label="Academic year"
                    className="input cursor-pointer"
                  >
                    {ACADEMIC_YEARS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="PRN / Roll No." icon={<Hash className="h-3.5 w-3.5" />}>
                <input
                  type="text"
                  inputMode="numeric"
                  value={draft.prn}
                  onChange={(event) => {
                    setDraft((prev) => ({ ...prev, prn: event.target.value }));
                    setError(null);
                  }}
                  placeholder="72183041"
                  aria-label="PRN or roll number"
                  className="input"
                />
              </Field>

              <Field label="Password" icon={<Lock className="h-3.5 w-3.5" />}>
                <input
                  type="password"
                  value={draft.password}
                  onChange={(event) => {
                    setDraft((prev) => ({ ...prev, password: event.target.value }));
                    setError(null);
                  }}
                  placeholder="Minimum 6 characters"
                  aria-label="Password"
                  autoComplete="new-password"
                  className="input"
                />
              </Field>

              <div className="flex items-center gap-2.5 rounded-lg border border-line bg-elevated px-3 py-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-[11px] font-semibold text-brand">
                  {preview}
                </span>
                <p className="min-w-0 truncate text-xs text-muted">
                  {draft.name.trim() || "New student"}{" "}
                  <span className="text-faint">
                    · {draft.department} · {draft.year}
                  </span>
                </p>
              </div>

              <SubmitButton pending={pending} label="Create Account" />
            </form>
          )}

          {view === "reset-identify" && (
            <form onSubmit={handleIdentify} className="space-y-3.5">
              <div className="flex items-start gap-2 rounded-lg border border-line bg-elevated px-3 py-2.5">
                <MailCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
                <p className="text-xs text-muted">
                  Enter the MET email you registered with. We&apos;ll send a one-time code to
                  confirm it&apos;s you.
                </p>
              </div>

              <Field label="MET email" icon={<AtSign className="h-3.5 w-3.5" />}>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(event) => {
                    setResetEmail(event.target.value);
                    setError(null);
                  }}
                  placeholder="student@met.edu.in or name@gmail.com"
                  aria-label="MET email"
                  autoComplete="email"
                  className="input"
                />
              </Field>

              <SubmitButton pending={pending} label="Send Code" />
            </form>
          )}

          {view === "reset-verify" && (
            <form onSubmit={handleReset} className="space-y-3.5">
              <div
                role="status"
                className="flex items-start gap-2.5 rounded-lg border border-brand/30 bg-brand/5 px-3 py-2.5"
              >
                <MailCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                <p className="text-xs leading-relaxed text-muted">
                  <span className="font-medium text-fg">
                    Verification code sent to your email inbox!
                  </span>{" "}
                  We sent a 6-digit code to{" "}
                  <span className="font-medium text-fg">{resetEmail}</span>. It expires in 10
                  minutes.
                </p>
              </div>

              <Field label="6-digit OTP" icon={<Hash className="h-3.5 w-3.5" />}>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={otp}
                  onChange={(event) => {
                    setOtp(event.target.value.replace(/\D/g, "").slice(0, 6));
                    setError(null);
                  }}
                  placeholder="• • • • • •"
                  aria-label="6-digit OTP"
                  className="input text-center font-mono text-lg tracking-[0.45em]"
                />
              </Field>

              <Field label="New password" icon={<Lock className="h-3.5 w-3.5" />}>
                <motion.input
                  key={`new-password-${newPasswordShake}`}
                  animate={errorTick > 0 ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
                  transition={{ duration: 0.42 }}
                  type="password"
                  value={newPassword}
                  onChange={(event) => {
                    setNewPassword(event.target.value);
                    setError(null);
                  }}
                  placeholder="Minimum 6 characters"
                  aria-label="New password"
                  autoComplete="new-password"
                  className={`input ${
                    error
                      ? "border-rose-500/60 ring-2 ring-rose-500/20 dark:border-rose-400/60"
                      : ""
                  }`}
                />
              </Field>

              <Field label="Confirm new password" icon={<Lock className="h-3.5 w-3.5" />}>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value);
                    setError(null);
                  }}
                  placeholder="Re-enter the new password"
                  aria-label="Confirm new password"
                  autoComplete="new-password"
                  className="input"
                />
              </Field>

              <SubmitButton pending={pending} label="Update Password" />
            </form>
          )}

          {success && (
            <p
              role="status"
              className={`${alertClass} mt-3.5 border-brand/30 bg-brand/10 text-brand`}
            >
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {success}
            </p>
          )}

          {error && (
            <p
              role="alert"
              className={`${alertClass} mt-3.5 border-rose-500/30 bg-rose-500/[0.08] text-rose-600 dark:text-rose-300`}
            >
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {error}
            </p>
          )}
        </div>

        <p className="border-t border-line px-5 py-2.5 text-[11px] leading-relaxed text-faint">
          {view === "signin" || view === "register" ? (
            <>
              Accounts accept official MET campus emails (@met.edu.in) and personal Gmail
              accounts (@gmail.com). Listings and handoffs stay visible to all students on campus.
            </>
          ) : (
            <>Demo credentials: prathamesh.thorwat{MET_EMAIL_DOMAIN} / campus123</>
          )}
        </p>
      </motion.div>
    </div>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-faint">
        {icon}
        {label}
      </span>
      {children}
    </label>
  );
}

function SubmitButton({ pending, label }: { pending: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-primary w-full"
    >
      {pending ? "Please wait…" : label}
    </button>
  );
}