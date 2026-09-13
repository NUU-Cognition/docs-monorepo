import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import type { SiteConfig } from "../config";
import { nuuDefaults } from "../config";
import { Logo } from "../components/logo";

/**
 * The brand title shown in the sidebar header and the mobile top bar.
 * Uses the site logo when the config has one. Falls back to the NUU mark.
 */
export function BrandTitle({ config }: { config: SiteConfig }) {
  return (
    <span className="nuu-brand inline-flex items-center gap-2">
      {config.logo ?? <Logo width={18} height={19} className="text-fd-foreground" />}
      <span>{config.name}</span>
    </span>
  );
}

/**
 * Create base layout options for a documentation site.
 *
 * @param config - Site-specific configuration
 * @returns BaseLayoutProps configured for the site
 */
export function createBaseOptions(config: SiteConfig): BaseLayoutProps {
  return {
    nav: {
      title: <BrandTitle config={config} />,
      url: normalizeBasePath(config.basePath),
    },
    themeSwitch: {
      enabled: true,
      mode: "light-dark",
    },
    // null hides the GitHub button; undefined falls back to the NUU org
    githubUrl: config.github === null ? undefined : (config.github ?? nuuDefaults.github),
    links: (config.links ?? nuuDefaults.links).map((link) =>
      link.icon
        ? {
            type: "icon" as const,
            icon: link.icon,
            text: link.text,
            label: link.text,
            url: link.url,
            external: link.external,
          }
        : {
            text: link.text,
            url: link.url,
            external: link.external,
          }
    ),
  };
}

/** "/docs/" -> "/docs". "" or "/" -> "/". */
function normalizeBasePath(basePath: string | undefined): string {
  const trimmed = (basePath ?? "").replace(/\/+$/, "");
  return trimmed.length > 0 ? trimmed : "/";
}

/**
 * @deprecated Use createBaseOptions(config) instead
 */
export const baseOptions: BaseLayoutProps = {
  nav: {
    title: <span className="nuu-brand font-medium">NUU Docs</span>,
  },
  githubUrl: nuuDefaults.github,
  links: nuuDefaults.links,
};
