'use client';

/**
 * AgentInboxShowcase + AgentPipelineShowcase, two feature sections for the
 * Chippi marketing site. Both reuse the FeatureShowcase shell and the frosted
 * mockup kit, but each step's mockup uses a distinct visual metaphor:
 *   - Inbox: an email/chat conversation (incoming card, chat bubbles, a draft
 *     composer with approve/edit/skip, a sent-and-logged confirmation).
 *   - Pipeline: a kanban board (mini columns with deal cards, a card advancing,
 *     a queued follow-up, an aging-deal flag).
 */

import {
  Inbox,
  Target,
  PenLine,
  Check,
  CheckCircle2,
  ListChecks,
  KanbanSquare,
  Bell,
  CalendarClock,
  Phone,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  FeatureShowcase,
  Frost,
  Row,
  rowV,
  type ShowcaseStep,
} from './feature-showcase';

/* ── shared small helpers ──────────────────────────────────────────────── */

const Chip = ({ label, tone }: { label: string; tone: string }) => (
  <span className={'rounded-[4px] px-2 py-0.5 text-[10px] font-medium ' + tone}>{label}</span>
);

const Avatar = ({ initials }: { initials: string }) => (
  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#f8cd02] to-[#dcb602] text-[12px] font-semibold text-black">
    {initials}
  </span>
);

/* ── 1) Inbox: an email / chat conversation ────────────────────────────── */

