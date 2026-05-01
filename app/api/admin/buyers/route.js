import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifySession } from '@/lib/session';
import { cookies } from 'next/headers';
import { ensureBuyerTable } from '@/lib/buyers';

export async function GET() {
  const token = (await cookies()).get('adminToken')?.value;
  const session = await verifySession(token);

  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await ensureBuyerTable();
    const [rows] = await pool.query(
      `SELECT
        b.id,
        b.full_name,
        b.company_name,
        b.phone,
        b.email,
        b.status,
        b.created_at,
        b.reviewed_at,
        reviewer.username AS reviewed_by_name
      FROM buyer_accounts b
      LEFT JOIN admin_users reviewer ON reviewer.id = b.reviewed_by
      ORDER BY
        CASE b.status
          WHEN 'pending' THEN 0
          WHEN 'approved' THEN 1
          ELSE 2
        END,
        b.created_at DESC`
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Fetch buyers error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request) {
  const token = (await cookies()).get('adminToken')?.value;
  const session = await verifySession(token);

  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await ensureBuyerTable();
    const { id, status } = await request.json();
    if (!id || !['approved', 'rejected', 'pending'].includes(status)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    await pool.execute(
      `UPDATE buyer_accounts
       SET status = ?, reviewed_by = ?, reviewed_at = NOW()
       WHERE id = ?`,
      [status, session.userId, id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update buyer status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
