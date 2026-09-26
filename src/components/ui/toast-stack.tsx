"use client";

/**
 * Toasts — a stacked, swipe-to-dismiss toast queue with in-place status morphs.
 *
 * Adapted from Spectrum UI's toast-stack (beui.dev animated toast stack):
 * - Wrapped as <ToastProvider> + useToast(), mounted once in the AppShell, so
 *   any client component can call `toast({...})` without owning a stack.
 * - The status mark is a bare coloured icon, not an icon in a tinted circle
 *   (AGENTS.md: no icon-in-tinted-box badges).
 * - `update(id, patch)` morphs a toast in place — the loading → success
 *   pattern: one toast that changes, not two that stack.
 *
 * @example
 * const toast = useToast();
 * const id = toast({ title: "Saving…", status: "loading", duration: 0 });
 * toast.update(id, { title: "Saved", status: "success", duration: 3000 });
 */

import { AlertCircle, Check, Info, LoaderCircle, X, type LucideIcon } from "lucide-react";
import { AnimatePresence, motion, type Transition } from "motion/react";
import { useReducedMotionSafe } from "@/hooks/use-reduced-motion-safe";
import {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { easeOutExpo } from "@/lib/motion";
import { cn } from "@/lib/utils";

export type ToastStatus = "neutral" | "info" | "loading" | "success" | "error";

export interface ToastItem {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  status?: ToastStatus;
  action?: { label: ReactNode; onClick: () => void };
  /** ms; 0 keeps it until dismissed or updated. */
  duration?: number;
  createdAt: number;
}

export type ToastInput = Omit<ToastItem, "id" | "createdAt"> & { id?: string };

type ToastFn = ((input: ToastInput) => string) & {
  update: (id: string, patch: Partial<ToastInput>) => void;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastFn | null>(null);

/** Outside a provider, toasts no-op rather than throw. */
const NOOP: ToastFn = Object.assign(() => "", {
  update: () => {},
  dismiss: () => {},
});

/** Call `toast({...})`. */
export function useToast(): ToastFn {
  return useContext(ToastContext) ?? NOOP;
}

const DEFAULT_DURATION = 4200;
const MAX_VISIBLE = 4;
let seed = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef(new Map<string, { timer: number; sig: string }>());

  const dismiss = useCallback((id: string) => {
    setToasts((cur) => cur.filter((t) => t.id !== id));
  }, []);

  const api = useMemo(() => {
    const show = (input: ToastInput) => {
      const id = input.id ?? `toast-${Date.now()}-${seed++}`;
      const item: ToastItem = { duration: DEFAULT_DURATION, ...input, id, createdAt: Date.now() };
      setToasts((cur) => [...cur.filter((t) => t.id !== id), item].slice(-8));
      return id;
    };
    const update = (id: string, patch: Partial<ToastInput>) =>
      setToasts((cur) =>
        cur.map((t) =>
          t.id === id
            ? { ...t, ...patch, id, createdAt: patch.duration === undefined ? t.createdAt : Date.now() }
            : t
        )
      );
    return Object.assign(show, { update, dismiss }) as ToastFn;
  }, [dismiss]);

  // One timer per toast, restarted when its duration is reset by an update.
  useEffect(() => {
    const map = timers.current;
    const live = new Set(toasts.map((t) => t.id));
    map.forEach((entry, id) => {
      if (!live.has(id)) {
        window.clearTimeout(entry.timer);
        map.delete(id);
      }
    });
    for (const t of toasts) {
      const duration = t.duration ?? DEFAULT_DURATION;
      const existing = map.get(t.id);
      if (duration <= 0) {
        if (existing) window.clearTimeout(existing.timer);
        map.delete(t.id);
        continue;
      }
      const sig = `${t.createdAt}:${duration}`;
      if (existing?.sig === sig) continue;
      if (existing) window.clearTimeout(existing.timer);
      const remaining = Math.max(duration - (Date.now() - t.createdAt), 0);
      const timer = window.setTimeout(() => {
        map.delete(t.id);
        dismiss(t.id);
      }, remaining);
      map.set(t.id, { timer, sig });
    }
  }, [toasts, dismiss]);

  useEffect(() => {
    const map = timers.current;
    return () => map.forEach((e) => window.clearTimeout(e.timer));
  }, []);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

const STACK_SPRING: Transition = { type: "spring", stiffness: 420, damping: 34, mass: 0.75 };
const CONTENT = { duration: 0.28, ease: easeOutExpo } as const;

const ICON: Record<ToastStatus, LucideIcon | null> = {
  neutral: null,
  info: Info,
  loading: LoaderCircle,
  success: Check,
  error: AlertCircle,
};

const ICON_TONE: Record<ToastStatus, string> = {
  neutral: "",
  info: "text-muted-foreground",
  loading: "text-brand",
  success: "text-green-600 dark:text-green-400",
  error: "text-red-600 dark:text-red-400",
};

function ToastStack({ toasts, onDismiss }: { toasts: ToastItem[]; onDismiss: (id: string) => void }) {
  const [target, setTarget] = useState<Element | null>(null);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- portal target exists only after mount
  useEffect(() => setTarget(document.body), []);
  if (!target) return null;

  return createPortal(
    <ol
      aria-live="polite"
      className="pointer-events-none fixed right-4 bottom-24 z-[90] flex w-[calc(100vw-2rem)] max-w-sm flex-col-reverse gap-2 lg:bottom-6"
    >
      <AnimatePresence initial={false} mode="popLayout">
        {toasts.slice(-MAX_VISIBLE).map((t, i) => (
          <Toast key={t.id} toast={t} index={i} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </ol>,
    target
  );
}

const Toast = memo(function Toast({
  toast,
  index,
  onDismiss,
}: {
  toast: ToastItem;
  index: number;
  onDismiss: (id: string) => void;
}) {
  const reduce = useReducedMotionSafe();
  const status = toast.status ?? "neutral";
  const Icon = ICON[status];

  return (
    <motion.li
      layout
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 22, scale: 0.96, filter: "blur(10px)" }}
      animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      exit={
        reduce
          ? { opacity: 0 }
          : { opacity: 0, x: 32, scale: 0.96, filter: "blur(8px)", transition: { duration: 0.18, ease: easeOutExpo } }
      }
      transition={STACK_SPRING}
      drag={reduce ? false : "x"}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.18}
      onDragEnd={(_, info) => {
        if (Math.abs(info.offset.x) > 72 || Math.abs(info.velocity.x) > 520) onDismiss(toast.id);
      }}
      className="pointer-events-auto relative will-change-transform"
      style={{ zIndex: 20 - index }}
    >
      <div className="relative flex items-start gap-3 overflow-hidden rounded-xl border border-border bg-card/95 p-3 pl-4 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        {Icon && (
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={status}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.9 }}
              transition={CONTENT}
              className={cn("mt-0.5 inline-flex shrink-0", ICON_TONE[status])}
            >
              <Icon className={cn("h-4 w-4", status === "loading" && "animate-spin")} />
            </motion.span>
          </AnimatePresence>
        )}

        <div className="min-w-0 flex-1">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={`${status}-${String(toast.title)}`}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8, filter: "blur(6px)" }}
              transition={CONTENT}
            >
              <p className="truncate text-sm leading-5 font-medium text-foreground">{toast.title}</p>
              {toast.description && (
                <p className="mt-0.5 line-clamp-2 text-xs leading-4 text-muted-foreground">
                  {toast.description}
                </p>
              )}
            </motion.div>
          </AnimatePresence>
          {toast.action && (
            <button
              type="button"
              onClick={() => {
                toast.action?.onClick();
                onDismiss(toast.id);
              }}
              className="mt-2 inline-flex h-7 items-center rounded-full border border-border px-3 text-xs font-medium text-foreground transition-colors hover:bg-foreground/[0.05]"
            >
              {toast.action.label}
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          aria-label="Dismiss"
          className="-mt-0.5 -mr-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/[0.05] hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.li>
  );
});
