import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Missing listing ID' }, { status: 400 });
    }

    const [result] = await pool.execute(
      'DELETE FROM channels WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Listing deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Admin Delete Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
