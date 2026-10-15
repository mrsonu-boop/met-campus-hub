"use client";

import { MessageCircle, PackageCheck, Search } from "lucide-react";

const STEPS = [
  {
    icon: Search,
    step: "Step 1",
    title: "Browse Verified Listings",
    body: "Posted by MET BKC peers.",
  },
  {
    icon: MessageCircle,
    step: "Step 2",
    title: "Direct WhatsApp Chat",
    body: "Connect instantly with student sellers.",
  },
  {
    icon: PackageCheck,
    step: "Step 3",
    title: "Safe Campus Handoff",
    body: "Meet at Canteen, Library, or Workshop.",
  },
] as const;

export function HowItWorks() {
  return (
    <section className="mt-8">
      <h2 className="text-center text-lg font-semibold tracking-tight text-fg">How it works</h2>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        {STEPS.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.title}
              className="rounded-xl border border-line bg-surface p-5 text-center"
            >
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg border border-brand/20 bg-brand/[0.08]">
                <Icon className="h-5 w-5 text-brand" />
              </div>
              <p className="mt-3 font-mono text-[10px] font-medium uppercase tracking-wide text-brand">
                {step.step}
              </p>
              <p className="mt-1 text-sm font-semibold text-fg">{step.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted">{step.body}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}