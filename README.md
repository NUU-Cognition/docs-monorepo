# NUU Documentation

Monorepo for all NUU product documentation sites.

## Structure

```
docs/
├── packages/
│   └── theme/           # Shared NUU Fumadocs theme
├── sites/
│   └── flint/           # flintdocs.nuucognition.com
├── scripts/
│   └── port-from-flint.ts  # Flint → Fumadocs content porting
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

# Port content from Flint subflint
pnpm port --source ~/path/to/subflint --target sites/flint
```

## Sites

| Site | Domain | Description |
|------|--------|-------------|
| `flint` | `flintdocs.nuucognition.com` | Flint documentation |

## Adding a New Site

1. Create `sites/{name}/` with Fumadocs
2. Import shared theme: `import { theme } from '@nuu/docs-theme'`
3. Run `pnpm install`
4. Configure Vercel deployment

## Theme Package

The `@nuu/docs-theme` package provides:
- NUU branding (logo, colors, typography)
- Fumadocs layout customizations
- Shared components (callouts, code blocks)
- Tailwind preset

## Tech Stack

- [Fumadocs](https://fumadocs.vercel.app/) - Documentation framework
- [Next.js](https://nextjs.org/) - React framework
- [Turborepo](https://turbo.build/) - Monorepo build system
- [pnpm](https://pnpm.io/) - Package manager
