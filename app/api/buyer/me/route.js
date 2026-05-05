import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/session';
import { cookies } from 'next/headers';
import pool from '@/lib/db';
import { ensureBuyerTable } from '@/lib/buyers';

export async function GET() {
  const token = (await cookies()).get('buyerToken')?.value;
  const session = await verifySession(token);

  if (!session || session.role !== 'buyer') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await ensureBuyerTable();
    const [rows] = await pool.query(
      `SELECT id, full_name, company_name, email, phone, status, is_blocked, credentials_unlocked
       FROM buyer_accounts
       WHERE id = ?
       LIMIT 1`,
      [session.userId]
    );

    if (!rows.length) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    }

    const buyer = rows[0];

    if (buyer.is_blocked === 1) {
      return NextResponse.json({ error: 'Blocked by admin' }, { status: 403 });
    }

    return NextResponse.json(buyer);
  } catch (error) {
    console.error('Buyer profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
