#!/bin/sh
cd /server/apps/backend

echo "Running database migrations..."
pnpm medusa db:migrate

echo "Seeding database (idempotent skip if already seeded)..."
pnpm exec medusa exec ./src/migration-scripts/initial-data-seed.ts || echo "Seed failed or already applied, continuing..."

echo "Starting Medusa production server..."
exec pnpm exec medusa start
