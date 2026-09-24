"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useSelectedLayoutSegment } from "next/navigation";
import type { ReactNode } from "react";

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Route groups cover every public page, including newly added and nested routes.
  // Keep the application preference separate from the public site and auth shell.
  const segment = useSelectedLayoutSegment();
  const marketing = segment === "(marketing)" || segment === "(auth)";

  return (
    <NextThemesProvider
      key={marketing ? "marketing" : "application"}
      attribute="class"
      defaultTheme={marketing ? "dark" : "light"}
      storageKey={marketing ? "fortitudo-marketing-theme" : "theme"}
      enableSystem={marketing}
    >
      {children}
    </NextThemesProvider>
  );
}
