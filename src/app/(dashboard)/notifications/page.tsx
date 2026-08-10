"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { PageHero } from "@/components/ui/firecrawl";
import { rowCascade, rowItem } from "@/lib/motion";
import { cn } from "@/lib/utils";
import {
  GHOST_PILL,
  PAGE_RHYTHM,
  READING_COL,
  SECTION_LABEL,
  SECTION_RHYTHM,
  STATUS_PILL_ACTIVE,
} from "@/lib/typography";

interface Notification {
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
      .then((data) => {
        if (Array.isArray(data)) setNotifications(data);
      })
      .catch(() => {
        setNotifications([]);
      })
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
    });
  };

  // Group by date
  const grouped = notifications.reduce<Record<string, Notification[]>>((acc, n) => {
    const group = getDateGroup(n.createdAt);
    if (!acc[group]) acc[group] = [];
    acc[group].push(n);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className={cn(PAGE_RHYTHM, "pb-12")}>
        <div className={cn(READING_COL, PAGE_RHYTHM)}>
          <PageHero
            section="Account"
            title="Notifications"
            description="Loading your latest updates…"
          />
          <ul className="divide-y divide-border/60">
            {Array.from({ length: 5 }).map((_, i) => (
              <li key={i} className="space-y-2 py-3">
                <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(PAGE_RHYTHM, "pb-12")}>
      <div className={cn(READING_COL, PAGE_RHYTHM)}>
        <PageHero
          section="Account"
          title="Notifications"
          description={
            unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}.`
              : "You're all caught up."
          }
          action={
            unreadCount > 0 ? (
              <button onClick={markAllRead} className={cn(GHOST_PILL, "cursor-pointer")}>
                Mark all read
              </button>
            ) : undefined
          }
        />

        {notifications.length === 0 ? (
          <div className="border-t border-border py-10">
            <p className="text-sm font-medium text-foreground">
              You&rsquo;re all caught up
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Project updates, messages, and payment confirmations will show up
              here.
            </p>
          </div>
        ) : (
          <div className={PAGE_RHYTHM}>
            {Object.entries(grouped).map(([date, items]) => (
              <section key={date} className={SECTION_RHYTHM}>
                <p className={SECTION_LABEL}>{date}</p>
                <motion.ul
                  variants={rowCascade}
                  initial="hidden"
                  animate="visible"
                  className="divide-y divide-border/60 border-t border-border/60"
                >
                  {items.map((notification) => (
                    <motion.li key={notification.id} variants={rowItem}>
                      <Link
                        href={notification.actionUrl || "#"}
                        className="group/row -mx-2 flex items-start gap-3 rounded-md px-2 py-3 transition-colors hover:bg-muted/30"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p
                              className={cn(
                                "text-sm",
                                notification.read
                                  ? "text-foreground"
                                  : "font-medium text-foreground"
                              )}
                            >
                              {notification.title}
                            </p>
                            <div className="flex shrink-0 items-center gap-2">
                              {!notification.read && (
                                <span className={STATUS_PILL_ACTIVE}>New</span>
                              )}
                              <span className="text-xs tabular-nums text-muted-foreground">
                                {formatRelativeTime(notification.createdAt)}
                              </span>
                            </div>
                          </div>
                          {notification.body && (
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {notification.body}
                            </p>
                          )}
                        </div>
                      </Link>
                    </motion.li>
                  ))}
                </motion.ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
