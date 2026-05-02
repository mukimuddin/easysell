'use client';

import { useState } from 'react';
import Link from 'next/link';
import { HiKey, HiPlus } from 'react-icons/hi';

export default function BuyerRegisterPage() {
  const [form, setForm] = useState({
    fullName: '',
    companyName: '',
    phone: '',
    email: '',
    password: '',
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
      const res = await fetch('/api/buyer/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registration failed');
        return;
      }
      setSuccess('Registration complete. Admin approval needed before login.');
      setForm({ fullName: '', companyName: '', phone: '', email: '', password: '' });
    } catch (err) {
      setError('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="public-page-fill-viewport-footer"
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem 1rem',
        background: '#ffffff',
      }}
    >
      <div style={{ width: '100%', maxWidth: '420px', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
        <h1 style={{ fontSize: '1.2rem', marginBottom: '0.3rem' }}>Buyer Registration</h1>
        <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '1rem' }}>Submit your details. Admin will approve your account.</p>

        {error ? <div style={{ marginBottom: '0.75rem', color: '#b91c1c', fontSize: '12px' }}>{error}</div> : null}
        {success ? <div style={{ marginBottom: '0.75rem', color: '#166534', fontSize: '12px' }}>{success}</div> : null}

        <form onSubmit={onSubmit}>
          <div className="compact-form-group">
            <label>Full Name</label>
            <input className="compact-form-control" required value={form.fullName} onChange={(e) => onChange('fullName', e.target.value)} />
          </div>
          <div className="compact-form-group">
            <label>Company Name</label>
            <input className="compact-form-control" value={form.companyName} onChange={(e) => onChange('companyName', e.target.value)} />
          </div>
          <div className="compact-form-group">
            <label>Phone</label>
            <input className="compact-form-control" required value={form.phone} onChange={(e) => onChange('phone', e.target.value)} />
          </div>
          <div className="compact-form-group">
            <label>Email</label>
            <input type="email" className="compact-form-control" required value={form.email} onChange={(e) => onChange('email', e.target.value)} />
          </div>
          <div className="compact-form-group">
            <label>Password</label>
            <input type="password" className="compact-form-control" required value={form.password} onChange={(e) => onChange('password', e.target.value)} />
          </div>

          <button className="btn btn-sm btn-approve" type="submit" disabled={loading} style={{ width: '100%', marginTop: '0.75rem', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', gap: '0.35rem' }}>
            <HiPlus />
            {loading ? 'Submitting...' : 'Submit Registration'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
          Already approved? <Link href="/buyer/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', textDecoration: 'none' }}><HiKey /> Login here</Link>
        </div>
      </div>
    </main>
  );
}
