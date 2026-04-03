import { neon } from '@netlify/neon';

/**
 * Neon serverless Postgres client.
 *
 * `neon()` from @netlify/neon automatically uses the NETLIFY_DATABASE_URL
 * env var injected by the Neon integration on Netlify.
 * For local development, set DATABASE_URL in your .env.local file and
 * pass it explicitly via getDb().
 */
export function getDb() {
  return neon(process.env.DATABASE_URL);
}
