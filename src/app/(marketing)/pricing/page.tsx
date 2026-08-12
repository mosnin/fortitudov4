/**
 * `/pricing` — Fortitudo's engagement pricing on the dark cinematic redesign
 * system. The page body lives in components/marketing/pages/pricing-content.tsx
 * (ported from the giga marketing kit; English is the only shipped language —
 * price AMOUNTS still render via the LocalPrice client components so the
 * visitor's geo-resolved display currency applies, USD by default).
 */

import { DEFAULT_LANG } from '@/lib/i18n/markets';
import { PRICING_PAGE } from '@/lib/i18n/dictionaries/pricing-page';
import { PricingContent } from '@/components/marketing/pages/pricing-content';

/* The description enumerates the five offerings in `src/lib/services.ts` and
   nothing else — it used to advertise funnels and "Open Claw deployments",
   neither of which we sell, as the site's SEO and social preview text. Both
   strings live in the page dictionary: a title and a description are read by a
   visitor in a search result, so they translate with the page. */
export const metadata = {
  title: PRICING_PAGE[DEFAULT_LANG].meta.title,
  description: PRICING_PAGE[DEFAULT_LANG].meta.description,
};

export default function PricingPage() {
  return <PricingContent lang="en" />;
}
