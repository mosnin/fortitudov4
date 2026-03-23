"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: string;
  title: string;
  body?: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
  date: string;
}

const demoNotifications: Notification[] = [
  { id: "1", type: "phase_update", title: "Development phase started", body: "Your project 'My Web Application' has moved to the Development phase.", read: false, actionUrl: "/projects/demo", createdAt: "2 hours ago", date: "Today" },
  { id: "2", type: "message_received", title: "New message from Fortitudo Team", body: "Hey! The wireframes are ready for review.", read: false, actionUrl: "/messages", createdAt: "5 hours ago", date: "Today" },
  { id: "3", type: "file_uploaded", title: "File uploaded to your project", body: "wireframes-v2.pdf was uploaded by the team.", read: true, actionUrl: "/projects/demo", createdAt: "1 day ago", date: "Yesterday" },
  { id: "4", type: "payment_confirmed", title: "Payment confirmed", body: "Your payment of $2,500 has been processed successfully.", read: true, actionUrl: "/settings", createdAt: "3 days ago", date: "Mar 20, 2026" },
  { id: "5", type: "comment_added", title: "New comment on your project", body: "Fortitudo Team commented on the homepage design.", read: true, actionUrl: "/projects/demo", createdAt: "4 days ago", date: "Mar 19, 2026" },
  { id: "6", type: "survey_request", title: "How was your experience?", body: "Your project is nearing completion. We'd love your feedback!", read: true, actionUrl: "/projects/demo", createdAt: "5 days ago", date: "Mar 18, 2026" },
];

const typeIcons: Record<string, React.ElementType> = {
  phase_update: FolderKanban,
  message_received: MessageSquare,
  payment_confirmed: CreditCard,
  file_uploaded: Upload,
  comment_added: FileText,
  survey_request: Star,
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(demoNotifications);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Group by date
  const grouped = notifications.reduce<Record<string, Notification[]>>((acc, n) => {
    if (!acc[n.date]) acc[n.date] = [];
    acc[n.date].push(n);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
              : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <Check className="mr-1 h-4 w-4" />
            Mark all read
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {Object.entries(grouped).map(([date, items]) => (
          <div key={date}>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">{date}</h3>
            <Card>
              <CardContent className="p-0 divide-y divide-border">
                {items.map((notification) => {
                  const Icon = typeIcons[notification.type] || Bell;
                  return (
                    <Link
                      key={notification.id}
                      href={notification.actionUrl || "#"}
                      className={cn(
                        "flex gap-4 px-4 py-4 transition-colors hover:bg-muted",
                        !notification.read && "bg-orange/5"
                      )}
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange/10">
                        <Icon className="h-5 w-5 text-orange" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={cn("text-sm", !notification.read && "font-semibold")}>
                            {notification.title}
                          </p>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs text-muted-foreground">{notification.createdAt}</span>
                            {!notification.read && (
                              <span className="h-2 w-2 rounded-full bg-orange" />
                            )}
                          </div>
                        </div>
                        {notification.body && (
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {notification.body}
                          </p>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
