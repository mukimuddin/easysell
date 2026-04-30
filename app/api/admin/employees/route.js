import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifySession } from '@/lib/session';
import { cookies } from 'next/headers';

export async function GET(request) {
  const token = (await cookies()).get('adminToken')?.value;
  const session = await verifySession(token);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const isMe = searchParams.get('me') === 'true';

  try {
    if (isMe) {
      const [rows] = await pool.query(`
        SELECT u.id as admin_id, u.username, u.role, 
               ed.full_name, ed.father_name, ed.mother_name, ed.phone, ed.email,
               ed.present_address, ed.permanent_address, ed.dob, ed.nid_no,
               ed.joining_date, ed.designation, ed.basic_salary, ed.contract_target, ed.bank_name,
               ed.account_no, ed.emergency_contact_name, ed.emergency_contact_relation,
               ed.emergency_contact_phone
        FROM admin_users u
        LEFT JOIN employee_details ed ON u.id = ed.admin_id
        WHERE u.id = ?
      `, [session.userId]);
      return NextResponse.json(rows[0] || { admin_id: session.userId, username: session.username, role: session.role });
    }

    if (session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [rows] = await pool.query(`
      SELECT u.id as admin_id, u.username, u.role,
             ed.full_name, ed.father_name, ed.mother_name, ed.phone, ed.email,
             ed.present_address, ed.permanent_address, ed.dob, ed.nid_no,
             ed.joining_date, ed.designation, ed.basic_salary, ed.contract_target, ed.bank_name,
             ed.account_no, ed.emergency_contact_name, ed.emergency_contact_relation,
             ed.emergency_contact_phone
      FROM admin_users u
      LEFT JOIN employee_details ed ON u.id = ed.admin_id
      WHERE u.role = 'employee'
      ORDER BY u.id DESC
    `);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching employees:', error);
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
    const data = await request.json();
    let { admin_id } = data;

    // Fallback to session.userId if admin_id is missing (self-update)
    if (!admin_id) {
      admin_id = session.userId;
    } else {
      admin_id = parseInt(admin_id);
    }

    // Role-based validation
    if (session.role !== 'admin' && admin_id !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const fields = [
      'full_name', 'father_name', 'mother_name', 'phone', 'email',
      'present_address', 'permanent_address', 'dob', 'nid_no',
      'joining_date', 'designation', 'basic_salary', 'contract_target', 'bank_name',
      'account_no', 'emergency_contact_name', 'emergency_contact_relation',
      'emergency_contact_phone'
    ];

    // If not admin, filter out sensitive fields that they shouldn't be able to edit
    const restrictedFields = ['joining_date', 'designation', 'basic_salary', 'contract_target'];
    
    // Construct query dynamically based on allowed fields
    const updatedFields = session.role === 'admin' 
      ? fields 
      : fields.filter(f => !restrictedFields.includes(f));

    const values = updatedFields.map(f => {
       const val = data[f];
       if (val === "" || val === undefined) return null;
       if (f === 'basic_salary') return parseFloat(val) || 0;
       if (f === 'contract_target') return parseInt(val) || 0;
       return val;
    });

    const query = `
      INSERT INTO employee_details (
        admin_id, ${updatedFields.join(', ')}
      ) VALUES (?, ${updatedFields.map(() => '?').join(', ')})
      ON DUPLICATE KEY UPDATE
      ${updatedFields.map(f => `${f} = VALUES(${f})`).join(', ')}
    `;

    const [result] = await pool.execute(query, [admin_id, ...values]);
    console.log(`[DB] Employee details updated for admin_id ${admin_id}. Affected rows: ${result.affectedRows}`);

    return NextResponse.json({ success: true, affectedRows: result.affectedRows });
  } catch (error) {
    console.error('Error saving employee details:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
