import { cookies } from 'next/headers';
import { AuthPageLayout } from '@/components/auth/auth-page-layout';
import { InviteGate } from '@/components/auth/invite-gate';
import { ThemedSignUp } from '@/components/auth/clerk-sign-up';
import Link from 'next/link';
import type { Metadata } from 'next';
import { BODY_MUTED, QUIET_LINK } from '@/lib/typography';
import { cn } from '@/lib/utils';

export const metadata: Metadata = { title: 'Sign Up — Fortitudo' };

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect_url?: string }>;
}) {
  const { redirect_url } = await searchParams;
  // Validate redirect_url: allow safe internal paths, block path traversal.
  const SAFE_PREFIXES = ['/dashboard', '/admin', '/onboarding', '/checkout', '/projects', '/messages', '/payments', '/settings', '/post-login'];
  const isSafeRedirect = redirect_url
    && SAFE_PREFIXES.some(p => redirect_url.startsWith(p))
    && !redirect_url.includes('..');
  const signInUrl = isSafeRedirect
    ? `/sign-in?redirect_url=${encodeURIComponent(redirect_url!)}`
    : '/sign-in';

  const postSignUpUrl = isSafeRedirect
    ? redirect_url!
    : '/post-login';

  // Same invite gate as /sign-in — see that page for the mechanism.
  const invited = (await cookies()).get('invite_ok')?.value === '1';
  if (!invited) {
    return (
      <AuthPageLayout heading="Invite code?">
        <InviteGate />
      </AuthPageLayout>
    );
  }

  return (
    <AuthPageLayout
      heading="Set up Helix."
      subheading="Two minutes."
    >
      <div className="w-full space-y-4">
        <ThemedSignUp
          routing="path"
          path="/sign-up"
          forceRedirectUrl={postSignUpUrl}
          signInUrl={signInUrl}
        />
        <p className={cn(BODY_MUTED, 'text-center')}>
          Already have an account?{' '}
          <Link href={signInUrl} className={cn(QUIET_LINK, 'underline underline-offset-4')}>
            Sign in
          </Link>
        </p>
      </div>
    </AuthPageLayout>
  );
}
