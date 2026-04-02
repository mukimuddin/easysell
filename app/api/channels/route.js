import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await pool.query('SELECT * FROM channels WHERE status = "approved" ORDER BY created_at DESC');
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching approved channels:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
