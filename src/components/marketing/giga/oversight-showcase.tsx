'use client';

/**
 * OversightShowcase, the agency-dashboard feature section (image on the RIGHT,
 * alternating after the delivery section). Same animated/frosted pattern,
 * focused on what whoever runs the studio watches: project routing, the studio
 * live, team performance, roles & approvals, and fixed-quote billing.
 *
 * Was "brokerage-showcase", a real-estate template leftover, and it carried a
 * staff roster of four invented people — Fortitudo has no built-in staff, every
 * roster reads from the database, and AGENTS.md says so. The volume, launch and
 * reply-rate figures went with them: performance numbers are the one thing on a
 * page like this that a reader will take literally. Placeholder builders keep
 * the layout; the aggregate tiles hold an em-dash rather than a total.
 */

import {
  Building2,
  ArrowRightLeft,
  Waypoints,
  Activity,
  ShieldCheck,
  CheckCircle2,
  Users,
  TrendingUp,
  CreditCard,
  UserPlus,
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  FeatureShowcase,
  Frost,
  Row,
  rowV,
  type ShowcaseStep,
} from './feature-showcase';

const TOP_FEATURES = [
  { icon: Waypoints, title: 'Routing on arrival', desc: 'New projects go to the right senior with the reason logged.' },
  { icon: Activity, title: 'The studio, live', desc: "See every build's phase and load at a glance." },
  { icon: ShieldCheck, title: 'Audit-ready', desc: 'Every action logged with who and why.' },
];

const Chip = ({ label, tone }: { label: string; tone: string }) => (
  <span className={'rounded-[4px] px-2 py-0.5 text-[10px] font-medium ' + tone}>{label}</span>
);

