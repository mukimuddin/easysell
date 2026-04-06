import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifySession } from '@/lib/session';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

export async function GET() {
  const token = (await cookies()).get('adminToken')?.value;
  const session = await verifySession(token);
  
  if (!session || session.role !== 'main') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [rows] = await pool.query('SELECT id, username, role FROM admin_users ORDER BY id ASC');
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching admins:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  const token = (await cookies()).get('adminToken')?.value;
  const session = await verifySession(token);
  
  if (!session || session.role !== 'main') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { username, password, role } = await request.json();
    
    if (!username || !password || !role) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Manual ID increment since some DBs lack AUTO_INCREMENT support on MODIFY
    const [maxIdRows] = await pool.query('SELECT MAX(id) as maxId FROM admin_users');
    const newId = (maxIdRows[0].maxId || 0) + 1;

    const [result] = await pool.execute(
      'INSERT INTO admin_users (id, username, password, role) VALUES (?, ?, ?, ?)',
      [newId, username, hashedPassword, role]
    );

    return NextResponse.json({ success: true, id: newId });

  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
    }
    console.error('Error creating admin:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  const token = (await cookies()).get('adminToken')?.value;
  const session = await verifySession(token);
  
  if (!session || session.role !== 'main') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    if (parseInt(id) === session.userId) {
      return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });
    }

    await pool.execute('DELETE FROM admin_users WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting admin:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
