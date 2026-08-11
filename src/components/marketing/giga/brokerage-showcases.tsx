'use client';

/**
 * Brokerage feature showcases (plural), three focused animated sections that
 * each spotlight one brokerage capability with a distinct frosted mockup:
 *
 *   - BrokerageRoutingShowcase  : how a lead is routed on arrival (decision flow
 *                                 with per-agent load bars and an audit line).
 *   - BrokerageFloorShowcase    : the live floor (metric tiles + a leaderboard).
 *   - BrokerageApprovalsShowcase: accountable sends (live send feed + a
 *                                 vertical audit timeline).
 *
 * All three reuse the FeatureShowcase shell and the Frost/Row mockup kit, and
 * borrow brokerage-showcase's visual vocabulary (tiles, chips, bars) while
 * keeping every mockup visually distinct.
 */

import {
  Waypoints,
  Scale,
  ClipboardCheck,
  Check,
  Activity,
  Users,
  TrendingUp,
  ShieldCheck,
  UserCog,
  ScrollText,
  Send,
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  FeatureShowcase,
  Frost,
  rowV,
  type ShowcaseStep,
} from './feature-showcase';

/* ── Shared local helpers ──────────────────────────────────────────────────── */

const Chip = ({ label, tone }: { label: string; tone: string }) => (
  <span className={'rounded-[4px] px-2 py-0.5 text-[10px] font-medium ' + tone}>{label}</span>
);

/** Avatar with initials, sized like brokerage-showcase's lead card avatar. */
const Avatar = ({ initials, accent }: { initials: string; accent?: boolean }) => (
  <span
    className={
      'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ' +
      (accent
        ? 'bg-gradient-to-br from-[#f8cd02] to-[#ff5fa2] text-black'
        : 'border border-white/10 bg-white/[0.05] text-white/70')
    }
  >
    {initials}
  </span>
);

/** A thin horizontal capacity/volume bar. */
const Bar = ({ pct, muted }: { pct: number; muted?: boolean }) => (
  <span className="block h-1.5 w-full overflow-hidden rounded-full bg-white/10">
    <span
      className={
        'block h-full rounded-full ' +
        (muted ? 'bg-white/25' : 'bg-gradient-to-r from-[#f8cd02] to-[#ff5fa2]')
      }
      style={{ width: pct + '%' }}
    />
  </span>
);

/* ── 1) Routing ────────────────────────────────────────────────────────────── */

const ROUTING_STEPS: ShowcaseStep[] = [
  {
    key: 'arrive',
    title: 'A project arrives',
    desc: 'A new project brief lands and enters routing instantly, no one has to triage the inbox first.',
    mockup: (
      <Frost title="Routing" badge="Auto">
        <motion.div
          variants={rowV}
          className="flex items-center gap-3 rounded-[6px] border border-white/10 bg-white/[0.04] p-3"
        >
          <Avatar initials="SC" accent />
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-medium text-white">Sarah Chen</span>
            <span className="block text-[11px] text-white/45">Ecommerce build · fixed quote</span>
          </span>
          <Chip label="New" tone="bg-white/10 text-white/60" />
        </motion.div>
        <motion.div variants={rowV} className="px-1 pt-1 text-[11px] text-white/45">
          Finding the right senior in the studio.
        </motion.div>
      </Frost>
    ),
  },
  {
    key: 'weigh',
    title: 'Helix weighs the studio',
    desc: 'Candidate seniors are scored by specialty fit and current load, so the project goes to the right builder with room to work it.',
    mockup: (
      <Frost title="Candidates">
        {[
          { initials: 'AR', name: 'Alex Rivera', meta: '12 active', pct: 60 },
          { initials: 'JK', name: 'Jordan Kim', meta: '9 active', pct: 42 },
          { initials: 'SP', name: 'Sam Patel', meta: '14 active', pct: 78 },
        ].map((a) => (
          <motion.div
            key={a.initials}
            variants={rowV}
            className="flex items-center gap-3 rounded-[6px] px-3 py-2.5"
          >
            <Avatar initials={a.initials} />
            <span className="min-w-0 flex-1">
              <span className="mb-1.5 flex items-center justify-between gap-2">
                <span className="truncate text-[12.5px] font-medium text-white">{a.name}</span>
                <span className="flex-shrink-0 text-[11px] text-white/45">{a.meta}</span>
              </span>
              <Bar pct={a.pct} muted />
            </span>
          </motion.div>
        ))}
      </Frost>
    ),
  },
  {
    key: 'assign',
    title: 'Assigned, with the reason',
    desc: 'The best match is chosen and the reasoning is attached, specialty matched, lowest load, so the call is never a black box.',
    mockup: (
      <Frost title="Assigned">
        <motion.div
          variants={rowV}
          className="flex items-center gap-3 rounded-[6px] border border-[#f8cd02]/40 bg-[#f8cd02]/[0.08] p-3 ring-1 ring-[#f8cd02]/30"
        >
          <Avatar initials="AR" accent />
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-medium text-white">Alex Rivera</span>
            <span className="block text-[11px] text-white/55">Chosen builder</span>
          </span>
          <Chip label="Assigned" tone="bg-[#f8cd02]/15 text-[#f8cd02]" />
        </motion.div>
        <motion.div variants={rowV} className="flex flex-wrap gap-1.5 px-1 pt-1.5">
          <Chip label="Ecommerce specialty" tone="bg-emerald-400/15 text-emerald-300" />
          <Chip label="Lowest load" tone="bg-emerald-400/15 text-emerald-300" />
        </motion.div>
      </Frost>
    ),
  },
  {
    key: 'log',
    title: 'Logged for the record',
    desc: 'The assignment is written to the audit log with its reason and timestamp, so the whole studio can trace how the project landed.',
    mockup: (
      <Frost title="Audit">
        <motion.div
          variants={rowV}
          className="flex items-center gap-3 rounded-[6px] border border-white/10 bg-white/[0.03] p-3"
        >
          <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
            <Check className="h-3.5 w-3.5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[12.5px] font-medium text-white">Assigned to Alex Rivera</span>
            <span className="block text-[11px] text-white/45">reason logged · 2:14 PM</span>
          </span>
        </motion.div>
      </Frost>
    ),
  },
];

