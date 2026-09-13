#!/usr/bin/env tsx
/**
 * Port markdown files from a Flint to Fumadocs format.
 *
 * Thin wrapper around the port engine in packages/nuu-docs-cli/src/port.ts.
 * Discovers all (NUU Docs) *.md config files under Mesh/ and ports each one
 * to its target site (default: sites/guide) and product slug.
 *
 * Usage: pnpm port --source <flint-path> [--site <site>]
 */

import * as path from "path";
import { portAllDocConfigs } from "../packages/nuu-docs-cli/src/port";

const args = process.argv.slice(2);
let sourcePath = "";
let targetSite: string | undefined;

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--source" && args[i + 1]) {
    sourcePath = args[i + 1];
    i++;
  } else if (args[i] === "--site" && args[i + 1]) {
    targetSite = args[i + 1];
    i++;
  }
}

if (!sourcePath) {
  console.log("Usage: pnpm port --source <flint-path> [--site <site>]");
  console.log("");
  console.log("The Flint must contain:");
  console.log(
    "  - One or more (NUU Docs) *.md files under Mesh/ (each with a YAML config block)"
  );
  console.log("  - Mesh/ folder with markdown source files");
  process.exit(1);
}

// The docs repo is the parent of scripts/, regardless of the current cwd.
const docsRepoPath = path.resolve(__dirname, "..");

try {
  const { failed } = portAllDocConfigs({
    flintPath: path.resolve(sourcePath),
    docsRepoPath,
    targetSite,
  });
  if (failed.length > 0) process.exit(1);
} catch (err) {
  console.error(`Error: ${(err as Error).message}`);
  process.exit(1);
}
