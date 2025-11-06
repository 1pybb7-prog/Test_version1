import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "img.clerk.com" },
      { hostname: "cdn.visitkorea.or.kr" },
      { hostname: "tong.visitkorea.or.kr" },
      { hostname: "via.placeholder.com" },
    ],
  },
};

export default nextConfig;
