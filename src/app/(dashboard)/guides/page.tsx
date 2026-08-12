"use client";

import { Fragment, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CrmPageHeader, RecordList, RecordRow } from "@/components/crm";
import { cn } from "@/lib/utils";
import {
  PAGE_RHYTHM,
  READING_COL,
  SECTION_LABEL,
  SECTION_RHYTHM,
} from "@/lib/typography";

/**
 * Client Guides — playbooks for working with the Fortitudo build team.
 * Static content curated in code; each guide expands inline below its row.
 */

interface GuideSection {
  heading: string;
  body: string;
}

interface Guide {
  key: string;
  title: string;
  description: string;
  bullets: string[];
  cta: string;
  sections: GuideSection[];
}

const GUIDES: Guide[] = [
  {
    key: "onboarding",
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
        body: "Every build moves through Discovery, Design, Development, Testing, Review, and Launch. The tracker on your project page numbers each phase, marks the current one In Progress, and leaves what's ahead in grey — the “n of 6 phases complete” line above it is the fastest read.",
      },
      {
        heading: "2 · Project statuses",
        body: "Onboarding means we're waiting on your form; Payment Pending means the invoice gates the start; In Progress means we're building; Revision means we're working through your requested changes; Completed means the project shipped. The status always sits in a small pill next to the project name.",
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
        body: "Each request carries a status pill — Pending when it's queued, In Progress while we work it, Completed when it's deployed to the preview, Rejected (with a note) if it's out of scope. The team's response appears directly under your request.",
      },
    ],
  },
  {
    key: "launch",
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
        body: "The first days are a watch window: analytics events start flowing to your Analytics page, and anything odd gets fixed fast. Post-launch issues go through the same revision queue — and if your engagement continues past launch, your Weekly Reports pick up from launch week.",
      },
    ],
  },
];

export default function GuidesPage() {
  const [open, setOpen] = useState<string | null>(null);
  const openGuide = GUIDES.find((g) => g.key === open);

  return (
    <div className={cn(PAGE_RHYTHM, "pb-12")}>
      <div className={cn(READING_COL, PAGE_RHYTHM)}>
        <CrmPageHeader
          section="Learn."
          title="Client Guides"
          subtitle={
            openGuide
              ? `Reading ${openGuide.title}.`
              : `${GUIDES.length} playbooks for working with the build team.`
          }
        />

        <section className={SECTION_RHYTHM}>
          <p className={SECTION_LABEL}>All guides</p>
          <RecordList className="border-t border-border/60">
            {GUIDES.map((guide, i) => {
              const isOpen = open === guide.key;
              return (
                <Fragment key={guide.key}>
                <RecordRow
                  index={i}
                  selected={isOpen}
                  onClick={() => setOpen(isOpen ? null : guide.key)}
                  primary={guide.title}
                  secondary={guide.description}
                  meta={
                    <span className="text-xs text-muted-foreground">
                      {isOpen ? "Close" : "Read"}
                    </span>
                  }
                />
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.li
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-5 py-5">
                        <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground marker:text-border">
                          {guide.bullets.map((b) => (
                            <li key={b}>{b}</li>
                          ))}
                        </ul>
                        {guide.sections.map((s) => (
                          <div key={s.heading}>
                            <p className={SECTION_LABEL}>{s.heading}</p>
                            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                              {s.body}
                            </p>
                          </div>
                        ))}
                      </div>
                    </motion.li>
                  )}
                </AnimatePresence>
                </Fragment>
              );
            })}
          </RecordList>
        </section>
      </div>
    </div>
  );
}
