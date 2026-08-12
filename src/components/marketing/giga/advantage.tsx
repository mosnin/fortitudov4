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
import type { Lang } from '@/lib/i18n/markets';
import { HOME } from '@/lib/i18n/dictionaries/home';
import { KineticText, Marquee } from './motion-kit';
import { Band, BlurRise, Eyebrow, Serif } from './primitives';
import { ALERT_CHIP, ALERT_RULE, DISPLAY_M, MONO_STYLE, SECTION_Y, TITLE_S } from './tokens';

interface Pill {
  icon: LucideIcon;
  label: string;
  duration: number;
  delay: number;
}

/** Everything about a pill except its words. The labels come from the
 *  dictionary and are zipped on by position, so a translated belt keeps the
 *  icon and the ring timing it was tuned with. */
type PillStyling = Omit<Pill, 'label'>;

const legacyPillStyling: PillStyling[] = [
  { icon: CalendarClock, duration: 1.7, delay: -0.2 },
  { icon: FileWarning, duration: 2.4, delay: -0.8 },
  { icon: Mail, duration: 2.0, delay: -1.3 },
  { icon: Receipt, duration: 1.8, delay: -0.5 },
  { icon: AlertTriangle, duration: 2.2, delay: -1.7 },
];

const fortitudoPillStyling: PillStyling[] = [
  { icon: GaugeCircle, duration: 2.1, delay: -0.4 },
  { icon: Users, duration: 1.8, delay: -1.1 },
  { icon: Bot, duration: 2.3, delay: -0.7 },
  { icon: CheckCircle2, duration: 1.9, delay: -1.5 },
  { icon: UserCheck, duration: 2.2, delay: -0.2 },
  { icon: Rocket, duration: 1.7, delay: -0.9 },
];

function buildPills(styling: PillStyling[], labels: string[]): Pill[] {
  return styling.map((pill, i) => ({ ...pill, label: labels[i] }));
}

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

export function Advantage({ lang = 'en' }: { lang?: Lang }) {
  const t = HOME[lang].advantage;
  const legacyPills = buildPills(legacyPillStyling, t.legacyPills);
  const fortitudoPills = buildPills(fortitudoPillStyling, t.fortitudoPills);

  return (
    <section
      className={`relative border-t border-[var(--fx-hairline)] bg-[var(--fx-charcoal)] text-[var(--fx-white)] ${SECTION_Y}`}
    >
      <Band>
        <div className="max-w-3xl">
          <BlurRise>
            <Eyebrow>{t.eyebrow}</Eyebrow>
          </BlurRise>
          <Serif className={`mt-5 ${DISPLAY_M} text-[var(--fx-white)]`}>
            <KineticText lines={t.headingLines} />
          </Serif>
          <BlurRise delay={0.28}>
            <p className="mt-5 max-w-xl text-[14.5px] leading-relaxed text-[var(--fx-muted)]">
              {t.lead}
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
                {t.legacyTitle}
              </Serif>
              <p className="mt-2 max-w-[540px] text-[13.5px] leading-relaxed text-[var(--fx-muted)]">
                {t.legacyDesc}
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
                {t.fortitudoTitle}
              </Serif>
              <p className="mt-2 max-w-[540px] text-[13.5px] leading-relaxed text-[var(--fx-muted)]">
                {t.fortitudoDesc}
              </p>
            </div>
          </BlurRise>
        </div>
      </Band>
    </section>
  );
}
