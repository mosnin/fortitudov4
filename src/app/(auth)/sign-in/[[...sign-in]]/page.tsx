import { AuthPageLayout } from '@/components/auth/auth-page-layout';
import { ThemedSignIn } from '@/components/auth/clerk-sign-in';
import Link from 'next/link';
import type { Metadata } from 'next';
import { BODY_MUTED, QUIET_LINK } from '@/lib/typography';
import { cn } from '@/lib/utils';

export const metadata: Metadata = { title: 'Sign In — Fortitudo' };

export default async function SignInPage({
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
  const postSignInUrl = isSafeRedirect
    ? redirect_url!
    : '/post-login';
  const signUpUrl = isSafeRedirect
    ? `/sign-up?redirect_url=${encodeURIComponent(redirect_url!)}`
    : '/sign-up';

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
