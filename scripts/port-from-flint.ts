#!/usr/bin/env tsx
/**
 * Port markdown files from a Flint docs subflint to Fumadocs format
 *
 * Reads docs-manifest.json from the subflint to determine structure and mapping.
 *
 * Usage: pnpm port --source <subflint-path>
 */

import * as fs from "fs";
import * as path from "path";

// ============================================================================
// Types
// ============================================================================

interface PageMapping {
  source: string;
  title: string;
  slug: string;
}

interface Section {
  id: string;
  title: string;
  pages: PageMapping[];
}

interface IndexPage {
  source: string;
  title: string;
}

interface DocsManifest {
  $schema?: string;
  version: string;
  site: string;
  title: string;
  index: IndexPage;
  sections: Section[];
}

// ============================================================================
// Content Processing
// ============================================================================

// Map unsupported languages to supported ones
const LANGUAGE_MAP: Record<string, string> = {
  gitignore: "text",
  flint: "text",
  mesh: "text",
};

function normalizeCodeBlocks(content: string): string {
  return content.replace(/```(\w+)/g, (match, lang) => {
    const normalized = LANGUAGE_MAP[lang.toLowerCase()];
    return normalized ? `\`\`\`${normalized}` : match;
  });
}

function convertWikiLinks(content: string, manifest: DocsManifest): string {
  // Build a map of source files to their target URLs
  const linkMap = new Map<string, string>();

  // Index page
  const indexBaseName = manifest.index.source.replace(/\.md$/, "");
  linkMap.set(indexBaseName, "/docs");

  // Section pages
  for (const section of manifest.sections) {
    for (const page of section.pages) {
      const baseName = page.source.replace(/\.md$/, "");
      linkMap.set(baseName, `/docs/${section.id}/${page.slug}`);
    }
  }

  return content.replace(/\[\[([^\]]+)\]\]/g, (_, linkText) => {
    const parts = linkText.split("|");
    const target = parts[0].trim();
    const display = parts[1]?.trim() || target;

    // Try to find in our link map
    const url = linkMap.get(target);
    if (url) {
      return `[${display}](${url})`;
    }

    // Fallback: convert to slug
    const slug = target
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    return `[${display}](/docs/${slug})`;
  });
}

function processContent(content: string, title: string, manifest: DocsManifest): string {
  // Remove existing frontmatter
  let processed = content.replace(/^---[\s\S]*?---\n*/, "");

  // Remove the first H1 title (fumadocs displays title from frontmatter)
  processed = processed.replace(/^#\s+.+\n+/, "");

  // Convert wiki links
  processed = convertWikiLinks(processed, manifest);

  // Normalize code block languages
  processed = normalizeCodeBlocks(processed);

  // Simple frontmatter with just title
  const frontmatter = `---\ntitle: "${title.replace(/"/g, '\\"')}"\n---\n\n`;

  return frontmatter + processed.trim() + "\n";
}

function createMetaJson(title: string, pages: string[]): string {
  return JSON.stringify({ title, pages }, null, 2) + "\n";
}

// ============================================================================
// Main Porting Logic
// ============================================================================

function portFromManifest(sourcePath: string): void {
  const manifestPath = path.join(sourcePath, "docs-manifest.json");
  const meshPath = path.join(sourcePath, "Mesh");

  if (!fs.existsSync(manifestPath)) {
    console.error(`Error: docs-manifest.json not found at ${manifestPath}`);
    process.exit(1);
  }

  if (!fs.existsSync(meshPath)) {
    console.error(`Error: Mesh folder not found at ${meshPath}`);
    process.exit(1);
  }

  const manifest: DocsManifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));

  console.log(`Porting: ${manifest.title}`);
  console.log(`Site: ${manifest.site}`);

  const targetPath = path.join(process.cwd(), "sites", manifest.site, "content", "docs");

  // Clean target directory
  if (fs.existsSync(targetPath)) {
    fs.rmSync(targetPath, { recursive: true });
  }
  fs.mkdirSync(targetPath, { recursive: true });

  console.log(`Target: ${targetPath}\n`);

  // Process index page
  const indexSource = path.join(meshPath, manifest.index.source);
  if (fs.existsSync(indexSource)) {
    const content = fs.readFileSync(indexSource, "utf-8");
    const mdx = processContent(content, manifest.index.title, manifest);
    fs.writeFileSync(path.join(targetPath, "index.mdx"), mdx);
    console.log(`  index.mdx <- ${manifest.index.source}`);
  } else {
    console.warn(`  Warning: ${manifest.index.source} not found`);
  }

  // Track sections for root meta.json
  const sectionIds: string[] = ["index"];

  // Process sections
  for (const section of manifest.sections) {
    const sectionPath = path.join(targetPath, section.id);
    fs.mkdirSync(sectionPath, { recursive: true });

    const pageSlugs: string[] = [];

    for (const page of section.pages) {
      const sourceFile = path.join(meshPath, page.source);

      if (!fs.existsSync(sourceFile)) {
        console.warn(`  Warning: ${page.source} not found`);
        continue;
      }

      const content = fs.readFileSync(sourceFile, "utf-8");
      const mdx = processContent(content, page.title, manifest);

      fs.writeFileSync(path.join(sectionPath, `${page.slug}.mdx`), mdx);
      pageSlugs.push(page.slug);
      console.log(`  ${section.id}/${page.slug}.mdx <- ${page.source}`);
    }

    // Create section meta.json
    fs.writeFileSync(path.join(sectionPath, "meta.json"), createMetaJson(section.title, pageSlugs));
    sectionIds.push(section.id);
  }

  // Create root meta.json
  fs.writeFileSync(path.join(targetPath, "meta.json"), createMetaJson("Documentation", sectionIds));

  console.log("\nDone!");
}

// ============================================================================
// CLI
// ============================================================================

const args = process.argv.slice(2);
let sourcePath = "";

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--source" && args[i + 1]) {
    sourcePath = args[i + 1];
    i++;
  }
}

if (!sourcePath) {
  console.log("Usage: pnpm port --source <subflint-path>");
  process.exit(1);
}

portFromManifest(sourcePath);
