/**
 * The film roller's tuning — ported from karthi-98/filmroller (`src/config.js`).
 *
 * Numbers only. Everything that was a COLOUR in the upstream config moved to
 * the `Palette` in `create-film-roller.ts`, because on this site colour comes
 * from the `--fx-*` tokens read off the mounted element, never from a hex
 * frozen in a config file (the same rule `page-hero.tsx` documents).
 *
 * The geometry is load-bearing: `FLOOR_PITCH` and `ROLLER_RADIUS` tie the
 * drum's circumference to exactly four frame-lengths of floor, which is what
 * makes the no-slip illusion hold — one full revolution lays exactly one full
 * set of frames. Change `imageLength`, `gapRatio` or `segmentCount` and the
 * other two follow; change the radius alone and the drum skids.
 */

export const CONFIG = Object.freeze({
  floor: {
    imageWidth: 2.18,
    imageLength: 2.9067,
    gapRatio: 0.08,
    imageY: 0.014,
    filmY: 0.004,
    filmWidth: 2.66,
    ribbonMaxSections: 512,
    initialReveal: 0.5,
    /** Imprints kept live before the oldest fades; +1 during the fade. */
    maxActive: 100,
    fadeDuration: 0.7,
  },
  roller: {
    width: 2.36,
    segmentCount: 4,
    radialSegments: 128,
    /** The steering constraint — the drum cannot turn tighter than this. */
    minimumTurnRadius: 3.6,
  },
  input: {
    /** Fraction of the short canvas edge that acts as the HOLD dead zone. */
    pointerDirectionThreshold: 0.08,
    directionLambda: 5.4,
    speedDefault: 5,
    speedMin: 1,
    speedMax: 12,
    speedStep: 1,
    speedLambda: 6.8,
  },
  camera: {
    fov: 38,
    near: 0.05,
    far: 250,
    desktopPosition: [6.2, 8.9, 11.8] as const,
    mobilePosition: [7.6, 11.8, 17.8] as const,
    lookAt: [0, 0.3, 0] as const,
    followLambda: 4.8,
    zoomInitial: 1.12,
    zoomMin: 0.68,
    zoomMax: 2.05,
    zoomSensitivity: 0.00125,
    zoomLambda: 10.5,
    maxWheelDelta: 220,
  },
  render: {
    maxDpr: 1.75,
  },
});

export const FLOOR_PITCH = CONFIG.floor.imageLength * (1 + CONFIG.floor.gapRatio);

export const ROLLER_RADIUS =
  (FLOOR_PITCH * CONFIG.roller.segmentCount) / (Math.PI * 2);
