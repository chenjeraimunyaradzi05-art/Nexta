import { neon } from '@netlify/neon';

/**
 * Neon serverless Postgres client.
 *
 * In production (Netlify), the NETLIFY_DATABASE_URL env var is injected
 * automatically by the Neon integration. For local development, set
 * DATABASE_URL in your .env.local file.
 */
export function getDb() {
  const connectionString = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      'Missing database connection string. Set NETLIFY_DATABASE_URL (Netlify) or DATABASE_URL (.env.local).',
    );
  }

  return neon(connectionString);
}

/**
 * Convenience: lazily-initialised sql tagged-template function.
 * Use getDb() in API route handlers instead — it is called at
 * request time so DATABASE_URL is always available.
 *
 * Do NOT export a top-level neon() call here; it would execute
 * at build/import time when DATABASE_URL is not yet set.
 */
