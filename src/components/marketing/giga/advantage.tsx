'use client';

/**
 * Advantage — the process-pill conveyor comparison, carried forward from the
 * previous landing and re-set in the Giga system. Two media cards: the
 * "typical agencies" belt of red warning pills against the "Fortitudo" belt of
 * brand-lit pipeline pills — the same marquee-left + pill-ring-pulse
 * keyframes (globals.css), restaged on the near-black band.
 *
 * Motion: the belts ARE this section's one idea, so nothing else here moves on
 * scroll beyond the heading's mask reveal. The loop now runs through the kit's
 * `<Marquee>` rather than a local copy of the same flex-and-keyframe trick —
 * one ticker implementation on the surface, and the wrapper adds the edge fade
 * the hand-rolled version never had, so pills dissolve at the card boundary
 * instead of being guillotined by it.
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
import { KineticText, Marquee } from './motion-kit';
import { Band, BlurRise, Eyebrow, Serif } from './primitives';
import { ALERT_CHIP, ALERT_RULE, DISPLAY_M, MONO_STYLE, SECTION_Y, TITLE_S } from './tokens';

interface Pill {
  icon: LucideIcon;
  label: string;
  duration: number;
  delay: number;
}

const legacyPills: Pill[] = [
  { icon: CalendarClock, label: 'Meeting number four', duration: 1.7, delay: -0.2 },
  { icon: FileWarning, label: 'Another change fee', duration: 2.4, delay: -0.8 },
  { icon: Mail, label: 'Week-old status email', duration: 2.0, delay: -1.3 },
  { icon: Receipt, label: 'A bill you did not expect', duration: 1.8, delay: -0.5 },
  { icon: AlertTriangle, label: 'Passed to a stranger', duration: 2.2, delay: -1.7 },
];

const fortitudoPills: Pill[] = [
  { icon: GaugeCircle, label: 'A fixed price', duration: 2.1, delay: -0.4 },
  { icon: Users, label: 'Senior builders', duration: 1.8, delay: -1.1 },
  { icon: Bot, label: 'AI on the repeat work', duration: 2.3, delay: -0.7 },
  { icon: CheckCircle2, label: 'Watch it live', duration: 1.9, delay: -1.5 },
  { icon: UserCheck, label: 'Checked by a person', duration: 2.2, delay: -0.2 },
  { icon: Rocket, label: 'Launch', duration: 1.7, delay: -0.9 },
];

function PillConveyor({ pills, tone }: { pills: Pill[]; tone: 'alert' | 'brand' }) {
  const pillStyles =
    tone === 'alert'
      ? ALERT_CHIP
      : 'border-[var(--fx-yellow)] bg-[var(--fx-yellow)]/[0.08] text-[var(--fx-yellow)]';
  const connector = tone === 'alert' ? ALERT_RULE : 'bg-[var(--fx-yellow)]/60';
  const ring = tone === 'alert' ? 'rgba(255,64,93,0.25)' : 'rgba(248,205,2,0.25)';

  return (
    /* The kit duplicates the belt for the seamless loop and hides the copy
       from assistive tech, so the row below is written once. */
    <Marquee className="absolute inset-x-0 top-1/2 -translate-y-1/2 py-2" seconds={26}>
      {pills.map((pill) => {
        const Icon = pill.icon;
        return (
          /* The trailing pad rides on the pill group rather than on a gap on
             the row, so the spacing is identical at the seam where the second
             copy of the belt begins. */
          <div key={pill.label} className="flex shrink-0 items-center gap-2 pr-2">
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
    </Marquee>
  );
}

export function Advantage() {
  return (
    <section
      className={`relative border-t border-[var(--fx-hairline)] bg-[var(--fx-charcoal)] text-[var(--fx-white)] ${SECTION_Y}`}
    >
      <Band>
        <div className="max-w-3xl">
          <BlurRise>
            <Eyebrow>Why Fortitudo</Eyebrow>
          </BlurRise>
          <Serif className={`mt-5 ${DISPLAY_M} text-[var(--fx-white)]`}>
            <KineticText lines={['You deal with the people who build it.']} />
          </Serif>
          <BlurRise delay={0.28}>
            <p className="mt-5 max-w-xl text-[14.5px] leading-relaxed text-[var(--fx-muted)]">
              No account manager in the middle. The senior people building your
              project are the ones you talk to, and the price is set before we
              start.
            </p>
          </BlurRise>
        </div>

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
                Calls you did not need. Change fees you did not expect. An
                account manager sitting between you and whoever is actually
                building. The bill never matches the quote.
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
                One senior team, and one page to watch them on. We use AI for
                the repetitive parts. A person checks every change before it
                counts.
              </p>
            </div>
          </BlurRise>
        </div>
      </Band>
    </section>
  );
}
