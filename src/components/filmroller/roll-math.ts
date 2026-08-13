/**
 * The film roller's math — ported from karthi-98/filmroller (`src/math/
 * rollMath.js`, MIT-less repo, vendored with the rest of the engine; see
 * `create-film-roller.ts` for what the port keeps and drops).
 *
 * Pure functions, no three.js, no DOM. Signed cumulative path distance is the
 * engine's source of truth — rotation, the contact frame, and every imprint
 * boundary derive from it — and these are the derivations. `roll-math.test.ts`
 * carries the upstream test suite for the parts that run here.
 *
 * Only what the runtime calls survived the port. Upstream also shipped
 * `crossedPortraitCenters`, `stampForOrdinal` and `orientedRectanglesOverlap`,
 * which its verify harness used and its runtime did not; vendoring dead
 * exports is how a file stops being trustworthy.
 */

const EPSILON = 1e-9;

/** True mathematical modulo — the result carries the divisor's sign. */
export function mod(value: number, divisor: number): number {
  return ((value % divisor) + divisor) % divisor;
}

/** Framerate-independent exponential approach (Freya Holmér's damp). */
export function damp(
  current: number,
  target: number,
  lambda: number,
  deltaTime: number,
): number {
  if (deltaTime <= 0) return current;
  return target + (current - target) * Math.exp(-lambda * deltaTime);
}

/** Signed shortest way round the circle from one angle to another. */
export function shortestAngleDelta(fromAngle: number, toAngle: number): number {
  return mod(toAngle - fromAngle + Math.PI, Math.PI * 2) - Math.PI;
}

/** `damp`, but through the shortest arc rather than across the branch cut. */
export function dampAngle(
  current: number,
  target: number,
  lambda: number,
  deltaTime: number,
): number {
  if (deltaTime <= 0) return current;
  const delta = shortestAngleDelta(current, target);
  return current + delta * (1 - Math.exp(-lambda * deltaTime));
}

/** Which frame ordinal is in ground contact at this path distance. */
export function contactOrdinalAtDistance(distance: number, pitch: number): number {
  return Math.round(distance / pitch);
}

/** Frame index (0..count-1) for an ordinal, correct for negative travel. */
export function frameIndexForOrdinal(
  ordinal: number,
  frameCount: number,
  offset = 0,
): number {
  return mod(ordinal + offset, frameCount);
}

export type TravelChunk = {
  ordinal: number;
  direction: number;
  fromDistance: number;
  toDistance: number;
  fromPhase: number;
  toPhase: number;
};

/**
 * Split a stretch of travel at every frame boundary it crosses, with the
 * phase (0..1 through one frame's pitch) continuous across the cut. This is
 * what lets a half-rolled frame be exactly half revealed on the floor.
 */
export function splitImprintTravel(
  fromDistance: number,
  toDistance: number,
  pitch: number,
): TravelChunk[] {
  const delta = toDistance - fromDistance;
  if (Math.abs(delta) <= EPSILON) return [];

  const direction = Math.sign(delta);
  const chunks: TravelChunk[] = [];
  let cursor = fromDistance;
  let guard = 0;

  while (
    (direction > 0 ? cursor < toDistance - EPSILON : cursor > toDistance + EPSILON) &&
    guard < 10000
  ) {
    const normalized = cursor / pitch;
    const rawOrdinal =
      direction > 0
        ? Math.floor(normalized + 0.5 + EPSILON)
        : Math.ceil(normalized - 0.5 - EPSILON);
    const ordinal = rawOrdinal === 0 ? 0 : rawOrdinal;
    const edge = (ordinal + direction * 0.5) * pitch;
    const chunkEnd =
      direction > 0 ? Math.min(toDistance, edge) : Math.max(toDistance, edge);

    chunks.push({
      ordinal,
      direction,
      fromDistance: cursor,
      toDistance: chunkEnd,
      fromPhase: cursor / pitch - ordinal + 0.5,
      toPhase: chunkEnd / pitch - ordinal + 0.5,
    });

    cursor = chunkEnd;
    guard += 1;
  }

  return chunks;
}

/** No-slip rolling: how far the drum has turned after this much travel. */
export function rotationForDistance(distance: number, radius: number): number {
  return -distance / radius;
}

export function easeOutCubic(t: number): number {
  const clamped = Math.min(1, Math.max(0, t));
  return 1 - (1 - clamped) ** 3;
}
