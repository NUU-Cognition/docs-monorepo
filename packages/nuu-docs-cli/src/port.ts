/**
 * Port engine — takes markdown from a Flint and converts it to Fumadocs format.
 *
 * This is the single implementation. The CLI (`nuu-docs push`) and the root
 * script (`pnpm port --source <flint>`) both call into this module.
 *
 * Config contract (first YAML block in a `(NUU Docs) <Name>.md` file):
 *
 *   site: guide            # target site folder under sites/ (default: guide)
 *   slug: flint            # product folder under content/docs/ (optional)
 *   title: NUU Flint       # product / site title
 *   basePath: /            # URL prefix in front of every generated link
 *   index: "[[Page]]"      # wiki link to the landing page
 *   sections:              # one folder per section
 *     - id: guide
 *       title: Guide
 *       pages: ["[[Guide - Quick Start]]"]
 *
 * With `slug` the engine writes sites/<site>/content/docs/<slug>/ and marks
 * the product folder as a root tab. Without `slug` it writes the whole
 * content/docs folder of the site (legacy whole-site mode).
 */

import * as fs from "fs";
import * as path from "path";
import * as yaml from "yaml";

// ============================================================================
// Types
// ============================================================================

export interface SectionConfig {
  id: string;
  title: string;
  pages: string[]; // Wiki links like "[[Guide - Quick Start]]"
}

