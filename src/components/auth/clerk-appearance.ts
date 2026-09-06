/**
 * Theme-aware Clerk appearance config.
 * This config sets Clerk's variables (so its internal state colors line up
 * with the paper-flat auth chrome), layout choices, and flattens the card so
 * the AuthPageLayout supplies all the chrome around the form.
 */
export function clerkAuthAppearance(isDark: boolean) {
  const primary = isDark ? '#f8cd02' : '#1c1917';
  const foreground = isDark ? '#f1f3f5' : '#1c1917';

  return {
    variables: {
      colorPrimary: primary,
      colorPrimaryForeground: isDark ? '#101010' : '#ffffff',
      colorBackground: isDark ? '#101010' : '#ffffff',
      colorForeground: foreground,
      colorMuted: isDark ? '#232323' : '#f5f5f5',
      colorMutedForeground: isDark ? '#b5b5b5' : '#57534e',
      colorInput: isDark ? '#181818' : '#ffffff',
      colorInputForeground: foreground,
      colorBorder: isDark ? '#484848' : '#d6d3d1',
      colorNeutral: foreground,
      borderRadius: '0.375rem', // rounded-md
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
      fontSize: '0.875rem',
    },
    layout: {
      socialButtonsPlacement: 'top' as const,
      socialButtonsVariant: 'blockButton' as const,
    },
    elements: {
      // Explicit component styles survive Clerk's unlayered stylesheet;
      // Tailwind v4 utility classes alone lose that cascade and leave a white
      // card behind dark-mode controls.
      rootBox: { width: '100%', overflow: 'visible' },
      card: { boxShadow: 'none', border: 0, padding: 0, width: '100%', gap: '1rem', backgroundColor: 'transparent', overflow: 'visible' },
      cardBox: { boxShadow: 'none', border: 0, backgroundColor: 'transparent', overflow: 'visible' },
      header: { display: 'none' },
      headerTitle: { display: 'none' },
      headerSubtitle: { display: 'none' },
      footer: { display: 'none' },
      footerAction: { display: 'none' },
    },
  } as const;
}
