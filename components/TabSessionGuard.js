'use client';

import { useLayoutEffect, useState } from 'react';
import { ADMIN_TAB_SESSION_KEY, BUYER_TAB_SESSION_KEY } from '@/lib/tabSession';

function Centered({ children }) {
  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#ffffff',
        color: '#475569',
        fontSize: '12px',
        fontWeight: 500,
      }}
    >
      {children}
    </div>
  );
}

export function AdminTabSessionGuard({ children }) {
  const [allowed, setAllowed] = useState(null);

  useLayoutEffect(() => {
    if (typeof sessionStorage === 'undefined') {
      setAllowed(false);
      return;
    }
    if (sessionStorage.getItem(ADMIN_TAB_SESSION_KEY)) {
      setAllowed(true);
      return;
    }
    fetch('/api/admin/logout', { method: 'POST' })
      .catch(() => {})
      .finally(() => {
        window.location.replace('/admin/login');
      });
  }, []);

  if (allowed !== true) {
    return <Centered>Initializing...</Centered>;
  }
  return children;
}

export function BuyerTabSessionGuard({ children }) {
  const [allowed, setAllowed] = useState(null);

  useLayoutEffect(() => {
    if (typeof sessionStorage === 'undefined') {
      setAllowed(false);
      return;
    }
    if (sessionStorage.getItem(BUYER_TAB_SESSION_KEY)) {
      setAllowed(true);
      return;
    }
    fetch('/api/buyer/logout', { method: 'POST' })
      .catch(() => {})
      .finally(() => {
        window.location.replace('/buyer/login');
      });
  }, []);

  if (allowed !== true) {
    return <Centered>Initializing...</Centered>;
  }
  return children;
}
