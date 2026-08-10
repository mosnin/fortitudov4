'use client';

/**
 * Chippi product-story showcases, the three sections that walk through how the
 * agent works end to end: it READS every signal, DECIDES what matters, then
 * ACTS on its own. Each reuses the FeatureShowcase shell but ships its
 * own custom frosted metaphor mockups (multi-source ingestion, scoring + ranked
 * list, action card + approval gate) so the panels stay visually distinct from
 * each other and from BrokerageShowcase.
 */

import {
  Radar,
  History,
  ScanSearch,
  Mail,
  MessageSquare,
  Home,
  Inbox,
  Phone,
  CalendarDays,
  CheckCircle2,
  Target,
  ListChecks,
  MessageSquareQuote,
  ShieldCheck,
  PenLine,
  ScrollText,
  Check,
  Pencil,
  Send,
} from 'lucide-react';
import { motion } from 'motion/react';
import { DecryptedText } from '@/components/ui/decrypted-text';
import {
  FeatureShowcase,
  Frost,
  Row,
  rowV,
  type ShowcaseStep,
} from './feature-showcase';

/* ── Shared little atoms (kept tiny + tone-driven, matching house style) ──── */

const Chip = ({ label, tone }: { label: string; tone: string }) => (
  <span className={'rounded-full px-2 py-0.5 text-[10px] font-medium ' + tone}>{label}</span>
);

/** A small emerald status line, used for "coverage" / "done" confirmations. */
const StatusLine = ({ icon: Icon, label }: { icon: React.ElementType; label: string }) => (
  <motion.div variants={rowV} className="flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5">
    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-emerald-400/15 text-emerald-300">
      <Icon className="h-3.5 w-3.5" />
    </span>
    <span className="text-[12px] text-white/75">{label}</span>
  </motion.div>
);

/* ═══════════════════════════════════════════════════════════════════════════
 * 1) READS, metaphor = multi-source ingestion into one unified stream.
 * ═══════════════════════════════════════════════════════════════════════════ */

const READS_TOP = [
  { icon: Radar, title: 'Every channel', desc: 'Email, Slack, and portal in one stream.' },
  { icon: History, title: 'History in context', desc: 'The whole project, already loaded.' },
  { icon: ScanSearch, title: 'Nothing missed', desc: 'Round the clock coverage.' },
];

/** One labeled source tile (Email / WhatsApp / Zillow) with a live dot. */
const SourceTile = ({ icon: Icon, label, tone }: { icon: React.ElementType; label: string; tone: string }) => (
  <div className="relative flex flex-col items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-2 py-3">
    <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]" />
    <span className={'flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] ' + tone}>
      <Icon className="h-3.5 w-3.5" />
    </span>
    <span className="text-[10.5px] text-white/60">{label}</span>
  </div>
);

