"use client";

import { useRef, type ReactNode } from "react";
import Link from "next/link";
import { motion, useInView } from "motion/react";
import { Check, Compass, Layers, Zap } from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/use-reduced-motion-safe";
import type { ServicePage } from "@/lib/service-pages";
import type { WorkProject } from "@/lib/work-projects";
import { PageHero } from "./page-hero";
import { RevealHeadline } from "./reveal-headline";
import { ArrowChip } from "./arrow-chip";
import { WorkGrid } from "./work-grid";
import { Faq } from "./faq";
import { FinalCta } from "./final-cta";

const easeOutExpo = [0.33, 1, 0.68, 1] as const;
const OUTCOME_ICONS = [Compass, Layers, Zap];

function InViewBlock({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });
  const reduceMotion = useReducedMotionSafe();

  return <motion.div ref={ref} initial={false} animate={{ y: inView || reduceMotion ? 0 : 16 }} transition={{ duration: reduceMotion ? 0 : 0.8, ease: easeOutExpo, delay: reduceMotion ? 0 : delay }} className={className}>{children}</motion.div>;
}

function DetailIntro({ eyebrow, title, body, id }: { eyebrow: string; title: string; body: string; id: string }) {
  return (
    <div className="grid grid-cols-12 gap-x-10 gap-y-6 max-[850px]:grid-cols-1">
      <div className="col-span-3 pt-2 max-[1100px]:col-span-12 max-[850px]:col-span-1">
        <InViewBlock><span className="inline-flex rounded-md border border-foreground/[0.08] px-3.5 py-1.5 font-mono text-xs uppercase tracking-widest text-foreground/70">{eyebrow}</span></InViewBlock>
      </div>
      <div className="col-span-7 col-start-6 max-[1100px]:col-span-12 max-[1100px]:col-start-1 max-[850px]:col-span-1">
        <RevealHeadline id={id} delay={0.05} className="text-balance text-[clamp(2rem,4.2vw,4rem)] font-medium leading-[0.9] tracking-tight">{title}</RevealHeadline>
        <InViewBlock delay={0.18}><p className="mt-6 max-w-[60ch] text-balance text-xl font-light leading-snug text-foreground/75 max-[850px]:text-lg">{body}</p></InViewBlock>
      </div>
    </div>
  );
}

function ContactLink({ children }: { children: ReactNode }) {
  return (
    <Link href="/contact" className="group/cta inline-flex max-w-full items-stretch gap-1">
      <span className="rounded-md bg-foreground px-5 py-3 text-xs font-medium uppercase tracking-widest text-background">{children}</span>
      <ArrowChip className="bg-foreground text-background" name="cta" />
    </Link>
  );
}

