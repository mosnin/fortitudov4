import { Logo } from "@/components/imageworks/logo";
import Link from "next/link";
import { PageIntro } from "@/components/imageworks/page-intro";
import { Process } from "@/components/imageworks/process";
import { FinalCta } from "@/components/imageworks/final-cta";
import { SectionHeading } from "@/components/imageworks/section-heading";
import { StudioStandard } from "@/components/imageworks/studio-standard";
export const metadata = {
  title: "About — Fortitudo Agency",
  description:
    "Design, engineering and applied AI brought together around your business, with clear scope and a complete handover.",
};
const principles = [
  [
    "One coherent experience",
    "Your identity, marketing website, store or application should belong to the same business. We consider the complete journey, including the less visible details that make it work.",
  ],
  [
    "Decisions you can inspect",
    "Scope, design and working software move through agreed reviews. You can see the choices being made and resolve questions while the work is taking shape.",
  ],
  [
    "A business asset you own",
    "For custom software, the engagement includes frontend and backend deployment assistance, source code and a practical handover. Your data and deployment accounts remain yours. The agreement identifies third-party licenses and the transfer of commissioned work.",
  ],
  [
    "Support by choice",
    "We can continue with a scoped care or improvement retainer. Ownership does not depend on buying ongoing support, and future work is a separate decision.",
  ],
];
export default function About() {
  return (
    <>
      <PageIntro
        label="About Fortitudo"
        title="Design and engineering, in the same conversation."
        lead="Fortitudo builds websites, ecommerce stores, software and applied AI. We connect brand decisions with technical decisions so the work holds together from the first impression to daily use."
      />
      <section className="pb-24 sm:pb-32">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="flex aspect-[4/3] flex-col justify-between rounded-2xl border border-border bg-muted p-8 sm:p-12">
              <Logo className="h-12 self-start" />
              <p className="text-4xl leading-tight tracking-tight sm:text-5xl">From the first<br />impression to<br />the final handover.</p>
              <p className="text-sm text-muted-foreground">Brand · Websites · Commerce · Software · AI</p>
            </div>
            <div className="max-w-xl">
              <h2 className="text-4xl leading-tight tracking-tight">
                A clear idea.
                <br />A considered build.
                <br />A complete handover.
              </h2>
              <p className="mt-7 text-base leading-8 text-muted-foreground">
                Some projects begin with a new business. Others begin with
                software that needs fixing, a store ready to grow or a workflow
                ready for AI. We start by understanding the job, then bring the
                right design and development work into one scope.
              </p>
              <Link
                href="/work"
                className="mt-8 inline-flex min-h-12 items-center rounded-xl bg-foreground px-5 text-sm font-medium text-background"
              >
                Explore our work →
              </Link>
            </div>
          </div>
        </div>
      </section>
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
          <SectionHeading
            id="principles-heading"
            title="What you can expect from us."
          />
          <div className="mt-12 grid gap-x-16 md:grid-cols-2">
            {principles.map(([title, body]) => (
              <article key={title} className="border-t border-border py-8">
                <h3 className="text-2xl tracking-tight">{title}</h3>
                <p className="mt-5 max-w-xl text-base leading-8 text-muted-foreground">
                  {body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <Process />
      <StudioStandard />
      <FinalCta />
    </>
  );
}
