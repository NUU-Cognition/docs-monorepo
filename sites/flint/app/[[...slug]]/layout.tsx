import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";
import { source } from "@/lib/source";
import { siteConfig } from "@/site.config";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={source.pageTree}
      nav={{
        title: (
          <div className="flex items-center gap-2">
            {siteConfig.logo}
            <span>{siteConfig.name}</span>
          </div>
        ),
      }}
      sidebar={{
        defaultOpenLevel: 2,
        collapsible: true,
      }}
      themeSwitch={{ enabled: false }}
      githubUrl={siteConfig.github}
    >
      {children}
    </DocsLayout>
  );
}
