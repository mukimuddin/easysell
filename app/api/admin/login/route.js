import { NextResponse } from 'next/server';
import { createSession } from '@/lib/session';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
  
  try {
    const { passcode } = await request.json();
    
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

      // Reset attempts if lockout period passed
      if (diff >= LOCKOUT_MINUTES) {
        await pool.execute('DELETE FROM login_attempts WHERE ip = ?', [ip]);
      }
    }

    // 2. Get Passcode from DB
    const [rows] = await pool.query('SELECT password FROM admin_users WHERE id = 1');
    
    // Auto-init with bcrypt formatted 123456 if empty
    if (rows.length === 0) {
      const hashedDefault = bcrypt.hashSync('123456', 10);
      await pool.execute('INSERT INTO admin_users (id, username, password) VALUES (1, "admin", ?)', [hashedDefault]);
      return NextResponse.json({ error: 'System Initialized. Please try again with default 123456.' }, { status: 401 });
    }

    const hashedPasscode = rows[0].password;

    // 3. Verify Passcode
    // Check if it's already a bcrypt hash (starts with $2a$ or $2b$)
    let isValid = false;
    if (hashedPasscode.startsWith('$2')) {
      isValid = await bcrypt.compare(passcode, hashedPasscode);
    } else {
      // Legacy plain-text support for first-time migration
      isValid = (passcode === hashedPasscode);
      if (isValid) {
        // Automatically upgrade to bcrypt
        const newHash = bcrypt.hashSync(passcode, 10);
        await pool.execute('UPDATE admin_users SET password = ? WHERE id = 1', [newHash]);
      }
    }

    if (isValid) {
      // Success! Clear attempts
      await pool.execute('DELETE FROM login_attempts WHERE ip = ?', [ip]);

      const { session, expiresAt } = await createSession();
      const response = NextResponse.json({ success: true });
      response.cookies.set('adminToken', session, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        expires: expiresAt,
        sameSite: 'strict',
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
      return NextResponse.json({ error: 'Invalid Passcode' }, { status: 401 });
    }
  } catch (err) {
    console.error('Login Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
