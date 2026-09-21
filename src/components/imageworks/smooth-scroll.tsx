"use client";

import { features } from "@/components/imageworks/lib/config";
import { useReducedMotion } from "./lib/motion";
import Lenis from "lenis";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import gsap from "gsap";
export const siteScroll: { current: Lenis | null } = { current: null };
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

export function SmoothScroll({ children }: { children: ReactNode }): ReactNode {
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    if (!features.smoothScroll) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReducedMotion || reducedMotion) return;

    gsap.registerPlugin(ScrollTrigger);
    const lenis = new Lenis(LENIS_OPTIONS);
    siteScroll.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);

    let frame = 0;
    function raf(time: number): void {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    }
    frame = requestAnimationFrame(raf);

    function handleAnchorClick(event: MouseEvent): void {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest('a[href^="#"]');
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;
      const element = document.querySelector(href);
      if (!(element instanceof HTMLElement)) return;
      event.preventDefault();

      lenis.scrollTo(element);
    }

    document.addEventListener("click", handleAnchorClick);
    return () => {
      document.removeEventListener("click", handleAnchorClick);
      cancelAnimationFrame(frame);
      lenis.off("scroll", ScrollTrigger.update);
      siteScroll.current = null;
      lenis.destroy();
    };
  }, [reducedMotion]);

  return <>{children}</>;
}
