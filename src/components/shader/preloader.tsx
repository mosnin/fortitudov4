"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { BrandMark } from "@/components/brand-mark";
import styles from "./preloader.module.css";

/**
 * Adapted from mosnin/autocontent, main a099a57ca7e5d14b5cb3b5d85783a4956213ecca,
 * web/components/marketing/home/hero.tsx (IntroLoader; blob bed7223283e152fb8e2a87f0bb574ab6c9b0749b).
 * Retains the oversized corner typography, eight accumulating image cards,
 * half-scale card entrances and soft fade. This is an optional introduction,
 * never an asset-readiness gate: the real page renders independently of it.
 */
const SESSION_KEY = "fortitudo:intro-seen:v1";
const SOFT_EASE = [0.22, 1, 0.36, 1] as const;
const IMAGES = [
  "/brand-stories/too-many-tools.webp",
  "/brand-stories/customer-conversations.webp",
  "/brand-stories/creative-presence.webp",
  "/brand-stories/next-chapter.webp",
  "/work/case-studies/stored.png",
  "/work/case-studies/chippi.png",
  "/work/case-studies/govern.png",
  "/work/case-studies/tellme.png",
] as const;
const STACK_COUNT = 8;
const COUNT_DURATION_MS = 800;
const FADE_START_MS = 1250;
const END_MS = 1950;

// Also covers navigation when a privacy setting blocks sessionStorage.
let introShownInTab = false;

type IntroState = { phase: "idle" | "playing" | "leaving"; progress: number };
const IDLE: IntroState = { phase: "idle", progress: 100 };

/** Mount beside the homepage hero, not around the page's content. */
export function Preloader({ onReveal }: { onReveal?: () => void }) {
  // Both SSR and the first hydration render contain no covering element.
  const [intro, setIntro] = useState<IntroState>(IDLE);
  const dismissRef = useRef<() => void>(() => {});

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches || introShownInTab) { onReveal?.(); return; }
    try {
      if (window.sessionStorage.getItem(SESSION_KEY)) { onReveal?.(); return; }
    } catch {
      // An inaccessible store must not prevent the page or intro from working.
    }

    let cancelled = false;
    let counter = 0;
    let fadeTimer = 0;
    let endTimer = 0;
    const dismiss = () => {
      window.clearInterval(counter);
      window.clearTimeout(fadeTimer);
      window.clearTimeout(endTimer);
      window.removeEventListener("wheel", dismiss);
      window.removeEventListener("touchstart", dismiss);
      window.removeEventListener("keydown", onKey);
      reduced.removeEventListener("change", dismiss);
      if (!cancelled) { onReveal?.(); setIntro(IDLE); }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.key === "Tab") dismiss();
    };
    dismissRef.current = dismiss;

    // Defer the session claim so Strict Mode's setup/cleanup replay cannot
    // leave an active overlay whose dismissal timers were already cancelled.
    const frame = window.requestAnimationFrame(() => {
      if (cancelled) return;
      if (reduced.matches || introShownInTab || window.scrollY > 32) { onReveal?.(); return; }
      introShownInTab = true;
      try {
        window.sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        // The in-memory flag still makes this a once-per-tab introduction.
      }

      const started = performance.now();
      setIntro({ phase: "playing", progress: 1 });
      counter = window.setInterval(() => {
        const progress = Math.min(100, Math.round(1 + ((performance.now() - started) / COUNT_DURATION_MS) * 99));
        setIntro({ phase: "playing", progress });
        if (progress === 100) window.clearInterval(counter);
      }, 28);
      fadeTimer = window.setTimeout(() => {
        window.clearInterval(counter);
        onReveal?.();
        setIntro({ phase: "leaving", progress: 100 });
      }, FADE_START_MS);
      endTimer = window.setTimeout(dismiss, END_MS);
      window.addEventListener("wheel", dismiss, { passive: true });
      window.addEventListener("touchstart", dismiss, { passive: true });
      window.addEventListener("keydown", onKey);
      reduced.addEventListener("change", dismiss);
    });

    return () => {
      cancelled = true;
      dismissRef.current = () => {};
      window.cancelAnimationFrame(frame);
      window.clearInterval(counter);
      window.clearTimeout(fadeTimer);
      window.clearTimeout(endTimer);
      window.removeEventListener("wheel", dismiss);
      window.removeEventListener("touchstart", dismiss);
      window.removeEventListener("keydown", onKey);
      reduced.removeEventListener("change", dismiss);
    };
  }, [onReveal]);

  if (intro.phase === "idle") return null;

  return (
    <motion.div
      data-fortitudo-intro
      initial={false}
      animate={{ opacity: intro.phase === "leaving" ? 0 : 1 }}
      transition={{ duration: 0.7, ease: SOFT_EASE }}
      className={styles.overlay}
    >
      <div aria-hidden="true" className={styles.artwork}>
        <p className={styles.headline}>Loading...</p>
        <div className={styles.stack}>
          {Array.from({ length: STACK_COUNT }, (_, index) => {
            const shown = intro.progress >= ((index + 1) * 100) / STACK_COUNT;
            return (
              <motion.div
                key={index}
                initial={false}
                animate={shown ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.5, ease: SOFT_EASE }}
                className={styles.card}
              >
                <BrandMark className={styles.cardMark} />
                <Image src={IMAGES[index % IMAGES.length]} alt="" fill sizes="170px" loading="eager" className={styles.image} />
              </motion.div>
            );
          })}
        </div>
        <div className={styles.brand}><BrandMark className={styles.mark} /><span>Fortitudo</span></div>
        <p className={styles.progress}>{intro.progress}</p>
      </div>
      <button type="button" className={styles.skip} onClick={() => dismissRef.current()}>Skip introduction</button>
    </motion.div>
  );
}
