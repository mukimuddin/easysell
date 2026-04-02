import { NextResponse } from 'next/server';
import { createSession } from '@/lib/session';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const { username, password } = await request.json();
    
    const validUsername = process.env.ADMIN_USERNAME || 'admin';
    
    // Check DB first for updated password
    await pool.query(`CREATE TABLE IF NOT EXISTS admin_users (id INT PRIMARY KEY, username VARCHAR(50), password VARCHAR(255))`);
    const [rows] = await pool.query(`SELECT password FROM admin_users WHERE username = 'admin'`);
    const validPassword = rows.length > 0 ? rows[0].password : (process.env.ADMIN_PASSWORD || 'ytmarket2026');

    if (username === validUsername && password === validPassword) {
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
      return NextResponse.json({ error: 'Invalid ID or Password' }, { status: 401 });
    }
  } catch (err) {
    console.error('Login Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
