#!/usr/bin/env tsx
/**
 * Port markdown files from a Flint docs subflint to Fumadocs format
 *
 * Reads docs-manifest.json from the subflint to determine structure and mapping.
 *
 * Usage: pnpm port --source <subflint-path>
 *
 * Example:
 *   pnpm port --source "/path/to/(Flint) App Docs"
 */

import * as fs from "fs";
import * as path from "path";

// ============================================================================
// Types
// ============================================================================

interface PageMapping {
  source: string;
  slug: string;
  title?: string; // Override extracted title
  description?: string; // Override extracted description
}

interface Section {
  id: string;
  title: string;
  description?: string;
  pages: PageMapping[];
}

interface DocsManifest {
  $schema?: string;
  version: string;
  site: string;
  title: string;
  description?: string;
  index: string; // Source file for index.mdx
  sections: Section[];
}

// ============================================================================
// Content Processing
// ============================================================================

function escapeYamlString(str: string): string {
  // Always quote to avoid any YAML parsing issues
  // Escape backslashes first, then quotes
  const escaped = str.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return `"${escaped}"`;
}

function extractTitle(content: string): string | null {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1") // Bold
    .replace(/\*(.+?)\*/g, "$1") // Italic
    .replace(/`(.+?)`/g, "$1") // Inline code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Links
    .replace(/\[\[([^\]]+)\]\]/g, "$1") // Wiki links
    .trim();
}

function extractDescription(content: string): string | null {
  const lines = content.split("\n");
  let foundTitle = false;

  for (const line of lines) {
    if (line.startsWith("# ")) {
      foundTitle = true;
      continue;
    }
    if (foundTitle && line.trim() === "") {
      continue;
    }
    if (foundTitle && line.trim()) {
      // Stop at headings, lists, tables, code blocks
      if (
        line.startsWith("#") ||
        line.startsWith("-") ||
        line.startsWith("|") ||
        line.startsWith("```")
      ) {
        break;
      }
      // Strip markdown and truncate
      const desc = stripMarkdown(line);
      return desc.length > 160 ? desc.slice(0, 157) + "..." : desc;
    }
  }

  return null;
}

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
  const indexBaseName = manifest.index.replace(/\.md$/, "");
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

function createFrontmatter(title: string, description?: string): string {
  const lines = ["---", `title: ${escapeYamlString(title)}`];
  if (description) {
    lines.push(`description: ${escapeYamlString(description)}`);
  }
  lines.push("---", "");
  return lines.join("\n");
}

function processContent(
  content: string,
  title: string,
  description: string | undefined,
  manifest: DocsManifest
): string {
  // Remove existing frontmatter
  let processed = content.replace(/^---[\s\S]*?---\n*/, "");

  // Remove the first H1 title (we use frontmatter title)
  processed = processed.replace(/^#\s+.+\n+/, "");

  // Convert wiki links
  processed = convertWikiLinks(processed, manifest);

  // Normalize code block languages
  processed = normalizeCodeBlocks(processed);

  // Build frontmatter
  const extractedDesc = description || extractDescription(content);
  const frontmatter = createFrontmatter(title, extractedDesc || undefined);

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

  // Validate paths
  if (!fs.existsSync(manifestPath)) {
    console.error(`Error: docs-manifest.json not found at ${manifestPath}`);
    console.error("");
    console.error("Create a docs-manifest.json in your docs subflint.");
    console.error("See: https://nuu.dev/docs/guide/docs-manifest");
    process.exit(1);
  }

  if (!fs.existsSync(meshPath)) {
    console.error(`Error: Mesh folder not found at ${meshPath}`);
    process.exit(1);
  }

  // Load manifest
  const manifest: DocsManifest = JSON.parse(
    fs.readFileSync(manifestPath, "utf-8")
  );

  console.log(`Porting: ${manifest.title}`);
  console.log(`Site: ${manifest.site}`);
  console.log(`Source: ${meshPath}`);

  const targetPath = path.join(
    process.cwd(),
    "sites",
    manifest.site,
    "content",
    "docs"
  );
  console.log(`Target: ${targetPath}`);
  console.log("");

  // Ensure target directory exists
  fs.mkdirSync(targetPath, { recursive: true });

  // Process index page
  const indexSource = path.join(meshPath, manifest.index);
  if (fs.existsSync(indexSource)) {
    const content = fs.readFileSync(indexSource, "utf-8");
    const title = extractTitle(content) || "Introduction";
    const mdx = processContent(content, title, undefined, manifest);
    fs.writeFileSync(path.join(targetPath, "index.mdx"), mdx);
    console.log(`  Created: index.mdx (from ${manifest.index})`);
  } else {
    console.warn(`  Warning: Index file not found: ${manifest.index}`);
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
        console.warn(`  Warning: File not found: ${page.source}`);
        continue;
      }

      const content = fs.readFileSync(sourceFile, "utf-8");
      const title = page.title || extractTitle(content) || page.slug;
      const mdx = processContent(content, title, page.description, manifest);

      fs.writeFileSync(path.join(sectionPath, `${page.slug}.mdx`), mdx);
      pageSlugs.push(page.slug);
      console.log(`  Created: ${section.id}/${page.slug}.mdx`);
    }

    // Create section meta.json
    fs.writeFileSync(
      path.join(sectionPath, "meta.json"),
      createMetaJson(section.title, pageSlugs)
    );
    console.log(`  Created: ${section.id}/meta.json`);

    sectionIds.push(section.id);
  }

  // Create root meta.json
  fs.writeFileSync(
    path.join(targetPath, "meta.json"),
    createMetaJson("Documentation", sectionIds)
  );
  console.log(`  Created: meta.json`);

  console.log("");
  console.log("Done! Run `pnpm build` to verify.");
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
  console.log("");
  console.log("The subflint must contain a docs-manifest.json file.");
  console.log("");
  console.log("Example:");
  console.log('  pnpm port --source "/path/to/(Flint) App Docs"');
  process.exit(1);
}

portFromManifest(sourcePath);
