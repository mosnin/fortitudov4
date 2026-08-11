/**
 * `/` (home), the logged-out homepage.
 *
 * Sections, in order:
 *   1. Hero21 — the OriginKit hero-21 section, recoloured to racing yellow on
 *      charcoal. Split layout: headline and offerings left, an ASCII wave field
 *      with a floating dashboard card right. It replaces the previous
 *      photography-led hero, whose `Hero`/`SubHero` components have since been
 *      removed from the kit.
 *   2. Stats, the big-numbers band right under the hero.
 *   3. AgentCanvas, THE feature section: one animated component whose stepped
 *      list auto-advances with progress bars and swaps the card per step.
 *   4. Complexity, the closer.
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
import { AgentCanvas } from '@/components/marketing/giga/agent-canvas';
import { HelixPrimitives } from '@/components/marketing/giga/helix-primitives';
import { Pipeline } from '@/components/marketing/giga/pipeline';
import { Advantage } from '@/components/marketing/giga/advantage';
import { Control } from '@/components/marketing/giga/control';
import { DeliveryShowcase } from '@/components/marketing/giga/delivery-showcase';
import { OversightShowcase } from '@/components/marketing/giga/oversight-showcase';
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
        {/* The two Helix sections sit together: what the agent is allowed to
            do, then the pipeline it does it inside. Splitting them puts an
            unrelated band between a claim and its evidence. */}
        <HelixPrimitives />
        <Pipeline />
        <AgentCanvas />
        <Control />
        <Advantage />
        {/* Named realtor-/brokerage-showcase until the real-estate template
            vocabulary was swept out; they are the client and agency dashboard
            tours. */}
        <DeliveryShowcase />
        <OversightShowcase />
        <Complexity />
        <Faq />
      </div>
      {/* Light/dark-adaptive closing sections */}
      <CtaSection />
    </>
  );
}
