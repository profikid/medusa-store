#!/bin/sh
cd /server/apps/storefront

echo "Starting Next.js production server..."
exec pnpm exec next start -p 8000 -H 0.0.0.0
