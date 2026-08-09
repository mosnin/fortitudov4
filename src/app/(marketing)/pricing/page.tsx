/**
 * `/pricing` — Fortitudo's engagement pricing on the dark cinematic redesign
 * system. The page body lives in components/marketing/pages/pricing-content.tsx
 * (ported from the giga marketing kit; English is the only shipped language —
 * price AMOUNTS still render via the LocalPrice client components so the
 * visitor's geo-resolved display currency applies, USD by default).
 */

import { PricingContent } from '@/components/marketing/pages/pricing-content';

export const metadata = {
  title: 'Pricing · Fortitudo Agency',
  description:
    'Fixed quotes for funnels, ecommerce, web applications, AI automation, and Open Claw deployments. The price you approve is the price you pay.',
};

export default function PricingPage() {
  return <PricingContent lang="en" />;
}
