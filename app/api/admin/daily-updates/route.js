import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifySession } from '@/lib/session';
import { cookies } from 'next/headers';

export async function POST(request) {
  const token = (await cookies()).get('adminToken')?.value;
  const session = await verifySession(token);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { channel_id, shorts_uploaded, shorts_count, sub_count, status } = await request.json();
    
    if (!channel_id) {
      return NextResponse.json({ error: 'Channel ID is required' }, { status: 400 });
    }

    const [result] = await pool.execute(
      'INSERT INTO daily_updates (channel_id, shorts_uploaded, shorts_count, sub_count, status) VALUES (?, ?, ?, ?, ?)',
      [channel_id, shorts_uploaded ? 1 : 0, shorts_count || 0, sub_count || 0, status || 'growing']
    );

    return NextResponse.json({ success: true, id: result.insertId });
  } catch (error) {

    console.error('Error adding daily update:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request) {
  const token = (await cookies()).get('adminToken')?.value;
  const session = await verifySession(token);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const channelId = searchParams.get('channel_id');

  try {
    let query = 'SELECT * FROM daily_updates';
    const params = [];
    
    if (channelId) {
      query += ' WHERE channel_id = ?';
      params.push(channelId);
    }
    
    query += ' ORDER BY update_date DESC LIMIT 30';

    const [rows] = await pool.query(query, params);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching daily updates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
