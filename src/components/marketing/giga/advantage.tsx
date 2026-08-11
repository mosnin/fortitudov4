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
import { Serif, Eyebrow, BlurRise, Band } from './primitives';

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
  { icon: Bot, label: 'Helix accelerates', duration: 2.3, delay: -0.7 },
  { icon: CheckCircle2, label: 'Live tracker', duration: 1.9, delay: -1.5 },
  { icon: UserCheck, label: 'Human review', duration: 2.2, delay: -0.2 },
  { icon: Rocket, label: 'Launch', duration: 1.7, delay: -0.9 },
];

function PillConveyor({ pills, tone }: { pills: Pill[]; tone: 'alert' | 'brand' }) {
  const pillStyles =
    tone === 'alert'
      ? 'border-[#ff405d] bg-[#ff405d]/[0.08] text-[#ff7a8d]'
      : 'border-[#f8cd02] bg-[#f8cd02]/[0.08] text-[#f8cd02]';
  const connector = tone === 'alert' ? 'bg-[#ff405d]/60' : 'bg-[#f8cd02]/60';
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
                style={{ fontFamily: 'var(--font-mono)' }}
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
    <section className="relative border-t border-white/[0.06] bg-[#1b1b1d] py-24 text-white sm:py-32">
      <Band>
        <BlurRise className="mx-auto max-w-3xl text-center">
          <Eyebrow className="justify-center">Why Fortitudo</Eyebrow>
          <Serif className="mt-5 text-[clamp(2rem,4.2vw,3.25rem)] leading-[1.06] text-white">
            Our unique advantage.
          </Serif>
          <p className="mx-auto mt-5 max-w-xl text-[14.5px] leading-relaxed text-white/55">
            Humans lead every build. Helix does the heavy lifting. You get
            agency craft without agency overhead.
          </p>
        </BlurRise>

        <div className="mx-auto mt-14 grid max-w-6xl gap-6 lg:grid-cols-2">
          <BlurRise>
            <div className="overflow-hidden rounded-[6px] border border-white/[0.08] bg-white/[0.02]">
              <div className="relative aspect-[724/300] overflow-hidden">
                <PillConveyor pills={legacyPills} tone="alert" />
              </div>
            </div>
            <div className="mt-5 px-1">
              <h3 style={{ fontFamily: 'var(--font-sans)' }} className="text-[15px] font-semibold text-white">
                Typical agencies
              </h3>
              <p className="mt-2 max-w-[540px] text-[13.5px] leading-relaxed text-white/50">
                An endless conveyor of calls, change orders, and week-old status
                emails — with account managers between you and the people
                actually building. The invoice never matches the quote.
              </p>
            </div>
          </BlurRise>

          <BlurRise delay={0.08}>
            <div className="overflow-hidden rounded-[6px] border border-white/[0.08] bg-white/[0.02]">
              <div className="relative aspect-[724/300] overflow-hidden">
                <PillConveyor pills={fortitudoPills} tone="brand" />
              </div>
            </div>
            <div className="mt-5 px-1">
              <h3 style={{ fontFamily: 'var(--font-sans)' }} className="text-[15px] font-semibold text-white">
                Fortitudo
              </h3>
              <p className="mt-2 max-w-[540px] text-[13.5px] leading-relaxed text-white/50">
                One senior team in one dashboard. Helix runs the scaffolding,
                tests, and revision churn under senior review — so your build
                ships weeks faster, and you watch it happen live.
              </p>
            </div>
          </BlurRise>
        </div>
      </Band>
    </section>
  );
}
