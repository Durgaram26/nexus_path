import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "",
  turbopack: {},
  webpack: (config) => {
    // Handle PDF.js worker
    config.resolve.alias = {
      ...config.resolve.alias,
      'pdfjs-dist/build/pdf.worker.entry': 'pdfjs-dist/build/pdf.worker.min.mjs',
    };
    return config;
  },
};

export default nextConfig;
