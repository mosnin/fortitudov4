/**
 * `/pricing` — how Fortitudo prices, on the dark cinematic redesign system.
 * The page body lives in components/marketing/pages/pricing-content.tsx
 * (ported from the giga marketing kit; English is the only shipped language).
 *
 * The page advertises NO figures. It kept its route and its nav entry and now
 * explains how a price is arrived at — one fixed price, agreed before work
 * starts — ending at the contact form. The amounts the product invoices from
 * are in `src/lib/pricing.ts` and are not read here.
 */

import { DEFAULT_LANG } from '@/lib/i18n/markets';
import { PRICING_PAGE } from '@/lib/i18n/dictionaries/pricing-page';
import { PricingContent } from '@/components/marketing/pages/pricing-content';

/* The description says how we price and promises nothing we do not do. It
   used to advertise funnels and "Open Claw deployments", neither of which we
   sell; after that it enumerated the five offerings and quoted fixed quotes
   with figures behind them. Both strings live in the page dictionary: a title
   and a description are read by a visitor in a search result, so they
   translate with the page. */
export const metadata = {
  title: PRICING_PAGE[DEFAULT_LANG].meta.title,
  description: PRICING_PAGE[DEFAULT_LANG].meta.description,
};

export default function PricingPage() {
  return <PricingContent lang="en" />;
}
