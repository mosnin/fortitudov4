'use client';

/**
 * RealtorShowcase, the realtor-dashboard feature section (image on the LEFT).
 * Same animated/frosted pattern as <AgentCanvas>, mirrored, focused on the real
 * features an agent uses day to day: lead qualification, deal pipelines,
 * contact management, tours, and a public profile.
 */

import {
  Home,
  LayoutDashboard,
  Gauge,
  Globe,
  CheckCircle2,
  Users,
  CalendarCheck,
  Star,
  Eye,
  BadgeCheck,
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
  { icon: LayoutDashboard, title: 'One workspace', desc: 'Brief to launch in a single view, on any device.' },
  { icon: Gauge, title: 'Fast by default', desc: 'Everything a tap away, no training required.' },
  { icon: Globe, title: 'Yours at launch', desc: 'Full source, design files, and infrastructure handed over — no lock-in.' },
];

const Chip = ({ label, tone }: { label: string; tone: string }) => (
  <span className={'rounded-[4px] px-2 py-0.5 text-[10px] font-medium ' + tone}>{label}</span>
);

const STEPS: ShowcaseStep[] = [
  {
    key: 'qualify',
    title: 'Build tracker',
    desc: 'Helix tracks every phase against your real plan and shows the reasons, so you always know what moves next.',
    mockup: (
      <Frost title="Build tracker" badge="Auto-tracked">
        <motion.div
          variants={rowV}
          className="flex items-center gap-3 rounded-[6px] border border-white/10 bg-white/[0.04] p-3"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#f8cd02] to-[#dcb602] text-[12px] font-semibold text-black">
            SC
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-medium text-white">Sarah Chen</span>
            <span className="block text-[11px] text-white/45">Founder · SaaS · MVP</span>
          </span>
          <span className="text-right">
            <span className="block text-[22px] font-semibold leading-none text-white">92</span>
            <span className="text-[10px] font-medium tracking-wide text-[#f8cd02]">ON TRACK</span>
          </span>
        </motion.div>
        {[
          { t: 'Phase 3 approved', s: '+30' },
          { t: 'Preview deployed in 3 min', s: '+18' },
          { t: 'Revision matches scope', s: '+22' },
          { t: 'Tests passing on main', s: '+22' },
        ].map((r) => (
          <Row
            key={r.t}
            icon={CheckCircle2}
            title={r.t}
            tone="text-emerald-300/80"
            right={<span className="text-[12px] font-medium tabular-nums text-white/70">{r.s}</span>}
          />
        ))}
      </Frost>
    ),
  },
  {
    key: 'pipeline',
    title: 'Fixed quotes',
    desc: 'One agreed number per build, every quote in the right stage, every next step in view.',
    mockup: (
      <Frost title="Fixed quotes" badge="6 active">
        <motion.div variants={rowV} className="grid grid-cols-4 gap-1.5 px-1 pb-2">
          {[
            { n: '3', l: 'New' },
            { n: '2', l: 'Scoping' },
            { n: '1', l: 'Quoted' },
            { n: '1', l: 'Approved' },
          ].map((s) => (
            <div key={s.l} className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-2 text-center">
              <span className="block text-[16px] font-semibold leading-none text-white">{s.n}</span>
              <span className="mt-1 block text-[9px] text-white/45">{s.l}</span>
            </div>
          ))}
        </motion.div>
        <Row icon={Home} title="Marketing site" meta="Maison Noir · $6.4k" right={<Chip label="Scoping" tone="bg-[#f8cd02]/15 text-[#f8cd02]" />} />
        <Row icon={Home} title="Ecommerce build" meta="Verde Botanica · $7.2k" right={<Chip label="Quoted" tone="bg-sky-400/15 text-sky-300" />} />
        <Row icon={Home} title="Booking funnel" meta="Atlas Ops · $5.1k" right={<Chip label="Approved" tone="bg-emerald-400/15 text-emerald-300" />} />
      </Frost>
    ),
  },
  {
    key: 'contacts',
    title: 'Revisions',
    desc: 'Every revision request in one place, tagged, tracked, and always up to date.',
    mockup: (
      <Frost title="Revisions" badge="This week">
        <Row icon={Users} title="Hero copy tweak" meta="requested 2 days ago" right={<Chip label="Open" tone="bg-[#f8cd02]/15 text-[#f8cd02]" />} />
        <Row icon={Users} title="Checkout flow fix" meta="reported 1 week ago" right={<Chip label="In QA" tone="bg-sky-400/15 text-sky-300" />} />
        <Row icon={Users} title="New pricing page" meta="requested today" right={<Chip label="Open" tone="bg-[#f8cd02]/15 text-[#f8cd02]" />} />
        <Row icon={Users} title="Logo swap" meta="new, via portal" right={<Chip label="Queued" tone="bg-white/10 text-white/60" />} />
        <Row icon={Users} title="Dark mode" meta="shipped · v2.3" right={<Chip label="Shipped" tone="bg-emerald-400/15 text-emerald-300" />} />
      </Frost>
    ),
  },
  {
    key: 'tours',
    title: 'Messages',
    desc: 'Every thread in one inbox, with the project attached, so nothing gets lost in email.',
    mockup: (
      <Frost title="Messages" badge="This week">
        <Row icon={CalendarCheck} title="Sat 2:00, Phase 3 review" meta="Sarah Chen" tone="text-[#f8cd02]" right={<Chip label="Confirmed" tone="bg-emerald-400/15 text-emerald-300" />} active />
        <Row icon={CalendarCheck} title="Sun 11:00, scope call" meta="Verde Botanica" right={<Chip label="Confirmed" tone="bg-emerald-400/15 text-emerald-300" />} />
        <Row icon={CalendarCheck} title="Mon 4:30, launch prep" meta="Atlas Ops" right={<Chip label="Pending" tone="bg-amber-400/15 text-amber-300" />} />
        <Row icon={CalendarCheck} title="Wed 1:00, kickoff" meta="GrowthForge" right={<Chip label="Requested" tone="bg-white/10 text-white/60" />} />
      </Frost>
    ),
  },
  {
    key: 'profile',
    title: 'Launch checklist',
    desc: 'Everything the launch needs in one list — domain, analytics, handover — checked off as Helix and the team clear it.',
    mockup: (
      <Frost title="Launch checklist" badge="Live">
        <motion.div variants={rowV} className="flex items-center gap-3 rounded-[6px] border border-white/10 bg-white/[0.04] p-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#f8cd02] to-[#dcb602] text-[14px] font-semibold text-black">
            MN
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5 text-[13px] font-medium text-white">
              Maison Noir
              <BadgeCheck className="h-3.5 w-3.5 text-[#f8cd02]" />
            </span>
            <span className="block text-[11px] text-white/45">Ecommerce build · launches Friday</span>
          </span>
          <span className="flex items-center gap-1 text-[12px] text-white/80">
            <Star className="h-3.5 w-3.5 fill-current text-amber-300" /> 4.9
          </span>
        </motion.div>
        <motion.div variants={rowV} className="grid grid-cols-3 gap-1.5">
          {[
            { n: '32', l: 'Checks' },
            { n: '128', l: 'Done' },
            { n: '87', l: 'Automated' },
          ].map((s) => (
            <div key={s.l} className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-2.5 text-center">
              <span className="block text-[17px] font-semibold leading-none text-white">{s.n}</span>
              <span className="mt-1 block text-[9px] text-white/45">{s.l}</span>
            </div>
          ))}
        </motion.div>
        <Row icon={Eye} title="preview.fortitudo.agency/maison-noir" meta="1,240 views this month" right={<Chip label="Share" tone="bg-white/10 text-white/60" />} />
      </Frost>
    ),
  },
];

export function RealtorShowcase() {
  return (
    <FeatureShowcase
      eyebrow="Built for founders"
      headline={
        <>
          Run your whole project,
          <br className="hidden sm:block" /> from one screen.
        </>
      }
      product={{
        name: 'Client Dashboard',
        icon: Home,
        desc: 'The home base for your build. Track phases, approve revisions, message the team, and watch Helix work — all from one dashboard.',
        cta: { label: 'Explore the dashboard', href: '/sign-up' },
      }}
      topFeatures={TOP_FEATURES}
      steps={STEPS}
      image="/marketing/feature-2.jpg"
      imageSide="left"
    />
  );
}
