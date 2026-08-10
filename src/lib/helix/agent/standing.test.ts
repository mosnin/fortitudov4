/**
 * Thread standing.
 *
 * The line that decides whether someone reopens a thread. It is derived from
 * counts rather than written by the model, so it can be tested exactly — and
 * the ordering matters: what is blocked on a person has to come before what
 * is merely waiting.
 */

import { describe, expect, it } from 'vitest';
import { standingFor } from './standing';
import type { HelixContext } from '../contract';

function ctx(
  introduced: { kind: 'client' | 'project' | 'task'; label: string }[]
): HelixContext {
  return {
    threadId: 't1',
    userId: 'u1',
    scope: 'agency',
    clientId: null,
    introduced: introduced.map((ref) => ({
      kind: ref.kind,
      id: ref.label,
      label: ref.label,
      allowWrites: true,
    })),
    overlay: [],
  };
}

describe('standingFor', () => {
  it('says nothing is outstanding when nothing is', () => {
    expect(standingFor(ctx([]), 0, 0)).toBe('Nothing outstanding.');
  });

  it('leads with blocked access, since only a person can clear it', () => {
    const line = standingFor(ctx([{ kind: 'client', label: 'Acme' }]), 3, 1);
    expect(line.startsWith('Waiting on access')).toBe(true);
  });

  it('reports queued changes when nothing is blocked', () => {
    expect(standingFor(ctx([]), 2, 0)).toBe('2 changes queued.');
  });

  it('singularises counts', () => {
    expect(standingFor(ctx([]), 1, 0)).toBe('1 change queued.');
    expect(standingFor(ctx([]), 0, 1)).toBe('Waiting on access to 1 thing.');
  });

  it('names the single subject it is about', () => {
    expect(standingFor(ctx([{ kind: 'client', label: 'Acme' }]), 0, 0)).toBe(
      'Acme.'
    );
  });

  it('collapses several subjects rather than listing them all', () => {
    const line = standingFor(
      ctx([
        { kind: 'client', label: 'Acme' },
        { kind: 'project', label: 'Rebuild' },
        { kind: 'project', label: 'Landing' },
      ]),
      0,
      0
    );
    expect(line).toBe('Acme and 2 more.');
  });

  it('ignores resources reached through a parent', () => {
    // Tasks are introduced via their client; listing them would make the line
    // read as though they were separate grants.
    expect(
      standingFor(ctx([{ kind: 'task', label: 'Compress hero video' }]), 0, 0)
    ).toBe('Nothing outstanding.');
  });

  it('always ends in a single full stop', () => {
    for (const line of [
      standingFor(ctx([]), 0, 0),
      standingFor(ctx([{ kind: 'client', label: 'Acme' }]), 2, 1),
      standingFor(ctx([]), 5, 0),
    ]) {
      expect(line.endsWith('.')).toBe(true);
      expect(line.endsWith('..')).toBe(false);
    }
  });
});
