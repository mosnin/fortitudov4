"use client";
import { ArrowButton } from "./arrow-button";
/* eslint-disable @next/next/no-img-element -- Keep direct visual children required by the supplied media controller. */
import { createElement, useContext, useEffect, useRef } from "react";
import { cinematicMediaHero } from "./effects/cinematic-media-hero";

import { MotionControlContext } from "./lib/motion";

const BASE = "https://www.details.so/vault-previews/section-04/media/";
// Temporary supplied media. Keep this one list as the media/thumbnail ordering source.
const MEDIA = [
  { kind: "video", preview: "poster.webp", label: "Show film" },
  { kind: "image", preview: "media-02.webp", label: "Show second visual" },
  { kind: "image", preview: "media-03.webp", label: "Show third visual" },
];
export function CinematicHero() {
  const root = useRef<HTMLElement>(null);
  const { paused } = useContext(MotionControlContext);
  useEffect(() => {
    if (!root.current) return;
    root.current.dataset.motionPaused = String(paused);
    root.current.dispatchEvent(new Event("hero-playback-change"));
  }, [paused]);
  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;
    document.fonts.ready.then(() => {
      if (cancelled || !root.current?.parentElement) return;
      cleanup = cinematicMediaHero(root.current.parentElement, { smoothScroll: false });
    });
    return () => { cancelled = true; cleanup?.(); };
  }, []);
  return (
    <section ref={root} className="hero-section-01" data-hero-section-01 data-intro-phase="loading" aria-label="Fortitudo introduction">
      <div className="media" aria-live="polite">
        {MEDIA.map((item, i) => <div key={item.preview} className={`item${i === 0 ? " active" : ""}`}>
          {item.kind === "video" ? <video poster={BASE + item.preview} autoPlay={i === 0} muted loop playsInline preload={i === 0 ? "auto" : "metadata"}>
            <source src={BASE + "video-mobile.webm"} type="video/webm" media="(max-width: 700px)" />
            <source src={BASE + "video-mobile.mp4"} type="video/mp4" media="(max-width: 700px)" />
            <source src={BASE + "video.webm"} type="video/webm" />
            <source src={BASE + "video.mp4"} type="video/mp4" />
          </video> : <img src={BASE + item.preview} alt="" />}
        </div>)}
      </div>
      <div className="content">
        <h1>Websites. Products. Applied AI.</h1>
        <p>Design and development for businesses and product teams. <span>From the first brief to a working website, store or product. One team for the design, the build and the handover.</span></p>
        <ArrowButton href="/contact" className="home-hero-cta">Discuss your project</ArrowButton>
        <span className="divider" aria-hidden="true" />
        <div className="thumbs" aria-label="Choose hero media">
          {MEDIA.map((item, i) => <button key={item.preview} className={i === 0 ? "active" : ""} type="button" aria-label={item.label} aria-pressed={i === 0}><img src={BASE + item.preview} alt="" /></button>)}
        </div>
      </div>
      <div className="loader" aria-hidden="true"><div className="panel" /><div className="panel" /><div className="progress"><span className="line" />{createElement("number-flow", { className: "count nf-number", "data-will-change": "" })}</div></div>
    </section>
  );
}
