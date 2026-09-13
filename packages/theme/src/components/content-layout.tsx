import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";
import type { PageTree } from "fumadocs-core/server";
import type { SiteConfig } from "../config";
import { createDocsLayoutOptions } from "../layout/docs-layout";

/**
 * The docs shell: sidebar, product switcher, theme toggle, page column.
 * All options come from createDocsLayoutOptions(config).
 */
export function DocsContentLayout({
  config,
  tree,
  children,
}: {
  config: SiteConfig;
  tree: PageTree.Root;
  children: ReactNode;
}) {
  return (
    <DocsLayout tree={tree} {...createDocsLayoutOptions(config)}>
      {children}
    </DocsLayout>
  );
}
