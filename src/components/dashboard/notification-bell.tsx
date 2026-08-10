"use client";

import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePolling } from "@/hooks/use-polling";
import { QUIET_LINK, SECTION_LABEL, STATUS_PILL_ACTIVE } from "@/lib/typography";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body?: string | null;
  read: boolean;
  actionUrl?: string | null;
  createdAt: string;
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Initial fetch + gentle background refresh so the badge stays honest
  // without realtime infrastructure (fused polling pattern).
  const { loading } = usePolling<NotificationItem[]>({
    url: "/api/notifications",
    interval: 30000,
    onUpdate: (data) => {
      if (Array.isArray(data)) setNotifications(data.slice(0, 10));
    },
  });
  const loaded = !loading;

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
      {/* The bell IS the control — a functional icon button, not decoration. */}
      <button
        onClick={() => setOpen(!open)}
        className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/[0.04] hover:text-foreground"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" strokeWidth={1.75} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-medium tabular-nums text-background">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-border bg-card animate-fade-in sm:w-96">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className={SECTION_LABEL}>Notifications</p>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className={cn(QUIET_LINK, "cursor-pointer text-xs")}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto px-4">
            {!loaded ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Loading…
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No notifications yet
              </div>
            ) : (
              <ul className="divide-y divide-border/60">
                {notifications.map((notification) => (
                  <li key={notification.id}>
                    <Link
                      href={notification.actionUrl || "#"}
                      onClick={() => {
                        markRead(notification.id);
                        setOpen(false);
                      }}
                      className="group/row -mx-2 flex items-start gap-3 rounded-md px-2 py-3 transition-colors hover:bg-muted/30"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={cn(
                              "text-sm",
                              notification.read
                                ? "text-muted-foreground"
                                : "font-medium text-foreground"
                            )}
                          >
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <span className={cn(STATUS_PILL_ACTIVE, "shrink-0")}>
                              New
                            </span>
                          )}
                        </div>
                        {notification.body && (
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            {notification.body}
                          </p>
                        )}
                        <p className="mt-1 text-xs tabular-nums text-muted-foreground">
                          {formatRelativeTime(notification.createdAt)}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border p-2">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="block rounded-lg py-1.5 text-center text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
