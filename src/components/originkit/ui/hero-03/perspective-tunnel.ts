/**
 * The perspective tunnel — OriginKit `hero-03`, rewritten.
 *
 * WHAT SURVIVED THE PORT
 * The idea: a wireframe corridor receding into fog, drawn with three.js, so
 * the top of the page has real depth behind it rather than a painted gradient.
 * The reference built that corridor out of tube segments on a 4x4 grid and
 * fogged it into the ground colour. That is what is left.
 *
 * WHAT DID NOT
 *  - **The photographs.** The drop floated five portraits of real people
 *    through the corridor (6.3MB of another product's models) plus a six-hex
 *    "confetti" palette for the slabs they did not fill. Both are gone, with
 *    the texture loader, the slab geometry and the random populate pass that
 *    fed them. Fortitudo invents nothing on this surface and does not ship
 *    stock: the corridor is drawn, not photographed, and it works without a
 *    single image — which is the whole reason this port was possible.
 *  - **The interaction.** Press-to-boost, the "Press to Start" cursor label
 *    and the pointer handlers behind them. This runs behind a headline as
 *    decoration; a background that reacts to the cursor is a background that
 *    invites you to play with it instead of reading.
 *  - **The palette.** Not one hex from the drop (`#FFFBE1` cream ground,
 *    `#D7CFA4` lines) survives. Every colour arrives as a CSS colour string
 *    the caller read off the mounted DOM, so the corridor follows the `--fx-*`
 *    tokens instead of freezing a value here.
 *  - **Frame-rate-dependent travel.** The reference advanced its scroll
 *    position by a fixed step per frame, so the corridor moved twice as fast
 *    on a 120Hz screen. Travel is now in units per SECOND.
 *  - **Segment recycling.** With the random slabs gone every segment is
 *    identical, so the corridor is periodic: the camera wraps by one segment
 *    depth instead of fifteen groups being shuffled behind it each frame.
 *
 * NO REACT HERE, DELIBERATELY — the same shape as `hero-26/dot-matrix.ts`.
 * Hand it an element, get back a handle with `destroy()`, or get back `null`
 * when the machine cannot give us a WebGL context. The caller renders its copy
 * either way; `null` means "draw nothing", never "fail".
 */

import {
  Color,
  Fog,
  Group,
  LineCurve3,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
  TubeGeometry,
  Vector3,
  WebGLRenderer,
  type BufferGeometry,
} from 'three';

export type PerspectiveTunnelOptions = {
  /**
   * The ground. A SOLID CSS colour — this is the clear colour AND the fog, so
   * it has to be the same value the section behind the canvas paints, or the
   * corridor ends in a rectangle. Read it from `--fx-charcoal`.
   */
  background: string;
  /** The corridor's longitudinal rails. A solid colour; alpha is `lineOpacity`. */
  lineColor: string;
  /** The cross-ribs at each segment. A solid colour; alpha is `accentOpacity`. */
  accentColor: string;
  /** 0–1. Kept low: this is structure behind a headline, not a drawing. */
  lineOpacity?: number;
  /** 0–1. */
  accentOpacity?: number;
  /** Cells per wall. 4 is the reference's value. */
  grid?: number;
  /** Travel toward the far end, in tunnel units per second. */
  speed?: number;
  /** 0–100. How much of the corridor the fog eats; 100 fogs from the camera. */
  fade?: number;
  /**
   * Draw one frame and never schedule another. The reduced-motion path: the
   * corridor is still there, still coloured, and no `requestAnimationFrame` is
   * ever called — the reference merely set its speed to zero, which stops the
   * travel but leaves a render loop running for a picture that cannot change.
   */
  still?: boolean;
};

export type PerspectiveTunnelHandle = {
  /** Stops the loop, drops every listener, frees the GPU objects. */
  destroy(): void;
};

