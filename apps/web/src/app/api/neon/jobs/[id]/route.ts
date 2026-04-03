import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

/**
 * GET /api/neon/jobs/[id]
 *
 * Single job detail with company profile.
 * Response shape: { job: { ...fields, company: {...} | null } }
 */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const sql = getDb();

    const rows = await sql`
      SELECT j.*,
             cp."companyName", cp."industry"  AS "companyIndustry",
             cp."isVerified"  AS "companyVerified",
             cp."logo"        AS "companyLogo",
             cp."description" AS "companyDescription",
             cp."website"     AS "companyWebsite",
             cp."city"        AS "companyCity",
             cp."state"       AS "companyState",
             cp."rapCertificationLevel"
      FROM "Job" j
      LEFT JOIN "CompanyProfile" cp ON cp."userId" = j."userId"
      WHERE j."id" = ${id}
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const row = rows[0] as any;

    const job = {
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
      isFeatured: row.isFeatured,
      featuredAt: row.featuredAt,
      featuredUntil: row.featuredUntil,
      viewCount: row.viewCount,
      postedAt: row.postedAt,
      expiresAt: row.expiresAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      company: row.companyName
        ? {
            companyName: row.companyName,
            industry: row.companyIndustry,
            isVerified: row.companyVerified,
            logo: row.companyLogo,
            description: row.companyDescription,
            website: row.companyWebsite,
            city: row.companyCity,
            state: row.companyState,
            location: [row.companyCity, row.companyState].filter(Boolean).join(', '),
            rapCertificationLevel: row.rapCertificationLevel,
          }
        : null,
    };

    return NextResponse.json({ job });
  } catch (err) {
    console.error('Neon: Job detail error:', err);
    return NextResponse.json({ error: 'Failed to load job' }, { status: 500 });
  }
}
