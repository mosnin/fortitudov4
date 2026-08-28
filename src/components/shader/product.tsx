"use client";

import { motion, useInView } from "motion/react";
import Link from "next/link";
import { useRef, type ReactNode } from "react";
import { services } from "@/lib/services";
import { ArrowChip } from "./arrow-chip";
import { RevealHeadline } from "./reveal-headline";

const easeOutExpo = [0.33, 1, 0.68, 1] as const;

export function Product(): ReactNode {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.12 });

  return (
    <section ref={sectionRef} id="services" className="relative w-full bg-background py-32 text-foreground max-[850px]:py-24" aria-labelledby="product-heading">
      <div className="mx-auto max-w-[1680px] px-10 max-[850px]:px-6">
        <div className="grid grid-cols-12 gap-x-10 gap-y-6 max-[850px]:grid-cols-1">
          <div className="col-span-3 pt-2 max-[1100px]:col-span-12 max-[850px]:col-span-1">
            <motion.span initial={{ opacity: 0, y: 8 }} animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }} transition={{ duration: 0.6, ease: easeOutExpo }} className="inline-flex rounded-md border border-foreground/[0.08] px-3.5 py-1.5 font-mono text-xs uppercase tracking-widest text-foreground/70">What we build</motion.span>
          </div>
          <div className="col-span-7 col-start-6 max-[1100px]:col-span-12 max-[1100px]:col-start-1 max-[850px]:col-span-1">
            <RevealHeadline id="product-heading" delay={0.05} mutedFrom={9} className="text-balance text-[clamp(2rem,4.2vw,4rem)] font-medium leading-[0.9] tracking-tight">
              Five things we build for you, from first idea to launch.
            </RevealHeadline>
            <motion.p initial={{ opacity: 0, y: 8 }} animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }} transition={{ duration: 0.7, ease: easeOutExpo, delay: 0.18 }} className="mt-8 max-w-[60ch] text-base leading-relaxed text-foreground/65">
              Every engagement starts with a written scope and fixed price. Senior people do the work, you can watch it happen, and the finished build is yours.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 8 }} animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }} transition={{ duration: 0.7, ease: easeOutExpo, delay: 0.28 }} className="mt-10">
              <Link href="/services" className="group inline-flex items-stretch gap-1"><span className="rounded-md bg-foreground px-5 py-3 text-xs font-medium uppercase tracking-widest text-background">Explore services</span><ArrowChip className="bg-foreground text-background" /></Link>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="mt-24 grid grid-cols-5 max-[1100px]:grid-cols-1 max-[850px]:mt-16">
        {services.map((service, index) => {
          const Icon = service.icon;
          const featured = index === 0;
          return (
            <motion.article key={service.id} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }} transition={{ duration: 0.8, ease: easeOutExpo, delay: 0.38 + index * 0.07 }} className="relative flex">
              <Link href={`/services#${service.id.replaceAll("_", "-")}`} className={`group relative flex min-h-[400px] flex-1 flex-col justify-between p-9 transition-colors max-[1100px]:min-h-[260px] max-[850px]:p-8 ${featured ? "bg-accent text-accent-foreground" : index % 2 ? "bg-foreground/[0.08] text-foreground hover:bg-foreground/[0.12]" : "bg-foreground/[0.04] text-foreground hover:bg-foreground/[0.08]"}`}>
                <div className="flex items-start justify-between">
                  <Icon size={52} strokeWidth={0.8} className={featured ? "text-accent-foreground/85" : "text-foreground/70"} aria-hidden />
                  <span className={`font-mono text-xs tracking-[0.2em] ${featured ? "text-accent-foreground/55" : "text-foreground/40"}`}>{String(index + 1).padStart(2, "0")}.</span>
                </div>
                <div>
                  <h3 className="text-2xl font-medium leading-tight tracking-tight max-[850px]:text-xl">{service.name}</h3>
                  <p className={`mt-3 text-sm leading-relaxed ${featured ? "text-accent-foreground/70" : "text-foreground/60"}`}>{service.description}</p>
                  <span className={`mt-6 inline-block font-mono text-[11px] uppercase tracking-[0.18em] underline decoration-transparent underline-offset-4 transition-colors group-hover:decoration-current ${featured ? "text-accent-foreground/75" : "text-foreground/60"}`}>View service</span>
                </div>
              </Link>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
