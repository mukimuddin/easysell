import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Both fields are required' }, { status: 400 });
    }

    // Ensure table exists
    await pool.query(`CREATE TABLE IF NOT EXISTS admin_users (id INT PRIMARY KEY, username VARCHAR(50), password VARCHAR(255))`);

    // Fetch current stored password
    const [rows] = await pool.query(`SELECT password FROM admin_users WHERE username = 'admin'`);
    const validPassword = rows.length > 0 ? rows[0].password : (process.env.ADMIN_PASSWORD || 'ytmarket2026');

    if (currentPassword !== validPassword) {
      return NextResponse.json({ error: 'Incorrect current password' }, { status: 401 });
    }

    // Update or insert
    if (rows.length === 0) {
      await pool.query(`INSERT INTO admin_users (id, username, password) VALUES (1, 'admin', ?)`, [newPassword]);
    } else {
      await pool.query(`UPDATE admin_users SET password = ? WHERE username = 'admin'`, [newPassword]);
    }

    return NextResponse.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
