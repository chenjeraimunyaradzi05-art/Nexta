import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

/**
 * GET /api/neon/courses/categories
 *
 * Returns distinct course categories with counts.
 * Response shape: { categories: [{ name, count }] }
 */
export async function GET() {
  try {
    const sql = getDb();

    const rows = await sql`
      SELECT "category" AS name, COUNT(*)::int AS count
      FROM "Course"
      WHERE "category" IS NOT NULL
      GROUP BY "category"
      ORDER BY count DESC
    `;

    return NextResponse.json({
      categories: rows.map((r: any) => ({ name: r.name, count: r.count })),
    });
  } catch (err) {
    console.error('Neon: Course categories error:', err);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}
