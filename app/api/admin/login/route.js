import { NextResponse } from 'next/server';
import { createSession } from '@/lib/session';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
  
  try {
    const { username, password } = await request.json();
    
    // 1. Check Rate Limiting
    const [attempts] = await pool.query(
      'SELECT attempts, last_attempt FROM login_attempts WHERE ip = ?',
      [ip]
    );

    const MAX_ATTEMPTS = 5;
    const LOCKOUT_MINUTES = 15;

    if (attempts.length > 0) {
      const { attempts: count, last_attempt } = attempts[0];
      const diff = (new Date() - new Date(last_attempt)) / 1000 / 60;
      
      if (count >= MAX_ATTEMPTS && diff < LOCKOUT_MINUTES) {
        return NextResponse.json({ 
          error: `Too many attempts. Please try again in ${Math.ceil(LOCKOUT_MINUTES - diff)} minutes.` 
        }, { status: 429 });
      }

      if (diff >= LOCKOUT_MINUTES) {
        await pool.execute('DELETE FROM login_attempts WHERE ip = ?', [ip]);
      }
    }

    // 2. Find User
    const [users] = await pool.query('SELECT * FROM admin_users WHERE username = ?', [username]);
    
    if (users.length === 0) {
      return NextResponse.json({ error: 'Invalid Username or Password' }, { status: 401 });
    }

    const user = users[0];

    // 3. Verify Password
    const isValid = await bcrypt.compare(password, user.password);

    if (isValid) {
      // Success! Clear attempts
      await pool.execute('DELETE FROM login_attempts WHERE ip = ?', [ip]);

      const { session, expiresAt } = await createSession(user.id, user.role);
      const response = NextResponse.json({ success: true, role: user.role });
      
      response.cookies.set('adminToken', session, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        expires: expiresAt,
        sameSite: 'lax',
        path: '/' 
      });

      return response;
    } else {
      // Increment attempts
      if (attempts.length > 0) {
        await pool.execute('UPDATE login_attempts SET attempts = attempts + 1 WHERE ip = ?', [ip]);
      } else {
        await pool.execute('INSERT INTO login_attempts (ip, attempts) VALUES (?, 1)', [ip]);
      }
      return NextResponse.json({ error: 'Invalid Username or Password' }, { status: 401 });
    }
  } catch (err) {
    console.error('Login Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

