"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  Bell,
  Check,
  FolderKanban,
  MessageSquare,
  CreditCard,
  Upload,
  FileText,
  Star,
} from "lucide-react";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/motion";
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

const typeIcons: Record<string, React.ElementType> = {
  phase_update: FolderKanban,
  message_received: MessageSquare,
  payment_confirmed: CreditCard,
  file_uploaded: Upload,
  comment_added: FileText,
  survey_request: Star,
};

const card = "rounded-3xl border border-border/60 bg-card/80 backdrop-blur-xl";

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
      <div className="space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-orange/80">Fortitudo // Activity</p>
          <h1 className="mt-2 text-2xl font-brand sm:text-3xl">Notifications</h1>
          <p className="text-muted-foreground mt-1">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Reveal className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-orange/80">Fortitudo // Activity</p>
          <h1 className="mt-2 text-2xl font-brand sm:text-3xl">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
              : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllRead}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border/60 bg-card/60 px-4 py-2 text-sm font-medium transition-colors hover:border-orange/50"
          >
            <Check className="h-4 w-4" />
            Mark all read
          </button>
        )}
      </Reveal>

      {notifications.length === 0 ? (
        <Reveal delay={0.1} className={cn(card, "flex flex-col items-center justify-center px-6 py-16 text-center")}>
          <Bell className="h-8 w-8 text-orange/40" />
          <p className="mt-4 text-base font-medium">You&apos;re all caught up</p>
          <p className="text-muted-foreground mt-1 max-w-sm text-sm">
            Project updates, messages, and payment confirmations will show up here.
          </p>
        </Reveal>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date}>
              <h3 className="mb-3 text-sm font-medium text-muted-foreground">{date}</h3>
              <RevealGroup className="space-y-2.5">
                {items.map((notification) => {
                  const Icon = typeIcons[notification.type] || Bell;
                  return (
                    <RevealItem key={notification.id}>
                      <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
                        <Link
                          href={notification.actionUrl || "#"}
                          className={cn(
                            "flex gap-4 rounded-2xl border px-4 py-4 transition-colors",
                            notification.read
                              ? "border-border/60 bg-card/60 hover:border-border"
                              : "border-orange/40 bg-orange/[0.06] hover:border-orange/60"
                          )}
                        >
                          <Icon
                            className={cn(
                              "mt-0.5 h-5 w-5 shrink-0",
                              notification.read ? "text-muted-foreground" : "text-orange"
                            )}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <p className={cn("text-sm", !notification.read && "font-semibold")}>
                                {notification.title}
                              </p>
                              <div className="flex shrink-0 items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                  {formatRelativeTime(notification.createdAt)}
                                </span>
                                {!notification.read && (
                                  <span className="h-2 w-2 rounded-full bg-orange" />
                                )}
                              </div>
                            </div>
                            {notification.body && (
                              <p className="mt-0.5 text-sm text-muted-foreground">
                                {notification.body}
                              </p>
                            )}
                          </div>
                        </Link>
                      </motion.div>
                    </RevealItem>
                  );
                })}
              </RevealGroup>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
