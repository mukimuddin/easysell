import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifySession } from '@/lib/session';
import { cookies } from 'next/headers';

export async function GET() {
  const token = (await cookies()).get('adminToken')?.value;
  const session = await verifySession(token);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    let query = `
      SELECT w.*, adm.username as creator_name 
      FROM workers w 
      LEFT JOIN admin_users adm ON w.created_by = adm.id
    `;
    const params = [];

    if (session.role === 'sub') {
      query += ` WHERE w.created_by = ?`;
      params.push(session.userId);
    }

    query += ` ORDER BY w.name ASC`;

    const [rows] = await pool.query(query, params);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching workers:', error);
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
    const { name, whatsapp } = await request.json();
    
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const [result] = await pool.execute(
      'INSERT INTO workers (name, whatsapp, created_by) VALUES (?, ?, ?)',
      [name, whatsapp || null, session.userId]
    );


    return NextResponse.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error('Error creating worker:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
