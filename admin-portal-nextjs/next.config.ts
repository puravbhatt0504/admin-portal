import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Add stability settings to prevent dev server hanging
  experimental: {
    // Disable some experimental features that can cause hanging
    serverComponentsExternalPackages: ['pg'],
  },
  // Add webpack configuration for better stability
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Add timeout settings for webpack
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
};

export default nextConfig;
