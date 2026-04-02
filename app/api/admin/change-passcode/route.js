import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const { currentPasscode, newPasscode } = await request.json();

    if (!currentPasscode || !newPasscode) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Verify current passcode from DB
    const [rows] = await pool.query('SELECT password FROM admin_users WHERE id = 1');
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Admin user not initialized' }, { status: 404 });
    }

    if (rows[0].password !== currentPasscode) {
      return NextResponse.json({ error: 'Current passcode is incorrect' }, { status: 401 });
    }

    // 2. Update to new passcode
    await pool.execute(
      'UPDATE admin_users SET password = ? WHERE id = 1',
      [newPasscode]
    );

    return NextResponse.json({ success: true, message: 'Passcode changed successfully' });
  } catch (error) {
    console.error('Change Passcode Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
