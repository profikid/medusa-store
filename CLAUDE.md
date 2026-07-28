# CLAUDE.md

This is a forked **Medusa DTC Starter** (`@dtc/backend` + `@dtc/storefront`)
running in production on `medusa.tracecore.profikid.nl` / `store.medusa.tracecore.profikid.nl`
behind Traefik. Read [AGENTS.md](./AGENTS.md) for directory layout, package
manager detection, commands, conventions, and off-limits paths.

## Skills (load these, don't guess)

The Medusa skills below are **already installed** in `~/.hermes/skills/medusa/`.
Their `description` frontmatter uses "Load automatically when..." triggers —
honor them by loading the named skill **before** writing any code for that area,
not after. Their reference files (`reference/*.md`, `references/*.md`) are
loaded on-demand from the skill body — never skip that step for non-trivial
implementation.

| When you touch... | Load first |
|---|---|
| `apps/backend/src/modules/**`, `workflows/**`, `api/**`, `links/**`, anything under `apps/backend/src/` outside `admin/` | `building-with-medusa` |
| `apps/backend/src/admin/**` (widgets, routes, i18n) | `building-admin-dashboard-customizations` |
| `apps/storefront/src/**` (components, hooks, SDK usage, React Query) | `building-storefronts` |
| Storefront UX/perf/conversion decisions (not code patterns) | `storefront-best-practices` |
| New or changed data model on a custom module | `building-with-medusa` → then `db-generate` → then `db-migrate` |
| Adding/changing admin users | `new-user` |
| AI agent logic in the backend | `creating-internal-agents` |

The cloud skills (`mcloud-*`, `using-medusa-cloud`) are **off-limits** unless
the user explicitly asks to migrate to Medusa Cloud — this project is
self-hosted behind Traefik.

## Project context (read once)

- **Deployment**: Docker Compose on `72.60.108.6` Azure VM. Two hostnames
  via Traefik cert resolver `mytlschallenge` (Let's Encrypt TLS-ALPN-01),
  external network `tracecoreagent_default`. See repo root `Dockerfile`
  + `docker-compose.yml` for the production multi-stage build.
- **Modes**: production only — `medusa start` + `next start`. Dev mode
  (`medusa develop`, `next dev --turbopack`) was the old default but is
  too heavy on this host. Dev mode still works locally for hot iteration.
- **Admin login**: `admin@profikid.nl` / `admin123` (seeded).
- **Publishable API key**: baked into the storefront image at build time
  via `--build-arg NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`. Get the current
  value from `/docker/medusa/apps/storefront/.env` on the host or by
  running a temporary postgres container and querying `api_key` table.
- **Build args required for next build**: `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`,
  `NEXT_PUBLIC_MEDUSA_BACKEND_URL`, `NEXT_PUBLIC_BASE_URL`,
  `NEXT_PUBLIC_DEFAULT_REGION` — missing any of these and `check-env-variables.js`
  hard-fails the build.
- **Known gotcha** (Medusa 2.18): admin build output is at
  `apps/backend/.medusa/server/public/admin/` but the runtime loader
  hardcodes `outDir` to `<root>/public/admin` AFTER spreading user config,
  so `medusa-config.ts` `admin.outDir` overrides don't stick. The Dockerfile
  mirrors the build output to `apps/backend/public/admin/` as a workaround.
  If you refactor the admin build, keep this mirror or fix upstream.

## Don't

- Don't use `fetch()` in storefront code — use `sdk.client.fetch()` or
  `sdk.store.*` / `sdk.admin.*`. Missing `x-publishable-api-key` or auth
  headers = silent 401s.
- Don't `JSON.stringify()` the body for SDK calls — the SDK serializes.
- Don't `await` or use arrow functions in workflow composition — those are
  evaluated at load time, not runtime. Use `function`, no `await`,
  `when()` for conditionals, `transform()` for variable math.
- Don't multiply/divide prices by 100 — Medusa stores prices as-is.
- Don't bypass workflows by calling module services from API routes.
- Don't add `.linkable()` to data models — auto-added by the framework.
- Don't use dashes in module names — must be camelCase.
- Don't edit `pnpm-lock.yaml` by hand or delete it.
