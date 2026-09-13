# NUU Guide

One documentation site for every NUU Cognition product, served at
`guide.nuucognition.com`. Each product is a folder under
`sites/guide/content/docs/<slug>` and becomes a tab in the sidebar.

## Structure

```
docs-monorepo/
├── packages/
│   ├── theme/                  # @nuucognition/docs-theme — shared layout, search, metadata
│   └── nuu-docs-cli/           # @nuucognition/nuu-docs-cli — the nuu-docs CLI and the port engine
│       └── src/port.ts         # The single port engine (Flint markdown → Fumadocs MDX)
├── scripts/
│   └── port-from-flint.ts      # Thin wrapper: pnpm port --source <flint>
├── sites/
│   └── guide/                  # @nuucognition/guide — the NUU Guide site (port 30060)
│       ├── app/                # Next.js app: layout, [[...slug]] page, api/search
│       ├── content/docs/       # index.mdx, meta.json, one folder per product
│       ├── public/             # logo.png, logo-with-bg.png
│       ├── mdx-components.tsx  # defaultMdxComponents + Cards + Card
│       ├── site.config.tsx     # SiteConfig: name, description, logo, github, links
│       └── vercel.json         # Vercel build settings (deployments disabled)
├── AGENTS.md
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

## Commands

```bash
pnpm install                                     # Install every workspace package
pnpm dev                                         # Start the guide dev server on http://localhost:30060
pnpm build                                       # Build every package (theme, CLI, guide)
pnpm build --filter=@nuucognition/guide          # Build only the guide site
pnpm --filter @nuucognition/guide type-check     # Type-check the guide site
pnpm --filter @nuucognition/nuu-docs-cli build   # Rebuild the nuu-docs CLI into dist/
pnpm port --source <flint-path>                  # Port every doc set in a Flint into sites/guide
pnpm nuu-docs <command>                          # Run the built CLI from the repo root
```

## Content layout

```
sites/guide/content/docs/
├── index.mdx                 # NUU Guide landing page (product cards)
├── meta.json                 # { "title": "NUU Guide", "pages": ["index", "docs", "surf", ...] }
├── flint/                    # One folder per product slug
│   ├── index.mdx             # Product landing page
│   ├── meta.json             # { "title": "NUU Flint", "root": true, "pages": ["index", "guide", ...] }
│   └── guide/                # One folder per section
│       ├── meta.json
│       └── quick-start.mdx
├── flint-server/
├── shards/
├── orbh/
└── vessel/
```

`"root": true` in a product `meta.json` makes Fumadocs show that product as a
sidebar tab. The root `meta.json` lists every product in display order. Entries
without a folder are ignored by the build.

Product folders are **generated**. Do not edit them by hand. Edit the source
pages in the Flint and push again. The only hand-written content is
`index.mdx`, the root `meta.json`, and `vessel/` (Vessel has no Flint source).

## Writing docs in a Flint

Docs live in the product's Flint under `Mesh/Sections/(NUU Docs) <Name>/`.
The folder holds one config file and the content pages next to it:

```
Mesh/Sections/(NUU Docs) Flint/
├── (NUU Docs) Flint.md          # Config (YAML block below)
├── Guide - Quick Start.md       # Tutorial or how-to
├── Module - Mesh.md             # System component
├── Reference - CLI Commands.md  # Machinery description
└── Concept - Models.md          # Design and architecture
```

The config file contains one YAML code block:

```yaml
site: guide                          # Target site under sites/ (default: guide)
slug: flint                          # Product folder under content/docs/ → tab at /flint
title: NUU Flint                     # Product title (tab name)
basePath: /                          # URL prefix in front of every link
index: "[[Guide - Introduction]]"    # Landing page for the product
sections:
  - id: guide                        # URL segment → /flint/guide/<page>
    title: Guide                     # Sidebar section title
    pages:
      - "[[Guide - Quick Start]]"    # Wiki links to pages in the Mesh
      - "[[Guide - Core Concepts]]"
  - id: reference
    title: Reference
    pages:
      - "[[Reference - CLI Commands]]"
```

Conventions applied by the port engine:

| Feature | Behavior |
|---------|----------|
| Title | Taken from the first `# Heading` of the page |
| Slug | Generated from the filename. Prefixes `Guide -`, `Module -`, `Reference -`, `Concept -` are removed |
| Wiki links | `[[Page]]` becomes `[Page](/<slug>/<section>/<page>)` |
| Frontmatter | Replaced with Fumadocs frontmatter (`title`, `description`) |
| First H1 | Removed. Fumadocs renders the title from frontmatter |
| Code fences | Unknown languages (`flint`, `mesh`, `gitignore`) become `text` |

## Pushing with nuu-docs

`nuu-docs` runs from inside a Flint and writes into this repo.

```bash
# One-time: tell nuu-docs where this repo is
nuu-docs setup /path/to/docs-monorepo

# From inside a Flint
nuu-docs list                         # Show every doc set with its site and slug
nuu-docs push Flint                   # Push "(NUU Docs) Flint.md" → sites/guide/content/docs/flint
nuu-docs push Flint guide             # Same, with the site given explicitly
nuu-docs push --all                   # Push every doc set found in the Flint
nuu-docs create-site <name>           # Scaffold a new site under sites/ (rarely needed now)
```

`pnpm port --source <flint-path>` does the same as `push --all` from the repo
root.

What a push does when the config has `slug`:

1. Deletes only `sites/<site>/content/docs/<slug>/`.
2. Writes `<slug>/index.mdx`, `<slug>/meta.json` (with `"root": true`), and one
   folder per section.
3. Appends the slug to `pages` in the root `content/docs/meta.json` if it is
   missing. Existing order is kept.

Without `slug` the engine keeps the old whole-site behaviour and replaces the
whole `content/docs` folder of the target site.

## How a slug maps to a product tab

| Config | Result |
|--------|--------|
| `slug: flint` | Folder `content/docs/flint/`, tab "NUU Flint", URL `/flint` |
| `slug: flint-server` | Folder `content/docs/flint-server/`, URL `/flint-server` |
| `sections[].id: guide` | Folder `content/docs/flint/guide/`, URL `/flint/guide/<page>` |

Current slugs: `docs`, `surf`, `operations`, `orgs`, `profiles`, `citations`,
`experience`, `onyx`, `ncm`, `mesh`, `flint`, `flint-server`, `shards`, `orbh`,
`vessel`.

## Domain and deployment

The site is served at the domain root: `https://guide.nuucognition.com`. There
is no `basePath`. `sites/guide/vercel.json` builds with
`pnpm build --filter=@nuucognition/guide` from the repo root. Git-triggered
deployments are disabled.

## Theme package

`@nuucognition/docs-theme` provides `DocsRootLayout`, `DocsContentLayout`,
`DocsPageContent`, `createMetadata`, `createSearchHandler`, `SiteConfig`,
`Logo`, and `Callout`. The site passes `basePath: ""` so the theme builds
`/api/search` and the logo is `/logo.png`.

## Tech stack

- [Fumadocs 15](https://fumadocs.vercel.app/) on [Next.js 15](https://nextjs.org/) and React 19
- [Turborepo](https://turbo.build/) and [pnpm](https://pnpm.io/) workspaces
- [Tailwind CSS 4](https://tailwindcss.com/)
