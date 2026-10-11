"use client";

import { useMemo, useState } from "react";
import {
  ArrowUp,
  BadgeCheck,
  BookMarked,
  ChevronDown,
  Download,
  FileText,
  Sparkles,
  Trophy,
} from "lucide-react";

import { ACCENT_STYLES } from "@/lib/ui";
import { downloadPdf, slugify } from "@/lib/pdf";
import type { NoteSet, NoteUnit } from "@/lib/types";

interface KnowledgeVaultProps {
  noteSets: NoteSet[];
  onAskAi: (noteSet: NoteSet, unit: NoteUnit | null) => void;
}

export function KnowledgeVault({ noteSets, onAskAi }: KnowledgeVaultProps) {
  const [openUnits, setOpenUnits] = useState<Record<string, string>>({});

  const totalUnits = useMemo(
    () => noteSets.reduce((sum, set) => sum + set.units.length, 0),
    [noteSets],
  );

  if (noteSets.length === 0) {
    return (
      <div className="card flex flex-col items-center justify-center gap-3 px-6 py-16 text-center animate-fade-up">
        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface">
          <BookMarked className="h-5 w-5 text-faint" />
        </div>
        <div>
          <p className="text-sm font-medium text-fg">No note sets match</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted">
            Try a different branch, year or search term &mdash; for example &ldquo;graphs&rdquo; or
            &ldquo;operating systems&rdquo;.
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="animate-fade-up space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-fg">
            Course notes that match your syllabus
          </h2>
          <p className="mt-1 text-sm text-muted">
            {noteSets.length} subjects · {totalUnits} units, each checked by a faculty member or a
            topper before it goes live
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-brand/25 bg-brand/10 px-2.5 py-1 text-[11px] font-medium text-brand">
          <Sparkles className="h-3 w-3" />
          AI explainer built in
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {noteSets.map((noteSet) => (
          <NoteSetCard
            key={noteSet.id}
            noteSet={noteSet}
            openUnitId={openUnits[noteSet.id] ?? noteSet.units[0]?.id}
            onToggleUnit={(unitId) =>
              setOpenUnits((prev) => ({ ...prev, [noteSet.id]: unitId }))
            }
            onAskAi={onAskAi}
          />
        ))}
      </div>
    </section>
  );
}

function NoteSetCard({
  noteSet,
  openUnitId,
  onToggleUnit,
  onAskAi,
}: {
  noteSet: NoteSet;
  openUnitId: string | undefined;
  onToggleUnit: (unitId: string) => void;
  onAskAi: (noteSet: NoteSet, unit: NoteUnit | null) => void;
}) {
  const accent = ACCENT_STYLES[noteSet.accent];
  const activeUnit = noteSet.units.find((unit) => unit.id === openUnitId) ?? null;

  return (
    <article className="card card-hover group overflow-hidden">
      <div className={`h-px w-full ${accent.bar} opacity-80`} />

      <div className="flex flex-col gap-4 p-5">
        <header className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[15px] font-semibold tracking-tight text-fg">
                {noteSet.subject}
              </h3>
              <span
                className={`inline-flex items-center rounded border px-1.5 py-0.5 font-mono text-[10px] font-medium ${accent.iconBg}`}
              >
                {noteSet.courseCode}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-brand/20 bg-brand/[0.07] px-2 py-0.5 text-[10px] font-medium text-brand">
                <BadgeCheck className="h-2.5 w-2.5 shrink-0" />
                Syllabus Aligned
              </span>
            </div>
            <p className="mt-1 text-xs text-muted">
              {noteSet.branch} · Year {noteSet.semester} · SPPU
            </p>
          </div>

          <div className="shrink-0 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-center">
            <p className="font-mono text-sm font-semibold text-fg">
              {noteSet.downloads > 999
                ? `${(noteSet.downloads / 1000).toFixed(1)}k`
                : noteSet.downloads}
            </p>
            <p className="text-[10px] uppercase tracking-wide text-muted">downloads</p>
          </div>
        </header>

        <p className="text-xs leading-relaxed text-muted">{noteSet.description}</p>

        {/* Unit accordion */}
        <div className="overflow-hidden rounded-lg border border-line">
          {noteSet.units.map((unit, index) => {
            const isOpen = unit.id === openUnitId;
            return (
              <div
                key={unit.id}
                className={index > 0 ? "border-t border-line" : undefined}
              >
                <button
                  type="button"
                  onClick={() => onToggleUnit(unit.id)}
                  aria-expanded={isOpen}
                  className={`flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition hover:bg-elevated/50 ${
                    isOpen ? "bg-elevated/40" : ""
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <FileText className={`h-3.5 w-3.5 shrink-0 ${accent.text}`} />
                    <span className="truncate text-xs font-medium text-fg">
                      {unit.unit}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    <VerificationTag
                      tier={unit.verification}
                      label={unit.verifiedBy}
                    />
                    <ChevronDown
                      className={`h-3.5 w-3.5 text-muted transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </span>
                </button>

                {isOpen && (
                  <div className="animate-fade-in space-y-3 border-t border-line bg-sunken/40 px-3 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {unit.topics.map((topic) => (
                        <span
                          key={topic}
                          className="rounded border border-line bg-surface px-1.5 py-0.5 text-[11px] text-muted"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted">
                      <span className="inline-flex items-center gap-1 rounded border border-line bg-surface px-1.5 py-0.5 font-medium text-brand">
                        <ArrowUp className="h-2.5 w-2.5" />
                        {unit.upvotes.toLocaleString("en-IN")}
                      </span>
                      <span className="font-mono">
                        {unit.pages} pages · {unit.fileSize} · {unit.updatedOn}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => handleDownload(noteSet, unit)}
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-line bg-white/70 px-3 py-2 text-xs font-medium text-fg transition hover:border-line-strong hover:bg-white dark:bg-white/[0.06] dark:hover:bg-white/10"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Download PDF
                      </button>
                      <button
                        type="button"
                        onClick={() => onAskAi(noteSet, unit)}
                        className="btn-primary flex-1 gap-1.5 px-4 py-2"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        Ask AI Assistant
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

<button
          type="button"
          onClick={() => onAskAi(noteSet, activeUnit)}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-brand/25 bg-brand/[0.06] px-4 py-2 text-xs font-medium text-brand transition hover:bg-brand/15"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Ask AI about this whole subject
        </button>
      </div>
    </article>
  );
}

function VerificationTag({
  tier,
  label,
}: {
  tier: NoteUnit["verification"];
  label: string;
}) {
  const isTeacher = tier === "teacher";
  const Icon = isTeacher ? BadgeCheck : Trophy;
  return (
    <span
      title={label}
      className={`inline-flex max-w-[11rem] items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-medium ${
        isTeacher
          ? "border-brand/20 bg-brand/[0.07] text-brand"
          : "border-amber-500/20 bg-amber-500/[0.07] text-amber-700 dark:text-amber-300"
      }`}
    >
      <Icon className="h-2.5 w-2.5 shrink-0" />
      <span className="truncate">{label}</span>
    </span>
  );
}

function handleDownload(noteSet: NoteSet, unit: NoteUnit) {
  downloadPdf(
    {
      title: `${noteSet.subject} — ${unit.unit}`,
      subtitle: `${noteSet.courseCode} / ${noteSet.branch} Engineering / Year ${noteSet.semester}`,
      metaRows: [
        ["Course Code", `${noteSet.courseCode} (SPPU syllabus)`],
        ["Branch / Year", `${noteSet.branch} Engineering — Year ${noteSet.semester}`],
        ["Unit", unit.unit],
        ["Key Topics", unit.topics.join(", ")],
        ["Verified By", `${unit.verifiedBy} (${unit.verification === "teacher" ? "Faculty" : "Topper"})`],
        ["File Details", `${unit.pages} pages · ${unit.fileSize} · updated ${unit.updatedOn}`],
        ["Upvotes", unit.upvotes.toLocaleString("en-IN")],
      ],
      sections: [
        {
          heading: "Unit Overview",
          paragraphs: [
            `These notes cover ${unit.unit.replace(/^Unit\s+\d+\s+—\s+/, "")} as per the SPPU ${noteSet.courseCode} syllabus. Each concept is followed by a solved numerical drawn from the SPPU question bank, followed by the most frequently asked short-question answer.`,
          ],
        },
        {
          heading: "Key Concepts",
          paragraphs: [
            unit.topics.map((topic) => `${topic} — definition, worked example, and common exam trap.`).join("\n"),
          ],
        },
        {
          heading: "How To Use This Pack",
          paragraphs: [
            "Read the topic summary once, then attempt the numericals without looking at the solution. Revisit any unit where you scored below 60% in the unit test. Use the AI Assistant in MET Campus Hub to ask for a simpler explanation of any single sub-topic.",
          ],
        },
      ],
      footer: `Shared via MET Campus Hub · ${noteSet.subject} (${noteSet.courseCode}) · Found an error? Report it at the IOE library desk and it will be corrected in the next revision.`,
    },
    `${slugify(noteSet.subject)}-${slugify(unit.unit)}.pdf`,
  );
}
