import Link from "next/link";
import { DotField } from "@/components/imageworks/dot-field";
import { Reveal } from "@/components/imageworks/reveal";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

const SIGN_UP = "/contact";

export function FinalCta(): ReactNode {
  return (
    <section
      aria-labelledby="cta-heading"
      className="relative overflow-hidden bg-background pt-32 pb-32 sm:pt-40 sm:pb-40"
    >
      <DotField stageId="cta-copy" alpha={0.6} />
      <div
        id="cta-copy"
        className="relative mx-auto max-w-[1440px] px-4 text-center sm:px-6"
      >
        <Reveal inView y={12} scale={0.96} duration={1}>
          <div id="cta-stage">
            <h2
              id="cta-heading"
              className="mx-auto max-w-4xl font-sans text-[clamp(2.75rem,5.6vw,4.75rem)] leading-[1.0] tracking-[-0.025em] text-balance"
            >
              Tell us what you
              <br className="hidden sm:block" /> want to build.
            </h2>
          </div>
        </Reveal>
        <Reveal inView delay={0.1} y={12} scale={0.96} duration={1}>
          <p className="mx-auto mt-7 max-w-md text-[15px] leading-7 text-muted-foreground sm:text-base">
            Bring your current site or product, what needs to change, and your
            target date. We will put the proposed scope, milestones and price in
            writing.
          </p>
        </Reveal>
        <Reveal
          inView
          delay={0.18}
          y={12}
          scale={0.96}
          duration={1}
          className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Link
            href={SIGN_UP}
            className="group inline-flex h-12 items-center justify-center gap-2.5 rounded-xl bg-foreground pr-4 pl-5 text-[15px] font-medium text-background shadow-[0_1px_0_rgba(255,255,255,0.08)_inset,0_12px_32px_-14px_rgba(0,0,0,0.45)] transition-[transform,opacity] hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.98]"
          >
            Request a proposal
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </Link>
          <Link
            href="/work"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-foreground/[0.06] px-5 text-[15px] font-medium text-foreground transition-colors hover:bg-foreground/[0.1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring dark:bg-white/[0.1] dark:hover:bg-white/[0.14]"
          >
            Explore the work
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
