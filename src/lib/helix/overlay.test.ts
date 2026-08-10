/**
 * The simulated overlay.
 *
 * This is the mechanism the whole product rests on: if the overlay is wrong,
 * the agent reasons about a world that does not match what a reviewer will
 * later approve. These cover the cases that would silently corrupt a thread
 * rather than throw.
 */

import { describe, expect, it } from 'vitest';
import {
  applyOverlay,
  applyOverlayToOne,
  isPending,
  markEffect,
  overlayCreations,
} from './overlay';
import type { HelixContext, OverlayEntry } from './contract';

interface Row {
  id: string;
  name: string;
  stage?: string;
}

function ctx(overlay: OverlayEntry[]): HelixContext {
  return {
    threadId: 't1',
    userId: 'u1',
    scope: 'agency',
    clientId: null,
    introduced: [],
    denied: [],
    overlay,
  };
}

function entry(
  partial: Partial<OverlayEntry> & { simulatedResult: unknown }
): OverlayEntry {
  return {
    id: 'a1',
    gatekeeper: 'clients',
    op: 'updateClient',
    resourceKind: 'client',
    resourceId: null,
    input: {},
    sequence: 0,
    ...partial,
  };
}

describe('applyOverlay', () => {
  it('leaves rows untouched when nothing is pending', () => {
    const rows: Row[] = [{ id: 'a', name: 'Acme' }];
    expect(applyOverlay(rows, ctx([]), 'client')).toEqual(rows);
  });

  it('merges a simulated update onto the real row', () => {
    const result = applyOverlay<Row>(
      [{ id: 'a', name: 'Acme', stage: 'build' }],
      ctx([
        entry({
          simulatedResult: markEffect(
            { id: 'a', name: 'Acme', stage: 'client_review' },
            'update'
          ),
        }),
      ]),
      'client'
    );
    expect(result[0].stage).toBe('client_review');
  });

  it('ignores pending writes belonging to another resource kind', () => {
    const result = applyOverlay<Row>(
      [{ id: 'a', name: 'Acme' }],
      ctx([
        entry({
          resourceKind: 'project',
          simulatedResult: markEffect({ id: 'a', name: 'Changed' }, 'update'),
        }),
      ]),
      'client'
    );
    expect(result[0].name).toBe('Acme');
  });

  it('composes two edits to the same record in proposal order', () => {
    const result = applyOverlay<Row>(
      [{ id: 'a', name: 'Acme', stage: 'design' }],
      ctx([
        entry({
          id: 'a2',
          sequence: 1,
          simulatedResult: markEffect({ id: 'a', stage: 'launched' }, 'update'),
        }),
        entry({
          id: 'a1',
          sequence: 0,
          simulatedResult: markEffect({ id: 'a', stage: 'build' }, 'update'),
        }),
      ]),
      'client'
    );
    // Sorted by sequence regardless of the order they arrive in, so the last
    // thing the agent asked for is what it sees.
    expect(result[0].stage).toBe('launched');
  });

  it('appends a simulated creation after the real rows', () => {
    const result = applyOverlay<Row>(
      [{ id: 'a', name: 'Acme' }],
      ctx([
        entry({
          simulatedResult: markEffect({ id: 'new', name: 'Pending' }, 'create'),
        }),
      ]),
      'client'
    );
    expect(result.map((row) => row.id)).toEqual(['a', 'new']);
  });

  it('removes a row a pending delete would remove', () => {
    const result = applyOverlay<Row>(
      [
        { id: 'a', name: 'Acme' },
        { id: 'b', name: 'Meridian' },
      ],
      ctx([
        entry({
          simulatedResult: markEffect({ id: 'a', name: 'Acme' }, 'delete'),
        }),
      ]),
      'client'
    );
    expect(result.map((row) => row.id)).toEqual(['b']);
  });

  it('drops an update for a row the read did not return', () => {
    // The read's own filter is the authority on membership — an overlay entry
    // must never smuggle a row past a stage or date filter.
    const result = applyOverlay<Row>(
      [{ id: 'a', name: 'Acme' }],
      ctx([
        entry({
          simulatedResult: markEffect({ id: 'zzz', name: 'Elsewhere' }, 'update'),
        }),
      ]),
      'client'
    );
    expect(result.map((row) => row.id)).toEqual(['a']);
  });

  it('never leaks the effect marker into a returned row', () => {
    const result = applyOverlay<Row>(
      [{ id: 'a', name: 'Acme' }],
      ctx([
        entry({
          simulatedResult: markEffect({ id: 'a', name: 'Changed' }, 'update'),
        }),
      ]),
      'client'
    );
    expect(result[0]).not.toHaveProperty('__effect');
  });
});

describe('applyOverlayToOne', () => {
  it('returns null for a row a pending delete removed', () => {
    const result = applyOverlayToOne<Row>(
      { id: 'a', name: 'Acme' },
      ctx([
        entry({
          simulatedResult: markEffect({ id: 'a', name: 'Acme' }, 'delete'),
        }),
      ]),
      'client'
    );
    expect(result).toBeNull();
  });

  it('passes null through untouched', () => {
    expect(applyOverlayToOne<Row>(null, ctx([]), 'client')).toBeNull();
  });
});

describe('overlayCreations', () => {
  it('returns only creations, in proposal order, without the marker', () => {
    const created = overlayCreations<Row>(
      ctx([
        entry({
          id: 'a2',
          sequence: 1,
          simulatedResult: markEffect({ id: 'second', name: 'B' }, 'create'),
        }),
        entry({
          id: 'a1',
          sequence: 0,
          simulatedResult: markEffect({ id: 'first', name: 'A' }, 'create'),
        }),
        entry({
          id: 'a3',
          sequence: 2,
          simulatedResult: markEffect({ id: 'edit', name: 'C' }, 'update'),
        }),
      ]),
      'client'
    );
    expect(created.map((row) => row.id)).toEqual(['first', 'second']);
    expect(created[0]).not.toHaveProperty('__effect');
  });
});

describe('isPending', () => {
  it('reports a record touched by a pending write', () => {
    const context = ctx([
      entry({
        simulatedResult: markEffect({ id: 'a', name: 'Acme' }, 'update'),
      }),
    ]);
    expect(isPending(context, 'client', 'a')).toBe(true);
    expect(isPending(context, 'client', 'b')).toBe(false);
    expect(isPending(context, 'project', 'a')).toBe(false);
  });
});
