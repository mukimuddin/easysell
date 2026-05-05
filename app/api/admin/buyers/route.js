import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';
import { verifySession } from '@/lib/session';
import { cookies } from 'next/headers';
import { ensureBuyerTable } from '@/lib/buyers';
import {
  findEmailConflictAcrossPortal,
  findPhoneConflictAcrossPortal,
  normalizeAccountEmail,
} from '@/lib/crossRoleIdentity';

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
        b.is_blocked,
        b.credentials_unlocked,
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

export async function POST(request) {
  const token = (await cookies()).get('adminToken')?.value;
  const session = await verifySession(token);

  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await ensureBuyerTable();
    const { fullName, companyName, phone, email, password, status } = await request.json();

    if (!fullName || !phone || !email || !password) {
      return NextResponse.json({ error: 'Required fields are missing.' }, { status: 400 });
    }
    if (String(password).length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    const normalizedEmail = normalizeAccountEmail(email);

    const emailHit = await findEmailConflictAcrossPortal(normalizedEmail);
    if (emailHit) {
      return NextResponse.json({ error: emailHit.message }, { status: 400 });
    }
    const phoneHit = await findPhoneConflictAcrossPortal(String(phone).trim());
    if (phoneHit) {
      return NextResponse.json({ error: phoneHit.message }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(String(password), 10);
    const buyerStatus = ['approved', 'pending', 'rejected'].includes(status) ? status : 'approved';

    await pool.execute(
      `INSERT INTO buyer_accounts (full_name, company_name, phone, email, password, status, reviewed_by, reviewed_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        String(fullName).trim(),
        companyName ? String(companyName).trim() : null,
        String(phone).trim(),
        normalizedEmail,
        hashedPassword,
        buyerStatus,
        session.userId,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'This email is already registered.' }, { status: 400 });
    }
    console.error('Create buyer (admin) error:', error);
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
    const { id, status, is_blocked, credentials_unlocked } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const updates = [];
    const params = [];

    if (status && ['approved', 'rejected', 'pending'].includes(status)) {
      updates.push('status = ?');
      params.push(status);
    }
    if (typeof is_blocked !== 'undefined') {
      updates.push('is_blocked = ?');
      params.push(is_blocked ? 1 : 0);
    }
    if (typeof credentials_unlocked !== 'undefined') {
      updates.push('credentials_unlocked = ?');
      params.push(credentials_unlocked ? 1 : 0);
    }

    if (updates.length > 0) {
      updates.push('reviewed_by = ?');
      params.push(session.userId);
      updates.push('reviewed_at = NOW()');

      params.push(id);

      await pool.execute(
        `UPDATE buyer_accounts SET ${updates.join(', ')} WHERE id = ?`,
        params
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update buyer status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
