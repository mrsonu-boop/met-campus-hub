"use client";

import { useEffect, useRef } from "react";
import { HelpCircle, MessageCircle, ShoppingBag, Sparkles, X } from "lucide-react";

interface OnboardingModalProps {
  open: boolean;
  onClose: () => void;
}

const STEPS = [
  {
    icon: ShoppingBag,
    title: "Browse or list campus gear",
    body: "Rent, sell or donate calculators, textbooks, drafter sets and lab coats. Publishing a listing takes under a minute.",
  },
  {
    icon: MessageCircle,
    title: "Meet on campus, pay your way",
    body: "Chat over WhatsApp, check the seller is a student, and settle with UPI or cash at spots like the canteen or library.",
  },
  {
    icon: Sparkles,
    title: "Ask the AI study assistant",
    body: "Download SPPU-aligned notes from the Knowledge Vault, or ask the AI drawer to explain any single unit in plain words.",
  },
];

export function OnboardingModal({ open, onClose }: OnboardingModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => closeRef.current?.focus(), 60);

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

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div
        className="absolute inset-0 animate-fade-in bg-sunken/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      <div className="relative w-full max-w-md animate-scale-in overflow-hidden rounded-t-3xl border border-line/80 bg-white/85 shadow-[0_24px_60px_-24px_rgb(28_25_23/0.35)] backdrop-blur-md dark:bg-[#171411]/85 sm:rounded-3xl">
        <div className="flex items-start justify-between gap-3 border-b border-line bg-white/50 px-5 py-4 dark:bg-white/[0.03]">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-brand/25 bg-emerald-500/10">
              <HelpCircle className="h-5 w-5 text-brand" />
            </div>
            <div>
              <h2 id="onboarding-title" className="text-sm font-semibold tracking-tight text-fg">
                How MET Campus Hub works
              </h2>
              <p className="mt-0.5 text-xs text-muted">Three ways to use it, all on campus</p>
            </div>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Dismiss guide"
            className="shrink-0 rounded-md p-1.5 text-muted transition hover:bg-elevated hover:text-fg"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3 p-5">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-elevated">
                    <Icon className="h-4 w-4 text-brand" />
                  </span>
                  {index < STEPS.length - 1 && <span className="mt-1 w-px flex-1 bg-line" />}
                </div>
                <div className="pb-1">
                  <p className="text-sm font-semibold text-fg">{step.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted">{step.body}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-line px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="btn-primary w-full"
          >
            Got it — let&apos;s go
          </button>
          <p className="mt-2 text-center text-[11px] text-faint">
            You can open this again anytime from &ldquo;How to Use&rdquo; in the top bar.
          </p>
        </div>
      </div>
    </div>
  );
}