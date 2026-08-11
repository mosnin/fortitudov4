'use client';

/**
 * HelpCenter — the logged-out `/help` destination.
 *
 * Cohesive with the marketing home page: the same dark cinematic canvas, thin
 * serif display headlines, uppercase-mono eyebrows with the warm brand dot, and
 * the redesign's blur-rise entrance language. It answers "how do I actually use
 * this?" as a set of task-oriented guide cards, then shows the ChippiCircuit
 * wiring diagram (with the Chippi mark at its core) so the reader sees how the
 * pieces connect. Unlike the product dashboard — which is deliberately
 * icon-free — the marketing surfaces DO use branded icons, so each guide leads
 * with its gradient-stroked glyph (stroked via the shared #chippi-grad def on
 * the marketing layout).
 */

import Link from 'next/link';
import { motion } from 'motion/react';
import {
  Home,
  MessagesSquare,
  Users,
  KanbanSquare,
  Workflow,
  CalendarCheck,
  ArrowRightLeft,
  Building2,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';
import { EASE_OUT } from '@/lib/motion';
import { BlurRise, Eyebrow, EyebrowPill, Serif, PillPrimary, PillGhost } from './primitives';
import { ChippiCircuit } from '@/components/experience/chippi-circuit';

const MONO = { fontFamily: 'var(--font-mono-display), ui-monospace, monospace' } as const;

interface Guide {
  icon: LucideIcon;
  title: string;
  desc: string;
  steps: string[];
}

/** The task-oriented guides. Each maps to a real surface in the product. */
const GUIDES: Guide[] = [
  {
    icon: Home,
    title: 'Getting started',
    desc: 'Set up your workspace and bring your project into Helix in a few minutes.',
    steps: [
      'Sign in and name your workspace.',
      'Import your contacts from a CSV or a connected CRM.',
      'Connect your inbox and calendar so Helix can read and book.',
    ],
  },
  {
    icon: MessagesSquare,
    title: 'Helix, your teammate',
    desc: 'Helix reads every request, drafts in the house style, and lines up the next move.',
    steps: [
      'Open the Helix tab to see your prepared day — new requests, follow-ups, drafts.',
      'Every draft waits for your tap; nothing ships on its own.',
      'Ask Helix in plain language to draft, stage, or summarize anything.',
    ],
  },
  {
    icon: Users,
    title: 'People & clients',
    desc: 'Every client in one list, scored against your live pipeline.',
    steps: [
      'Open People to see every contact with intent and last-touch at a glance.',
      'Requests are ranked so you know what to tackle first.',
      'Open any contact for the full history, notes, and Helix’s suggested reply.',
    ],
  },
  {
    icon: KanbanSquare,
    title: 'Builds & pipeline',
    desc: 'A board that keeps itself current as reviews book and revisions land.',
    steps: [
      'Drag a build across phases, or let an approved revision move it for you.',
      'Each card shows value, quote, and a health dot so risk surfaces early.',
      'Helix writes the next step on every build so nothing goes quiet.',
    ],
  },
  {
    icon: Workflow,
    title: 'Automations',
    desc: 'Standing orders Helix runs on its own — every run still drafts for your tap.',
    steps: [
      'Workflows react to an event: a new request, a reply, a build changing phase.',
      'Routines run on a schedule: every morning, every weekday, every hour.',
      'Build one from a template or describe it and let Helix wire it up.',
    ],
  },
  {
    icon: CalendarCheck,
    title: 'Reviews & calendar',
    desc: 'Times proposed against your real availability, booked with a tap.',
    steps: [
      'Connect Google Calendar so Helix only ever offers times you actually have.',
      'Approve a proposed time and the calendar, thread, and build all update.',
      'Reschedules and confirmations are drafted for you automatically.',
    ],
  },
  {
    icon: ArrowRightLeft,
    title: 'Integrations',
    desc: 'Connect the tools you already pay for — Helix works across them.',
    steps: [
      'Add Gmail, Google Calendar, HubSpot, DocuSign, Slack and more.',
      'Connections are managed through Composio with 50+ apps available.',
      'Helix reads and writes in both directions so your systems stay in sync.',
    ],
  },
  {
    icon: Building2,
    title: 'The studio',
    desc: 'One teammate behind every build, with a view of the whole studio.',
    steps: [
      'See every builder’s volume, launch rate, and live pipeline on one leaderboard.',
      'Route incoming projects to the right senior in a tap.',
      'Publish shared templates and workflows across the studio.',
    ],
  },
];

const reveal = {
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
};

export function HelpCenter() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden px-5 pb-16 pt-36 sm:px-8 sm:pb-20 sm:pt-44 lg:px-10">
        {/* Warm brand bloom, same language as the closing CTA. */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 [background:radial-gradient(90%_60%_at_50%_-10%,rgba(248,205,2,0.12),transparent_60%)]"
        />
        <div className="mx-auto w-full max-w-4xl text-center">
          <BlurRise trigger="load" delay={0.05}>
            {/* The Chippi wordmark, front and centre for a help destination. */}
            <span className="mx-auto mb-8 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjGFyH-zcjRU7dd9BCXlkr1NYW1kpfyk6MNqM2rtCfSzimgb7leI0M3q-2DmYwthY3Bkpae0RBGILsjuX8cRT1_MKqU0pR1UWGWNoMWesQQfcvBGkfWLky2n5bv8Pt_okFaZcFeHFLXb5jZzwjMpLS5TJohoHx-R8j-WyXCcm1TK5YQpWLHvYoUFP-BOpGL/s320/Age%20(4).png"
                alt="Fortitudo"
                width={320}
                height={320}
                className="h-6 w-auto"
              />
              <span className="ml-2 text-base font-medium tracking-tight text-white">Fortitudo</span>
            </span>
            <EyebrowPill>Help Center</EyebrowPill>
          </BlurRise>
          <BlurRise trigger="load" delay={0.15}>
            <Serif
              as="h1"
              className="mt-7 text-balance text-[clamp(2.25rem,5vw,4rem)] leading-[1.05] text-white"
            >
              Everything you need
              <span className="block">to run Helix.</span>
            </Serif>
          </BlurRise>
          <BlurRise trigger="load" delay={0.28}>
            <p className="mx-auto mt-6 max-w-xl text-balance text-base leading-relaxed text-white/60 sm:text-lg">
              Short, practical guides for every part of the workspace — from your
              first import to the automations that run your build while you ship.
            </p>
          </BlurRise>
          <BlurRise trigger="load" delay={0.4}>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <PillPrimary href="/contact" withArrow>
                See a demo
              </PillPrimary>
              <PillGhost href="/sign-in">Sign in</PillGhost>
            </div>
          </BlurRise>
        </div>
      </section>

      {/* ── Guides ───────────────────────────────────────────────────────── */}
      <section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
        <div className="mx-auto w-full max-w-6xl">
          <BlurRise>
            <Eyebrow>Guides</Eyebrow>
            <Serif as="h2" className="mt-4 max-w-2xl text-[clamp(1.75rem,3.2vw,2.5rem)] leading-[1.1] text-white">
              Learn each feature in a minute.
            </Serif>
          </BlurRise>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {GUIDES.map((g, i) => {
              const Icon = g.icon;
              return (
                <BlurRise key={g.title} delay={(i % 3) * 0.06}>
                  <div className="group h-full rounded-[6px] border border-white/10 bg-white/[0.02] p-6 transition-colors hover:border-white/20 hover:bg-white/[0.04]">
                    <span className="flex h-11 w-11 items-center justify-center rounded-[6px] border border-white/10 bg-white/[0.03]">
                      <Icon className="h-[19px] w-[19px]" stroke="url(#chippi-grad)" strokeWidth={1.75} />
                    </span>
                    <h3 className="mt-5 text-[17px] font-medium text-white">{g.title}</h3>
                    <p className="mt-2 text-[13.5px] leading-relaxed text-white/55">{g.desc}</p>
                    <ul className="mt-4 space-y-2.5 border-t border-white/[0.07] pt-4">
                      {g.steps.map((s) => (
                        <li key={s} className="flex items-start gap-2.5 text-[13px] leading-snug text-white/70">
                          <span
                            aria-hidden
                            className="mt-[7px] inline-block size-1.5 flex-shrink-0 rounded-full bg-[#f8cd02]"
                          />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </BlurRise>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How Chippi works (the circuit) ───────────────────────────────── */}
      <section className="px-5 py-20 sm:px-8 sm:py-24 lg:px-10">
        <div className="mx-auto w-full max-w-6xl">
          <motion.div {...reveal} transition={{ duration: 0.7, ease: EASE_OUT }}>
            <span style={MONO} className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.22em] text-white/55">
              <span className="inline-block size-1.5 rounded-full bg-[#f8cd02]" />
              How it works
            </span>
            <Serif as="h2" className="mt-5 max-w-2xl text-[clamp(1.75rem,3.2vw,2.75rem)] leading-[1.08] text-white">
              Every request flows through Helix.
              <span className="text-white/55"> The work comes back done.</span>
            </Serif>
          </motion.div>

          <motion.div
            {...reveal}
            transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.12 }}
            className="mt-10 overflow-x-auto"
          >
            {/* min-w keeps the board legible on phones — it scrolls sideways
                rather than shrinking labels into confetti. */}
            <div className="min-w-[740px]">
              <ChippiCircuit variant="dark" className="mx-auto" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Still need a hand ────────────────────────────────────────────── */}
      <section className="px-5 pb-24 sm:px-8 lg:px-10">
        <div className="mx-auto w-full max-w-6xl">
          <BlurRise>
            <div className="flex flex-col items-start justify-between gap-6 rounded-[6px] border border-white/10 bg-white/[0.02] p-8 sm:p-10 lg:flex-row lg:items-center">
              <div>
                <Serif as="h2" className="text-[clamp(1.5rem,3vw,2.25rem)] leading-[1.1] text-white">
                  Still need a hand?
                </Serif>
                <p className="mt-3 max-w-md text-[14px] leading-relaxed text-white/55">
                  Book a walkthrough and we’ll set Helix up on your real project, or
                  reach the team directly — we answer fast.
                </p>
              </div>
              <div className="flex flex-shrink-0 flex-col gap-3 sm:flex-row">
                <PillPrimary href="/contact" withArrow>
                  Book a walkthrough
                </PillPrimary>
                <Link
                  href="/contact"
                  className="group inline-flex h-11 items-center justify-center gap-2 rounded-[4px] border border-white/20 px-6 text-[14px] font-medium text-white transition-colors duration-200 hover:border-white/40 hover:bg-white/[0.04]"
                >
                  Contact support
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </BlurRise>
        </div>
      </section>
    </>
  );
}
