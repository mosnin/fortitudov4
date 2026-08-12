import type { Metadata } from "next";
import { Inter_Tight } from "next/font/google";
import { GeistMono } from "geist/font/mono";
import { ClerkProvider } from "@clerk/nextjs";

/**
 * The one face, on both surfaces.
 *
 * Inter Tight replaces Geist Sans for body AND replaces Georgia for headings.
 * Two changes in one, and the second is the important one: the product set its
 * headlines in a serif while the logged-out site set them in a sans, so the
 * app spoke in two voices depending on whether you were signed in.
 *
 * It is Inter's narrower cut — the same familiar letterforms with tighter
 * sidebearings and a smaller x-height-to-width ratio — which is what makes it
 * read sleeker than Geist at a headline size without becoming a display face
 * that falls apart at 11px in a data table. Both ends matter here: this one
 * file feeds an 84px hero and an admin table on the same axis.
 *
 * Variable, so weight is a continuum rather than four cuts. Display dropped
 * from 600 to 500 at the same time — half of "heavy" was the weight, not the
 * face.
 *
 * `next/font` downloads it at build time and self-hosts it, so there is still
 * no network request for type at runtime and still no `@import url(...)` in
 * globals.css. Cyrillic is subset in for the Russian pages in `plans/i18n.md`;
 * unicode-range means Latin readers never download it.
 */
const interTight = Inter_Tight({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans-tight",
  display: "swap",
});
import { ThemeProvider } from "@/components/providers/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fortitudo Agency | We build it. You own it.",
  description:
    "Websites, apps, AI tools, and marketing. You get a fixed price before we start, a page that shows you how it is going, and every file the day it goes live.",
  metadataBase: new URL("https://fortitudo.agency"),
  openGraph: {
    title: "Fortitudo Agency | We build it. You own it.",
    description:
      "Websites, apps, AI tools, and marketing. A fixed price before we start, and everything is yours the day it goes live.",
    url: "https://fortitudo.agency",
    siteName: "Fortitudo Agency",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#111113",
          colorBackground: "#ffffff",
          colorText: "#111113",
          colorInputBackground: "#ffffff",
          colorInputText: "#111113",
        },
      }}
    >
      <html
        lang="en"
        className={`h-full antialiased ${interTight.variable} ${GeistMono.variable}`}
        suppressHydrationWarning
      >
        <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
          <ThemeProvider>{children}</ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
