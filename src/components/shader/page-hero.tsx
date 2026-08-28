import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowChip } from "@/components/shader/arrow-chip";
import { ShaderCanvas } from "@/components/shader/shader-canvas";

interface PageHeroProps {
  eyebrow: string;
  title: ReactNode;
  lead: string;
  cta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
}

export function PageHero({ eyebrow, title, lead, cta, secondaryCta }: PageHeroProps): ReactNode {
  return (
    <section className="relative min-h-[76vh] overflow-hidden bg-[#0f0f12] px-6 pb-20 pt-36 text-white sm:px-10 lg:pb-24 lg:pt-44">
      <div aria-hidden className="absolute inset-0 opacity-90"><ShaderCanvas /></div>
      <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/10 to-[#0f0f12]" />
      <div className="relative mx-auto flex min-h-[calc(76vh-13rem)] max-w-[1680px] flex-col justify-between gap-16">
        <span className="inline-flex w-fit rounded-md border border-white/20 bg-black/10 px-3.5 py-1.5 font-mono text-xs uppercase tracking-widest text-white/70 backdrop-blur-sm">{eyebrow}</span>
        <div className="grid grid-cols-12 items-end gap-x-10 gap-y-8 max-[850px]:grid-cols-1">
          <h1 className="col-span-8 text-balance text-[clamp(3.5rem,8vw,8.5rem)] font-medium leading-[0.84] tracking-[-0.065em] max-[1100px]:col-span-10 max-[850px]:col-span-1">{title}</h1>
          <div className="col-span-4 max-[1100px]:col-span-7 max-[1100px]:col-start-6 max-[850px]:col-span-1 max-[850px]:col-start-1">
            <p className="max-w-[40ch] text-lg leading-snug tracking-tight text-white/72 sm:text-xl">{lead}</p>
            {cta || secondaryCta ? (
              <div className="mt-7 flex flex-wrap items-center gap-2">
                {cta ? <Link href={cta.href} className="inline-flex items-stretch gap-1"><span className="rounded-md bg-white px-5 py-3 text-xs font-medium uppercase tracking-widest text-[#0f0f12]">{cta.label}</span><ArrowChip className="bg-[#f8cd02] text-[#0f0f12]" /></Link> : null}
                {secondaryCta ? <Link href={secondaryCta.href} className="inline-flex min-h-11 items-center rounded-md border border-white/20 px-5 text-xs font-medium uppercase tracking-widest text-white transition-colors hover:bg-white/10">{secondaryCta.label}</Link> : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