export function ServiceDetail({ service, projects }: { service: ServicePage; projects: WorkProject[] }) {
  return (
    <>
      <PageHero eyebrow={service.name} title={service.title} lead={service.lead} cta={{ label: "Talk through your project", href: "/contact" }} secondaryCta={{ label: "Explore the work", href: "#service-work" }} />

      <section className="relative w-full bg-background text-foreground" aria-labelledby="service-story-heading">
        <div className="mx-auto max-w-[1680px] px-10 py-32 max-[850px]:px-6 max-[850px]:py-24">
          <DetailIntro id="service-story-heading" eyebrow={service.narrative.eyebrow} title={service.narrative.title} body={service.narrative.body} />
          <InViewBlock className="mt-10">
            <p className="max-w-[85ch] border-t border-foreground/15 pt-7 text-lg leading-relaxed text-foreground/80">{service.narrative.costOfWaiting}</p>
          </InViewBlock>
        </div>
      </section>

      <section className="relative w-full bg-background text-foreground" aria-labelledby="service-outcomes-heading">
        <div className="mx-auto max-w-[1680px] px-10 py-32 max-[850px]:px-6 max-[850px]:py-24">
          <DetailIntro id="service-outcomes-heading" eyebrow="What changes for you" title={service.outcomesHeading} body={service.outcomesLead} />
          <div className="mt-20 grid grid-cols-3 gap-5 max-[1100px]:grid-cols-1 max-[1100px]:gap-4 max-[850px]:mt-12">
            {service.outcomes.map((outcome, index) => {
              const Icon = OUTCOME_ICONS[index % OUTCOME_ICONS.length];
              const featured = index === 0;
              return (
                <InViewBlock key={outcome.tag} delay={0.25 + index * 0.08} className="relative flex">
                  <article className={`group relative flex min-h-[360px] flex-1 flex-col justify-between rounded-2xl p-8 transition-colors duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] max-[850px]:min-h-[280px] max-[850px]:p-6 ${featured ? "bg-accent text-accent-foreground" : "bg-foreground/[0.04] text-foreground hover:bg-foreground/[0.06]"}`}>
                    <div className={`flex h-10 w-10 items-center justify-center rounded-md transition-transform duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] group-hover:rotate-[-6deg] group-hover:scale-[1.05] ${featured ? "bg-accent-foreground/10 text-accent-foreground" : "bg-foreground/10 text-foreground"}`} aria-hidden><Icon className="h-5 w-5" strokeWidth={1.6} /></div>
                    <div className="mt-10">
                      <p className={`font-mono text-xs uppercase tracking-[0.2em] ${featured ? "text-accent-foreground/70" : "text-foreground/70"}`}>{outcome.tag}</p>
                      <h3 className="mt-3 text-2xl font-medium leading-tight tracking-tight max-[850px]:text-xl">{outcome.title}</h3>
                      <p className={`mt-3 text-sm leading-relaxed ${featured ? "text-accent-foreground/80" : "text-foreground/75"}`}>{outcome.body}</p>
                    </div>
                  </article>
                </InViewBlock>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative w-full bg-background text-foreground" aria-labelledby="service-scope-heading">
        <div className="mx-auto max-w-[1680px] px-10 py-32 max-[850px]:px-6 max-[850px]:py-24">
          <DetailIntro id="service-scope-heading" eyebrow="What we take care of" title="Know what is included. Know what comes next." body="We agree on the work, the price, and the milestones before starting. You can see progress, make decisions with the team, and understand what you are paying for." />
          <div className="mt-20 grid grid-cols-2 gap-5 max-[1100px]:grid-cols-1 max-[1100px]:gap-4 max-[850px]:mt-12">
            <InViewBlock delay={0.25} className="relative flex">
              <article className="group relative flex flex-1 flex-col rounded-2xl bg-foreground/[0.04] p-10 transition-colors duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-foreground/[0.06] max-[850px]:p-7">
                <h3 className="text-3xl font-medium leading-tight tracking-tight max-[850px]:text-2xl">{service.scope.title}</h3>
                <p className="mt-6 text-5xl font-medium tracking-tight max-[850px]:text-4xl">A defined scope.</p>
                <p className="mt-6 max-w-[48ch] text-sm leading-relaxed text-foreground/75">{service.scope.body}</p>
                <ul className="mt-10 space-y-4">{service.scope.deliverables.map((item) => <li key={item} className="flex items-start gap-3 text-sm text-foreground/85"><Check className="mt-0.5 h-4 w-4 shrink-0 text-foreground/70" strokeWidth={1.6} aria-hidden /><span className="leading-snug">{item}</span></li>)}</ul>
                <div className="mt-auto pt-10"><ContactLink>Talk through your project</ContactLink></div>
              </article>
            </InViewBlock>
            <InViewBlock delay={0.33} className="relative flex">
              <article className="group relative flex flex-1 flex-col rounded-2xl bg-foreground/[0.04] p-10 transition-colors duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-foreground/[0.06] max-[850px]:p-7">
                <h3 className="text-3xl font-medium leading-tight tracking-tight max-[850px]:text-2xl">{service.approach.title}</h3>
                <p className="mt-6 text-5xl font-medium tracking-tight max-[850px]:text-4xl">A clear plan.</p>
                <p className="mt-6 max-w-[48ch] text-sm leading-relaxed text-foreground/75">{service.approach.body}</p>
                <ol className="mt-10 space-y-4">{service.approach.steps.map((item, index) => <li key={item} className="flex items-start gap-3 text-sm text-foreground/85"><span className="mt-0.5 shrink-0 font-mono text-xs text-foreground/70">{String(index + 1).padStart(2, "0")}</span><span className="leading-snug">{item}</span></li>)}</ol>
                <p className="mt-auto pt-10 text-sm leading-relaxed text-foreground/75">Changes to the agreed scope are discussed and priced before we add them.</p>
              </article>
            </InViewBlock>
          </div>
        </div>
      </section>

      <section id="service-work" className="scroll-mt-24 bg-background px-10 pt-24 text-foreground max-[850px]:px-6" aria-labelledby="service-work-heading">
        <div className="mx-auto max-w-[1680px]"><DetailIntro id="service-work-heading" eyebrow="Selected work" title={service.proof.title} body={service.proof.body} /></div>
      </section>
      <WorkGrid projects={projects} />
      <Faq items={service.faq} heading={`A few questions about ${service.name.toLowerCase()}.`} lead="The things worth understanding before you commit to the work." />
      <FinalCta />
      <div className="bg-background px-10 pb-16 text-foreground max-[850px]:px-6"><div className="mx-auto max-w-[1680px]"><Link href="/services" className="font-mono text-xs uppercase tracking-widest text-foreground/75 underline underline-offset-4 transition-colors hover:text-accent">Explore all services</Link></div></div>
    </>
  );
}
