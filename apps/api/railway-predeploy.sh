#!/bin/sh
set -e

echo "========================================"
echo "  Nexta API - Railway pre-deploy"
echo "========================================"

if [ "${SKIP_DB_MIGRATIONS:-false}" = "true" ]; then
  echo "Skipping Prisma migrations because SKIP_DB_MIGRATIONS=true"
  exit 0
fi

if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL is not set, skipping Prisma migrations."
  exit 0
fi

echo "Running Prisma migrations..."
npx prisma migrate deploy --schema=prisma/schema.prisma
echo "Prisma migrations complete."
