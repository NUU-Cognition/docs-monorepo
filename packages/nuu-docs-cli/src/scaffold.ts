/**
 * Scaffold a new Fumadocs site in the docs repo.
 */

import * as fs from "fs";
import * as path from "path";

interface SiteOptions {
  name: string; // directory name, e.g. "steel"
  displayName: string; // e.g. "NUU Steel Docs"
  description: string;
  port: number;
  basePath: string; // e.g. "/docs"
  github?: string;
}

function writeFile(filePath: string, content: string): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content);
}

/**
 * Find the next available dev port by scanning existing sites.
 */
export function findNextPort(docsRepoPath: string): number {
  const sitesDir = path.join(docsRepoPath, "sites");
  if (!fs.existsSync(sitesDir)) return 30060;

  let maxPort = 30059;
  for (const entry of fs.readdirSync(sitesDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const pkgPath = path.join(sitesDir, entry.name, "package.json");
    if (!fs.existsSync(pkgPath)) continue;
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
    const devScript = pkg.scripts?.dev ?? "";
    const portMatch = devScript.match(/--port\s+(\d+)/);
    if (portMatch) {
      maxPort = Math.max(maxPort, parseInt(portMatch[1], 10));
    }
  }
  return maxPort + 1;
}

export function scaffoldSite(
  docsRepoPath: string,
  options: SiteOptions
): void {
  const siteDir = path.join(docsRepoPath, "sites", options.name);

  if (fs.existsSync(siteDir)) {
    throw new Error(`Site already exists: ${siteDir}`);
  }

  const pkgName = `@nuucognition/${options.name}-docs`;
  const titleCase =
    options.displayName ||
    `NUU ${options.name.charAt(0).toUpperCase() + options.name.slice(1)} Docs`;

  console.log(`\nScaffolding site: ${options.name}`);
  console.log(`  Package: ${pkgName}`);
  console.log(`  Port: ${options.port}`);
  console.log(`  Base path: ${options.basePath}`);
  console.log(`  Directory: ${siteDir}\n`);

  // package.json
  writeFile(
    path.join(siteDir, "package.json"),
    JSON.stringify(
      {
        name: pkgName,
        version: "0.1.0",
        private: true,
        scripts: {
          dev: `next dev --port ${options.port}`,
          build: "next build",
          start: "next start",
          lint: "next lint",
          "type-check": "tsc --noEmit",
          postinstall: "fumadocs-mdx",
        },
        dependencies: {
          "@nuucognition/docs-theme": "workspace:*",
          "fumadocs-core": "^15.8.5",
          "fumadocs-mdx": "^12.0.3",
          "fumadocs-ui": "^15.8.5",
          "lucide-react": "^0.475.0",
          next: "^15.1.2",
          react: "^19.0.0",
          "react-dom": "^19.0.0",
        },
        devDependencies: {
          "@tailwindcss/postcss": "^4.0.0",
          "@types/mdx": "^2.0.13",
          "@types/node": "^22.10.2",
          "@types/react": "^19.0.2",
          "@types/react-dom": "^19.0.2",
          tailwindcss: "^4.0.0",
          typescript: "^5.7.2",
        },
      },
      null,
      2
    ) + "\n"
  );
  console.log("  package.json");

  // next.config.ts
  writeFile(
    path.join(siteDir, "next.config.ts"),
    `import { createMDX } from "fumadocs-mdx/next";
import type { NextConfig } from "next";

const withMDX = createMDX();

const config: NextConfig = {
  reactStrictMode: true,
  basePath: "${options.basePath}",
};

export default withMDX(config);
`
  );
  console.log("  next.config.ts");

  // tsconfig.json
  writeFile(
    path.join(siteDir, "tsconfig.json"),
    JSON.stringify(
      {
        extends: "../../tsconfig.json",
        compilerOptions: {
          plugins: [{ name: "next" }],
          baseUrl: ".",
          paths: {
            "@/*": ["./*"],
            "@/.source": [".source"],
            "@nuucognition/docs-theme": [
              "../../packages/theme/src/index.ts",
            ],
            "@nuucognition/docs-theme/*": ["../../packages/theme/src/*"],
          },
        },
        include: [
          "next-env.d.ts",
          "**/*.ts",
          "**/*.tsx",
          ".next/types/**/*.ts",
        ],
        exclude: ["node_modules"],
      },
      null,
      2
    ) + "\n"
  );
  console.log("  tsconfig.json");

  // postcss.config.js
  writeFile(
    path.join(siteDir, "postcss.config.js"),
    `module.exports = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
`
  );
  console.log("  postcss.config.js");

  // source.config.ts
  writeFile(
    path.join(siteDir, "source.config.ts"),
    `import {
  defineConfig,
  defineDocs,
  frontmatterSchema,
  metaSchema,
} from "fumadocs-mdx/config";

export const docs = defineDocs({
  dir: "content/docs",
  docs: {
    schema: frontmatterSchema,
  },
  meta: {
    schema: metaSchema,
  },
});

export default defineConfig({
  mdxOptions: {},
});
`
  );
  console.log("  source.config.ts");

  // site.config.tsx
  writeFile(
    path.join(siteDir, "site.config.tsx"),
    `import type { SiteConfig } from "@nuucognition/docs-theme";

export const siteConfig: SiteConfig = {
  name: "${titleCase}",
  description: "${options.description.replace(/"/g, '\\"')}",
  basePath: "${options.basePath}",${options.github ? `\n  github: "${options.github}",` : ""}
};
`
  );
  console.log("  site.config.tsx");

  // lib/source.ts
  writeFile(
    path.join(siteDir, "lib", "source.ts"),
    `import { docs } from "@/.source";
import { loader } from "fumadocs-core/source";

export const source = loader({
  baseUrl: "/",
  source: docs.toFumadocsSource(),
});
`
  );
  console.log("  lib/source.ts");

  // app/globals.css
  writeFile(
    path.join(siteDir, "app", "globals.css"),
    `@import "tailwindcss";
@import "fumadocs-ui/css/neutral.css";
@import "fumadocs-ui/css/preset.css";

@source "../node_modules/fumadocs-ui/dist/**/*.js";
@source "../../packages/theme/src/**/*.{js,ts,jsx,tsx}";

@theme {
  --font-sans: var(--font-geist-sans), "Inter", system-ui, sans-serif;
  --font-mono: var(--font-geist-mono), monospace;
}

html {
  font-size: 15px;
}

:root {
  --fd-layout-width: 100vw;
  --fd-page-width: 1100px;
}

.prose h1,
.prose h2,
.prose h3,
.prose h4 {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}

.prose h1:first-child,
.prose h2:first-child,
.prose h3:first-child {
  margin-top: 0;
}

article > div:last-child:has(a[href]) {
  margin-top: 3rem;
}

#nd-sidebar > div:last-child {
  border-top: none;
}
`
  );
  console.log("  app/globals.css");

  // app/layout.tsx
  writeFile(
    path.join(siteDir, "app", "layout.tsx"),
    `import "./globals.css";
import { DocsRootLayout, createMetadata } from "@nuucognition/docs-theme";
import { siteConfig } from "@/site.config";

export const metadata = createMetadata(siteConfig);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DocsRootLayout config={siteConfig}>{children}</DocsRootLayout>;
}
`
  );
  console.log("  app/layout.tsx");

  // app/[[...slug]]/layout.tsx
  writeFile(
    path.join(siteDir, "app", "[[...slug]]", "layout.tsx"),
    `import type { ReactNode } from "react";
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
`
  );
  console.log("  app/[[...slug]]/layout.tsx");

  // app/[[...slug]]/page.tsx
  writeFile(
    path.join(siteDir, "app", "[[...slug]]", "page.tsx"),
    `import { source } from "@/lib/source";
import { DocsPageContent } from "@nuucognition/docs-theme";
import { notFound } from "next/navigation";

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  return <DocsPageContent page={page} params={params} />;
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  };
}
`
  );
  console.log("  app/[[...slug]]/page.tsx");

  // app/api/search/route.ts
  writeFile(
    path.join(siteDir, "app", "api", "search", "route.ts"),
    `import { source } from "@/lib/source";
import { createSearchHandler } from "@nuucognition/docs-theme";

export const { GET } = createSearchHandler(source);
`
  );
  console.log("  app/api/search/route.ts");

  // vercel.json
  writeFile(
    path.join(siteDir, "vercel.json"),
    JSON.stringify(
      {
        $schema: "https://openapi.vercel.sh/vercel.json",
        framework: "nextjs",
        installCommand: "pnpm install",
        buildCommand: `cd ../.. && pnpm build --filter=${pkgName}`,
      },
      null,
      2
    ) + "\n"
  );
  console.log("  vercel.json");

  // Placeholder content so build doesn't fail
  const contentDir = path.join(siteDir, "content", "docs");
  fs.mkdirSync(contentDir, { recursive: true });

  writeFile(
    path.join(contentDir, "index.mdx"),
    `---
title: "${titleCase}"
description: "${options.description.replace(/"/g, '\\"')}"
---

Welcome to ${titleCase}. Use \`nuu-docs push\` to populate this site with content from a Flint.
`
  );

  writeFile(
    path.join(contentDir, "meta.json"),
    JSON.stringify({ title: titleCase, pages: ["index"] }, null, 2) + "\n"
  );
  console.log("  content/docs/index.mdx + meta.json");

  console.log(`\nSite scaffolded at ${siteDir}`);
  console.log(`\nNext steps:`);
  console.log(`  1. cd ${docsRepoPath} && pnpm install`);
  console.log(
    `  2. nuu-docs push "<DocSetName>" "${options.name}" — to populate content`
  );
  console.log(`  3. pnpm dev --filter ${pkgName} — to preview`);
}
