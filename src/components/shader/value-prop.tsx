"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { RollingArrow } from "@/components/shader/arrow-chip";
import { useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import { WaveShader, type WaveParams, type WaveShaderHandle } from "./wave-shader";

const STEPS = [
  {
    eyebrow: "Turn interest into action.",
    body: "Give people a clear reason to buy, book, or get in touch—and an easy way to do it.",
  },
  {
    eyebrow: "Get your time back.",
    body: "Connect the tools, handoffs, and repetitive work that keep pulling you away from the business.",
  },
  {
    eyebrow: "Build what comes next.",
    body: "Launch the store, app, or platform you have been putting off with a team that can handle the hard parts.",
  },
];

const REVEAL = 0.7;
const DWELL = 0.3;
const STEP_DURATION = REVEAL + DWELL;

// The purchased Shader theme's three original ribbon shapes.
const STEP_PRESETS: WaveParams[] = [
  { amp: 0.16, freq: 1.0, complexity: 0.85, speed: 0.55, thickness: 0.07, hue: 0.05, curve: -0.18, warp: 0.10, chroma: 0.65, bias: 0.04 },
  { amp: 0.26, freq: 0.45, complexity: 0.45, speed: 0.40, thickness: 0.11, hue: 0.30, curve: 0.22, warp: 0.03, chroma: 0.90, bias: -0.02 },
  { amp: 0.10, freq: 0.32, complexity: 0.20, speed: 0.22, thickness: 0.16, hue: 0.65, curve: 0.05, warp: 0.0, chroma: 0.95, bias: 0.0 },
];

const DESKTOP_ANIMATION = "(min-width: 851px) and (min-height: 700px) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

export function ValueProp(): ReactNode {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const wordRefs = useRef<(HTMLSpanElement | null)[][]>(STEPS.map(() => []));
  const waveRef = useRef<WaveShaderHandle>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const pin = pinRef.current;
    const bar = progressBarRef.current;
    if (!section || !pin || !bar) return;

    const media = window.matchMedia(DESKTOP_ANIMATION);
    let restore: (() => void) | undefined;

    const updatePresentation = () => {
      restore?.();
      restore = undefined;
      // Native scrolling and readable panels are also the unhydrated default.
      if (!media.matches) return;
      const panels = stepRefs.current.filter((panel) => panel !== null);
      if (panels.length !== STEPS.length || wordRefs.current.some((words) => !words.length || words.some((word) => !word))) return;

      let context: gsap.Context | undefined;
      let timeline: gsap.core.Timeline | undefined;
      const reset = () => {
        try {
          timeline?.scrollTrigger?.kill(true);
          timeline?.kill();
          context?.revert();
          // Also remove a partially constructed trigger if initialization threw.
          ScrollTrigger.getAll()
            .filter((trigger) => trigger.vars.trigger === section)
            .forEach((trigger) => trigger.kill(true));
        } catch {
          // Even an interrupted animation cleanup must restore native flow.
        } finally {
          delete section.dataset.enhanced;
          pin.removeAttribute("style");
          panels.forEach((panel) => panel.removeAttribute("style"));
          wordRefs.current.flat().forEach((word) => word?.removeAttribute("style"));
          bar.style.transform = "scaleX(0)";
          const spacer = pin.parentElement;
          if (spacer?.classList.contains("pin-spacer")) {
            spacer.before(pin);
            spacer.remove();
          }
          waveRef.current?.setParams(STEP_PRESETS[0]!);
        }
      };
      restore = reset;

      try {
        gsap.registerPlugin(ScrollTrigger);
        context = gsap.context(() => {}, section);
        context.add(() => {
          section.dataset.enhanced = "true";
          gsap.set(bar, { scaleX: 0, transformOrigin: "0 0" });
          panels.forEach((panel, index) => gsap.set(panel, { autoAlpha: index === 0 ? 1 : 0 }));
          wordRefs.current.forEach((words) => gsap.set(words, { color: "rgba(250,250,250,0.65)" }));

          let activeStep = 0;
          timeline = gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: () => `+=${window.innerHeight * STEPS.length}`,
              scrub: true,
              pin,
              pinSpacing: true,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                gsap.set(bar, { scaleX: self.progress });
                const nextStep = Math.min(STEPS.length - 1, Math.floor(self.progress * STEPS.length));
                if (nextStep !== activeStep) {
                  activeStep = nextStep;
                  // Keep one complete panel visible even during a fast scroll.
                  panels.forEach((panel, index) => gsap.set(panel, { autoAlpha: index === activeStep ? 1 : 0 }));
                }
              },
            },
          });

          const waveShape = { ...STEP_PRESETS[0]! };
          STEPS.forEach((_, index) => {
            const start = index * STEP_DURATION;
            if (index > 0) {
              timeline!.to(waveShape, {
                ...STEP_PRESETS[index]!,
                duration: STEP_DURATION,
                ease: "power2.inOut",
                onUpdate: () => waveRef.current?.setParams(waveShape),
              }, start - STEP_DURATION * 0.5);
            }
            const words = wordRefs.current[index]!;
            const perWord = REVEAL / words.length;
            words.forEach((word, wordIndex) => {
              timeline!.to(word, { color: "rgba(250,250,250,1)", duration: perWord, ease: "none" }, start + wordIndex * perWord);
            });
            timeline!.to({}, { duration: DWELL }, start + REVEAL);
          });
          timeline.scrollTrigger?.refresh();
          timeline.scrollTrigger?.update();
        });
      } catch {
        reset();
        restore = undefined;
      }
    };

    updatePresentation();
    media.addEventListener("change", updatePresentation);
    return () => {
      media.removeEventListener("change", updatePresentation);
      restore?.();
    };
  }, []);

  return (
    <section ref={sectionRef} className="group/value-prop relative bg-background text-foreground" aria-labelledby="business-outcomes-heading">
      <div ref={pinRef} className="relative w-full overflow-hidden pb-12 group-data-[enhanced=true]/value-prop:h-[100svh] group-data-[enhanced=true]/value-prop:pb-0">
        <div className="absolute inset-x-0 top-0 z-20 h-px bg-foreground/10" aria-hidden="true">
          <div ref={progressBarRef} className="h-full w-full bg-accent" style={{ transform: "scaleX(0)", transformOrigin: "0 0" }} />
        </div>

        <div className="relative z-10 mx-auto flex max-w-[1680px] items-end justify-between gap-10 px-10 pt-28 max-[850px]:flex-col max-[850px]:items-start max-[850px]:gap-6 max-[850px]:px-6 max-[850px]:pt-16">
          <h2 id="business-outcomes-heading" className="max-w-[22ch] text-[clamp(1.75rem,2.4vw,2.25rem)] font-medium leading-[1.15] tracking-tight text-foreground/90">
            Your business is ready for more. Your systems should be, too.
          </h2>
          <div className="max-w-[45ch]">
            <p className="text-base leading-relaxed text-foreground/75">
              A great product can still get lost in a confusing website. A busy team can still lose hours to disconnected tools. We fix the parts that get between you and your next customer.
            </p>
            <Link href="/contact" className="group mt-5 inline-flex items-center gap-3 rounded-md border border-foreground/20 px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-foreground/50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">
              Talk through your project
              <RollingArrow iconSize={16} />
            </Link>
          </div>
        </div>

        <div data-value-prop-wave="" className="pointer-events-none relative z-0 mt-5 h-44 w-full group-data-[enhanced=true]/value-prop:absolute group-data-[enhanced=true]/value-prop:inset-x-0 group-data-[enhanced=true]/value-prop:bottom-0 group-data-[enhanced=true]/value-prop:mt-0 group-data-[enhanced=true]/value-prop:h-[58%]" aria-hidden="true">
          <WaveShader ref={waveRef} dark initialParams={STEP_PRESETS[0]} />
        </div>

        {STEPS.map((step, index) => (
          <div
            key={step.eyebrow}
            data-value-prop-panel=""
            ref={(element) => { stepRefs.current[index] = element; }}
            className="relative z-10 px-10 py-10 max-[850px]:px-6 group-data-[enhanced=true]/value-prop:absolute group-data-[enhanced=true]/value-prop:inset-0 group-data-[enhanced=true]/value-prop:pointer-events-none group-data-[enhanced=true]/value-prop:pt-80"
          >
            <div className="mx-auto grid max-w-[1600px] grid-cols-12 gap-8 max-[850px]:grid-cols-1 max-[850px]:gap-6">
              <div className="col-span-3 max-[850px]:col-span-1">
                <span className="inline-flex items-center rounded-md border border-foreground/15 px-3.5 py-1.5 font-mono text-xs tracking-widest text-foreground/75">
                  {String(index + 1).padStart(2, "0")}
                  <span className="mx-1.5 text-foreground/60">/</span>
                  {String(STEPS.length).padStart(2, "0")}
                </span>
                <h3 className="mt-6 font-mono text-xs uppercase leading-relaxed tracking-[0.2em] text-foreground/75">{step.eyebrow}</h3>
              </div>
              <p className="col-span-9 text-[clamp(2rem,4.2vw,4rem)] font-medium leading-[1.1] tracking-tight max-[850px]:col-span-1">
                {step.body.split(" ").map((word, wordIndex, words) => (
                  <span key={wordIndex}>
                    <span ref={(element) => { wordRefs.current[index]![wordIndex] = element; }}>{word}</span>
                    {wordIndex < words.length - 1 ? " " : ""}
                  </span>
                ))}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
