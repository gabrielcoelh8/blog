import type { NextConfig } from "next";

/**
 * Static export for Cloudflare Pages (served at the domain root, no basePath).
 * - `output: 'export'` writes plain HTML to out/ (replaces the old mdBook book/).
 * - images unoptimized because the export target has no image server.
 */
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
