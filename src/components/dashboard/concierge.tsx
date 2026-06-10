"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { MessageCircle, X, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toast";

type Msg = { role: "user" | "assistant"; content: string };

const GREETING =
  "I'm your studio concierge. Ask me where your build stands, what's left, or what needs you.";

const SUGGESTIONS = ["Where are we?", "What's left?", "What needs me?"];

export function Concierge({ projectId, enabled = true }: { projectId: string; enabled?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep the latest message in view as the conversation grows / typing appears.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  // Focus the input when the panel opens.
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (enabled === false) return null;

  async function send(text: string) {
    const message = text.trim();
    if (!message || sending) return;

    const nextHistory = [...messages, { role: "user" as const, content: message }];
    setMessages(nextHistory);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          message,
          // Send prior turns (excluding the one we just added) for continuity.
          history: messages.slice(-12),
        }),
      });

      if (res.status === 429) {
        toast.error("Slow down a moment", "You've sent a lot of questions — try again shortly.");
        return;
      }
      if (!res.ok) throw new Error(`Request failed (${res.status})`);

      const data = (await res.json()) as { reply?: string; acted?: boolean };
      const reply = data.reply?.trim();
      if (!reply) throw new Error("Empty reply");

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      // The concierge filed a revision or messaged the studio — refresh so the
      // build's activity/threads reflect it.
      if (data.acted) router.refresh();
    } catch {
      toast.error("Couldn't reach the concierge", "Please try again in a moment.");
    } finally {
      setSending(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    void send(input);
  }

  return (
    <>
      {/* Launcher — bottom-right, clears the centered dock. */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close concierge" : "Open concierge"}
        aria-expanded={open}
        className={cn(
          "fixed bottom-5 right-5 z-[60] flex h-12 w-12 items-center justify-center rounded-full shadow-xl shadow-orange/30 transition-colors",
          open
            ? "border border-border/60 bg-charcoal text-white hover:bg-charcoal-light"
            : "bg-orange text-white hover:bg-orange-dark"
        )}
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" strokeWidth={2.2} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Studio concierge"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-20 right-5 z-[60] flex h-[min(560px,72vh)] w-[min(92vw,380px)] flex-col overflow-hidden rounded-3xl border border-border/60 bg-card/95 shadow-2xl backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-orange/80">
                  Concierge
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">Knows your build · can act for you</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {/* Greeting */}
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-border/60 bg-background/60 px-3.5 py-2.5 text-sm leading-relaxed">
                  {GREETING}
                </div>
              </div>

              {messages.length === 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => void send(s)}
                      className="rounded-full border border-border/60 px-3 py-1.5 font-mono text-[11px] text-muted-foreground transition-colors hover:border-orange/40 hover:text-foreground"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {messages.map((m, i) => (
                <div
                  key={i}
                  className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[85%] whitespace-pre-wrap px-3.5 py-2.5 text-sm leading-relaxed",
                      m.role === "user"
                        ? "rounded-2xl rounded-tr-sm bg-orange text-white"
                        : "rounded-2xl rounded-tl-sm border border-border/60 bg-background/60"
                    )}
                  >
                    {m.content}
                  </div>
                </div>
              ))}

              {sending && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-tl-sm border border-border/60 bg-background/60 px-3.5 py-2.5">
                    <span className="font-mono text-xs text-muted-foreground" aria-live="polite">
                      thinking…
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Composer */}
            <form
              onSubmit={onSubmit}
              className="flex items-center gap-2 border-t border-border/60 px-3 py-3"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your build…"
                maxLength={2000}
                disabled={sending}
                className="min-w-0 flex-1 rounded-full border border-border/60 bg-background/60 px-4 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-orange/50 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                aria-label="Send"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange text-white transition-colors hover:bg-orange-dark disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowUp className="h-4 w-4" strokeWidth={2.4} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
