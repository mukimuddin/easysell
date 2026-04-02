import { NextResponse } from 'next/server';
import { createSession } from '@/lib/session';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const { passcode } = await request.json();
    
    // 1. Auto-Initialize the admin table if it's empty
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INT PRIMARY KEY,
        username VARCHAR(50),
        password VARCHAR(255)
      )
    `);

    const [rows] = await pool.query('SELECT password FROM admin_users WHERE id = 1');
    
    let validPasscode;
    if (rows.length === 0) {
      // First time setup - use default or .env
      validPasscode = process.env.ADMIN_PASSCODE || '123456';
      await pool.execute(
        'INSERT INTO admin_users (id, username, password) VALUES (1, "admin", ?)',
        [validPasscode]
      );
      console.log('Admin user initialized in database.');
    } else {
      validPasscode = rows[0].password;
    }

    // 2. Compare the input passcode with the database value
    if (passcode === validPasscode) {
      const { session, expiresAt } = await createSession();
      
      const response = NextResponse.json({ success: true });
      response.cookies.set('adminToken', session, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        expires: expiresAt,
        sameSite: 'lax',
        path: '/' 
      });
      return response;
    } else {
      return NextResponse.json({ error: 'Invalid Passcode' }, { status: 401 });
    }
  } catch (err) {
    console.error('Login Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
