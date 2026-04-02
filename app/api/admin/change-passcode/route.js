import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';

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

    const hashedCurrent = rows[0].password;
    
    // Check if it's already a bcrypt hash (starts with $2a$ or $2b$)
    let isValid = false;
    if (hashedCurrent.startsWith('$2')) {
      isValid = await bcrypt.compare(currentPasscode, hashedCurrent);
    } else {
      // Legacy plain-text support
      isValid = (currentPasscode === hashedCurrent);
    }

    if (!isValid) {
      return NextResponse.json({ error: 'Current passcode is incorrect' }, { status: 401 });
    }

    // 2. Hash and update to new passcode
    const hashedNew = bcrypt.hashSync(newPasscode, 10);
    await pool.execute(
      'UPDATE admin_users SET password = ? WHERE id = 1',
      [hashedNew]
    );

    return NextResponse.json({ success: true, message: 'Passcode changed and hashed successfully' });
  } catch (error) {
    console.error('Change Passcode Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
