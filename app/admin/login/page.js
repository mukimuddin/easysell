'use client';

import { useState } from 'react';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      
      if (res.ok) {
        window.location.href = '/admin';
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to login');
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="form-container" style={{ marginTop: '5rem' }}>
      <h2 className="section-title" style={{ justifyContent: 'center', marginBottom: '2rem' }}>Admin Secure Login</h2>
      
      <form onSubmit={handleLogin}>
        {error && (
          <div className="status-badge status-rejected" style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', marginBottom: '1.5rem', justifyContent: 'center' }}>
            {error}
          </div>
        )}
        
        <div className="form-group">
          <label htmlFor="username">Admin ID</label>
          <input 
            type="text" 
            id="username" 
            className="form-control" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required 
            autoFocus 
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input 
            type="password" 
            id="password" 
            className="form-control" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>
        
        <button type="submit" className="btn full-width" style={{ marginTop: '0.5rem' }} disabled={loading}>
          {loading ? 'Authenticating...' : 'Login to Admin'}
        </button>
      </form>
    </main>
  );
}
