import "server-only";

/**
 * Minimal, hardened client for the Tavily research API.
 *
 * Tavily is the research layer behind the Brief agent: it lets the interviewer
 * read a prospect's existing site, study competitors, and pull market context
 * to brainstorm a stronger build. We talk to the REST API directly (Bearer
 * auth) — no extra dependency — with bounded timeouts, capped result sizes
 * (token-cost control), and errors that degrade gracefully into a message the
 * model can reason about rather than crashing the run.
 *
 * Docs: https://docs.tavily.com
 */

const TAVILY_BASE = "https://api.tavily.com";
const DEFAULT_TIMEOUT_MS = 20_000;

// Caps to keep tool output (and therefore token spend) predictable.
const MAX_SEARCH_RESULTS = 6;
const MAX_SNIPPET_CHARS = 400;
const MAX_EXTRACT_CHARS = 6_000;

export interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
}

export interface TavilySearchResponse {
  answer?: string;
  results: TavilySearchResult[];
}

export interface TavilyExtractResult {
  url: string;
  content: string;
}

function getKey(): string | undefined {
  const key = process.env.TAVILY_API_KEY?.trim();
  return key || undefined;
}

/** Whether research tools should be exposed to the agent at all. */
export function hasTavily(): boolean {
  return Boolean(getKey());
}

async function callTavily<T>(
  path: string,
  body: Record<string, unknown>,
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<T> {
  const key = getKey();
  if (!key) throw new Error("TAVILY_API_KEY is not set.");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${TAVILY_BASE}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`Tavily ${path} returned ${res.status}: ${detail.slice(0, 200)}`);
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

function truncate(text: string | undefined | null, max: number): string {
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

/**
 * Run a research-grade web search. Returns a synthesized answer plus the top
 * ranked sources, each with a short snippet.
 */
export async function tavilySearch(opts: {
  query: string;
  topic?: "general" | "news";
  maxResults?: number;
  includeDomains?: string[];
}): Promise<TavilySearchResponse> {
  const raw = await callTavily<{
    answer?: string;
    results?: Array<{ title?: string; url?: string; content?: string; score?: number }>;
  }>("/search", {
    query: opts.query,
    topic: opts.topic ?? "general",
    search_depth: "advanced",
    include_answer: "advanced",
    max_results: Math.min(opts.maxResults ?? MAX_SEARCH_RESULTS, MAX_SEARCH_RESULTS),
    ...(opts.includeDomains?.length ? { include_domains: opts.includeDomains } : {}),
  });

  return {
    answer: raw.answer,
    results: (raw.results ?? []).map((r) => ({
      title: r.title ?? "Untitled",
      url: r.url ?? "",
      content: truncate(r.content, MAX_SNIPPET_CHARS),
      score: r.score ?? 0,
    })),
  };
}

/**
 * Deep-read one or more URLs (e.g. a prospect's existing website) and return
 * their main text content.
 */
export async function tavilyExtract(urls: string[]): Promise<TavilyExtractResult[]> {
  const raw = await callTavily<{
    results?: Array<{ url?: string; raw_content?: string }>;
  }>("/extract", {
    urls: urls.slice(0, 5),
    extract_depth: "advanced",
  });

  return (raw.results ?? []).map((r) => ({
    url: r.url ?? "",
    content: truncate(r.raw_content, MAX_EXTRACT_CHARS),
  }));
}
