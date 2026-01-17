#!/usr/bin/env tsx
/**
 * Port markdown files from a Flint to Fumadocs format
 *
 * Reads configuration from Mesh/(System) NUU Documentation.md
 * Auto-discovers titles from document headings and generates slugs from filenames.
 *
 * Usage: pnpm port --source <flint-path>
 */

import * as fs from "fs";
import * as path from "path";
import * as yaml from "yaml";

// ============================================================================
// Types
// ============================================================================

interface SectionConfig {
  id: string;
  title: string;
  pages: string[]; // Wiki links like "[[Guide - Quick Start]]"
}

interface DocsConfig {
  site: string;
  title: string;
  basePath?: string;
  index: string; // Wiki link like "[[Guide - Introduction]]"
  sections: SectionConfig[];
}

interface ResolvedPage {
  sourcePath: string;
  fileName: string;
  title: string;
  slug: string;
}

// ============================================================================
// Parsing
// ============================================================================

function parseDocsConfig(configPath: string): DocsConfig {
  const content = fs.readFileSync(configPath, "utf-8");

  // Extract first YAML code block
  const yamlMatch = content.match(/```ya?ml\n([\s\S]*?)```/);
  if (!yamlMatch) {
    throw new Error("No YAML code block found in (System) NUU Documentation.md");
  }

  return yaml.parse(yamlMatch[1]);
}

