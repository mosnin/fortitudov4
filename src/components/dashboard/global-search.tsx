"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";
import { RecordList, RecordRow, RowPill } from "@/components/crm";
import { POPOVER_SURFACE } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { SECTION_LABEL } from "@/lib/typography";

interface SearchResult {
  id: string;
  type: "project" | "message" | "file";
  title: string;
  subtitle: string;
  href: string;
}

const typeLabels: Record<SearchResult["type"], string> = {
  project: "Projects",
  message: "Messages",
  file: "Files",
};

function groupByType(results: SearchResult[]) {
  const groups: Partial<Record<SearchResult["type"], SearchResult[]>> = {};
  for (const r of results) {
    if (!groups[r.type]) groups[r.type] = [];
    groups[r.type]!.push(r);
  }
  return groups;
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  const fetchResults = useCallback(async (searchQuery: string) => {
    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (searchQuery.trim().length < 2) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery.trim())}`,
        { signal: controller.signal }
      );

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Search failed (${res.status})`);
      }

      const data: SearchResult[] = await res.json();
      setResults(data);
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return; // Request was cancelled, ignore
      }
      setError(err instanceof Error ? err.message : "Something went wrong");
      setResults([]);
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    if (query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(() => {
      fetchResults(query);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, fetchResults]);

  /**
   * Escape closes. ⌘K does NOT open this.
   *
   * It used to. So does CommandPalette — one on `document`, this one on
   * `window`, both calling preventDefault and toggling — so a single ⌘K opened
   * BOTH the palette and this modal, stacked, on every admin and client page.
   *
   * The palette owns the shortcut because it is the superset: it jumps to any
   * page the visitor may reach and, for staff, searches the CRM through the
   * same box. This one is still one click away in the topbar, which is how it
   * was always reachable for anyone who did not know the shortcut existed.
   */
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    } else {
      setQuery("");
      setResults([]);
      setError(null);
      setLoading(false);
      // Cancel any pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    }
  }, [open]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const grouped = groupByType(results);
  const hasResults = results.length > 0;
  const showNoResults = query.trim().length >= 2 && !loading && !error && !hasResults;

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex h-9 cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 text-sm text-muted-foreground transition-colors hover:bg-foreground/[0.04] hover:text-foreground"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Search...</span>
        <kbd className="hidden sm:inline-flex h-5 items-center rounded-sm border border-border bg-muted px-1.5 text-[10px] text-muted-foreground">
          ⌘K
        </kbd>
      </button>

      {/* Modal overlay */}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
          {/* Black, not a theme token: a scrim has to darken the page under
              both themes, and every semantic surface inverts. One opacity
              everywhere it appears. */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div
            ref={containerRef}
            className={cn(
              POPOVER_SURFACE,
              "relative mx-4 w-full max-w-lg overflow-hidden animate-fade-in"
            )}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 border-b border-border px-4">
              {loading ? (
                <Loader2 className="h-4 w-4 text-muted-foreground shrink-0 animate-spin" />
              ) : (
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
              <input
                ref={inputRef}
                type="text"
                placeholder="Search projects, messages, files..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent py-3.5 text-sm outline-none placeholder:text-muted-foreground"
              />
              {query && (
                <button onClick={() => setQuery("")} className="cursor-pointer">
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>

            {/* Results */}
            <div className="max-h-72 overflow-y-auto">
              {/* Error state */}
              {error && (
                <div className="p-6 text-center text-sm text-destructive">
                  <p>{error}</p>
                </div>
              )}

              {/* No results */}
              {showNoResults && (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  No results found for &ldquo;{query}&rdquo;
                </div>
              )}

              {/* Grouped results */}
              {hasResults && !error && (
                <>
                  {(["project", "message", "file"] as const).map((type) => {
                    const items = grouped[type];
                    if (!items || items.length === 0) return null;
                    return (
                      <div key={type} className="px-4">
                        <p className={cn(SECTION_LABEL, "pt-3 pb-1")}>
                          {typeLabels[type]}
                        </p>
                        {/* The kit's rows, not a copy of them — a result here
                            and a record on the page behind it are the same
                            object. */}
                        <RecordList>
                          {items.map((result, i) => (
                            <RecordRow
                              key={result.id}
                              index={i}
                              primary={result.title}
                              status={<RowPill>{result.type}</RowPill>}
                              secondary={result.subtitle}
                              onClick={() => {
                                setOpen(false);
                                router.push(result.href);
                              }}
                            />
                          ))}
                        </RecordList>
                      </div>
                    );
                  })}
                </>
              )}

              {/* Empty state */}
              {!query.trim() && !error && (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  Type to search across projects, messages, and files
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-border px-4 py-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                <kbd className="rounded-sm border border-border px-1">↑↓</kbd> Navigate
              </span>
              <span>
                <kbd className="rounded-sm border border-border px-1">Esc</kbd> Close
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
