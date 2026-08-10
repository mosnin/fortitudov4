'use client';

/**
 * AgentCanvas, the "Real Estate OS" feature section (image on the RIGHT).
 * Thin config over the shared <FeatureShowcase>; the frosted, detailed mockups
 * (search, pipeline, draft reply, automation feed, daily agenda) live here.
 */

import {
  LayoutGrid,
  Library,
  PenLine,
  ScrollText,
  Search,
  Home,
  FileText,
  CalendarCheck,
  TrendingUp,
  Mail,
  Phone,
  Send,
  CheckCircle2,
  RefreshCw,
  Inbox,
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  FeatureShowcase,
  Frost,
  Row,
  Dot,
  rowV,
  type ShowcaseStep,
} from './feature-showcase';

const TOP_FEATURES = [
  { icon: Library, title: 'Trained on your project', desc: 'Grounded in your brief, your stack, and your standards — never generic output.' },
  { icon: PenLine, title: 'Drafts, never ships', desc: 'Every change is proposed; a senior builder approves before it lands.' },
  { icon: ScrollText, title: 'Audited end to end', desc: 'Every action Helix takes is logged with the reason, in plain language.' },
];

const STEPS: ShowcaseStep[] = [
  {
    key: 'data',
    title: 'See build status in seconds',
    desc: 'Ask in plain language and Helix pulls the phase, revision, or document instantly, no digging through tabs.',
    mockup: (
      <Frost title="Ask Helix" badge="0.4s">
        <motion.div
          variants={rowV}
          className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5"
        >
          <Search className="h-3.5 w-3.5 text-white/45" />
          <span className="text-[12.5px] text-white/85">Sarah Chen, build status + next milestone</span>
          <span className="ml-auto h-3 w-px animate-pulse bg-white/40" />
        </motion.div>
        <Row icon={Home} title="Sarah Chen" meta="Founder · fixed quote approved" tone="text-[#ff9a6e]" active />
        <Row icon={CalendarCheck} title="Phase 3 · Development approved" meta="Sat 2:00pm · kickoff booked" />
        <Row icon={CalendarCheck} title="Revision #12 merged" meta="last week · preview updated" />
        <Row icon={FileText} title="launch-checklist.pdf" meta="drafted Mar 3 · ready for review" />
      </Frost>
    ),
  },
  {
    key: 'leads',
    title: 'Stay on top of phases & revisions',
    desc: 'Every phase tracked, every revision moved forward, you always know the next best move.',
    mockup: (
      <Frost title="Pipeline" badge="Live">
        <motion.div variants={rowV} className="grid grid-cols-3 gap-2 px-1 pb-2">
          {[
            { n: '24', l: 'Active' },
            { n: '6', l: 'In review' },
            { n: '3', l: 'Launching' },
          ].map((s) => (
            <div key={s.l} className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 text-center">
              <span className="block text-[20px] font-semibold leading-none text-white">{s.n}</span>
              <span className="mt-1.5 block text-[10px] text-white/45">{s.l}</span>
            </div>
          ))}
        </motion.div>
        {[
          { t: 'Maison Noir', m: 'Development · revision #12', s: '92', d: 'bg-[#ff7a45]' },
          { t: 'DataPulse', m: 'QA out · awaiting review', s: '88', d: 'bg-[#ff7a45]' },
          { t: 'HelpStream', m: 'Design · brief approved', s: '64', d: 'bg-amber-400' },
          { t: 'GrowthForge', m: 'New · intake form', s: '41', d: 'bg-sky-400/70' },
        ].map((r) => (
          <Row
            key={r.t}
            icon={TrendingUp}
            title={r.t}
            meta={r.m}
            right={
              <span className="flex items-center gap-2">
                <Dot tone={r.d} />
                <span className="w-6 text-right text-[12px] font-medium tabular-nums text-white/80">{r.s}</span>
              </span>
            }
          />
        ))}
      </Frost>
    ),
  },
  {
    key: 'comms',
    title: 'Message the team in one place',
    desc: 'Updates drafted in the house style across email and Slack, ready the moment you need them.',
    mockup: (
      <Frost title="Draft update" badge="House style">
        <motion.div variants={rowV} className="flex gap-1.5 px-1 pb-1">
          {[
            { icon: Mail, label: 'Email', on: true },
            { icon: Phone, label: 'Slack', on: false },
          ].map((t) => {
            const TIcon = t.icon;
            return (
              <span
                key={t.label}
                className={
                  'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] ' +
                  (t.on ? 'bg-white/[0.1] text-white' : 'text-white/45')
                }
              >
                <TIcon className="h-3 w-3" />
                {t.label}
              </span>
            );
          })}
        </motion.div>
        <Row icon={Home} title="To: Sarah Chen" meta="re: Phase 3 preview, ready?" tone="text-[#ff9a6e]" />
        <motion.div variants={rowV} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <p className="text-[12px] leading-relaxed text-white/75">
            Hi Sarah, good news, the Phase 3 preview is live. Want me to grab a Thursday
            slot so you can walk through it before launch?
          </p>
        </motion.div>
        <motion.div variants={rowV} className="flex items-center justify-between px-1 pt-1">
          <span className="text-[11px] text-white/40">Drafted from your last 40 updates</span>
          <span className="flex gap-2">
            <span className="rounded-full border border-white/15 px-3 py-1 text-[11px] text-white/70">Edit</span>
            <span className="flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[11px] font-medium text-black">
              <Send className="h-3 w-3" /> Send
            </span>
          </span>
        </motion.div>
      </Frost>
    ),
  },
  {
    key: 'busywork',
    title: 'Offload the busywork',
    desc: 'Scaffolding, tests, changelogs, scheduling, Helix clears the grind in the background.',
    mockup: (
      <Frost title="Running for you" badge="Auto">
        <Row icon={CheckCircle2} title="Deployed preview, Maison Noir" meta="build passed · link shared" tone="text-emerald-300/80" />
        <Row icon={CheckCircle2} title="Moved DataPulse → QA" meta="phase advanced · note logged" tone="text-emerald-300/80" />
        <Row icon={CheckCircle2} title="Logged call notes, HelpStream" meta="3 min call · summarized" tone="text-emerald-300/80" />
        <Row icon={RefreshCw} title="Drafting 4 status updates…" meta="active builds, due this week" tone="text-[#ff9a6e]" active />
        <Row icon={Inbox} title="Sorted 12 inbound messages" meta="across email, Slack, and forms" />
      </Frost>
    ),
  },
  {
    key: 'plan',
    title: 'Plan the launch',
    desc: 'A morning brief that lines up your reviews, calls, and priorities so every launch stays ahead.',
    mockup: (
      <Frost title="Today" badge="Tue · 8:00 AM">
        <motion.div variants={rowV} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <p className="text-[12px] leading-relaxed text-white/75">
            3 reviews, 2 calls, and 5 updates due. Maison Noir is closest to launch, start there.
          </p>
        </motion.div>
        <Row icon={Phone} title="9:00, Call Sarah" meta="fixed quote expires Friday" tone="text-[#ff9a6e]" active />
        <Row icon={Home} title="11:30, Review Phase 3" meta="with Sarah Chen" />
        <Row icon={Home} title="2:00, Preview walkthrough" meta="with the DataPulse team" />
        <Row icon={CalendarCheck} title="4:00, Follow up" meta="3 updates queued by Helix" />
      </Frost>
    ),
  },
];

export function AgentCanvas() {
  return (
    <FeatureShowcase
      eyebrow="Meet Helix"
      headline={
        <>
          Built to handle
          <br className="hidden sm:block" /> the whole build.
        </>
      }
      product={{
        name: 'Product OS',
        icon: LayoutGrid,
        desc: 'Helix is the operating system for your product build. It finds anything, senior-reviews your pipeline, drafts the boring parts, and clears the busywork, so your hours go to shipping.',
        cta: { label: 'Explore the Product OS', href: '/services' },
      }}
      topFeatures={TOP_FEATURES}
      steps={STEPS}
      image="/marketing/feature-1.jpg"
      imageSide="right"
    />
  );
}
