import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/providers/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fortitudo Agency | Digital Solutions Built for Growth",
  description:
    "Web applications, ecommerce stores, funnels, AI automation, and more. Choose your service and watch your project come to life.",
  metadataBase: new URL("https://fortitudo.agency"),
  openGraph: {
    title: "Fortitudo Agency | Digital Solutions Built for Growth",
    description:
      "Web applications, ecommerce stores, funnels, AI automation, and more.",
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
          colorPrimary: "#F97316",
          colorBackground: "#141414",
          colorText: "#F5F5F5",
          colorTextSecondary: "#A3A3A3",
          colorInputBackground: "#1C1C1C",
          colorInputText: "#F5F5F5",
          colorNeutral: "#F5F5F5",
          colorDanger: "#DC2626",
          colorSuccess: "#16A34A",
          colorWarning: "#EAB308",
          borderRadius: "0.75rem",
          fontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif',
          fontSize: "0.95rem",
        },
        elements: {
          card: "bg-card border border-border shadow-2xl rounded-2xl",
          headerTitle: "font-brand text-foreground",
          headerSubtitle: "text-muted-foreground",
          socialButtonsBlockButton:
            "border border-border bg-transparent hover:bg-muted text-foreground rounded-xl",
          socialButtonsBlockButtonText: "text-foreground",
          dividerLine: "bg-border",
          dividerText: "text-muted-foreground",
          formFieldLabel: "text-muted-foreground",
          formFieldInput:
            "bg-[#1C1C1C] border border-border text-foreground rounded-xl focus:border-orange",
          formButtonPrimary:
            "bg-orange hover:bg-orange-dark text-white rounded-xl shadow-sm normal-case font-medium",
          footerActionText: "text-muted-foreground",
          footerActionLink: "text-orange hover:text-orange-dark font-medium",
          formFieldAction: "text-orange hover:text-orange-dark",
          identityPreviewEditButton: "text-orange",
          userButtonPopoverCard: "bg-card border border-border rounded-2xl",
          userButtonPopoverActionButton: "hover:bg-muted text-foreground",
          userButtonPopoverActionButtonText: "text-foreground",
          badge: "bg-orange/10 text-orange",
          avatarBox: "rounded-lg",
        },
      }}
    >
      <html lang="en" className="dark h-full antialiased" suppressHydrationWarning>
        <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
          <ThemeProvider>{children}</ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
