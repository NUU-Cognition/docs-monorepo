import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import type { SiteConfig } from "../config";
import { nuuDefaults } from "../config";

/**
 * Create base layout options for a documentation site
 *
 * @param config - Site-specific configuration
 * @returns BaseLayoutProps configured for the site
 */
export function createBaseOptions(config: SiteConfig): BaseLayoutProps {
  return {
    nav: {
      title: config.logo ? (
        <div className="flex items-center gap-2">
          {config.logo}
          <span className="font-semibold">{config.name}</span>
        </div>
      ) : (
        <span className="font-semibold">{config.name}</span>
      ),
    },
    githubUrl: config.github ?? nuuDefaults.github,
    links: config.links ?? nuuDefaults.links,
  };
}

/**
 * @deprecated Use createBaseOptions(config) instead
 */
export const baseOptions: BaseLayoutProps = {
  nav: {
    title: <span className="font-semibold">NUU Docs</span>,
  },
  githubUrl: nuuDefaults.github,
  links: nuuDefaults.links,
};
