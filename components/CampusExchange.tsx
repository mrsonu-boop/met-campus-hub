"use client";

import { useEffect, useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Copy,
  MapPin,
  PackageCheck,
  QrCode,
  RefreshCw,
  ShieldCheck,
  User,
} from "lucide-react";

import { LISTING_TYPE_LABEL } from "@/lib/data";
import { CATEGORY_ICON } from "@/lib/ui";
import type { ExchangeTransaction } from "@/lib/types";

interface CampusExchangeProps {
  transactions: ExchangeTransaction[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onStatusChange: (id: string, status: ExchangeTransaction["status"]) => void;
}

const STATUS_META: Record<
  ExchangeTransaction["status"],
  { label: string; className: string }
> = {
  "awaiting-handoff": {
    label: "Awaiting Handoff",
    className: "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  verified: {
    label: "Verified",
    className: "border-brand/25 bg-emerald-500/10 text-brand",
  },
  disputed: {
    label: "Disputed",
    className: "border-rose-500/25 bg-rose-500/10 text-rose-600 dark:text-rose-300",
  },
};

const TABS: Array<{ id: ExchangeTransaction["status"] | "all"; label: string }> = [
  { id: "awaiting-handoff", label: "Active" },
  { id: "verified", label: "Verified" },
  { id: "disputed", label: "Disputed" },
  { id: "all", label: "All" },
];

export function CampusExchange({
  transactions,
  activeId,
  onSelect,
  onStatusChange,
}: CampusExchangeProps) {
  const [tab, setTab] = useState<ExchangeTransaction["status"] | "all">("awaiting-handoff");

  const counts = useMemo(() => {
    const count = (status: ExchangeTransaction["status"]) =>
      transactions.filter((txn) => txn.status === status).length;
    return {
      all: transactions.length,
      "awaiting-handoff": count("awaiting-handoff"),
      verified: count("verified"),
      disputed: count("disputed"),
    };
  }, [transactions]);

  // Keep the queue populated: if the active filter has no rows (e.g. filtering
  // to a branch that only has closed deals), fall through to the next tab with
  // content rather than showing an empty list next to a detached QR panel.
  useEffect(() => {
    if (transactions.length === 0) return;
    const visibleCount = tab === "all" ? transactions.length : counts[tab];
    if (visibleCount > 0) return;
    const fallback = TABS.find((item) => item.id !== tab && counts[item.id] > 0);
    if (fallback) setTab(fallback.id);
  }, [counts, tab, transactions.length]);

  const visible = useMemo(
    () => (tab === "all" ? transactions : transactions.filter((txn) => txn.status === tab)),
    [tab, transactions],
  );

  // The panel always mirrors something from the visible list.
  const active = visible.find((txn) => txn.id === activeId) ?? visible[0] ?? null;

  return (
    <section className="animate-fade-up space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-fg">
            Verified Campus Exchange
          </h2>
          <p className="mt-1 max-w-xl text-sm text-muted">
            Every physical handoff is scanned at the meetup spot and confirmed with a 4-digit PIN,
            so both sides are covered before money changes hands.
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-line bg-surface p-1">
          {TABS.map((item) => {
            const activeTab = tab === item.id;
            const count = counts[item.id];
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                aria-pressed={activeTab}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                  activeTab
                    ? "bg-surface text-fg shadow-sm"
                    : "text-muted hover:bg-elevated hover:text-fg"
                }`}
              >
                {item.label}
                <span
                  className={`ml-1.5 font-mono text-[10px] ${
                    activeTab ? "text-muted" : "text-faint"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="card flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface">
            <PackageCheck className="h-5 w-5 text-faint" />
          </div>
          <p className="text-sm text-muted">
            No exchanges yet. Complete a deal from the Gear Exchange and the handoff will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
          {/* Tracker list */}
          <div className="space-y-2.5">
            {visible.map((txn) => (
              <TransactionRow
                key={txn.id}
                txn={txn}
                selected={active?.id === txn.id}
                onSelect={() => onSelect(txn.id)}
              />
            ))}
            {visible.length === 0 && (
              <p className="card px-4 py-10 text-center text-sm text-muted">
                Nothing in this queue right now.
              </p>
            )}
          </div>

          {/* QR + PIN */}
          {active && (
            <HandoffPanel
              key={active.id}
              txn={active}
              onStatusChange={(status) => onStatusChange(active.id, status)}
            />
          )}
        </div>
      )}
    </section>
  );
}

function TransactionRow({
  txn,
  selected,
  onSelect,
}: {
  txn: ExchangeTransaction;
  selected: boolean;
  onSelect: () => void;
}) {
  const status = STATUS_META[txn.status];
  const Icon = CATEGORY_ICON[txn.itemCategory];

  return (
    <button
      type="button"
      data-txn-id={txn.id}
      onClick={onSelect}
      aria-pressed={selected}
      className={`card w-full p-4 text-left transition ${
        selected
          ? "border-brand/40 bg-elevated/60 glow-emerald"
          : "hover:border-line-strong hover:bg-elevated/40"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${
            txn.listingType === "sale"
              ? "border-indigo-500/20 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300"
              : "border-brand/20 bg-emerald-500/10 text-brand"
          }`}
        >
          <Icon className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="truncate text-sm font-medium text-fg">{txn.item}</p>
            <span className="font-mono text-sm font-semibold text-fg">{txn.amount}</span>
          </div>

          <p className="mt-0.5 truncate text-xs text-muted">
            {txn.counterparty} · {LISTING_TYPE_LABEL[txn.listingType]}
          </p>

          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-muted">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3 text-faint" />
              {txn.meetSpot}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock3 className="h-3 w-3 text-faint" />
              {txn.slot}
            </span>
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 font-medium ${status.className}`}
            >
              {status.label}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

function HandoffPanel({
  txn,
  onStatusChange,
}: {
  txn: ExchangeTransaction;
  onStatusChange: (status: ExchangeTransaction["status"]) => void;
}) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const qrPayload = useMemo(
    () =>
      JSON.stringify({
        hub: "MET Campus Hub",
        txn: txn.id,
        item: txn.item,
        spot: txn.meetSpot,
        slot: txn.slot,
        amount: txn.amount,
        pin: txn.pin,
      }),
    [txn],
  );

  function verify() {
    if (pin.length !== 4) {
      setError("Enter all 4 digits of the handoff PIN.");
      return;
    }
    if (pin === txn.pin) {
      setError(null);
      onStatusChange("verified");
      setPin("");
    } else {
      setError("PIN does not match. Ask the other student to read it out again.");
    }
  }

  function copyCode() {
    void navigator.clipboard?.writeText(txn.id);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  const done = txn.status === "verified";

  return (
    <aside className="card h-fit overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-sunken/60 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <QrCode className="h-4 w-4 shrink-0 text-brand" />
          <h3 className="shrink-0 text-sm font-semibold tracking-tight text-fg">Handoff QR</h3>
          <span aria-hidden="true" className="shrink-0 text-faint">
            |
          </span>
          <span className="truncate text-xs text-muted">{txn.item}</span>
        </div>
        <button
          type="button"
          onClick={copyCode}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-line bg-surface px-2 py-1 font-mono text-[10px] text-muted transition hover:text-fg"
        >
          {copied ? <CheckCircle2 className="h-3 w-3 text-brand" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : txn.id}
        </button>
      </div>

      <div className="flex flex-col items-center gap-4 p-5">
        {/* QR */}
        <div className="relative rounded-xl border border-line bg-white p-3">
          <QRCodeSVG
            value={qrPayload}
            size={168}
            bgColor="#ffffff"
            fgColor="#09090b"
            level="M"
            marginSize={0}
          />
          {done && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-xl bg-sunken/92 backdrop-blur-[2px]">
              <CheckCircle2 className="h-8 w-8 text-brand" />
              <p className="text-xs font-medium text-brand">Handoff verified</p>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-muted">
          Scan with the seller&apos;s phone at {txn.meetSpot}
        </p>

        {/* Terms */}
        <dl className="w-full space-y-1.5 rounded-lg border border-line bg-sunken/60 p-3 text-xs">
          <div className="flex items-start justify-between gap-3">
            <dt className="inline-flex items-center gap-1.5 text-muted">
              <User className="h-3 w-3" />
              {txn.counterpartyRole}
            </dt>
            <dd className="text-right text-muted">{txn.counterparty}</dd>
          </div>
          <div className="flex items-start justify-between gap-3">
            <dt className="inline-flex items-center gap-1.5 text-muted">
              <MapPin className="h-3 w-3" />
              Meetup
            </dt>
            <dd className="text-right text-muted">{txn.meetSpot}</dd>
          </div>
          <div className="flex items-start justify-between gap-3">
            <dt className="inline-flex items-center gap-1.5 text-muted">
              <ShieldCheck className="h-3 w-3" />
              Terms
            </dt>
            <dd className="max-w-[13rem] text-right text-muted">{txn.agreedTerms}</dd>
          </div>
        </dl>

        {/* PIN */}
        <div className="w-full space-y-2">
          <label
            htmlFor="pin-input"
            className="flex items-center justify-between text-[11px] font-medium uppercase tracking-wide text-muted"
          >
            <span>Handoff PIN</span>
            <span className="normal-case tracking-normal text-faint">
              Ask the counterparty
            </span>
          </label>

          <div className="flex gap-2">
            <input
              id="pin-input"
              type="text"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              disabled={done}
              onChange={(event) => {
                const next = event.target.value.replace(/\D/g, "").slice(0, 4);
                setPin(next);
                setError(null);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") verify();
              }}
              placeholder="• • • •"
              className="h-11 flex-1 rounded-lg border border-line bg-sunken px-3 text-center font-mono text-lg tracking-[0.5em] text-fg placeholder:tracking-[0.3em] placeholder:text-faint outline-none transition focus:border-brand/60 focus:ring-2 focus:ring-brand/15 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={verify}
              disabled={done || pin.length !== 4}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 text-sm font-semibold text-on-brand transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <PackageCheck className="h-4 w-4" />
              Verify
            </button>
          </div>

          {error && (
            <p className="flex items-start gap-1.5 text-xs text-rose-600 dark:text-rose-300">
              <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
              {error}
            </p>
          )}

          {done && (
            <p className="flex items-start gap-1.5 text-xs text-brand">
              <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0" />
              Escrow released. Both parties are marked verified.
            </p>
          )}

          {txn.status === "disputed" && (
            <button
              type="button"
              onClick={() => {
                setError(null);
                onStatusChange("awaiting-handoff");
              }}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-line-strong bg-surface px-3 py-2 text-xs font-medium text-fg transition hover:bg-elevated"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Reopen dispute with campus support
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