function resolveWikiLink(link: string): string {
  // Extract filename from [[link]] or [[link|display]]
  const match = link.match(/\[\[([^\]|]+)/);
  if (!match) {
    throw new Error(`Invalid wiki link: ${link}`);
  }
  return match[1].trim();
}

function extractTitle(filePath: string): string {
  const content = fs.readFileSync(filePath, "utf-8");

  // Find first # heading
  const headingMatch = content.match(/^#\s+(.+)$/m);
  if (headingMatch) {
    return headingMatch[1].trim();
  }

  // Fallback to filename
  return path.basename(filePath, ".md");
}

function generateSlug(fileName: string): string {
  return fileName
    .replace(/\.md$/, "")
    .replace(/^(Guide|Module|Reference)\s*-\s*/i, "") // Remove prefixes
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function resolvePage(meshPath: string, wikiLink: string): ResolvedPage {
  const fileName = resolveWikiLink(wikiLink);
  const sourcePath = path.join(meshPath, `${fileName}.md`);

  if (!fs.existsSync(sourcePath)) {
    throw new Error(`File not found: ${sourcePath}`);
  }

  return {
    sourcePath,
    fileName,
    title: extractTitle(sourcePath),
    slug: generateSlug(fileName),
  };
}

// ============================================================================
// Content Processing
// ============================================================================

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

function convertWikiLinks(
  content: string,
  config: DocsConfig,
  linkMap: Map<string, string>
): string {
  const basePath = config.basePath ?? "/";
  const baseUrl = basePath === "/" ? "" : basePath;

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
    return `[${display}](${baseUrl}/${slug})`;
  });
}

function processContent(
  content: string,
  title: string,
  config: DocsConfig,
  linkMap: Map<string, string>,
  description?: string
): string {
  // Remove existing frontmatter
  let processed = content.replace(/^---[\s\S]*?---\n*/, "");

  // Remove the first H1 title (fumadocs displays title from frontmatter)
  processed = processed.replace(/^#\s+.+\n+/, "");

  // Convert wiki links
  processed = convertWikiLinks(processed, config, linkMap);

  // Normalize code block languages
  processed = normalizeCodeBlocks(processed);

  // Build frontmatter
  let frontmatter = `---\ntitle: "${title.replace(/"/g, '\\"')}"`;
  if (description) {
    frontmatter += `\ndescription: "${description.replace(/"/g, '\\"')}"`;
  }
  frontmatter += `\n---\n\n`;

  return frontmatter + processed.trim() + "\n";
}

function createMetaJson(title: string, pages: string[]): string {
  return JSON.stringify({ title, pages }, null, 2) + "\n";
}

// ============================================================================
// Main Porting Logic
// ============================================================================

function portFromFlint(sourcePath: string): void {
  const meshPath = path.join(sourcePath, "Mesh");
  const configPath = path.join(meshPath, "(System) NUU Documentation.md");

  if (!fs.existsSync(meshPath)) {
    console.error(`Error: Mesh folder not found at ${meshPath}`);
    process.exit(1);
  }

  if (!fs.existsSync(configPath)) {
    console.error(`Error: (System) NUU Documentation.md not found at ${configPath}`);
    process.exit(1);
  }

  const config = parseDocsConfig(configPath);

  console.log(`Porting: ${config.title}`);
  console.log(`Site: ${config.site}`);
  console.log(`Base Path: ${config.basePath ?? "/"}`);

  const targetPath = path.join(
    process.cwd(),
    "sites",
    config.site,
    "content",
    "docs"
  );

  // Clean target directory
  if (fs.existsSync(targetPath)) {
    fs.rmSync(targetPath, { recursive: true });
  }
  fs.mkdirSync(targetPath, { recursive: true });

  console.log(`Target: ${targetPath}\n`);

  // Build link map for wiki link resolution
  const basePath = config.basePath ?? "/";
  const baseUrl = basePath === "/" ? "" : basePath;
  const linkMap = new Map<string, string>();

  // Resolve index
  const indexPage = resolvePage(meshPath, config.index);
  linkMap.set(indexPage.fileName, baseUrl || "/");

  // Resolve all section pages first to build link map
  const resolvedSections: { config: SectionConfig; pages: ResolvedPage[] }[] = [];

  for (const section of config.sections) {
    const pages: ResolvedPage[] = [];
    for (const pageLink of section.pages) {
      try {
        const page = resolvePage(meshPath, pageLink);
        linkMap.set(page.fileName, `${baseUrl}/${section.id}/${page.slug}`);
        pages.push(page);
      } catch (err) {
        console.warn(`  Warning: ${(err as Error).message}`);
      }
    }
    resolvedSections.push({ config: section, pages });
  }

  // Process index page
  const indexContent = fs.readFileSync(indexPage.sourcePath, "utf-8");
  const indexMdx = processContent(indexContent, indexPage.title, config, linkMap);
  fs.writeFileSync(path.join(targetPath, "index.mdx"), indexMdx);
  console.log(`  index.mdx <- ${indexPage.fileName}.md (${indexPage.title})`);

  // Track sections for root meta.json
  const sectionIds: string[] = ["index"];

  // Process sections
  for (const { config: section, pages } of resolvedSections) {
    const sectionPath = path.join(targetPath, section.id);
    fs.mkdirSync(sectionPath, { recursive: true });

    const pageSlugs: string[] = [];

    for (const page of pages) {
      const content = fs.readFileSync(page.sourcePath, "utf-8");
      const mdx = processContent(content, page.title, config, linkMap);

      fs.writeFileSync(path.join(sectionPath, `${page.slug}.mdx`), mdx);
      pageSlugs.push(page.slug);
      console.log(`  ${section.id}/${page.slug}.mdx <- ${page.fileName}.md (${page.title})`);
    }

    // Create section meta.json
    fs.writeFileSync(
      path.join(sectionPath, "meta.json"),
      createMetaJson(section.title, pageSlugs)
    );
    sectionIds.push(section.id);
  }

  // Create root meta.json
  fs.writeFileSync(
    path.join(targetPath, "meta.json"),
    createMetaJson(config.title, sectionIds)
  );

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
  console.log("Usage: pnpm port --source <flint-path>");
  console.log("");
  console.log("The Flint must contain:");
  console.log("  - Mesh/(System) NUU Documentation.md (config with YAML code block)");
  console.log("  - Mesh/ folder with markdown source files");
  process.exit(1);
}

portFromFlint(sourcePath);