export function BrokerageRoutingShowcase() {
  return (
    <FeatureShowcase
      eyebrow="Projects routed on arrival"
      headline={
        <>
          The right senior,
          <br className="hidden sm:block" /> the moment a project lands.
        </>
      }
      product={{
        name: 'Smart Routing',
        icon: Waypoints,
        desc: 'New projects are auto-assigned by specialty and load, or hand-picked with a brief. Every assignment is logged with the reason.',
        cta: { label: 'See it work', href: '/contact' },
      }}
      topFeatures={[
        { icon: Waypoints, title: 'By specialty and load', desc: 'The right builder, every time.' },
        { icon: Scale, title: 'Balanced automatically', desc: 'No builder buried, none idle.' },
        { icon: ClipboardCheck, title: 'Logged with the reason', desc: 'Every assignment on the record.' },
      ]}
      steps={ROUTING_STEPS}
      image="/marketing/brokerages-1.jpg"
      imageSide="right"
    />
  );
}

/* ── 2) Floor ──────────────────────────────────────────────────────────────── */

const FLOOR_STEPS: ShowcaseStep[] = [
  {
    key: 'today',
    title: 'Today, at a glance',
    desc: 'Headcount, builds in flight, and what is due today, read live from the work so the studio is never a guess.',
    mockup: (
      <Frost title="The studio" badge="Live">
        <motion.div variants={rowV} className="grid grid-cols-3 gap-2 px-1 py-1">
          {[
            { n: '35', l: 'Builders' },
            { n: '142', l: 'Builds' },
            { n: '28', l: 'Due today' },
          ].map((s) => (
            <div key={s.l} className="rounded-[6px] border border-white/[0.08] bg-white/[0.03] p-3 text-center">
              <span className="block text-[20px] font-semibold leading-none text-white">{s.n}</span>
              <span className="mt-1.5 block text-[10px] text-white/45">{s.l}</span>
            </div>
          ))}
        </motion.div>
      </Frost>
    ),
  },
  {
    key: 'top',
    title: 'Who is on top',
    desc: 'A live leaderboard by volume, so you see who is carrying the studio without waiting for a report.',
    mockup: (
      <Frost title="Leaderboard">
        {[
          { initials: 'AR', name: 'Alex Rivera', meta: '$1.6M', pct: 100, rank: '#1' },
          { initials: 'JK', name: 'Jordan Kim', meta: '$1.3M', pct: 80, rank: '#2' },
          { initials: 'SP', name: 'Sam Patel', meta: '$1.1M', pct: 68, rank: '#3' },
        ].map((a) => (
          <motion.div
            key={a.initials}
            variants={rowV}
            className="flex items-center gap-3 rounded-[6px] px-3 py-2.5"
          >
            <Avatar initials={a.initials} />
            <span className="min-w-0 flex-1">
              <span className="mb-1.5 flex items-center justify-between gap-2">
                <span className="truncate text-[12.5px] font-medium text-white">{a.name}</span>
                <span className="flex-shrink-0 text-[11px] text-white/45">{a.meta}</span>
              </span>
              <Bar pct={a.pct} />
            </span>
            <span className="flex-shrink-0 text-[12px] font-medium text-white/70">{a.rank}</span>
          </motion.div>
        ))}
      </Frost>
    ),
  },
  {
    key: 'stuck',
    title: 'Where it is stuck',
    desc: 'Bottlenecks surface on their own, drafts piling up for review and builds that have gone quiet, so nothing stalls in silence.',
    mockup: (
      <Frost title="Attention">
        <motion.div
          variants={rowV}
          className="flex items-center gap-3 rounded-[6px] border border-amber-400/20 bg-amber-400/[0.08] px-3 py-2.5"
        >
          <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-amber-400/20 bg-amber-400/10 text-amber-300">
            <ClipboardCheck className="h-3.5 w-3.5" />
          </span>
          <span className="min-w-0 flex-1 text-[12.5px] font-medium text-white">8 drafts waiting on review</span>
          <Chip label="Review" tone="bg-amber-400/15 text-amber-300" />
        </motion.div>
        <motion.div
          variants={rowV}
          className="flex items-center gap-3 rounded-[6px] border border-white/[0.08] bg-white/[0.03] px-3 py-2.5"
        >
          <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white/55">
            <Activity className="h-3.5 w-3.5" />
          </span>
          <span className="min-w-0 flex-1 text-[12.5px] font-medium text-white">3 builds quiet 3+ days</span>
          <Chip label="Nudge" tone="bg-white/10 text-white/60" />
        </motion.div>
      </Frost>
    ),
  },
  {
    key: 'month',
    title: 'This month',
    desc: 'Volume, launches, and reply rate month to date, the numbers a studio lead actually runs the team on.',
    mockup: (
      <Frost title="Performance" badge="MTD">
        <motion.div variants={rowV} className="grid grid-cols-3 gap-2 px-1 py-1">
          {[
            { n: '$4.2M', l: 'Volume' },
            { n: '18', l: 'Launched' },
            { n: '94%', l: 'Reply rate' },
          ].map((s) => (
            <div key={s.l} className="rounded-[6px] border border-white/[0.08] bg-white/[0.03] p-3 text-center">
              <span className="block text-[18px] font-semibold leading-none text-white">{s.n}</span>
              <span className="mt-1.5 block text-[10px] text-white/45">{s.l}</span>
            </div>
          ))}
        </motion.div>
      </Frost>
    ),
  },
];

