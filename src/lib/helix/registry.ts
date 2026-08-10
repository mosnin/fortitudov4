/**
 * The gatekeeper registry.
 *
 * Every capability Helix has is here and nowhere else. Adding a gatekeeper to
 * this list is the only way to widen what the agent can reach, which makes the
 * blast radius of the whole system reviewable in one file.
 */

import type { AnyOp, Gatekeeper, HelixResourceKind } from './contract';
import { clientsGatekeeper } from './gatekeepers/clients';
import { projectsGatekeeper } from './gatekeepers/projects';
import { tasksGatekeeper } from './gatekeepers/tasks';

export const GATEKEEPERS: Gatekeeper[] = [
  clientsGatekeeper,
  projectsGatekeeper,
  tasksGatekeeper,
];

const byName = new Map(GATEKEEPERS.map((gk) => [gk.name, gk]));
const byKind = new Map(GATEKEEPERS.map((gk) => [gk.resourceKind, gk]));

export function getGatekeeper(name: string): Gatekeeper | null {
  return byName.get(name) ?? null;
}

export function gatekeeperForKind(kind: HelixResourceKind): Gatekeeper | null {
  return byKind.get(kind) ?? null;
}

/** Locate an op by its bare name — the agent calls ops, not gatekeepers. */
export function findOp(
  opName: string
): { gatekeeper: Gatekeeper; op: AnyOp } | null {
  for (const gatekeeper of GATEKEEPERS) {
    const op = gatekeeper.ops[opName];
    if (op) return { gatekeeper, op };
  }
  return null;
}

/** Every op across every gatekeeper — the agent's tool surface. */
export function allOps(): { gatekeeper: Gatekeeper; op: AnyOp }[] {
  return GATEKEEPERS.flatMap((gatekeeper) =>
    Object.values(gatekeeper.ops).map((op) => ({ gatekeeper, op }))
  );
}

/** Kinds a human can introduce from the picker. */
export function introducibleKinds(): {
  kind: HelixResourceKind;
  label: string;
  description: string;
}[] {
  return GATEKEEPERS.map((gk) => ({
    kind: gk.resourceKind,
    label: gk.label,
    description: gk.description,
  }));
}
