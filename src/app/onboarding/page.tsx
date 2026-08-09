import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { OnboardingClient } from '@/components/onboarding/onboarding-client';
import type { ServiceType } from '@/lib/services';

export const metadata = { title: 'Start your build — Fortitudo' };

const SERVICE_TYPES: ServiceType[] = [
  'websites',
  'software_solutions',
  'ai_solutions',
  'consultation',
  'digital_marketing',
];

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams?: Promise<{ service?: string }>;
}) {
  const { service } = (await searchParams) ?? {};

  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  // Belt-and-suspenders: verify this is a real Clerk user, not a stale token.
  const clerkUser = await currentUser();
  if (!clerkUser) redirect('/sign-in');

  const defaultName = clerkUser.fullName ?? clerkUser.firstName ?? '';

  // Marketing links may preselect a service (?service=websites) —
  // validate against the enum, then let the conversation confirm it.
  const initialService = SERVICE_TYPES.includes(service as ServiceType)
    ? (service as ServiceType)
    : null;

  return <OnboardingClient defaultName={defaultName} initialService={initialService} />;
}
