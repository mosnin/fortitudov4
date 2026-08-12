"use client";

/**
 * The command palette.
 *
 * One keystroke to anywhere — but only to the surfaces this person already
 * has. It offers what the shell's own nav offers, plus, for staff, the Helix
 * actions and the CRM search. The gate itself is `buildPaletteCommands` in
 * `commands.ts`, kept pure so it can be tested without a browser or a database;
 * this file is the keyboard, the fetch and the list.
 *
 * Search hits the palette's own endpoint (`/api/helix/search`, staff-gated),
 * so it is requested only when the staff commands are on. A client portal that
 * asked for them would get a 403 and an empty list, which is the right answer
 * arrived at the wrong way.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { META, SECTION_LABEL } from "@/lib/typography";
import { cn } from "@/lib/utils";
import {
  buildPaletteCommands,
  type PaletteCommand,
  type PaletteDestination,
  type PaletteSearchHit,
} from "./commands";

export interface CommandPaletteProps {
  /** This surface's nav, already role-gated by its layout. */
  destinations: readonly PaletteDestination[];
  /** Staff only: Helix's "Do" actions and the agency CRM search. */
  staffCommands?: boolean;
}

export function CommandPalette({
  destinations,
  staffCommands = false,
}: CommandPaletteProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<PaletteSearchHit[]>([]);
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
        return;
      }
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setHits([]);
      setActive(0);
    }
  }, [open]);

  // Client search runs against the CRM directly rather than the thread-scoped
  // resource endpoint: the palette is for navigating, not for granting access,
  // so it must not be filtered by any thread's introductions.
  useEffect(() => {
    if (!open || !staffCommands || query.trim().length < 2) {
      setHits([]);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/helix/search?q=${encodeURIComponent(query)}`,
          { signal: controller.signal }
        );
        if (!response.ok) return;
        const data = (await response.json()) as { results: PaletteSearchHit[] };
        setHits(data.results);
      } catch {
        // An aborted keystroke is not an error worth surfacing.
      }
    }, 160);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [open, staffCommands, query]);

  const commands = useMemo(
    () => buildPaletteCommands({ destinations, staffCommands, hits, query }),
    [destinations, staffCommands, hits, query]
  );

  const run = useCallback(
    async (command: PaletteCommand) => {
      setOpen(false);
      if (command.action.kind === "navigate") {
        router.push(command.action.href);
        return;
      }
      const response = await fetch("/api/helix/threads", { method: "POST" });
      if (!response.ok) return;
      const body = await response.json();
      router.push(`/admin/helix/${body.thread.id}`);
    },
    [router]
  );

  useEffect(() => {
    setActive(0);
  }, [query, hits.length]);

  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  if (!open) return null;

  const groups = commands.reduce<Record<string, PaletteCommand[]>>((acc, command) => {
    (acc[command.group] ??= []).push(command);
    return acc;
  }, {});
  let running = -1;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-[12vh] backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      onClick={(event) => {
        if (event.target === event.currentTarget) setOpen(false);
      }}
    >
      <div className="w-full max-w-lg overflow-hidden rounded-xl border border-border/70 bg-background shadow-lg">
        <div className="relative border-b border-border/60">
          <Search
            size={14}
            className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setActive((i) => Math.min(i + 1, commands.length - 1));
              } else if (event.key === "ArrowUp") {
                event.preventDefault();
                setActive((i) => Math.max(i - 1, 0));
              } else if (event.key === "Enter") {
                event.preventDefault();
                const command = commands[active];
                if (command) void run(command);
              }
            }}
            /* Two strings, because one of them was a lie. "Search clients,
               projects…" was shown to clients, who can search neither — the
               palette only offers them their own pages. It is true for staff,
               and staffCommands is exactly the flag that says so. */
            placeholder={
              staffCommands
                ? "Search clients, projects, or jump to a page…"
                : "Jump to a page…"
            }
            className="h-12 w-full bg-transparent pr-4 pl-10 text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>

        <ul ref={listRef} className="max-h-80 overflow-y-auto p-2">
          {commands.length === 0 && (
            <li className="px-2 py-6 text-center text-xs text-muted-foreground">
              Nothing matches that.
            </li>
          )}
          {Object.entries(groups).map(([group, items]) => (
            <li key={group} className="mb-1">
              <p className={cn(SECTION_LABEL, "px-2 pt-2 pb-1")}>{group}</p>
              <ul>
                {items.map((command) => {
                  running += 1;
                  const index = running;
                  return (
                    <li key={command.id}>
                      <button
                        type="button"
                        data-index={index}
                        onMouseEnter={() => setActive(index)}
                        onClick={() => void run(command)}
                        className={cn(
                          "flex w-full items-baseline justify-between gap-3 rounded-md px-2 py-2 text-left transition-colors",
                          index === active ? "bg-muted/60" : "hover:bg-muted/30"
                        )}
                      >
                        <span className="truncate text-sm text-foreground">
                          {command.label}
                        </span>
                        {command.detail && (
                          <span className={cn(META, "shrink-0 truncate")}>
                            {command.detail}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3 border-t border-border/60 px-3 py-2">
          <span className={META}>↑↓ move</span>
          <span className={META}>↵ select</span>
          <span className={META}>esc close</span>
        </div>
      </div>
    </div>
  );
}
