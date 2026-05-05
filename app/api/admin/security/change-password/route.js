import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifySession, createSession } from '@/lib/session';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { bumpAdminAuthVersion, getAdminAuthVersion } from '@/lib/adminAuthVersion';

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

    let storedHash = user.password;
    if (storedHash == null || storedHash === '') {
      storedHash = '';
    } else if (Buffer.isBuffer(storedHash)) {
      storedHash = storedHash.toString('utf8');
    } else {
      storedHash = String(storedHash);
    }

    // 2. Verify current password
    const isValid = storedHash.length > 0 && (await bcrypt.compare(currentPassword, storedHash));
    if (!isValid) {
      return NextResponse.json({ error: 'Incorrect current password' }, { status: 401 });
    }

    // 3. Hash and update new password; bump auth so other devices log out; refresh this session
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.execute('UPDATE admin_users SET password = ? WHERE id = ?', [hashedPassword, session.userId]);
    await bumpAdminAuthVersion(session.userId);
    const authVersion = await getAdminAuthVersion(session.userId);
    const { session: newToken, expiresAt } = await createSession(session.userId, session.role, authVersion);

    const res = NextResponse.json({ success: true, message: 'Password updated successfully' });
    res.cookies.set('adminToken', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: expiresAt,
      sameSite: 'lax',
      path: '/',
    });
    return res;
  } catch (error) {
    console.error('Change Password Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
