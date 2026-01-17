/**
 * NUU Docs Theme
 *
 * Shared theme for all NUU documentation sites.
 *
 * Usage:
 * 1. Create a site config: { name, basePath, logo?, ... }
 * 2. Use createDocsLayoutOptions(config) in your layout
 * 3. Import tailwindPreset in your tailwind config
 */

export { tailwindPreset, cssVariables } from "./tailwind-preset";
export { Logo } from "./components/logo";
export { Callout } from "./components/callout";
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
} from "./layout";
