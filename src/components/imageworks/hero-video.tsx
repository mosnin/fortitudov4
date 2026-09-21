"use client";
import { useContext, useEffect, useRef } from "react";
import { MotionControlContext } from "./lib/motion";
export const HERO_MEDIA = "https://www.details.so/vault-previews/section-04/media/";
/** Shared temporary film; swap this source when final page films are supplied. */
export function HeroVideo({ className = "page-hero-video" }: { className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const motion = useContext(MotionControlContext);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    let visible = true;
    const sync = () => {
      if (visible && !document.hidden && !motion?.paused) video.play().catch(() => {});
      else video.pause();
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    observer.observe(video);
    document.addEventListener("visibilitychange", sync);
    sync();
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", sync); video.pause(); };
  }, [motion?.paused]);
  return <video ref={ref} className={className} autoPlay muted loop playsInline preload="auto" poster={HERO_MEDIA+"poster.webp"} aria-hidden="true">
    <source src={HERO_MEDIA+"video-mobile.webm"} type="video/webm" media="(max-width: 700px)"/>
    <source src={HERO_MEDIA+"video-mobile.mp4"} type="video/mp4" media="(max-width: 700px)"/>
    <source src={HERO_MEDIA+"video.webm"} type="video/webm"/>
    <source src={HERO_MEDIA+"video.mp4"} type="video/mp4"/>
  </video>;
}
