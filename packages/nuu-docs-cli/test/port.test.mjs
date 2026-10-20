// Tests of the wiki links of the port engine: a link to a heading of another
// page, a link to a page of another doc set, and a link to no published page.
// Run with: pnpm --filter @nuucognition/nuu-docs-cli test
import { after, test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { portDocConfig } from "../src/port.ts";

const roots = [];
after(() => {
  for (const root of roots) fs.rmSync(root, { recursive: true, force: true });
});

function write(file, text) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
}

function docsConfig(lines) {
  return ["# Config", "", "```yaml", ...lines, "```", ""].join("\n");
}

/**
 * A Flint with three doc sets (Alpha, Beta, Gamma) and a docs repo whose site
 * publishes Alpha and Beta. Gamma is not in the root meta.json.
 */
function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "nuu-docs-port-"));
  roots.push(root);
  const flint = path.join(root, "flint");
  const repo = path.join(root, "repo");
  const mesh = path.join(flint, "Mesh");

  write(
    path.join(mesh, "Alpha", "(NUU Docs) Alpha.md"),
    docsConfig([
      "slug: alpha",
      "title: Alpha",
      'index: "[[Guide - Alpha Home]]"',
      "sections:",
      "  - id: guide",
      "    title: Guide",
      '    pages: ["[[Guide - The Roster]]", "[[Guide - Links]]"]',
    ])
  );
  write(path.join(mesh, "Alpha", "Guide - Alpha Home.md"), "# Alpha Home\n\nWelcome.\n");
  write(
    path.join(mesh, "Alpha", "Guide - The Roster.md"),
    "# The Roster\n\n## The Flint Types\n\nTypes.\n"
  );
  write(
    path.join(mesh, "Alpha", "Guide - Links.md"),
    [
      "# Links",
      "",
      "Heading: [[Guide - The Roster#The Flint Types]].",
      "Alias: [[Guide - The Roster#The Flint Types|the types]].",
      "Same page: [[#Local Part]].",
      "Other set: [[Concept - Sessions and Runs]].",
      "Other set heading: [[Concept - Sessions and Runs#A Run]].",
      "Other set home: [[(NUU Docs) Beta]].",
      "Not published: [[Concept - Hidden]].",
      "Missing: [[Task 1125 Something]].",
      "Code: `[[Guide - The Roster]]`.",
      "",
      "## Local Part",
      "",
    ].join("\n")
  );

  write(
    path.join(mesh, "Beta", "(NUU Docs) Beta.md"),
    docsConfig([
      "slug: beta",
      "title: Beta",
      'index: "[[Concept - Beta Home]]"',
      "sections:",
      "  - id: concepts",
      "    title: Concepts",
      '    pages: ["[[Concept - Sessions and Runs]]"]',
    ])
  );
  write(path.join(mesh, "Beta", "Concept - Beta Home.md"), "# Beta Home\n");
  write(path.join(mesh, "Beta", "Concept - Sessions and Runs.md"), "# Sessions and Runs\n\n## A Run\n");

  write(
    path.join(mesh, "Gamma", "(NUU Docs) Gamma.md"),
    docsConfig([
      "slug: gamma",
      "title: Gamma",
      'index: "[[Concept - Hidden]]"',
      "sections: []",
    ])
  );
  write(path.join(mesh, "Gamma", "Concept - Hidden.md"), "# Hidden\n");

  const contentRoot = path.join(repo, "sites", "guide", "content", "docs");
  write(
    path.join(contentRoot, "meta.json"),
    JSON.stringify({ title: "NUU Guide", pages: ["index", "alpha", "beta"] })
  );

  return { root, flint, repo, mesh, contentRoot };
}

function portAlpha() {
  const f = fixture();
  portDocConfig({
    configPath: path.join(f.mesh, "Alpha", "(NUU Docs) Alpha.md"),
    flintPath: f.flint,
    docsRepoPath: f.repo,
  });
  const links = fs.readFileSync(path.join(f.contentRoot, "alpha", "guide", "links.mdx"), "utf-8");
  return { ...f, links };
}

test("a link to a heading of another page goes to the page and the heading", () => {
  const { links } = portAlpha();
  assert.match(links, /Heading: \[The Roster > The Flint Types\]\(\/alpha\/guide\/the-roster#the-flint-types\)\./);
  assert.match(links, /Alias: \[the types\]\(\/alpha\/guide\/the-roster#the-flint-types\)\./);
  assert.match(links, /Same page: \[Local Part\]\(#local-part\)\./);
});

test("a link to a page of another published doc set goes to its product tab", () => {
  const { links } = portAlpha();
  assert.match(links, /Other set: \[Sessions and Runs\]\(\/beta\/concepts\/sessions-and-runs\)\./);
  assert.match(links, /Other set heading: \[Sessions and Runs > A Run\]\(\/beta\/concepts\/sessions-and-runs#a-run\)\./);
  assert.match(links, /Other set home: \[Beta\]\(\/beta\)\./);
});

test("a link to a page in no published doc set stays text", () => {
  const { links } = portAlpha();
  assert.match(links, /Not published: Hidden\./);
  assert.match(links, /Missing: Task 1125 Something\./);
  assert.doesNotMatch(links, /\/alpha\/concept-hidden|\/gamma|task-1125/);
});

test("a wiki link in inline code stays as written", () => {
  const { links } = portAlpha();
  assert.match(links, /Code: `\[\[Guide - The Roster\]\]`\./);
});

test("the port writes only the product folder and keeps the root meta.json order", () => {
  const { contentRoot } = portAlpha();
  assert.deepEqual(fs.readdirSync(contentRoot).sort(), ["alpha", "meta.json"]);
  const meta = JSON.parse(fs.readFileSync(path.join(contentRoot, "meta.json"), "utf-8"));
  assert.deepEqual(meta.pages, ["index", "alpha", "beta"]);
});

test("a doc set whose index does not resolve deletes nothing", () => {
  const f = fixture();
  const kept = path.join(f.contentRoot, "alpha", "kept.mdx");
  write(kept, "---\ntitle: Kept\n---\n");
  fs.rmSync(path.join(f.mesh, "Alpha", "Guide - Alpha Home.md"));
  assert.throws(() =>
    portDocConfig({
      configPath: path.join(f.mesh, "Alpha", "(NUU Docs) Alpha.md"),
      flintPath: f.flint,
      docsRepoPath: f.repo,
    })
  );
  assert.ok(fs.existsSync(kept));
});
