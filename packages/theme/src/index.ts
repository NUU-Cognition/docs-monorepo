/**
 * NUU Docs Theme
 *
 * Shared theme for NUU Guide (guide.nuucognition.com).
 *
 * Usage:
 * 1. Create a site config: { name, basePath, url?, logo?, ... }
 * 2. Import the stylesheet after Tailwind and the Fumadocs presets:
 *    @import "@nuucognition/docs-theme/styles/guide.css";
 * 3. Render DocsRootLayout, DocsContentLayout and DocsPageContent.
 * 4. Pass mdxComponents to MDX.
 *
 * tailwindPreset and cssVariables are deprecated. They target Tailwind v3.
 * Sites on Tailwind v4 use styles/guide.css instead.
 */

/** @deprecated Tailwind v3 only. Import styles/guide.css instead. */
export { tailwindPreset, cssVariables } from "./tailwind-preset";
export { Logo } from "./components/logo";
export { Callout, type CalloutProps, type CalloutType } from "./components/callout";
export { DocsRootLayout, searchApiPath } from "./components/root-layout";
export { DocsContentLayout } from "./components/content-layout";
export { DocsPageContent } from "./components/page-content";
export { mdxComponents, type GuideMdxComponents } from "./components/mdx-components";
export {
  ProductCard,
  ProductGrid,
  type ProductCardProps,
  type ProductGridProps,
} from "./components/product-card";
export { createMetadata } from "./helpers/metadata";
export { createSearchHandler } from "./helpers/search";
export {
  type SiteConfig,
  nuuDefaults,
  docsTheme,
  type DocsThemeConfig,
} from "./config";
export {
  createBaseOptions,
  createDocsLayoutOptions,
  baseOptions,
  docsLayoutOptions,
  BrandTitle,
} from "./layout";
