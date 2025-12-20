/**
 * NUU Docs Theme Configuration
 */

export interface DocsThemeConfig {
  /** Site name shown in header */
  name: string;
  /** Site description for meta tags */
  description?: string;
  /** GitHub repository URL */
  github?: string;
  /** Base path for docs (e.g., "/docs") */
  basePath?: string;
  /** Navigation links */
  nav?: {
    title: string;
    href: string;
    external?: boolean;
  }[];
  /** Footer links */
  footer?: {
    title: string;
    href: string;
    external?: boolean;
  }[];
}

export const docsTheme = {
  /**
   * Default configuration for NUU docs sites
   */
  defaults: {
    name: "NUU Documentation",
    description: "Documentation for NUU Cognition products",
    github: "https://github.com/NUU-Cognition",
    footer: [
      { title: "NUU Cognition", href: "https://nuucognition.com", external: true },
      { title: "GitHub", href: "https://github.com/NUU-Cognition", external: true },
    ],
  } satisfies DocsThemeConfig,
};
