import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifySession } from '@/lib/session';
import { cookies } from 'next/headers';

export async function GET() {
  const token = (await cookies()).get('adminToken')?.value;
  const session = await verifySession(token);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM sources ORDER BY created_at DESC');
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching sources:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  const token = (await cookies()).get('adminToken')?.value;
  const session = await verifySession(token);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { caption, audio, link } = await request.json();
    
    const [result] = await pool.execute(
      'INSERT INTO sources (caption, audio, link) VALUES (?, ?, ?)',
      [caption || null, audio || null, link || null]
    );

    return NextResponse.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error('Error creating source:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
