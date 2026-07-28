#!/bin/sh
# Storefront production entrypoint
set -e

cd /server/apps/storefront

echo "[storefront] Starting Next.js production server on :8000..."
exec pnpm exec next start -p 8000 -H 0.0.0.0
