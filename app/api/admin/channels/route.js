import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifySession } from '@/lib/session';
import { cookies } from 'next/headers';
import {
  assertChannelLinkAllowed,
  assertChannelGmailUnique,
  ChannelGuardError,
} from '@/lib/channelSubmitGuards';

export async function GET() {
  const token = (await cookies()).get('adminToken')?.value;
  const session = await verifySession(token);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    let query = `
      SELECT c.*, w.name as worker_name, adm.username as creator_name, adm.role as creator_role, 
             u.sub_count, u.shorts_count, u.status, 
             DATE_FORMAT(u.created_at, '%Y-%m-%dT%H:%i:%sZ') as last_update_time
      FROM channels c 
      LEFT JOIN workers w ON c.worker_id = w.id 
      LEFT JOIN admin_users adm ON c.created_by = adm.id
      LEFT JOIN (
        SELECT d1.* FROM daily_updates d1
        JOIN (SELECT channel_id, MAX(id) as mid FROM daily_updates GROUP BY channel_id) d2
          ON d1.id = d2.mid
      ) u ON c.id = u.channel_id
    `;

    const params = [];

    // Employee can only see channels they created
    if (session.role === 'employee') {
      query += ` WHERE c.created_by = ?`;
      params.push(session.userId);
    }

    query += ` ORDER BY c.created_at DESC`;

    const [rows] = await pool.query(query, params);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching admin channels:', error);
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
    const { channel_name, channel_link, whatsapp, worker_id, open_date, sell_price, worker_cost, gmail, password } =
      await request.json();

    if (!channel_name || !channel_link) {
      return NextResponse.json({ error: 'Name and Link are required' }, { status: 400 });
    }

    const { canonUrl } = await assertChannelLinkAllowed(pool, String(channel_link).trim());
    await assertChannelGmailUnique(pool, gmail || null);

    // Calculate next reg_no
    const [regRows] = await pool.query('SELECT MAX(reg_no) as maxReg FROM channels');
    const nextReg = (regRows[0].maxReg || 1000) + 1;

    const [result] = await pool.execute(
      'INSERT INTO channels (channel_name, channel_link, whatsapp, worker_id, open_date, sell_price, worker_cost, created_by, gmail, password, reg_no) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        channel_name,
        canonUrl,
        whatsapp || null,
        worker_id || null,
        open_date || null,
        sell_price || 0,
        worker_cost || 0,
        session.userId,
        gmail || null,
        password || null,
        nextReg,
      ]
    );

    return NextResponse.json({ success: true, id: result.insertId });
  } catch (error) {
    if (error instanceof ChannelGuardError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('Error creating channel:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
