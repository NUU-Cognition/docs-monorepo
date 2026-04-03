import type { ReactNode } from "react";
import { DocsContentLayout } from "@nuucognition/docs-theme";
import { source } from "@/lib/source";
import { siteConfig } from "@/site.config";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsContentLayout config={siteConfig} tree={source.pageTree}>
      {children}
    </DocsContentLayout>
  );
}
