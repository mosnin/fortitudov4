"use client";

import { features } from "@/components/shader/lib/config";
import Lenis from "lenis";
import { useEffect, type ReactNode } from "react";

const LENIS_OPTIONS = {
  duration: 1.6,
  easing: (t: number): number => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  orientation: "vertical" as const,
  gestureOrientation: "vertical" as const,
  smoothWheel: true,
  wheelMultiplier: 1,
  touchMultiplier: 2,
};

const ANCHOR_OFFSET = -100;

export function SmoothScroll({ children }: { children: ReactNode }): ReactNode {
  useEffect(() => {
    if (!features.smoothScroll) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const usesTouchScrolling = window.matchMedia("(pointer: coarse)").matches;
    if (prefersReducedMotion || usesTouchScrolling) return;

    const lenis = new Lenis(LENIS_OPTIONS);

    const MAX_DT = 50;
    let synthTime = 0;
    let lastReal = performance.now();
    let frame = 0;
    let active = true;

    function raf(time: number): void {
      if (!active) return;
      const dt = time - lastReal;
      lastReal = time;

      synthTime += Math.max(0, Math.min(dt, MAX_DT));
      lenis.raf(synthTime);
      frame = requestAnimationFrame(raf);
    }
    frame = requestAnimationFrame(raf);

    function handleAnchorClick(event: MouseEvent): void {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest('a[href^="#"]');
      if (!(anchor instanceof HTMLAnchorElement) || anchor.target || anchor.hasAttribute("download")) return;
      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;
      let id: string;
      try {
        id = decodeURIComponent(href.slice(1));
      } catch {
        return;
      }
      const element = document.getElementById(id);
      if (!element) return;
      event.preventDefault();
      lenis.scrollTo(element, { offset: ANCHOR_OFFSET });
    }

    document.addEventListener("click", handleAnchorClick);
    return () => {
      active = false;
      cancelAnimationFrame(frame);
      document.removeEventListener("click", handleAnchorClick);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
