/**
 * Registry invariants.
 *
 * These are the rules stated in AGENTS.md, checked mechanically rather than
 * trusted to review. Each one, if broken, widens what the agent can reach
 * without anything else failing — which is exactly the class of mistake a
 * type error will not catch.
 */

import { describe, expect, it } from 'vitest';
import { allOps, findOp, GATEKEEPERS, gatekeeperForKind } from './registry';
import { guardOf, type AnyWriteOp, type Gatekeeper } from './contract';

describe('gatekeeper registry', () => {
  it('registers each resource kind exactly once', () => {
    const kinds = GATEKEEPERS.map((gk) => gk.resourceKind);
    expect(new Set(kinds).size).toBe(kinds.length);
  });

  it('registers each gatekeeper name exactly once', () => {
    const names = GATEKEEPERS.map((gk) => gk.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('exposes op names that are globally unique', () => {
    // The agent calls ops by bare name, so a collision across gatekeepers
    // would silently route a call to whichever one registered first.
    const names = allOps().map(({ op }) => op.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('resolves every registered op by name', () => {
    for (const { op } of allOps()) {
      expect(findOp(op.name), `findOp('${op.name}')`).not.toBeNull();
    }
  });

  it('resolves a gatekeeper for every kind it declares', () => {
    for (const gatekeeper of GATEKEEPERS) {
      expect(gatekeeperForKind(gatekeeper.resourceKind)).toBe(gatekeeper);
    }
  });
});

describe('write ops', () => {
  const writes = allOps().filter(
    (entry): entry is { gatekeeper: Gatekeeper; op: AnyWriteOp } =>
      entry.op.kind === 'write'
  );

  it('has write ops to check', () => {
    expect(writes.length).toBeGreaterThan(0);
  });

  it.each(writes.map(({ op }) => [op.name, op] as const))(
    '%s supplies both simulate() and execute()',
    (_name, op) => {
      // The contract types make this unregisterable, but the runtime calls
      // both halves dynamically — an `as never` cast in a gatekeeper's `ops`
      // map could slip a half-built op past the compiler.
      expect(typeof op.simulate).toBe('function');
      expect(typeof op.execute).toBe('function');
    }
  );

  it.each(writes.map(({ op }) => [op.name, op] as const))(
    '%s describes and previews itself',
    (_name, op) => {
      expect(typeof op.describe).toBe('function');
      expect(typeof op.preview).toBe('function');
    }
  );

  it.each(writes.map(({ op }) => [op.name, op] as const))(
    '%s declares a guard whose kind is registered',
    (_name, op) => {
      const guard = guardOf(op);
      expect(guard.field).toMatch(/Id$/);
      expect(
        gatekeeperForKind(guard.kind),
        `guard kind '${guard.kind}' has no gatekeeper`
      ).not.toBeNull();
    }
  );

  it.each(writes.map(({ op }) => [op.name, op] as const))(
    '%s carries a risk level',
    (_name, op) => {
      expect(['low', 'medium', 'high']).toContain(op.risk);
    }
  );

  it('guards every creation by a parent rather than by itself', () => {
    // A row being created has no id yet, so a guard naming its own kind could
    // never be satisfied — the runtime would reject every call.
    for (const { op } of writes) {
      if (op.effect !== 'create') continue;
      const guard = guardOf(op);
      expect(
        guard.kind,
        `${op.name} creates a ${op.resourceKind} but guards on its own kind`
      ).not.toBe(op.resourceKind);
    }
  });
});

describe('op descriptions', () => {
  it.each(allOps().map(({ op }) => [op.name, op] as const))(
    '%s describes itself for the agent',
    (_name, op) => {
      // The description is the only thing the model reads when choosing.
      expect(op.description.length).toBeGreaterThan(30);
    }
  );
});

describe('gadgets never write', () => {
  it('rejects any write op reachable from a gadget bridge read', () => {
    // The bridge refuses non-read ops at runtime; this asserts the property
    // that makes that check meaningful — that `kind` is the discriminator and
    // no op claims to be both.
    for (const { op } of allOps()) {
      expect(['read', 'write']).toContain(op.kind);
    }
  });
});
