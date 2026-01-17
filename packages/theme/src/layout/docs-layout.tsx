import type { DocsLayoutProps } from "fumadocs-ui/layouts/docs";
import type { SiteConfig } from "../config";
import { createBaseOptions, baseOptions } from "./base-options";

/**
 * Create docs layout options for a documentation site
 *
 * @param config - Site-specific configuration
 * @returns DocsLayoutProps configured for the site
 */
export function createDocsLayoutOptions(
  config: SiteConfig
): Partial<DocsLayoutProps> {
  return {
    ...createBaseOptions(config),
    sidebar: {
      defaultOpenLevel: 1,
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
