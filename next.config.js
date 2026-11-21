/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverComponentsExternalPackages: ['@resvg/resvg-js', 'sharp'],
    outputFileTracingIncludes: {
      '/api/generate': ['./node_modules/@fontsource/*/files/*-latin-*-normal.woff'],
      '/api/brand-export': ['./node_modules/@fontsource/*/files/*-latin-*-normal.woff', './node_modules/@fontsource/*/LICENSE'],
    },
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

module.exports = nextConfig;
