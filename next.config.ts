import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    reactCompiler: true,
    staleTimes: {
      dynamic: 0,
    },
  },
  reactStrictMode: true,
};

export default nextConfig;
