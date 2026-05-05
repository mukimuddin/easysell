import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifySession } from '@/lib/session';
import { cookies } from 'next/headers';
import { emitEvent } from '@/lib/socket';
import {
  assertChannelLinkAllowed,
  assertChannelGmailUnique,
  ChannelGuardError,
} from '@/lib/channelSubmitGuards';

export async function PATCH(request, context) {
  const { id } = await context.params;
  const token = (await cookies()).get('adminToken')?.value;
  const session = await verifySession(token);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();
    const fields = [];
    const params = [];
    const channelIdNum = Number(id);

    let canonLinkReplace;
    if (data.channel_link !== undefined) {
      const { canonUrl } = await assertChannelLinkAllowed(pool, String(data.channel_link).trim(), {
        excludeChannelId: channelIdNum,
      });
      canonLinkReplace = canonUrl;
      fields.push('channel_link = ?');
      params.push(canonLinkReplace);
    }

    if (data.gmail !== undefined) {
      await assertChannelGmailUnique(pool, data.gmail, { excludeChannelId: channelIdNum });
      fields.push('gmail = ?');
      params.push(data.gmail || null);
    }

    if (data.is_selected !== undefined) {
      fields.push('is_selected = ?');
      params.push(data.is_selected ? 1 : 0);
    }
    if (data.is_sold !== undefined) {
      fields.push('is_sold = ?');
      params.push(data.is_sold ? 1 : 0);
      fields.push('sold_at = ?');
      params.push(data.is_sold ? new Date() : null);
    }
    if (data.sell_price !== undefined) {
      fields.push('sell_price = ?');
      params.push(data.sell_price);
    }
    if (data.worker_cost !== undefined) {
      fields.push('worker_cost = ?');
      params.push(data.worker_cost);
    }
    if (data.channel_name !== undefined) {
      fields.push('channel_name = ?');
      params.push(data.channel_name);
    }
    if (data.worker_id !== undefined) {
      fields.push('worker_id = ?');
      params.push(data.worker_id || null);
    }
    if (data.open_date !== undefined) {
      fields.push('open_date = ?');
      params.push(data.open_date || null);
    }
    if (data.password !== undefined) {
      fields.push('password = ?');
      params.push(data.password || null);
    }

    if (fields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    params.push(id);
    const isAdmin = session.role === 'admin';
    const whereClause = isAdmin ? 'id = ?' : 'id = ? AND created_by = ?';
    if (!isAdmin) {
      params.push(session.userId);
    }
    const [result] = await pool.execute(`UPDATE channels SET ${fields.join(', ')} WHERE ${whereClause}`, params);
    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Not found or forbidden' }, { status: 404 });
    }

    emitEvent('channel-updated', { id });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ChannelGuardError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('Error updating channel:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  const { id } = await context.params;
  const token = (await cookies()).get('adminToken')?.value;
  const session = await verifySession(token);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const isAdmin = session.role === 'admin';
    const query = isAdmin
      ? 'DELETE FROM channels WHERE id = ?'
      : 'DELETE FROM channels WHERE id = ? AND created_by = ?';
    const params = isAdmin ? [id] : [id, session.userId];
    const [result] = await pool.execute(query, params);
    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Not found or forbidden' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting channel:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
