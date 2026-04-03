import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";
import type { PageTree } from "fumadocs-core/server";
import type { SiteConfig } from "../config";

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
    <DocsLayout
      tree={tree}
      nav={{
        title: (
          <div className="flex items-center gap-2">
            {config.logo}
            <span>{config.name}</span>
          </div>
        ),
      }}
      sidebar={{
        defaultOpenLevel: 2,
        collapsible: true,
      }}
      themeSwitch={{ enabled: false }}
      githubUrl={config.github}
    >
      {children}
    </DocsLayout>
  );
}