const STEPS_INBOX: ShowcaseStep[] = [
  {
    key: 'land',
    title: 'New request lands',
    desc: 'Email, Slack, and portal requests all arrive in one worked queue. Helix scores each one against your live build the moment it lands.',
    mockup: (
      <Frost title="Inbox" badge="3 new">
        <motion.div
          variants={rowV}
          className="flex items-center gap-3 rounded-[6px] border border-white/10 bg-white/[0.04] p-3"
        >
          <Avatar initials="DM" />
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-medium text-white">Daniel Mercer</span>
            <span className="block truncate text-[11px] text-white/45">
              Can we get the checkout fix in before Friday&apos;s launch?
            </span>
          </span>
          <Chip label="Urgent · scored" tone="bg-[#f8cd02]/15 text-[#f8cd02]" />
        </motion.div>
        <Row
          icon={Inbox}
          title="Priya Raman"
          meta="Slack · asking about hosting"
          right={<Chip label="Normal" tone="bg-amber-400/15 text-amber-300" />}
        />
        <Row
          icon={Inbox}
          title="Portal request"
          meta="Portal · opened the preview three times"
          right={<Chip label="Low" tone="bg-white/10 text-white/60" />}
        />
      </Frost>
    ),
  },
  {
    key: 'read',
    title: 'Helix reads the thread',
    desc: 'It reads the whole conversation, pulls out the details that matter, and lines them up against the scope so nothing gets missed.',
    mockup: (
      <Frost title="Thread" badge="Daniel Mercer">
        <motion.div variants={rowV} className="flex justify-start">
          <span className="max-w-[80%] rounded-[6px] rounded-tl-sm bg-white/[0.06] px-3.5 py-2.5 text-[12.5px] leading-snug text-white/80">
            Hi, just walked the preview. We&apos;d like the checkout simplified and at least 3 payment options.
          </span>
        </motion.div>
        <motion.div variants={rowV} className="flex justify-start">
          <span className="max-w-[80%] rounded-[6px] rounded-tl-sm bg-white/[0.06] px-3.5 py-2.5 text-[12.5px] leading-snug text-white/80">
            Could we still ship this weekend if QA is clear?
          </span>
        </motion.div>
        <motion.div variants={rowV} className="flex flex-wrap gap-1.5 px-1 pt-1">
          <Chip label="scope: checkout" tone="bg-white/[0.08] text-white/70" />
          <Chip label="3 payment options" tone="bg-white/[0.08] text-white/70" />
          <Chip label="wants weekend ship" tone="bg-sky-400/15 text-sky-300" />
        </motion.div>
      </Frost>
    ),
  },
  {
    key: 'draft',
    title: 'A reply, in the house style',
    desc: 'Helix writes the reply the way we would and stages the change the moment the request lands, logged in plain words.',
    mockup: (
      <Frost title="Draft" badge="House style">
        <motion.div
          variants={rowV}
          className="rounded-[6px] border border-white/10 bg-white/[0.03] p-3.5 text-[12.5px] leading-relaxed text-white/80"
        >
          Hi Daniel, great to hear from you. The checkout simplification fits this sprint, and all
          three payment options are already supported. I can stage it for review Saturday at 11:00
          or Sunday at 2:00. Which works better for you?
        </motion.div>
        <motion.div variants={rowV} className="flex items-center gap-2 px-1 pt-1">
          <span className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-[#f8cd02] to-[#dcb602] px-3 py-2 text-[12px] font-semibold text-black">
            <Check className="h-3.5 w-3.5" />
            Approve
          </span>
          <span className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-[12px] font-medium text-white/75">
            <PenLine className="h-3.5 w-3.5" />
            Edit
          </span>
          <span className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-[12px] font-medium text-white/55">
            Skip
          </span>
        </motion.div>
      </Frost>
    ),
  },
  {
    key: 'sent',
    title: 'Sent and logged',
    desc: 'One tap sends the reply in the house style, then Helix files it to the build so the timeline stays complete on its own.',
    mockup: (
      <Frost title="Done" badge="Just now">
        <Row
          icon={Check}
          title="Reply sent in the house style"
          meta="to Daniel Mercer · email"
          tone="text-emerald-300/80"
        />
        <Row
          icon={ListChecks}
          title="Logged to the build"
          meta="checkout revision · timeline updated"
          tone="text-white/55"
        />
        <motion.div
          variants={rowV}
          className="flex items-center gap-3 rounded-[6px] border border-white/10 bg-white/[0.03] p-3"
        >
          <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-sky-300">
            <CheckCircle2 className="h-3.5 w-3.5" />
          </span>
          <span className="min-w-0 flex-1 text-[12.5px] text-white/75">Review times offered, awaiting reply</span>
          <Chip label="Next: stage" tone="bg-sky-400/15 text-sky-300" />
        </motion.div>
      </Frost>
    ),
  },
];

const TOP_FEATURES_INBOX = [
  { icon: Inbox, title: 'One worked queue', desc: 'Email, Slack, and portal requests in one place.' },
  { icon: Target, title: 'Scored on arrival', desc: 'Urgent, normal, or low, with the reason.' },
  { icon: PenLine, title: 'Drafted in the house style', desc: 'A reply waiting, ready to send.' },
];

export function AgentInboxShowcase() {
  return (
    <FeatureShowcase
      eyebrow="The inbox, worked"
      headline={
        <>
          Every request, answered
          <br className="hidden sm:block" /> before you open it.
        </>
      }
      product={{
        name: 'Smart Inbox',
        icon: Inbox,
        desc: 'Helix reads each inbound, scores it against your live build, and drafts the reply in the house style.',
        cta: { label: 'See it work', href: '/contact' },
      }}
      topFeatures={TOP_FEATURES_INBOX}
      steps={STEPS_INBOX}
      image="/marketing/agents-1.jpg"
      imageSide="right"
    />
  );
}

/* ── 2) Pipeline: a kanban board ───────────────────────────────────────── */

const DealCard = ({
  name,
  price,
  dot,
  className,
  chip,
}: {
  name: string;
  price: string;
  dot: string;
  className?: string;
  chip?: React.ReactNode;
}) => (
  <div className={'rounded-lg border border-white/[0.08] bg-white/[0.03] p-2 ' + (className ?? '')}>
    <div className="flex items-center gap-1.5">
      <span className={'h-1.5 w-1.5 flex-shrink-0 rounded-full ' + dot} />
      <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-white">{name}</span>
    </div>
    <span className="mt-1 block text-[10px] text-white/45">{price}</span>
    {chip ? <div className="mt-1.5">{chip}</div> : null}
  </div>
);

const Column = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="rounded-[6px] border border-white/[0.08] bg-white/[0.02] p-2">
    <span className="mb-2 block text-[9px] font-medium uppercase tracking-wider text-white/40">{label}</span>
    <div className="space-y-1.5">{children}</div>
  </div>
);

