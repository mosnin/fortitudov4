'use client';

/**
 * Advantage — the process-pill conveyor comparison, carried forward from the
 * previous landing and re-set in the Giga system. Two media cards: the
 * "typical agencies" belt of red warning pills against the "Fortitudo" belt of
 * brand-lit pipeline pills — the same marquee-left + pill-ring-pulse
 * keyframes (globals.css), restaged on the near-black band.
 */

import {
  AlertTriangle,
  Bot,
  CalendarClock,
  CheckCircle2,
  FileWarning,
  GaugeCircle,
  Mail,
  Receipt,
  Rocket,
  UserCheck,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { Band, BlurRise, Eyebrow, Serif } from './primitives';
import { ALERT_CHIP, ALERT_RULE, DISPLAY_M, MONO_STYLE, SECTION_Y, TITLE_S } from './tokens';

interface Pill {
  icon: LucideIcon;
  label: string;
  duration: number;
  delay: number;
}

const legacyPills: Pill[] = [
  { icon: CalendarClock, label: 'Discovery call #4', duration: 1.7, delay: -0.2 },
  { icon: FileWarning, label: 'Scope change order', duration: 2.4, delay: -0.8 },
  { icon: Mail, label: 'Week-old status email', duration: 2.0, delay: -1.3 },
  { icon: Receipt, label: 'Surprise invoice', duration: 1.8, delay: -0.5 },
  { icon: AlertTriangle, label: 'Handoff to a stranger', duration: 2.2, delay: -1.7 },
];

const fortitudoPills: Pill[] = [
  { icon: GaugeCircle, label: 'Fixed quote', duration: 2.1, delay: -0.4 },
  { icon: Users, label: 'Senior architecture', duration: 1.8, delay: -1.1 },
  { icon: Bot, label: 'AI-assisted build', duration: 2.3, delay: -0.7 },
  { icon: CheckCircle2, label: 'Live tracker', duration: 1.9, delay: -1.5 },
  { icon: UserCheck, label: 'Human review', duration: 2.2, delay: -0.2 },
  { icon: Rocket, label: 'Launch', duration: 1.7, delay: -0.9 },
];

function PillConveyor({ pills, tone }: { pills: Pill[]; tone: 'alert' | 'brand' }) {
  const pillStyles =
    tone === 'alert'
      ? ALERT_CHIP
      : 'border-[var(--fx-yellow)] bg-[var(--fx-yellow)]/[0.08] text-[var(--fx-yellow)]';
  const connector = tone === 'alert' ? ALERT_RULE : 'bg-[var(--fx-yellow)]/60';
  const ring = tone === 'alert' ? 'rgba(255,64,93,0.25)' : 'rgba(248,205,2,0.25)';

  const row = (hidden: boolean) => (
    <div aria-hidden={hidden} className="flex shrink-0 items-center gap-2">
      {pills.map((pill) => {
        const Icon = pill.icon;
        return (
          <div key={pill.label} className="flex shrink-0 items-center gap-2">
            <div
              className={`flex shrink-0 items-center gap-2.5 rounded-[6px] border p-3.5 motion-safe:animate-[pill-ring-pulse_2s_ease-in-out_infinite] ${pillStyles}`}
              style={
                {
                  '--pill-ring': ring,
                  animationDuration: `${pill.duration}s`,
                  animationDelay: `${pill.delay}s`,
                } as React.CSSProperties
              }
            >
              <Icon className="size-5 shrink-0" />
              <span
                style={MONO_STYLE}
                className="text-[16px] leading-none tracking-[-0.02em] whitespace-nowrap sm:text-[18px]"
              >
                {pill.label}
              </span>
            </div>
            <div className={`h-0.5 w-5 shrink-0 ${connector}`} />
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 overflow-x-clip">
      <div className="flex w-max items-center py-2 motion-safe:animate-[marquee-left_26s_linear_infinite]">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}

export function Advantage() {
  return (
    <section
      className={`relative border-t border-[var(--fx-hairline)] bg-[var(--fx-charcoal)] text-[var(--fx-white)] ${SECTION_Y}`}
    >
      <Band>
        <BlurRise className="max-w-3xl">
          <Eyebrow>Why Fortitudo</Eyebrow>
          <Serif className={`mt-5 ${DISPLAY_M} text-[var(--fx-white)]`}>
            Our unique advantage.
          </Serif>
          <p className="mt-5 max-w-xl text-[14.5px] leading-relaxed text-[var(--fx-muted)]">
            Senior builders lead every project, on a fixed quote you can hold us
            to. You get agency craft without agency overhead.
          </p>
        </BlurRise>

        <div className="mt-14 grid max-w-6xl gap-6 lg:grid-cols-2">
          <BlurRise>
            <div className="overflow-hidden rounded-[6px] border border-[var(--fx-hairline)] bg-[var(--fx-charcoal-raised)]">
              <div className="relative aspect-[724/300] overflow-hidden">
                <PillConveyor pills={legacyPills} tone="alert" />
              </div>
            </div>
            <div className="mt-5 px-1">
              <Serif as="h3" className={`${TITLE_S} text-[var(--fx-white)]`}>
                Typical agencies
              </Serif>
              <p className="mt-2 max-w-[540px] text-[13.5px] leading-relaxed text-[var(--fx-muted)]">
                An endless conveyor of calls, change orders, and week-old status
                emails — with account managers between you and the people
                actually building. The invoice never matches the quote.
              </p>
            </div>
          </BlurRise>

          <BlurRise delay={0.08}>
            <div className="overflow-hidden rounded-[6px] border border-[var(--fx-hairline)] bg-[var(--fx-charcoal-raised)]">
              <div className="relative aspect-[724/300] overflow-hidden">
                <PillConveyor pills={fortitudoPills} tone="brand" />
              </div>
            </div>
            <div className="mt-5 px-1">
              <Serif as="h3" className={`${TITLE_S} text-[var(--fx-white)]`}>
                Fortitudo
              </Serif>
              <p className="mt-2 max-w-[540px] text-[13.5px] leading-relaxed text-[var(--fx-muted)]">
                One senior team in one dashboard. We use AI tooling where it
                earns its place — scaffolding, tests, revision churn — always
                under senior review, and you watch the build happen live.
              </p>
            </div>
          </BlurRise>
        </div>
      </Band>
    </section>
  );
}
