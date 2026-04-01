import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

/**
 * GET /api/neon/health
 *
 * Lightweight health check that verifies Neon DB connectivity.
 */
export async function GET() {
  const start = Date.now();

  try {
    const sql = getDb();
    const [row] = await sql`SELECT 1 AS ok`;
    const latencyMs = Date.now() - start;

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        status: row?.ok === 1 ? 'connected' : 'unexpected',
        latencyMs,
      },
    });
  } catch (err: any) {
    const latencyMs = Date.now() - start;

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: {
          status: 'disconnected',
          latencyMs,
          error: err.message,
        },
      },
      { status: 503 },
    );
  }
}
