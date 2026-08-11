"use client";

/**
 * ASCII Waves — a field of monospace characters animated by layered
 * pseudo-noise, with optional cursor interaction. Drives the right-hand column
 * of the homepage hero.
 *
 * Ported from the OriginKit delivery, with three changes:
 *
 *  1. TYPED. It arrived as untyped JS in a .tsx file and did not compile.
 *  2. The Framer `RenderTarget` shim is gone. It was a stub whose `current()`
 *     always returned "preview", so the `isStatic` branch it fed was dead code
 *     that could never run outside Framer's editor.
 *  3. That branch is now wired to `prefers-reduced-motion` instead, which is
 *     what it should have keyed on here: this is a requestAnimationFrame loop
 *     that redraws several thousand glyphs every frame for as long as the page
 *     is open. Readers who ask for less motion get one painted frame.
 */

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

/* `prefers-reduced-motion` is external state React does not own, so it is read
 * through useSyncExternalStore rather than mirrored into a useState via an
 * effect. Both callbacks live at module scope because they have to be stable
 * across renders or the store resubscribes on every one. */
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function getReducedMotion() {
  return window.matchMedia(REDUCED_MOTION).matches;
}

/** The server cannot know the preference; assume motion is fine and correct
 *  on hydrate, which matches how the rest of the site treats it. */
function getReducedMotionOnServer() {
  return false;
}

export type ASCIIWavesProps = {
  /** Ramp from sparsest to densest glyph. */
  characters?: string;
  /** Cell size in px; also the font size. */
  elementSize?: number;
  color?: string;
  background?: string;
  direction?: "left" | "right" | "top" | "bottom";
  invert?: boolean;
  fontWeight?: string;
  /** Slider ranges, rescaled internally — see the divisions below. */
  speed?: number;
  waveTension?: number;
  noiseScale?: number;
  intensity?: number;
  hasCursorInteraction?: boolean;
  interactionIntensity?: number;
  interactionRadius?: number;
  style?: React.CSSProperties;
};

const COMPONENT_DEFAULTS = {
  characters: " .:-+*=%@#",
  elementSize: 16,
  color: "var(--fx-white)",
  direction: "left",
  background: "var(--fx-charcoal)",
  invert: false,
  fontWeight: "400",
  speed: 20,
  waveTension: 5,
  noiseScale: 12,
  intensity: 10,
  hasCursorInteraction: true,
  interactionIntensity: 15,
  interactionRadius: 160,
} satisfies Required<Omit<ASCIIWavesProps, "style">>;

const DRIFT: Record<string, [number, number]> = {
  left: [1, 0],
  right: [-1, 0],
  top: [0, 1],
  bottom: [0, -1],
};

/**
 * Canvas is not CSS. Assigning `ctx.fillStyle = "var(--fx-yellow)"` is not an
 * error — the 2D context cannot parse it, so it silently ignores the
 * assignment and keeps whatever colour was set before. The default is black,
 * which on a charcoal panel means the whole field renders black-on-black and
 * looks like the component simply never ran.
 *
 * So custom properties are resolved against the element that inherits them
 * before they ever reach the context. Anything that is already a real colour
 * passes straight through.
 */
function resolveColor(value: string, el: HTMLElement | null): string {
  const match = /^\s*var\(\s*(--[\w-]+)\s*(?:,\s*([^)]*))?\)\s*$/.exec(value);
  if (!match) return value;
  const [, name, fallback] = match;
  const resolved = el
    ? getComputedStyle(el).getPropertyValue(name).trim()
    : '';
  return resolved || fallback?.trim() || 'transparent';
}

