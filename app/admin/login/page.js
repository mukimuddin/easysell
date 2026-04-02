'use client';

import { useState } from 'react';

export default function AdminLogin() {
  const [passcode, setPasscode] = useState('');
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
        body: JSON.stringify({ passcode }),
      });
      
      const data = await res.json();
      if (res.ok) {
        window.location.href = '/admin';
      } else {
        setError(data.error || 'Invalid Passcode');
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="common-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div className="form-container" style={{ margin: 0, width: '100%', maxWidth: '360px', padding: '2rem' }}>
        <h2 className="section-title" style={{ justifyContent: 'center', marginBottom: '1.5rem', fontSize: '1.25rem' }}>Admin Access</h2>
        
        {error && (
          <div className="status-badge status-rejected" style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', marginBottom: '1.5rem', justifyContent: 'center' }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="passcode" style={{ fontSize: '0.85rem' }}>Passcode</label>
            <input 
              type="password" 
              id="passcode" 
              className="form-control" 
              placeholder="······"
              value={passcode} 
              onChange={(e) => setPasscode(e.target.value)} 
              required 
              autoFocus 
              style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.3em' }}
            />
          </div>
          
          <button type="submit" className="btn full-width" style={{ marginTop: '1rem', padding: '0.75rem' }} disabled={loading}>
            {loading ? 'Verifying...' : 'Login'}
          </button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <a href="/" style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', textDecoration: 'none' }}>← Back Home</a>
        </div>
      </div>
    </main>
  );
}
