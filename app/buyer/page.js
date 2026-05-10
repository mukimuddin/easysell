'use client';

import { useEffect, useMemo, useState } from 'react';
import { clearBuyerTabSession } from '@/lib/tabSession';
import { 
  HiCube, HiRefresh, HiSearch, HiX, 
  HiOutlineClipboardCopy, HiLink, HiCheck 
} from 'react-icons/hi';
import { useUI } from '@/components/UIContext';

function CopyButton({ text, title, successMsg }) {
  const [copied, setCopied] = useState(false);
  const { toast } = useUI();

  const handleCopy = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(successMsg || 'Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      title={title}
      className={`btn btn-sm ${copied ? 'btn-approve' : 'btn-outline'}`}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: '24px', height: '24px', padding: 0,
        borderRadius: '4px',
        transition: 'all 0.2s ease'
      }}
    >
      {copied ? <HiCheck style={{ fontSize: '12px' }} /> : (title.includes('Link') ? <HiLink style={{ fontSize: '12px' }} /> : <HiOutlineClipboardCopy style={{ fontSize: '12px' }} />)}
    </button>
  );
}

export default function BuyerPanelPage() {
  const { toast } = useUI();
  const [profile, setProfile] = useState(null);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('subs_desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [includeCredentials, setIncludeCredentials] = useState(false);

  const loadData = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      setError('');
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
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredChannels = useMemo(() => {
    const text = search.trim().toLowerCase();
    if (!text) return channels;
    return channels.filter((channel) => {
      return (
        String(channel.channel_name || '').toLowerCase().includes(text) ||
        String(channel.worker_name || '').toLowerCase().includes(text) ||
        String(channel.reg_no || '').includes(text)
      );
    });
  }, [channels, search]);

  const sortedChannels = useMemo(() => {
    const list = [...filteredChannels];
    if (sortBy === 'name_asc') list.sort((a, b) => String(a.channel_name || '').localeCompare(String(b.channel_name || '')));
    if (sortBy === 'name_desc') list.sort((a, b) => String(b.channel_name || '').localeCompare(String(a.channel_name || '')));
    if (sortBy === 'date_asc') list.sort((a, b) => new Date(a.open_date || a.created_at || 0) - new Date(b.open_date || b.created_at || 0));
    if (sortBy === 'date_desc') list.sort((a, b) => new Date(b.open_date || b.created_at || 0) - new Date(a.open_date || a.created_at || 0));
    if (sortBy === 'subs_desc') list.sort((a, b) => (b.sub_count || 0) - (a.sub_count || 0));
    if (sortBy === 'subs_asc') list.sort((a, b) => (a.sub_count || 0) - (b.sub_count || 0));
    return list;
  }, [filteredChannels, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sortedChannels.length / pageSize));

  const paginatedChannels = useMemo(() => {
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * pageSize;
    return sortedChannels.slice(start, start + pageSize);
  }, [sortedChannels, page, pageSize, totalPages]);

  const stats = useMemo(() => {
    const withOpenDate = channels.filter((c) => !!c.open_date).length;
    const specialists = new Set(channels.map((c) => c.worker_name).filter(Boolean)).size;
    return {
      total: channels.length,
      dated: withOpenDate,
      specialists,
    };
  }, [channels]);

  useEffect(() => {
    setPage(1);
  }, [search, sortBy, pageSize]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    const allOnPageSelected = paginatedChannels.length > 0 && paginatedChannels.every(c => selectedIds.has(c.id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) {
        paginatedChannels.forEach(c => next.delete(c.id));
      } else {
        paginatedChannels.forEach(c => next.add(c.id));
      }
      return next;
    });
  };

  const handleBulkCopy = () => {
    const selectedChannels = channels.filter((c) => selectedIds.has(c.id));
    if (selectedChannels.length === 0) {
      toast.error('Please select at least one channel!');
      return;
    }

    const text = selectedChannels
      .map((c) => {
        let entry = `REG: ${c.reg_no || 'N/A'}\nNAME: ${c.channel_name || 'N/A'}\nLINK: ${c.channel_link || 'N/A'}`;
        if (includeCredentials && profile?.credentials_unlocked === 1) {
          entry += `\nGMAIL: ${c.gmail || 'N/A'}\nPASS: ${c.password || 'N/A'}`;
        }
        return entry;
      })
      .join('\n\n---\n\n');

    navigator.clipboard.writeText(text);
    toast.success(`${selectedChannels.length} channels copied!`);
  };

  if (loading) {
    return <main style={{ maxWidth: '980px', margin: '0 auto', padding: '1rem' }}>Loading buyer panel...</main>;
  }

  return (
    <main style={{ maxWidth: '980px', margin: '0 auto', padding: '1rem', display: 'grid', gap: '0.6rem' }}>
      <section className="buyer-workspace-section" style={{ border: '1px solid #e2e8f0', borderRadius: '10px', background: '#fff', padding: '0.75rem' }}>
        <div className="buyer-workspace-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.7rem', flexWrap: 'wrap' }}>
          <div className="buyer-workspace-copy" style={{ minWidth: 0 }}>
            <div className="buyer-workspace-kicker" style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
              Buyer Workspace
            </div>
            <h1 className="buyer-workspace-title" style={{ fontSize: '1.15rem', marginBottom: '0.15rem', lineHeight: 1.2 }}>Channel Inventory Desk</h1>
            <p className="buyer-workspace-subtitle" style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.35 }}>
              {profile?.full_name || 'Buyer'} {profile?.company_name ? `• ${profile.company_name}` : ''}
            </p>
          </div>

          <div className="buyer-workspace-actions" style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={() => loadData(true)}
              disabled={refreshing}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', fontSize: '11px' }}
            >
              <HiRefresh />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              className="btn btn-sm btn-outline"
              onClick={async () => {
                await fetch('/api/buyer/logout', { method: 'POST' });
                clearBuyerTabSession();
                window.location.href = '/buyer/login';
              }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', fontSize: '11px', lineHeight: 1 }}
            >
              <HiX />
              Logout
            </button>
          </div>
        </div>

        {/* Multi-Copy Feature */}
        <div style={{ marginTop: '0.8rem', display: 'flex', gap: '0.5rem', alignItems: 'center', background: '#f1f5f9', padding: '0.5rem', borderRadius: '8px', flexWrap: 'wrap' }}>
          <button
            className={`btn btn-sm ${selectedIds.size > 0 ? 'btn-primary' : 'btn-outline'}`}
            onClick={handleBulkCopy}
            disabled={selectedIds.size === 0}
            style={{ fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <HiOutlineClipboardCopy />
            Copy Selected ({selectedIds.size})
          </button>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '11px', cursor: 'pointer', userSelect: 'none', marginLeft: 'auto' }}>
            <input
              type="checkbox"
              checked={includeCredentials}
              onChange={(e) => setIncludeCredentials(e.target.checked)}
              disabled={profile?.credentials_unlocked !== 1}
            />
            Include Credentials
          </label>
        </div>

        <div className="buyer-kpi-grid" style={{ marginTop: '0.65rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.45rem' }}>
          <div className="buyer-kpi-card" style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.45rem 0.55rem', background: '#f8fafc' }}>
            <div className="buyer-kpi-label" style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Online</div>
            <div className="buyer-kpi-value" style={{ marginTop: '2px', fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>{stats.total}</div>
          </div>
          <div className="buyer-kpi-card" style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.45rem 0.55rem', background: '#f8fafc' }}>
            <div className="buyer-kpi-label" style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>With Date</div>
            <div className="buyer-kpi-value" style={{ marginTop: '2px', fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>{stats.dated}</div>
          </div>
          <div className="buyer-kpi-card" style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.45rem 0.55rem', background: '#f8fafc' }}>
            <div className="buyer-kpi-label" style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Specialists</div>
            <div className="buyer-kpi-value" style={{ marginTop: '2px', fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>{stats.specialists}</div>
          </div>
        </div>

        <div className="buyer-workspace-note" style={{ marginTop: '0.55rem', border: '1px dashed #dbeafe', borderRadius: '8px', background: '#f8fbff', padding: '0.45rem 0.55rem', fontSize: '11px', color: '#475569' }}>
          Practical mode: use search + sort + pagination to quickly shortlist channels before opening links.
        </div>
      </section>

      {error ? (
        <div style={{ border: '1px solid #fecaca', background: '#fef2f2', color: '#b91c1c', borderRadius: '8px', padding: '0.5rem 0.6rem', fontSize: '12px' }}>
          {error}
        </div>
      ) : null}

      <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', alignItems: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.5rem 0.6rem' }}>
        <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
          <HiSearch style={{ position: 'absolute', left: '9px', top: '9px', color: '#94a3b8' }} />
          <input
            className="compact-form-control"
            style={{ paddingLeft: '28px', fontSize: '12px' }}
            placeholder="Search channel or specialist..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          type="button"
          className="btn btn-sm btn-outline"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '11px' }}
          onClick={() => setSearch('')}
        >
          <HiRefresh />
          Reset
        </button>
        <div className="buyer-dropdown-wrap" style={{ display: 'flex', gap: '0.35rem', margin: '0 auto', flexWrap: 'wrap', justifyContent: 'center' }}>
          <select
            className="compact-form-control"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ fontSize: '11px', padding: '0.28rem 0.45rem', minWidth: '130px' }}
          >
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
            <option value="name_asc">Name A-Z</option>
            <option value="name_desc">Name Z-A</option>
            <option value="subs_desc">High Subs</option>
            <option value="subs_asc">Low Subs</option>
          </select>
          <select
            className="compact-form-control"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            style={{ fontSize: '11px', padding: '0.28rem 0.45rem', minWidth: '95px' }}
          >
            <option value={5}>5 / page</option>
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
          </select>
        </div>
      </div>

      <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ padding: '0.62rem 0.8rem', borderBottom: '1px solid #e2e8f0', fontWeight: 700, fontSize: '12px', letterSpacing: '0.02em' }}>
          ONLINE CHANNEL INVENTORY ({sortedChannels.length})
        </div>
        <div className="table-responsive buyer-table-desktop">
          <table className="compact-table">
            <thead>
              <tr>
                <th style={{ width: '30px', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={paginatedChannels.length > 0 && paginatedChannels.every(c => selectedIds.has(c.id))}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th>Reg.</th>
                <th>Channel</th>
                <th>Specialist</th>
                <th>Open Date</th>
                <th>Subscribers</th>
                {profile?.credentials_unlocked === 1 && <th>Credentials</th>}
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedChannels.map((channel, idx) => (
                <tr key={channel.id} style={{ background: selectedIds.has(channel.id) ? '#f8faff' : 'inherit' }}>
                  <td style={{ textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(channel.id)}
                      onChange={() => toggleSelect(channel.id)}
                    />
                  </td>
                  <td>
                    <span style={{ 
                      background: '#f1f5f9', 
                      color: '#475569', 
                      padding: '2px 6px', 
                      borderRadius: '4px', 
                      fontSize: '10px', 
                      fontWeight: 700,
                      border: '1px solid #e2e8f0'
                    }}>
                      {channel.reg_no || ((page - 1) * pageSize + idx + 1)}
                    </span>
                  </td>
                  <td>
                    <a href={channel.channel_link} target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <HiCube style={{ color: '#64748b' }} />
                      {channel.channel_name}
                    </a>
                  </td>
                  <td>{channel.worker_name || 'N/A'}</td>
                  <td>{channel.open_date ? new Date(channel.open_date).toLocaleDateString('en-GB') : 'N/A'}</td>
                  <td><div style={{ fontWeight: 600 }}>{channel.sub_count || 0}</div></td>
                  {profile?.credentials_unlocked === 1 && (
                    <td>
                      {(channel.gmail || channel.password) ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ fontSize: '10px', display: 'flex', flexDirection: 'column', gap: '0.1rem', flex: 1 }}>
                            <div style={{ color: '#475569' }}><strong>E:</strong> {channel.gmail || '-'}</div>
                            <div style={{ color: '#475569' }}><strong>P:</strong> {channel.password || '-'}</div>
                          </div>
                          <CopyButton 
                            text={`GMAIL: ${channel.gmail || 'N/A'}\nPASS: ${channel.password || 'N/A'}`} 
                            title="Copy Credentials" 
                            successMsg="Credentials copied!"
                          />
                        </div>
                      ) : (
                        <span style={{ fontSize: '10px', color: '#94a3b8' }}>None</span>
                      )}
                    </td>
                  )}
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.3rem', justifyContent: 'flex-end' }}>
                       <CopyButton 
                         text={channel.channel_link} 
                         title="Copy Link" 
                         successMsg="Link copied!"
                       />
                       <a
                         href={channel.channel_link}
                         target="_blank"
                         rel="noreferrer"
                         className="btn btn-sm btn-outline"
                         style={{ fontSize: '10px', padding: '0.2rem 0.5rem' }}
                       >
                         Open
                       </a>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedChannels.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '1.8rem', color: '#94a3b8', fontSize: '12px' }}>
                    No channels match your filter.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="buyer-card-mobile" style={{ display: 'none', padding: '0.55rem', background: '#fff' }}>
          {paginatedChannels.length > 0 ? (
            paginatedChannels.map((channel, idx) => (
              <div key={channel.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.5rem', marginBottom: '0.45rem', background: selectedIds.has(channel.id) ? '#f8faff' : 'inherit' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.35rem', marginBottom: '0.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(channel.id)}
                      onChange={() => toggleSelect(channel.id)}
                    />
                    <span style={{ 
                      background: '#f8fafc', 
                      color: '#64748b', 
                      padding: '1px 5px', 
                      borderRadius: '4px', 
                      fontSize: '9px', 
                      fontWeight: 800,
                      border: '1px solid #e2e8f0'
                    }}>
                      REG: {channel.reg_no || ((page - 1) * pageSize + idx + 1)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.3rem' }}>
                    <CopyButton 
                      text={channel.channel_link} 
                      title="Copy Link" 
                      successMsg="Link copied!"
                    />
                    <a href={channel.channel_link} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline" style={{ fontSize: '10px', padding: '0.18rem 0.42rem' }}>
                      Open
                    </a>
                  </div>
                </div>
                <div style={{ fontWeight: 700, fontSize: '12px', color: '#0f172a', marginBottom: '0.2rem' }}>{channel.channel_name}</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Specialist: {channel.worker_name || 'N/A'}</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Open Date: {channel.open_date ? new Date(channel.open_date).toLocaleDateString('en-GB') : 'N/A'}</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Subs: <strong style={{ color: '#0f172a' }}>{channel.sub_count || 0}</strong></div>
                {profile?.credentials_unlocked === 1 && (channel.gmail || channel.password) && (
                  <div style={{ marginTop: '0.4rem', padding: '0.45rem', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ fontSize: '10px', display: 'flex', flexDirection: 'column', gap: '0.1rem', flex: 1 }}>
                      <div style={{ color: '#475569' }}><strong>E:</strong> {channel.gmail || '-'}</div>
                      <div style={{ color: '#475569' }}><strong>P:</strong> {channel.password || '-'}</div>
                    </div>
                    <CopyButton 
                      text={`GMAIL: ${channel.gmail || 'N/A'}\nPASS: ${channel.password || 'N/A'}`} 
                      title="Copy Credentials" 
                      successMsg="Credentials copied!"
                    />
                  </div>
                )}
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '1.2rem', color: '#94a3b8', fontSize: '12px' }}>
              No channels match your filter.
            </div>
          )}
        </div>

        <div style={{ borderTop: '1px solid #e2e8f0', padding: '0.52rem 0.6rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', background: '#fafcff' }}>
          <div style={{ fontSize: '11px', color: '#64748b' }}>
            Page {page} of {totalPages} • Showing {paginatedChannels.length} items
          </div>
          <div style={{ display: 'flex', gap: '0.3rem' }}>
            <button
              type="button"
              className="btn btn-sm btn-outline"
              style={{ fontSize: '10px', padding: '0.2rem 0.5rem' }}
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline"
              style={{ fontSize: '10px', padding: '0.2rem 0.5rem' }}
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
