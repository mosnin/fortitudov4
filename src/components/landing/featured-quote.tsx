import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "./reveal";

export function FeaturedQuote() {
  return (
    <section className="bg-cream py-24 sm:py-32">
      <Reveal className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        {/* Avatar chip */}
        <div className="mx-auto mb-8 inline-flex items-center gap-2.5 rounded-full border border-line bg-paper py-1.5 pr-4 pl-1.5 shadow-sm">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-xs font-bold text-cream">
            DC
          </span>
          <span className="text-sm font-medium text-ink">David Chen</span>
          <span className="text-sm text-ink-soft">CTO, DataPulse</span>
        </div>

        <blockquote className="text-2xl leading-snug font-medium tracking-tight text-ink sm:text-3xl lg:text-[2.4rem]">
          &ldquo;The minute I hit submit, the tracker lit up and the team
          messaged me before lunch. No mystery timelines — everything was right
          there in the dashboard.&rdquo;
        </blockquote>

        <Link
          href="/portfolio"
          className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-orange transition-colors hover:text-orange-dark"
        >
          Read the case study
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Reveal>
    </section>
  );
}
