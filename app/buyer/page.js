'use client';

import { useEffect, useMemo, useState } from 'react';
import { HiCube, HiRefresh, HiSearch, HiX } from 'react-icons/hi';

export default function BuyerPanelPage() {
  const [profile, setProfile] = useState(null);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [profileRes, channelsRes] = await Promise.all([
          fetch('/api/buyer/me'),
          fetch('/api/buyer/channels'),
        ]);

        if (!profileRes.ok) {
          window.location.href = '/buyer/login';
          return;
        }

        const profileData = await profileRes.json();
        setProfile(profileData);

        if (!channelsRes.ok) {
          const channelErr = await channelsRes.json();
          throw new Error(channelErr.error || 'Failed to load channels');
        }
        setChannels(await channelsRes.json());
      } catch (err) {
        setError(err.message || 'Failed to load buyer panel');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredChannels = useMemo(() => {
    const text = search.trim().toLowerCase();
    if (!text) return channels;
    return channels.filter((channel) => {
      return (
        String(channel.channel_name || '').toLowerCase().includes(text) ||
        String(channel.worker_name || '').toLowerCase().includes(text)
      );
    });
  }, [channels, search]);

  if (loading) {
    return <main style={{ padding: '1.5rem' }}>Loading buyer panel...</main>;
  }

  return (
    <main style={{ maxWidth: '980px', margin: '0 auto', padding: '1rem', display: 'grid', gap: '0.85rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '1.45rem', marginBottom: '0.2rem' }}>Buyer Panel</h1>
          <p style={{ fontSize: '12px', color: '#64748b' }}>
            Welcome, {profile?.full_name || 'Buyer'} {profile?.company_name ? `(${profile.company_name})` : ''}
          </p>
        </div>
        <button
          className="btn btn-sm btn-outline"
          onClick={async () => {
            await fetch('/api/buyer/logout', { method: 'POST' });
            window.location.href = '/buyer/login';
          }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', fontSize: '11px', lineHeight: 1 }}
        >
          <HiX />
          Logout
        </button>
      </div>

      {error ? <div style={{ marginBottom: '1rem', color: '#b91c1c' }}>{error}</div> : null}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.65rem' }}>
        <div className="stat-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: '74px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '2px', lineHeight: 1.2, flex: 1 }}>
            <div className="stat-label" style={{ margin: 0 }}>Online Channels</div>
            <div className="stat-value" style={{ margin: 0, textAlign: 'center' }}>{channels.length}</div>
          </div>
          <HiCube style={{ fontSize: '1.2rem', color: '#2563eb', flexShrink: 0 }} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.55rem 0.75rem' }}>
        <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
          <HiSearch style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
          <input
            className="compact-form-control"
            style={{ paddingLeft: '30px' }}
            placeholder="Search channel or specialist..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          type="button"
          className="btn btn-sm btn-outline"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
          onClick={() => setSearch('')}
        >
          <HiRefresh />
          Reset
        </button>
      </div>

      <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0', fontWeight: 600 }}>
          Online Channels ({filteredChannels.length})
        </div>
        <div className="table-responsive">
          <table className="compact-table">
            <thead>
              <tr>
                <th>SL.</th>
                <th>Channel</th>
                <th>Specialist</th>
                <th>Open Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredChannels.map((channel, idx) => (
                <tr key={channel.id}>
                  <td>{idx + 1}</td>
                  <td>
                    <a href={channel.channel_link} target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <HiCube style={{ color: '#64748b' }} />
                      {channel.channel_name}
                    </a>
                  </td>
                  <td>{channel.worker_name || 'N/A'}</td>
                  <td>{channel.open_date ? new Date(channel.open_date).toLocaleDateString('en-GB') : 'N/A'}</td>
                </tr>
              ))}
              {filteredChannels.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                    No channels match your filter.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
