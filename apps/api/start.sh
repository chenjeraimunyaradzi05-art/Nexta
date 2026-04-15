#!/bin/sh
set -e

echo "========================================"
echo "  Nexta API - Starting..."
echo "========================================"
echo "NODE_ENV: ${NODE_ENV:-development}"
echo "PORT: ${PORT:-not set}"
echo "DATABASE_URL: ${DATABASE_URL:+SET}"
echo "========================================"

# Optional fallback for non-Railway environments.
if [ "${RUN_DB_MIGRATIONS_ON_START:-false}" = "true" ] && [ -n "$DATABASE_URL" ]; then
  echo "📦 Running Prisma migrations before startup..."
  npx prisma migrate deploy --schema=prisma/schema.prisma
elif [ "${RUN_DB_MIGRATIONS_ON_START:-false}" = "true" ]; then
  echo "⚠️  RUN_DB_MIGRATIONS_ON_START=true but DATABASE_URL is not set. Skipping."
fi

# Start the server
echo "🚀 Starting Node.js server..."
exec node dist/src/index.js
