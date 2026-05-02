'use client';

import { useState } from 'react';
import { markAdminTabSession } from '@/lib/tabSession';

export default function EmployeeLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, portal: 'employee' }),
      });

      const data = await res.json();
      if (res.ok) {
        markAdminTabSession();
        window.location.href = '/admin';
      } else {
        setError(data.error || 'ভুল ইউজারনেম বা পাসওয়ার্ড');
      }
    } catch (err) {
      setError('লগইন সময় সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '1rem', background: '#ffffff' }}>
      <div style={{ width: '100%', maxWidth: '340px', padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.5rem', textAlign: 'center' }}>Employee Access</h2>

        {error && (
          <div style={{ color: '#dc2626', background: '#fee2e2', padding: '0.5rem', borderRadius: '4px', fontSize: '12px', marginBottom: '1rem', textAlign: 'center', fontWeight: 600 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="compact-form-group">
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Username</label>
            <input
              type="text"
              className="compact-form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
              placeholder="emp-xxxxxx"
              autoComplete="username"
            />
          </div>

          <div className="compact-form-group" style={{ marginTop: '0.75rem' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Password</label>
            <input
              type="password"
              className="compact-form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn-sm" style={{ marginTop: '1.5rem', width: '100%', padding: '0.65rem', backgroundColor: '#1e293b', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px', fontWeight: 600, fontSize: '13px' }} disabled={loading}>
            {loading ? 'Verifying...' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <a href="/" style={{ fontSize: '12px', color: '#64748b', textDecoration: 'none' }}>Back to Home</a>
        </div>
      </div>
    </main>
  );
}
