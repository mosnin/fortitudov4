"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body?: string | null;
  read: boolean;
  actionUrl?: string | null;
  createdAt: string;
}

// Short, monospace tag per type — typography over icon chips, on aesthetic.
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

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (Array.isArray(data)) setNotifications(data.slice(0, 10));
    } catch {
      /* keep what we have */
    } finally {
      setLoaded(true);
    }
  }, []);

  // Fetch on mount, poll, and refetch when the tab regains focus — so the
  // unread count stays honest without a manual refresh.
  useEffect(() => {
    load();
    const timer = setInterval(load, 45000);
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [load]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const markAllRead = async () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length === 0) return;

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationIds: unreadIds }),
      });
    } catch {
      // Revert optimistic update on failure
      setNotifications((prev) =>
        prev.map((n) => (unreadIds.includes(n.id) ? { ...n, read: false } : n))
      );
    }
  };

  const markRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationIds: [id] }),
      });
    } catch {
      // Revert optimistic update on failure
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: false } : n))
      );
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background/80 backdrop-blur-md hover:bg-muted transition-colors cursor-pointer"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-border/60 bg-card/95 shadow-2xl backdrop-blur-xl animate-fade-in sm:w-96">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-orange/80">
              Signal
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="cursor-pointer font-mono text-[11px] text-muted-foreground transition-colors hover:text-foreground"
              >
                mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {!loaded ? (
              <div className="p-6 text-center font-mono text-xs text-muted-foreground">syncing…</div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center font-mono text-xs text-muted-foreground">
                ~ no signal yet ~
              </div>
            ) : (
              notifications.map((notification) => (
                <Link
                  key={notification.id}
                  href={notification.actionUrl || "#"}
                  onClick={() => {
                    markRead(notification.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex items-start gap-3 border-b border-border/40 px-4 py-3 transition-colors last:border-0 hover:bg-orange/[0.04]",
                    !notification.read && "bg-orange/[0.05]"
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 font-mono text-xs",
                      notification.read ? "text-muted-foreground/40" : "text-orange"
                    )}
                    aria-hidden
                  >
                    {notification.read ? "○" : "●"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-orange/70">
                        {tagFor(notification.type)}
                      </span>
                      <span className="shrink-0 font-mono text-[10px] tabular-nums text-muted-foreground">
                        {formatRelativeTime(notification.createdAt)}
                      </span>
                    </div>
                    <p className={cn("mt-0.5 text-sm", !notification.read && "font-medium")}>
                      {notification.title}
                    </p>
                    {notification.body && (
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">{notification.body}</p>
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border/60 p-2">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="block rounded-lg py-1.5 text-center font-mono text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              view all
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
