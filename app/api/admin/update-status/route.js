import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const { id, status } = await request.json();

    if (!id || !status || !['approved', 'rejected', 'pending', 'sold'].includes(status)) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    await pool.execute('UPDATE channels SET status = ? WHERE id = ?', [status, id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
