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


    const isAdmin = session.role === 'admin';
    const query = isAdmin
      ? 'DELETE FROM workers WHERE id = ?'
      : 'DELETE FROM workers WHERE id = ? AND created_by = ?';
    const params = isAdmin ? [id] : [id, session.userId];
    const [result] = await pool.execute(query, params);
    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Not found or forbidden' }, { status: 404 });
    }
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


    let query = 'UPDATE workers SET name = ?';
    let params = [name];
    if (whatsapp !== undefined) {
      query += ', whatsapp = ?';
      params.push(whatsapp);
    }
    const isAdmin = session.role === 'admin';
    query += isAdmin ? ' WHERE id = ?' : ' WHERE id = ? AND created_by = ?';
    params.push(id);
    if (!isAdmin) {
      params.push(session.userId);
    }
    const [result] = await pool.execute(query, params);
    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Not found or forbidden' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating worker:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
