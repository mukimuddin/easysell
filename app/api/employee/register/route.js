import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';
import { ensureEmployeeApplicationTable } from '@/lib/employeeApplications';
import {
  findEmailConflictAcrossPortal,
  findPhoneConflictAcrossPortal,
  normalizeAccountEmail,
} from '@/lib/crossRoleIdentity';

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
    const normalizedEmail = normalizeAccountEmail(email);
    const hashedPassword = await bcrypt.hash(password, 10);

    const emailHit = await findEmailConflictAcrossPortal(normalizedEmail);
    if (emailHit) {
      return NextResponse.json({ error: emailHit.message }, { status: 400 });
    }

    const phoneHit = await findPhoneConflictAcrossPortal(String(phone).trim());
    if (phoneHit) {
      return NextResponse.json({ error: phoneHit.message }, { status: 400 });
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
