import type { Metadata } from "next";

export const siteConfig = {
  name: "Lumen",
  shortDescription: "Build what matters, ship without limits.",
  description:
    "Lumen is the all-in-one platform for product teams to design, deploy, and scale software. Plan, build, and ship from a single surface with real-time collaboration, branch previews, and integrations for GitHub, Slack, and Linear.",
  url: "https://example.com",
  ogImage: "/og-image.png",
  creator: "@lumen",
  authors: [
    {
      name: "Lumen",
      url: "https://example.com",
    },
  ],
  keywords: [
    "Lumen",
    "developer platform",
    "product platform",
    "ship software",
    "branch previews",
    "real-time collaboration",
    "deployment platform",
    "SaaS landing page",
    "Next.js",
    "React",
  ],
} as const;

export const baseMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.shortDescription}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [...siteConfig.keywords],
  authors: [...siteConfig.authors],
  creator: siteConfig.creator,
  publisher: siteConfig.name,
  category: "technology",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: `${siteConfig.name} — ${siteConfig.shortDescription}`,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.shortDescription}`,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: siteConfig.creator,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.svg",
  },
  manifest: "/site.webmanifest",
};

export function createMetadata({
  title,
  description,
  path = "/",
  image,
  noIndex = false,
}: {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
}): Metadata {
  const url = `${siteConfig.url}${path}`;
  const ogImage = image ?? siteConfig.ogImage;
  const finalTitle = title ?? `${siteConfig.name} — ${siteConfig.shortDescription}`;
  const finalDesc = description ?? siteConfig.description;

  return {
    title: title ?? null,
    description: finalDesc,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: finalTitle,
      description: finalDesc,
      url,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: finalTitle,
        },
      ],
    },
    twitter: {
      title: finalTitle,
      description: finalDesc,
      images: [ogImage],
    },
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  };
}
