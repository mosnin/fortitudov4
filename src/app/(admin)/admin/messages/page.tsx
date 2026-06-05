"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AsciiField } from "@/components/dashboard/ascii-field";
import { toast } from "@/components/ui/toast";

interface Project {
  id: string;
  name: string;
  serviceType: string;
}
interface Message {
  id: string;
  content: string;
  role: "client" | "admin";
  senderId: string;
  createdAt: string;
}

const disciplineLabels: Record<string, string> = {
  software: "Software",
  commerce: "Commerce",
  ai: "AI",
  infrastructure: "Infrastructure",
};

const panel = "rounded-3xl border border-border/60 bg-card/60 backdrop-blur-xl";

export default function AdminMessagesPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProjects(data);
          // Honor ?project=<id> (e.g. from a "New client message" notification).
          const wanted = new URLSearchParams(window.location.search).get("project");
          const match = wanted && data.find((p: Project) => p.id === wanted);
          setSelectedId(match ? match.id : data[0].id);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setMessages([]);
    fetch(`/api/messages?projectId=${selectedId}`)
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setMessages(data))
      .catch(() => setMessages([]));
  }, [selectedId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  const selected = projects.find((p) => p.id === selectedId);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim() || !selectedId || sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: selectedId, content: draft }),
      });
      if (res.ok) {
        const msg = await res.json();
        setMessages((prev) => [...prev, msg]);
        setDraft("");
      } else {
        toast.error("Couldn't send", "Your reply wasn't delivered — try again.");
      }
    } catch {
      toast.error("Couldn't send", "Check your connection and try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-charcoal p-6 sm:p-8">
        <AsciiField className="absolute inset-0 h-full w-full opacity-50" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(249,115,22,0.18),transparent_60%)]" />
        <div className="relative z-10">
          <p className="text-xs uppercase tracking-[0.25em] text-orange/80">Messages</p>
          <h1 className="font-brand mt-2 text-3xl text-white sm:text-4xl">Client conversations</h1>
          <p className="mt-2 text-sm text-white/60">Reply to every client building with the studio.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3" style={{ height: "calc(100vh - 320px)" }}>
        {/* Thread list */}
        <div className={cn(panel, "overflow-hidden lg:col-span-1")}>
          <div className="border-b border-border/60 px-4 py-3">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-orange/80">Threads</p>
          </div>
          <div className="overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-5 w-5 animate-spin text-orange" />
              </div>
            ) : projects.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-muted-foreground">No builds yet.</p>
            ) : (
              projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className={cn(
                    "w-full cursor-pointer border-b border-border/40 p-4 text-left transition-colors",
                    selectedId === p.id
                      ? "border-l-2 border-l-orange bg-orange/[0.06]"
                      : "hover:bg-orange/[0.03]"
                  )}
                >
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {disciplineLabels[p.serviceType] ?? p.serviceType}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat */}
        <div className={cn(panel, "flex flex-col overflow-hidden lg:col-span-2")}>
          <div className="border-b border-border/60 px-5 py-3.5">
            <p className="text-sm font-medium">{selected?.name ?? "Select a thread"}</p>
          </div>
          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-muted-foreground">No messages yet.</p>
              </div>
            ) : (
              messages.map((m) => {
                const mine = m.role === "admin";
                return (
                  <div key={m.id} className={cn("flex flex-col", mine ? "items-end" : "items-start")}>
                    <div
                      className={cn(
                        "max-w-[80%] whitespace-pre-wrap rounded-3xl px-4 py-3 text-sm",
                        mine
                          ? "rounded-br-lg bg-orange text-white"
                          : "rounded-bl-lg border border-border/60 bg-muted text-foreground"
                      )}
                    >
                      {m.content}
                    </div>
                    <span className="mt-1 px-1 text-[11px] text-muted-foreground">
                      {mine ? "You" : "Client"} ·{" "}
                      {new Date(m.createdAt).toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                );
              })
            )}
          </div>
          <form className="border-t border-border/60 p-3" onSubmit={send}>
            <div className="flex items-end gap-2 rounded-3xl border border-border/60 bg-background/40 p-2 focus-within:border-orange/50">
              <input
                placeholder="Type your reply…"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                disabled={!selectedId}
                className="flex-1 bg-transparent px-3 py-2.5 text-sm focus:outline-none"
              />
              <button
                type="submit"
                disabled={!draft.trim() || sending || !selectedId}
                aria-label="Send"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-orange text-white transition-colors hover:bg-orange-dark disabled:opacity-40"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
