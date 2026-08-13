/**
 * The film roller — an interactive three.js piece, vendored and ported from
 * https://github.com/karthi-98/filmroller ("Infinite Portrait Roll").
 *
 * WHAT IT IS. A drum wrapped in four film frames rolls continuously across
 * the page's own charcoal floor. The pointer steers it through the full 360°;
 * wherever it rolls it unrolls its frames onto the floor as a sprocketed film
 * strip, contact-driven — a half-rolled frame is exactly half printed. The
 * newest hundred imprints stay; the oldest fades and its meshes are reused.
 *
 * WHAT THE PORT KEEPS: the whole mechanism. Signed path distance as the
 * single source of truth (`roll-math.ts`), the arc sampler that keeps prints
 * gap-free through hard turns, the render-origin recentring that stops
 * world coordinates drifting after minutes of travel, the pooled ribbon
 * archive (`floor-history.ts`).
 *
 * WHAT THE PORT DROPS OR CHANGES:
 *  - The four WebP portraits. The frames are DELIBERATELY BLANK paper
 *    (`frames.ts`) — nothing on this site is invented, least of all client
 *    work. The loader UI went with them; nothing loads.
 *  - Full-window capture. This is a section on a page that scrolls, so wheel
 *    zoom and the speed/steer keys only engage once the canvas is clicked
 *    (`input.ts` documents the model); hover-steering is always live.
 *  - The debug/verify API, the event log, Vercel analytics.
 *  - Colour: everything reads from the caller's `--fx-*` palette.
 *
 * HOUSE FACTORY CONTRACT (`page-hero.tsx` convention): no React in here.
 * Returns `null` when the machine gives no WebGL context, and the caller
 * treats that as "draw nothing" — the copy over the canvas never depends on
 * it. `still: true` (the reduced-motion path) lays a short pre-rolled arc,
 * renders one correct frame, and never schedules another; resize re-renders.
 * The loop also parks itself whenever the section leaves the viewport or the
 * tab is hidden — a drum rolling for nobody is a battery complaint.
 */

import { CONFIG, FLOOR_PITCH, ROLLER_RADIUS } from './config';
import { FRAME_COUNT, createFrameAtlas, createFrameTextures } from './frames';
import { FloorHistory } from './floor-history';
import { createInputController } from './input';
import { createRoller } from './roller';
import { createScene } from './scene';
import { createSteeringCursor } from './steering-cursor';
import type { FilmRollerPalette } from './palette';
import {
  contactOrdinalAtDistance,
  damp,
  dampAngle,
  frameIndexForOrdinal,
  rotationForDistance,
  shortestAngleDelta,
  splitImprintTravel,
} from './roll-math';

export type FilmRollerStatus = {
  /** 0-based index of the frame currently in ground contact. */
  frameIndex: number;
  frameCount: number;
  /** Current target speed in scene units per second. */
  speed: number;
  /** True while the canvas holds focus (wheel + keys captured). */
  engaged: boolean;
};

export type FilmRollerHandle = {
  destroy: () => void;
};

