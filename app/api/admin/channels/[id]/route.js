import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifySession } from '@/lib/session';
import { cookies } from 'next/headers';
import { emitEvent } from '@/lib/socket';

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

    // ... (rest of the fields logic)

    if (data.is_selected !== undefined) {
      fields.push('is_selected = ?');
      params.push(data.is_selected ? 1 : 0);
    }
    if (data.is_sold !== undefined) {
      fields.push('is_sold = ?');
      params.push(data.is_sold ? 1 : 0);
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
    if (data.channel_link !== undefined) {
      fields.push('channel_link = ?');
      params.push(data.channel_link);
    }
    if (data.worker_id !== undefined) {
      fields.push('worker_id = ?');
      params.push(data.worker_id || null);
    }
    if (data.open_date !== undefined) {
      fields.push('open_date = ?');
      params.push(data.open_date || null);
    }
    if (data.gmail !== undefined) {
      fields.push('gmail = ?');
      params.push(data.gmail || null);
    }
    if (data.password !== undefined) {
      fields.push('password = ?');
      params.push(data.password || null);
    }


    if (fields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    // Ownership check for Sub-Admins


    params.push(id);
    await pool.execute(
      `UPDATE channels SET ${fields.join(', ')} WHERE id = ?`,
      params
    );

    emitEvent('channel-updated', { id });

    return NextResponse.json({ success: true });
  } catch (error) {
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
    // Deleted ownership check for sub


    await pool.execute('DELETE FROM channels WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting channel:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