const STEPS: ShowcaseStep[] = [
  {
    key: 'routing',
    title: 'Project routing',
    desc: 'New projects are auto-assigned to the right senior by specialty and load, or hand-pick and write the brief. Every assignment is logged with the reason.',
    mockup: (
      <Frost title="Project routing" badge="Auto">
        <motion.div variants={rowV} className="flex items-center gap-3 rounded-[6px] border border-white/10 bg-white/[0.04] p-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#f8cd02] to-[#dcb602] text-[12px] font-semibold text-black">
            CA
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-medium text-white">Client A</span>
            <span className="block text-[11px] text-white/45">Ecommerce build · fixed quote</span>
          </span>
          <Chip label="New" tone="bg-white/10 text-white/60" />
        </motion.div>
        <Row icon={ArrowRightLeft} title="Assigned → the ecommerce lead" meta="matched specialty · lowest load" tone="text-[#f8cd02]" active />
        <Row icon={CheckCircle2} title="Matched specialty: Ecommerce" tone="text-emerald-300/80" />
        <Row icon={CheckCircle2} title="Balanced by active load" tone="text-emerald-300/80" />
        <Row icon={CheckCircle2} title="Logged with reason" tone="text-emerald-300/80" />
      </Frost>
    ),
  },
  {
    key: 'floor',
    title: 'The studio, live',
    desc: 'Builds active, drafts pending, reviews due, per builder, read live from the work itself, not a Monday status meeting.',
    mockup: (
      <Frost title="The studio" badge="Live">
        {/* "35 Builders / 142 Builds / 28 Due today" sized an agency that does
            not exist at that scale, and the four rows below named staff nobody
            hired. Every roster in this product reads from the database. */}
        <motion.div variants={rowV} className="grid grid-cols-3 gap-2 px-1 pb-2">
          {[
            { n: '—', l: 'Builders' },
            { n: '—', l: 'Builds' },
            { n: '—', l: 'Due today' },
          ].map((s) => (
            <div key={s.l} className="rounded-[6px] border border-white/[0.08] bg-white/[0.03] p-3 text-center">
              <span className="block text-[20px] font-semibold leading-none text-white">{s.n}</span>
              <span className="mt-1.5 block text-[10px] text-white/45">{s.l}</span>
            </div>
          ))}
        </motion.div>
        <Row icon={Users} title="Builder A" meta="3 active · 1 draft" right={<Chip label="2 due" tone="bg-amber-400/15 text-amber-300" />} />
        <Row icon={Users} title="Builder B" meta="2 active · 1 draft" right={<Chip label="1 due" tone="bg-white/10 text-white/60" />} />
        <Row icon={Users} title="Builder C" meta="4 active · 2 drafts" right={<Chip label="3 due" tone="bg-[#f8cd02]/15 text-[#f8cd02]" />} />
        <Row icon={Users} title="Builder D" meta="2 active · 0 drafts" right={<Chip label="clear" tone="bg-emerald-400/15 text-emerald-300" />} />
      </Frost>
    ),
  },
  {
    key: 'performance',
    title: 'Team performance',
    desc: 'Volume, launches, and response times across the whole team, surfaced automatically so you coach the right builders on the right things.',
    mockup: (
      <Frost title="Performance" badge="This month">
        {/* "$4.2M Volume / 18 Launched / 94% Reply rate" was revenue and
            throughput reported for an agency that has published no such figures,
            and the leaderboard under it ranked invented staff by invented money. */}
        <motion.div variants={rowV} className="grid grid-cols-3 gap-2 px-1 pb-2">
          {[
            { n: '—', l: 'Volume' },
            { n: '—', l: 'Launched' },
            { n: '—', l: 'Reply rate' },
          ].map((s) => (
            <div key={s.l} className="rounded-[6px] border border-white/[0.08] bg-white/[0.03] p-3 text-center">
              <span className="block text-[18px] font-semibold leading-none text-white">{s.n}</span>
              <span className="mt-1.5 block text-[10px] text-white/45">{s.l}</span>
            </div>
          ))}
        </motion.div>
        <Row icon={TrendingUp} title="Builder A" meta="3 launched" tone="text-[#f8cd02]" right={<span className="text-[12px] font-medium text-white/70">#1</span>} active />
        <Row icon={TrendingUp} title="Builder B" meta="2 launched" right={<span className="text-[12px] font-medium text-white/55">#2</span>} />
        <Row icon={TrendingUp} title="Builder C" meta="1 launched" right={<span className="text-[12px] font-medium text-white/55">#3</span>} />
      </Frost>
    ),
  },
  {
    key: 'roles',
    title: 'Roles & approvals',
    desc: 'Three roles, no permissions maze. Helix drafts; every change ships through the right person, and the audit log keeps the whole studio honest.',
    mockup: (
      <Frost title="Approvals" badge="Audit on">
        {/* "3 approvals in the last hour" was throughput from no log at all.
            The rule it was standing in for is true and worth saying instead. */}
        <motion.div variants={rowV} className="rounded-[6px] border border-white/10 bg-white/[0.03] p-3 text-[12px] text-white/75">
          Every change waits here until a person takes it
        </motion.div>
        <Row icon={ShieldCheck} title="Reply to Client A" meta="email · house style" tone="text-[#f8cd02]" right={<Chip label="Sent" tone="bg-[#f8cd02]/15 text-[#f8cd02]" />} active />
        <Row icon={ShieldCheck} title="Deploy preview, Client B" meta="preview to client" right={<Chip label="Shipped" tone="bg-white/10 text-white/60" />} />
        <motion.div variants={rowV} className="flex gap-1.5 px-1 pt-1">
          {['Owner', 'Admin', 'Builder'].map((r, i) => (
            <Chip key={r} label={r} tone={i === 0 ? 'bg-white/[0.1] text-white' : 'bg-white/[0.04] text-white/50'} />
          ))}
        </motion.div>
        {/* "1,204 audit entries" counted a log that has never been written to.
            What the log records is the claim; how full it is, is not. */}
        <Row icon={CheckCircle2} title="Every action logged" meta="who, what, and why" tone="text-emerald-300/80" />
      </Frost>
    ),
  },
  {
    key: 'seats',
    title: 'Fixed-quote billing',
    desc: 'One agreed number per build, no hourly creep, with quotes, invoices, and usage always in view.',
    mockup: (
      <Frost title="Fixed-quote billing" badge="Studio plan">
        <motion.div variants={rowV} className="rounded-[6px] border border-white/10 bg-white/[0.03] p-3">
          {/* "18 / 20" read as the studio's billing to date. Scoped to a single
              build, the fraction shows the bar without totalling anything. */}
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-white/75">Milestones invoiced · this build</span>
            <span className="font-medium text-white">3 / 4</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-[75%] rounded-full bg-gradient-to-r from-[#f8cd02] to-[#dcb602]" />
          </div>
        </motion.div>
        <Row icon={CreditCard} title="Fixed quote · per build" meta="50% up front · balance at launch" tone="text-[#f8cd02]" />
        <Row icon={UserPlus} title="Invoiced Client A" meta="milestone · today" tone="text-emerald-300/80" />
        <Row icon={Users} title="Settled Client B" meta="final invoice last week" />
      </Frost>
    ),
  },
];

export function OversightShowcase() {
  return (
    <FeatureShowcase
      eyebrow="Built for teams"
      headline={
        <>
          One agent behind
          <br className="hidden sm:block" /> every build.
        </>
      }
      product={{
        name: 'Agency Dashboard',
        icon: Building2,
        desc: 'Run the whole studio from one place. Route work, watch progress live, manage every build, with every action on the audit log.',
        cta: { label: 'Explore the studio', href: '/services' },
      }}
      topFeatures={TOP_FEATURES}
      steps={STEPS}
      image="/marketing/feature-3.jpg"
      imageSide="right"
    />
  );
}
