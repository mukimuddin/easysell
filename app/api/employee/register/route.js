import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';
import { ensureEmployeeApplicationTable } from '@/lib/employeeApplications';

export async function POST(request) {
  try {
    await ensureEmployeeApplicationTable();

    const body = await request.json();
    const {
      fullName,
      phone,
      email,
      password,
      confirmPassword,
      workPreference,
      jobReference,
    } = body;

    if (!fullName || !phone || !email || !password) {
      return NextResponse.json({ error: 'প্রয়োজনীয় তথ্য পূরণ করুন।' }, { status: 400 });
    }

    if (String(password).length < 6) {
      return NextResponse.json({ error: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' }, { status: 400 });
    }

    if (confirmPassword !== undefined && confirmPassword !== password) {
      return NextResponse.json({ error: 'পাসওয়ার্ড মিলছে না।' }, { status: 400 });
    }

    const pref = ['online', 'field', 'hybrid'].includes(workPreference) ? workPreference : 'hybrid';
    const normalizedEmail = String(email).trim().toLowerCase();
    const hashedPassword = await bcrypt.hash(password, 10);

    const [pending] = await pool.query(
      `SELECT id FROM employee_applications WHERE email = ? AND status = 'pending' LIMIT 1`,
      [normalizedEmail]
    );
    if (pending.length > 0) {
      return NextResponse.json(
        { error: 'এই ইমেইল দিয়ে ইতিমধ্যে একটি আবেদন বিচারাধীন আছে।' },
        { status: 400 }
      );
    }

    const [existingEmp] = await pool.query(
      `SELECT u.id FROM admin_users u
       INNER JOIN employee_details ed ON ed.admin_id = u.id
       WHERE LOWER(TRIM(ed.email)) = ? AND u.role = 'employee'
       LIMIT 1`,
      [normalizedEmail]
    );
    if (existingEmp.length > 0) {
      return NextResponse.json(
        { error: 'এই ইমেইল দিয়ে ইতিমধ্যে কর্মী অ্যাকাউন্ট আছে। লগইন করুন।' },
        { status: 400 }
      );
    }

    await pool.execute(
      `INSERT INTO employee_applications (
        full_name, phone, email, password, work_preference, job_reference
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        String(fullName).trim(),
        String(phone).trim(),
        normalizedEmail,
        hashedPassword,
        pref,
        jobReference ? String(jobReference).trim().slice(0, 80) : null,
      ]
    );

    return NextResponse.json({
      success: true,
      message:
        'আবেদন জমা হয়েছে। অ্যাডমিন অনুমোদনের পর আপনার জন্য emp- দিয়ে শুরু হওয়া ইউজারনেম তৈরি হবে; অনুমোদনের পর সেটি ও আপনার পাসওয়ার্ড দিয়ে কর্মী লগইন পেজ থেকে প্রবেশ করুন।',
    });
  } catch (error) {
    console.error('Employee register error:', error);
    return NextResponse.json({ error: 'সার্ভার ত্রুটি। পরে চেষ্টা করুন।' }, { status: 500 });
  }
}
