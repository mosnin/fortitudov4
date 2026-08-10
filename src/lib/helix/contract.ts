/**
 * The gatekeeper contract.
 *
 * A gatekeeper is the only way Helix touches anything. It exposes named ops;
 * every op declares the resource kind it works on, and every *write* op must
 * supply both a `simulate` and an `execute`. That pairing is what makes
 * deferred approval possible, so it is enforced by the type system rather than
 * by review: an op missing either half cannot be registered.
 *
 * See plans/helix-os.md for why this shape, and design.md for how it renders.
 */

import type { z } from 'zod';
import type {
  helixResourceKindEnum,
  helixActionRiskEnum,
} from '@/db/schema';

export type HelixResourceKind =
  (typeof helixResourceKindEnum.enumValues)[number];
export type HelixRisk = (typeof helixActionRiskEnum.enumValues)[number];
export type HelixScope = 'agency' | 'client';

/** A resource as it appears in an introduction picker or an action card. */
export interface ResourceRef {
  kind: HelixResourceKind;
  id: string;
  label: string;
  /** One line of context under the label — never a duplicate of it. */
  detail?: string;
}

/**
 * An action that has been simulated but not executed. Reads inside the same
 * thread are served through these so the agent sees a world consistent with
 * what it believes it already did.
 */
export interface OverlayEntry {
  id: string;
  gatekeeper: string;
  op: string;
  resourceKind: HelixResourceKind;
  resourceId: string | null;
  input: Record<string, unknown>;
  simulatedResult: unknown;
  sequence: number;
}

export interface HelixContext {
  threadId: string;
  /** The human the thread is accountable to. Helix never acts as anyone else. */
  userId: string;
  scope: HelixScope;
  /** Set on client-scoped threads — the hard ceiling on every introduction. */
  clientId: string | null;
  /**
   * Everything this thread has been introduced to. A collection read is
   * filtered to these; a resource read must name one of them. Empty is the
   * normal starting state, not an error.
   */
  introduced: GrantedRef[];
  /**
   * Access this thread asked for and was refused. Surfaced to the agent so it
   * stops asking — a refusal nobody records is a question repeated forever.
   */
  denied: { kind: HelixResourceKind; label: string }[];
  /** Simulated-but-unexecuted actions in this thread, in proposal order. */
  overlay: OverlayEntry[];
}

export interface GrantedRef extends ResourceRef {
  allowWrites: boolean;
}

/** Field-level before/after, rendered on the approval card. */
export interface ActionPreview {
  /** Rows of `label` / `before` / `after`. `before` omitted for creations. */
  changes: { label: string; before?: string; after: string }[];
  /** Anything the reviewer should weigh that isn't a field change. */
  note?: string;
}

interface OpBase<I> {
  name: string;
  /** Written for the agent, not the user — this is what it reads to choose. */
  description: string;
  input: z.ZodType<I>;
  resourceKind: HelixResourceKind;
  /**
   * Which introduction authorises this op, and the input field naming it.
   *
   * Defaults to the op's own kind (`{ kind: resourceKind, field: '<kind>Id' }`).
   * Set it when the thing being touched is not the thing that was introduced:
   * creating a task is authorised by the *client* it hangs off, since the task
   * does not exist yet and so could never have been introduced.
   */
  guard?: { kind: HelixResourceKind; field: string };
}

/** The introduction a given op requires, with the default filled in. */
export function guardOf(op: {
  resourceKind: HelixResourceKind;
  guard?: { kind: HelixResourceKind; field: string };
}): { kind: HelixResourceKind; field: string } {
  return op.guard ?? { kind: op.resourceKind, field: `${op.resourceKind}Id` };
}

/**
 * Reads run immediately and are never queued. `scopeMode` decides how access is
 * checked: `resource` ops name one resource and require it to be introduced;
 * `collection` ops list across a kind and are filtered down to whatever the
 * thread has been introduced to.
 */
export interface ReadOp<I = unknown, O = unknown> extends OpBase<I> {
  kind: 'read';
  scopeMode: 'resource' | 'collection';
  run(input: I, ctx: HelixContext): Promise<O>;
}

/** What a write does to the world, so the overlay can replay it over reads. */
export type WriteEffect = 'create' | 'update' | 'delete';

/**
 * Writes never touch the database on first call. `simulate` returns what the
 * real call would have returned; `execute` runs only after a human approves.
 *
 * Both halves resolve to the affected record (a delete may return just its
 * id). The runtime folds that record into the thread's overlay according to
 * `effect`, which is how a read issued after a simulated write still sees the
 * change the agent thinks it made.
 */
export interface WriteOp<I = unknown, O extends { id: string } = { id: string }>
  extends OpBase<I> {
  kind: 'write';
  risk: HelixRisk;
  effect: WriteEffect;
  /** One sentence in plain English — the line the approval card leads with. */
  describe(input: I, ctx: HelixContext): Promise<string>;
  preview(input: I, ctx: HelixContext): Promise<ActionPreview>;
  /** Must not mutate anything. */
  simulate(input: I, ctx: HelixContext): Promise<O>;
  execute(input: I, ctx: HelixContext): Promise<O>;
}

// `never` on the input side keeps the union assignable from any concrete op
// while still forcing callers through `parseOpInput` rather than raw access.
export type AnyReadOp = ReadOp<never, unknown>;
export type AnyWriteOp = WriteOp<never, { id: string }>;
export type AnyOp = AnyReadOp | AnyWriteOp;

export interface Gatekeeper {
  name: string;
  resourceKind: HelixResourceKind;
  /** Shown on the introductions rail. */
  label: string;
  description: string;
  ops: Record<string, AnyOp>;
  /** Turn an id into a label so a grant reads correctly in the audit trail. */
  resolve(id: string, ctx: HelixContext): Promise<ResourceRef | null>;
  /** Candidates the current user is allowed to introduce. */
  search(query: string, ctx: HelixContext): Promise<ResourceRef[]>;
}

/**
 * Definition helpers. These exist for inference — written as plain object
 * literals, `input`'s Zod type would not flow into `run`/`simulate`.
 */
export function readOp<I, O>(op: Omit<ReadOp<I, O>, 'kind'>): ReadOp<I, O> {
  return { ...op, kind: 'read' };
}

export function writeOp<I, O extends { id: string }>(
  op: Omit<WriteOp<I, O>, 'kind'>
): WriteOp<I, O> {
  return { ...op, kind: 'write' };
}

export function defineGatekeeper(gk: Gatekeeper): Gatekeeper {
  for (const [name, op] of Object.entries(gk.ops)) {
    if (op.name !== name) {
      throw new Error(
        `Gatekeeper "${gk.name}" registers op "${name}" whose own name is "${op.name}".`
      );
    }
  }
  return gk;
}

/** Raised when Helix reaches for something it was never introduced to. */
export class NotIntroducedError extends Error {
  constructor(
    readonly resourceKind: HelixResourceKind,
    readonly resourceId: string,
    readonly reason: string
  ) {
    super(
      `Not introduced to ${resourceKind} ${resourceId}. ${reason}`
    );
    this.name = 'NotIntroducedError';
  }
}

/** Raised when a grant exists but is read-only and a write was attempted. */
export class ReadOnlyGrantError extends Error {
  constructor(readonly resourceKind: HelixResourceKind) {
    super(
      `This thread has read-only access to that ${resourceKind}. Ask for write access to make changes.`
    );
    this.name = 'ReadOnlyGrantError';
  }
}
