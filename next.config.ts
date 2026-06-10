import type { NextConfig } from "next";

// Clerk loads clerk-js / ui.browser.js from its Frontend API host. In production
// that is the custom domain (clerk.<your-domain>); in dev/preview it is
// *.clerk.accounts.dev. These must be allowed in script/connect/frame-src or the
// SignIn/SignUp components silently fail to mount and the pages render blank.
const clerkOrigins = [
  "https://clerk.fortitudo.agency",
  "https://*.clerk.accounts.dev",
  "https://*.clerk.com",
];

const cspHeader = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${clerkOrigins.join(" ")} https://challenges.cloudflare.com`,
  // Google Fonts: stylesheet from fonts.googleapis.com, font files from fonts.gstatic.com.
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https://blogger.googleusercontent.com https://img.clerk.com https://utfs.io",
  "font-src 'self' https://fonts.gstatic.com",
  // clerk-telemetry.com receives clerk-js usage telemetry via fetch; without it
  // the request is CSP-blocked and logs a console error on every auth page.
  `connect-src 'self' ${clerkOrigins.join(" ")} https://clerk-telemetry.com https://checkout.creem.io https://*.ufs.sh https://*.uploadthing.com https://uploadthing.com`,
  `frame-src 'self' ${clerkOrigins.join(" ")} https://challenges.cloudflare.com`,
  "worker-src 'self' blob:",
].join("; ");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "blogger.googleusercontent.com" },
      { protocol: "https", hostname: "img.clerk.com" },
      { protocol: "https", hostname: "utfs.io" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: cspHeader,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
