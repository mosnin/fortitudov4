"use client";

import { useState, useEffect } from "react";
import {
  CrmPageHeader,
  RecordList,
  RecordListSkeleton,
  RecordRow,
  RowPill,
  TabStrip,
} from "@/components/crm";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import {
  GHOST_PILL,
  PAGE_RHYTHM,
  READING_COL,
  SECTION_LABEL,
  SECTION_RHYTHM,
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
  const [view, setView] = useState("all");

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

  if (loading) {
    return (
      <div className={cn(PAGE_RHYTHM, "pb-12")}>
        <div className={cn(READING_COL, PAGE_RHYTHM)}>
          <CrmPageHeader
            section="Account."
            title="Notifications"
            subtitle="Loading your latest updates…"
          />
          <RecordListSkeleton rows={5} />
        </div>
      </div>
    );
  }

  const visible =
    view === "unread" ? notifications.filter((n) => !n.read) : notifications;

  // Group by date
  const grouped = visible.reduce<Record<string, Notification[]>>((acc, n) => {
    const group = getDateGroup(n.createdAt);
    if (!acc[group]) acc[group] = [];
    acc[group].push(n);
    return acc;
  }, {});

  return (
    <div className={cn(PAGE_RHYTHM, "pb-12")}>
      <div className={cn(READING_COL, PAGE_RHYTHM)}>
        <CrmPageHeader
          section="Account."
          title="Notifications"
          subtitle={
            unreadCount > 0
              ? `${unreadCount} unread update${unreadCount > 1 ? "s" : ""} waiting on you.`
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
          <EmptyState
            className="border-t border-border/60"
            title="You’re all caught up"
            description="Project updates, messages, and payment confirmations will show up here."
          />
        ) : (
          <>
            <TabStrip
              tabs={[
                { key: "all", label: "All", count: notifications.length },
                { key: "unread", label: "Unread", count: unreadCount },
              ]}
              active={view}
              onChange={setView}
              ariaLabel="Notification view"
            />

            {visible.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nothing unread — you&rsquo;re all caught up.
              </p>
            ) : (
              <div className={PAGE_RHYTHM}>
                {Object.entries(grouped).map(([date, items]) => (
                  <section key={date} className={SECTION_RHYTHM}>
                    <p className={SECTION_LABEL}>{date}</p>
                    <RecordList className="border-t border-border/60">
                      {items.map((notification, i) => (
                        <RecordRow
                          key={notification.id}
                          index={i}
                          href={notification.actionUrl || undefined}
                          primary={
                            <span
                              className={
                                notification.read ? "font-normal" : undefined
                              }
                            >
                              {notification.title}
                            </span>
                          }
                          status={
                            !notification.read ? (
                              <RowPill emphasis>New</RowPill>
                            ) : undefined
                          }
                          secondary={notification.body || undefined}
                          meta={
                            <span className="text-xs tabular-nums text-muted-foreground">
                              {formatRelativeTime(notification.createdAt)}
                            </span>
                          }
                        />
                      ))}
                    </RecordList>
                  </section>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
