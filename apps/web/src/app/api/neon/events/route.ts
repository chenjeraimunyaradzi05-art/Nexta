import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

/**
 * GET /api/neon/events
 *
 * Returns upcoming public cultural events, ordered by start date.
 *
 * Query params:
 *   type      — filter by eventType (ceremony, workshop, etc.)
 *   upcoming  — "true" (default) to show future events only
 *   limit     — max results (default 20, max 50)
 *   page      — pagination (default 1)
 *
 * Response shape: { data: [...], meta: { total, page, pageSize, totalPages } }
 */
export async function GET(req: NextRequest) {
  try {
    const sql = getDb();
    const { searchParams } = new URL(req.url);

    const eventType = searchParams.get('type') || '';
    const upcoming = searchParams.get('upcoming') !== 'false';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const offset = (page - 1) * pageSize;

    const now = new Date().toISOString();

    // Build WHERE conditions
    const conditions: string[] = ['"isPublic" = true'];
    const params: unknown[] = [];
    let paramIdx = 1;

    if (upcoming) {
      conditions.push(`"startDate" >= $${paramIdx}::timestamptz`);
      params.push(now);
      paramIdx++;
    }

    if (eventType) {
      conditions.push(`"eventType" = $${paramIdx}`);
      params.push(eventType);
      paramIdx++;
    }

    const whereClause = conditions.join(' AND ');

    const countQuery = `SELECT COUNT(*)::int AS total FROM "CulturalEvent" WHERE ${whereClause}`;
    const dataQuery = `
      SELECT
        "id", "title", "description", "eventType",
        "startDate", "endDate", "isAllDay", "timezone",
        "location", "isOnline", "meetingUrl",
        "nation", "isRestricted",
        "attendeeCount", "maxAttendees",
        "createdAt"
      FROM "CulturalEvent"
      WHERE ${whereClause}
      ORDER BY "startDate" ASC
      LIMIT $${paramIdx} OFFSET $${paramIdx + 1}
    `;

    const allParams = [...params, pageSize, offset];

    const [countRows, eventRows] = await Promise.all([
      sql.query(countQuery, params),
      sql.query(dataQuery, allParams),
    ]);

    const total = countRows[0]?.total ?? 0;

    return NextResponse.json({
      data: eventRows,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (err) {
    console.error('Neon: Events list error:', err);
    return NextResponse.json(
      { data: [], meta: { total: 0, page: 1, pageSize: 20, totalPages: 0 } },
      { status: 200 },
    );
  }
}
