import { AuthPageLayout } from '@/components/auth/auth-page-layout';
import { ThemedSignIn } from '@/components/auth/clerk-sign-in';
import Link from 'next/link';
import type { Metadata } from 'next';
import { BODY_MUTED, QUIET_LINK } from '@/lib/typography';
import { cn } from '@/lib/utils';
import { postLoginUrl, safeAuthDestination } from '@/lib/auth-redirect';

export const metadata: Metadata = { title: 'Sign In — Fortitudo' };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect_url?: string }>;
}) {
  const { redirect_url } = await searchParams;
  const destination = safeAuthDestination(redirect_url);
  const postSignInUrl = postLoginUrl(redirect_url);
  const signUpUrl = destination
    ? `/sign-up?redirect_url=${encodeURIComponent(destination)}`
    : '/sign-up';

  // Existing users must be able to authenticate from a fresh browser.
  // Invitations still gate account creation on /sign-up; authentication and
  // every role/data boundary remain enforced by the existing provider.

  return (
    <AuthPageLayout
      heading="Welcome back, founder."
    >
      <div className="w-full space-y-4">
        <ThemedSignIn
          routing="path"
          path="/sign-in"
          forceRedirectUrl={postSignInUrl}
          signUpUrl={signUpUrl}
        />
        <p className={cn(BODY_MUTED, 'text-center')}>
          Don&apos;t have an account?{' '}
          <Link href={signUpUrl} className={cn(QUIET_LINK, 'underline underline-offset-4')}>
            Sign up
          </Link>
        </p>
      </div>
    </AuthPageLayout>
  );
}
