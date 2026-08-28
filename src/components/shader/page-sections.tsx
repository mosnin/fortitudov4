import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowChip } from "@/components/shader/arrow-chip";

export function SectionIntro({ eyebrow, title, body, id }: { eyebrow: string; title: ReactNode; body?: string; id?: string }): ReactNode {
  return (
    <div className="grid grid-cols-12 gap-x-10 gap-y-6 max-[850px]:grid-cols-1">
      <div className="col-span-3 pt-2 max-[1100px]:col-span-12 max-[850px]:col-span-1"><span className="inline-flex rounded-md border border-foreground/[0.08] px-3.5 py-1.5 font-mono text-xs uppercase tracking-widest text-foreground/70">{eyebrow}</span></div>
      <div className="col-span-7 col-start-6 max-[1100px]:col-span-12 max-[1100px]:col-start-1 max-[850px]:col-span-1">
        <h2 id={id} className="text-balance text-[clamp(2rem,4.2vw,4rem)] font-medium leading-[0.9] tracking-tight">{title}</h2>
        {body ? <p className="mt-6 max-w-[60ch] text-lg font-light leading-snug text-foreground/60 sm:text-xl">{body}</p> : null}
      </div>
    </div>
  );
}

export function CtaBand({ title = "Ready to build something real?", body = "Tell us what you want. We will give you a clear scope and fixed price before the work starts." }: { title?: string; body?: string }): ReactNode {
  return (
    <section className="bg-background px-6 pb-24 pt-8 text-foreground sm:px-10 lg:pb-32">
      <div className="mx-auto grid max-w-[1680px] grid-cols-12 gap-8 rounded-3xl bg-accent p-8 text-accent-foreground sm:p-12 lg:p-16 max-[850px]:grid-cols-1">
        <h2 className="col-span-8 max-w-[12ch] text-[clamp(2.5rem,5vw,5rem)] font-medium leading-[0.9] tracking-tight max-[850px]:col-span-1">{title}</h2>
        <div className="col-span-4 flex flex-col items-start justify-end max-[850px]:col-span-1">
          <p className="max-w-md text-sm leading-relaxed text-accent-foreground/65 sm:text-base">{body}</p>
          <Link href="/contact" className="mt-7 inline-flex items-stretch gap-1"><span className="rounded-md bg-accent-foreground px-5 py-3 text-xs font-medium uppercase tracking-widest text-accent">Get a price</span><ArrowChip className="bg-accent-foreground text-accent" /></Link>
        </div>
      </div>
    </section>
  );
}

export function LegalPage({ children }: { children: ReactNode }): ReactNode {
  return <section className="bg-background px-6 py-20 text-foreground sm:px-10 lg:py-28"><div className="mx-auto max-w-3xl space-y-10 text-base leading-relaxed text-foreground/65 [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-medium [&_h2]:tracking-tight [&_h2]:text-foreground">{children}</div></section>;
}
