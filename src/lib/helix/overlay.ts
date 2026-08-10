/**
 * The simulated overlay.
 *
 * This is what lets a thread continue past a write nobody has approved yet.
 * When Helix calls a write op, the gatekeeper simulates it and the result is
 * recorded rather than committed. Every subsequent read in the same thread is
 * passed through this module, which replays those pending results over the
 * real rows — so the agent sees a world consistent with what it believes it
 * already did, and never has to stop and wait.
 *
 * Approving an action drops it from the overlay and commits it for real.
 * Rejecting one drops it and the change simply never happened.
 */

import type { HelixContext, HelixResourceKind, OverlayEntry } from './contract';

/** The three shapes a pending write can take, derived from the op's `effect`. */
type Effect = 'create' | 'update' | 'delete';

function effectOf(entry: OverlayEntry): Effect {
  const result = entry.simulatedResult as { __effect?: Effect } | null;
  return result?.__effect ?? 'update';
}

function recordOf(entry: OverlayEntry): Record<string, unknown> {
  return (entry.simulatedResult ?? {}) as Record<string, unknown>;
}

/**
 * Replay this thread's pending writes over a set of freshly-read rows.
 *
 * Entries apply in proposal order, so two edits to the same record compose the
 * way the agent intended. Creations are appended; deletions drop the row.
 */
export function applyOverlay<T extends { id: string }>(
  rows: T[],
  ctx: HelixContext,
  kind: HelixResourceKind
): T[] {
  const entries = ctx.overlay
    .filter((e) => e.resourceKind === kind)
    .sort((a, b) => a.sequence - b.sequence);
  if (entries.length === 0) return rows;

  const byId = new Map(rows.map((row) => [row.id, { ...row }]));
  // Preserves the source ordering of real rows; simulated creations land after
  // them, which is also the order the reviewer sees them queued.
  const created: string[] = [];

  for (const entry of entries) {
    const effect = effectOf(entry);
    const record = recordOf(entry);
    const id = (record.id as string | undefined) ?? entry.resourceId;
    if (!id) continue;

    if (effect === 'delete') {
      byId.delete(id);
      continue;
    }
    const existing = byId.get(id);
    if (existing) {
      byId.set(id, { ...existing, ...stripMeta(record) });
    } else if (effect === 'create') {
      byId.set(id, stripMeta(record) as T);
      created.push(id);
    }
    // An update against a row this read didn't return is intentionally
    // dropped: the read's own filter (a stage, a date range) is the authority
    // on membership, not the overlay.
  }

  const ordered: T[] = [];
  for (const row of rows) {
    const current = byId.get(row.id);
    if (current) ordered.push(current);
  }
  for (const id of created) {
    const row = byId.get(id);
    if (row) ordered.push(row);
  }
  return ordered;
}

/** Single-record variant. Returns null if a pending delete removed it. */
export function applyOverlayToOne<T extends { id: string }>(
  row: T | null,
  ctx: HelixContext,
  kind: HelixResourceKind
): T | null {
  if (!row) return null;
  const [result] = applyOverlay([row], ctx, kind);
  return result ?? null;
}

/** Rows that exist only in the overlay — a simulated create nothing has read yet. */
export function overlayCreations<T extends { id: string }>(
  ctx: HelixContext,
  kind: HelixResourceKind
): T[] {
  return ctx.overlay
    .filter((e) => e.resourceKind === kind && effectOf(e) === 'create')
    .sort((a, b) => a.sequence - b.sequence)
    .map((e) => stripMeta(recordOf(e)) as T);
}

/**
 * Tag a simulated result with its effect. The runtime calls this so `simulate`
 * implementations stay honest about returning exactly what `execute` returns —
 * the marker is the runtime's business, not the gatekeeper's.
 */
export function markEffect<T extends { id: string }>(
  record: T,
  effect: Effect
): T {
  return { ...record, __effect: effect };
}

/** Whether a pending write in this thread already touched a given record. */
export function isPending(
  ctx: HelixContext,
  kind: HelixResourceKind,
  id: string
): boolean {
  return ctx.overlay.some(
    (e) =>
      e.resourceKind === kind &&
      ((recordOf(e).id as string | undefined) ?? e.resourceId) === id
  );
}

/** Drop the runtime's effect marker so it never reaches a caller's row shape. */
function stripMeta(record: Record<string, unknown>): Record<string, unknown> {
  const rest = { ...record };
  delete rest.__effect;
  return rest;
}
