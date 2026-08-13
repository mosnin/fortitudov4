import { describe, it, expect } from 'vitest';
import {
  contactOrdinalAtDistance,
  dampAngle,
  frameIndexForOrdinal,
  mod,
  rotationForDistance,
  splitImprintTravel,
} from './roll-math';

/**
 * The upstream suite (karthi-98/filmroller `tests/rollMath.test.mjs`), ported
 * to vitest for the functions this port actually runs. These are the
 * invariants the whole illusion rests on: phase continuous across frame
 * boundaries in both directions, the ordinal sequence correct through zero,
 * and rotation exactly proportional to travel — break any one and the drum
 * visibly skids or the floor prints tear.
 */

const pitch = 3;

describe('mod / frame indexing', () => {
  it('supports a sequence in both directions', () => {
    expect(mod(-1, 4)).toBe(3);
    expect(frameIndexForOrdinal(-2, 4)).toBe(2);
    expect(frameIndexForOrdinal(5, 4)).toBe(1);
  });

  it('rewinds the contact sequence correctly through zero', () => {
    const distances = [0, -pitch, -2 * pitch, -3 * pitch, -4 * pitch];
    const indices = distances.map((distance) =>
      frameIndexForOrdinal(contactOrdinalAtDistance(distance, pitch), 4),
    );
    expect(indices).toEqual([0, 3, 2, 1, 0]);
  });
});

describe('splitImprintTravel', () => {
  const phases = (from: number, to: number) =>
    splitImprintTravel(from, to, pitch).map((chunk) => ({
      ordinal: chunk.ordinal,
      fromPhase: chunk.fromPhase,
      toPhase: chunk.toPhase,
    }));

  it('splits forward travel at frame edges with continuous phase', () => {
    expect(phases(0, 3.25 * pitch)).toEqual([
      { ordinal: 0, fromPhase: 0.5, toPhase: 1 },
      { ordinal: 1, fromPhase: 0, toPhase: 1 },
      { ordinal: 2, fromPhase: 0, toPhase: 1 },
      { ordinal: 3, fromPhase: 0, toPhase: 0.75 },
    ]);
  });

  it('reveals frames from the opposite edge in reverse', () => {
    expect(phases(0, -1.75 * pitch)).toEqual([
      { ordinal: 0, fromPhase: 0.5, toPhase: 0 },
      { ordinal: -1, fromPhase: 1, toPhase: 0 },
      { ordinal: -2, fromPhase: 1, toPhase: 0.75 },
    ]);
  });

  it('emits nothing for zero travel', () => {
    expect(splitImprintTravel(12, 12, pitch)).toEqual([]);
  });
});

describe('rolling and steering', () => {
  it('rotation is exactly proportional to signed travel (no slip)', () => {
    expect(rotationForDistance(pitch * 4, 2)).toBeCloseTo(-pitch * 2, 12);
    expect(rotationForDistance(-pitch, 2)).toBeCloseTo(pitch / 2, 12);
  });

  it('dampAngle turns through the short way round the circle', () => {
    // From just under +π to just over −π: the short way crosses the branch
    // cut. A naive lerp would swing nearly a full turn the long way.
    const from = Math.PI - 0.1;
    const to = -Math.PI + 0.1;
    const stepped = dampAngle(from, to, 50, 1);
    expect(Math.abs(stepped)).toBeGreaterThan(Math.PI - 0.11);
    // And it converges onto the target angle, not onto target ± 2π.
    expect(Math.cos(stepped - to)).toBeCloseTo(1, 3);
  });
});
