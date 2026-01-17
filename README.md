# NUU Documentation

Monorepo for all NUU product documentation sites.

## Structure

```
docs/
├── packages/
│   └── theme/              # Shared @nuucognition/docs-theme
├── sites/
│   └── flint/              # flintdocs.nuucognition.com
├── scripts/
│   └── port-from-flint.ts  # Content porting script
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

## Getting Started

```bash
# Install dependencies
pnpm install

# Start development server (all sites)
pnpm dev

# Build all sites
pnpm build

# Type check
pnpm type-check

# Port content from Flint subflint
pnpm port --source ~/path/to/subflint
```

## Sites

| Site | Domain | Description |
|------|--------|-------------|
| `flint` | `flintdocs.nuucognition.com` | Flint documentation |

## Adding a New Site

### 1. Create Site Folder

```bash
mkdir -p sites/{name}
cd sites/{name}
```

### 2. Initialize Fumadocs

Copy from an existing site or initialize fresh:

```bash
# Copy from flint as template
cp -r ../flint/* .
```

### 3. Create Site Configuration

Create `site.config.tsx`:

```tsx
import type { SiteConfig } from "@nuucognition/docs-theme";

export const siteConfig: SiteConfig = {
  name: "My Docs",
  description: "Documentation for...",
  basePath: "/",
  // logo: <Image src="/logo.png" ... />,
  github: "https://github.com/NUU-Cognition/my-repo",
};
```

### 4. Update Layout

In `app/[[...slug]]/layout.tsx`, import and use `siteConfig`:

```tsx
import { siteConfig } from "@/site.config";

// Use siteConfig.name, siteConfig.logo, etc.
```

### 5. Add TypeScript Path Mapping

In `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@nuucognition/docs-theme": ["../../packages/theme/src/index.ts"],
      "@nuucognition/docs-theme/*": ["../../packages/theme/src/*"]
    }
  }
}
```

## Porting Content from Flint

The port script imports markdown content from any Flint's Mesh folder into a documentation site.

### Usage

Run from the docs monorepo root:

```bash
cd /path/to/docs
pnpm port --source ~/path/to/any-flint
```

The `site` field in the config determines which site receives the content.

### Configuration

Create `Mesh/(System) NUU Documentation.md` in your Flint with a YAML code block:

```markdown
---
id: docs-config
tags:
  - "#system"
---

# NUU Documentation

\`\`\`yaml
site: flint                        # Target site folder in sites/
title: My Documentation            # Site title
basePath: /                        # URL base path
index: "[[Introduction]]"          # Index page (wiki link)
sections:
  - id: guide                      # URL segment (e.g., /guide/quick-start)
    title: Guide                   # Sidebar section title
    pages:
      - "[[Guide - Quick Start]]"  # Wiki links to Mesh files
      - "[[Guide - Core Concepts]]"
  - id: reference
    title: Reference
    pages:
      - "[[Reference - CLI]]"
\`\`\`
```

### Conventions

| Feature | Behavior |
|---------|----------|
| **Title** | Auto-extracted from first `# Heading` in document |
| **Slug** | Auto-generated from filename, stripping prefixes like `Guide -` |
| **Wiki Links** | Resolved to target URLs, converted to markdown links |
| **Frontmatter** | Stripped and replaced with Fumadocs frontmatter |

### File Naming

Source files should follow the pattern `{Prefix} - {Name}.md`:

```
Guide - Quick Start.md      → /guide/quick-start
Module - Plugins.md         → /modules/plugins
Reference - CLI Commands.md → /reference/cli-commands
```

The prefix (`Guide`, `Module`, `Reference`) is stripped when generating the slug.

## Theme Package

`@nuucognition/docs-theme` provides:

- **SiteConfig** - Type-safe site configuration
- **Logo** - NUU Cognition logo component
- **Callout** - Styled callout component
- **tailwindPreset** - Consistent colors/fonts
- **createDocsLayoutOptions** - Factory for Fumadocs layout

### Usage

```tsx
import {
  type SiteConfig,
  Logo,
  Callout,
  tailwindPreset
} from "@nuucognition/docs-theme";
```

## Tech Stack

- [Fumadocs](https://fumadocs.vercel.app/) - Documentation framework
- [Next.js 15](https://nextjs.org/) - React framework
- [React 19](https://react.dev/) - UI library
- [Turborepo](https://turbo.build/) - Monorepo build system
- [pnpm](https://pnpm.io/) - Package manager
- [Tailwind CSS 4](https://tailwindcss.com/) - Styling
