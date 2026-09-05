"use client";

import gsap from "gsap";
import Image from "next/image";
import { useEffect, useRef } from "react";

type ArtworkVariant = "software" | "ai" | "creative" | "strategy" | "websites";

interface FloatingArtworkProps {
  src: string;
  alt: string;
  sizes?: string;
  className?: string;
  variant?: ArtworkVariant;
  decorative?: boolean;
}

const MOTION: Record<ArtworkVariant, { x: number; y: number; rotation: number; duration: number }> = {
  software: { x: 3, y: -10, rotation: 0.35, duration: 7.2 },
  ai: { x: -4, y: -8, rotation: -0.45, duration: 8.4 },
  creative: { x: 4, y: -9, rotation: 0.5, duration: 6.8 },
  strategy: { x: -3, y: -6, rotation: -0.3, duration: 9 },
  websites: { x: 2, y: -8, rotation: 0.25, duration: 7.8 },
};

export function FloatingArtwork({
  src,
  alt,
  sizes = "(max-width: 850px) 100vw, (max-width: 1200px) 50vw, 33vw",
  className = "",
  variant = "creative",
  decorative = false,
}: FloatingArtworkProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const artworkRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const artwork = artworkRef.current;
    if (!host || !artwork || typeof IntersectionObserver === "undefined") return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const compact = window.matchMedia("(max-width: 850px), (pointer: coarse)");
    let visible = false;
    let active = true;
    let context: gsap.Context | undefined;
    let tween: gsap.core.Tween | undefined;

    const syncPlayback = () => {
      if (active && visible && !document.hidden && !reducedMotion.matches) {
        tween?.play();
      } else {
        tween?.pause();
      }
    };

    const configureMotion = () => {
      context?.revert();
      context = undefined;
      tween = undefined;
      if (!active || reducedMotion.matches) return;

      const motion = MOTION[variant];
      // The portrait inset leaves room for movement without cropping the art.
      const distanceScale = compact.matches ? 0.4 : 1;
      try {
        context = gsap.context(() => {}, artwork);
        context.add(() => {
          tween = gsap.to(artwork, {
            x: motion.x * distanceScale,
            y: motion.y * distanceScale,
            rotation: motion.rotation * distanceScale,
            duration: motion.duration,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            paused: true,
            force3D: false,
          });
        });
      } catch {
        context?.revert();
        context = undefined;
        tween = undefined;
      }
      syncPlayback();
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false;
      syncPlayback();
    }, { threshold: 0 });

    observer.observe(host);
    reducedMotion.addEventListener("change", configureMotion);
    compact.addEventListener("change", configureMotion);
    document.addEventListener("visibilitychange", syncPlayback);
    configureMotion();

    return () => {
      active = false;
      observer.disconnect();
      reducedMotion.removeEventListener("change", configureMotion);
      compact.removeEventListener("change", configureMotion);
      document.removeEventListener("visibilitychange", syncPlayback);
      context?.revert();
      context = undefined;
      tween = undefined;
    };
  }, [variant, src]);

  return (
    <div ref={hostRef} data-floating-artwork={variant} className={`relative aspect-[4/5] w-full ${className}`}>
      <div ref={artworkRef} className="absolute inset-6 sm:inset-8">
        <Image src={src} alt={decorative ? "" : alt} aria-hidden={decorative || undefined} fill sizes={sizes} className="object-contain" draggable={false} />
      </div>
    </div>
  );
}
