'use client';

import { SignIn } from '@clerk/nextjs';
import { clerkAuthAppearance } from './clerk-appearance';

// Clerk's SignIn is a discriminated union on `routing`/`path`, so narrowing
// a prop-spread through React.ComponentProps collapses to the wrong member.
// We pass through whatever props the caller supplies — the runtime contract
// is unchanged — so cast to the union-wide type.
type SignInProps = React.ComponentProps<typeof SignIn>;

export function ThemedSignIn(props: Omit<SignInProps, 'appearance'>) {
  // Pinned dark, not read from the theme: the auth chrome is charcoal in
  // both themes, so following the user's light preference here would put
  // near-black Clerk labels on a near-black panel.
  const Component = SignIn as React.ComponentType<SignInProps>;
  return <Component {...(props as SignInProps)} appearance={clerkAuthAppearance(true)} />;
}
