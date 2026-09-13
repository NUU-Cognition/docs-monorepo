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

  /**
   * Canonical site URL, for example "https://guide.nuucognition.com".
   * When set, createMetadata uses it for metadataBase and Open Graph.
   */
  url?: string;

  /** Logo component or element to display in nav */
  logo?: ReactNode;

  /** Base path for docs (e.g., "/" or "/docs") */
  basePath: string;

  /**
   * GitHub repository URL. Omit it to fall back to the NUU organisation.
   * Set it to null to show no GitHub link at all.
   */
  github?: string | null;

  /**
   * Navigation links. A link with an `icon` renders as an icon button in
   * the sidebar footer (next to the theme toggle) instead of a text tab.
   */
  links?: {
    text: string;
    url: string;
    external?: boolean;
    icon?: ReactNode;
  }[];
}

/**
 * Default NUU branding values (sites can override)
 */
export const nuuDefaults: {
  github: string;
  links: NonNullable<SiteConfig["links"]>;
} = {
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
