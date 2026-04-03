import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

/**
 * GET /api/neon/companies
 *
 * Returns public company profiles with optional search and filters.
 *
 * Query params:
 *   q         — search by company name or industry
 *   industry  — filter by industry
 *   verified  — "true" to show only verified companies
 *   rap       — "true" to show only RAP-certified companies
 *   page      — pagination (default 1)
 *   pageSize  — results per page (default 20, max 50)
 *
 * Response shape: { data: [...], meta: { total, page, pageSize, totalPages } }
 */
export async function GET(req: NextRequest) {
  try {
    const sql = getDb();
    const { searchParams } = new URL(req.url);

    const q = searchParams.get('q') || '';
    const industry = searchParams.get('industry') || '';
    const verified = searchParams.get('verified');
    const rap = searchParams.get('rap');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10)));
    const offset = (page - 1) * pageSize;

    const conditions: string[] = [];
    const params: unknown[] = [];
    let paramIdx = 1;

    if (q) {
      conditions.push(`("companyName" ILIKE $${paramIdx} OR "industry" ILIKE $${paramIdx})`);
      params.push(`%${q}%`);
      paramIdx++;
    }

    if (industry) {
      conditions.push(`"industry" = $${paramIdx}`);
      params.push(industry);
      paramIdx++;
    }

    if (verified === 'true') {
      conditions.push(`"isVerified" = true`);
    }

    if (rap === 'true') {
      conditions.push(`"rapCertificationLevel" IS NOT NULL`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countQuery = `SELECT COUNT(*)::int AS total FROM "CompanyProfile" ${whereClause}`;
    const dataQuery = `
      SELECT
        "id", "userId", "companyName", "industry", "description",
        "website", "logo", "city", "state", "postcode",
        "isVerified", "verifiedAt",
        "rapCertificationLevel", "rapPoints",
        "createdAt"
      FROM "CompanyProfile"
      ${whereClause}
      ORDER BY "isVerified" DESC, "companyName" ASC
      LIMIT $${paramIdx} OFFSET $${paramIdx + 1}
    `;

    const allParams = [...params, pageSize, offset];

    const [countRows, companyRows] = await Promise.all([
      sql.query(countQuery, params),
      sql.query(dataQuery, allParams),
    ]);

    const total = countRows[0]?.total ?? 0;

    return NextResponse.json({
      data: companyRows,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (err) {
    console.error('Neon: Companies list error:', err);
    return NextResponse.json(
      { data: [], meta: { total: 0, page: 1, pageSize: 20, totalPages: 0 } },
      { status: 200 },
    );
  }
}
