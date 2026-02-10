import type { SiteConfig } from "@nuucognition/docs-theme";

/**
 * Vessel Documentation Site Configuration
 */
export const siteConfig: SiteConfig = {
  name: "NUU Vessel Docs",
  description:
    "Documentation for NUU Vessel - the publishing platform for Flint mesh content",
  basePath: "/docs",
  logo: <img src="/docs/logo.png" alt="Vessel" width={24} height={24} className="mb-0.5" />,
  github: "https://github.com/NUU-Cognition/vessel",
};
