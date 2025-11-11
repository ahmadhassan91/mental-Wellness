/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  swcMinify: false,
  experimental: {
    webpackBuildWorker: false,
    serverComponentsExternalPackages: ['@prisma/client', 'prisma'],
  },
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      config.cache = false;
    }
    return config;
  },
  outputFileTracing: true,
};

module.exports = nextConfig;
