import { Command } from "commander";
import * as path from "path";
import * as fs from "fs";
import { readConfig, writeConfig, getConfigPath } from "./config.js";
import { findDocConfig, listDocConfigs, portDocConfig } from "./port.js";
import { scaffoldSite, findNextPort } from "./scaffold.js";

const program = new Command();

program
  .name("nuu-docs")
  .description("Push documentation from a Flint workspace to the NUU docs repo")
  .version("0.1.0");

// ============================================================================
// setup
// ============================================================================

program
  .command("setup")
  .description("Configure the path to the NUU docs repo")
  .argument("<path>", "Absolute path to the docs repo")
  .action((docsPath: string) => {
    const resolved = path.resolve(docsPath);

    if (!fs.existsSync(resolved)) {
      console.error(`Error: Path does not exist: ${resolved}`);
      process.exit(1);
    }

    const sitesDir = path.join(resolved, "sites");
    if (!fs.existsSync(sitesDir)) {
      console.error(
        `Error: Not a docs repo — no sites/ directory at ${resolved}`
      );
      process.exit(1);
    }

    writeConfig({ docsRepoPath: resolved });
    console.log(`Docs repo path saved to ${getConfigPath()}`);
    console.log(`  Path: ${resolved}`);

    const sites = fs
      .readdirSync(sitesDir, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name);
    console.log(`  Sites: ${sites.join(", ")}`);
  });

// ============================================================================
// push
// ============================================================================

program
  .command("push")
  .description("Push a doc set from the current Flint to the docs repo")
  .argument("<name>", 'Name of the doc set (matches "(NUU Docs) <name>.md")')
  .argument("<site>", "Target site directory in the docs repo (e.g. flint, vessel)")
  .action((name: string, site: string) => {
    const config = readConfig();
    if (!config) {
      console.error(
        `Error: No docs repo configured. Run 'nuu-docs setup <path>' first.`
      );
      console.error(`  Config location: ${getConfigPath()}`);
      process.exit(1);
    }

    if (!fs.existsSync(config.docsRepoPath)) {
      console.error(
        `Error: Docs repo not found at ${config.docsRepoPath}`
      );
      console.error(`  Run 'nuu-docs setup <path>' to update.`);
      process.exit(1);
    }

    // Detect the current Flint
    const flintPath = process.cwd();
    const meshPath = path.join(flintPath, "Mesh");
    if (!fs.existsSync(meshPath)) {
      console.error(
        `Error: Not inside a Flint — no Mesh/ directory at ${flintPath}`
      );
      process.exit(1);
    }

    // Find the doc config
    const configPath = findDocConfig(flintPath, name);
    if (!configPath) {
      console.error(`Error: Doc set not found: (NUU Docs) ${name}.md`);
      console.error(`\nAvailable doc sets:`);
      const docs = listDocConfigs(flintPath);
      if (docs.length === 0) {
        console.error("  (none)");
      } else {
        for (const doc of docs) {
          console.error(`  - "${doc.name}" (site: ${doc.site})`);
        }
      }
      process.exit(1);
    }

    // Port it
    portDocConfig({
      configPath,
      flintPath,
      docsRepoPath: config.docsRepoPath,
      targetSite: site,
    });
  });

// ============================================================================
// create-site
// ============================================================================

program
  .command("create-site")
  .description("Scaffold a new Fumadocs site in the docs repo")
  .argument("<name>", "Site directory name (e.g. steel, lattice)")
  .option("--display-name <name>", "Display name (default: NUU <Name> Docs)")
  .option("--description <desc>", "Site description", "Documentation")
  .option("--port <port>", "Dev server port (default: auto-detect next available)")
  .option("--base-path <path>", "URL base path", "/docs")
  .option("--github <url>", "GitHub repository URL")
  .action(
    (
      name: string,
      opts: {
        displayName?: string;
        description: string;
        port?: string;
        basePath: string;
        github?: string;
      }
    ) => {
      const config = readConfig();
      if (!config) {
        console.error(
          `Error: No docs repo configured. Run 'nuu-docs setup <path>' first.`
        );
        process.exit(1);
      }

      const port = opts.port
        ? parseInt(opts.port, 10)
        : findNextPort(config.docsRepoPath);

      const displayName =
        opts.displayName ??
        `NUU ${name.charAt(0).toUpperCase() + name.slice(1)} Docs`;

      scaffoldSite(config.docsRepoPath, {
        name,
        displayName,
        description: opts.description,
        port,
        basePath: opts.basePath,
        github: opts.github,
      });
    }
  );

// ============================================================================
// list
// ============================================================================

program
  .command("list")
  .description("List doc sets in the current Flint")
  .action(() => {
    const flintPath = process.cwd();
    const meshPath = path.join(flintPath, "Mesh");
    if (!fs.existsSync(meshPath)) {
      console.error(
        `Error: Not inside a Flint — no Mesh/ directory at ${flintPath}`
      );
      process.exit(1);
    }

    const docs = listDocConfigs(flintPath);
    if (docs.length === 0) {
      console.log("No doc sets found.");
    } else {
      console.log(`Found ${docs.length} doc set(s):\n`);
      for (const doc of docs) {
        console.log(`  ${doc.name}  (site: ${doc.site})`);
      }
    }
  });

program.parse();
