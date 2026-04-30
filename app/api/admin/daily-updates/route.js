import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifySession } from '@/lib/session';
import { cookies } from 'next/headers';
import { emitEvent } from '@/lib/socket';

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

    if (session.role === 'employee') {
      const [ownedChannel] = await pool.query(
        'SELECT id FROM channels WHERE id = ? AND created_by = ? LIMIT 1',
        [channel_id, session.userId]
      );
      if (ownedChannel.length === 0) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const [result] = await pool.execute(
      'INSERT INTO daily_updates (channel_id, shorts_uploaded, shorts_count, sub_count, status) VALUES (?, ?, ?, ?, ?)',
      [channel_id, shorts_uploaded ? 1 : 0, shorts_count || 0, sub_count || 0, status || 'growing']
    );

    // Notify dashboard about the update
    emitEvent('channel-updated', { channel_id });

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
    let query = 'SELECT d.* FROM daily_updates d';
    const params = [];

    if (session.role === 'employee') {
      query += ' INNER JOIN channels c ON d.channel_id = c.id WHERE c.created_by = ?';
      params.push(session.userId);
      if (channelId) {
        query += ' AND d.channel_id = ?';
        params.push(channelId);
      }
    } else if (channelId) {
      query += ' WHERE d.channel_id = ?';
      params.push(channelId);
    }

    query += ' ORDER BY d.update_date DESC LIMIT 30';

    const [rows] = await pool.query(query, params);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching daily updates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