const STEPS_PIPELINE: ShowcaseStep[] = [
  {
    key: 'board',
    title: 'The board, at a glance',
    desc: 'Every build sits in the right phase, read live from the work itself. One look tells you where the whole pipeline stands.',
    mockup: (
      <Frost title="Pipeline" badge="Live">
        <motion.div variants={rowV} className="grid grid-cols-3 gap-2">
          <Column label="New">
            <DealCard name="Maison Noir" price="$6.5k" dot="bg-[#f8cd02]" />
            <DealCard name="HelpStream" price="$4.2k" dot="bg-white/40" />
          </Column>
          <Column label="In build">
            <DealCard name="Atlas Ops" price="$8.8k" dot="bg-sky-400" />
          </Column>
          <Column label="In QA">
            <DealCard name="DataPulse" price="$12k" dot="bg-emerald-400" />
          </Column>
        </motion.div>
      </Frost>
    ),
  },
  {
    key: 'advance',
    title: 'A build advances',
    desc: 'When a revision is approved or QA passes, Helix moves the build to the next phase on its own, so the board is never behind.',
    mockup: (
      <Frost title="Pipeline" badge="Updated">
        <motion.div variants={rowV} className="grid grid-cols-3 gap-2">
          <Column label="New">
            <DealCard name="HelpStream" price="$4.2k" dot="bg-white/40" />
          </Column>
          <Column label="In build">
            <DealCard
              name="Maison Noir"
              price="$6.5k"
              dot="bg-[#f8cd02]"
              className="border-[#f8cd02]/40 bg-[#f8cd02]/10 ring-1 ring-[#f8cd02]/40"
              chip={<Chip label="→ In build" tone="bg-[#f8cd02]/15 text-[#f8cd02]" />}
            />
            <DealCard name="Atlas Ops" price="$8.8k" dot="bg-sky-400" />
          </Column>
          <Column label="In QA">
            <DealCard name="DataPulse" price="$12k" dot="bg-emerald-400" />
          </Column>
        </motion.div>
        <Row
          icon={ArrowRight}
          title="Maison Noir moved to In build"
          meta="kickoff booked Sat 11:00"
          tone="text-[#f8cd02]"
        />
      </Frost>
    ),
  },
  {
    key: 'next',
    title: 'Next touch queued',
    desc: 'The moment a build moves, Helix schedules the right follow-up so the next step is always set without you tracking it.',
    mockup: (
      <Frost title="Follow-up" badge="Queued">
        <motion.div
          variants={rowV}
          className="flex items-center gap-3 rounded-[6px] border border-white/10 bg-white/[0.04] p-3"
        >
          <Avatar initials="MN" />
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-medium text-white">Maison Noir</span>
            <span className="block text-[11px] text-white/45">checkout revision · post-review check-in</span>
          </span>
          <span className="flex items-center gap-1.5 rounded-[4px] bg-sky-400/15 px-2.5 py-1 text-[11px] font-medium text-sky-300">
            <Bell className="h-3 w-3" />
            Call Tue 10:00
          </span>
        </motion.div>
        <Row
          icon={CalendarClock}
          title="Added to your day"
          meta="queued automatically"
          tone="text-emerald-300/80"
        />
        <Row
          icon={Phone}
          title="DataPulse"
          meta="QA follow-up · Thu 9:00"
          tone="text-white/55"
          right={<Chip label="queued" tone="bg-white/10 text-white/60" />}
        />
      </Frost>
    ),
  },
  {
    key: 'aging',
    title: 'Before it stalls',
    desc: 'When a build sits quiet too long, Helix flags it before it slips and suggests the next move to bring it back on pace.',
    mockup: (
      <Frost title="Needs a nudge" badge="2 flagged">
        <motion.div
          variants={rowV}
          className="rounded-[6px] border border-amber-400/20 bg-amber-400/[0.06] p-3"
        >
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400" />
            <span className="min-w-0 flex-1 text-[12.5px] font-medium text-white">HelpStream · $4.2k</span>
            <Chip label="3 days quiet" tone="bg-amber-400/15 text-amber-300" />
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-white/55">
            <Clock className="h-3 w-3 text-amber-300/80" />
            Suggested: send the hosting options they asked about
          </div>
        </motion.div>
        <Row
          icon={Bell}
          title="Atlas Ops"
          meta="no reply since review"
          right={<Chip label="2 days quiet" tone="bg-amber-400/15 text-amber-300" />}
        />
        <Row
          icon={CheckCircle2}
          title="The rest are on track"
          meta="nothing else stalling"
          tone="text-emerald-300/80"
        />
      </Frost>
    ),
  },
];

const TOP_FEATURES_PIPELINE = [
  { icon: KanbanSquare, title: 'Always current', desc: 'Phases update from the work itself.' },
  { icon: Bell, title: 'Next touch queued', desc: 'Follow-ups scheduled automatically.' },
  { icon: CalendarClock, title: 'Nothing stalls', desc: 'Aging builds surface before they slip.' },
];

export function AgentPipelineShowcase() {
  return (
    <FeatureShowcase
      eyebrow="Your pipeline, in motion"
      headline={
        <>
          Builds that move
          <br className="hidden sm:block" /> themselves forward.
        </>
      }
      product={{
        name: 'Live Pipeline',
        icon: KanbanSquare,
        desc: 'Helix advances each build as things happen, queues the next touch, and keeps every phase current so nothing stalls.',
        cta: { label: 'See it work', href: '/contact' },
      }}
      topFeatures={TOP_FEATURES_PIPELINE}
      steps={STEPS_PIPELINE}
      image="/marketing/agents-3.jpg"
      imageSide="right"
    />
  );
}
