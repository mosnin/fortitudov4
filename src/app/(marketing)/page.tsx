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
 * Every child here is a self-contained client component that takes NO props, so
 * nothing crosses the server→client boundary (this page is a Server Component;
 * it `auth()`s and bounces signed-in users to their workspace first).
 */

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Hero21 from '@/components/originkit/hero-21';
import { Stats } from '@/components/marketing/giga/stats';
import { Offerings } from '@/components/marketing/giga/offerings';
import { Pipeline } from '@/components/marketing/giga/pipeline';
import { Advantage } from '@/components/marketing/giga/advantage';
import { Testimonials } from '@/components/marketing/giga/testimonials';
import { ToneShift } from '@/components/marketing/giga/tone-shift';
import { Complexity } from '@/components/marketing/giga/complexity';
import { Faq } from '@/components/marketing/giga/faq';
import { CtaSection } from '@/components/marketing/giga/cta';

export default async function MarketingHomePage() {
  const { userId } = await auth();
  if (userId) {
    redirect('/post-login');
  }

  return (
    <>
      {/* The whole logged-out site is charcoal; the shell already forces it. */}
      <div className="bg-[var(--fx-charcoal)] text-white">
        <Hero21 />
        <Stats />
        <Offerings />
        <Pipeline />
        <Advantage />
      </div>

      {/* Halfway down, the ground flips to racing yellow and the ink to black.
          Everything below renders in the inverted scope — see the
          `[data-fx-tone="light"]` block in globals.css. The split is here
          because the top half is the pitch and the bottom half is the proof,
          and the colour change marks the turn. */}
      <ToneShift>
        {/* Proof follows the claim. Ships empty — the slots say what goes in them. */}
        <Testimonials />
        <Complexity />
        <Faq />
        <CtaSection />
      </ToneShift>
    </>
  );
}
