/**
 * NUU Docs Theme Configuration
 *
 * Sites provide their own SiteConfig to customize the theme.
 */

import type { ReactNode } from "react";

/**
 * Configuration for a documentation site
 */
export interface SiteConfig {
  /** Site name shown in header */
  name: string;

  /** Site description for meta tags */
  description?: string;

  /** Logo component or element to display in nav */
  logo?: ReactNode;

  /** Base path for docs (e.g., "/" or "/docs") */
  basePath: string;

  /** GitHub repository URL (optional) */
  github?: string;

  /** Navigation links */
  links?: {
    text: string;
    url: string;
    external?: boolean;
  }[];
}

/**
 * Default NUU branding values (sites can override)
 */
export const nuuDefaults = {
  github: "https://github.com/NUU-Cognition",
  links: [
    {
      text: "NUU Cognition",
      url: "https://nuucognition.com",
      external: true,
    },
  ],
};

// Re-export for backwards compatibility
export interface DocsThemeConfig extends SiteConfig {}
export const docsTheme = { defaults: nuuDefaults };
