"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type MyTask = {
  id: string;
  title: string;
  status: string;
  projectId: string;
  projectName: string;
};

const order = ["todo", "in_progress", "done"] as const;
const label: Record<string, string> = { todo: "To do", in_progress: "In progress", done: "Done" };
const cls: Record<string, string> = {
  todo: "border-border/60 bg-background/40 text-muted-foreground",
  in_progress: "border-orange/30 bg-orange/10 text-orange",
  done: "border-success/30 bg-success/10 text-success",
};

export function MyTasks({ tasks }: { tasks: MyTask[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function advance(t: MyTask) {
    const next = order[(order.indexOf(t.status as (typeof order)[number]) + 1) % order.length];
    setBusy(t.id);
    try {
      await fetch(`/api/admin/tasks/${t.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  if (tasks.length === 0) {
    return (
      <div className="rounded-3xl border border-border/60 bg-card/60 p-10 text-center backdrop-blur-xl">
        <p className="font-brand text-lg">No tasks assigned</p>
        <p className="mt-1 text-sm text-muted-foreground">Work assigned to you will show up here.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-border/60 bg-card/60 backdrop-blur-xl">
      {tasks.map((t) => (
        <div
          key={t.id}
          className="flex items-center justify-between gap-3 border-b border-border/40 px-5 py-4 last:border-0"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{t.title}</p>
            <Link href={`/admin/projects/${t.projectId}`} className="text-xs text-muted-foreground hover:text-orange">
              {t.projectName}
            </Link>
          </div>
          <button
            onClick={() => advance(t)}
            disabled={busy === t.id}
            className={cn("shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium disabled:opacity-50", cls[t.status])}
            title="Advance status"
          >
            {label[t.status] ?? t.status}
          </button>
        </div>
      ))}
    </div>
  );
}