export interface DocsConfig {
  /** Target site folder under sites/. Defaults to "guide". */
  site?: string;
  /** Product folder under content/docs/. Optional (legacy whole-site mode). */
  slug?: string;
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

export interface PortResult {
  configPath: string;
  site: string;
  slug?: string;
  title: string;
  targetPath: string;
}

export const DEFAULT_SITE = "guide";

// ============================================================================
// Discovery
// ============================================================================

export function discoverDocsConfigs(meshPath: string): string[] {
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

export function parseDocsConfig(configPath: string): DocsConfig {
  const content = fs.readFileSync(configPath, "utf-8");

  // Extract first YAML code block
  const yamlMatch = content.match(/```ya?ml\n([\s\S]*?)```/);
  if (!yamlMatch) {
    throw new Error(`No YAML code block found in ${path.basename(configPath)}`);
  }

  const parsed = yaml.parse(yamlMatch[1]) as DocsConfig | null;
  if (!parsed || typeof parsed !== "object") {
    throw new Error(`Empty YAML config in ${path.basename(configPath)}`);
  }
  if (!parsed.title) {
    throw new Error(`Missing "title" in ${path.basename(configPath)}`);
  }
  if (!parsed.index) {
    throw new Error(`Missing "index" in ${path.basename(configPath)}`);
  }
  if (!Array.isArray(parsed.sections)) {
    parsed.sections = [];
  }
  if (parsed.slug !== undefined) {
    const slug = String(parsed.slug);
    if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
      throw new Error(
        `Invalid "slug" in ${path.basename(configPath)}: "${slug}" (use lowercase letters, digits and dashes)`
      );
    }
    parsed.slug = slug;
  }
  return parsed;
}

/** The site a config targets: explicit `site`, else the default site. */
export function resolveSite(config: DocsConfig): string {
  return config.site ?? DEFAULT_SITE;
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
    .replace(/^(Guide|Module|Reference|Concept)\s*-\s*/i, "") // Remove prefixes
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Find a markdown file by name under meshPath, searching recursively.
 * Returns the first match.
 */
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

function resolvePage(
  meshPath: string,
  wikiLink: string,
  configDir?: string
): ResolvedPage {
  const fileName = resolveWikiLink(wikiLink);

  // Try the config's own directory first (co-located pages), then the mesh
  // root, then a recursive search.
  let sourcePath: string | null = null;
  if (configDir) {
    const colocatedPath = path.join(configDir, `${fileName}.md`);
    if (fs.existsSync(colocatedPath)) sourcePath = colocatedPath;
  }
  if (!sourcePath) {
    const directPath = path.join(meshPath, `${fileName}.md`);
    if (fs.existsSync(directPath)) sourcePath = directPath;
  }
  if (!sourcePath) {
    sourcePath = findFile(meshPath, fileName);
  }

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

/**
 * URL prefix for every generated link.
 *
 * basePath "/" or "" → ""            (whole-site mode)
 * basePath "/docs"   → "/docs"
 * slug "flint"       → "/flint"      (product mode)
 * both               → "/docs/flint"
 */
export function buildUrlPrefix(config: DocsConfig): string {
  const basePath = (config.basePath ?? "/").trim();
  let prefix = basePath === "/" ? "" : basePath.replace(/\/+$/, "");
  if (prefix && !prefix.startsWith("/")) prefix = `/${prefix}`;
  if (config.slug) prefix = `${prefix}/${config.slug}`;
  return prefix;
}

function convertWikiLinks(
  content: string,
  urlPrefix: string,
  linkMap: Map<string, string>
): string {
  return content.replace(/\[\[([^\]]+)\]\]/g, (_, linkText) => {
    const parts = linkText.split("|");
    const target = parts[0].trim();
    const display = parts[1]?.trim() || target;

    // Try to find in our link map
    const url = linkMap.get(target);
    if (url) {
      return `[${display}](${url})`;
    }

    // Fallback: convert to slug, rooted at the product / site prefix
    const slug = target
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    return `[${display}](${urlPrefix}/${slug})`;
  });
}

function processContent(
  content: string,
  title: string,
  urlPrefix: string,
  linkMap: Map<string, string>,
  description?: string
): string {
  // Remove existing frontmatter
  let processed = content.replace(/^---[\s\S]*?---\n*/, "");

  // Remove the first H1 title (fumadocs displays title from frontmatter)
  processed = processed.replace(/^#\s+.+\n+/, "");

  // Convert wiki links
  processed = convertWikiLinks(processed, urlPrefix, linkMap);

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

function createMetaJson(
  title: string,
  pages: string[],
  root?: boolean
): string {
  const meta: Record<string, unknown> = { title };
  if (root) meta.root = true;
  meta.pages = pages;
  return JSON.stringify(meta, null, 2) + "\n";
}

/**
 * Add `slug` to the `pages` list of the site's root meta.json.
 * Keeps the existing order. Creates the file with ["index", slug] if absent.
 */
export function registerSlugInRootMeta(
  contentRoot: string,
  slug: string,
  siteTitle: string
): void {
  const metaPath = path.join(contentRoot, "meta.json");
  let meta: { title?: string; pages?: unknown[]; [k: string]: unknown } = {};

  if (fs.existsSync(metaPath)) {
    try {
      meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
    } catch (err) {
      throw new Error(
        `Cannot parse ${metaPath}: ${(err as Error).message}`
      );
    }
  } else {
    meta = { title: siteTitle, pages: ["index"] };
  }

  if (!Array.isArray(meta.pages)) meta.pages = [];
  if (!meta.title) meta.title = siteTitle;
  if (!meta.pages.includes(slug)) meta.pages.push(slug);

  fs.mkdirSync(contentRoot, { recursive: true });
  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2) + "\n");
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
): { name: string; path: string; site: string; slug?: string }[] {
  const meshPath = path.join(flintPath, "Mesh");
  if (!fs.existsSync(meshPath)) return [];

  const configs = discoverDocsConfigs(meshPath);
  return configs.map((configPath) => {
    const basename = path.basename(configPath, ".md");
    const name = basename.replace(/^\(NUU Docs\)\s*/, "");
    const config = parseDocsConfig(configPath);
    return {
      name,
      path: configPath,
      site: resolveSite(config),
      slug: config.slug,
    };
  });
}

export function listSites(docsRepoPath: string): string[] {
  const sitesDir = path.join(docsRepoPath, "sites");
  if (!fs.existsSync(sitesDir)) return [];
  return fs
    .readdirSync(sitesDir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);
}

/**
 * Port a single doc config to a target site in the docs repo.
 *
 * - With `slug`: writes sites/<site>/content/docs/<slug>/ (deletes only that
 *   folder first) and registers the slug in the root meta.json.
 * - Without `slug`: writes the whole sites/<site>/content/docs/ folder
 *   (deletes it first). Legacy whole-site mode.
 */
export function portDocConfig(options: {
  configPath: string;
  flintPath: string;
  docsRepoPath: string;
  targetSite?: string;
}): PortResult {
  const { configPath, flintPath, docsRepoPath, targetSite } = options;
  const meshPath = path.join(flintPath, "Mesh");
  const configDir = path.dirname(configPath);

  const config = parseDocsConfig(configPath);
  const site = targetSite ?? resolveSite(config);
  const slug = config.slug;

  console.log(`\nPorting: ${config.title}`);
  console.log(`  Source: ${path.basename(configPath)}`);
  console.log(`  Site: ${site}`);
  if (slug) console.log(`  Slug: ${slug}`);
  console.log(`  Base Path: ${config.basePath ?? "/"}`);

  const sitePath = path.join(docsRepoPath, "sites", site);
  if (!fs.existsSync(sitePath)) {
    throw new Error(
      `Site directory not found: ${sitePath}\nAvailable sites: ${listSites(docsRepoPath).join(", ")}`
    );
  }

  const contentRoot = path.join(sitePath, "content", "docs");
  const targetPath = slug ? path.join(contentRoot, slug) : contentRoot;

  // Clean the target directory. With a slug this is only the product folder;
  // the site content root is never deleted in product mode.
  if (fs.existsSync(targetPath)) {
    fs.rmSync(targetPath, { recursive: true });
  }
  fs.mkdirSync(targetPath, { recursive: true });

  console.log(`  Target: ${targetPath}\n`);

  // Build link map for wiki link resolution
  const urlPrefix = buildUrlPrefix(config);
  const linkMap = new Map<string, string>();

  // Resolve index
  const indexPage = resolvePage(meshPath, config.index, configDir);
  linkMap.set(indexPage.fileName, urlPrefix || "/");

  // Resolve all section pages first to build link map
  const resolvedSections: { config: SectionConfig; pages: ResolvedPage[] }[] =
    [];

  for (const section of config.sections) {
    const pages: ResolvedPage[] = [];
    for (const pageLink of section.pages ?? []) {
      try {
        const page = resolvePage(meshPath, pageLink, configDir);
        linkMap.set(page.fileName, `${urlPrefix}/${section.id}/${page.slug}`);
        pages.push(page);
      } catch (err) {
        console.warn(`  Warning: ${(err as Error).message}`);
      }
    }
    resolvedSections.push({ config: section, pages });
  }

  // Process index page
  const indexContent = fs.readFileSync(indexPage.sourcePath, "utf-8");
  const indexMdx = processContent(
    indexContent,
    indexPage.title,
    urlPrefix,
    linkMap
  );
  fs.writeFileSync(path.join(targetPath, "index.mdx"), indexMdx);
  console.log(`  index.mdx <- ${indexPage.fileName}.md (${indexPage.title})`);

  // Track sections for the product / root meta.json
  const sectionIds: string[] = ["index"];

  // Process sections
  for (const { config: section, pages } of resolvedSections) {
    const sectionPath = path.join(targetPath, section.id);
    fs.mkdirSync(sectionPath, { recursive: true });

    const pageSlugs: string[] = [];

    for (const page of pages) {
      const content = fs.readFileSync(page.sourcePath, "utf-8");
      const mdx = processContent(content, page.title, urlPrefix, linkMap);

      fs.writeFileSync(path.join(sectionPath, `${page.slug}.mdx`), mdx);
      pageSlugs.push(page.slug);
      console.log(
        `  ${section.id}/${page.slug}.mdx <- ${page.fileName}.md (${page.title})`
      );
    }

    // Create section meta.json
    fs.writeFileSync(
      path.join(sectionPath, "meta.json"),
      createMetaJson(section.title, pageSlugs)
    );
    sectionIds.push(section.id);
  }

  // Product meta.json (root tab) or whole-site root meta.json
  fs.writeFileSync(
    path.join(targetPath, "meta.json"),
    createMetaJson(config.title, sectionIds, Boolean(slug))
  );

  if (slug) {
    registerSlugInRootMeta(contentRoot, slug, siteTitleFor(site));
  }

  const rel = path.relative(docsRepoPath, targetPath);
  console.log(`\n  Done: ${config.title} -> ${rel}/`);

  return { configPath, site, slug, title: config.title, targetPath };
}

function siteTitleFor(site: string): string {
  if (site === DEFAULT_SITE) return "NUU Guide";
  return `NUU ${site.charAt(0).toUpperCase()}${site.slice(1)}`;
}

/**
 * Port every doc config found in a Flint.
 * Failures are reported and do not stop the other configs.
 */
export function portAllDocConfigs(options: {
  flintPath: string;
  docsRepoPath: string;
  targetSite?: string;
}): { ok: PortResult[]; failed: { configPath: string; error: string }[] } {
  const { flintPath, docsRepoPath, targetSite } = options;
  const meshPath = path.join(flintPath, "Mesh");

  if (!fs.existsSync(meshPath)) {
    throw new Error(`Mesh folder not found at ${meshPath}`);
  }

  const configs = discoverDocsConfigs(meshPath);
  if (configs.length === 0) {
    throw new Error(
      `No (NUU Docs) *.md config files found under ${meshPath}\n` +
        "Each docs config should be named like: (NUU Docs) Flint.md"
    );
  }

  console.log(`Found ${configs.length} docs config(s):`);
  for (const c of configs) {
    console.log(`  - ${path.relative(meshPath, c)}`);
  }

  const ok: PortResult[] = [];
  const failed: { configPath: string; error: string }[] = [];

  for (const configPath of configs) {
    try {
      ok.push(portDocConfig({ configPath, flintPath, docsRepoPath, targetSite }));
    } catch (err) {
      const error = (err as Error).message;
      failed.push({ configPath, error });
      console.error(`\n  Failed: ${path.basename(configPath)}\n  ${error}`);
    }
  }

  console.log(
    `\nPorted ${ok.length} doc set(s)` +
      (failed.length ? `, ${failed.length} failed.` : ".")
  );

  return { ok, failed };
}
