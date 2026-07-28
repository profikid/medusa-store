# =============================================================================
# Medusa DTC Starter - Production Dockerfile
# =============================================================================
# Multi-stage build that:
#   1. Installs deps + builds admin (medusa build) + storefront (next build)
#   2. Runtime image copies prebuilt artifacts only (no devDeps, no source)
#
# Build args:
#   NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY  - storefront build needs this baked in
#   NEXT_PUBLIC_MEDUSA_BACKEND_URL      - same
#   NEXT_PUBLIC_BASE_URL                - same
#   NEXT_PUBLIC_DEFAULT_REGION          - same
#
# Override ENTRYPOINT per service via docker-compose.yml to choose
# medusa start / next start vs medusa develop / next dev.
# =============================================================================

# ---- Stage 1: Builder ----
FROM node:20-alpine AS builder

WORKDIR /server

RUN npm install pnpm@10.11.1 -g

# Copy workspace manifests first for layer caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json .npmrc ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/storefront/package.json ./apps/storefront/

# Install all deps (including devDeps) - ts-node + vite + next are needed for build
RUN pnpm install --frozen-lockfile

# Now copy source and build everything
COPY . .

# Build Medusa backend (outputs .medusa/server with prebuilt admin bundle)
# Note: NODE_ENV=production during build so medusa build takes the prod path
ENV NODE_ENV=production
RUN pnpm --filter @dtc/backend build

# Workaround for Medusa 2.18 path mismatch: 'medusa build' outputs the admin
# UI to .medusa/server/public/admin but the runtime loader looks for
# <rootDirectory>/public/admin/index.html (it joins ADMIN_RELATIVE_OUTPUT_DIR =
# './public/admin' AFTER spreading the user config, so outDir override doesn't
# stick). Mirror the build output to public/admin so 'medusa start' finds it.
RUN mkdir -p /server/apps/backend/public && \
    cp -r /server/apps/backend/.medusa/server/public/admin /server/apps/backend/public/admin

# Build Next.js storefront (outputs .next/standalone-like structure)
# Required NEXT_PUBLIC_* envs must be set as build args for check-env-variables
ARG NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_MEDUSA_BACKEND_URL
ARG NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_DEFAULT_REGION
ENV NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=${NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY}
ENV NEXT_PUBLIC_MEDUSA_BACKEND_URL=${NEXT_PUBLIC_MEDUSA_BACKEND_URL}
ENV NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL}
ENV NEXT_PUBLIC_DEFAULT_REGION=${NEXT_PUBLIC_DEFAULT_REGION}

# Skip type checking + lint during build (faster, we trust the dev loop)
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter @dtc/storefront build

# Prune to prod-only deps for runtime (keeps ts-node for medusa exec scripts)
RUN pnpm prune --prod

# ---- Stage 2: Runtime ----
FROM node:20-alpine AS runtime

WORKDIR /server

RUN npm install pnpm@10.11.1 -g

# Copy workspace manifests + pnpm store from builder
COPY --from=builder /server/package.json /server/pnpm-lock.yaml /server/pnpm-workspace.yaml ./
COPY --from=builder /server/apps/backend/package.json ./apps/backend/
COPY --from=builder /server/apps/storefront/package.json ./apps/storefront/

# Copy prebuilt node_modules (already pruned to --prod)
COPY --from=builder /server/node_modules /server/node_modules
COPY --from=builder /server/apps/backend/node_modules /server/apps/backend/node_modules
COPY --from=builder /server/apps/storefront/node_modules /server/apps/storefront/node_modules

# Copy source for both apps (needed at runtime: medusa-config.ts, seed scripts,
# storefront pages for SSR, middleware, etc.)
COPY --from=builder /server/apps/backend/src ./apps/backend/src
COPY --from=builder /server/apps/backend/medusa-config.ts ./apps/backend/
COPY --from=builder /server/apps/backend/tsconfig.json ./apps/backend/
COPY --from=builder /server/apps/backend/public ./apps/backend/public
COPY --from=builder /server/apps/storefront/src ./apps/storefront/src
COPY --from=builder /server/apps/storefront/public ./apps/storefront/public
COPY --from=builder /server/apps/storefront/next.config.js ./apps/storefront/
COPY --from=builder /server/apps/storefront/tsconfig.json ./apps/storefront/
COPY --from=builder /server/apps/storefront/check-env-variables.js ./apps/storefront/
COPY --from=builder /server/apps/storefront/package.json ./apps/storefront/
# Tailwind + PostCSS configs are needed in the runtime image so any in-container
# rebuild (e.g. when .next/BUILD_ID is missing) sees them. Without these the
# generated CSS contains literal `@tailwind base;` directives and the page
# renders completely unstyled.
COPY --from=builder /server/apps/storefront/tailwind.config.js ./apps/storefront/
COPY --from=builder /server/apps/storefront/postcss.config.js ./apps/storefront/

# Copy prebuilt artifacts
COPY --from=builder /server/apps/backend/.medusa /server/apps/backend/.medusa
COPY --from=builder /server/apps/storefront/.next /server/apps/storefront/.next

# Copy start scripts + make executable
COPY start.sh /server/start.sh
COPY start-storefront.sh /server/start-storefront.sh
RUN chmod +x /server/start.sh /server/start-storefront.sh

EXPOSE 9000 8000

# Default entrypoint = backend prod start. Override per service in compose.
ENTRYPOINT ["/server/start.sh"]
