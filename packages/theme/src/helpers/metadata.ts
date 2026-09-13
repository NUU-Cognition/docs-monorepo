import type { Metadata } from "next";
import type { SiteConfig } from "../config";

/**
 * Build Next.js metadata from a site config.
 * When config.url is set, metadataBase and Open Graph are filled in.
 */
export function createMetadata(config: SiteConfig): Metadata {
  const metadata: Metadata = {
    title: {
      template: `%s | ${config.name}`,
      default: config.name,
    },
    description: config.description,
  };

  const base = parseUrl(config.url);
  if (base) {
    metadata.metadataBase = base;
    metadata.openGraph = {
      type: "website",
      siteName: config.name,
      title: config.name,
      description: config.description,
      url: base.href,
    };
  }

  return metadata;
}

function parseUrl(value: string | undefined): URL | undefined {
  if (!value) return undefined;
  try {
    return new URL(value);
  } catch {
    return undefined;
  }
}
