/**
 * The dot-matrix field — OriginKit `hero-26`, rewritten.
 *
 * WHAT SURVIVED THE PORT
 * The reference drew a perlin field into a render target, then read that
 * texture back in a second pass that quantised it into a grid of `·•○●`
 * glyphs. The look is the reason it was picked; the machinery around it was
 * not. This module keeps the simplex noise and the glyph quantiser and drops
 * the rest:
 *
 *   - The render target, the second mesh and the camera are gone. The dot
 *     pass evaluates the noise directly at each cell centre, which is what the
 *     texture read was approximating anyway — one program, one draw call, no
 *     framebuffer, and exact rather than resampled.
 *   - The ten-colour palette became a four-stop ramp, because that is what the
 *     caller uses.
 *   - The ground is gone. The canvas is transparent and the section behind it
 *     paints `--fx-charcoal`, so the ground is the token rather than a hex
 *     that has to be kept in step with one.
 *
 * NO REACT HERE, DELIBERATELY. This is a plain factory: hand it an element,
 * get back a handle with `destroy()`, or get back `null` if the machine cannot
 * give us a WebGL2 context. That is what makes the no-WebGL path testable
 * without a browser — `createDotMatrix` is a function you can call with a
 * stubbed `document` and assert on, and the component that mounts it treats
 * `null` as "draw nothing", never as an error.
 *
 * Colour is the caller's business. Every stop arrives as a CSS colour string
 * read off the mounted element's computed style, so the field follows the
 * `--fx-*` palette (and the `[data-fx-tone="light"]` inversion) instead of
 * freezing a hex here.
 */

import { Mesh, Plane, Program, Renderer, Texture } from 'ogl';

/** One step of the dot ramp: a CSS colour, optionally dimmed. */
export type RampStop = {
  /** Any colour CSS produces: `#rgb`, `#rrggbb`, `#rrggbbaa`, `rgb()`, `rgba()`. */
  css: string;
  /** Multiplies the colour's own alpha. 1 = as given. */
  opacity?: number;
};

export type DotMatrixOptions = {
  /**
   * The ramp, dimmest first. Exactly four stops are used: fewer are padded by
   * repeating the last, more are ignored. Cell brightness walks this ramp, so
   * the top stop is what the rare bright cells wear.
   */
  ramp: RampStop[];
  /** Grid pitch in CSS pixels. */
  cellPx?: number;
  /** Noise frequency: higher is busier. */
  frequency?: number;
  /** Field drift, in noise units per second. */
  speed?: number;
  /** >1 darkens the midtones, which keeps the top ramp stop rare. */
  gamma?: number;
  /** Offsets the noise field so two heroes on two pages are not the same frame. */
  seed?: number;
  /**
   * Draw one frame and never start the loop. This is the reduced-motion path:
   * the field is still there and still correctly coloured, it simply does not
   * move — and no `requestAnimationFrame` is ever scheduled.
   */
  still?: boolean;
  /** Glyphs, dimmest first. */
  characters?: string;
};

export type DotMatrixHandle = {
  /** Cancels the loop, drops every listener and removes the canvas. */
  destroy(): void;
};

/** The shader's ramp is a fixed-size array; this is that size. */
const RAMP_STOPS = 4;
/** 30fps. The field drifts slowly — 60 would spend twice the battery on it. */
const FRAME_MS = 1000 / 30;
/** The atlas is a resolution-independent mask, so one size fits every cell. */
const GLYPH_PX = 64;
const DEFAULT_CHARACTERS = '·•○●';

const vertexShader = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}`;

/**
 * Ashima's simplex noise (unchanged from the reference), then one pass that
 * samples it per cell and stamps a glyph.
 */
const fragmentShader = `#version 300 es
precision highp float;

uniform vec2 uResolution;
uniform float uTime;
uniform float uFrequency;
uniform float uGamma;
uniform float uCell;
uniform float uSeed;
uniform vec4 uRamp[${RAMP_STOPS}];
uniform sampler2D uGlyphAtlas;
uniform ivec2 uGlyphGrid;
uniform int uGlyphCount;

out vec4 fragColor;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

