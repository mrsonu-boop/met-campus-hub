"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  BookOpen,
  Lightbulb,
  RotateCcw,
  Send,
  Sparkles,
  User,
  X,
} from "lucide-react";

import type { ChatMessage, NoteSet, NoteUnit } from "@/lib/types";

interface AiDrawerProps {
  noteSet: NoteSet | null;
  unit: NoteUnit | null;
  onClose: () => void;
}

const SUGGESTIONS = [
  "Summarise this unit in 5 exam-ready bullets",
  "Give me a 2-mark question bank for this unit",
  "Explain the hardest topic with a worked example",
];

export function AiDrawer({ noteSet, unit, onClose }: AiDrawerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Reset the thread whenever a different note set is opened.
  useEffect(() => {
    setMessages([]);
    setInput("");
    setError(null);
  }, [noteSet?.id, unit?.id]);

  useEffect(() => {
    if (!noteSet) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 120);
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [noteSet, onClose]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, pending]);

  const contextLabel = noteSet
    ? `${noteSet.subject} (${noteSet.courseCode}) — ${noteSet.branch} Engineering, Year ${noteSet.semester}${unit ? ` — ${unit.unit}` : ""}`
    : "General SPPU coursework";

  const send = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text || pending || !noteSet) return;

      const userMessage: ChatMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        content: text,
      };

      const priorTurns = messages
        .slice(-6)
        .map((message) => ({
          role: message.role === "user" ? ("user" as const) : ("model" as const),
          parts: [{ text: message.content }],
        }));

      // The route forwards `contents` straight to the SDK, so the persona and
      // the selected unit have to travel in the final user turn.
      const contents = [
        ...priorTurns,
        {
          role: "user" as const,
          parts: [
            {
              text: `You are an AI Academic Assistant for MET BKC Engineering students under the SPPU curriculum.
Context/Subject: ${contextLabel}

Student Question: ${text}

Provide a concise, accurate, and easy-to-understand response formatted with bullet points where appropriate.`,
            },
          ],
        },
      ];

      const assistantId = `a-${Date.now()}`;

      setMessages((prev) => [
        ...prev,
        userMessage,
        { id: assistantId, role: "assistant", content: "", streaming: true },
      ]);
      setInput("");
      setError(null);
      setPending(true);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents }),
        });

        if (!response.ok) {
          const data = (await response.json().catch(() => null)) as { error?: string } | null;
          throw new Error(data?.error ?? "Something went wrong");
        }

        if (!response.body) throw new Error("No response body received");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        // Stream chunk deltas into the latest assistant message so the reply
        // types out live instead of appearing all at once.
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) buffer += decoder.decode(value, { stream: true });
          const content = buffer.trim();
          setMessages((prev) =>
            prev.map((message) =>
              message.id === assistantId ? { ...message, content } : message,
            ),
          );
        }

        const finalContent = buffer.trim();
        if (finalContent.includes("[AI_ERROR]")) {
          throw new Error(finalContent.split("[AI_ERROR]")[1].trim());
        }

        setMessages((prev) =>
          prev.map((message) =>
            message.id === assistantId
              ? { ...message, content: finalContent || "…", streaming: false }
              : message,
          ),
        );
      } catch (caught) {
        // Drop the empty placeholder and surface the real reason instead.
        setMessages((prev) => prev.filter((message) => message.id !== assistantId));
        setError(
          caught instanceof Error
            ? caught.message
            : "Could not reach the study assistant. Try again in a moment.",
        );
      } finally {
        setPending(false);
      }
    },
    [contextLabel, messages, noteSet, pending],
  );

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-sunken/70 backdrop-blur-sm animate-fade-in lg:bg-transparent lg:backdrop-blur-none"
        onClick={onClose}
        aria-hidden
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="AI study assistant"
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md animate-drawer-in flex-col border-l border-line bg-surface shadow-2xl shadow-black/60"
      >
        {/* Header */}
        <header className="flex items-start justify-between gap-3 border-b border-line bg-sunken/40 px-5 py-4">
          <div className="flex min-w-0 items-start gap-3">
            <span className="relative mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-brand/25 bg-emerald-500/10">
              <Sparkles className="h-4.5 w-4.5 text-brand" />
            </span>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold tracking-tight text-fg">
                AI Study Assistant
              </h2>
              <p className="mt-0.5 truncate text-xs text-muted">{contextLabel}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close AI assistant"
            className="shrink-0 rounded-md p-1.5 text-muted transition hover:bg-elevated hover:text-fg"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        {/* Thread */}
        <div ref={scrollRef} className="scroll-thin flex-1 space-y-4 overflow-y-auto px-5 py-5">
          {messages.length === 0 && (
            <div className="animate-fade-up space-y-4">
              <div className="rounded-xl border border-line bg-sunken/60 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <BookOpen className="h-3.5 w-3.5 text-brand" />
                  <p className="text-xs font-medium text-muted">Context loaded</p>
                </div>
                <p className="text-xs leading-relaxed text-muted">
                  {unit
                    ? `I have ${noteSet?.subject} — ${unit.unit} in context, covering ${unit.topics.join(", ")}.`
                    : `I have the full ${noteSet?.subject} note set in context.`}{" "}
                  Ask anything about it — definitions, formulas, SPPU question patterns or a simpler
                  explanation.
                </p>
              </div>

              <div className="space-y-2">
                <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted">
                  <Lightbulb className="h-3 w-3" />
                  Try asking
                </p>
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => void send(suggestion)}
                    className="flex w-full items-start gap-2 rounded-lg border border-line bg-sunken/60 px-3 py-2.5 text-left text-xs text-muted transition hover:border-brand/25 hover:bg-emerald-500/[0.06] hover:text-fg"
                  >
                    <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-brand" />
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <Bubble key={message.id} message={message} />
          ))}

          {error && (
            <div className="rounded-lg border border-rose-500/25 bg-rose-500/[0.08] px-3.5 py-2.5 text-xs text-rose-600 dark:text-rose-300">
              {error}
              <p className="mt-1 text-rose-400/80">
                If this persists, check that <span className="font-mono">GEMINI_API_KEY</span> is
                set in <span className="font-mono">.env.local</span>.
              </p>
            </div>
          )}
        </div>

        {/* Composer */}
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void send(input);
          }}
          className="border-t border-line bg-surface px-4 py-3"
        >
          {messages.length > 0 && (
            <button
              type="button"
              onClick={() => setMessages([])}
              className="mb-2 inline-flex items-center gap-1.5 text-[11px] text-muted transition hover:text-fg"
            >
              <RotateCcw className="h-3 w-3" />
              Clear thread
            </button>
          )}
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void send(input);
                }
              }}
              placeholder="Ask about this unit…"
              aria-label="Ask the AI study assistant"
              className="scroll-thin max-h-28 min-h-9 flex-1 resize-none rounded-lg border border-line bg-sunken px-3 py-2 text-sm text-fg placeholder:text-faint outline-none transition focus:border-brand/60 focus:ring-2 focus:ring-brand/15"
            />
            <button
              type="submit"
              disabled={!input.trim() || pending}
              aria-label="Send question"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand text-on-brand transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-2 text-[10px] text-faint">
            Powered by Google Gemini — answers are study aids, always cross-check against the
            official SPPU syllabus.
          </p>
        </form>
      </aside>
    </>
  );
}

function Bubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end gap-2.5 animate-fade-up">
        <div className="max-w-[85%] rounded-xl rounded-tr-sm bg-fg px-3.5 py-2.5 text-sm leading-relaxed text-canvas">
          {message.content}
        </div>
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-line bg-sunken">
          <User className="h-3.5 w-3.5 text-muted" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2.5 animate-fade-up">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-brand/25 bg-emerald-500/10">
        <Sparkles className="h-3.5 w-3.5 text-brand" />
      </div>
      <div className="max-w-[85%] rounded-xl rounded-tl-sm border border-line bg-sunken/70 px-3.5 py-2.5">
        {message.content ? (
          <AssistantBody text={message.content} />
        ) : (
          <span
            aria-label="Assistant is typing"
            className="inline-block h-4 w-1.5 animate-pulse rounded-full bg-brand/70"
          />
        )}
      </div>
    </div>
  );
}

/** Renders the assistant reply as lightweight markdown (headings + bullets). */
function AssistantBody({ text }: { text: string }) {
  const blocks = text.split("\n");

  return (
    <div className="space-y-1.5 text-sm leading-relaxed text-fg">
      {blocks.map((raw, index) => {
        const line = raw.trim();
        if (!line) return null;

        if (/^#{1,6}\s/.test(line)) {
          return (
            <p key={index} className="pt-1 text-xs font-semibold uppercase tracking-wide text-brand">
              {line.replace(/^#{1,6}\s/, "")}
            </p>
          );
        }

        const bullet = line.match(/^[-*•]\s+(.*)$/);
        if (bullet) {
          return (
            <p key={index} className="flex gap-2 pl-0.5">
              <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-brand/60" />
              <span className="min-w-0 flex-1">{bold(bullet[1])}</span>
            </p>
          );
        }

        const numbered = line.match(/^(\d+)[.)]\s+(.*)$/);
        if (numbered) {
          return (
            <p key={index} className="flex gap-2 pl-0.5">
              <span className="font-mono text-xs text-brand">{numbered[1]}.</span>
              <span className="min-w-0 flex-1">{bold(numbered[2])}</span>
            </p>
          );
        }

        return <p key={index}>{bold(line)}</p>;
      })}
    </div>
  );
}

/** Renders **bold** spans inline without pulling in a markdown dependency. */
function bold(value: string) {
  const parts = value.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={index} className="font-semibold text-fg">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={index}>{part}</span>
    ),
  );
}
