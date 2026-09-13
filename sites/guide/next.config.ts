import { createMDX } from "fumadocs-mdx/next";
import type { NextConfig } from "next";

const withMDX = createMDX();

// NUU Guide is served at the domain root (guide.nuucognition.com).
// No basePath: every product lives at /<slug>.
const config: NextConfig = {
  reactStrictMode: true,
};

export default withMDX(config);
