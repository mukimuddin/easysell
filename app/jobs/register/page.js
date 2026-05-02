'use client';

import { useState } from 'react';
import Link from 'next/link';

const JOB_REF = 'channel-sourcing-field-ytm';

export default function JobRegisterPage() {
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    workPreference: 'hybrid',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await fetch('/api/employee/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.fullName,
          phone: form.phone,
          email: form.email,
          password: form.password,
          confirmPassword: form.confirmPassword,
          workPreference: form.workPreference,
          jobReference: JOB_REF,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'জমা দিতে ব্যর্থ');
        return;
      }
      setSuccess(data.message || 'আবেদন গ্রহণ হয়েছে।');
      setForm({
        fullName: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
        workPreference: 'hybrid',
      });
    } catch (err) {
      setError('সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="common-container public-page-fill-below-navbar" style={{ paddingTop: '1.25rem', paddingBottom: '2rem', maxWidth: '520px' }}>
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--muted-foreground)', fontWeight: 700, letterSpacing: '0.06em' }}>
          Job Circular · Online আবেদন
        </div>
        <h1 style={{ fontSize: '1.25rem', marginTop: '0.35rem', marginBottom: '0.25rem' }}>
          চ্যানেল সোর্সিং এক্সিকিউটিভ — নিবন্ধন
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--muted-foreground)', margin: 0 }}>
          নিচের ফর্ম পূরণ করুন। অ্যাডমিন অনুমোদনের পর আপনার <strong style={{ color: 'var(--foreground)' }}>emp-</strong> ইউজারনেম তৈরি হবে এবং নিবন্ধনের সময় যে পাসওয়ার্ড দিয়েছেন সেটা দিয়ে{' '}
          <Link href="/employee/login" style={{ color: 'var(--foreground)', fontWeight: 600 }}>
            কর্মী লগইন
          </Link>{' '}
          করতে পারবেন।
        </p>
      </div>

      <div style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '1rem 1.1rem', background: 'var(--card)' }}>
        {error ? (
          <div style={{ marginBottom: '0.75rem', color: '#b91c1c', fontSize: '13px', padding: '0.5rem', background: '#fef2f2', borderRadius: '6px' }}>
            {error}
          </div>
        ) : null}
        {success ? (
          <div style={{ marginBottom: '0.75rem', color: '#166534', fontSize: '13px', padding: '0.5rem', background: '#f0fdf4', borderRadius: '6px' }}>
            {success}
          </div>
        ) : null}

        <form onSubmit={onSubmit}>
          <div className="compact-form-group">
            <label style={{ fontSize: '11px', fontWeight: 700 }}>পূর্ণ নাম</label>
            <input className="compact-form-control" required value={form.fullName} onChange={(e) => onChange('fullName', e.target.value)} />
          </div>
          <div className="compact-form-group">
            <label style={{ fontSize: '11px', fontWeight: 700 }}>মোবাইল</label>
            <input className="compact-form-control" required value={form.phone} onChange={(e) => onChange('phone', e.target.value)} placeholder="01XXXXXXXXX" />
          </div>
          <div className="compact-form-group">
            <label style={{ fontSize: '11px', fontWeight: 700 }}>ইমেইল</label>
            <input type="email" className="compact-form-control" required value={form.email} onChange={(e) => onChange('email', e.target.value)} />
          </div>
          <div className="compact-form-group">
            <label style={{ fontSize: '11px', fontWeight: 700 }}>কাজের পছন্দ</label>
            <select className="compact-form-control" value={form.workPreference} onChange={(e) => onChange('workPreference', e.target.value)}>
              <option value="online">Online Mode</option>
              <option value="field">Offline Field Mode</option>
              <option value="hybrid">Hybrid (উভয়)</option>
            </select>
          </div>
          <div className="compact-form-group">
            <label style={{ fontSize: '11px', fontWeight: 700 }}>পাসওয়ার্ড</label>
            <input type="password" className="compact-form-control" required value={form.password} onChange={(e) => onChange('password', e.target.value)} minLength={6} autoComplete="new-password" />
          </div>
          <div className="compact-form-group">
            <label style={{ fontSize: '11px', fontWeight: 700 }}>পাসওয়ার্ড নিশ্চিত করুন</label>
            <input type="password" className="compact-form-control" required value={form.confirmPassword} onChange={(e) => onChange('confirmPassword', e.target.value)} minLength={6} autoComplete="new-password" />
          </div>

          <button className="btn" type="submit" disabled={loading} style={{ width: '100%', marginTop: '0.5rem', fontWeight: 600 }}>
            {loading ? 'জমা হচ্ছে...' : 'আবেদন জমা দিন'}
          </button>
        </form>
      </div>

      <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', fontSize: '13px' }}>
        <Link href="/jobs" className="btn btn-outline">
          সার্কুলার দেখুন
        </Link>
        <Link href="/employee/login">কর্মী লগইন</Link>
        <Link href="/">হোম</Link>
      </div>
    </main>
  );
}
