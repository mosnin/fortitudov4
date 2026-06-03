"use client";

import { useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { AsciiField } from "@/components/dashboard/ascii-field";

// NOTE: demo data — admin↔client threads are not yet wired to the messages API.
const conversations = [
  { id: "1", client: "John Doe", project: "Commerce platform", unread: 2, lastMessage: "I uploaded the brand guide..." },
  { id: "2", client: "Jane Smith", project: "Internal dashboard", unread: 0, lastMessage: "Looks great! Let me know..." },
  { id: "3", client: "Mike Chen", project: "Deployment pipeline", unread: 1, lastMessage: "When will testing begin?" },
];

const demoMessages = [
  { id: "1", content: "Hey! I uploaded the brand guide and logo files.", role: "client" as const, name: "John Doe", time: "10:00 AM" },
  { id: "2", content: "Perfect, I'll review them today. The wireframes are looking good.", role: "admin" as const, name: "You", time: "10:15 AM" },
  { id: "3", content: "Awesome! Can we also add a wishlist feature to the store?", role: "client" as const, name: "John Doe", time: "10:30 AM" },
];

const panel = "rounded-3xl border border-border/60 bg-card/60 backdrop-blur-xl";

export default function AdminMessagesPage() {
  const [selectedConvo, setSelectedConvo] = useState(conversations[0]);
  const [newMessage, setNewMessage] = useState("");

  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-charcoal p-6 sm:p-8">
        <AsciiField className="absolute inset-0 h-full w-full opacity-50" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(249,115,22,0.18),transparent_60%)]" />
        <div className="relative z-10">
          <p className="text-xs uppercase tracking-[0.25em] text-orange/80">Messages</p>
          <h1 className="font-brand mt-2 text-3xl text-white sm:text-4xl">Client conversations</h1>
          <p className="mt-2 text-sm text-white/60">Talk to every client building with the studio.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3" style={{ height: "calc(100vh - 320px)" }}>
        {/* Conversation list */}
        <div className={cn(panel, "overflow-hidden lg:col-span-1")}>
          <div className="border-b border-border/60 px-4 py-3">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-orange/80">Threads</p>
          </div>
          <div className="overflow-y-auto">
            {conversations.map((convo) => (
              <button
                key={convo.id}
                onClick={() => setSelectedConvo(convo)}
                className={cn(
                  "w-full cursor-pointer border-b border-border/40 p-4 text-left transition-colors",
                  selectedConvo.id === convo.id
                    ? "border-l-2 border-l-orange bg-orange/[0.06]"
                    : "hover:bg-orange/[0.03]"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{convo.client}</span>
                  {convo.unread > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange text-[11px] font-bold text-white">
                      {convo.unread}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{convo.project}</p>
                <p className="mt-1 truncate text-xs text-muted-foreground">{convo.lastMessage}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className={cn(panel, "flex flex-col overflow-hidden lg:col-span-2")}>
          <div className="border-b border-border/60 px-5 py-3.5">
            <p className="text-sm font-medium">
              {selectedConvo.client} <span className="text-muted-foreground">— {selectedConvo.project}</span>
            </p>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {demoMessages.map((msg) => (
              <div
                key={msg.id}
                className={cn("flex flex-col", msg.role === "admin" ? "items-end" : "items-start")}
              >
                <div
                  className={cn(
                    "max-w-[80%] whitespace-pre-wrap rounded-3xl px-4 py-3 text-sm",
                    msg.role === "admin"
                      ? "rounded-br-lg bg-orange text-white"
                      : "rounded-bl-lg border border-border/60 bg-muted text-foreground"
                  )}
                >
                  {msg.content}
                </div>
                <span className="mt-1 px-1 text-[11px] text-muted-foreground">
                  {msg.name} · {msg.time}
                </span>
              </div>
            ))}
          </div>
          <form
            className="border-t border-border/60 p-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (newMessage.trim()) setNewMessage("");
            }}
          >
            <div className="flex items-end gap-2 rounded-3xl border border-border/60 bg-background/40 p-2 focus-within:border-orange/50">
              <input
                placeholder="Type your message…"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 bg-transparent px-3 py-2.5 text-sm focus:outline-none"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                aria-label="Send"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-orange text-white transition-colors hover:bg-orange-dark disabled:opacity-40"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
