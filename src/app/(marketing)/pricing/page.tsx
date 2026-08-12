/**
 * `/pricing` — Fortitudo's engagement pricing on the dark cinematic redesign
 * system. The page body lives in components/marketing/pages/pricing-content.tsx
 * (ported from the giga marketing kit; English is the only shipped language —
 * price AMOUNTS still render via the LocalPrice client components so the
 * visitor's geo-resolved display currency applies, USD by default).
 */

import { PricingContent } from '@/components/marketing/pages/pricing-content';

/* The description enumerates the five offerings in `src/lib/services.ts` and
   nothing else — it used to advertise funnels and "Open Claw deployments",
   neither of which we sell, as the site's SEO and social preview text. */
export const metadata = {
  title: 'Pricing · Fortitudo Agency',
  description:
    'Websites, Software Solutions, AI Solutions, Consultation and Digital Marketing. You get a fixed price before we start. The price you approve is the price you pay.',
};

export default function PricingPage() {
  return <PricingContent lang="en" />;
}
