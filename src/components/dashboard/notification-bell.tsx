"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useReducedMotionSafe } from "@/hooks/use-reduced-motion-safe";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { RecordList, RecordRow, RowPill } from "@/components/crm";
import { POPOVER_SURFACE } from "@/components/ui/card";
import { usePolling } from "@/hooks/use-polling";
import { QUIET_LINK, SECTION_LABEL } from "@/lib/typography";

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

  // Ring the bell when unread goes UP (Spectrum UI notification-bell): the
  // dome swings like a released pendulum, the clapper counter-swings in
  // phase, and the badge count rolls. Never on first load, never on a drop.
  const reduce = useReducedMotionSafe();
  const [ringKey, setRingKey] = useState(0);
  const [prevUnread, setPrevUnread] = useState<number | null>(null);
  if (prevUnread !== unreadCount) {
    if (prevUnread !== null && unreadCount > prevUnread) setRingKey((k) => k + 1);
    setPrevUnread(unreadCount);
  }
  const swinging = ringKey > 0 && !reduce;
  const swing = swinging
    ? { duration: 0.9, times: [0, 0.1, 0.26, 0.42, 0.58, 0.74, 0.88, 1], ease: "easeInOut" as const }
    : { duration: 0 };

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
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
      >
        <motion.span
          key={`bell-${ringKey}`}
          className="inline-flex"
          style={{ transformOrigin: "top center" }}
          initial={{ rotate: 0 }}
          animate={swinging ? { rotate: [0, 15, -12, 8, -5, 3, -1.5, 0] } : { rotate: 0 }}
          transition={swing}
        >
          <svg
            viewBox="0 0 24 24"
            width={16}
            height={16}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <motion.path
              d="M10.3 21a1.94 1.94 0 0 0 3.4 0"
              style={{ transformBox: "fill-box", transformOrigin: "top center" }}
              initial={{ rotate: 0 }}
              animate={swinging ? { rotate: [0, -17, 14, -10, 6, -3.5, 2, 0] } : { rotate: 0 }}
              transition={swing}
            />
          </svg>
        </motion.span>
        <AnimatePresence initial={false}>
          {unreadCount > 0 && (
            <motion.span
              key="badge"
              aria-hidden="true"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 22 }}
              className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center overflow-hidden rounded-full bg-brand px-1 text-[10px] font-medium tabular-nums text-white"
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={unreadCount}
                  initial={{ y: 8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -8, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </motion.span>
              </AnimatePresence>
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {open && (
        <div
          className={cn(
            POPOVER_SURFACE,
            "absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden animate-fade-in sm:w-96"
          )}
        >
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
              /* The kit's rows. A notification is a record like any other, and
                 drawing it by hand is what let this list drift. */
              <RecordList>
                {notifications.map((notification, i) => (
                  <RecordRow
                    key={notification.id}
                    index={i}
                    href={notification.actionUrl || "#"}
                    onClick={() => {
                      markRead(notification.id);
                      setOpen(false);
                    }}
                    primary={
                      <span
                        className={cn(
                          notification.read && "font-normal text-muted-foreground"
                        )}
                      >
                        {notification.title}
                      </span>
                    }
                    status={
                      !notification.read ? <RowPill emphasis>New</RowPill> : undefined
                    }
                    secondary={notification.body}
                    meta={
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {formatRelativeTime(notification.createdAt)}
                      </span>
                    }
                  />
                ))}
              </RecordList>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border p-2">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="block rounded-md py-1.5 text-center text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
