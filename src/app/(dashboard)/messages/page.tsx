"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, MessageSquare } from "lucide-react";
import { Reveal } from "@/components/ui/motion";
import { cn } from "@/lib/utils";

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

const card = "rounded-3xl border border-border/60 bg-card/80 backdrop-blur-xl";

export default function MessagesPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch projects
  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProjects(data);
          if (data.length > 0) setSelectedProjectId(data[0].id);
        }
      })
      .catch(() => {
        setError("Failed to load projects. Please try again.");
        setLoading(false);
      })
      .finally(() => setLoading(false));
  }, []);

  // Fetch messages when project changes
  useEffect(() => {
    if (!selectedProjectId) return;
    setMessages([]);
    fetch(`/api/messages?projectId=${selectedProjectId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setMessages(data);
        }
      })
      .catch(() => {
        setMessages([]);
      });
  }, [selectedProjectId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedProjectId) return;

    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedProjectId,
          content: newMessage,
        }),
      });
      if (res.ok) {
        const msg = await res.json();
        setMessages((prev) => [...prev, msg]);
        setNewMessage("");
      }
    } catch {
      window.alert("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-orange/80">Fortitudo // Comms</p>
          <h1 className="mt-2 text-2xl font-brand sm:text-3xl">Messages</h1>
          <p className="text-muted-foreground mt-1">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Reveal>
        <p className="text-xs uppercase tracking-[0.2em] text-orange/80">Fortitudo // Comms</p>
        <h1 className="mt-2 text-2xl font-brand sm:text-3xl">Messages</h1>
        <p className="text-muted-foreground mt-1">
          Chat with the Fortitudo team about your project.
        </p>
        {error && <p className="text-destructive mt-1 text-sm">{error}</p>}
      </Reveal>

      {projects.length === 0 ? (
        <Reveal delay={0.1} className={cn(card, "flex flex-col items-center justify-center px-6 py-16 text-center")}>
          <MessageSquare className="h-8 w-8 text-orange/40" />
          <p className="mt-4 text-base font-medium">No messages yet</p>
          <p className="text-muted-foreground mt-1 max-w-sm text-sm">
            Once you have an active project, you can chat directly with the Fortitudo team here.
          </p>
        </Reveal>
      ) : (
        <Reveal delay={0.08} className="space-y-5">
          {/* Project selector — pills */}
          {projects.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {projects.map((project) => {
                const active = selectedProjectId === project.id;
                return (
                  <button
                    key={project.id}
                    type="button"
                    onClick={() => setSelectedProjectId(project.id)}
                    className={cn(
                      "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-orange text-white"
                        : "border border-border/60 bg-card/60 text-muted-foreground hover:border-orange/50 hover:text-foreground"
                    )}
                  >
                    {project.name}
                  </button>
                );
              })}
            </div>
          )}

          <div className={cn(card, "flex flex-col overflow-hidden")} style={{ height: "calc(100vh - 320px)", minHeight: "420px" }}>
            {/* Conversation header */}
            <div className="flex items-center gap-3 border-b border-border/60 px-5 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange/10 text-sm font-semibold text-orange">
                {(selectedProject?.name || "?").slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold">{selectedProject?.name || "Select a project"}</p>
                <p className="text-xs text-muted-foreground">Fortitudo Team</p>
              </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <MessageSquare className="mx-auto mb-2 h-8 w-8 text-orange/30" />
                  <p className="text-sm text-muted-foreground">No messages yet.</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Send one below to get started.</p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {messages.map((message, i) => (
                    <motion.div
                      key={message.id}
                      layout
                      initial={{ opacity: 0, scale: 0.96, y: 8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1], delay: Math.min(i * 0.03, 0.3) }}
                      className={cn(
                        "flex max-w-[80%] flex-col",
                        message.role === "client" ? "ml-auto items-end" : "items-start"
                      )}
                    >
                      <div
                        className={cn(
                          "rounded-2xl px-4 py-3 text-sm",
                          message.role === "client"
                            ? "rounded-br-md bg-orange text-white"
                            : "rounded-bl-md bg-muted"
                        )}
                      >
                        {message.content}
                      </div>
                      <span className="mt-1 text-xs text-muted-foreground">
                        {message.role === "admin" ? "Fortitudo Team" : "You"} &middot;{" "}
                        {new Date(message.createdAt).toLocaleString()}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <div className="border-t border-border/60 p-4">
              <form className="flex items-center gap-2" onSubmit={handleSend}>
                <input
                  placeholder="Type your message…"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="h-11 flex-1 rounded-full border border-border/60 bg-background/50 px-4 text-sm placeholder:text-muted-foreground focus-visible:border-orange/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/30"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-orange text-white transition-colors hover:bg-orange-dark disabled:opacity-40"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </Reveal>
      )}
    </div>
  );
}
