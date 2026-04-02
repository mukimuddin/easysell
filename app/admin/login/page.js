'use client';

import { useState, useEffect } from 'react';

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
    <div className="login-wrapper">
      <main className="login-card">
        <div className="login-header">
          <div className="lock-icon">🔒</div>
          <h2>Admin Access</h2>
          <p>Please enter your secure passcode</p>
        </div>

        {error && (
          <div className="error-alert">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="login-form">
          <div className="passcode-input-group">
            <input 
              type="password" 
              id="passcode" 
              className="passcode-input" 
              placeholder="······"
              value={passcode} 
              onChange={(e) => setPasscode(e.target.value)} 
              required 
              autoFocus 
              disabled={loading}
            />
          </div>
          
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Verifying...' : 'Unlock Dashboard'}
          </button>
        </form>

        <footer className="login-footer">
          <a href="/">← Back to Marketplace</a>
        </footer>
      </main>

      <style jsx>{`
        .login-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--background);
          padding: 1.5rem;
        }

        .login-card {
          width: 100%;
          max-width: 420px;
          background: var(--card);
          padding: 2.5rem;
          border-radius: 1.5rem;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
          border: 1px solid var(--border);
        }

        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .lock-icon {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .login-header h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--foreground);
          margin-bottom: 0.5rem;
        }

        .login-header p {
          color: var(--muted-foreground);
          font-size: 0.875rem;
        }

        .error-alert {
          background: #fef2f2;
          border: 1px solid #fee2e2;
          color: #b91c1c;
          padding: 0.75rem;
          border-radius: 0.75rem;
          font-size: 0.825rem;
          margin-bottom: 1.5rem;
          text-align: center;
          line-height: 1.4;
        }

        .passcode-input-group {
          margin-bottom: 1.5rem;
        }

        .passcode-input {
          width: 100%;
          background: var(--muted);
          border: 2px solid transparent;
          border-radius: 1rem;
          padding: 1rem;
          text-align: center;
          font-size: 2rem;
          letter-spacing: 0.5em;
          color: var(--foreground);
          transition: all 0.2s;
        }

        .passcode-input:focus {
          outline: none;
          border-color: var(--primary);
          background: var(--card);
          box-shadow: 0 0 0 4px rgba(var(--primary-rgb), 0.1);
        }

        .login-btn {
          width: 100%;
          background: var(--primary);
          color: white;
          border: none;
          border-radius: 1rem;
          padding: 1rem;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .login-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          filter: brightness(1.1);
        }

        .login-btn:active {
          transform: translateY(0);
        }

        .login-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .login-footer {
          margin-top: 2rem;
          text-align: center;
        }

        .login-footer a {
          color: var(--muted-foreground);
          text-decoration: none;
          font-size: 0.875rem;
          transition: color 0.15s;
        }

        .login-footer a:hover {
          color: var(--foreground);
        }

        @media (max-width: 480px) {
          .login-card {
            padding: 2rem 1.5rem;
            box-shadow: none;
            border: none;
            background: transparent;
          }
          .login-wrapper {
            background: var(--card);
          }
        }
      `}</style>
    </div>
  );
}
