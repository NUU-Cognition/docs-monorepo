/**
 * Porting logic — takes markdown from a Flint and converts it to Fumadocs format.
 * Extracted from scripts/port-from-flint.ts for reuse by the CLI.
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
  pages: string[];
}

interface DocsConfig {
  site: string;
  title: string;
  basePath?: string;
  index: string;
  sections: SectionConfig[];
}

interface ResolvedPage {
  sourcePath: string;
  fileName: string;
  title: string;
  slug: string;
}

// ============================================================================
// Discovery
// ============================================================================

function discoverDocsConfigs(meshPath: string): string[] {
  const configs: string[] = [];

  function walk(dir: string): void {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (
        entry.isFile() &&
        entry.name.startsWith("(NUU Docs) ") &&
        entry.name.endsWith(".md")
      ) {
        configs.push(fullPath);
      }
    }
  }

  walk(meshPath);
  return configs.sort();
}

// ============================================================================
// Parsing
// ============================================================================

function parseDocsConfig(configPath: string): DocsConfig {
  const content = fs.readFileSync(configPath, "utf-8");

  const yamlMatch = content.match(/```ya?ml\n([\s\S]*?)```/);
  if (!yamlMatch) {
    throw new Error(`No YAML code block found in ${path.basename(configPath)}`);
  }

  return yaml.parse(yamlMatch[1]);
}

function resolveWikiLink(link: string): string {
  const match = link.match(/\[\[([^\]|]+)/);
  if (!match) {
    throw new Error(`Invalid wiki link: ${link}`);
  }
  return match[1].trim();
}

function extractTitle(filePath: string): string {
  const content = fs.readFileSync(filePath, "utf-8");

  const headingMatch = content.match(/^#\s+(.+)$/m);
  if (headingMatch) {
    return headingMatch[1].trim();
  }

  return path.basename(filePath, ".md");
}

function generateSlug(fileName: string): string {
  return fileName
    .replace(/\.md$/, "")
    .replace(/^(Guide|Module|Reference|Concept)\s*-\s*/i, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function findFile(meshPath: string, fileName: string): string | null {
  const target = `${fileName}.md`;

  function walk(dir: string): string | null {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isFile() && entry.name === target) {
        return path.join(dir, entry.name);
      }
      if (entry.isDirectory()) {
        const found = walk(path.join(dir, entry.name));
        if (found) return found;
      }
    }
    return null;
  }

  return walk(meshPath);
}

function resolvePage(meshPath: string, wikiLink: string): ResolvedPage {
  const fileName = resolveWikiLink(wikiLink);

  const directPath = path.join(meshPath, `${fileName}.md`);
  const sourcePath = fs.existsSync(directPath)
    ? directPath
    : findFile(meshPath, fileName);

  if (!sourcePath) {
    throw new Error(
      `File not found: ${fileName}.md (searched under ${meshPath})`
    );
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

    const url = linkMap.get(target);
    if (url) {
      return `[${display}](${url})`;
    }

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
  let processed = content.replace(/^---[\s\S]*?---\n*/, "");
  processed = processed.replace(/^#\s+.+\n+/, "");
  processed = convertWikiLinks(processed, config, linkMap);
  processed = normalizeCodeBlocks(processed);

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
// Public API
// ============================================================================

/**
 * Find a specific doc config by name in a Flint's Mesh.
 * Matches against `(NUU Docs) <name>.md`.
 */
export function findDocConfig(
  flintPath: string,
  name: string
): string | null {
  const meshPath = path.join(flintPath, "Mesh");
  if (!fs.existsSync(meshPath)) return null;

  const configs = discoverDocsConfigs(meshPath);
  const target = `(NUU Docs) ${name}.md`;

  return configs.find((c) => path.basename(c) === target) ?? null;
}

/**
 * List all doc configs in a Flint.
 */
export function listDocConfigs(
  flintPath: string
): { name: string; path: string; site: string }[] {
  const meshPath = path.join(flintPath, "Mesh");
  if (!fs.existsSync(meshPath)) return [];

  const configs = discoverDocsConfigs(meshPath);
  return configs.map((configPath) => {
    const basename = path.basename(configPath, ".md");
    const name = basename.replace(/^\(NUU Docs\)\s*/, "");
    const config = parseDocsConfig(configPath);
    return { name, path: configPath, site: config.site };
  });
}

/**
 * Port a single doc config to a target site in the docs repo.
 */
export function portDocConfig(options: {
  configPath: string;
  flintPath: string;
  docsRepoPath: string;
  targetSite?: string;
}): void {
  const { configPath, flintPath, docsRepoPath, targetSite } = options;
  const meshPath = path.join(flintPath, "Mesh");

  const config = parseDocsConfig(configPath);
  const site = targetSite ?? config.site;

  console.log(`\nPorting: ${config.title}`);
  console.log(`  Source: ${path.basename(configPath)}`);
  console.log(`  Site: ${site}`);

  const sitePath = path.join(docsRepoPath, "sites", site);
  if (!fs.existsSync(sitePath)) {
    throw new Error(
      `Site directory not found: ${sitePath}\nAvailable sites: ${listSites(docsRepoPath).join(", ")}`
    );
  }

  const targetPath = path.join(sitePath, "content", "docs");

  if (fs.existsSync(targetPath)) {
    fs.rmSync(targetPath, { recursive: true });
  }
  fs.mkdirSync(targetPath, { recursive: true });

  console.log(`  Target: ${targetPath}\n`);

  // Build link map
  const basePath = config.basePath ?? "/";
  const baseUrl = basePath === "/" ? "" : basePath;
  const linkMap = new Map<string, string>();

  const indexPage = resolvePage(meshPath, config.index);
  linkMap.set(indexPage.fileName, baseUrl || "/");

  const resolvedSections: { config: SectionConfig; pages: ResolvedPage[] }[] =
    [];

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

  // Process index
  const indexContent = fs.readFileSync(indexPage.sourcePath, "utf-8");
  const indexMdx = processContent(indexContent, indexPage.title, config, linkMap);
  fs.writeFileSync(path.join(targetPath, "index.mdx"), indexMdx);
  console.log(`  index.mdx <- ${indexPage.fileName}.md`);

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
      console.log(`  ${section.id}/${page.slug}.mdx <- ${page.fileName}.md`);
    }

    fs.writeFileSync(
      path.join(sectionPath, "meta.json"),
      createMetaJson(section.title, pageSlugs)
    );
    sectionIds.push(section.id);
  }

  // Root meta.json
  fs.writeFileSync(
    path.join(targetPath, "meta.json"),
    createMetaJson(config.title, sectionIds)
  );

  console.log(`\n  Done: ${config.title} -> sites/${site}/`);
}

function listSites(docsRepoPath: string): string[] {
  const sitesDir = path.join(docsRepoPath, "sites");
  if (!fs.existsSync(sitesDir)) return [];
  return fs
    .readdirSync(sitesDir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);
}
