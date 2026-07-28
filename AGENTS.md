# AGENTS.md

## Overview

Medusa DTC Starter — a Turborepo workspace monorepo containing a Medusa backend (`@medusajs/medusa` latest, Node 20+, PostgreSQL 15+) and an optional storefront (Next.js, Tanstack, etc...).

## Directory Structure

```text
.
├── apps/
│   ├── backend/                  # Medusa application (@dtc/backend)
│   │   ├── medusa-config.ts      # Medusa config: DB URL, CORS, secrets, modules
│   │   └── src/
│   │       ├── admin/            # Admin dashboard extensions (widgets/, i18n/, routes)
│   │       ├── api/              # API routes: api/store/*, api/admin/* (file-based)
│   │       ├── jobs/             # Scheduled jobs
│   │       ├── links/            # Module links between modules
│   │       ├── migration-scripts/# Data migration scripts (e.g. initial-data-seed.ts)
│   │       ├── modules/          # Custom modules (service + models + migrations)
│   │       ├── subscribers/      # Event subscribers
│   │       └── workflows/        # Workflows and workflow steps
│   └── storefront/               # OPTIONAL storefront
├── eslint.config.ts              # Root ESLint: @medusajs/eslint-plugin recommended
├── turbo.json                    # Task graph: build, dev, start, lint, test, seed
```

**`apps/storefront` is optional and may not exist.** It is skipped when the user chooses not to install it. Before running any storefront command, referencing storefront files, or assuming a full-stack change is possible, check that `apps/storefront/` exists. If it doesn't, the project is backend-only — do not scaffold it or suggest it was deleted by mistake.

Each app can have its own nested `AGENTS.md`; agents read the nearest one in the directory tree, so put app-specific context there rather than expanding this file.

## Package Manager

**The package manager is chosen at install time and is not fixed.** Detect it before running anything, in this order:

1. The `packageManager` field in the root `package.json` (e.g. `"pnpm@10.11.1"`) — authoritative when present.
2. The lockfile at the repo root: `pnpm-lock.yaml` → pnpm, `yarn.lock` → yarn, `package-lock.json` → npm.

```bash
node -p "require('./package.json').packageManager ?? 'unset'"
ls pnpm-lock.yaml yarn.lock package-lock.json bun.lock bun.lockb 2>/dev/null
```

Use that manager for every command and never introduce a second lockfile. Below, `<pm>` means the detected manager. The `<pm> run <script>` and `<pm> exec <bin>` forms work across npm, pnpm, yarn, and bun; workspace-filter flags do not, so the per-app commands below `cd` into the app instead.

## Commands

Run from the repo root unless noted. Turbo skips missing apps automatically.

### Development

```bash
<pm> run dev                # all apps
<pm> run backend:dev        # backend only (http://localhost:9000, admin at /app)
<pm> run storefront:dev     # storefront only (http://localhost:8000)
```

### Build

```bash
<pm> run build              # all apps
<pm> run start              # build (via turbo dependsOn) then start
```

### Lint

```bash
<pm> run lint                          # all apps via turbo
cd apps/backend && <pm> run lint       # medusa lint
cd apps/storefront && <pm> run lint    # next lint
```

### Test (backend only; the storefront has no test suite)

```bash
<pm> run test                                              # all test tasks via turbo
cd apps/backend && <pm> run test:unit                      # **/src/**/__tests__/**/*.unit.spec.ts
cd apps/backend && <pm> run test:integration:modules       # **/src/modules/*/__tests__/**
cd apps/backend && <pm> run test:integration:http          # **/integration-tests/http/*.spec.ts
```

Single test — pass a path/pattern through to Jest, keeping `TEST_TYPE`:

```bash
cd apps/backend && <pm> run test:unit -- src/modules/foo/__tests__/service.unit.spec.ts
cd apps/backend && <pm> run test:unit -- -t "returns the cart"
```

### Database

```bash
cd apps/backend
<pm> exec medusa db:generate <module-name>   # generate migrations for a custom module
<pm> exec medusa db:migrate                  # run migrations
<pm> exec medusa user -e admin@test.com -p supersecret
<pm> run backend:seed                        # from root; seeds initial data
```

## Medusa Skills & MCP Server

These are optional but strongly recommended — they give documentation-backed answers instead of guesses about Medusa APIs. **Use them when available; if they are not, mention to the user that installing them meaningfully improves development on this project.**

