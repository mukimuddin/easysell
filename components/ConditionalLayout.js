'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { HiMenuAlt3, HiX } from 'react-icons/hi';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { useUI } from '@/components/UIContext';

export default function ConditionalLayout({ children }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { showConfirm } = useUI();
  const isAdmin = pathname.startsWith('/admin');
  const isAdminLogin = pathname === '/admin/login';
  const isBuyer = pathname.startsWith('/buyer');
  const isBuyerPublic = pathname === '/buyer/login' || pathname === '/buyer/register';
  const isPublicPage = !isAdmin || isAdminLogin;
  const shouldRenderPublicShell = isPublicPage && (!isBuyer || isBuyerPublic);

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

  if (isAdmin && !isAdminLogin) {
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

    const currentTab = searchParams.get('tab') || 'dashboard';

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
             <Link href="/admin?tab=dashboard" className={`sidebar-link ${currentTab === 'dashboard' ? 'active' : ''}`}>
               Dashboard
             </Link>
             <Link href="/admin?tab=monitoring" className={`sidebar-link ${currentTab === 'monitoring' ? 'active' : ''}`}>
               Monitoring
             </Link>
             <Link href="/admin?tab=channels" className={`sidebar-link ${currentTab === 'channels' ? 'active' : ''}`}>
               Channels
             </Link>
             <Link href="/admin?tab=workers" className={`sidebar-link ${currentTab === 'workers' ? 'active' : ''}`}>
               Specialists
             </Link>
             <Link href="/admin?tab=sources" className={`sidebar-link ${currentTab === 'sources' ? 'active' : ''}`}>
               Sources
             </Link>
             
             {user.role === 'admin' && (
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
                 <Link href="/admin?tab=buyers" className={`sidebar-link ${currentTab === 'buyers' ? 'active' : ''}`}>
                   Buyer Requests
                 </Link>
                 <Link href="/admin?tab=employees" className={`sidebar-link ${currentTab === 'employees' ? 'active' : ''}`}>
                   Staff Details
                 </Link>
               </>
             )}
             <div className="sidebar-section-title" style={{ padding: '1.25rem 0.75rem 0.4rem', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Account</div>
             <Link href="/admin?tab=profile" className={`sidebar-link ${currentTab === 'profile' ? 'active' : ''}`}>
               My Profile
             </Link>
             <Link href="/admin?tab=security" className={`sidebar-link ${currentTab === 'security' ? 'active' : ''}`}>
               Security
             </Link>
          </nav>
          
          <div style={{ marginTop: 'auto' }}>
             <div style={{ padding: '0.75rem 0.75rem', borderTop: '1px solid #e2e8f0', marginBottom: '0.5rem' }}>
                <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Role: {user.role}</div>
             </div>
             
             <button 
               onClick={async () => {
                  if (await showConfirm('Logout?')) {
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

  if (isBuyer && !isBuyerPublic) {
    return <main>{children}</main>;
  }

  return (
    <>
      {shouldRenderPublicShell && (
        <nav className="navbar">
          <div className="nav-container">
            <Link href="/" className="logo">
              <span className="logo-dot"></span>
              YTM.
            </Link>
            <div className="nav-links">
              <Link href="/founder" className="nav-link">Founder</Link>
              <Link href="/jobs" className="nav-link">Jobs</Link>
              <Link href="/help-center" className="nav-link">Help Center</Link>
              <Link href="/contact-us" className="nav-link">Contact</Link>
            </div>
          </div>
        </nav>
      )}
      {shouldRenderPublicShell && <div className="public-nav-spacer" />}
      <main>
        {children}
      </main>
      {shouldRenderPublicShell && <Footer />}
    </>
  );
}

