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
 * Convenience: pre-initialised sql tagged-template function.
 * Import this in API routes for one-liner queries:
 *
 *   import { sql } from '@/lib/db';
 *   const rows = await sql`SELECT * FROM "Partner" WHERE "isActive" = true`;
 */
export const sql = neon(process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL || '');
