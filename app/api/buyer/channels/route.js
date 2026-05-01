import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/session';
import { cookies } from 'next/headers';
import pool from '@/lib/db';

export async function GET() {
  const token = (await cookies()).get('buyerToken')?.value;
  const session = await verifySession(token);

  if (!session || session.role !== 'buyer') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [rows] = await pool.query(
      `SELECT
        c.id,
        c.channel_name,
        c.channel_link,
        c.open_date,
        c.created_at,
        w.name AS worker_name
      FROM channels c
      LEFT JOIN workers w ON c.worker_id = w.id
      WHERE c.is_selected = 1 AND (c.is_sold = 0 OR c.is_sold IS NULL)
      ORDER BY c.created_at DESC`
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Buyer channels error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
