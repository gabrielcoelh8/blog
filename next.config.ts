import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

/**
 * Static export for GitHub Pages (project site at gabrielcoelh8.github.io/blog).
 * - `output: 'export'` writes plain HTML to out/ (replaces the old mdBook book/).
 * - `basePath` is only applied in production so `next dev` stays at "/".
 * - images unoptimized because the export target has no image server.
 */
const nextConfig: NextConfig = {
  output: "export",
  basePath: isProd ? "/blog" : "",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
