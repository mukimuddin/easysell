'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { HiMenuAlt3, HiX } from 'react-icons/hi';
import Link from 'next/link';
import Footer from '@/components/Footer';

export default function ConditionalLayout({ children }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isAdmin = pathname.startsWith('/admin');

  useEffect(() => {
    if (isAdmin) {
      fetch('/api/admin/me')
        .then(res => res.json())
        .then(data => setUser(data))
        .catch(() => setUser(null));
    }
  }, [isAdmin]);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname, searchParams]);

  if (isAdmin) {
    if (pathname === '/admin/login') return children;
    if (!user) return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#ffffff',
        color: '#475569',
        fontSize: '12px',
        fontWeight: 500
      }}>
        Initializing...
      </div>
    );

    const currentTab = searchParams.get('tab') || 'monitoring';

    return (
      <div className={`admin-layout ${isSidebarOpen ? 'sidebar-expanded' : ''}`}>
        {/* Simple Minimal Mobile Header */}
        <header className="admin-mobile-header">
           <button className="menu-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
             {isSidebarOpen ? '✕' : '☰'}
           </button>
           <div className="mobile-logo">Growth Tracker</div>
           <div style={{ width: '38px' }}></div>
        </header>

        {isSidebarOpen && (
          <div className="sidebar-backdrop" onClick={() => setIsSidebarOpen(false)}></div>
        )}

        <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-logo">
            Growth Tracker
          </div>
          
          <nav className="sidebar-nav">
             <Link href="/admin?tab=monitoring" className={`sidebar-link ${currentTab === 'monitoring' ? 'active' : ''}`}>
               Monitoring
             </Link>
             <Link href="/admin?tab=channels" className={`sidebar-link ${currentTab === 'channels' ? 'active' : ''}`}>
               Channels
             </Link>
             <Link href="/admin?tab=workers" className={`sidebar-link ${currentTab === 'workers' ? 'active' : ''}`}>
               Specialists
             </Link>
             
             {user.role === 'main' && (
               <>
                 <div className="sidebar-section-title" style={{ padding: '1.25rem 0.75rem 0.4rem', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Admin</div>
                 <Link href="/admin?tab=sell" className={`sidebar-link ${currentTab === 'sell' ? 'active' : ''}`}>
                   Sell Unit
                 </Link>
                 <Link href="/admin?tab=sales" className={`sidebar-link ${currentTab === 'sales' ? 'active' : ''}`}>
                   Profit Ledger
                 </Link>
                 <Link href="/admin?tab=admins" className={`sidebar-link ${currentTab === 'admins' ? 'active' : ''}`}>
                   User Management
                 </Link>
               </>
             )}
          </nav>
          
          <div style={{ marginTop: 'auto' }}>
             <div style={{ padding: '0.75rem 0.75rem', borderTop: '1px solid #e2e8f0', marginBottom: '0.5rem' }}>
                <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Role: {user.role}</div>
             </div>
             
             <button 
               onClick={async () => {
                  if (confirm('Logout?')) {
                    await fetch('/api/admin/logout', { method: 'POST' });
                    window.location.href = '/admin/login';
                  }
               }}
               className="sidebar-link" 
               style={{ width: '100%', background: '#fee2e2', color: '#991b1b', border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: 600 }}
             >
               Logout
             </button>
          </div>
        </aside>

        <main className="admin-main">
          {children}
        </main>
      </div>
    );
  }

  return (
    <>
      <nav className="navbar">
        <div className="nav-container">
          <Link href="/" className="logo">YTM.</Link>
          <div className="nav-links">
            <Link href="/admin" className="nav-link">Admin</Link>
          </div>
        </div>
      </nav>
      <main>
        {children}
      </main>
      <Footer />
    </>
  );
}

