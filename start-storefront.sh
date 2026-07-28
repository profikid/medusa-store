#!/bin/sh
cd /server/apps/storefront

echo "Starting Next.js development server (HMR via Turbopack)..."
exec pnpm exec next dev --turbopack -p 8000 -H 0.0.0.0