const READS_STEPS: ShowcaseStep[] = [
  {
    key: 'channels',
    title: 'Every channel, one stream',
    desc: 'Email, Slack, portal requests, and replies, all flow into a single live stream the moment they arrive, no tab-hopping, no inbox left unread.',
    mockup: (
      <Frost title="Sources" badge="Live">
        <motion.div variants={rowV} className="grid grid-cols-3 gap-2 px-1">
          <SourceTile icon={Mail} label="Email" tone="text-sky-300/80" />
          <SourceTile icon={MessageSquare} label="Slack" tone="text-[#ff9a6e]" />
          <SourceTile icon={Home} label="Portal" tone="text-emerald-300/80" />
        </motion.div>
        <motion.div variants={rowV} className="flex justify-center py-0.5 text-white/25">
          <span className="text-[14px] leading-none">↓</span>
        </motion.div>
        <motion.div variants={rowV} className="flex items-center gap-3 rounded-xl border border-[#ff7a45]/25 bg-[#ff7a45]/[0.06] p-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#ff7a45] to-[#ff5fa2] text-black">
            <Inbox className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-medium text-white">Unified inbox</span>
            <span className="block text-[11px] text-white/50">3 new, merged just now</span>
          </span>
          <Chip label="+3" tone="bg-white/10 text-white/70" />
        </motion.div>
      </Frost>
    ),
  },
  {
    key: 'context',
    title: 'History in context',
    desc: 'Before Helix reads a new message, the entire project is already loaded, every email, review, and call, so nothing is read in a vacuum.',
    mockup: (
      <Frost title="Contact">
        <motion.div variants={rowV} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#ff7a45] to-[#ff5fa2] text-[12px] font-semibold text-black">
            SC
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-medium text-white">Sarah Chen</span>
            <span className="block text-[11px] text-white/45">Founder · 8 touches</span>
          </span>
        </motion.div>
        <motion.div variants={rowV} className="relative px-1 pt-2">
          <span aria-hidden className="absolute left-3 right-3 top-[18px] h-px bg-white/[0.1]" />
          <div className="relative flex items-start justify-between">
            {[
              { icon: Mail, label: 'Email', tone: 'text-sky-300/80' },
              { icon: CalendarDays, label: 'Review', tone: 'text-[#ff9a6e]' },
              { icon: Phone, label: 'Call', tone: 'text-emerald-300/80' },
              { icon: Mail, label: 'Reply', tone: 'text-sky-300/80' },
            ].map((t, i) => {
              const Icon = t.icon;
              return (
                <span key={i} className="flex w-12 flex-col items-center gap-1.5">
                  <span className={'flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-[#0b0b0d] ' + t.tone}>
                    <Icon className="h-3 w-3" />
                  </span>
                  <span className="text-[9.5px] text-white/45">{t.label}</span>
                </span>
              );
            })}
          </div>
        </motion.div>
      </Frost>
    ),
  },
  {
    key: 'intent',
    title: 'Understands intent',
    desc: 'Helix pulls the facts that matter out of plain language, scope, budget, timing, stack, and keeps them attached to the project.',
    mockup: (
      <Frost title="Extracted" badge="From reply">
        <motion.div variants={rowV} className="flex flex-wrap gap-1.5 px-1 py-1">
          {[
            { label: 'budget $6.5k', tone: 'bg-[#ff7a45]/15 text-[#ff9a6e]' },
            { label: '3 payment options', tone: 'bg-white/[0.06] text-white/70' },
            { label: 'ecommerce', tone: 'bg-sky-400/15 text-sky-300' },
            { label: 'weekend launch', tone: 'bg-white/[0.06] text-white/70' },
            { label: 'quote approved', tone: 'bg-emerald-400/15 text-emerald-300' },
            { label: 'dark mode', tone: 'bg-white/[0.06] text-white/70' },
          ].map((c) => (
            <Chip key={c.label} label={c.label} tone={c.tone} />
          ))}
        </motion.div>
        <motion.div variants={rowV} className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 text-[12px] leading-relaxed text-white/65">
          {'"Loved the preview, can we see two more concepts this weekend?"'}
        </motion.div>
      </Frost>
    ),
  },
  {
    key: 'covered',
    title: 'Nothing missed',
    desc: 'While you sleep, pitch, and launch, Helix keeps reading, so the moment a client reaches out, it has already been seen.',
    mockup: (
      <Frost title="Coverage" badge="24/7">
        <StatusLine icon={CheckCircle2} label="12 inbound read today" />
        <StatusLine icon={CheckCircle2} label="0 left unattended" />
        <StatusLine icon={CheckCircle2} label="Last signal seen 40s ago" />
      </Frost>
    ),
  },
];

