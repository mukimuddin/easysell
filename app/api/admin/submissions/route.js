import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await pool.query('SELECT * FROM channels ORDER BY created_at DESC');
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
