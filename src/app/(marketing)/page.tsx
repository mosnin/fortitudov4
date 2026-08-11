/**
 * `/` (home), the logged-out homepage.
 *
 * Sections, in order:
 *   1. Hero21 — the OriginKit hero-21 section, recoloured to racing yellow on
 *      charcoal. Split layout: headline and offerings left, an ASCII wave field
 *      with a floating dashboard card right. It replaces the previous
 *      photography-led hero; the old `Hero` component is still in the kit and
 *      still used by sub-pages via `SubHero`.
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
import { Advantage } from '@/components/marketing/giga/advantage';
import { Control } from '@/components/marketing/giga/control';
import { RealtorShowcase } from '@/components/marketing/giga/realtor-showcase';
import { BrokerageShowcase } from '@/components/marketing/giga/brokerage-showcase';
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
        <AgentCanvas />
        <Control />
        <Advantage />
        <RealtorShowcase />
        <BrokerageShowcase />
        <Complexity />
        <Faq />
      </div>
      {/* Light/dark-adaptive closing sections */}
      <CtaSection />
    </>
  );
}
