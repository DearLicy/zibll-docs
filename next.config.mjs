import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();
const basePath = process.env.NEXT_PUBLIC_BASE_PATH?.replace(/\/$/, '') || '';

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: 'export',
  trailingSlash: true,
  basePath,
  images: {
    unoptimized: true,
  },
};

const mdxConfig = withMDX(config);

// The project scripts force webpack. Removing the injected Turbopack rules avoids
// Next 16 config warnings for Fumadocs metadata loader conditions.
delete mdxConfig.turbopack;

export default mdxConfig;
