'use client';

import { useState } from 'react';
import { markBuyerTabSession } from '@/lib/tabSession';
import Link from 'next/link';
import { HiKey, HiPlus } from 'react-icons/hi';

export default function BuyerLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/buyer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Invalid credentials');
        return;
      }
      markBuyerTabSession();
      window.location.href = '/buyer';
    } catch (err) {
      setError('An error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '1rem', background: '#ffffff' }}>
      <div style={{ width: '100%', maxWidth: '340px', padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' }}>
          <img src="/icons8-youtube-50.png" alt="Logo" style={{ height: '42px', width: 'auto', marginBottom: '0.4rem' }} />
          <div className="logo-text" style={{ lineHeight: 1 }}>YTM Bangladesh</div>
          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginTop: '0.4rem' }}>Buyer Login</div>
        </div>
        {error ? <div style={{ color: '#dc2626', background: '#fee2e2', padding: '0.5rem', borderRadius: '4px', fontSize: '12px', marginBottom: '1rem', textAlign: 'center', fontWeight: 600 }}>{error}</div> : null}

        <form onSubmit={onSubmit}>
          <div className="compact-form-group">
            <label>Email</label>
            <input type="email" className="compact-form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="compact-form-group" style={{ marginTop: '0.75rem' }}>
            <label>Password</label>
            <input type="password" className="compact-form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn-sm" style={{ marginTop: '1.5rem', width: '100%', padding: '0.65rem', backgroundColor: '#1e293b', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px', fontWeight: 600, fontSize: '13px', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', gap: '0.35rem' }} disabled={loading}>
            <HiKey />
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
          New buyer? <Link href="/buyer/register" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', textDecoration: 'none' }}><HiPlus /> Register</Link>
        </div>
      </div>
    </main>
  );
}
