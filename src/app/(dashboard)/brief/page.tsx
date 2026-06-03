"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, ArrowUp, Loader2 } from "lucide-react";
import { AsciiField } from "@/components/dashboard/ascii-field";
import { Reveal } from "@/components/ui/motion";

type Msg = { role: "user" | "assistant"; content: string };
type Proposal = { projectId: string; blueprintId: string } | null;

// A fixed, warm opener so the conversation starts instantly (no round trip).
// It's sent back as history on each turn so the model stays coherent.
const GREETING =
  "Hey — I'm so glad you're here. I'd love to understand what you're hoping to build. To start: what's the project, and what's the business or idea behind it?";

const easeOut = [0.16, 1, 0.3, 1] as const;

export default function BriefChatPage() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: GREETING },
  ]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proposal, setProposal] = useState<Proposal>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  // Keep the latest message in view as the conversation grows.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, proposal]);

  // Auto-grow the composer.
  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
  }, [draft]);

  async function send() {
    const text = draft.trim();
    if (!text || loading) return;

    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setDraft("");
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/brief-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error ?? "Something went wrong. Please try again.");
      }
      if (data.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      }
      if (data.proposal) setProposal(data.proposal);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
      requestAnimationFrame(() => taRef.current?.focus());
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-12rem)] max-w-3xl flex-col">
      {/* Masthead */}
      <Reveal className="relative mb-5 shrink-0 overflow-hidden rounded-3xl border border-border/60 bg-charcoal p-6 sm:p-7">
        <AsciiField className="absolute inset-0 h-full w-full opacity-50" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(249,115,22,0.16),transparent_65%)]" />
        <div className="relative z-10">
          <p className="text-xs uppercase tracking-[0.25em] text-orange/80">New Brief</p>
          <h1 className="font-brand mt-2 text-2xl sm:text-3xl">Let&apos;s build something</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            A quick, friendly conversation. Tell us what you want — if it&apos;s a fit, we&apos;ll
            draft a bespoke Blueprint with real scope and pricing.
          </p>
        </div>
      </Reveal>

      {/* Conversation */}
      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto rounded-3xl border border-border/60 bg-card/40 p-4 backdrop-blur-xl sm:p-6"
      >
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: easeOut }}
              className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
            >
              <div
                className={
                  m.role === "user"
                    ? "max-w-[85%] whitespace-pre-wrap rounded-3xl rounded-br-lg bg-orange px-4 py-3 text-sm text-white"
                    : "max-w-[85%] whitespace-pre-wrap rounded-3xl rounded-bl-lg border border-border/60 bg-charcoal px-4 py-3 text-sm text-foreground"
                }
              >
                {m.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="flex items-center gap-2 rounded-3xl rounded-bl-lg border border-border/60 bg-charcoal px-4 py-3 text-sm text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-orange" />
              Thinking…
            </div>
          </motion.div>
        )}

        {proposal && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeOut }}
            className="rounded-3xl border border-orange/30 bg-orange/[0.06] p-5"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-orange/80">Your Blueprint is ready</p>
            <p className="mt-2 text-sm text-muted-foreground">
              We&apos;ve drafted a bespoke proposal — scope, architecture, and a real price.
            </p>
            <Link
              href={`/blueprint/${proposal.blueprintId}`}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-orange px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-dark"
            >
              Review your Blueprint
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        )}
      </div>

      {error && (
        <p className="mt-3 shrink-0 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-2.5 text-sm text-destructive">
          {error}
        </p>
      )}

      {/* Composer */}
      <div className="mt-3 shrink-0">
        <div className="flex items-end gap-2 rounded-3xl border border-border/60 bg-card/80 p-2 backdrop-blur-xl focus-within:border-orange/50">
          <textarea
            ref={taRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            placeholder={proposal ? "Ask a follow-up…" : "Type your reply…"}
            className="max-h-40 flex-1 resize-none bg-transparent px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <button
            onClick={send}
            disabled={loading || !draft.trim()}
            aria-label="Send"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-orange text-white transition-colors hover:bg-orange-dark disabled:opacity-40"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowUp className="h-4 w-4" />
            )}
          </button>
        </div>
        <p className="mt-2 px-1 text-center text-[11px] text-muted-foreground">
          Press Enter to send · Shift+Enter for a new line
        </p>
      </div>
    </div>
  );
}
