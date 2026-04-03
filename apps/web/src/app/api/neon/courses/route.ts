import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

/**
 * GET /api/neon/courses
 *
 * Paginated course list with optional category and search filters.
 * Response shape matches Railway API:
 * { courses: [...], total, page, pageSize }
 *
 * Query params: category, search, page (default 1), pageSize (default 20)
 */
export async function GET(req: NextRequest) {
  try {
    const sql = getDb();
    const { searchParams } = new URL(req.url);

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10)));
    const offset = (page - 1) * pageSize;
    const category = searchParams.get('category') || '';
    const search = searchParams.get('search') || '';

    const conditions: string[] = [];
    const params: unknown[] = [];
    let paramIdx = 1;

    if (category) {
      conditions.push(`"category" = $${paramIdx}`);
      params.push(category);
      paramIdx++;
    }

    if (search) {
      conditions.push(
        `("title" ILIKE $${paramIdx} OR "description" ILIKE $${paramIdx} OR "skills" ILIKE $${paramIdx})`,
      );
      params.push(`%${search}%`);
      paramIdx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countQuery = `SELECT COUNT(*)::int AS total FROM "Course" ${whereClause}`;

    const dataQuery = `
      SELECT c.*,
             (SELECT COUNT(*)::int FROM "CourseEnrolment" ce WHERE ce."courseId" = c."id") AS "enrolmentCount"
      FROM "Course" c
      ${whereClause}
      ORDER BY c."createdAt" DESC
      LIMIT $${paramIdx} OFFSET $${paramIdx + 1}
    `;

    const allParams = [...params, pageSize, offset];

    const [countRows, courseRows] = await Promise.all([
      sql.query(countQuery, params),
      sql.query(dataQuery, allParams),
    ]);

    const total = countRows[0]?.total ?? 0;

    const courses = courseRows.map((c: any) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      duration: c.duration,
      category: c.category,
      location: c.location,
      isOnline: c.isOnline,
      price: c.priceInCents ? c.priceInCents / 100 : null,
      priceInCents: c.priceInCents,
      provider: c.providerName || 'Unknown Provider',
      skills: c.skills,
      url: c.url,
      enrolmentCount: c.enrolmentCount ?? 0,
      createdAt: c.createdAt,
    }));

    return NextResponse.json({ courses, total, page, pageSize });
  } catch (err) {
    console.error('Neon: Courses list error:', err);
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}
