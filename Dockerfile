# syntax=docker/dockerfile:1.7
# ─── Stage 1: build ────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /server

RUN npm install pnpm@10.11.1 -g

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json .npmrc ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/storefront/package.json ./apps/storefront/

RUN pnpm install --frozen-lockfile

COPY . .

# Build-time args for storefront public env vars (Next.js bakes NEXT_PUBLIC_* into client bundle)
ARG NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_build_placeholder
ARG NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://medusa.tracecore.profikid.nl
ARG NEXT_PUBLIC_BASE_URL=https://store.medusa.tracecore.profikid.nl
ARG NEXT_PUBLIC_DEFAULT_REGION=dk
ENV NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=$NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_MEDUSA_BACKEND_URL=$NEXT_PUBLIC_MEDUSA_BACKEND_URL
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL
ENV NEXT_PUBLIC_DEFAULT_REGION=$NEXT_PUBLIC_DEFAULT_REGION
ENV NODE_ENV=production

# Build both apps via turbo (produces apps/backend/.medusa/server + apps/storefront/.next)
RUN pnpm build

# ─── Stage 2: runtime ─────────────────────────────────────────────────────
FROM node:20-alpine AS runtime

WORKDIR /server

RUN npm install pnpm@10.11.1 -g

# Copy workspace config + lockfile so pnpm can resolve on a fresh checkout
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json .npmrc ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/storefront/package.json ./apps/storefront/

# Install production deps only (no devDeps). pnpm's --prod flag skips devDependencies.
RUN pnpm install --frozen-lockfile --prod

# Copy built artifacts from builder
COPY --from=builder /server/apps/backend/.medusa ./apps/backend/.medusa
COPY --from=builder /server/apps/storefront/.next ./apps/storefront/.next

# Source still needed at runtime: medusa-config.ts, scripts, etc.
COPY --from=builder /server/apps/backend/medusa-config.ts ./apps/backend/medusa-config.ts
COPY --from=builder /server/apps/backend/src ./apps/backend/src
COPY --from=builder /server/apps/backend/instrumentation.ts ./apps/backend/instrumentation.ts
COPY --from=builder /server/apps/storefront/next.config.js ./apps/storefront/
COPY --from=builder /server/apps/storefront/next-env.d.ts ./apps/storefront/
COPY --from=builder /server/apps/storefront/next-sitemap.js ./apps/storefront/
COPY --from=builder /server/apps/storefront/postcss.config.js ./apps/storefront/
COPY --from=builder /server/apps/storefront/tailwind.config.js ./apps/storefront/
COPY --from=builder /server/apps/storefront/tsconfig.json ./apps/storefront/
COPY --from=builder /server/apps/storefront/public/ ./apps/storefront/public/
COPY --from=builder /server/apps/storefront/src ./apps/storefront/src

COPY start.sh start-storefront.sh ./
RUN chmod +x start.sh start-storefront.sh

EXPOSE 9000 8000

# Default entrypoint is overridden per-service in docker-compose.yml
ENTRYPOINT ["./start.sh"]
