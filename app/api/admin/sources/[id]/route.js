import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifySession } from '@/lib/session';
import { cookies } from 'next/headers';

export async function DELETE(request, { params }) {
  const token = (await cookies()).get('adminToken')?.value;
  const session = await verifySession(token);
  if (!session || session.role !== 'main') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    await pool.execute('DELETE FROM sources WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting source:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  const { id } = await params;
  const token = (await cookies()).get('adminToken')?.value;
  const session = await verifySession(token);
  if (!session || session.role !== 'main') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { caption, audio, link } = await request.json();
    await pool.execute(
      'UPDATE sources SET caption = ?, audio = ?, link = ? WHERE id = ?',
      [caption || null, audio || null, link || null, id]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating source:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
