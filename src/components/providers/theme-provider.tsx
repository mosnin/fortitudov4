"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const PUBLIC_PAGES = new Set([
  "", "about", "contact", "faq", "portfolio", "pricing", "privacy", "terms", "services", "work",
]);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const marketing = PUBLIC_PAGES.has((pathname ?? "/").split("/")[1]);

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
