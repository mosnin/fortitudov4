"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { AsciiField } from "@/components/dashboard/ascii-field";
import { Reveal } from "@/components/ui/motion";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: string;
  title: string;
  body?: string | null;
  read: boolean;
  actionUrl?: string | null;
  createdAt: string;
}

// Short, monospace tag per notification type — typography instead of icon chips.
function tagFor(type: string): string {
  const map: Record<string, string> = {
    phase_update: "phase",
    message_received: "message",
    payment_confirmed: "payment",
    file_uploaded: "file",
    comment_added: "comment",
    revision_response: "revision",
    survey_request: "survey",
  };
  return map[type] ?? type.split("_")[0] ?? "notice";
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const diffMins = Math.floor((Date.now() - date.getTime()) / 60000);
  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getDateGroup(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const notifDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  if (notifDate.getTime() === today.getTime()) return "Today";
  if (notifDate.getTime() === yesterday.getTime()) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => Array.isArray(data) && setNotifications(data))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = async () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length === 0) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationIds: unreadIds }),
    }).catch(() => {});
  };

  const markRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationIds: [id] }),
    }).catch(() => {});
  };

  const grouped = notifications.reduce<Record<string, Notification[]>>((acc, n) => {
    const group = getDateGroup(n.createdAt);
    (acc[group] ??= []).push(n);
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      {/* Masthead */}
      <Reveal className="relative overflow-hidden rounded-3xl border border-border/60 bg-charcoal p-6 sm:p-8">
        <AsciiField className="absolute inset-0 h-full w-full opacity-50" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(249,115,22,0.18),transparent_60%)]" />
        <div className="relative z-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-orange/80">Notifications</p>
            <h1 className="font-brand mt-2 text-3xl text-white sm:text-4xl">Signal</h1>
            <p className="mt-2 font-mono text-xs text-white/55">
              {loading
                ? "syncing…"
                : unreadCount > 0
                  ? `${unreadCount} unread · ${notifications.length} total`
                  : `all clear · ${notifications.length} total`}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="shrink-0 rounded-full border border-white/15 px-3 py-1.5 font-mono text-[11px] text-white/70 transition-colors hover:bg-white/5 hover:text-white"
            >
              mark all read
            </button>
          )}
        </div>
      </Reveal>

      {/* Feed */}
      {loading ? (
        <div className="flex justify-center rounded-3xl border border-border/60 bg-card/40 py-16 backdrop-blur-xl">
          <Loader2 className="h-5 w-5 animate-spin text-orange" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-3xl border border-border/60 bg-card/40 p-12 text-center backdrop-blur-xl">
          <p className="font-mono text-sm text-muted-foreground">~ no signal yet ~</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Phase updates, messages, and payment confirmations surface here.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date} className="overflow-hidden rounded-3xl border border-border/60 bg-card/40 backdrop-blur-xl">
              {/* Group rule */}
              <div className="flex items-center gap-3 px-5 pb-2 pt-4">
                <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                  {date}
                </span>
                <span className="h-px flex-1 bg-border/60" />
                <span className="font-mono text-[11px] tabular-nums text-muted-foreground/60">
                  {items.length.toString().padStart(2, "0")}
                </span>
              </div>

              {items.map((n) => (
                <Link
                  key={n.id}
                  href={n.actionUrl || "#"}
                  onClick={() => markRead(n.id)}
                  className={cn(
                    "flex items-start gap-3 border-t border-border/40 px-5 py-3.5 transition-colors hover:bg-orange/[0.04] sm:gap-4",
                    !n.read && "bg-orange/[0.05]"
                  )}
                >
                  <span
                    className={cn("mt-0.5 font-mono text-xs", n.read ? "text-muted-foreground/40" : "text-orange")}
                    aria-hidden
                  >
                    {n.read ? "○" : "●"}
                  </span>
                  <span className="mt-0.5 hidden w-20 shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] text-orange/70 sm:block">
                    {tagFor(n.type)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={cn("text-sm", n.read ? "text-foreground/80" : "font-medium text-foreground")}>
                      {n.title}
                    </p>
                    {n.body && <p className="mt-0.5 truncate text-xs text-muted-foreground">{n.body}</p>}
                    <span className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-orange/60 sm:hidden">
                      {tagFor(n.type)}
                    </span>
                  </div>
                  <span className="mt-0.5 shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">
                    {formatRelativeTime(n.createdAt)}
                  </span>
                </Link>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
