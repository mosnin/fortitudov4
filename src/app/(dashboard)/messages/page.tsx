"use client";

import { useState, useEffect, useRef } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { CrmPageHeader, TabStrip } from "@/components/crm";
import { usePolling } from "@/hooks/use-polling";
import { cn } from "@/lib/utils";
import {
  CAPTION,
  PAGE_RHYTHM,
  PRIMARY_PILL,
  READING_COL,
} from "@/lib/typography";

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

export default function MessagesPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
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
        setProjects([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Reset the thread when switching projects so stale messages never flash.
  useEffect(() => {
    setMessages([]);
  }, [selectedProjectId]);

  // Polling keeps the thread fresh without realtime infrastructure — the DB
  // stays the source of truth, new messages merge in by id every 5s.
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

  if (loading) {
    return (
      <div className={cn(PAGE_RHYTHM, "pb-12")}>
        <div className={cn(READING_COL, PAGE_RHYTHM)}>
          <CrmPageHeader
            section="Workspace."
            title="Messages"
            subtitle="Loading your thread with the team…"
          />
          <div
            className="flex flex-col rounded-xl border border-border"
            style={{ height: "calc(100vh - 320px)" }}
          >
            <div className="border-b border-border px-4 py-4">
              <div className="h-4 w-48 animate-pulse rounded bg-muted" />
            </div>
            <div className="flex-1 space-y-4 p-4">
              <div className="h-14 w-2/3 animate-pulse rounded-xl bg-muted" />
              <div className="ml-auto h-10 w-1/2 animate-pulse rounded-xl bg-muted" />
              <div className="h-14 w-3/5 animate-pulse rounded-xl bg-muted" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // One sentence of status — where the conversation actually stands.
  const status =
    projects.length === 0
      ? "No thread yet — one opens with your first project."
      : messages.length === 0
        ? `Nothing said yet on ${selectedProject?.name ?? "this project"}.`
        : `${messages.length} ${
            messages.length === 1 ? "message" : "messages"
          } on ${selectedProject?.name ?? "this project"}.`;

  return (
    <div className={cn(PAGE_RHYTHM, "pb-12")}>
      <div className={cn(READING_COL, PAGE_RHYTHM)}>
        <CrmPageHeader
          section="Workspace."
          title="Messages"
          subtitle={status}
          action={
            selectedProjectId ? (
              <span className={CAPTION}>Updates every 5 seconds</span>
            ) : undefined
          }
        />

        {projects.length === 0 ? (
          <EmptyState
            className="border-t border-border/60"
            title="No messages yet"
            description="Once you have an active project, you can chat directly with the Fortitudo team here."
          />
        ) : (
          <>
            {/* Project spine */}
            {projects.length > 1 && selectedProjectId && (
              <TabStrip
                tabs={projects.map((p) => ({ key: p.id, label: p.name }))}
                active={selectedProjectId}
                onChange={setSelectedProjectId}
                ariaLabel="Project"
              />
            )}

            <div
              className="flex flex-col overflow-hidden rounded-xl border border-border"
              style={{ height: "calc(100vh - 320px)" }}
            >
              <div className="border-b border-border px-4 py-3.5">
                <h2 className="text-sm font-medium text-foreground">
                  {selectedProject?.name || "Select a project"}
                </h2>
              </div>

              {/* Messages area */}
              <div className="flex-1 space-y-4 overflow-y-auto p-4">
                {messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        No messages yet.
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Send one below to get started.
                      </p>
                    </div>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex max-w-[80%] flex-col",
                        message.role === "client"
                          ? "ml-auto items-end"
                          : "items-start"
                      )}
                    >
                      <div
                        className={cn(
                          "rounded-2xl px-4 py-3 text-sm",
                          message.role === "client"
                            ? "rounded-br-md bg-foreground text-background"
                            : "rounded-bl-md bg-muted text-foreground"
                        )}
                      >
                        {message.content}
                      </div>
                      <span className="mt-1 text-xs tabular-nums text-muted-foreground">
                        {message.role === "admin" ? "Fortitudo Team" : "You"}{" "}
                        &middot; {new Date(message.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message input */}
              <div className="border-t border-border p-4">
                <form className="flex gap-2" onSubmit={handleSend}>
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className={cn(
                      PRIMARY_PILL,
                      "shrink-0 disabled:pointer-events-none disabled:opacity-50"
                    )}
                  >
                    Send
                  </button>
                </form>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
