import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { ensureAdminBlockedColumn } from '@/lib/adminBlocked';

export async function GET() {
  try {
    await ensureAdminBlockedColumn();
    const [rows] = await pool.query(`
      SELECT u.id AS admin_id, u.username,
             COALESCE(NULLIF(TRIM(ed.full_name), ''), u.username) AS display_name
      FROM admin_users u
      LEFT JOIN employee_details ed ON ed.admin_id = u.id
      WHERE u.role = 'employee' AND COALESCE(u.is_blocked, 0) = 0
      ORDER BY COALESCE(TRIM(ed.full_name), '') ASC, u.username ASC
    `);
    return NextResponse.json(rows);
  } catch (e) {
    console.error('public/workers/dealers', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
