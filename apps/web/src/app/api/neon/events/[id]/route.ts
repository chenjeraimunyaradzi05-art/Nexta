import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

/**
 * GET /api/neon/events/[id]
 *
 * Returns a single cultural event with attendee count.
 */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const sql = getDb();

    const [event] = await sql`
      SELECT
        e.*,
        u."name" AS "organizerName",
        u."avatarUrl" AS "organizerAvatar"
      FROM "CulturalEvent" e
      LEFT JOIN "User" u ON u."id" = e."organizerId"
      WHERE e."id" = ${id} AND e."isPublic" = true
      LIMIT 1
    `;

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ event });
  } catch (err) {
    console.error('Neon: Event detail error:', err);
    return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 });
  }
}
