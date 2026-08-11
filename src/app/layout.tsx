import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/providers/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fortitudo Agency | A Digital Agency Built for Founders",
  description:
    "Web applications, ecommerce stores, funnels, and AI automation — built by a senior team and accelerated by our AI build agent. Fixed quotes, real-time tracking.",
  metadataBase: new URL("https://fortitudo.agency"),
  openGraph: {
    title: "Fortitudo Agency | A Digital Agency Built for Founders",
    description:
      "Web applications, ecommerce stores, funnels, and AI automation — built by a senior team, accelerated by AI.",
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
