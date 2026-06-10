import type { ReactNode } from "react";
import { AsciiField } from "@/components/dashboard/ascii-field";
import { Reveal } from "@/components/ui/motion";

/** Shared masthead for marketing pages — the studio's ASCII signature + font-brand. */
export function MarketingHero({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-charcoal-dark px-4 pb-20 pt-32 sm:pb-28 sm:pt-40">
      <AsciiField className="absolute inset-0 h-full w-full opacity-20" cell={14} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(249,115,22,0.16),transparent_55%)]" />
      <Reveal className="relative z-10 mx-auto max-w-4xl text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-orange/80">{eyebrow}</p>
        <h1 className="font-brand mt-4 text-4xl leading-[1.05] text-white sm:text-6xl">{title}</h1>
        {subtitle && <p className="mx-auto mt-5 max-w-2xl text-lg text-white/65">{subtitle}</p>}
        {children}
      </Reveal>
    </section>
  );
}
