import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/imageworks/page-intro";
import { SectionHeading } from "@/components/imageworks/section-heading";
import { FinalCta } from "@/components/imageworks/final-cta";
import { Faq } from "@/components/imageworks/faq";
import { Reveal } from "@/components/imageworks/reveal";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Careers | Fortitudo",
  description:
    "Learn how Fortitudo works and find current opportunities across design, development and digital operations.",
  alternates: { canonical: "https://www.fortitudo.agency/careers" },
};

const principles = [
  {
    title: "Own the complete result",
    body: "Understand the business problem, the customer journey and the operating details behind the part you deliver.",
  },
  {
    title: "Make decisions visible",
    body: "Write down assumptions, constraints and tradeoffs so clients and teammates can review the work while there is time to improve it.",
  },
  {
    title: "Leave useful ownership behind",
    body: "Build for the people who will operate the result. Clear access, documentation and handover are part of the work.",
  },
];

const careerQuestions = [
  {
    q: "Can I send a general introduction?",
    a: "Yes. Send a short note about the work you do, the problems you are strongest at solving and links to work you can discuss. We cannot promise a role or a reply to every introduction.",
  },
  {
    q: "Where will future roles appear?",
    a: "Any active role will be published on this page with its responsibilities, working arrangement and application instructions.",
  },
  {
    q: "Does Fortitudo use recruiters?",
    a: "A real opportunity will be listed here and correspondence will come from a fortitudo.agency address. We will never ask a candidate to pay for equipment, software or an application.",
  },
];

export default function CareersPage() {
  return (
    <>
      <PageIntro
        label="Careers"
        title="Do considered work. Take responsibility for the result."
        lead="Fortitudo brings strategy, design and implementation into one delivery team. We look for people who can work across the whole problem and communicate clearly with the people affected by it."
      />
      <section className="mx-auto max-w-[1440px] px-4 py-24 sm:px-6 sm:py-32" aria-labelledby="careers-principles-heading">
        <SectionHeading
          id="careers-principles-heading"
          title="Craft, judgment and accountability belong together."
          description="How we approach the work, the client relationship and the result left behind."
        />
        <div className="mt-14 border-t border-border sm:mt-16">
          {principles.map((item, index) => (
            <Reveal inView delay={index * 0.06} key={item.title}>
              <article className="grid gap-3 border-b border-border py-7 sm:grid-cols-[3rem_minmax(12rem,0.8fr)_minmax(0,1.2fr)] sm:gap-8 sm:py-9">
                <span className="text-sm text-muted-foreground">0{index + 1}</span>
                <h3 className="font-sans text-2xl leading-tight tracking-[-0.02em] sm:text-3xl">{item.title}</h3>
                <p className="max-w-2xl text-[15px] leading-7 text-muted-foreground sm:text-base">{item.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="border-y border-border bg-foreground/[0.025]">
        <div className="mx-auto max-w-[1440px] px-4 py-24 sm:px-6 sm:py-32">
          <SectionHeading
            id="open-roles-heading"
            title="No open roles are listed right now."
            description="You can still introduce yourself. Tell us the work you do, the problems you solve well and share work you can discuss."
          />
          <Link
            className="group mt-9 inline-flex h-12 items-center justify-center gap-2.5 rounded-xl bg-foreground pr-4 pl-5 text-[15px] font-medium text-background transition-opacity hover:opacity-90"
            href="mailto:hello@fortitudo.agency?subject=Careers%20at%20Fortitudo"
          >
            Send an introduction
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </div>
      </section>
      <Faq heading="Careers questions." lead="Introductions, future openings and how to recognize official correspondence." items={careerQuestions} />
      <FinalCta />
    </>
  );
}
