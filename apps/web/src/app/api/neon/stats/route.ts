import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

/**
 * GET /api/neon/stats
 *
 * Returns platform-wide summary statistics for public display.
 * Cached for 5 minutes via Cache-Control.
 *
 * Response shape: { stats: { jobs, companies, mentors, courses, events, partners, users } }
 */
export async function GET() {
  try {
    const sql = getDb();

    const [jobs, companies, mentors, courses, events, partners, users] = await Promise.all([
      sql`SELECT COUNT(*)::int AS count FROM "Job" WHERE "isActive" = true`,
      sql`SELECT COUNT(*)::int AS count FROM "CompanyProfile"`,
      sql`SELECT COUNT(*)::int AS count FROM "MentorProfile" WHERE "active" = true`,
      sql`SELECT COUNT(*)::int AS count FROM "Course" WHERE "isActive" = true`,
      sql`SELECT COUNT(*)::int AS count FROM "CulturalEvent" WHERE "isPublic" = true AND "startDate" >= NOW()`,
      sql`SELECT COUNT(*)::int AS count FROM "Partner" WHERE "isActive" = true`,
      sql`SELECT COUNT(*)::int AS count FROM "User"`,
    ]);

    const stats = {
      activeJobs: jobs[0]?.count ?? 0,
      companies: companies[0]?.count ?? 0,
      activeMentors: mentors[0]?.count ?? 0,
      activeCourses: courses[0]?.count ?? 0,
      upcomingEvents: events[0]?.count ?? 0,
      activePartners: partners[0]?.count ?? 0,
      totalUsers: users[0]?.count ?? 0,
    };

    return NextResponse.json(
      { stats },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      },
    );
  } catch (err) {
    console.error('Neon: Stats error:', err);
    return NextResponse.json(
      {
        stats: {
          activeJobs: 0,
          companies: 0,
          activeMentors: 0,
          activeCourses: 0,
          upcomingEvents: 0,
          activePartners: 0,
          totalUsers: 0,
        },
      },
      { status: 200 },
    );
  }
}
