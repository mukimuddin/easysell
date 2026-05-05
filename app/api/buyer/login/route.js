import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';
import { createSession } from '@/lib/session';
import { ensureBuyerTable } from '@/lib/buyers';

export async function POST(request) {
  try {
    await ensureBuyerTable();

    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const [buyers] = await pool.query(
      'SELECT id, password, status, is_blocked FROM buyer_accounts WHERE email = ? LIMIT 1',
      [normalizedEmail]
    );

    if (!buyers.length) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const buyer = buyers[0];
    const isValid = await bcrypt.compare(password, buyer.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    if (buyer.is_blocked === 1) {
      return NextResponse.json({ error: 'Your account has been blocked by an admin.' }, { status: 403 });
    }

    if (buyer.status !== 'approved') {
      const statusText =
        buyer.status === 'rejected'
          ? 'Your registration was rejected. Contact admin.'
          : 'Your account is still pending approval.';
      return NextResponse.json({ error: statusText }, { status: 403 });
    }

    const { session, expiresAt } = await createSession(buyer.id, 'buyer');
    const response = NextResponse.json({ success: true });
    response.cookies.set('buyerToken', session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: expiresAt,
      sameSite: 'lax',
      path: '/',
    });
    return response;
  } catch (error) {
    console.error('Buyer login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