export function createFilmRoller({
  canvas,
  host,
  palette,
  still = false,
  onStatus = () => {},
}: {
  canvas: HTMLCanvasElement;
  /** Positioned ancestor that receives the drawn steering cursor. */
  host: HTMLElement;
  palette: FilmRollerPalette;
  /** Reduced motion: lay a pre-rolled arc, render once, take no input. */
  still?: boolean;
  onStatus?: (status: FilmRollerStatus) => void;
}): FilmRollerHandle | null {
  let sceneBundle: ReturnType<typeof createScene>;
  try {
    sceneBundle = createScene(canvas, palette);
  } catch {
    // No WebGL context on this machine. The section stays copy-on-charcoal.
    return null;
  }

  const frameTextures = createFrameTextures(sceneBundle.renderer, palette);
  const atlas = createFrameAtlas(frameTextures, sceneBundle.renderer);
  const roller = createRoller(atlas, FRAME_COUNT, palette);
  sceneBundle.scene.add(roller.root);
  const floorHistory = new FloorHistory({
    scene: sceneBundle.scene,
    textures: frameTextures,
    palette,
  });

  let pathDistance = 0;
  let heading = 0;
  let targetHeading = 0;
  let currentOrdinal = 0;
  let currentFrameIndex = 0;
  let paused = false;
  let inView = true;
  let destroyed = false;
  let animationFrame = 0;
  let lastFrameTime = performance.now();
  const worldPosition = { x: 0, z: 0 };
  const renderOrigin = { x: 0, z: 0 };

  const status: FilmRollerStatus = {
    frameIndex: 0,
    frameCount: FRAME_COUNT,
    speed: CONFIG.input.speedDefault,
    engaged: false,
  };
  const pushStatus = () => onStatus({ ...status });

  const updateContactFrame = () => {
    const nextOrdinal = contactOrdinalAtDistance(pathDistance, FLOOR_PITCH);
    const nextIndex = frameIndexForOrdinal(nextOrdinal, FRAME_COUNT);
    if (nextOrdinal === currentOrdinal && nextIndex === currentFrameIndex) return;
    currentOrdinal = nextOrdinal;
    currentFrameIndex = nextIndex;
    status.frameIndex = nextIndex;
    pushStatus();
  };

  /**
   * Constant-curvature arc between two headings over a stretch of travel —
   * the imprint is sampled along it, so a hard turn lays a curved strip with
   * no gaps rather than a chain of straight segments.
   */
  const createArcSampler = (
    startHeading: number,
    endHeading: number,
    distanceDelta: number,
  ) => {
    const headingDelta = shortestAngleDelta(startHeading, endHeading);
    const startX = worldPosition.x;
    const startZ = worldPosition.z;

    const pointAt = (fraction: number) => {
      if (Math.abs(headingDelta) < 1e-8) {
        return {
          x: startX + fraction * distanceDelta * Math.cos(startHeading),
          z: startZ + fraction * distanceDelta * Math.sin(startHeading),
        };
      }
      const angle = startHeading + fraction * headingDelta;
      const arcScale = distanceDelta / headingDelta;
      return {
        x: startX + arcScale * (Math.sin(angle) - Math.sin(startHeading)),
        z: startZ + arcScale * (Math.cos(startHeading) - Math.cos(angle)),
      };
    };

    const headingAt = (fraction: number) => startHeading + fraction * headingDelta;

    return { headingDelta, pointAt, headingAt };
  };

  const depositImprint = (
    fromDistance: number,
    toDistance: number,
    sampler: ReturnType<typeof createArcSampler>,
  ) => {
    const distanceDelta = toDistance - fromDistance;
    if (distanceDelta === 0) return;
    const chunks = splitImprintTravel(fromDistance, toDistance, FLOOR_PITCH);

    for (const chunk of chunks) {
      const fromFraction = Math.min(
        1,
        Math.max(0, (chunk.fromDistance - fromDistance) / distanceDelta),
      );
      const toFraction = Math.min(
        1,
        Math.max(0, (chunk.toDistance - fromDistance) / distanceDelta),
      );
      const startPoint = sampler.pointAt(fromFraction);
      const endPoint = sampler.pointAt(toFraction);
      const reverseHeadingOffset = chunk.direction < 0 ? Math.PI : 0;

      floorHistory.layChunk({
        ordinal: chunk.ordinal,
        frameIndex: frameIndexForOrdinal(chunk.ordinal, FRAME_COUNT),
        direction: chunk.direction,
        start: {
          ...startPoint,
          heading: sampler.headingAt(fromFraction) + reverseHeadingOffset,
          phase: chunk.fromPhase,
        },
        end: {
          ...endPoint,
          heading: sampler.headingAt(toFraction) + reverseHeadingOffset,
          phase: chunk.toPhase,
        },
      });
    }
  };

  const applyPathDelta = (
    distanceDelta: number,
    startHeading: number,
    endHeading: number,
  ) => {
    const sampler = createArcSampler(startHeading, endHeading, distanceDelta);
    if (distanceDelta !== 0) {
      const previousDistance = pathDistance;
      const nextDistance = previousDistance + distanceDelta;
      depositImprint(previousDistance, nextDistance, sampler);
      const endpoint = sampler.pointAt(1);
      worldPosition.x = endpoint.x;
      worldPosition.z = endpoint.z;
      pathDistance = nextDistance;
      updateContactFrame();
    }
    heading = startHeading + sampler.headingDelta;
  };

  /**
   * The camera does not chase the drum directly; the world is re-centred
   * around a damped render origin instead, so minutes of travel never push
   * float coordinates into imprecision and the drum stays framed.
   */
  const updateRenderOrigin = (deltaTime: number) => {
    const relativeX = worldPosition.x - renderOrigin.x;
    const relativeZ = worldPosition.z - renderOrigin.z;
    const relativeDistance = Math.hypot(relativeX, relativeZ);
    const distanceScale = sceneBundle.getCameraDistanceScale();
    const safeRadius = (canvas.clientWidth < 640 ? 0.72 : 1.55) * distanceScale;
    let desiredX = renderOrigin.x;
    let desiredZ = renderOrigin.z;

    if (relativeDistance > safeRadius) {
      const keepRatio = safeRadius / relativeDistance;
      desiredX = worldPosition.x - relativeX * keepRatio;
      desiredZ = worldPosition.z - relativeZ * keepRatio;
    }

    renderOrigin.x = damp(renderOrigin.x, desiredX, CONFIG.camera.followLambda, deltaTime);
    renderOrigin.z = damp(renderOrigin.z, desiredZ, CONFIG.camera.followLambda, deltaTime);
  };

  // ── Init: aim along the camera's ground axis, frame 01 half-laid. ────────
  const initialDirection = sceneBundle.screenDirectionToWorld(1, 0);
  heading = Math.atan2(initialDirection.z, initialDirection.x);
  targetHeading = heading;
  floorHistory.seedInitialHalf({ contact: worldPosition, heading });

  const input = still
    ? null
    : createInputController({
        element: canvas,
        pointerDirectionThreshold: CONFIG.input.pointerDirectionThreshold,
        speedDefault: CONFIG.input.speedDefault,
        speedMin: CONFIG.input.speedMin,
        speedMax: CONFIG.input.speedMax,
        speedStep: CONFIG.input.speedStep,
        speedLambda: CONFIG.input.speedLambda,
        onWheelZoom(wheelDelta) {
          sceneBundle.adjustZoom(wheelDelta);
        },
        onSpeedChange(nextSpeed) {
          status.speed = nextSpeed;
          pushStatus();
        },
        onEngagedChange(engaged) {
          status.engaged = engaged;
          pushStatus();
        },
      });

  const steeringCursor = still
    ? null
    : createSteeringCursor({
        element: canvas,
        host,
        pointerDirectionThreshold: CONFIG.input.pointerDirectionThreshold,
      });

  const update = (deltaTime: number) => {
    const dt = Math.min(0.05, Math.max(0, deltaTime));

    if (input) {
      const control = input.update(dt, damp);
      const targetDirection = sceneBundle.screenDirectionToWorld(
        control.screenDirection.x,
        control.screenDirection.y,
      );
      targetHeading = Math.atan2(targetDirection.z, targetDirection.x);
      const nextHeading = dampAngle(
        heading,
        targetHeading,
        CONFIG.input.directionLambda,
        dt,
      );
      const distanceDelta = control.speed * dt;
      // The turn constraint: however hard the pointer swings, the drum
      // cannot turn tighter than its minimum radius at this speed.
      const maximumHeadingDelta =
        Math.abs(distanceDelta) / CONFIG.roller.minimumTurnRadius;
      const requestedHeadingDelta = shortestAngleDelta(heading, nextHeading);
      const constrainedHeading =
        heading +
        Math.max(
          -maximumHeadingDelta,
          Math.min(maximumHeadingDelta, requestedHeadingDelta),
        );
      applyPathDelta(distanceDelta, heading, constrainedHeading);
    }

    sceneBundle.updateCamera(dt, still);
    updateRenderOrigin(dt);
    roller.setPose(
      worldPosition.x - renderOrigin.x,
      worldPosition.z - renderOrigin.z,
      rotationForDistance(pathDistance, ROLLER_RADIUS),
      -heading,
    );
    floorHistory.update(dt, renderOrigin);
  };

  const renderFrame = (now: number) => {
    animationFrame = requestAnimationFrame(renderFrame);
    const dt = (now - lastFrameTime) / 1000;
    lastFrameTime = now;
    if (paused || !inView) return;
    update(dt);
    sceneBundle.render();
  };

  if (still) {
    // A short pre-rolled arc so the still frame shows the idea — the drum
    // partway through a gentle turn, three frames printed behind it.
    const steps = 96;
    const totalDistance = FLOOR_PITCH * 2.6;
    const totalHeadingDelta = -0.55;
    for (let index = 0; index < steps; index += 1) {
      applyPathDelta(
        totalDistance / steps,
        heading,
        heading + totalHeadingDelta / steps,
      );
    }
    renderOrigin.x = worldPosition.x;
    renderOrigin.z = worldPosition.z;
    update(0);
    sceneBundle.render();
  } else {
    animationFrame = requestAnimationFrame(renderFrame);
  }

  // Park the loop when the section is off-screen or the tab is hidden.
  const intersection = new IntersectionObserver(
    (entries) => {
      inView = entries[0]?.isIntersecting ?? true;
    },
    { threshold: 0.05 },
  );
  intersection.observe(host);

  const onVisibilityChange = () => {
    paused = document.hidden;
    input?.setEnabled(!paused);
    steeringCursor?.setEnabled(!paused);
    if (!paused) lastFrameTime = performance.now();
  };
  document.addEventListener('visibilitychange', onVisibilityChange);

  const onContextLost = (event: Event) => {
    event.preventDefault();
    paused = true;
  };
  canvas.addEventListener('webglcontextlost', onContextLost);

  const resizeObserver = new ResizeObserver(() => {
    sceneBundle.resize();
    if (still) {
      update(0);
      sceneBundle.render();
    }
  });
  resizeObserver.observe(canvas);

  pushStatus();

  return {
    destroy() {
      if (destroyed) return;
      destroyed = true;
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      intersection.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      input?.dispose();
      steeringCursor?.dispose();
      floorHistory.dispose();
      roller.dispose();
      for (const texture of frameTextures) texture.dispose();
      atlas.dispose();
      sceneBundle.dispose();
    },
  };
}
