import type { Metadata } from "next";
import type { SiteConfig } from "../config";

export function createMetadata(config: SiteConfig): Metadata {
  return {
    title: {
      template: `%s | ${config.name}`,
      default: config.name,
    },
    description: config.description,
  };
}
