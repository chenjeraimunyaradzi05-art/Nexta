import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

/**
 * GET /api/neon/companies/[id]
 *
 * Returns a single company profile with mentor count and active job count.
 */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const sql = getDb();

    const [company] = await sql`
      SELECT
        cp.*,
        u."name" AS "ownerName",
        u."avatarUrl" AS "ownerAvatar"
      FROM "CompanyProfile" cp
      JOIN "User" u ON u."id" = cp."userId"
      WHERE cp."id" = ${id}
      LIMIT 1
    `;

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Fetch active job count and mentor count in parallel
    const [jobStats, mentorStats] = await Promise.all([
      sql`SELECT COUNT(*)::int AS count FROM "Job" WHERE "userId" = ${company.userId} AND "isActive" = true`,
      sql`SELECT COUNT(*)::int AS count FROM "MentorProfile" WHERE "companyId" = ${id} AND "active" = true`,
    ]);

    return NextResponse.json({
      company: {
        ...company,
        activeJobCount: jobStats[0]?.count ?? 0,
        mentorCount: mentorStats[0]?.count ?? 0,
      },
    });
  } catch (err) {
    console.error('Neon: Company detail error:', err);
    return NextResponse.json({ error: 'Failed to fetch company' }, { status: 500 });
  }
}
