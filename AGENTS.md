# AGENTS.md

Rules for agents working in this repo.

## Layout

- `sites/guide` is the only site. Package `@nuucognition/guide`. Dev and start port 30060. Served at `guide.nuucognition.com` with no basePath.
- `packages/theme` is the shared theme `@nuucognition/docs-theme`. Use only what `packages/theme/src/index.ts` exports.
- `packages/nuu-docs-cli` is the `nuu-docs` CLI. `src/port.ts` is the single port engine.
- `scripts/port-from-flint.ts` is a thin wrapper around the engine.

## Commands

```bash
pnpm install
pnpm build --filter=@nuucognition/guide
pnpm --filter @nuucognition/guide type-check
pnpm --filter @nuucognition/nuu-docs-cli build     # rebuild dist after editing the CLI
pnpm dev                                           # http://localhost:30060
pnpm port --source <flint-path>                    # port every doc set in a Flint
pnpm nuu-docs <command>                            # run the built CLI
```

## Port engine contract

A doc set is a `(NUU Docs) <Name>.md` file under a Flint's `Mesh/`. Its first YAML block has these keys:

| Key | Required | Meaning |
|-----|----------|---------|
| `site` | no | Site folder under `sites/`. Default `guide`. |
| `slug` | no | Product folder under `content/docs/`. Becomes the URL root `/<slug>` and a sidebar tab. |
| `title` | yes | Product title. Used as the tab name. |
| `basePath` | no | URL prefix in front of every link. Default `/`. |
| `index` | yes | Wiki link to the landing page. |
| `sections` | yes | List of `{ id, title, pages: ["[[Page]]"] }`. One folder per section. |

With `slug` the engine deletes only `sites/<site>/content/docs/<slug>/`, writes it again, and appends the slug to `pages` in the root `content/docs/meta.json` if missing. Without `slug` it replaces the whole `content/docs` folder of the site.

Push commands: `nuu-docs push <name> [site]`, `nuu-docs push --all`, or `pnpm port --source <flint>`.

## Generated content rule

Everything under `sites/guide/content/docs/<slug>/` is generated. Do not edit it here. Edit the source pages in the product's Flint and push again. Hand-written files are `content/docs/index.mdx`, `content/docs/meta.json`, and `content/docs/vessel/` (no Flint source).
