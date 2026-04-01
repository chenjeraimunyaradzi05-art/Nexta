import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

/**
 * GET /api/neon/featured/partners
 *
 * Returns active partner organisations, ordered by tier then name.
 * Optional ?tier= query param to filter by tier.
 *
 * Response shape matches the Railway API: { partners: [...] }
 */
export async function GET(req: NextRequest) {
  try {
    const sql = getDb();
    const { searchParams } = new URL(req.url);
    const tier = searchParams.get('tier');

    let partners;
    if (tier) {
      partners = await sql`
        SELECT * FROM "Partner"
        WHERE "isActive" = true AND "tier" = ${tier}
        ORDER BY "tier" DESC, "name" ASC
      `;
    } else {
      partners = await sql`
        SELECT * FROM "Partner"
        WHERE "isActive" = true
        ORDER BY "tier" DESC, "name" ASC
      `;
    }

    return NextResponse.json({ partners });
  } catch (err) {
    console.error('Neon: List partners error:', err);
    return NextResponse.json({ error: 'Failed to fetch partners' }, { status: 500 });
  }
}
