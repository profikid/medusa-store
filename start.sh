#!/bin/sh
cd /server/apps/backend

echo "Running database migrations..."
pnpm medusa db:migrate

echo "Seeding database (skips if already applied)..."
pnpm exec medusa exec ./src/migration-scripts/initial-data-seed.ts || echo "Seed step done (skipped or already applied)"

echo "Starting Medusa development server (admin + API on :9000, admin dev HMR on :5173)..."
exec pnpm exec medusa develop
