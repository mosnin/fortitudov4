import "server-only";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { agencyMemory, type AgencyMemory } from "@/db/schema";

export type MemoryScope = "global" | "client" | "project";
export type MemoryKind = "preference" | "pattern" | "decision" | "fact" | "component";

export interface AddMemoryInput {
  scope: MemoryScope;
  kind: MemoryKind;
  title: string;
  content: string;
  userId?: string | null;
  projectId?: string | null;
  tags?: string[];
  createdBy?: string | null;
}

/** Persist a piece of compounding knowledge. Best-effort. */
export async function addMemory(input: AddMemoryInput): Promise<void> {
  try {
    await db.insert(agencyMemory).values({
      scope: input.scope,
      kind: input.kind,
      title: input.title,
      content: input.content,
      userId: input.userId ?? null,
      projectId: input.projectId ?? null,
      tags: input.tags ?? null,
      createdBy: input.createdBy ?? null,
    });
  } catch (err) {
    console.error("addMemory failed", err instanceof Error ? err.message : err);
  }
}

export interface SearchMemoryInput {
  query?: string;
  userId?: string | null;
  projectId?: string | null;
  /** Include global (agency-wide) memory in the results. Default true. */
  includeGlobal?: boolean;
  limit?: number;
}

/**
 * Retrieve relevant memory for the brief/concierge agents. Keyword match for
 * now (title/content ILIKE); a vector index can slot in behind this signature
 * later without changing callers.
 */
export async function searchMemory(input: SearchMemoryInput): Promise<AgencyMemory[]> {
  const { query, userId, projectId, includeGlobal = true, limit = 12 } = input;

  const scopeConds = [];
  if (projectId) scopeConds.push(eq(agencyMemory.projectId, projectId));
  if (userId) scopeConds.push(eq(agencyMemory.userId, userId));
  if (includeGlobal) scopeConds.push(eq(agencyMemory.scope, "global"));
  const scopeFilter = scopeConds.length ? or(...scopeConds) : undefined;

  const textFilter = query
    ? or(ilike(agencyMemory.title, `%${query}%`), ilike(agencyMemory.content, `%${query}%`))
    : undefined;

  const where =
    scopeFilter && textFilter ? and(scopeFilter, textFilter) : scopeFilter ?? textFilter;

  return db
    .select()
    .from(agencyMemory)
    .where(where)
    .orderBy(desc(agencyMemory.createdAt))
    .limit(limit);
}

/** Compact a memory set into a prompt-ready block for an agent's context. */
export function memoryToContext(rows: AgencyMemory[]): string {
  if (rows.length === 0) return "";
  return rows
    .map((m) => `- [${m.kind}] ${m.title}: ${m.content}`)
    .join("\n");
}
