'use client';

import { SignUp } from '@clerk/nextjs';
import { clerkAuthAppearance } from './clerk-appearance';

// Clerk's SignUp is a discriminated union on `routing`/`path`; see
// clerk-sign-in.tsx for the same workaround rationale.
type SignUpProps = React.ComponentProps<typeof SignUp>;

export function ThemedSignUp(props: Omit<SignUpProps, 'appearance'>) {
  // Pinned dark, not read from the theme: the auth chrome is charcoal in
  // both themes, so following the user's light preference here would put
  // near-black Clerk labels on a near-black panel.
  const Component = SignUp as React.ComponentType<SignUpProps>;
  return <Component {...(props as SignUpProps)} appearance={clerkAuthAppearance(true)} />;
}
