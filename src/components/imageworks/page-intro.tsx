import { Reveal } from "./reveal";
import type { ReactNode } from "react";
export function PageIntro({
  label,
  title,
  lead,
}: {
  label: string;
  title: ReactNode;
  lead: string;
}) {
  return (
    <section className="px-4 pt-36 pb-20 text-center sm:px-6 sm:pt-44 sm:pb-28">
      <div className="mx-auto max-w-4xl">
        <Reveal>
          <p className="mb-6 text-sm font-medium">{label}</p>
          <h1 className="font-sans text-[clamp(2.75rem,6vw,5rem)] leading-[1.02] tracking-[-0.02em] text-balance">
            <span data-reveal-06>{title}</span>
          </h1>
          <p className="mx-auto mt-7 max-w-xl text-[16px] leading-7 text-foreground/80">
            {lead}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
export function LegalContent({ children }: { children: ReactNode }) {
  return (
    <section className="mx-auto max-w-3xl space-y-10 px-6 py-24 text-base leading-7 text-muted-foreground [&_h2]:mb-4 [&_h2]:font-sans [&_h2]:text-3xl [&_h2]:text-foreground">
      {children}
    </section>
  );
}
