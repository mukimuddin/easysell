import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';
import { ensureBuyerTable } from '@/lib/buyers';
import {
  findEmailConflictAcrossPortal,
  findPhoneConflictAcrossPortal,
  normalizeAccountEmail,
} from '@/lib/crossRoleIdentity';

export async function POST(request) {
  try {
    await ensureBuyerTable();

    const { fullName, companyName, phone, email, password } = await request.json();

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

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.execute(
      `INSERT INTO buyer_accounts (full_name, company_name, phone, email, password)
       VALUES (?, ?, ?, ?, ?)`,
      [String(fullName).trim(), companyName ? String(companyName).trim() : null, String(phone).trim(), normalizedEmail, hashedPassword]
    );

    return NextResponse.json({
      success: true,
      message: 'Registration submitted. Wait for admin approval.',
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'This email is already registered.' }, { status: 400 });
    }
    console.error('Buyer register error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
