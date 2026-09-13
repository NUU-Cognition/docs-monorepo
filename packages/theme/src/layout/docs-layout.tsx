import type { DocsLayoutProps } from "fumadocs-ui/layouts/docs";
import type { SiteConfig } from "../config";
import { createBaseOptions, baseOptions } from "./base-options";

/**
 * Create docs layout options for a documentation site.
 *
 * Sidebar tabs are on. Every content folder with `root: true` in its
 * meta.json shows in the product switcher at the top of the sidebar.
 *
 * @param config - Site-specific configuration
 * @returns DocsLayoutProps configured for the site
 */
export function createDocsLayoutOptions(
  config: SiteConfig
): Partial<DocsLayoutProps> {
  return {
    ...createBaseOptions(config),
    tabMode: "auto",
    sidebar: {
      defaultOpenLevel: 1,
      collapsible: true,
      // An empty options object turns on tab detection from the page tree.
      tabs: {},
    },
  };
}

/**
 * @deprecated Use createDocsLayoutOptions(config) instead
 */
export const docsLayoutOptions: Partial<DocsLayoutProps> = {
  ...baseOptions,
  sidebar: {
    defaultOpenLevel: 1,
  },
};
