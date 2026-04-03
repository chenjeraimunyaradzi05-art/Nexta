import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

/**
 * GET /api/neon/mentors/search
 *
 * Public mentor search with optional filters.
 * Response shape matches Railway API:
 * { mentors: [...], pagination: { page, limit, total, totalPages } }
 *
 * Query params: skills, location, industry, page (default 1), limit (default 20)
 */
export async function GET(req: NextRequest) {
  try {
    const sql = getDb();
    const { searchParams } = new URL(req.url);

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const offset = (page - 1) * limit;

    const skills = searchParams.get('skills') || '';
    const location = searchParams.get('location') || '';
    const industry = searchParams.get('industry') || '';

    const conditions: string[] = ['mp."active" = true'];
    const params: unknown[] = [];
    let paramIdx = 1;

    if (skills) {
      conditions.push(`mp."skills" ILIKE $${paramIdx}`);
      params.push(`%${skills}%`);
      paramIdx++;
    }

    if (location) {
      conditions.push(`mp."location" ILIKE $${paramIdx}`);
      params.push(`%${location}%`);
      paramIdx++;
    }

    if (industry) {
      conditions.push(`mp."industry" ILIKE $${paramIdx}`);
      params.push(`%${industry}%`);
      paramIdx++;
    }

    const whereClause = conditions.join(' AND ');

    const countQuery = `
      SELECT COUNT(*)::int AS total
      FROM "MentorProfile" mp
      WHERE ${whereClause}
    `;

    const dataQuery = `
      SELECT mp."userId" AS id,
             COALESCE(mp."name", u."name") AS name,
             COALESCE(mp."avatar", mp."avatarUrl", u."avatarUrl") AS avatar,
             mp."bio",
             mp."skills",
             mp."location",
             mp."title",
             mp."industry"
      FROM "MentorProfile" mp
      LEFT JOIN "User" u ON u."id" = mp."userId"
      WHERE ${whereClause}
      ORDER BY mp."createdAt" DESC
      LIMIT $${paramIdx} OFFSET $${paramIdx + 1}
    `;

    const allParams = [...params, limit, offset];

    const [countRows, mentorRows] = await Promise.all([
      sql.query(countQuery, params),
      sql.query(dataQuery, allParams),
    ]);

    const total = countRows[0]?.total ?? 0;

    const mentors = mentorRows.map((p: any) => ({
      id: p.id,
      name: p.name,
      avatar: p.avatar,
      bio: p.bio,
      skills: p.skills ? p.skills.split(',').map((s: string) => s.trim()) : [],
      location: p.location,
      title: p.title,
      industry: p.industry,
    }));

    return NextResponse.json({
      mentors,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('Neon: Mentor search error:', err);
    return NextResponse.json({ error: 'Failed to search mentors' }, { status: 500 });
  }
}
