"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AsciiField } from "@/components/dashboard/ascii-field";
import { Reveal } from "@/components/ui/motion";

interface Message {
  id: string;
  content: string;
  role: "client" | "admin";
  senderId: string;
  createdAt: string;
}

interface Project {
  id: string;
  name: string;
  serviceType: string;
}

const easeOut = [0.16, 1, 0.3, 1] as const;

export default function MessagesPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProjects(data);
          if (data.length > 0) setSelectedProjectId(data[0].id);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedProjectId) return;
    setMessages([]);
    fetch(`/api/messages?projectId=${selectedProjectId}`)
      .then((res) => res.json())
      .then((data) => Array.isArray(data) && setMessages(data))
      .catch(() => setMessages([]));
  }, [selectedProjectId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedProjectId || sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: selectedProjectId, content: newMessage }),
      });
      if (res.ok) {
        const msg = await res.json();
        setMessages((prev) => [...prev, msg]);
        setNewMessage("");
      }
    } catch {
      /* swallow — composer stays populated for retry */
    } finally {
      setSending(false);
    }
  };

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  return (
    <div className="mx-auto flex h-[calc(100vh-12rem)] max-w-3xl flex-col">
      {/* Masthead */}
      <Reveal className="relative mb-5 shrink-0 overflow-hidden rounded-3xl border border-border/60 bg-charcoal p-6 sm:p-7">
        <AsciiField className="absolute inset-0 h-full w-full opacity-50" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(249,115,22,0.16),transparent_65%)]" />
        <div className="relative z-10">
          <p className="text-xs uppercase tracking-[0.25em] text-orange/80">Messages</p>
          <h1 className="font-brand mt-2 text-2xl sm:text-3xl">Talk to your architect</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Direct line to the Fortitudo team building your project.
          </p>
        </div>
      </Reveal>

      {/* Project selector */}
      {projects.length > 1 && (
        <div className="mb-3 flex shrink-0 flex-wrap gap-2">
          {projects.map((project) => {
            const active = selectedProjectId === project.id;
            return (
              <button
                key={project.id}
                onClick={() => setSelectedProjectId(project.id)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "border-orange/40 bg-orange/15 text-orange"
                    : "border-border/60 bg-card/40 text-muted-foreground hover:text-foreground"
                )}
              >
                {project.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Conversation */}
      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto rounded-3xl border border-border/60 bg-card/40 p-4 backdrop-blur-xl sm:p-6"
      >
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-orange" />
          </div>
        ) : projects.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="font-brand text-lg">No conversations yet</p>
            <p className="mt-1 max-w-xs text-sm text-muted-foreground">
              Once you have an active build, you can chat directly with your architect here.
            </p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="font-brand text-lg">{selectedProject?.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              No messages yet — send one below to get started.
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((m) => {
              const mine = m.role === "client";
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: easeOut }}
                  className={cn("flex flex-col", mine ? "items-end" : "items-start")}
                >
                  <div
                    className={cn(
                      "max-w-[85%] whitespace-pre-wrap rounded-3xl px-4 py-3 text-sm",
                      mine
                        ? "rounded-br-lg bg-orange text-white"
                        : "rounded-bl-lg border border-border/60 bg-charcoal text-foreground"
                    )}
                  >
                    {m.content}
                  </div>
                  <span className="mt-1 px-1 text-[11px] text-muted-foreground">
                    {mine ? "You" : "Fortitudo Team"} ·{" "}
                    {new Date(m.createdAt).toLocaleString([], {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Composer */}
      {projects.length > 0 && (
        <form onSubmit={handleSend} className="mt-3 shrink-0">
          <div className="flex items-end gap-2 rounded-3xl border border-border/60 bg-card/80 p-2 backdrop-blur-xl focus-within:border-orange/50">
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message…"
              className="flex-1 bg-transparent px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              aria-label="Send"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-orange text-white transition-colors hover:bg-orange-dark disabled:opacity-40"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