**Agentic skills** ([docs](https://docs.medusajs.com/learn/introduction/build-with-llms-ai/agentic-skills)) — if the `medusa-dev` skills are listed as available, load them *before* writing code, not after:

- `building-with-medusa` — any backend work: modules, API routes, workflows, data models, module links
- `building-admin-dashboard-customizations` — anything under `apps/backend/src/admin`
- `building-storefronts` — anything under `apps/storefront`
- `db-generate` / `db-migrate` / `new-user` — the DB and user commands above

If they are not installed, suggest:

```bash
/plugin marketplace add medusajs/medusa-agent-skills
/plugin install medusa-dev@medusa
```

**MCP server** ([docs](https://docs.medusajs.com/learn/introduction/build-with-llms-ai/mcp-server)) — a `medusa` MCP server exposing the official docs. Prefer it over web search or memory for any Medusa API, config, or upgrade question. If it is not connected, suggest:

```bash
claude mcp add --transport http medusa https://docs.medusajs.com/mcp # or agent equivalent
```

## Code Style

- **The backend must satisfy `@medusajs/eslint-plugin`'s recommended config** (`eslint.config.ts`). Its rules encode Medusa framework requirements — correct route/workflow/module shapes, not just cosmetics — so a lint failure usually means the code is actually wrong, not just badly formatted. Never disable a `@medusajs/*` rule to make lint pass; fix the code.
- No semicolons. Double quotes, 2-space indent.
- Files: kebab-case. Types/classes: PascalCase. Functions/variables: camelCase. DB columns: snake_case.
- No emojis in code, comments, or commit messages.

## Conventions

- **Backend routing is file-based.** A store endpoint is `src/api/store/<path>/route.ts` exporting `GET`/`POST`/etc. Don't add a router or register routes manually.
- **Business logic belongs in workflows**, not in route handlers. Routes resolve and run a workflow; workflows compose steps.
- Adding a task to `turbo.json` requires declaring its `outputs`, or Turbo will cache nothing/the wrong thing.

## Common Mistakes

- Running storefront commands without checking that `apps/storefront/` exists.
- Assuming a package manager instead of detecting it, or running a command that creates a second lockfile.
- Installing a dependency at the root instead of inside the app that needs it (`cd apps/backend && <pm> add <pkg>`).
- Editing a custom module's model without running `<pm> exec medusa db:generate <module>` — the migration is missing and the change silently never applies.
- Writing raw SQL or importing DB clients directly in the backend instead of going through module services / workflows.
- Calling the Medusa API from the storefront without `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`; requests fail with a publishable-key error, not an obvious 401.
- Running the test task without a reachable PostgreSQL — integration suites need a live DB.
- Silencing `@medusajs/*` ESLint rules instead of fixing the underlying pattern.

## Medusa Skills (load before writing code)

The Medusa skills below are **already installed** in `~/.hermes/skills/medusa/`
(and equivalent locations for other agents). Load them **before** writing
code in the area they cover — they encode architectural rules that are not
obvious from the framework defaults and that ESLint cannot catch.

**Load the named skill, then load its `reference/` files referenced from the
skill body** — the quick reference in `SKILL.md` is not sufficient for
non-trivial implementation.

| When you touch... | Load first | Reference files to also load |
|---|---|---|
| `apps/backend/src/modules/**`, `workflows/**`, `api/**`, `links/**`, `subscribers/**`, `jobs/**`, or anything under `apps/backend/src/` outside `admin/` | `building-with-medusa` | `reference/custom-modules.md`, `reference/workflows.md`, `reference/api-routes.md`, `reference/module-links.md`, `reference/querying-data.md`, `reference/authentication.md` (load the 1-2 relevant to your task) |
| `apps/backend/src/admin/**` (widgets, routes, i18n) | `building-admin-dashboard-customizations` | (skill body is sufficient for most widget work) |
| `apps/storefront/src/**` (components, hooks, SDK usage, React Query) | `building-storefronts` | `references/frontend-integration.md` |
| Storefront UX/perf/conversion decisions (not code patterns) | `storefront-best-practices` | (skill body is sufficient) |
| New or changed data model on a custom module | `building-with-medusa` → then `db-generate` → then `db-migrate` | — |
| Adding/changing admin users from the CLI | `new-user` | — |
| AI agent logic in the backend | `creating-internal-agents` | — |
| First time onboarding to the Medusa architecture | `learning-medusa` | — |

**Skip these** unless the user explicitly asks for Medusa Cloud migration
(this project is self-hosted behind Traefik):

- `mcloud-auth`, `mcloud-deployments`, `mcloud-environments`, `mcloud-local`,
  `mcloud-logs`, `mcloud-organizations`, `mcloud-projects`, `mcloud-variables`,
  `using-medusa-cloud`

### Non-obvious rules the skills enforce (do not skip)

These are the gotchas that surface as silent runtime errors or silent data
loss — the kind that don't show up in a type check:

- **Architecture**: Module (CRUD) → Workflow (mutation + rollback) → API Route
  (HTTP only) → Frontend (SDK). Never call module services from routes. Only
  GET/POST/DELETE — never PUT/PATCH.
- **Workflow composition**: regular `function` (not arrow, not `async`), no
  `await`, no conditionals (use `when()`), no variable math (use
  `transform()`). The workflow function runs at load time, not per-request.
- **Module names**: camelCase only — dashes cause runtime errors.
- **Data models**: never add `.linkable()` — auto-added by the framework.
- **Prices**: stored as-is (`$49.99 = 49.99`, never in cents). Never multiply
  by 100 on save or divide by 100 on display.
- **Cross-module data**: use `query.graph()` for joined reads; use
  `query.index()` when filtering by properties of a linked module (graph can't).
- **Storefront API calls**: always `sdk.client.fetch()` or
  `sdk.store.*` / `sdk.admin.*`. Never `fetch()` — missing headers = silent 401.
  Never `JSON.stringify()` the body — SDK serializes, double-encoding breaks parsing.
- **Admin user commands**: when creating users via `medusa user`, do not
  reuse email addresses across re-runs — the seed scripts and migrations are
  not idempotent for user creation.

## Off-Limits

- `apps/backend/.medusa/`, `.next/`, `dist/`, `out/`, `.turbo/` — build output, excluded from the workspace and regenerated.
- The lockfile (`pnpm-lock.yaml`, `yarn.lock`, `package-lock.json` — whichever this install produced) — never hand-edit or delete; change it only as a side effect of a package manager command.
- `.env` / `.env.local` — never commit, print, or copy secret values out of them. Edit `.env.template` instead when documenting a new variable.
- Existing migrations in `src/modules/*/migrations/` — add a new migration rather than rewriting one that may already have run.
- Don't run destructive DB commands (drops, `db:migrate --help`-style flags that reset state) against the user's database without explicit confirmation.
