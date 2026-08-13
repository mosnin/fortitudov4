'use client';

/**
 * `/design` — creative direction, and the fact that UX/UI runs through
 * everything Fortitudo builds.
 *
 * The page is two moves. The hero IS the argument: an interactive film
 * roller (`FilmRollerStage`) that prints deliberately blank frames onto the
 * page's own floor — a piece of design you steer, on the site of the studio
 * asking you to trust its design. Below it, the plain-words version: what
 * creative direction, UX and UI mean here, and the guardrail sentence that
 * they are inside the fixed price, not a sixth offering (`services.ts` lists
 * exactly five things and this page must never grow a sixth).
 *
 * A full-viewport interactive canvas gets the full experience on its OWN
 * page precisely so it cannot fight the homepage: its wheel-zoom and keys
 * engage only on click (`components/filmroller/input.ts`), and nothing here
 * scroll-jacks. The copy lives in
 * `src/lib/i18n/dictionaries/design-page.ts`; English is pinned the same way
 * `/services` pins it, until the `[lang]` trees land (plans/i18n.md).
 */

import { DEFAULT_LANG } from '@/lib/i18n/markets';
import { DESIGN_PAGE } from '@/lib/i18n/dictionaries/design-page';
import { FilmRollerStage } from '@/components/marketing/giga/film-roller-stage';
import { StaggerGrid } from '@/components/marketing/giga/motion-kit';
import {
  Band,
  BlurRise,
  Eyebrow,
  PillGhost,
  PillPrimary,
  Serif,
} from '@/components/marketing/giga/primitives';
import {
  BODY,
  DISPLAY_S,
  LEAD,
  SECTION_Y,
  SECTION_Y_TIGHT,
  TITLE_S,
} from '@/components/marketing/giga/tokens';

export default function DesignPage() {
  const t = DESIGN_PAGE[DEFAULT_LANG];

  const craftBlocks = [t.craft.direction, t.craft.ux, t.craft.ui];

  return (
    <div className="bg-[var(--fx-charcoal)] text-white">
      <FilmRollerStage lang={DEFAULT_LANG} />

      {/* Why the frames up there are empty — the same sentence of honesty
          /portfolio leads with, kept close to the thing it explains. */}
      <Band className="border-b border-[var(--fx-hairline)]">
        <BlurRise className={SECTION_Y_TIGHT}>
          <p className={`max-w-2xl ${BODY} text-[var(--fx-muted)]`}>{t.hero.framesNote}</p>
        </BlurRise>
      </Band>

      <Band className={SECTION_Y}>
        <BlurRise>
          <Eyebrow>{t.craft.eyebrow}</Eyebrow>
          <Serif className={`mt-5 max-w-2xl ${DISPLAY_S} text-[var(--fx-white)]`}>
            {t.craft.title}
          </Serif>
        </BlurRise>

        <StaggerGrid className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3" columns={3}>
          {craftBlocks.map((block) => (
            <div key={block.title} className="border-t border-[var(--fx-hairline)] pt-6">
              <h3 className={`${TITLE_S} font-medium text-[var(--fx-white)]`}>{block.title}</h3>
              <p className={`mt-3 ${BODY} text-[var(--fx-muted)]`}>{block.body}</p>
            </div>
          ))}
        </StaggerGrid>

        <BlurRise>
          <p className={`mt-14 max-w-2xl ${LEAD} text-[var(--fx-white)]`}>{t.craft.included}</p>
        </BlurRise>
      </Band>

      {/* The closing ask, in this page's own words rather than the generic
          CtaSection — the promise being made is specifically about screens. */}
      <Band className={`border-t border-[var(--fx-hairline)] ${SECTION_Y}`}>
        <BlurRise>
          <Serif className={`max-w-2xl ${DISPLAY_S} text-[var(--fx-white)]`}>{t.cta.title}</Serif>
          <p className={`mt-5 max-w-xl ${LEAD} text-[var(--fx-muted)]`}>{t.cta.body}</p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <PillPrimary href="/contact" withArrow>
              {t.cta.primary}
            </PillPrimary>
            <PillGhost href="/portfolio">{t.cta.secondary}</PillGhost>
          </div>
        </BlurRise>
      </Band>
    </div>
  );
}