void main() {
  float cell = max(uCell, 2.0);
  vec2 pix = gl_FragCoord.xy;
  vec2 cellIndex = floor(pix / cell);

  // Sample the field at the CENTRE of the cell, so every glyph in a cell is
  // driven by one value and the grid reads as a grid.
  vec2 uv = ((cellIndex + 0.5) * cell) / max(uResolution, vec2(1.0));
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  uv = (uv - 0.5) * vec2(aspect, 1.0) + 0.5;

  float noise = snoise(vec3(uv * uFrequency, uTime + uSeed));
  float level = pow(clamp(0.5 + 0.5 * noise, 0.0, 1.0), uGamma);

  // Glyph: pick by level, then sample the atlas tile. gl_FragCoord counts up
  // the screen and the atlas counts down the image, so the tile is read
  // bottom-up.
  int count = max(uGlyphCount, 1);
  int index = int(clamp(floor(level * float(count - 1) + 0.5), 0.0, float(count - 1)));
  vec2 cellUV = fract(pix / cell);
  cellUV.y = 1.0 - cellUV.y;
  vec2 grid = vec2(uGlyphGrid);
  vec2 tile = vec2(float(index % max(uGlyphGrid.x, 1)), floor(float(index) / float(max(uGlyphGrid.x, 1))));
  float mark = texture(uGlyphAtlas, (tile + cellUV) / max(grid, vec2(1.0))).a;

  // Ramp: the same level walks the colour steps, so the brightest cells are
  // the only ones wearing the top stop.
  float scaled = level * float(${RAMP_STOPS} - 1);
  int step0 = int(clamp(floor(scaled), 0.0, float(${RAMP_STOPS} - 2)));
  vec4 tint = mix(uRamp[step0], uRamp[step0 + 1], scaled - float(step0));

  fragColor = vec4(tint.rgb, mark * tint.a);
}`;

type Rgba = [number, number, number, number];

/** Parses what `getComputedStyle` hands back for a colour token. */
export function parseCssColor(input: string): Rgba {
  const value = (input ?? '').trim();
  if (!value) return [0, 0, 0, 0];

  const fn = value.match(
    /rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)/i,
  );
  if (fn) {
    const alphaRaw = fn[4];
    const alpha =
      alphaRaw === undefined
        ? 1
        : alphaRaw.endsWith('%')
          ? Number.parseFloat(alphaRaw) / 100
          : Number.parseFloat(alphaRaw);
    return [
      clamp01(Number.parseFloat(fn[1]) / 255),
      clamp01(Number.parseFloat(fn[2]) / 255),
      clamp01(Number.parseFloat(fn[3]) / 255),
      clamp01(alpha),
    ];
  }

  const hex = value.replace(/^#/, '');
  const pair = (i: number) => Number.parseInt(hex.slice(i, i + 2), 16) / 255;
  const single = (i: number) => Number.parseInt(hex[i] + hex[i], 16) / 255;
  if (/^[\da-f]{8}$/i.test(hex)) return [pair(0), pair(2), pair(4), pair(6)];
  if (/^[\da-f]{6}$/i.test(hex)) return [pair(0), pair(2), pair(4), 1];
  if (/^[\da-f]{4}$/i.test(hex)) return [single(0), single(1), single(2), single(3)];
  if (/^[\da-f]{3}$/i.test(hex)) return [single(0), single(1), single(2), 1];
  return [0, 0, 0, 0];
}

function clamp01(n: number) {
  return Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0;
}

/** Pads or trims the caller's ramp to the size the shader declares. */
export function resolveRamp(ramp: RampStop[]): Rgba[] {
  const stops: Rgba[] = [];
  for (let i = 0; i < RAMP_STOPS; i++) {
    const stop = ramp[Math.min(i, ramp.length - 1)] as RampStop | undefined;
    if (!stop) {
      stops.push([0, 0, 0, 0]);
      continue;
    }
    const [r, g, b, a] = parseCssColor(stop.css);
    stops.push([r, g, b, clamp01(a * (stop.opacity ?? 1))]);
  }
  return stops;
}

/**
 * Draws the glyphs into one texture, white on transparent.
 *
 * The shader reads the ALPHA channel as coverage, which is why nothing here
 * paints a background: alpha survives premultiplication either way, so the
 * mask is the same however the browser hands the canvas back, and no opaque
 * fill has to exist to be read as one.
 */
function buildGlyphAtlas(gl: Renderer['gl'], characters: string) {
  const glyphs = Array.from(characters).filter((c) => !/\s/.test(c));
  const count = Math.max(1, glyphs.length);
  const cols = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / cols);

  const canvas = document.createElement('canvas');
  canvas.width = cols * GLYPH_PX;
  canvas.height = rows * GLYPH_PX;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  // The atlas face is not the page's face: these are geometric shapes rather
  // than letterforms, and the display/mono tokens resolve to `var(...)`
  // references that `ctx.font` cannot read anyway.
  ctx.font = `400 ${Math.round(GLYPH_PX * 0.78)}px ui-monospace, SFMono-Regular, Menlo, monospace`;
  glyphs.forEach((glyph, i) => {
    const x = (i % cols) * GLYPH_PX + GLYPH_PX / 2;
    const y = Math.floor(i / cols) * GLYPH_PX + GLYPH_PX / 2;
    ctx.fillText(glyph, x, y);
  });

  const texture = new Texture(gl, {
    image: canvas,
    generateMipmaps: false,
    flipY: false,
    wrapS: gl.CLAMP_TO_EDGE,
    wrapT: gl.CLAMP_TO_EDGE,
    minFilter: gl.LINEAR,
    magFilter: gl.LINEAR,
  });

  return { texture, cols, rows, count };
}

/**
 * Mounts the field inside `host` (which must be positioned).
 *
 * Returns `null` — never throws — when the field cannot be drawn: no WebGL2
 * context, a blocked or lost context, no 2D context for the glyph atlas. The
 * caller is expected to carry on and render its copy on the plain ground.
 */
export function createDotMatrix(
  host: HTMLElement,
  {
    ramp,
    cellPx = 13,
    frequency = 1.6,
    speed = 0.09,
    gamma = 1.7,
    seed = 0,
    still = false,
    characters = DEFAULT_CHARACTERS,
  }: DotMatrixOptions,
): DotMatrixHandle | null {
  // Ask for the context BEFORE handing the canvas to `ogl`, for two reasons:
  // `ogl` dereferences a context it failed to get (so a machine without one
  // gets a TypeError), and it falls back to WebGL1, where these
  // `#version 300 es` shaders would fail to compile and leave an empty canvas
  // — which is worse than no canvas. Old hardware, blocklisted drivers,
  // headless browsers and some privacy modes all land here, and none of them
  // are an error worth surfacing. `getContext` returns the same context on a
  // second call, so `ogl` reuses this one rather than allocating another.
  let renderer: Renderer;
  let canvas: HTMLCanvasElement;
  try {
    canvas = document.createElement('canvas');
    if (!canvas.getContext('webgl2', { alpha: true, depth: false, premultipliedAlpha: false })) {
      return null;
    }
    renderer = new Renderer({
      canvas,
      alpha: true,
      depth: false,
      antialias: false,
      premultipliedAlpha: false,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
    });
  } catch {
    return null;
  }
  if (!renderer.isWebgl2) return null;

  const gl = renderer.gl;
  const atlas = buildGlyphAtlas(gl, characters);
  if (!atlas) return null;

  Object.assign(canvas.style, {
    position: 'absolute',
    inset: '0',
    display: 'block',
  });

  const program = new Program(gl, {
    vertex: vertexShader,
    fragment: fragmentShader,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    // A full-screen quad has no back to cull, and a winding surprise here
    // would silently draw nothing at all.
    cullFace: false,
    uniforms: {
      uResolution: { value: [1, 1] },
      uTime: { value: 0 },
      uFrequency: { value: frequency },
      uGamma: { value: gamma },
      uCell: { value: cellPx },
      uSeed: { value: seed },
      uRamp: { value: resolveRamp(ramp) },
      uGlyphAtlas: { value: atlas.texture },
      uGlyphGrid: { value: [atlas.cols, atlas.rows] },
      uGlyphCount: { value: atlas.count },
    },
  });
  const mesh = new Mesh(gl, {
    geometry: new Plane(gl, { width: 2, height: 2 }),
    program,
  });

  host.appendChild(canvas);

  let rafId: number | null = null;
  let lastFrame = 0;
  let elapsed = 0;
  let lastStamp = 0;
  let inView = true;
  let lost = false;
  let destroyed = false;

  const draw = () => {
    if (destroyed || lost) return;
    program.uniforms.uTime.value = elapsed * speed;
    renderer.render({ scene: mesh });
  };

  const resize = () => {
    if (destroyed) return;
    const width = host.clientWidth || 1;
    const height = host.clientHeight || 1;
    renderer.dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setSize(width, height);
    program.uniforms.uResolution.value = [canvas.width, canvas.height];
    // Cells are authored in CSS pixels; gl_FragCoord counts device pixels.
    program.uniforms.uCell.value = cellPx * renderer.dpr;
    draw();
  };

  const tick = (stamp: number) => {
    if (destroyed) return;
    rafId = requestAnimationFrame(tick);
    if (stamp - lastFrame < FRAME_MS) return;
    elapsed += lastStamp ? Math.min((stamp - lastStamp) / 1000, 0.25) : 0;
    lastStamp = stamp;
    lastFrame = stamp;
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
   * The loop runs only while the section is on screen, the tab is in front,
   * the context is alive and motion is wanted. A shader loop on six sub-pages
   * running for nobody is a battery complaint.
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
      gl.deleteTexture(atlas.texture.texture);
      if (canvas.parentElement === host) host.removeChild(canvas);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    },
  };
}
