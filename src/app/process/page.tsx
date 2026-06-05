import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MarketingHero } from "@/components/layout/marketing-hero";
import { CTASection } from "@/components/sections/cta";
import { AsciiField } from "@/components/dashboard/ascii-field";
import {
  AsciiArt,
  briefArt,
  blueprintArt,
  buildArt,
  decisionArt,
  launchArt,
  vaultArt,
  agentArt,
} from "@/components/ascii-art";
import { Reveal } from "@/components/ui/motion";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "How it works | Fortitudo",
  description:
    "From a single conversation to launch — the Fortitudo process: Brief, Blueprint, Build, the Decision Loop, and Launch. Calm, transparent, and yours to steer.",
};

type Step = {
  kicker: string;
  title: React.ReactNode;
  body: string;
  points: string[];
  art: string;
};

const steps: Step[] = [
  {
    kicker: "01 · The Brief",
    title: <>A conversation, not a form</>,
    body: "It starts by talking. Our studio interviews you one question at a time, researches your business and your competitors, and only scopes what we can genuinely build.",
    points: [
      "A friendly, in-depth chat — no forms, no funnels",
      "We study your existing site, market, and rivals",
      "It becomes a real proposal only when it fits",
    ],
    art: briefArt,
  },
  {
    kicker: "02 · The Blueprint",
    title: <>Real scope, a real price</>,
    body: "The conversation turns into a bespoke Blueprint: the architecture, the scope line by line, a timeline, and an honest fixed price. Nothing is a mystery.",
    points: [
      "Architecture and scope laid out in full",
      "A fixed price — no boilerplate, no guesswork",
      "Yours to accept, refine, or walk away from",
    ],
    art: blueprintArt,
  },
  {
    kicker: "03 · The Build",
    title: <>Phases, tasks, a live roadmap</>,
    body: "Once accepted, the Blueprint is decomposed into a real work graph — phases and tasks wired in dependency order. Your architect and team execute, and progress rolls up live.",
    points: [
      "AI breaks the build into an ordered task graph",
      "Your dedicated architect and team execute it",
      "Watch phase progress update in real time",
    ],
    art: buildArt,
  },
  {
    kicker: "04 · The Decision Loop",
    title: <>We interrupt only when it&apos;s yours to decide</>,
    body: "The studio runs heads-down. The only time we stop you is when a choice is genuinely yours to make — it surfaces as a single, clear decision. Answer once, and the build continues.",
    points: [
      "No status-meeting busywork — we just build",
      "Blocking questions arrive as clear decisions",
      "Answer once; the work flows on from there",
    ],
    art: decisionArt,
  },
  {
    kicker: "05 · Launch & beyond",
    title: <>Shipped, live, and yours</>,
    body: "Review each deliverable, request changes, and ship. Billing is tied to real milestones, not calendar dates — and we stay with you for the next idea after this one.",
    points: [
      "Review deliverables and request revisions inline",
      "Milestone billing tied to real progress",
      "We're here for what you build next",
    ],
    art: launchArt,
  },
];

const builtFor: { kicker: string; title: string; body: string; art: string }[] = [
  {
    kicker: "Two-way vault",
    title: "Credentials, exchanged safely",
    body: "Hand off logins or request the ones we need through an encrypted, AES-256 vault. Secrets stay masked — never pasted into a chat.",
    art: vaultArt,
  },
  {
    kicker: "Agents, in the loop",
    title: "Built for how work happens now",
    body: "Autonomous agents can pick up ready tasks over MCP, do the work, and submit it — but every submission waits for a human to approve or revise.",
    art: agentArt,
  },
];

export default function ProcessPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <MarketingHero
          eyebrow="How it works"
          title={
            <>
              From a conversation to <span className="text-gradient-orange">launch</span>
            </>
          }
          subtitle="A calm, transparent process that keeps you in control the whole way through — five steps, no mystery."
        />

        {/* The journey */}
        <section className="relative bg-charcoal-dark py-20 sm:py-28">
          <div className="mx-auto max-w-6xl space-y-20 px-4 sm:space-y-28 sm:px-6 lg:px-8">
            {steps.map((step, i) => {
              const flip = i % 2 === 1;
              return (
                <Reveal key={step.kicker}>
                  <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
                    {/* Copy */}
                    <div className={cn(flip && "lg:order-2")}>
                      <p className="font-mono text-xs uppercase tracking-[0.25em] text-orange/70">{step.kicker}</p>
                      <h2 className="font-brand mt-3 text-3xl text-white sm:text-4xl">{step.title}</h2>
                      <p className="mt-4 text-lg text-white/65">{step.body}</p>
                      <ul className="mt-6 space-y-2.5">
                        {step.points.map((p) => (
                          <li key={p} className="flex gap-3 text-sm text-white/60">
                            <span className="select-none text-orange">→</span>
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Art */}
                    <div className={cn(flip && "lg:order-1")}>
                      <ArtPanel art={step.art} />
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* Built for how work happens now */}
        <section className="relative bg-charcoal py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs uppercase tracking-[0.25em] text-orange/80">Underneath</p>
              <h2 className="font-brand mt-3 text-3xl text-white sm:text-4xl">
                Built for how work <span className="text-gradient-orange">happens now</span>
              </h2>
            </div>
            <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-2">
              {builtFor.map((f) => (
                <Reveal key={f.title}>
                  <div className="relative h-full overflow-hidden rounded-3xl border border-border/60 bg-charcoal-dark p-7">
                    <AsciiField className="absolute inset-0 h-full w-full opacity-[0.08]" cell={13} />
                    <div className="relative z-10">
                      <p className="font-mono text-xs uppercase tracking-[0.22em] text-orange/70">{f.kicker}</p>
                      <h3 className="font-brand mt-2 text-xl text-white">{f.title}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-white/55">{f.body}</p>
                      <div className="mt-6 overflow-x-auto">
                        <AsciiArt art={f.art} className="text-orange/70" />
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <CTASection />
      </main>
      <Footer />
    </>
  );
}

function ArtPanel({ art }: { art: string }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-charcoal p-6 sm:p-8">
      <AsciiField className="absolute inset-0 h-full w-full opacity-[0.12]" cell={13} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(249,115,22,0.12),transparent_60%)]" />
      <div className="relative z-10 flex min-h-[190px] items-center justify-center overflow-x-auto">
        <AsciiArt art={art} className="text-orange/80" />
      </div>
    </div>
  );
}
