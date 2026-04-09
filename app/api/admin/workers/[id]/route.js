import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifySession } from '@/lib/session';
import { cookies } from 'next/headers';

export async function DELETE(request, context) {
  const { id } = await context.params;
  const token = (await cookies()).get('adminToken')?.value;
  const session = await verifySession(token);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    if (session.role === 'sub') {
      const [rows] = await pool.query('SELECT created_by FROM workers WHERE id = ?', [id]);
      if (rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      if (rows[0].created_by !== session.userId) return NextResponse.json({ error: 'Unauthorized delete' }, { status: 403 });
    }

    await pool.execute('DELETE FROM workers WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting worker:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request, context) {
  const { id } = await context.params;
  const token = (await cookies()).get('adminToken')?.value;
  const session = await verifySession(token);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { name, whatsapp } = await request.json();
    if (session.role === 'sub') {
      const [rows] = await pool.query('SELECT created_by FROM workers WHERE id = ?', [id]);
      if (rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      if (rows[0].created_by !== session.userId) return NextResponse.json({ error: 'Unauthorized edit' }, { status: 403 });
    }

    let query = 'UPDATE workers SET name = ?';
    let params = [name];
    if (whatsapp !== undefined) {
      query += ', whatsapp = ?';
      params.push(whatsapp);
    }
    query += ' WHERE id = ?';
    params.push(id);
    await pool.execute(query, params);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating worker:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
