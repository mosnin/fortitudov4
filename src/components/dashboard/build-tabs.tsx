"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

export type BuildTab = { id: string; label: string; badge?: number; content: React.ReactNode };

/**
 * App-like workspace for an active build: a sticky segmented nav over slotted
 * sections, so the whole build is one comprehensive surface without an endless
 * scroll. Inactive sections aren't mounted, so their live pollers stay idle.
 */
export function BuildTabs({ tabs }: { tabs: BuildTab[] }) {
  const [active, setActive] = useState(tabs[0]?.id);
  const current = tabs.find((t) => t.id === active) ?? tabs[0];

  return (
    <div>
      <div className="sticky top-3 z-20 mb-5 flex gap-1 overflow-x-auto rounded-full border border-border/60 bg-card/80 p-1 backdrop-blur-xl [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map((t) => {
          const on = t.id === active;
          return (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={cn(
                "relative shrink-0 rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-[0.15em] transition-colors",
                on ? "text-white" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {on && (
                <motion.span
                  layoutId="build-tab"
                  className="absolute inset-0 rounded-full bg-orange"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative flex items-center gap-1.5">
                {t.label}
                {t.badge ? (
                  <span
                    className={cn(
                      "flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold tabular-nums",
                      on ? "bg-white/25 text-white" : "bg-orange/15 text-orange"
                    )}
                  >
                    {t.badge}
                  </span>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current?.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          {current?.content}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
