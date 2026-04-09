import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifySession } from '@/lib/session';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  const token = (await cookies()).get('adminToken')?.value;
  const session = await verifySession(token);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Missing current or new password' }, { status: 400 });
    }

    // 1. Fetch user to verify current password
    const [users] = await pool.query('SELECT password FROM admin_users WHERE id = ?', [session.userId]);
    if (users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = users[0];

    // 2. Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Incorrect current password' }, { status: 401 });
    }

    // 3. Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.execute('UPDATE admin_users SET password = ? WHERE id = ?', [hashedPassword, session.userId]);

    return NextResponse.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change Password Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