export function ChippiReadsShowcase() {
  return (
    <FeatureShowcase
      eyebrow="Reads everything"
      headline={
        <>
          {/* The headline decrypts into place — meaning resolving out of
              noise, which is literally what this section claims Chippi does
              with inbound signals. One accent; the second line stays still. */}
          <DecryptedText text="It sees every signal," />
          <br className="hidden sm:block" /> the moment it arrives.
        </>
      }
      product={{
        name: 'Always Listening',
        icon: Radar,
        desc: 'Email, Slack, portal requests, and replies, Helix reads them all the instant they land, with the full history already in context.',
        cta: { label: 'See it work', href: '/contact' },
      }}
      topFeatures={READS_TOP}
      steps={READS_STEPS}
      image="/marketing/chippi-1.jpg"
      imageSide="right"
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 2) DECIDES, metaphor = scoring + ranked call list with reasons.
 * ═══════════════════════════════════════════════════════════════════════════ */

const DECIDES_TOP = [
  { icon: Target, title: 'Scored on arrival', desc: 'Urgent, normal, or low, with the reason.' },
  { icon: ListChecks, title: 'Ranked by intent', desc: 'The work list, ordered for you.' },
  { icon: MessageSquareQuote, title: 'The reason, in plain words', desc: 'Never a black box.' },
];

/** A ranked row: position, name, score bar, score number. */
const RankRow = ({ pos, name, score, width }: { pos: number; name: string; score: number; width: string }) => (
  <motion.div variants={rowV} className="flex items-center gap-3 rounded-xl px-2 py-2">
    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-white/[0.06] text-[11px] font-semibold text-white/70">
      {pos}
    </span>
    <span className="w-20 flex-shrink-0 truncate text-[12.5px] font-medium text-white">{name}</span>
    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
      <span className="block h-full rounded-full bg-gradient-to-r from-[#ff7a45] to-[#ff5fa2]" style={{ width }} />
    </span>
    <span className="w-7 flex-shrink-0 text-right text-[12px] font-semibold text-white/80">{score}</span>
  </motion.div>
);

const DECIDES_STEPS: ShowcaseStep[] = [
  {
    key: 'score',
    title: 'Scored on arrival',
    desc: 'Every request is scored against your live build the second it lands, urgent, normal, or low, with the signal that earned the score.',
    mockup: (
      <Frost title="Request score">
        <motion.div variants={rowV} className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.04] p-4">
          <span className="relative flex h-16 w-16 flex-shrink-0 items-center justify-center">
            <span
              aria-hidden
              className="absolute inset-0 rounded-full"
              style={{ background: 'conic-gradient(#ff7a45 0% 92%, rgba(255,255,255,0.08) 92% 100%)' }}
            />
            <span className="absolute inset-[3px] rounded-full bg-[#0b0b0d]" />
            <span className="relative text-[20px] font-semibold text-white">92</span>
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2">
              <span className="text-[13px] font-medium text-white">Sarah Chen</span>
              <Chip label="Urgent" tone="bg-[#ff7a45]/15 text-[#ff9a6e]" />
            </span>
            <span className="mt-1 block text-[11.5px] leading-snug text-white/55">
              Quote approved and asked to launch this weekend.
            </span>
          </span>
        </motion.div>
      </Frost>
    ),
  },
  {
    key: 'rank',
    title: 'Ranked by intent',
    desc: 'Helix orders the day for you, the build most likely to launch sits at the top, so your first hour is never guesswork.',
    mockup: (
      <Frost title="Work list" badge="Now">
        <RankRow pos={1} name="Sarah Chen" score={92} width="92%" />
        <RankRow pos={2} name="Marcus Lee" score={78} width="78%" />
        <RankRow pos={3} name="Dana Brooks" score={64} width="64%" />
        <RankRow pos={4} name="Tom Alvarez" score={41} width="41%" />
      </Frost>
    ),
  },
  {
    key: 'why',
    title: 'The reason, in plain words',
    desc: 'No black box. Every score comes with the few facts behind it, so you trust the order before you dial.',
    mockup: (
      <Frost title="Why this score">
        <motion.div variants={rowV} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5">
          <span className="text-[12.5px] font-medium text-white">Sarah Chen</span>
          <Chip label="92 · Urgent" tone="bg-[#ff7a45]/15 text-[#ff9a6e]" />
        </motion.div>
        <motion.div variants={rowV} className="flex flex-wrap gap-1.5 px-1 pt-1">
          {[
            'replied in 4 min',
            'quote approved',
            'asked to launch',
          ].map((c) => (
            <Chip key={c} label={c} tone="bg-emerald-400/15 text-emerald-300" />
          ))}
        </motion.div>
      </Frost>
    ),
  },
  {
    key: 'first',
    title: 'Your first hour',
    desc: 'Start at the top and work down. Helix hands you a short do-now list, the builds where attention right now moves the needle.',
    mockup: (
      <Frost title="Today" badge="Do now">
        <Row icon={Phone} title="Sarah Chen" meta="92 · quote approved, wants launch" tone="text-[#ff9a6e]" active right={<Chip label="Urgent" tone="bg-[#ff7a45]/15 text-[#ff9a6e]" />} />
        <Row icon={Phone} title="Marcus Lee" meta="78 · comparing two concepts" right={<Chip label="Normal" tone="bg-amber-400/15 text-amber-300" />} />
        <Row icon={Phone} title="Dana Brooks" meta="64 · early, exploring scope" right={<Chip label="Normal" tone="bg-white/10 text-white/60" />} />
      </Frost>
    ),
  },
];

