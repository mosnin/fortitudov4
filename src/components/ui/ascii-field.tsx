"use client";

/**
 * AsciiField — the studio's signature: a slow, calm field of ASCII characters
 * that flow like something being assembled. Canvas-rendered for performance;
 * honors prefers-reduced-motion (draws a single static frame).
 *
 * Fortitudo orange on transparent so it reads on both light and dark — the
 * page surface shows through. Use as an atmospheric layer behind page
 * headers, auth panels, and empty states; always pointer-events-none.
 */

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

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
    const cw = cell * 0.62;
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
      return (v + 4) / 8;
    };

    const draw = () => {
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const v = field(x, y, t);
          const idx = Math.max(
            0,
            Math.min(ramp.length - 1, Math.floor(v * (ramp.length - 1)))
          );
          const ch = ramp[idx];
          if (ch === " ") continue;
          const a = 0.06 + v * 0.5;
          // Fortitudo orange #f97316, brightening to pale amber on the crests.
          ctx.fillStyle =
            v > 0.86
              ? `rgba(253,186,116,${a.toFixed(3)})`
              : `rgba(249,115,22,${a.toFixed(3)})`;
          ctx.fillText(ch, x * cw, y * cell);
        }
      }
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = `${cell - 2}px ui-monospace, SFMono-Regular, Menlo, monospace`;
      ctx.textBaseline = "top";
      cols = Math.ceil(rect.width / cw) + 1;
      rows = Math.ceil(rect.height / cell) + 1;
      draw();
    };

    const tick = (now: number) => {
      if (now - last > 90) {
        last = now;
        t += speed;
        draw();
      }
      raf = requestAnimationFrame(tick);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    if (!reduce) raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [speed, cell]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={cn("pointer-events-none h-full w-full select-none", className)}
    />
  );
}