export function BrokerageFloorShowcase() {
  return (
    <FeatureShowcase
      eyebrow="The studio, live"
      headline={
        <>
          The whole studio,
          <br className="hidden sm:block" /> in one glance.
        </>
      }
      product={{
        name: 'Studio View',
        icon: Activity,
        desc: 'Builds, drafts, follow-ups, and launches per builder, read live from the work itself, not a Monday status meeting.',
        cta: { label: 'See it work', href: '/contact' },
      }}
      topFeatures={[
        { icon: Activity, title: 'Live, not weekly', desc: 'Read straight from the work.' },
        { icon: Users, title: 'Per builder', desc: 'Pipeline and load for everyone.' },
        { icon: TrendingUp, title: 'Spot the bottleneck', desc: 'See where builds are stuck.' },
      ]}
      steps={FLOOR_STEPS}
      image="/marketing/brokerages-2.jpg"
      imageSide="left"
    />
  );
}

/* ── 3) Oversight & audit ──────────────────────────────────────────────────── */

const SentBtn = () => (
  <span className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-[#f8cd02] to-[#ff5fa2] px-2 py-1 text-[10px] font-semibold text-black">
    <Check className="h-3 w-3" /> Sent
  </span>
);

const APPROVALS_STEPS: ShowcaseStep[] = [
  {
    key: 'feed',
    title: 'Every send, on the record',
    desc: 'Every send lands on one live feed with who it came from and what it did, in one line.',
    mockup: (
      <Frost title="Sends" badge="Live">
        {[
          { initials: 'AR', who: 'Alex', action: 'reply to Sarah Chen', meta: 'email · house style' },
          { initials: 'JK', who: 'Jordan', action: 'scope update, DataPulse', meta: 'email to client' },
        ].map((q) => (
          <motion.div
            key={q.action}
            variants={rowV}
            className="rounded-[6px] border border-white/10 bg-white/[0.03] p-3"
          >
            <div className="flex items-center gap-3">
              <Avatar initials={q.initials} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12.5px] font-medium text-white">
                  {q.who} → {q.action}
                </span>
                <span className="block truncate text-[11px] text-white/45">{q.meta}</span>
              </span>
            </div>
            <div className="mt-2.5 flex justify-end gap-1.5">
              <SentBtn />
            </div>
          </motion.div>
        ))}
      </Frost>
    ),
  },
  {
    key: 'read',
    title: 'Read any send in full',
    desc: 'Open any send and read exactly what went out, word for word, without chasing screenshots.',
    mockup: (
      <Frost title="On the record">
        <motion.div
          variants={rowV}
          className="rounded-[6px] border border-white/10 bg-white/[0.03] p-3"
        >
          <div className="flex items-center gap-3">
            <Avatar initials="AR" />
            <span className="min-w-0 flex-1">
              <span className="block text-[12.5px] font-medium text-white">Alex → reply to Sarah Chen</span>
              <span className="block text-[11px] text-white/45">email · house style</span>
            </span>
          </div>
          <p className="mt-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5 text-[11.5px] leading-relaxed text-white/65">
            Hi Sarah, the checkout flow you flagged is fixed and live on the preview. Want me to
            set up a walkthrough this weekend?
          </p>
          <div className="mt-3 flex justify-end">
            <span className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#f8cd02] to-[#ff5fa2] px-3 py-1.5 text-[11px] font-semibold text-black">
              <Send className="h-3 w-3" /> Sent 2:14 PM
            </span>
          </div>
        </motion.div>
      </Frost>
    ),
  },
  {
    key: 'roles',
    title: 'Roles, not a maze',
    desc: 'Three clear roles instead of a permissions matrix, so everyone knows exactly what they can see and run.',
    mockup: (
      <Frost title="Access">
        <motion.div variants={rowV} className="flex flex-wrap gap-1.5 px-1 py-1">
          <Chip label="Owner" tone="bg-[#f8cd02]/15 text-[#f8cd02]" />
          <Chip label="Admin" tone="bg-white/[0.08] text-white/70" />
          <Chip label="Builder" tone="bg-white/[0.04] text-white/50" />
        </motion.div>
        <motion.div
          variants={rowV}
          className="flex items-center gap-3 rounded-[6px] border border-white/10 bg-white/[0.03] px-3 py-2.5"
        >
          <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-[#f8cd02]">
            <UserCog className="h-3.5 w-3.5" />
          </span>
          <span className="min-w-0 flex-1 text-[12px] text-white/75">
            Owners and admins see the whole studio, builders run their own projects.
          </span>
        </motion.div>
      </Frost>
    ),
  },
  {
    key: 'audit',
    title: 'The audit log',
    desc: 'Every action is timestamped on one running log, so the whole studio stays honest and traceable.',
    mockup: (
      <Frost title="Audit log">
        <motion.div variants={rowV} className="relative pl-5">
          <span aria-hidden className="absolute left-[3px] top-1 bottom-1 w-px bg-white/12" />
          {[
            { action: 'Owner approved reply to Sarah Chen', meta: '2:14 PM', accent: true },
            { action: 'Alex drafted scope update, DataPulse', meta: '1:58 PM', accent: false },
            { action: 'Jordan sent scope update, DataPulse', meta: '1:40 PM', accent: false },
            { action: 'Project assigned to Alex Rivera', meta: '1:22 PM', accent: false },
          ].map((e, i) => (
            <span key={i} className="relative mb-3 block last:mb-0">
              <span
                aria-hidden
                className={
                  'absolute -left-[17px] top-1 h-2 w-2 rounded-full ring-2 ring-[#0b0b0d] ' +
                  (e.accent ? 'bg-gradient-to-br from-[#f8cd02] to-[#ff5fa2]' : 'bg-white/30')
                }
              />
              <span className="block text-[12px] font-medium text-white">{e.action}</span>
              <span className="mt-0.5 flex items-center gap-1 text-[11px] text-white/45">
                <ScrollText className="h-3 w-3" /> {e.meta}
              </span>
            </span>
          ))}
        </motion.div>
      </Frost>
    ),
  },
];

export function BrokerageApprovalsShowcase() {
  return (
    <FeatureShowcase
      eyebrow="Every change accountable"
      headline={
        <>
          Nothing ships
          <br className="hidden sm:block" /> without a name on it.
        </>
      }
      product={{
        name: 'Oversight & Audit',
        icon: ShieldCheck,
        desc: 'Helix works every build in the studio, and every change lands on the record with a name, a timestamp, and exactly what shipped.',
        cta: { label: 'See it work', href: '/contact' },
      }}
      topFeatures={[
        { icon: ShieldCheck, title: 'Accountable', desc: 'Every change carries a name and time.' },
        { icon: UserCog, title: 'Three clear roles', desc: 'Owner, admin, builder. No maze.' },
        { icon: ScrollText, title: 'Full audit log', desc: 'Every action, timestamped.' },
      ]}
      steps={APPROVALS_STEPS}
      image="/marketing/brokerages-3.jpg"
      imageSide="right"
    />
  );
}
