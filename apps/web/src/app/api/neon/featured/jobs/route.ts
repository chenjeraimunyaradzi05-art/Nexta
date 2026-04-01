import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

/**
 * GET /api/neon/featured/jobs
 *
 * Returns active featured job listings with enriched company data.
 * Optional ?placement= and ?limit= query params.
 *
 * Response shape matches the Railway API: { jobs: [...] }
 */
export async function GET(req: NextRequest) {
  try {
    const sql = getDb();
    const { searchParams } = new URL(req.url);
    const placement = searchParams.get('placement') || 'homepage';
    const limit = Math.min(parseInt(searchParams.get('limit') || '5', 10), 20);

    const now = new Date().toISOString();

    const jobs = await sql`
      SELECT * FROM "Job"
      WHERE "isActive" = true
        AND "isFeatured" = true
        AND ("featuredUntil" IS NULL OR "featuredUntil" >= ${now}::timestamptz)
      ORDER BY "featuredAt" DESC NULLS LAST, "createdAt" DESC
      LIMIT ${limit}
    `;

    if (jobs.length === 0) {
      return NextResponse.json({ jobs: [] });
    }

    const userIds = jobs.map((j: any) => j.userId);

    const companyProfiles = await sql`
      SELECT "userId", "companyName", "industry", "isVerified"
      FROM "CompanyProfile"
      WHERE "userId" = ANY(${userIds})
    `;

    const profileMap = new Map(companyProfiles.map((p: any) => [p.userId, p]));

    const enrichedJobs = jobs.map((job: any) => ({
      ...job,
      featured: {
        placement,
        priority: 1,
        until: job.featuredUntil,
      },
      company: profileMap.get(job.userId) || null,
    }));

    return NextResponse.json({ jobs: enrichedJobs });
  } catch (err) {
    console.error('Neon: Get featured jobs error:', err);
    return NextResponse.json({ error: 'Failed to fetch featured jobs' }, { status: 500 });
  }
}
