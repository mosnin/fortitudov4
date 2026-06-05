"use client";

import { useEffect, useRef } from "react";

/**
 * The studio's signature: a slow, calm field of ASCII characters that flow like
 * something being assembled. Rendered to canvas for performance; honors
 * prefers-reduced-motion (draws a single static frame). Brand orange on dark.
 */
export function AsciiField({
  className,
  speed = 0.05,
  cell = 12,
}: {
  className?: string;
  speed?: number;
  cell?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const ramp = " .·:-=+*≡#%@";
    const cw = cell * 0.62; // monospace cell width
    let cols = 0;
    let rows = 0;
    let dpr = 1;
    let t = Math.random() * 100;
    let raf = 0;
    let last = 0;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const field = (x: number, y: number, tt: number) => {
      const cx = cols / 2;
      const cy = rows / 2;
      const v =
        Math.sin(x * 0.18 + tt) +
        Math.sin(y * 0.22 + tt * 0.7) +
        Math.sin((x + y) * 0.09 + tt * 1.1) +
        Math.sin(Math.hypot(x - cx, y - cy) * 0.13 - tt * 1.25);
      return (v + 4) / 8; // ~0..1
    };

    const draw = () => {
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const v = field(x, y, t);
          const idx = Math.max(0, Math.min(ramp.length - 1, Math.floor(v * (ramp.length - 1))));
          const ch = ramp[idx];
          if (ch === " ") continue;
          const a = 0.06 + v * 0.5;
          ctx.fillStyle =
            v > 0.86 ? `rgba(251,191,36,${a.toFixed(3)})` : `rgba(249,115,22,${a.toFixed(3)})`;
          ctx.fillText(ch, x * cw, y * cell);
        }
      }
    };

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(r.width * dpr);
      canvas.height = Math.floor(r.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = `${cell}px ui-monospace, "SF Mono", Menlo, monospace`;
      ctx.textBaseline = "top";
      cols = Math.ceil(r.width / cw) + 1;
      rows = Math.ceil(r.height / cell) + 1;
      draw();
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    let running = false;
    const loop = (ts: number) => {
      raf = requestAnimationFrame(loop);
      if (ts - last < 55) return; // ~18fps, deliberately calm
      last = ts;
      t += speed;
      draw();
    };
    const start = () => {
      if (running || reduce) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    // Only animate while on-screen. A page can hold many fields; idle ones must
    // not each burn a RAF loop (battery + jank, especially on mobile).
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries[0]?.isIntersecting ?? true;
        if (visible) {
          draw(); // a fresh frame the moment it reveals
          start();
        } else {
          stop();
        }
      },
      { rootMargin: "120px" }
    );
    io.observe(canvas);

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
    };
  }, [speed, cell]);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
