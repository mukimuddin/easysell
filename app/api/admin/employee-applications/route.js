import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifySession } from '@/lib/session';
import { cookies } from 'next/headers';
import { ensureEmployeeApplicationTable } from '@/lib/employeeApplications';

function generateEmpUsername() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let suffix = '';
  for (let i = 0; i < 6; i += 1) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `emp-${suffix}`;
}

export async function GET() {
  const token = (await cookies()).get('adminToken')?.value;
  const session = await verifySession(token);

  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await ensureEmployeeApplicationTable();
    const [rows] = await pool.query(
      `SELECT
        a.id,
        a.full_name,
        a.phone,
        a.email,
        a.work_preference,
        a.job_reference,
        a.status,
        a.created_at,
        a.reviewed_at,
        a.assigned_username,
        a.created_admin_id,
        reviewer.username AS reviewed_by_name
      FROM employee_applications a
      LEFT JOIN admin_users reviewer ON reviewer.id = a.reviewed_by
      ORDER BY
        CASE a.status
          WHEN 'pending' THEN 0
          WHEN 'approved' THEN 1
          ELSE 2
        END,
        a.created_at DESC`
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Fetch employee applications error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request) {
  const token = (await cookies()).get('adminToken')?.value;
  const session = await verifySession(token);

  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await ensureEmployeeApplicationTable();

  const body = await request.json();
  const { id, status } = body;

  if (!id || !['approved', 'rejected'].includes(status)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [apps] = await conn.query(
      `SELECT * FROM employee_applications WHERE id = ? FOR UPDATE`,
      [id]
    );

    if (apps.length === 0) {
      await conn.rollback();
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const app = apps[0];

    if (app.status !== 'pending') {
      await conn.rollback();
      return NextResponse.json({ error: 'Application already processed' }, { status: 400 });
    }

    if (status === 'rejected') {
      await conn.execute(
        `UPDATE employee_applications
         SET status = 'rejected', reviewed_by = ?, reviewed_at = NOW()
         WHERE id = ?`,
        [session.userId, id]
      );
      await conn.commit();
      return NextResponse.json({ success: true });
    }

    let username = generateEmpUsername();
    for (let attempt = 0; attempt < 15; attempt += 1) {
      const [u] = await conn.query('SELECT id FROM admin_users WHERE username = ? LIMIT 1', [username]);
      if (u.length === 0) break;
      username = generateEmpUsername();
    }

    const [dup] = await conn.query(
      `SELECT u.id FROM admin_users u
       INNER JOIN employee_details ed ON ed.admin_id = u.id
       WHERE LOWER(TRIM(ed.email)) = ? LIMIT 1`,
      [String(app.email).toLowerCase()]
    );
    if (dup.length > 0) {
      await conn.rollback();
      return NextResponse.json(
        { error: 'This email already exists as an employee profile.' },
        { status: 400 }
      );
    }

    const [maxIdRows] = await conn.query(
      'SELECT COALESCE(MAX(id), 0) AS maxId FROM admin_users'
    );
    const adminId = (Number(maxIdRows[0]?.maxId) || 0) + 1;

    await conn.execute(
      `INSERT INTO admin_users (id, username, password, role) VALUES (?, ?, ?, ?)`,
      [adminId, username, app.password, 'employee']
    );

    await conn.execute(
      `INSERT INTO employee_details (admin_id, full_name, phone, email)
       VALUES (?, ?, ?, ?)`,
      [adminId, app.full_name, app.phone, app.email]
    );

    await conn.execute(
      `UPDATE employee_applications
       SET status = 'approved',
           reviewed_by = ?,
           reviewed_at = NOW(),
           created_admin_id = ?,
           assigned_username = ?
       WHERE id = ?`,
      [session.userId, adminId, username, id]
    );

    await conn.commit();

    return NextResponse.json({
      success: true,
      assignedUsername: username,
      message: `Employee created. Username: ${username}`,
    });
  } catch (error) {
    await conn.rollback();
    console.error('Approve employee application error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    conn.release();
  }
}
