"use client";
import Link from "next/link";

import { DotField } from "@/components/imageworks/dot-field";
import { ImageArc } from "@/components/imageworks/image-arc";
import { Reveal } from "@/components/imageworks/reveal";
import { ArrowRight } from "lucide-react";
import { useCallback, useEffect, useState, type ReactNode } from "react";

export function Hero(): ReactNode {
  const [arcSettled, setArcSettled] = useState(false);
  useEffect(() => {
    const fallback = window.setTimeout(() => setArcSettled(true), 2200);
    return () => window.clearTimeout(fallback);
  }, []);
  const onSettled = useCallback(() => setArcSettled(true), []);

  return (
    <section
      id="hero"
      aria-label="Hero"
      className="relative grid min-h-[100dvh] grid-rows-[1fr_auto_calc(var(--u)*12)_auto_1fr] [overflow-x:clip] [--u:2.2vw] sm:[--u:1.5vw] lg:[--u:min(1vw,16px)]"
    >
      <DotField stageId="hero-stage" />
      <ImageArc stageId="hero-stage" onSettled={onSettled} />

      <div className="relative z-10 row-start-2 flex items-end justify-center px-5 pb-[calc(var(--u)*3.5)] sm:pb-[calc(var(--u)*3)]">
        <Reveal when={arcSettled} y={10} scale={0.75} duration={1.1}>
          <h1 className="text-center font-sans text-[min(2.5rem,10.25vw)] leading-[1.02] tracking-[-0.02em] text-foreground sm:text-[3.5rem] lg:text-[4.25rem]">
            Websites. Products.
            <br />
            Applied AI.
          </h1>
        </Reveal>
      </div>

      <div id="hero-stage" className="row-start-3" />

      <div className="relative z-10 row-start-4 flex flex-col items-center px-5 pt-[calc(var(--u)*2.5)] text-center sm:pt-[calc(var(--u)*3)]">
        <Reveal when={arcSettled} y={10} scale={0.75} duration={1.1}>
          <p className="max-w-[26rem] text-[15px] leading-6 text-pretty text-foreground/80 sm:text-base sm:leading-7">
            <span className="text-foreground">
              Design and development by Fortitudo.
            </span>{" "}
            From the first brief to a working website, store or product.
            One team for the design, the build and the handover.
          </p>
        </Reveal>
        <Reveal
          when={arcSettled}
          delay={0.1}
          y={10}
          scale={0.75}
          duration={1.1}
          className="mt-7"
        >
          <Link
            href="/contact"
            className="group inline-flex h-12 items-center gap-2.5 rounded-xl bg-foreground pr-4 pl-5 text-[15px] font-medium text-background shadow-[0_1px_0_rgba(255,255,255,0.08)_inset,0_12px_32px_-14px_rgba(0,0,0,0.45)] transition-[transform,opacity] hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.98]"
          >
            Discuss your project
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
