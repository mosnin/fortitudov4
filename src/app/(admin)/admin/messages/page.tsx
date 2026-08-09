"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MessageSquare } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { usePolling } from "@/hooks/use-polling";
import { services } from "@/lib/services";

const serviceLabels: Record<string, string> = Object.fromEntries(
  services.map((s) => [s.id, s.name])
);

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

/**
 * Admin message center — staff side of client <> agency messaging. Staff see
 * every project here via the staff-scoped projects API; threads refresh on a
 * simple polling loop (no realtime dependency).
 */
export default function AdminMessagesPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  // Clear the thread on project switch; the poll below refills it.
  useEffect(() => {
    setMessages([]);
  }, [selectedProjectId]);

  usePolling<Message[]>({
    url: `/api/messages?projectId=${selectedProjectId}`,
    interval: 5000,
    enabled: !!selectedProjectId,
    onUpdate: (data) => {
      if (!Array.isArray(data)) return;
      setMessages((prev) => {
        const existingIds = new Set(prev.map((m) => m.id));
        const incoming = data.filter((m) => !existingIds.has(m.id));
        if (incoming.length === 0) return prev;
        return [...prev, ...incoming];
      });
    },
  });

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
        setMessages((prev) =>
          prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]
        );
        setNewMessage("");
      }
    } catch {
      window.alert("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  const header = (
    <header className="border-b border-border pb-6">
      <p className="eyebrow-mono">Fortitudo · Admin</p>
      <h1 className="font-title mt-2 text-3xl tracking-tight sm:text-4xl">
        Messages
      </h1>
      <p className="mt-2 text-muted-foreground">
        Chat with clients across every project.
      </p>
    </header>
  );

  if (loading) {
    return (
      <div className="space-y-8">
        {header}
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {header}

      {projects.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No projects yet"
          description="Once projects exist, their message threads appear here."
        />
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[16rem_1fr]">
          {/* Project list */}
          <aside className="lg:border-r lg:border-border lg:pr-6">
            <p className="micro-label border-b border-border pb-3">Projects</p>
            <div className="mt-3 space-y-0.5">
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => setSelectedProjectId(project.id)}
                  className={cn(
                    "w-full rounded-lg px-3 py-2 text-left text-[13px] transition-colors cursor-pointer",
                    project.id === selectedProjectId
                      ? "bg-muted font-medium text-foreground"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  )}
                >
                  <span className="block truncate">{project.name}</span>
                  <span className="block truncate font-mono text-[10px] uppercase text-muted-foreground">
                    {serviceLabels[project.serviceType] ?? project.serviceType}
                  </span>
                </button>
              ))}
            </div>
          </aside>

          {/* Thread */}
          <section className="flex min-h-[28rem] flex-col">
            <div className="border-b border-border pb-3">
              <h2 className="text-[15px] font-semibold">
                {selectedProject?.name ?? "Select a project"}
              </h2>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto py-5">
              {messages.length === 0 ? (
                <p className="pt-10 text-center text-sm text-muted-foreground">
                  No messages yet — start the conversation.
                </p>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex",
                      message.role === "admin" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm",
                        message.role === "admin"
                          ? "bg-foreground text-background"
                          : "bg-muted"
                      )}
                    >
                      <p className="whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                      <p
                        className={cn(
                          "mt-1 font-mono text-[10px]",
                          message.role === "admin"
                            ? "text-background/70"
                            : "text-muted-foreground"
                        )}
                      >
                        {message.role === "admin" ? "Fortitudo Team" : "Client"} ·{" "}
                        {new Date(message.createdAt).toLocaleTimeString(
                          "en-US",
                          { hour: "numeric", minute: "2-digit" }
                        )}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <form
              onSubmit={handleSend}
              className="flex items-center gap-2 border-t border-border pt-4"
            >
              <Input
                placeholder="Reply to the client…"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={!selectedProjectId || sending}
              />
              <Button
                type="submit"
                size="icon"
                disabled={!newMessage.trim() || sending}
                aria-label="Send"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
