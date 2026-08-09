"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PageHero } from "@/components/ui/firecrawl";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Rocket,
  FileText,
  ChevronUp,
  GitBranch,
  MessageSquareText,
  type LucideIcon,
} from "lucide-react";

/**
 * Client Guides — playbooks for working with the Fortitudo build team.
 * Static content curated in code; each guide expands inline below its
 * summary card.
 */

interface GuideSection {
  heading: string;
  body: string;
}

interface Guide {
  key: string;
  icon: LucideIcon;
  title: string;
  description: string;
  bullets: string[];
  cta: string;
  sections: GuideSection[];
}

const GUIDES: Guide[] = [
  {
    key: "onboarding",
    icon: BookOpen,
    title: "Getting Started",
    description:
      "What to expect from kickoff to first build — and how to keep things moving fast.",
    bullets: [
      "Completing the onboarding form",
      "What happens at the kickoff call",
      "Sharing brand assets, copy, and access",
      "Where everything lives in your portal",
    ],
    cta: "Read Getting Started",
    sections: [
      {
        heading: "1 · Complete the onboarding form",
        body: "Right after you start a project you'll fill in our onboarding form. It captures your goals, audience, references, and the assets we need. The sooner it's in, the sooner your build starts — Discovery can't begin without it.",
      },
      {
        heading: "2 · The kickoff call",
        body: "Once your onboarding is in, we book a kickoff call to walk the scope, confirm the feature list, and agree the milestones you'll see as phases on your project tracker. You'll leave knowing exactly what ships and roughly when.",
      },
      {
        heading: "3 · Share assets and access",
        body: "Upload logos, brand guides, copy docs, and anything else to the Files panel on your project page — everything stays attached to the project. If we need access to a domain, hosting account, or third-party tool, we'll request it in Messages and never store credentials in the open.",
      },
      {
        heading: "4 · Where everything lives",
        body: "Your Dashboard is the overview; each project page holds the phase tracker, files, comments, revisions, and invoice; Messages is the direct line to the team; Weekly Reports and Analytics show results once you're live. Notifications keep you posted when anything changes.",
      },
    ],
  },
  {
    key: "tracker",
    icon: GitBranch,
    title: "Reading Your Project Tracker",
    description:
      "How the phase tracker, statuses, and launch pipeline tell you exactly where your build stands.",
    bullets: [
      "The six build phases, Discovery to Launch",
      "What each project status means",
      "How the launch pipeline differs from phases",
      "When to expect movement",
    ],
    cta: "Read the Tracker Guide",
    sections: [
      {
        heading: "1 · The six build phases",
        body: "Every build moves through Discovery, Design, Development, Testing, Review, and Launch. The vertical tracker on your project page shows the finished phases with filled ticks, the active phase pulsing, and what's still ahead — the [ n / 6 ] counter is the fastest read.",
      },
      {
        heading: "2 · Project statuses",
        body: "ONBOARDING means we're waiting on your form; PAYMENT PENDING means the invoice gates the start; IN PROGRESS means we're building; REVISION means we're working through your requested changes; COMPLETED means the project shipped. Statuses are always shown in uppercase mono next to the project name.",
      },
      {
        heading: "3 · Phases vs. the launch pipeline",
        body: "Phases track the build itself. The launch pipeline (when your engagement includes launch services) tracks the operational checklist around it — accounts, integrations, go-live steps — mirrored read-only from the same board our team works from. Both update the moment the team does.",
      },
      {
        heading: "4 · When to expect movement",
        body: "Phases usually advance every few working days; if nothing has moved in a week, check Messages — we're most likely waiting on an approval, content, or access from your side. The dashboard always surfaces what we need from you.",
      },
    ],
  },
  {
    key: "reviews",
    icon: MessageSquareText,
    title: "Reviewing Builds & Requesting Revisions",
    description:
      "How to review preview builds, leave feedback that lands, and use the revision queue.",
    bullets: [
      "Reviewing preview links and staging builds",
      "Leaving feedback with comments",
      "Submitting a revision request",
      "Tracking revision status and responses",
    ],
    cta: "Read the Review Guide",
    sections: [
      {
        heading: "1 · Review the preview build",
        body: "During Review we share a staging link in Messages or the project files. Click through it like a customer would — on your phone too. Check copy, images, forms, and the flows that matter to your business before anything goes live.",
      },
      {
        heading: "2 · Leave feedback as comments",
        body: "Use the Comments tab on the project page for anything discussable — questions, small nitpicks, ideas. Threads keep the discussion attached to the project, and the team replies within one business day.",
      },
      {
        heading: "3 · Submit a revision request",
        body: "For concrete changes you want made, use Request a Revision on the project page. One request per change works best: say where it is, what's wrong, and what you expect instead. Screenshots uploaded to Files help enormously.",
      },
      {
        heading: "4 · Track the revision queue",
        body: "Each request shows its status — PENDING when it's queued, IN PROGRESS while we work it, COMPLETED when it's deployed to the preview, REJECTED (with a note) if it's out of scope. The team's response appears directly under your request.",
      },
    ],
  },
  {
    key: "launch",
    icon: Rocket,
    title: "Launch Checklist",
    description:
      "Everything that needs to be true before we flip the switch — and what happens after.",
    bullets: [
      "Domain, DNS, and hosting readiness",
      "Final content and legal pages",
      "Sign-off and the go-live window",
      "Post-launch support and analytics",
    ],
    cta: "Read the Launch Checklist",
    sections: [
      {
        heading: "1 · Domain and DNS",
        body: "We need access to (or delegation of) your domain before launch day — DNS changes can take up to 48 hours to propagate, so this is the first thing to settle. If we're hosting, we'll confirm SSL and redirects as part of the cutover.",
      },
      {
        heading: "2 · Final content and legal",
        body: "Real copy, final images, working contact details, and your privacy/terms pages must be in before go-live. Placeholder text is the most common launch blocker — a quick content pass in Review saves days.",
      },
      {
        heading: "3 · Sign-off and go-live",
        body: "Launch happens after your written sign-off in Messages and a settled invoice. We schedule the cutover, verify every page and form on production, and confirm in Messages when you're live.",
      },
      {
        heading: "4 · After launch",
        body: "The first days are a watch window: analytics events start flowing to your Analytics page, and anything odd gets fixed fast. Post-launch issues go through the same revision queue — and if your plan includes ongoing work, your Weekly Reports pick up from launch week.",
      },
    ],
  },
];