export default function ASCIIWaves(props: ASCIIWavesProps) {
  const {
    characters,
    elementSize,
    color,
    direction,
    background,
    invert,
    waveTension,
    speed,
    noiseScale,
    intensity,
    hasCursorInteraction,
    interactionIntensity,
    interactionRadius,
    fontWeight,
    style,
  } = { ...COMPONENT_DEFAULTS, ...props };

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef(0);
  const startRef = useRef(0);
  const pointerRef = useRef({ x: -9999, y: -9999, active: false });
  const [size, setSize] = useState({ w: 0, h: 0 });
  const isStatic = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotion,
    getReducedMotionOnServer,
  );

  // The clock starts on the client. Seeding it during render would bake a
  // server timestamp into the first frame and jump the animation on hydrate.
  useEffect(() => {
    if (startRef.current === 0) startRef.current = performance.now();
  }, []);

  const rampArr = (characters.length > 0 ? characters : " .:-+*=%@#")
    .split("")
    [invert ? "reverse" : "slice"]()
    .join("");

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const cr = entry.contentRect;
        setSize({
          w: Math.max(1, Math.floor(cr.width)),
          h: Math.max(1, Math.floor(cr.height)),
        });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!hasCursorInteraction || isStatic) return;
    const el = containerRef.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      pointerRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    };
    const onLeave = () => {
      pointerRef.current.active = false;
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [hasCursorInteraction, isStatic]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const { w, h } = size;
    if (w === 0 || h === 0) return;

    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(dpr, dpr);

    // Rescaled props divided back to their original fractional ranges:
    //   speed            slider/20  (slider 0–100, internal 0–5)
    //   waveTension      slider/10  (slider 1–20,  internal 0.1–2)
    //   noiseScale       slider/100 (slider 1–50,  internal 0.01–0.5)
    //   intensity        slider/10  (slider 1–30,  internal 0.1–3)
    //   interactionIntensity slider/10 (slider 0–50, internal 0–5)
    const speedVal = speed / 20;
    const tensionVal = waveTension / 10;
    // Twist is fixed (former Twist control default 10 → 0.1).
    const twistVal = 0.1;
    const scaleVal = noiseScale / 100;
    const intensityVal = intensity / 10;
    const cursorForceVal = interactionIntensity / 10;

    // Directional drift: shift noise sampling over time so waves travel.
    const [driftX, driftY] = DRIFT[direction] ?? DRIFT.left;
    // Translation per second. Dominates the slow in-place morph below so the
    // pattern visibly travels in the chosen direction.
    const driftRate = 1.5;

    const cell = Math.max(4, elementSize);
    const colStep = cell * 0.6;
    const cols = Math.ceil(w / colStep) + 1;
    const rows = Math.ceil(h / cell) + 1;

    ctx.font = `${fontWeight} ${cell}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`;
    ctx.textBaseline = "top";
    ctx.textAlign = "left";

    const noise = (x: number, y: number, t: number) => {
      const a = Math.sin(x * 1.3 + t) * Math.cos(y * 1.1 - t * 0.7);
      const b = Math.sin((x + y) * 0.7 + t * 0.5);
      const c = Math.sin(x * 0.4 - y * 0.6 + t * 0.3);
      return (a + b + c) / 3;
    };

    const rampMax = rampArr.length - 1;

    // Resolved once per effect run, not per frame: `getComputedStyle` forces
    // style resolution, and doing that inside a rAF loop is how you turn a
    // background flourish into a jank source.
    const inkColor = resolveColor(color, canvas);
    const groundColor = resolveColor(background, canvas);

    const draw = (now: number) => {
      const t = ((now - startRef.current) / 1000) * speedVal;
      ctx.fillStyle = groundColor;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = inkColor;

      const p = pointerRef.current;

      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const px = i * colStep;
          const py = j * cell;
          const ox = t * driftRate * driftX;
          const oy = t * driftRate * driftY;
          const nx = i * scaleVal + ox + Math.sin((j + t) * twistVal) * 2;
          const ny = j * scaleVal + oy + Math.cos((i + t) * twistVal) * 2;
          // Full wave churn + directional travel from ox/oy.
          let v = noise(nx, ny, t * tensionVal);

          if (hasCursorInteraction && p.active) {
            const dx = px - p.x;
            const dy = py - p.y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < interactionRadius) {
              const falloff = 1 - d / interactionRadius;
              v += Math.sin(d * 0.08 - t * 4) * falloff * cursorForceVal;
            }
          }

          const norm = Math.max(0, Math.min(1, (v * intensityVal + 1) / 2));
          const ch = rampArr.charAt(Math.round(norm * rampMax));
          if (ch !== " ") ctx.fillText(ch, px, py);
        }
      }
    };

    if (isStatic) {
      draw(startRef.current + 1000);
      return;
    }

    const loop = (now: number) => {
      draw(now);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [
    size,
    elementSize,
    color,
    direction,
    background,
    rampArr,
    waveTension,
    speed,
    noiseScale,
    intensity,
    hasCursorInteraction,
    interactionIntensity,
    interactionRadius,
    fontWeight,
    isStatic,
  ]);

  return (
    <div
      ref={containerRef}
      style={{
        ...style,
        position: "relative",
        overflow: "hidden",
        background,
        width: "100%",
        height: "100%",
      }}
    >
      <canvas ref={canvasRef} style={{ display: "block" }} />
    </div>
  );
}
