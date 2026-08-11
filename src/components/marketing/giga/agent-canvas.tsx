'use client';

/**
 * AgentCanvas, the Product OS feature section (image on the RIGHT).
 * Thin config over the shared <FeatureShowcase>; the frosted, detailed mockups
 * (search, pipeline, draft reply, automation feed, daily agenda) live here.
 *
 * The panels used to be populated with a named contact ("Sarah Chen"), four
 * named client companies with health scores, a response-time badge and a
 * pipeline count — none of which came from anywhere. The same fabrications were
 * already stripped from /portfolio, so they are gone here too. What is left is
 * the shape of the interface with placeholder tenants, and <FeatureShowcase>
 * captions the whole card as an illustration.
 */

import {
  LayoutGrid,
  Library,
  PenLine,
  ScrollText,
  Search,
  Users,
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
    // The "0.4s" badge was a latency nobody measured, so it is gone; Frost falls
    // back to its window dots when no badge is passed.
    mockup: (
      <Frost title="Ask Helix">
        <motion.div
          variants={rowV}
          className="flex items-center gap-2.5 rounded-[6px] border border-white/10 bg-white/[0.04] px-3 py-2.5"
        >
          <Search className="h-3.5 w-3.5 text-white/45" />
          <span className="text-[12.5px] text-white/85">Client A, build status + next milestone</span>
          <span className="ml-auto h-3 w-px animate-pulse bg-white/40" />
        </motion.div>
        <Row icon={Users} title="Client A" meta="Founder · fixed quote approved" tone="text-[#f8cd02]" active />
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
    // The tiles used to read "24 Active / 6 In review / 3 Launching" and the
    // rows carried named clients with health scores. Both were invented, and a
    // caseload count is a claim about the agency, not a piece of UI chrome — so
    // the tiles keep their shape with an em-dash and the rows keep placeholders.
    mockup: (
      <Frost title="Pipeline" badge="Live">
        <motion.div variants={rowV} className="grid grid-cols-3 gap-2 px-1 pb-2">
          {[
            { n: '—', l: 'Active' },
            { n: '—', l: 'In review' },
            { n: '—', l: 'Launching' },
          ].map((s) => (
            <div key={s.l} className="rounded-[6px] border border-white/[0.08] bg-white/[0.03] p-3 text-center">
              <span className="block text-[20px] font-semibold leading-none text-white">{s.n}</span>
              <span className="mt-1.5 block text-[10px] text-white/45">{s.l}</span>
            </div>
          ))}
        </motion.div>
        {[
          { t: 'Client A', m: 'Development · revision in flight', d: 'bg-[#f8cd02]' },
          { t: 'Client B', m: 'QA out · awaiting review', d: 'bg-[#f8cd02]' },
          { t: 'Client C', m: 'Design · brief approved', d: 'bg-amber-400' },
          { t: 'Client D', m: 'New · intake form', d: 'bg-sky-400/70' },
        ].map((r) => (
          <Row
            key={r.t}
            icon={TrendingUp}
            title={r.t}
            meta={r.m}
            right={<Dot tone={r.d} />}
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
        <Row icon={Users} title="To: Client A" meta="re: Phase 3 preview, ready?" tone="text-[#f8cd02]" />
        <motion.div variants={rowV} className="rounded-[6px] border border-white/10 bg-white/[0.03] p-3">
          <p className="text-[12px] leading-relaxed text-white/75">
            Good news, the Phase 3 preview is live. Want me to grab a Thursday
            slot so you can walk through it before launch?
          </p>
        </motion.div>
        <motion.div variants={rowV} className="flex items-center justify-between px-1 pt-1">
          {/* "Drafted from your last 40 updates" put a number on a corpus that
              does not exist yet. The mechanism is the point, not the count. */}
          <span className="text-[11px] text-white/40">Drafted from your project history</span>
          <span className="flex gap-2">
            <span className="rounded-[4px] border border-white/15 px-3 py-1 text-[11px] text-white/70">Edit</span>
            <span className="flex items-center gap-1 rounded-[4px] bg-[var(--fx-yellow)] px-3 py-1 text-[11px] font-medium text-[var(--fx-on-yellow)]">
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
        <Row icon={CheckCircle2} title="Deployed preview, Client A" meta="build passed · link shared" tone="text-emerald-300/80" />
        <Row icon={CheckCircle2} title="Moved Client B → QA" meta="phase advanced · note logged" tone="text-emerald-300/80" />
        <Row icon={CheckCircle2} title="Logged call notes, Client C" meta="call summarized" tone="text-emerald-300/80" />
        <Row icon={RefreshCw} title="Drafting status updates…" meta="active builds, due this week" tone="text-[#f8cd02]" active />
        <Row icon={Inbox} title="Sorted the inbound queue" meta="across email, Slack, and forms" />
      </Frost>
    ),
  },
  {
    key: 'plan',
    title: 'Plan the launch',
    desc: 'A morning brief that lines up your reviews, calls, and priorities so every launch stays ahead.',
    mockup: (
      <Frost title="Today" badge="Tue · 8:00 AM">
        <motion.div variants={rowV} className="rounded-[6px] border border-white/10 bg-white/[0.03] p-3">
          <p className="text-[12px] leading-relaxed text-white/75">
            Your reviews, calls, and updates for today. Client A is closest to launch, start there.
          </p>
        </motion.div>
        <Row icon={Phone} title="9:00, Client call" meta="fixed quote expires Friday" tone="text-[#f8cd02]" active />
        <Row icon={Users} title="11:30, Review Phase 3" meta="with Client A" />
        <Row icon={Users} title="2:00, Preview walkthrough" meta="with the Client B team" />
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
