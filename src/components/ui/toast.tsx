"use client";

import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

// A tiny, dependency-free toast system. Import `toast` anywhere and call
// toast.success / .error / .info; mount <Toaster /> once in the root layout.
// On aesthetic: a glyph + title, auto-dismiss, calm.

type Variant = "success" | "error" | "info";
type ToastItem = { id: number; title: string; description?: string; variant: Variant };

let items: ToastItem[] = [];
let seq = 0;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}
function dismiss(id: number) {
  items = items.filter((t) => t.id !== id);
  emit();
}
function push(variant: Variant, title: string, description?: string) {
  const id = ++seq;
  items = [...items, { id, title, description, variant }];
  emit();
  setTimeout(() => dismiss(id), variant === "error" ? 6000 : 4200);
}

export const toast = {
  success: (title: string, description?: string) => push("success", title, description),
  error: (title: string, description?: string) => push("error", title, description),
  info: (title: string, description?: string) => push("info", title, description),
};

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
const snapshot = () => items;

const glyphTone: Record<Variant, string> = {
  success: "text-success",
  error: "text-destructive",
  info: "text-orange",
};

export function Toaster() {
  const toasts = useSyncExternalStore(subscribe, snapshot, snapshot);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[200] flex w-[min(92vw,360px)] flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className="animate-fade-in pointer-events-auto flex items-start gap-3 rounded-2xl border border-border/60 bg-card/95 px-4 py-3 shadow-2xl backdrop-blur-xl"
        >
          <span className={cn("mt-0.5 font-mono text-xs", glyphTone[t.variant])} aria-hidden>
            ●
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{t.title}</p>
            {t.description && <p className="mt-0.5 text-xs text-muted-foreground">{t.description}</p>}
          </div>
          <button
            onClick={() => dismiss(t.id)}
            aria-label="Dismiss"
            className="-mr-1 shrink-0 rounded-md px-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