export function ChippiDecidesShowcase() {
  return (
    <FeatureShowcase
      eyebrow="Knows what matters"
      headline={
        <>
          It tells you
          <br className="hidden sm:block" /> who to call first.
        </>
      }
      product={{
        name: 'Prioritized',
        icon: Target,
        desc: 'Every request scored against your live build and ranked by intent, so your first hour goes to the build most likely to launch.',
        cta: { label: 'See it work', href: '/contact' },
      }}
      topFeatures={DECIDES_TOP}
      steps={DECIDES_STEPS}
      image="/marketing/chippi-2.jpg"
      imageSide="left"
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 3) ACTS, metaphor = action card + execution + log.
 * ═══════════════════════════════════════════════════════════════════════════ */

const ACTS_TOP = [
  { icon: PenLine, title: 'It writes', desc: 'Replies and revisions, in the house style.' },
  { icon: ShieldCheck, title: 'It acts', desc: 'Staged, tested, and updated on its own.' },
  { icon: ScrollText, title: 'Logged in plain words', desc: 'Every action you can audit.' },
];

/** A pill-style action button row. */
const ActionBtn = ({ icon: Icon, label, focused }: { icon: React.ElementType; label: string; focused?: boolean }) => (
  <span
    className={
      'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[12px] font-medium ' +
      (focused
        ? 'bg-gradient-to-r from-[#ff7a45] to-[#ff5fa2] text-black shadow-lg shadow-[#ff7a45]/20'
        : 'border border-white/[0.1] bg-white/[0.04] text-white/65')
    }
  >
    <Icon className="h-3.5 w-3.5" />
    {label}
  </span>
);

/** A timestamped activity log line. */
const LogLine = ({ time, label }: { time: string; label: string }) => (
  <motion.div variants={rowV} className="flex items-start gap-3 px-1 py-1.5">
    <span className="mt-1 flex flex-col items-center">
      <span className="h-1.5 w-1.5 rounded-full bg-[#ff9a6e]" />
    </span>
    <span className="min-w-0 flex-1">
      <span className="block text-[12px] text-white/75">{label}</span>
      <span className="block text-[10.5px] text-white/40">{time}</span>
    </span>
  </motion.div>
);

const ACTS_STEPS: ShowcaseStep[] = [
  {
    key: 'propose',
    title: 'Helix proposes',
    desc: 'Helix drafts the reply and stages the revision in the house style, ready for review, so the work is done before you even open it.',
    mockup: (
      <Frost title="Proposed">
        <motion.div variants={rowV} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-[#ff9a6e]">
            <PenLine className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[12.5px] font-medium text-white">Reply to Sarah Chen</span>
            <span className="block text-[11px] text-white/45">email · drafted in the house style</span>
          </span>
          <Chip label="Draft" tone="bg-white/10 text-white/60" />
        </motion.div>
        <motion.div variants={rowV} className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 text-[12px] leading-relaxed text-white/65">
          {'"Happy to walk you through two concepts this Saturday, does 2:00 work?"'}
        </motion.div>
      </Frost>
    ),
  },
  {
    key: 'act',
    title: 'It acts',
    desc: 'The reply goes out, the review lands on the calendar, the build moves, while you are with a client.',
    mockup: (
      <Frost title="In motion">
        <motion.div variants={rowV} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#ff7a45] to-[#ff5fa2] text-black">
            <CalendarDays className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[12.5px] font-medium text-white">Book review, Sat 2:00</span>
            <span className="block text-[11px] text-white/45">Phase 3 preview · Sarah Chen</span>
          </span>
        </motion.div>
        <motion.div variants={rowV} className="flex gap-2 px-1 pt-1">
          <ActionBtn icon={Check} label="Sent" focused />
          <ActionBtn icon={Pencil} label="House style" />
        </motion.div>
      </Frost>
    ),
  },
  {
    key: 'execute',
    title: 'It executes',
    desc: 'Helix sends the reply and books the review, then sends the invite, no copy-paste, no follow-through forgotten.',
    mockup: (
      <Frost title="Done" badge="Sent">
        <StatusLine icon={Send} label="Reply sent to Sarah Chen" />
        <StatusLine icon={CalendarDays} label="Review booked, Sat 2:00" />
        <StatusLine icon={CheckCircle2} label="Calendar invite sent" />
      </Frost>
    ),
  },
  {
    key: 'log',
    title: 'Logged in plain language',
    desc: 'Every move lands on the activity log in words you can read at a glance, so the whole thread stays honest and auditable.',
    mockup: (
      <Frost title="Activity" badge="Today">
        <LogLine time="2:14 PM · email" label="Replied to Sarah Chen" />
        <LogLine time="2:15 PM · calendar" label="Review booked, Sat 2:00" />
        <LogLine time="2:15 PM · email" label="Invite sent to Sarah Chen" />
      </Frost>
    ),
  },
];

export function ChippiActsShowcase() {
  return (
    <FeatureShowcase
      eyebrow="Acts, with your nod"
      headline={
        <>
          It does the work.
          <br className="hidden sm:block" /> You make the calls.
        </>
      }
      product={{
        name: 'Autonomous',
        icon: ShieldCheck,
        desc: 'Helix writes, stages, and updates on its own, and every move lands on the log in plain words.',
        cta: { label: 'See it work', href: '/contact' },
      }}
      topFeatures={ACTS_TOP}
      steps={ACTS_STEPS}
      image="/marketing/chippi-3.jpg"
      imageSide="right"
    />
  );
}
