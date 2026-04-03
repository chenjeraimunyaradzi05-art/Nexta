import { NextResponse } from 'next/server';

/**
 * GET /api/health/live
 *
 * Lightweight liveness probe handled by Next.js directly.
 * This prevents the ConnectionBanner from showing when only
 * the external Railway API is unreachable.
 */
export async function GET() {
  return NextResponse.json(
    { status: 'ok', timestamp: new Date().toISOString() },
    { status: 200 },
  );
}
