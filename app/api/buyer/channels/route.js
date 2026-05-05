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
    const [buyers] = await pool.query('SELECT credentials_unlocked FROM buyer_accounts WHERE id = ?', [session.userId]);
    const isUnlocked = buyers[0]?.credentials_unlocked === 1;

    let selectCols = `
        c.id,
        c.channel_name,
        c.channel_link,
        c.open_date,
        c.created_at,
        w.name AS worker_name,
        u.sub_count,
        c.reg_no
    `;

    if (isUnlocked) {
      selectCols += `, c.gmail, c.password`;
    }

    const [rows] = await pool.query(
      `SELECT ${selectCols}
      FROM channels c
      LEFT JOIN workers w ON c.worker_id = w.id
      LEFT JOIN (
        SELECT d1.* FROM daily_updates d1
        JOIN (SELECT channel_id, MAX(id) as mid FROM daily_updates GROUP BY channel_id) d2
          ON d1.id = d2.mid
      ) u ON c.id = u.channel_id
      WHERE c.is_selected = 1 AND (c.is_sold = 0 OR c.is_sold IS NULL)
      ORDER BY c.created_at DESC`
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Buyer channels error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
