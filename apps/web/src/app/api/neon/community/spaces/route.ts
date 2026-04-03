import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

/**
 * GET /api/neon/community/spaces
 *
 * Returns public community spaces (WomenSpace) with optional type filter.
 *
 * Query params:
 *   type   — filter by spaceType (GENERAL, CAREER, BUSINESS, etc.)
 *   limit  — max results (default 20, max 50)
 *   page   — pagination (default 1)
 *
 * Response shape: { data: [...], meta: { total, page, pageSize, totalPages } }
 */
export async function GET(req: NextRequest) {
  try {
    const sql = getDb();
    const { searchParams } = new URL(req.url);

    const spaceType = searchParams.get('type') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const offset = (page - 1) * pageSize;

    const conditions: string[] = ['"isActive" = true', `"visibility" = 'PUBLIC'`];
    const params: unknown[] = [];
    let paramIdx = 1;

    if (spaceType) {
      conditions.push(`"spaceType"::text = $${paramIdx}`);
      params.push(spaceType);
      paramIdx++;
    }

    const whereClause = conditions.join(' AND ');

    const countQuery = `SELECT COUNT(*)::int AS total FROM "WomenSpace" WHERE ${whereClause}`;
    const dataQuery = `
      SELECT
        "id", "name", "description", "spaceType", "visibility",
        "coverImageUrl", "iconEmoji",
        "isPinned", "memberCount",
        "hasWelcomeToCountry", "acknowledgesCountry",
        "createdAt"
      FROM "WomenSpace"
      WHERE ${whereClause}
      ORDER BY "isPinned" DESC, "memberCount" DESC, "name" ASC
      LIMIT $${paramIdx} OFFSET $${paramIdx + 1}
    `;

    const allParams = [...params, pageSize, offset];

    const [countRows, spaceRows] = await Promise.all([
      sql.query(countQuery, params),
      sql.query(dataQuery, allParams),
    ]);

    const total = countRows[0]?.total ?? 0;

    return NextResponse.json({
      data: spaceRows,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (err) {
    console.error('Neon: Community spaces list error:', err);
    return NextResponse.json(
      { data: [], meta: { total: 0, page: 1, pageSize: 20, totalPages: 0 } },
      { status: 200 },
    );
  }
}
