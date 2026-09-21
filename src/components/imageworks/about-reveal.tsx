"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { HeroVideo } from "./hero-video";
import { hero01 } from "./effects/library/hero01";
import { textReveal01 } from "./effects/library/textReveal01";
export function AboutReveal() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    let disposed = false;
    let context: gsap.Context | undefined;
    let cleanup: (() => void) | undefined;
    document.fonts.ready.then(() => {
      if (disposed || !ref.current) return;
      const scope = ref.current;
      context = gsap.context(() => { hero01(scope); cleanup = textReveal01(scope, 2.24); }, scope);
    });
    return () => { disposed = true; cleanup?.(); context?.revert(); };
  }, []);
  return <section className="hero-01 about-reveal" ref={ref} aria-label="About Fortitudo">
    <div className="hero-01__media" data-hero-01-media>
      <HeroVideo className="hero-01__image" />
      <div className="hero-01__overlay" data-hero-01-overlay />
    </div>
    <div className="hero-01__content"><h1 data-reveal-01="lines">Built on experience.<br/>Made for what comes next.</h1><div className="hero-01__bottom"><p data-reveal-01="lines">More than a decade bringing businesses to life through design, development and the practical application of technology.</p><span>About Fortitudo</span></div></div>
  </section>;
}
