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
      
      if (res.ok) {
        window.location.href = '/admin';
      } else {
        const data = await res.json();
        setError(data.error || 'Invalid Passcode');
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="form-container" style={{ marginTop: '5rem', maxWidth: '400px' }}>
      <h2 className="section-title" style={{ justifyContent: 'center', marginBottom: '2rem' }}>Administrator Access</h2>
      
      <p style={{ textAlign: 'center', color: 'var(--muted-foreground)', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
        Enter your secure passcode to manage the marketplace.
      </p>

      <form onSubmit={handleLogin}>
        {error && (
          <div className="status-badge status-rejected" style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', marginBottom: '1.5rem', justifyContent: 'center' }}>
            {error}
          </div>
        )}
        
        <div className="form-group">
          <label htmlFor="passcode">Admin Passcode</label>
          <input 
            type="password" 
            id="passcode" 
            className="form-control" 
            placeholder="······"
            value={passcode} 
            onChange={(e) => setPasscode(e.target.value)} 
            required 
            autoFocus 
            style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.25em' }}
          />
        </div>
        
        <button type="submit" className="btn full-width" style={{ marginTop: '1rem', padding: '0.75rem' }} disabled={loading}>
          {loading ? 'Verifying...' : 'Access Dashboard'}
        </button>
      </form>
    </main>
  );
}
