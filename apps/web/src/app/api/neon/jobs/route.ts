import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

/**
 * GET /api/neon/jobs
 *
 * Paginated job list with search and filters.
 * Response shape: { data: [...], meta: { total, page, pageSize, totalPages } }
 *
 * Query params:
 *   q, location, employment, minSalary, maxSalary, featured,
 *   page (default 1), pageSize (default 20)
 */
export async function GET(req: NextRequest) {
  try {
    const sql = getDb();
    const { searchParams } = new URL(req.url);

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10)));
    const offset = (page - 1) * pageSize;

    const q = searchParams.get('q') || '';
    const location = searchParams.get('location') || '';
    const employment = searchParams.get('employment') || '';
    const minSalary = searchParams.get('minSalary');
    const maxSalary = searchParams.get('maxSalary');
    const featured = searchParams.get('featured');

    // Build WHERE conditions dynamically
    const conditions: string[] = ['"isActive" = true'];
    const params: unknown[] = [];
    let paramIdx = 1;

    if (q) {
      conditions.push(`("title" ILIKE $${paramIdx} OR "description" ILIKE $${paramIdx})`);
      params.push(`%${q}%`);
      paramIdx++;
    }

    if (location) {
      conditions.push(`"location" ILIKE $${paramIdx}`);
      params.push(`%${location}%`);
      paramIdx++;
    }

    if (employment) {
      conditions.push(`"employment" = $${paramIdx}`);
      params.push(employment);
      paramIdx++;
    }

    if (featured === 'true') {
      conditions.push(`"isFeatured" = true`);
    }

    if (minSalary) {
      const min = parseInt(minSalary, 10);
      if (!isNaN(min)) {
        conditions.push(`("salaryHigh" >= $${paramIdx} OR "salaryLow" >= $${paramIdx})`);
        params.push(min);
        paramIdx++;
      }
    }

    if (maxSalary) {
      const max = parseInt(maxSalary, 10);
      if (!isNaN(max)) {
        conditions.push(`("salaryLow" <= $${paramIdx} OR "salaryHigh" <= $${paramIdx})`);
        params.push(max);
        paramIdx++;
      }
    }

    const whereClause = conditions.join(' AND ');

    // Count + paginated fetch in parallel using tagged template for safety
    // We need to use raw parameterized queries since dynamic WHERE prevents tagged templates
    const countQuery = `SELECT COUNT(*)::int AS total FROM "Job" WHERE ${whereClause}`;
    const dataQuery = `
      SELECT j.*,
             cp."companyName", cp."industry" AS "companyIndustry",
             cp."isVerified" AS "companyVerified",
             cp."logo" AS "companyLogo",
             cp."description" AS "companyDescription",
             cp."website" AS "companyWebsite",
             cp."city" AS "companyCity",
             cp."state" AS "companyState",
             cp."rapCertificationLevel"
      FROM "Job" j
      LEFT JOIN "CompanyProfile" cp ON cp."userId" = j."userId"
      WHERE ${whereClause}
      ORDER BY j."isFeatured" DESC, j."postedAt" DESC
      LIMIT $${paramIdx} OFFSET $${paramIdx + 1}
    `;

    const allParams = [...params, pageSize, offset];

    const [countRows, jobRows] = await Promise.all([
      sql.query(countQuery, params),
      sql.query(dataQuery, allParams),
    ]);

    const total = countRows[0]?.total ?? 0;

    const now = new Date();
    const data = jobRows.map((row: any) => {
      const isFeatured =
        row.isFeatured && row.featuredUntil
          ? new Date(row.featuredUntil) > now
          : Boolean(row.isFeatured);

      return {
        id: row.id,
        userId: row.userId,
        title: row.title,
        slug: row.slug,
        description: row.description,
        location: row.location,
        employment: row.employment,
        salaryLow: row.salaryLow,
        salaryHigh: row.salaryHigh,
        isActive: row.isActive,
        isFeatured,
        featuredAt: row.featuredAt,
        featuredUntil: row.featuredUntil,
        viewCount: row.viewCount,
        postedAt: row.postedAt,
        createdAt: row.createdAt,
        company: row.companyName
          ? {
              companyName: row.companyName,
              industry: row.companyIndustry,
              isVerified: row.companyVerified,
              logo: row.companyLogo,
              description: row.companyDescription,
              website: row.companyWebsite,
              location: [row.companyCity, row.companyState].filter(Boolean).join(', '),
              rapCertificationLevel: row.rapCertificationLevel,
            }
          : null,
      };
    });

    return NextResponse.json({
      data,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (err) {
    console.error('Neon: Jobs list error:', err);
    return NextResponse.json(
      {
        data: [],
        meta: { total: 0, page: 1, pageSize: 20, totalPages: 0 },
      },
      { status: 200 },
    );
  }
}
