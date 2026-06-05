"use client";

import { useEffect, useRef } from "react";

/**
 * The Fortitudo mark, alive: the real logo is sampled into a texture and
 * mapped onto a 3D sphere that slowly spins on its vertical axis and "breathes"
 * (the radius pulses). Rendered entirely as ASCII in the brand palette.
 *
 * The logo is itself a banded globe, so wrapping it onto a sphere reads as the
 * same mark coming to life. Honors prefers-reduced-motion (one static, slightly
 * turned frame). Pixels are read from a same-origin icon, so the canvas is never
 * tainted; any failure degrades to nothing rather than crashing.
 */
export function LogoAscii({
  className,
  src = "/icons/icon-512.png",
  cell = 9,
  spinSpeed = 0.45, // radians / second
}: {
  className?: string;
  src?: string;
  cell?: number;
  spinSpeed?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const ramp = " .·:-=+*≡#%@";
    const cw = cell * 0.62; // monospace advance width
    const TW = 128; // texture resolution
    let tex: Float32Array | null = null; // 0..1 intensity (logo bands)
    let cols = 0;
    let rows = 0;
    let dpr = 1;
    let raf = 0;
    let t0 = 0;
    let last = 0;
    let ready = false;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ── Build the logo texture (same-origin → untainted canvas) ──────────────
    const img = new Image();
    img.onload = () => {
      try {
        const off = document.createElement("canvas");
        off.width = TW;
        off.height = TW;
        const octx = off.getContext("2d");
        if (!octx) return;
        octx.drawImage(img, 0, 0, TW, TW);
        const data = octx.getImageData(0, 0, TW, TW).data;
        const buf = new Float32Array(TW * TW);
        for (let i = 0; i < TW * TW; i++) {
          const a = data[i * 4 + 3] / 255; // alpha = the orange band silhouette
          // A touch of luminance so denser orange reads slightly brighter.
          const lum = (data[i * 4] * 0.6 + data[i * 4 + 1] * 0.3) / 255;
          buf[i] = a * (0.7 + 0.3 * lum);
        }
        tex = buf;
        ready = true;
      } catch {
        /* tainted or unreadable — leave blank */
      }
    };
    img.src = src;

    const sample = (u: number, v: number): number => {
      if (!tex) return 0;
      const x = Math.min(TW - 1, Math.max(0, Math.round(u * (TW - 1))));
      const y = Math.min(TW - 1, Math.max(0, Math.round(v * (TW - 1))));
      return tex[y * TW + x];
    };

    const draw = (elapsed: number) => {
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);
      if (!ready) return;

      const cx = w / 2;
      const cy = h / 2;
      // Breathing: radius pulses ~±5%, with a faint brightness swell.
      const breathe = 1 + 0.05 * Math.sin(elapsed * 1.6);
      const bright = 0.92 + 0.08 * Math.sin(elapsed * 1.6);
      const R = (Math.min(w, h) / 2) * 0.94 * breathe;
      const a = reduce ? 0.6 : elapsed * spinSpeed;
      const ca = Math.cos(a);
      const sa = Math.sin(a);

      for (let j = 0; j < rows; j++) {
        const py = j * cell + cell * 0.5;
        const ny = (py - cy) / R;
        if (ny < -1 || ny > 1) continue;
        for (let i = 0; i < cols; i++) {
          const px = i * cw + cw * 0.5;
          const nx = (px - cx) / R;
          const r2 = nx * nx + ny * ny;
          if (r2 > 1) continue; // outside the sphere
          const nz = Math.sqrt(1 - r2); // front hemisphere

          // Rotate the visible surface point around the vertical (Y) axis.
          const xr = nx * ca + nz * sa;
          const zr = -nx * sa + nz * ca;
          const lon = Math.atan2(xr, zr); // −π..π around the globe
          const lat = Math.asin(Math.max(-1, Math.min(1, ny))); // −π/2..π/2

          const u = lon / (2 * Math.PI) + 0.5;
          const v = 0.5 - lat / Math.PI;
          const tval = sample(u, v);
          if (tval < 0.04) continue;

          // Depth shading — limb darkens, center catches the light.
          const shade = tval * (0.42 + 0.58 * nz) * bright;
          const idx = Math.max(1, Math.min(ramp.length - 1, Math.floor(shade * (ramp.length - 1))));
          const ch = ramp[idx];
          if (ch === " ") continue;

          const alpha = (0.25 + 0.7 * shade).toFixed(3);
          // Amber at the bright core, brand orange across the body.
          ctx.fillStyle = shade > 0.72 ? `rgba(251,191,36,${alpha})` : `rgba(249,115,22,${alpha})`;
          ctx.fillText(ch, px - cw * 0.5, py - cell * 0.5);
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
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const loop = (ts: number) => {
      raf = requestAnimationFrame(loop);
      if (!t0) t0 = ts;
      if (reduce) {
        if (ready) {
          draw(0);
          cancelAnimationFrame(raf);
        }
        return;
      }
      if (ts - last < 40) return; // ~24fps, calm
      last = ts;
      draw((ts - t0) / 1000);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [src, cell, spinSpeed]);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