/* The corridor's proportions, from the reference. */
const TUNNEL_WIDTH = 2;
const TUNNEL_HEIGHT = 1.8;
const SEGMENT_DEPTH = 1;
const NUM_SEGMENTS = 15;
const LINE_RADIUS = 0.003;
const FOG_FAR = NUM_SEGMENTS * SEGMENT_DEPTH * 0.95;
/** 30fps. The corridor drifts slowly; 60 would spend twice the battery on it. */
const FRAME_MS = 1000 / 30;

/**
 * Mounts the corridor inside `host` (which must be positioned).
 *
 * Returns `null` — never throws — when there is no WebGL context to draw into:
 * old hardware, a blocklisted driver, a headless browser, some privacy modes.
 */
export function createPerspectiveTunnel(
  host: HTMLElement,
  {
    background,
    lineColor,
    accentColor,
    lineOpacity = 0.16,
    accentOpacity = 0.3,
    grid = 4,
    speed = 0.34,
    fade = 100,
    still = false,
  }: PerspectiveTunnelOptions,
): PerspectiveTunnelHandle | null {
  let canvas: HTMLCanvasElement;
  let renderer: WebGLRenderer;
  try {
    canvas = document.createElement('canvas');
    // Ask for the context first: `WebGLRenderer` throws when it cannot get
    // one, and a machine without WebGL is not an error worth surfacing.
    if (!canvas.getContext('webgl2') && !canvas.getContext('webgl')) return null;
    renderer = new WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
  } catch {
    return null;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  Object.assign(canvas.style, { position: 'absolute', inset: '0', display: 'block' });

  const ground = new Color(background);
  const scene = new Scene();
  scene.background = ground;
  // `fade` at 100 fogs the whole corridor, so the far end dissolves into the
  // ground rather than ending on a visible last rib.
  const fogNear = Math.min(
    FOG_FAR * (1 - Math.min(100, Math.max(0, fade)) / 100),
    FOG_FAR - 0.01,
  );
  scene.fog = new Fog(ground, fogNear, FOG_FAR);

  const camera = new PerspectiveCamera(45, 1, 0.1, 1000);
  /**
   * The eye sits a little above the corridor's midline, and that is not a
   * detail. A rail at exactly camera height projects to the horizon — a
   * dead-straight hairline across the full width of the frame, which on a
   * 4x4 grid put one right through the headline. Off the midline every rail
   * is a diagonal converging on the vanishing point, which is what the
   * perspective is for.
   */
  camera.position.set(0, TUNNEL_HEIGHT * 0.08, 0);

  const railMaterial = new MeshBasicMaterial({
    color: new Color(lineColor),
    transparent: true,
    opacity: Math.min(1, Math.max(0, lineOpacity)),
  });
  const ribMaterial = new MeshBasicMaterial({
    color: new Color(accentColor),
    transparent: true,
    opacity: Math.min(1, Math.max(0, accentOpacity)),
  });

  const hw = TUNNEL_WIDTH / 2;
  const hh = TUNNEL_HEIGHT / 2;
  const cells = Math.max(1, Math.round(grid));
  const colW = TUNNEL_WIDTH / cells;
  const rowH = TUNNEL_HEIGHT / cells;

  const tubeZ = new TubeGeometry(
    new LineCurve3(new Vector3(0, 0, 0), new Vector3(0, 0, -SEGMENT_DEPTH)),
    1,
    LINE_RADIUS,
    6,
  );
  const tubeX = new TubeGeometry(
    new LineCurve3(new Vector3(0, 0, 0), new Vector3(TUNNEL_WIDTH, 0, 0)),
    1,
    LINE_RADIUS,
    6,
  );
  const tubeY = new TubeGeometry(
    new LineCurve3(new Vector3(0, 0, 0), new Vector3(0, TUNNEL_HEIGHT, 0)),
    1,
    LINE_RADIUS,
    6,
  );

  const bar = (
    geometry: BufferGeometry,
    material: MeshBasicMaterial,
    x: number,
    y: number,
  ) => {
    const mesh = new Mesh(geometry, material);
    mesh.position.set(x, y, 0);
    return mesh;
  };

  /** One segment: the rails that run away from you, then the rib that closes it. */
  const segment = (z: number) => {
    const group = new Group();
    group.position.z = z;
    for (let i = 0; i <= cells; i++) {
      const x = -hw + i * colW;
      group.add(bar(tubeZ, railMaterial, x, -hh));
      group.add(bar(tubeZ, railMaterial, x, hh));
    }
    for (let i = 1; i < cells; i++) {
      const y = -hh + i * rowH;
      group.add(bar(tubeZ, railMaterial, -hw, y));
      group.add(bar(tubeZ, railMaterial, hw, y));
    }
    group.add(bar(tubeX, ribMaterial, -hw, -hh));
    group.add(bar(tubeX, ribMaterial, -hw, hh));
    group.add(bar(tubeY, ribMaterial, -hw, -hh));
    group.add(bar(tubeY, ribMaterial, hw, -hh));
    return group;
  };

  for (let i = 0; i < NUM_SEGMENTS; i++) scene.add(segment(-i * SEGMENT_DEPTH));

  host.appendChild(canvas);

  let rafId: number | null = null;
  let lastFrame = 0;
  let lastStamp = 0;
  let inView = true;
  let lost = false;
  let destroyed = false;

  const draw = () => {
    if (destroyed || lost) return;
    renderer.render(scene, camera);
  };

  const resize = () => {
    if (destroyed) return;
    const width = host.clientWidth || 1;
    const height = host.clientHeight || 1;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    draw();
  };

  /**
   * Every segment is identical, so the corridor is periodic: the camera walks
   * one segment forward and wraps. Nothing is recycled and nothing pops.
   */
  const tick = (stamp: number) => {
    if (destroyed) return;
    rafId = requestAnimationFrame(tick);
    if (stamp - lastFrame < FRAME_MS) return;
    const dt = lastStamp ? Math.min((stamp - lastStamp) / 1000, 0.25) : 0;
    lastStamp = stamp;
    lastFrame = stamp;
    let z = camera.position.z - speed * dt;
    while (z <= -SEGMENT_DEPTH) z += SEGMENT_DEPTH;
    camera.position.z = z;
    draw();
  };

  const documentHidden = () =>
    typeof document !== 'undefined' && document.visibilityState === 'hidden';

  const stop = () => {
    if (rafId !== null) cancelAnimationFrame(rafId);
    rafId = null;
    lastStamp = 0;
  };

  /**
   * The loop runs only while the hero is on screen, the tab is in front, the
   * context is alive and motion is wanted. This one is above the fold, so it
   * mounts immediately — and stops the moment you scroll past it.
   */
  const sync = () => {
    if (destroyed) return;
    const wanted = !still && inView && !documentHidden() && !lost;
    if (wanted && rafId === null) {
      lastFrame = 0;
      rafId = requestAnimationFrame(tick);
    } else if (!wanted) {
      stop();
    }
  };

  const onContextLost = (event: Event) => {
    event.preventDefault();
    lost = true;
    stop();
  };
  canvas.addEventListener('webglcontextlost', onContextLost);

  let resizeObserver: ResizeObserver | null = null;
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
  }
  window.addEventListener('resize', resize);

  let intersectionObserver: IntersectionObserver | null = null;
  if (typeof IntersectionObserver !== 'undefined') {
    intersectionObserver = new IntersectionObserver(
      (entries) => {
        inView = entries.some((entry) => entry.isIntersecting);
        sync();
      },
      { rootMargin: '96px' },
    );
    intersectionObserver.observe(host);
  }
  document.addEventListener('visibilitychange', sync);

  resize();
  sync();

  return {
    destroy() {
      destroyed = true;
      stop();
      canvas.removeEventListener('webglcontextlost', onContextLost);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', sync);
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      tubeZ.dispose();
      tubeX.dispose();
      tubeY.dispose();
      railMaterial.dispose();
      ribMaterial.dispose();
      renderer.dispose();
      if (canvas.parentElement === host) host.removeChild(canvas);
    },
  };
}
