#!/bin/sh
# Backend production entrypoint
set -e

cd /server/apps/backend

echo "[backend] Running database migrations..."
pnpm medusa db:migrate

echo "[backend] Running initial data seed (idempotent)..."
# Seed script aborts on duplicate regions/products; that's fine for re-runs.
pnpm exec medusa exec ./src/migration-scripts/initial-data-seed.ts \
  || echo "[backend] Seed already applied or completed (non-fatal)"

echo "[backend] Starting Medusa production server on :9000..."
exec pnpm exec medusa start
