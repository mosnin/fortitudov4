"use client";

/**
 * Helix on the client portal.
 *
 * Read-only by construction, and the copy says so rather than leaving the
 * client to discover it by asking for something and being refused. The honest
 * framing is also the useful one: this answers questions about your project,
 * and anything you want *changed* goes to a person in Messages.
 *
 * Same product system as the rest of the portal (design.md) — no separate
 * "AI" treatment, no gradient, no sparkle. It is one more part of the product.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { CrmPageHeader } from "@/components/crm";
import { Textarea } from "@/components/ui/textarea";
import { EASE_APPLE } from "@/lib/motion";
import {
  BODY_MUTED,
  CAPTION,
  HELIX_PILL,
  META,
  QUIET_LINK,
  SECTION_LABEL,
} from "@/lib/typography";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
}

interface Payload {
  threadId: string;
  company: string;
  messages: Message[];
  introductions: { id: string; resourceKind: string; resourceLabel: string }[];
  live: boolean;
}

export function HelixClientPanel() {
  const [data, setData] = useState<Payload | null>(null);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const response = await fetch("/api/helix/client-thread");
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      setError(body?.error ?? "Could not open Helix.");
      return;
    }
    setData((await response.json()) as Payload);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [data?.messages.length, thinking]);

  const send = useCallback(async () => {
    const message = draft.trim();
    if (!message || thinking) return;
    setDraft("");
    setThinking(true);
    setError(null);
    try {
      const response = await fetch("/api/helix/client-thread", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body?.error ?? "That did not go through.");
      await load();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "That did not go through."
      );
      setDraft(message);
    } finally {
      setThinking(false);
    }
  }, [draft, thinking, load]);

  return (
    <div className="space-y-8 pb-12">
      <div className="mx-auto max-w-3xl space-y-8">
        <CrmPageHeader
          section="Helix."
          title="Ask about your project"
          subtitle={
            data
              ? `Answers about ${data.company} — where things stand, what is next, what has shipped.`
              : undefined
          }
        />

        <p className={CAPTION}>
          Helix can read your project and answer questions about it. It cannot
          change anything — to request work, message the team in{" "}
          <Link href="/messages" className={QUIET_LINK}>
            Messages
          </Link>
          .
        </p>

        {data && !data.live && (
          <p
            className={cn(
              CAPTION,
              "rounded-md border border-border/60 bg-muted/30 px-3 py-2"
            )}
          >
            Helix is not fully switched on yet in this environment, so answers
            here are limited.
          </p>
        )}

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        {data && data.messages.length === 0 && (
          <div className="space-y-3">
            <p className={cn(BODY_MUTED)}>
              Try one of these, or ask in your own words.
            </p>
            <ul className="flex flex-wrap gap-2">
              {[
                "Where is my project up to?",
                "What is still outstanding?",
                "What did you finish this week?",
              ].map((suggestion) => (
                <li key={suggestion}>
                  <button
                    type="button"
                    onClick={() => setDraft(suggestion)}
                    className="rounded-full border border-border/70 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
                  >
                    {suggestion}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {data && data.messages.length > 0 && (
          <ul className="space-y-6">
            {data.messages.map((message) => (
              <motion.li
                key={message.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: EASE_APPLE }}
                className="space-y-1.5"
              >
                <p className={SECTION_LABEL}>
                  {message.role === "user" ? "You" : "Helix"}
                </p>
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
                  {message.content}
                </p>
              </motion.li>
            ))}
          </ul>
        )}

        <AnimatePresence>
          {thinking && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={cn(CAPTION, "animate-pulse")}
            >
              Looking…
            </motion.p>
          )}
        </AnimatePresence>

        <div ref={endRef} />

        <div className="space-y-2">
          <Textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                void send();
              }
            }}
            placeholder="Ask about your project…"
            rows={3}
            className="resize-none border-border/70"
            disabled={thinking || !data}
          />
          <div className="flex items-center justify-between">
            <span className={META}>⌘↵ to send</span>
            <button
              type="button"
              onClick={() => void send()}
              disabled={thinking || draft.trim().length === 0 || !data}
              className={cn(
                HELIX_PILL,
                (thinking || draft.trim().length === 0 || !data) && "opacity-40"
              )}
            >
              Ask
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
