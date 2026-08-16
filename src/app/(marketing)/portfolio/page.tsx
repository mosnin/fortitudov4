import { redirect } from 'next/navigation';

/**
 * `/portfolio` → `/work`, permanently.
 *
 * The work moved when the owner named ten real client projects and the ring
 * carousel landed at /work — this route survives only because it has been
 * linked from the nav and the sitemap since launch, and an old link deserves
 * a page, not a 404. The `portfolio.ts` dictionary (the old empty-state copy)
 * stays for the day a translated case-study index needs it.
 */
export default function PortfolioPage() {
  redirect('/work');
}
