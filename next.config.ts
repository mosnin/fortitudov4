import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "blogger.googleusercontent.com" },
      { hostname: "img.clerk.com" },
      { hostname: "utfs.io" },
    ],
  },
};

export default nextConfig;
