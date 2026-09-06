"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "motion/react";
import { useRef, type ReactNode } from "react";
import { RollingArrow } from "@/components/shader/arrow-chip";
import { useReducedMotionSafe } from "@/hooks/use-reduced-motion-safe";
import { WORK_PROJECTS } from "@/lib/work-projects";

const easeOutExpo = [0.33, 1, 0.68, 1] as const;
const FEATURED = WORK_PROJECTS[0];

type WordmarkStyle = "serif" | "mono" | "sans" | "sansBold" | "sansLight" | "italic";
const PARTNER_STYLES: Record<string, WordmarkStyle> = {
  stored: "sans",
  chippi: "sansBold",
  "never-age": "serif",
  "two-cookies": "mono",
  "nourish-reserve": "serif",
  "hannah-joy": "italic",
  govern: "sansBold",
  tellme: "sansLight",
};

const WORDMARK_STYLES: Record<WordmarkStyle, string> = {
  serif: "font-serif font-medium tracking-tight",
  mono: "font-mono tracking-tight lowercase",
  sans: "font-sans font-medium tracking-tight",
  sansBold: "font-sans font-semibold tracking-tight uppercase",
  sansLight: "font-sans font-light tracking-tight lowercase",
  italic: "font-serif italic font-medium tracking-tight lowercase",
};

function CornerBrackets(): ReactNode {
  const base = "absolute h-[10px] w-[10px] border-accent-foreground/30 transition-all duration-300 ease-[cubic-bezier(0.33,1,0.68,1)] group-hover:border-accent-foreground group-focus-within:border-accent-foreground motion-reduce:transition-none";
  return (
    <>
      <span className={`${base} left-0 top-0 border-l border-t group-hover:-left-1.5 group-hover:-top-1.5 group-focus-within:-left-1.5 group-focus-within:-top-1.5`} aria-hidden />
      <span className={`${base} right-0 top-0 border-r border-t group-hover:-right-1.5 group-hover:-top-1.5 group-focus-within:-right-1.5 group-focus-within:-top-1.5`} aria-hidden />
      <span className={`${base} bottom-0 left-0 border-b border-l group-hover:-bottom-1.5 group-hover:-left-1.5 group-focus-within:-bottom-1.5 group-focus-within:-left-1.5`} aria-hidden />
      <span className={`${base} bottom-0 right-0 border-b border-r group-hover:-bottom-1.5 group-hover:-right-1.5 group-focus-within:-bottom-1.5 group-focus-within:-right-1.5`} aria-hidden />
    </>
  );
}

/** Original shader.zip partners band, with real Fortitudo projects. */
export function Partners(): ReactNode {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.15 });
  const reduceMotion = useReducedMotionSafe();
  const settled = inView || reduceMotion;

  return (
    <section ref={sectionRef} className="relative w-full rounded-[50px] bg-accent text-accent-foreground" aria-labelledby="partners-heading">
      <div className="mx-auto max-w-[1680px] px-10 py-24 max-[850px]:px-6 max-[850px]:py-20">
        <motion.div initial={false} animate={{ y: settled ? 0 : 8 }} transition={{ duration: reduceMotion ? 0 : 0.6, ease: easeOutExpo }}>
          <h2 id="partners-heading" className="inline-flex items-center rounded-md border border-accent-foreground/[0.08] px-3.5 py-1.5 font-mono text-xs uppercase tracking-widest text-accent-foreground/70">Our work</h2>
        </motion.div>

        <div className="mt-6 h-px w-full bg-accent-foreground/15" />

        <motion.div
          initial={false}
          animate={{ y: settled ? 0 : 24 }}
          transition={{ duration: reduceMotion ? 0 : 0.8, ease: easeOutExpo, delay: reduceMotion ? 0 : 0.1 }}
          className="mt-16 grid grid-cols-12 gap-6 rounded-2xl bg-background p-3 text-foreground max-[850px]:mt-10 max-[850px]:gap-6 max-[850px]:p-3"
        >
          <div className="col-span-7 flex flex-col p-7 max-[1100px]:col-span-12 max-[850px]:p-4">
            <h3 className="text-[clamp(1.75rem,3vw,2.5rem)] font-medium leading-[1.05] tracking-tight">{FEATURED.name}</h3>
            <p className="mt-6 max-w-[42ch] text-balance text-base leading-relaxed text-foreground/75 max-[850px]:text-sm">Explore the published product, its purpose, and the live site. The projects below cover storefronts, software, and AI.</p>
            <p className="mt-4 max-w-[42ch] text-balance text-base leading-relaxed text-foreground/75 max-[850px]:text-sm">{FEATURED.blurb}</p>
            <Link href={`/work/${FEATURED.slug}`} className="group mt-auto inline-flex items-center gap-3 self-start pt-12 font-mono text-xs uppercase tracking-[0.2em] text-foreground/80 transition-colors duration-200 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent max-[850px]:pt-8">
              Explore the project
              <span aria-hidden className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-accent text-accent-foreground"><RollingArrow iconSize={12} strokeWidth={2.2} /></span>
            </Link>
          </div>

          <Link href={`/work/${FEATURED.slug}`} aria-label={`Explore the ${FEATURED.name} case study`} className="relative col-span-5 flex min-h-[180px] items-center justify-center overflow-hidden rounded-xl bg-foreground p-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent max-[1100px]:col-span-12 max-[1100px]:aspect-[16/10] max-[850px]:min-h-[140px]">
            <div className="absolute inset-3 overflow-hidden rounded-lg">
              <Image src={FEATURED.image} alt={FEATURED.imageAlt} fill sizes="(min-width: 1101px) 40vw, 90vw" className="object-cover object-top" />
            </div>
            <span className="absolute bottom-5 right-5 rounded-md bg-background px-2.5 py-1.5 text-[10px] font-medium text-foreground">{FEATURED.imageLabel}</span>
          </Link>
        </motion.div>

        <div className="mt-20 grid grid-cols-4 gap-x-12 gap-y-16 max-[1100px]:grid-cols-3 max-[1100px]:gap-x-8 max-[1100px]:gap-y-12 max-[850px]:mt-14 max-[850px]:grid-cols-2 max-[850px]:gap-x-6 max-[850px]:gap-y-10">
          {WORK_PROJECTS.map((partner, index) => (
            <motion.div
              key={partner.slug}
              initial={false}
              animate={{ y: settled ? 0 : 16 }}
              transition={{ duration: reduceMotion ? 0 : 0.6, ease: easeOutExpo, delay: reduceMotion ? 0 : 0.32 + index * 0.04 }}
              className="group relative flex aspect-[5/2] items-center justify-center"
            >
              <Link href={`/work/${partner.slug}`} aria-label={`Read the ${partner.name} case study`} className="absolute inset-0 flex items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-accent-foreground">
                <CornerBrackets />
                <span aria-hidden className="pointer-events-none absolute inset-0 origin-bottom scale-y-0 bg-accent-foreground/[0.08] transition-transform duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] group-hover:scale-y-100 group-focus-within:scale-y-100 motion-reduce:transition-none" />
                <span className={["relative select-none px-3 text-center text-[clamp(1rem,1.5vw,1.4rem)] leading-tight text-accent-foreground/85 transition-colors duration-300 group-hover:text-accent-foreground group-focus-within:text-accent-foreground motion-reduce:transition-none", WORDMARK_STYLES[PARTNER_STYLES[partner.slug] ?? "sans"]].join(" ")}>
                  {partner.name}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
