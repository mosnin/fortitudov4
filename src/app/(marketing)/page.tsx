/**
 * `/` (home), the logged-out homepage.
 *
 * Sections, in order: hero → the numbers → what we build → how an engagement
 * runs → why us → the closer → questions → the closing ask.
 *
 * Five sections were removed rather than restyled: the agent primitives, the
 * agent canvas, the approval queue, and the two dashboard tours. They were
 * product-UI demos of the internal platform, which made this read as a SaaS
 * landing page. Fortitudo sells builds, not software you log into — the
 * platform is how the work gets run, not the thing on the invoice. Git has
 * them if that judgement ever needs revisiting.
 *
 * Every child here is a self-contained client component whose only prop is the
 * language, a plain string, so nothing unserializable crosses the server→client
 * boundary (this page is a Server Component; it `auth()`s and bounces signed-in
 * users to their workspace first). Each section looks its own copy up in
 * `src/lib/i18n/dictionaries/home.ts`.
 *
 * English is the only shipped language: this file pins `lang` to 'en', and the
 * `[lang]` tree that will render the same sections in es/ru does not exist yet
 * (`plans/i18n.md`). The hero is imported from its leaf rather than through the
 * `hero-21` default wrapper so it can be handed the same prop as the rest.
 */

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import type { Lang } from '@/lib/i18n/markets';
import { Section25Hero } from '@/components/originkit/ui/hero-21/section-25-hero';
import { Stats } from '@/components/marketing/giga/stats';
import { Offerings } from '@/components/marketing/giga/offerings';
import { Pipeline } from '@/components/marketing/giga/pipeline';
import { Advantage } from '@/components/marketing/giga/advantage';
import { GlobalReach } from '@/components/marketing/giga/global-reach';
import { Testimonials } from '@/components/marketing/giga/testimonials';
import { ToneShift } from '@/components/marketing/giga/tone-shift';
import { PinboardCta } from '@/components/marketing/giga/pinboard-cta';
import { Complexity } from '@/components/marketing/giga/complexity';
import { Faq } from '@/components/marketing/giga/faq';

export default async function MarketingHomePage() {
  const { userId } = await auth();
  if (userId) {
    redirect('/post-login');
  }

  const lang: Lang = 'en';

  return (
    <>
      {/* The whole logged-out site is charcoal; the shell already forces it. */}
      <div className="bg-[var(--fx-charcoal)] text-white">
        <Section25Hero lang={lang} />
        <Stats lang={lang} />
        <Offerings lang={lang} />
        <Pipeline lang={lang} />
        <Advantage lang={lang} />
        {/* Last section of the charcoal half. The globe is cut off by its own
            section's bottom edge, so that edge has to be the page's turn to
            yellow — the horizon lands exactly on the tone shift below. */}
        <GlobalReach lang={lang} />
      </div>

      {/* Halfway down, the ground flips to racing yellow and the ink to black.
          Everything below renders in the inverted scope — see the
          `[data-fx-tone="light"]` block in globals.css. The split is here
          because the top half is the pitch and the bottom half is the proof,
          and the colour change marks the turn. */}
      <ToneShift>
        {/* Proof follows the claim. Ships empty — the slots say what goes in them. */}
        <Testimonials lang={lang} />
        <Complexity lang={lang} />
        <Faq lang={lang} />
      </ToneShift>

      {/* The closing ask, and the page's third act: charcoal, yellow, charcoal.
          It replaces CtaSection here rather than sitting beside it — both do the
          same job (send you to /contact) and running both would put two yellow
          calls to action on one screen.

          OUTSIDE the ToneShift, deliberately. The pinboard paints its own
          charcoal board with yellow paper on it, and every one of those colours
          comes from a token that the `[data-fx-tone="light"]` scope inverts —
          inside the flip the board would resolve to yellow and the notes would
          be yellow paper on a yellow board. */}
      <div className="bg-[var(--fx-charcoal)] text-white">
        <PinboardCta lang={lang} />
      </div>
    </>
  );
}
