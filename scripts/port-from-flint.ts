#!/usr/bin/env tsx
/**
 * Port content from Flint subflint to Fumadocs site
 *
 * Usage:
 *   pnpm port --source ~/path/to/subflint --target sites/flint
 *
 * Transformations:
 *   - Frontmatter: Flint tags → Fumadocs metadata
 *   - Links: [[Page Name]] → [Page Name](/docs/page-name)
 *   - Files: "Guide - Name.md" → "name.mdx"
 */

console.log("Port script placeholder - will be implemented in Porting Script task");
console.log("Args:", process.argv.slice(2));
