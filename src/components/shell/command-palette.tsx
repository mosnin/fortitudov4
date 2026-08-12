"use client";

/**
 * The command palette.
 *
 * One keystroke to anywhere. It exists because Helix added surfaces faster
 * than the sidebar can hold them, and because the fastest path to "ask Helix
 * about Acme" should not be three clicks through a nav tree.
 *
 * Two kinds of result, and the order is deliberate: what you can *do* comes
 * before what you can *open*, because someone who reached for ⌘K usually has
 * an intention rather than a destination.
 *
 * Search hits the same resource endpoint the introduction picker uses, so the
 * palette widens exactly as the gatekeeper registry does.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { META, SECTION_LABEL } from "@/lib/typography";
import { cn } from "@/lib/utils";

interface Command {
  id: string;
  label: string;
  detail?: string;
  group: string;
  run: () => void;
}

interface SearchHit {
  kind: string;
  id: string;
  label: string;
  detail?: string;
}

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
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
    if (!open || query.trim().length < 2) {
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
        const data = (await response.json()) as { results: SearchHit[] };
        setHits(data.results);
      } catch {
        // An aborted keystroke is not an error worth surfacing.
      }
    }, 160);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [open, query]);

  const go = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router]
  );

  const commands = useMemo<Command[]>(() => {
    const actions: Command[] = [
      {
        id: "new-thread",
        label: "Ask Helix something",
        detail: "Open a new thread",
        group: "Do",
        run: async () => {
          setOpen(false);
          const response = await fetch("/api/helix/threads", { method: "POST" });
          if (!response.ok) return;
          const body = await response.json();
          router.push(`/admin/helix/${body.thread.id}`);
        },
      },
      {
        id: "approvals",
        label: "Review what Helix queued",
        detail: "Approvals",
        group: "Do",
        run: () => go("/admin/helix/approvals"),
      },
    ];

    const places: Command[] = [
      { id: "p-threads", label: "Threads", group: "Open", run: () => go("/admin/helix") },
      { id: "p-gadgets", label: "Gadgets", group: "Open", run: () => go("/admin/helix/gadgets") },
      { id: "p-activity", label: "Activity", group: "Open", run: () => go("/admin/helix/activity") },
      { id: "p-clients", label: "Clients", group: "Open", run: () => go("/admin/clients") },
      { id: "p-tasks", label: "Tasks", group: "Open", run: () => go("/admin/tasks") },
      { id: "p-projects", label: "Projects", group: "Open", run: () => go("/admin/projects") },
      { id: "p-messages", label: "Messages", group: "Open", run: () => go("/admin/messages") },
    ];

    const needle = query.trim().toLowerCase();
    const matches = (command: Command) =>
      needle.length === 0 ||
      command.label.toLowerCase().includes(needle) ||
      (command.detail ?? "").toLowerCase().includes(needle);

    const found: Command[] = hits.map((hit) => ({
      id: `${hit.kind}:${hit.id}`,
      label: hit.label,
      detail: hit.detail,
      group: hit.kind === "client" ? "Clients" : "Projects",
      run: () =>
        go(
          hit.kind === "client"
            ? `/admin/clients?client=${hit.id}`
            : `/admin/projects/${hit.id}`
        ),
    }));

    return [...actions.filter(matches), ...found, ...places.filter(matches)];
  }, [query, hits, go, router]);

  useEffect(() => {
    setActive(0);
  }, [query, hits.length]);

  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  if (!open) return null;

  const groups = commands.reduce<Record<string, Command[]>>((acc, command) => {
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
                commands[active]?.run();
              }
            }}
            placeholder="Search clients, projects, or jump to a page…"
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
                        onClick={() => command.run()}
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
