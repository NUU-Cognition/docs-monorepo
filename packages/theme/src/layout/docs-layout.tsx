import type { DocsLayoutProps } from "fumadocs-ui/layouts/docs";
import { baseOptions } from "./base-options";

/**
 * Docs layout options extending base layout
 *
 * Provides sidebar and navigation configuration for documentation sites.
 */
export const docsLayoutOptions: Partial<DocsLayoutProps> = {
  ...baseOptions,
  sidebar: {
    defaultOpenLevel: 1,
  },
};
