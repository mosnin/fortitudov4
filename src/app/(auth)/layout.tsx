/**
 * (auth) group layout. The pages compose their own visual shell
 * (`AuthPageLayout`); this layout exists to keep the shutter page transition
 * alive across the marketing ⇄ auth boundary — a "Sign in" click covers the
 * page while the (marketing) layout is mounted, and the instance here performs
 * the reveal once the auth route has rendered. The overlay itself is a
 * singleton on <body>, so the two instances hand off without a seam.
 */

import { PageShutter } from '@/components/marketing/giga/page-shutter';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageShutter />
      {children}
    </>
  );
}
