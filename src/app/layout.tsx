import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ClerkProvider } from "@clerk/nextjs";
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
        className={`h-full antialiased ${GeistSans.variable} ${GeistMono.variable}`}
        suppressHydrationWarning
      >
        <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
          <ThemeProvider>{children}</ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