export default function GuidesPage() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="space-y-10">
      <PageHero
        title="Client Guides"
        description="Everything you need to get the most out of working with the Fortitudo team."
      />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {GUIDES.map((guide) => {
          const isOpen = open === guide.key;
          return (
            <section key={guide.key} className="border-t border-border pt-6">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-muted">
                <guide.icon className="h-5 w-5 text-foreground" />
              </span>
              <h2 className="mt-4 text-xl font-bold tracking-tight">
                {guide.title}
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {guide.description}
              </p>
              <ul className="mt-4 space-y-2">
                {guide.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-sm">
                    <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                    {b}
                  </li>
                ))}
              </ul>
              <Button
                className="mt-6 w-full"
                onClick={() => setOpen(isOpen ? null : guide.key)}
                aria-expanded={isOpen}
              >
                {isOpen ? (
                  <ChevronUp className="mr-1.5 h-4 w-4" />
                ) : (
                  <FileText className="mr-1.5 h-4 w-4" />
                )}
                {isOpen ? "Close Guide" : guide.cta}
              </Button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-6 space-y-5 border-t border-border pt-5">
                      {guide.sections.map((s) => (
                        <div key={s.heading}>
                          <h3 className="eyebrow-mono">{s.heading}</h3>
                          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                            {s.body}
                          </p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          );
        })}
      </div>
    </div>
  );
}
