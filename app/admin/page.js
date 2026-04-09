'use client';

import { useEffect, useState, Suspense, useMemo, Fragment } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  HiKey, HiPlus, HiRefresh, HiPencilAlt, 
  HiOutlineTrash, HiChartBar, HiX, HiMenu,
  HiTrendingUp, HiUsers, HiCube, HiCurrencyDollar, HiFire, HiStar, HiOutlineClipboardCopy
} from 'react-icons/hi';
import { getSocket } from '@/lib/socket';
import { useUI } from '@/components/UIContext';

const getTimeAgo = (date) => {
  if (!date) return null;
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(date).toLocaleDateString('en-GB');
};

function AdminContent() {
  const { showConfirm, toast } = useUI();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';
  
  const [user, setUser] = useState(null);
  const [channels, setChannels] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [sources, setSources] = useState([]);
  
  const [showAddChannel, setShowAddChannel] = useState(false);
  const [showAddWorker, setShowAddWorker] = useState(false);
  const [showAddSource, setShowAddSource] = useState(false);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [activeChannel, setActiveChannel] = useState(null);
  const [editChannel, setEditChannel] = useState(null); 
  const [editWorker, setEditWorker] = useState(null);
  const [editSource, setEditSource] = useState(null);

  // YT Live Check States
  const [ytLoading, setYtLoading] = useState(false);
  const [ytSubs, setYtSubs] = useState(null);
  const [newChannelName, setNewChannelName] = useState('');

  const handleLinkBlur = async (e) => {
    const url = e.target.value;
    if (!url || (!url.includes('youtube.com') && !url.includes('youtu.be'))) return;
    setYtLoading(true);
    setYtSubs(null);
    try {
      const res = await fetch(`/api/admin/yt-info?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      if (data.success) {
        setYtSubs(data.subCountText);
        if (data.title) setNewChannelName(data.title);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setYtLoading(false);
    }
  };

  // Bulk Sell State
  const [sellWorkerId, setSellWorkerId] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [expandedIds, setExpandedIds] = useState([]);

  const toggleDrawer = (id) => {
    setExpandedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  // 🔍 Filter State
  const [filters, setFilters] = useState({
    search: '',
    workerId: 'all',
    kpiStatus: 'all',
    marketStatus: 'all',
    sortBy: 'default',
    sourceType: 'all'
  });

  const [batchRev, setBatchRev] = useState('');
  const [batchCost, setBatchCost] = useState('');

  const filteredActive = useMemo(() => {
    let result = channels.filter(c => {
      if (c.is_sold) return false;
      
      const matchesSearch = !filters.search || 
        c.channel_name?.toLowerCase().includes(filters.search.toLowerCase()) || 
        c.channel_link?.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesWorker = filters.workerId === 'all' || c.worker_id == filters.workerId;
      const matchesKPI = filters.kpiStatus === 'all' || (c.status || 'new') === filters.kpiStatus;
      const matchesMarket = filters.marketStatus === 'all' || (c.is_selected ? 'online' : 'offline') === filters.marketStatus;

      return matchesSearch && matchesWorker && matchesKPI && matchesMarket;
    });

    if (filters.sortBy === 'subs_desc') {
      result.sort((a, b) => (b.sub_count || 0) - (a.sub_count || 0));
    } else if (filters.sortBy === 'subs_asc') {
      result.sort((a, b) => (a.sub_count || 0) - (b.sub_count || 0));
    } else if (filters.sortBy === 'date_desc') {
      result.sort((a, b) => new Date(b.created_at || b.open_date || 0) - new Date(a.created_at || a.open_date || 0));
    } else if (filters.sortBy === 'date_asc') {
      result.sort((a, b) => new Date(a.created_at || a.open_date || 0) - new Date(b.created_at || b.open_date || 0));
    } else if (filters.sortBy === 'name_asc') {
      result.sort((a, b) => (a.channel_name || '').localeCompare(b.channel_name || ''));
    } else if (filters.sortBy === 'name_desc') {
      result.sort((a, b) => (b.channel_name || '').localeCompare(a.channel_name || ''));
    }

    return result;
  }, [channels, filters]);

  const filteredSold = useMemo(() => {
    let result = channels.filter(c => {
      if (!c.is_sold) return false;
      const matchesSearch = !filters.search || 
        c.channel_name?.toLowerCase().includes(filters.search.toLowerCase());
      const matchesWorker = filters.workerId === 'all' || c.worker_id == filters.workerId;
      return matchesSearch && matchesWorker;
    });

    if (filters.sortBy === 'subs_desc') {
      result.sort((a, b) => (b.sub_count || 0) - (a.sub_count || 0));
    } else if (filters.sortBy === 'subs_asc') {
      result.sort((a, b) => (a.sub_count || 0) - (b.sub_count || 0));
    } else if (filters.sortBy === 'date_desc') {
      result.sort((a, b) => new Date(b.created_at || b.open_date || 0) - new Date(a.created_at || a.open_date || 0));
    } else if (filters.sortBy === 'date_asc') {
      result.sort((a, b) => new Date(a.created_at || a.open_date || 0) - new Date(b.created_at || b.open_date || 0));
    } else if (filters.sortBy === 'name_asc') {
      result.sort((a, b) => (a.channel_name || '').localeCompare(b.channel_name || ''));
    } else if (filters.sortBy === 'name_desc') {
      result.sort((a, b) => (b.channel_name || '').localeCompare(a.channel_name || ''));
    }

    return result;
  }, [channels, filters]);

  const salesStats = useMemo(() => {
    return filteredSold.reduce((acc, c) => {
      acc.totalRev += parseFloat(c.sell_price) || 0;
      acc.totalCost += parseFloat(c.worker_cost) || 0;
      return acc;
    }, { totalRev: 0, totalCost: 0 });
  }, [filteredSold]);

  const activeWorkers = useMemo(() => {
    const activeWorkerIds = new Set(channels.filter(c => !c.is_sold).map(c => c.worker_id));
    return workers.filter(w => activeWorkerIds.has(w.id));
  }, [channels, workers]);

  const filteredSources = useMemo(() => {
    let result = sources || [];
    if (filters.search) {
      result = result.filter(s => 
        (s.caption || '').toLowerCase().includes(filters.search.toLowerCase()) || 
        (s.link || '').toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    if (filters.sourceType !== 'all') {
      result = result.filter(s => s.audio === filters.sourceType);
    }
    return result;
  }, [sources, filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      const pRes = await fetch('/api/admin/me');
      const profile = await pRes.json();
      setUser(profile);

      const [cRes, wRes, sRes] = await Promise.all([
        fetch('/api/admin/channels'),
        fetch('/api/admin/workers'),
        fetch('/api/admin/sources')
      ]);
      setChannels(await cRes.json());
      setWorkers(await wRes.json());
      const sData = await sRes.json();
      setSources(Array.isArray(sData) ? sData : []);

      if (profile.role === 'main') {
        const uRes = await fetch('/api/admin/users');
        setAdmins(await uRes.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const res = await fetch('/api/admin/analytics');
      const data = await res.json();
      setAnalytics(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (activeTab === 'dashboard') {
      loadAnalytics();
    }
  }, [activeTab]);

  useEffect(() => {
    loadData();

    // WebSocket listener for real-time updates
    const socket = getSocket();
    if (socket) {
      const handleUpdate = () => {
        console.log('Real-time update received');
        loadData();
      };
      socket.on('channel-updated', handleUpdate);
      return () => {
        socket.off('channel-updated', handleUpdate);
      };
    }
  }, []);

  // auto-close add sections when switching tabs
  useEffect(() => {
    setShowAddChannel(false);
    setShowAddWorker(false);
    setShowAddSource(false);
    setShowAddAdmin(false);
    setActiveChannel(null);
    setEditChannel(null);
    setEditWorker(null);
    setEditSource(null);
  }, [activeTab]);

  const handleUpdateWorker = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.target);
    try {
      const res = await fetch(`/api/admin/workers/${editWorker.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.get('name'), whatsapp: formData.get('whatsapp') })
      });
      if (res.ok) {
        toast.success('Worker updated!');
        setEditWorker(null);
        loadData();
      } else toast.error('Failed to update worker.');
    } catch(err) { console.error(err); toast.error('Error updating worker.'); }
    finally { setSubmitting(false); }
  };

  const handleUpdateSource = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.target);
    try {
      const res = await fetch(`/api/admin/sources/${editSource.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caption: formData.get('caption'), audio: formData.get('audio'), link: formData.get('link') })
      });
      if (res.ok) {
        toast.success('Source updated!');
        setEditSource(null);
        loadData();
      } else toast.error('Failed to update source.');
    } catch(err) { console.error(err); toast.error('Error updating source.'); }
    finally { setSubmitting(false); }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: formData.get('username'),
        password: formData.get('password'),
        role: formData.get('role')
      }),
    });
    if (res.ok) { setShowAddAdmin(false); loadData(); e.target.reset(); }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const currentPassword = formData.get('currentPassword');
    const newPassword = formData.get('newPassword');
    const confirmPassword = formData.get('confirmPassword');

    if (newPassword !== confirmPassword) {
      return toast.error('New passwords do not match');
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/security/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Password updated successfully!');
        e.target.reset();
      } else {
        toast.error(data.error || 'Failed to update password');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const [submitting, setSubmitting] = useState(false);

  const handleAddWorker = async (e) => {
    e.preventDefault();
    if (submitting) return;
    
    setSubmitting(true);
    try {
      const formData = new FormData(e.target);
      const res = await fetch('/api/admin/workers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.get('name'), whatsapp: formData.get('whatsapp') }),
      });
      if (res.ok) { 
        setShowAddWorker(false); 
        await loadData(); 
        e.target.reset(); 
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddSource = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const formData = new FormData(e.target);
      const res = await fetch('/api/admin/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caption: formData.get('caption'), audio: formData.get('audio'), link: formData.get('link') }),
      });
      if (res.ok) { 
        setShowAddSource(false); 
        await loadData(); 
        e.target.reset(); 
      }
    } catch (err) { console.error(err); } finally { setSubmitting(false); }
  };

  const handleAddChannel = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const res = await fetch('/api/admin/channels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel_name: formData.get('channel_name'),
        channel_link: formData.get('channel_link'),
        worker_id: formData.get('worker_id'),
        open_date: formData.get('open_date'),
        gmail: formData.get('gmail'),
        password: formData.get('password')
      }),
    });
    if (res.ok) { setShowAddChannel(false); loadData(); e.target.reset(); }
  };

  const handleAddDailyUpdate = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const res = await fetch('/api/admin/daily-updates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel_id: activeChannel.id,
        shorts_count: parseInt(formData.get('shorts_count')) || 0,
        sub_count: parseInt(formData.get('sub_count')) || 0,
        status: formData.get('status')
      }),
    });
    if (res.ok) { setActiveChannel(null); loadData(); }
  };

   const handleBulkSell = async (e) => {
    e.preventDefault();
    const total_price = parseFloat(batchRev) || 0;
    const cost_per = parseFloat(batchCost) || 0;
    
    if (selectedIds.length === 0) return toast.error('No channels picked!');
    const per_item_price = (total_price / selectedIds.length).toFixed(2);
    const per_item_cost = (cost_per / selectedIds.length).toFixed(2);

    const confirmed = await showConfirm(`Are you sure? This will assign $${per_item_price} revenue and $${per_item_cost} cost to ${selectedIds.length} accounts.`);
    if (!confirmed) return;

    setLoading(true);
    try {
      await Promise.all(selectedIds.map(id => 
        fetch(`/api/admin/channels/${id}`, {
          method: 'PATCH', 
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            is_sold: true, 
            sell_price: parseFloat(per_item_price), 
            worker_cost: parseFloat(per_item_cost), 
            is_selected: false 
          })
        })
      ));
      setSelectedIds([]);
      setBatchRev('');
      setBatchCost('');
      loadData();
      toast.success(`Unit sold successfully! (${selectedIds.length} items)`);
    } catch(err) { console.error(err); toast.error('Failed to execute sale'); }
    finally { setLoading(false); }
  };

  const handleEditChannel = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const res = await fetch(`/api/admin/channels/${editChannel.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel_name: formData.get('channel_name'),
        channel_link: formData.get('channel_link'),
        worker_id: formData.get('worker_id'),
        open_date: formData.get('open_date'),
        gmail: formData.get('gmail'),
        password: formData.get('password')
      }),
    });
    if (res.ok) { setEditChannel(null); loadData(); }
  };

  const handleToggle = async (id, status) => {
    await fetch(`/api/admin/channels/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_selected: !status }),
    });
    loadData();
  };

  const activeChannels = filteredActive;
  const soldChannels = filteredSold;

  if (!user) return <div style={{ padding: '1rem', fontSize: '12px' }}>Loading...</div>;

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1 className="admin-title">
           {activeTab === 'sales' ? 'Profit Ledger' : activeTab === 'admins' ? 'Users' : activeTab === 'sell' ? 'Sell Unit' : activeTab === 'dashboard' ? 'Market Overview' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
        </h1>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
           {activeTab === 'admins' && user.role === 'main' && (
             <button onClick={() => setShowAddAdmin(!showAddAdmin)} className="btn btn-sm btn-approve" style={{ background: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
               {showAddAdmin ? <><HiX /> Cancel</> : <><HiPlus /> User</>}
             </button>
           )}
           {activeTab === 'workers' && (
             <button onClick={() => setShowAddWorker(!showAddWorker)} className="btn btn-sm btn-approve" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
               {showAddWorker ? <><HiX /> Cancel</> : <><HiPlus /> Specialist</>}
             </button>
           )}
           {activeTab === 'channels' && (
             <button onClick={() => setShowAddChannel(!showAddChannel)} className="btn btn-sm btn-approve" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
               {showAddChannel ? <><HiX /> Cancel</> : <><HiPlus /> Channel</>}
             </button>
           )}
           {activeTab === 'sources' && (
             <button onClick={() => setShowAddSource(!showAddSource)} className="btn btn-sm btn-approve" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
               {showAddSource ? <><HiX /> Cancel</> : <><HiPlus /> Source</>}
             </button>
           )}
        </div>
      </header>


      {activeTab === 'dashboard' && analytics && (
        <div className="dashboard-content" style={{ marginBottom: '1.5rem' }}>
           <div className="analytics-grid">
              <div className="stat-card">
                 <div className="stat-label">Total Revenue</div>
                 <div className="stat-value">${parseFloat(analytics.summary.total_revenue || 0).toLocaleString()}</div>
              </div>
              <div className="stat-card">
                 <div className="stat-label">Net Profit</div>
                 <div className="stat-value">${parseFloat(analytics.summary.total_profit || 0).toLocaleString()}</div>
              </div>
              <div className="stat-card">
                 <div className="stat-label">Active Stock</div>
                 <div className="stat-value">{analytics.summary.active_count}</div>
              </div>
              <div className="stat-card">
                 <div className="stat-label">Total Sold</div>
                 <div className="stat-value">{analytics.summary.sold_count}</div>
              </div>
           </div>

           <div className="dashboard-sections">
              <div className="dashboard-card">
                 <div className="dashboard-card-title">High Performance</div>
                 <div className="bento-list">
                    {analytics.bestChannels.map(c => (
                      <div key={c.id} className="bento-item">
                         <div className="bento-main">
                            <div className="bento-name">{c.channel_name}</div>
                            <div className="bento-sub">{c.worker_name || 'N/A'} • {c.status || 'New'}</div>
                         </div>
                         <div className="bento-badge">{c.sub_count?.toLocaleString() || 0}</div>
                      </div>
                    ))}
                    {analytics.bestChannels.length === 0 && <div style={{ textAlign: 'center', padding: '0.5rem', color: '#94a3b8', fontSize: '10px' }}>No data</div>}
                 </div>
              </div>

              <div className="dashboard-card">
                 <div className="dashboard-card-title">Top Specialists</div>
                 <div className="bento-list">
                    {analytics.bestWorkers.map((w, idx) => (
                      <div key={w.id} className="bento-item">
                         <div className="bento-main">
                            <div className="bento-name">{w.name}</div>
                            <div className="bento-sub">{w.channel_count} Channels</div>
                         </div>
                         <div className="bento-badge">
                            {w.total_subs?.toLocaleString() || 0}
                         </div>
                      </div>
                    ))}
                    {analytics.bestWorkers.length === 0 && <div style={{ textAlign: 'center', padding: '0.5rem', color: '#94a3b8', fontSize: '10px' }}>No data</div>}
                 </div>

                 <div className="dashboard-card-title" style={{ marginTop: '1rem' }}>Aging Summary</div>
                 <div className="bento-list">
                    {analytics.oldChannels.map(c => (
                      <div key={c.id} className="bento-item">
                         <div className="bento-main">
                            <div className="bento-name">{c.channel_name}</div>
                            <div className="bento-sub">{c.days_old}d in stock</div>
                         </div>
                         <div className="bento-badge">{c.open_date ? new Date(c.open_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '--'}</div>
                      </div>
                    ))}
                    {analytics.oldChannels.length === 0 && <div style={{ textAlign: 'center', padding: '0.5rem', color: '#94a3b8', fontSize: '10px' }}>No data</div>}
                 </div>
              </div>
           </div>
        </div>
      )}

      {showAddAdmin && (
        <div style={{ padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '4px', marginBottom: '1rem', background: '#f8fafc' }}>
           <form onSubmit={handleCreateAdmin} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', alignItems: 'flex-end' }}>
              <div className="compact-form-group" style={{ marginBottom: 0 }}><label>User ID</label><input type="text" name="username" className="compact-form-control" required /></div>
              <div className="compact-form-group" style={{ marginBottom: 0 }}><label>Pass</label><input type="password" name="password" className="compact-form-control" required /></div>
              <div className="compact-form-group" style={{ marginBottom: 0 }}>
                <label>Access</label>
                <select name="role" className="compact-form-control" required>
                   <option value="sub">Sub-Admin</option>
                   <option value="main">Main Admin</option>
                </select>
              </div>
              <button type="submit" className="btn btn-sm" style={{ background: '#1e293b', color: '#fff', height: '31px' }}>Create User</button>
           </form>
        </div>
      )}

      {showAddWorker && (
        <div style={{ padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '4px', marginBottom: '1rem', background: '#f8fafc' }}>
           <form onSubmit={handleAddWorker} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
              <div className="compact-form-group" style={{ flex: 1, marginBottom: 0 }}><label>Spec Name</label><input type="text" name="name" className="compact-form-control" required /></div>
              <div className="compact-form-group" style={{ flex: 1, marginBottom: 0 }}><label>WhatsApp</label><input type="text" name="whatsapp" className="compact-form-control" /></div>
              <button type="submit" disabled={submitting} className="btn btn-sm btn-approve" style={{ height: '31px' }}>
                {submitting ? 'Registering...' : 'Register Specialist'}
              </button>
           </form>
        </div>
      )}

      {showAddSource && (
        <div style={{ padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '4px', marginBottom: '1rem', background: '#f8fafc' }}>
           <form onSubmit={handleAddSource} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem', alignItems: 'flex-end' }}>
              <div className="compact-form-group" style={{ marginBottom: 0 }}><label>Title</label><input type="text" name="caption" className="compact-form-control" required /></div>
              <div className="compact-form-group" style={{ marginBottom: 0 }}>
                 <label>Type</label>
                 <select name="audio" className="compact-form-control" required>
                    <option value="audio">Audio</option>
                    <option value="caption">Caption</option>
                 </select>
              </div>
              <div className="compact-form-group" style={{ marginBottom: 0 }}><label>Link or Caption</label><input type="text" name="link" className="compact-form-control" required /></div>
              <button type="submit" disabled={submitting} className="btn btn-sm btn-approve" style={{ height: '31px' }}>
                {submitting ? '...' : 'Add'}
              </button>
           </form>
        </div>
      )}

      {showAddChannel && (
        <div style={{ padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '4px', marginBottom: '1rem', background: '#f8fafc' }}>
           <form onSubmit={handleAddChannel} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem', alignItems: 'flex-end' }}>
              <div className="compact-form-group" style={{ marginBottom: 0 }}>
                <label>ID Name</label>
                <input type="text" name="channel_name" className="compact-form-control" required value={newChannelName} onChange={e => setNewChannelName(e.target.value)} />
              </div>
              <div className="compact-form-group" style={{ marginBottom: 0 }}>
                <label>Link {ytLoading && <span style={{fontSize:'10px', color:'#6366f1'}}>(Fetching...)</span>}</label>
                <input type="url" name="channel_link" className="compact-form-control" required onBlur={handleLinkBlur} />
                {ytSubs && <div style={{ fontSize: '10px', color: '#059669', marginTop: '2px', fontWeight: 'bold' }}>Subs: {ytSubs}</div>}
              </div>
              <div className="compact-form-group" style={{ marginBottom: 0 }}>
                <label>Specialist</label>
                <select name="worker_id" className="compact-form-control" required>
                   <option value="">Choose...</option>
                   {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
              <div className="compact-form-group" style={{ marginBottom: 0 }}><label>Open Date</label><input type="date" name="open_date" className="compact-form-control" /></div>
              <div className="compact-form-group" style={{ marginBottom: 0 }}><label>Gmail</label><input type="email" name="gmail" className="compact-form-control" placeholder="Optional" /></div>
              <div className="compact-form-group" style={{ marginBottom: 0 }}><label>Pass</label><input type="text" name="password" className="compact-form-control" placeholder="Optional" /></div>
              <button type="submit" className="btn btn-sm btn-approve" style={{ height: '31px' }}>List Channel</button>
           </form>
        </div>
      )}

      {activeTab === 'security' && (
        <div style={{ maxWidth: '500px' }}>
          <div className="dashboard-card">
            <div className="dashboard-card-title">Account Security</div>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '1.5rem' }}> Manage your administrative credentials and account password. </p>
            <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="compact-form-group">
                <label>Current Password</label>
                <input 
                  type="password" 
                  name="currentPassword" 
                  required 
                  className="compact-form-control" 
                  placeholder="••••••••"
                />
              </div>
              
              <div className="compact-form-group">
                <label>New Password</label>
                <input 
                  type="password" 
                  name="newPassword" 
                  required 
                  className="compact-form-control" 
                  placeholder="••••••••"
                />
              </div>
              <div className="compact-form-group">
                <label>Confirm New Password</label>
                <input 
                  type="password" 
                  name="confirmPassword" 
                  required 
                  className="compact-form-control" 
                  placeholder="••••••••"
                />
              </div>

              <button 
                type="submit" 
                disabled={submitting} 
                className="btn btn-sm btn-approve" 
                style={{ marginTop: '0.5rem', height: '31px' }}
              >
                {submitting ? 'Updating...' : 'Change Password'}
              </button>
            </form>
          </div>
        </div>
      )}

      {(activeTab === 'monitoring' || activeTab === 'channels' || activeTab === 'sales') && (
        <div style={{ 
          display: 'flex', 
          gap: '0.6rem', 
          marginBottom: '1rem', 
          flexWrap: 'wrap', 
          alignItems: 'center',
          background: '#fff',
          padding: '0.75rem',
          borderRadius: '8px',
          border: '1px solid var(--adm-border)'
        }}>
          <div style={{ flex: '2', minWidth: '200px' }}>
            <input 
              type="text" 
              placeholder="Search by name or link..." 
              className="compact-form-control"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
            />
          </div>
          <div style={{ flex: '1', minWidth: '130px' }}>
            <select 
              className="compact-form-control"
              value={filters.workerId}
              onChange={(e) => setFilters({...filters, workerId: e.target.value})}
            >
              <option value="all">Any Specialist</option>
              {activeWorkers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
          {activeTab !== 'sales' && (
            <>
              <div style={{ flex: '1', minWidth: '130px' }}>
                <select 
                  className="compact-form-control"
                  value={filters.kpiStatus}
                  onChange={(e) => setFilters({...filters, kpiStatus: e.target.value})}
                >
                  <option value="all">Any KPI</option>
                  <option value="growing">Explosive</option>
                  <option value="normal">Steady</option>
                  <option value="low">Low</option>
                  <option value="new">New</option>
                </select>
              </div>
              <div style={{ flex: '1', minWidth: '130px' }}>
                <select 
                  className="compact-form-control"
                  value={filters.marketStatus}
                  onChange={(e) => setFilters({...filters, marketStatus: e.target.value})}
                >
                  <option value="all">Any Status</option>
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
            </>
          )}
          <div style={{ flex: '1', minWidth: '130px' }}>
            <select 
              className="compact-form-control"
              value={filters.sortBy || 'default'}
              onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
            >
              <option value="default">Default Sort</option>
              <option value="subs_desc">Subs: High to Low</option>
              <option value="subs_asc">Subs: Low to High</option>
              <option value="name_asc">Name: A-Z</option>
              <option value="name_desc">Name: Z-A</option>
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
            </select>
          </div>
          <button 
            onClick={() => setFilters({ search: '', workerId: 'all', kpiStatus: 'all', marketStatus: 'all', sortBy: 'default', sourceType: 'all' })}
            className="btn btn-sm btn-outline"
            style={{ padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <HiRefresh /> Reset
          </button>
        </div>
      )}

      {activeTab === 'sources' && (
        <div style={{ 
          display: 'flex', gap: '0.6rem', marginBottom: '1rem', 
          flexWrap: 'wrap', alignItems: 'center', background: '#fff', 
          padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--adm-border)'
        }}>
          <div style={{ flex: '2', minWidth: '200px' }}>
            <input 
              type="text" placeholder="Search title or details..." className="compact-form-control"
              value={filters.search} onChange={(e) => setFilters({...filters, search: e.target.value})}
            />
          </div>
          <div style={{ flex: '1', minWidth: '130px' }}>
            <select className="compact-form-control" value={filters.sourceType} onChange={(e) => setFilters({...filters, sourceType: e.target.value})}>
              <option value="all">All Types</option>
              <option value="audio">Audio</option>
              <option value="caption">Caption</option>
            </select>
          </div>
          <button 
            onClick={() => setFilters({ search: '', workerId: 'all', kpiStatus: 'all', marketStatus: 'all', sortBy: 'default', sourceType: 'all' })}
            className="btn btn-sm btn-outline"
            style={{ padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <HiRefresh /> Reset
          </button>
        </div>
      )}

      {['monitoring', 'channels', 'sales', 'workers', 'sources', 'admins', 'sell'].includes(activeTab) && (
        <div className="compact-table-wrapper">
          {activeTab !== 'sell' && (
          <div className="table-responsive">
            <table className="compact-table">
              {activeTab === 'monitoring' && (
                <>
                  <thead>
                    <tr>
                      <th>SL.</th>
                      <th>Channel</th>
                      <th>Specialist</th>
                      {user.role === 'main' && <th>Added</th>}
                      <th>Items</th>
                      <th>Subs</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Manage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeChannels.map((c, idx) => (
                      <Fragment key={c.id}>
                        <tr key={c.id}>
                          <td data-label="SL.">{idx + 1}</td>
                          <td data-label="Channel">
                            <div className="cell-content">
                              <div style={{ fontWeight: 600 }}><a href={c.channel_link} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>{c.channel_name}</a></div>
                              <a href={c.channel_link} target="_blank" style={{ fontSize: '10px', color: '#1e293b', textDecoration: 'underline' }}>Verify</a>
                            </div>
                          </td>
                          <td data-label="Specialist"><div>{c.worker_name || 'PENDING'}</div></td>
                          {user.role === 'main' && <td data-label="Added By"><div>{c.creator_name || '---'}</div></td>}
                          <td data-label="Items"><div>{c.shorts_count || 0}</div></td>
                          <td data-label="Subs"><div>{c.sub_count ? c.sub_count.toLocaleString() : '---'}</div></td>
                          <td data-label="Status">
                             <div className="status-cell">
                               <div style={{ fontSize: '11px', fontWeight: 700, color: c.status === 'growing' ? '#059669' : c.status === 'normal' ? '#475569' : '#dc2626' }}>
                                  {c.status?.toUpperCase() || 'NEW'}
                               </div>
                               {c.last_update_time && (
                                 <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '2px', display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ color: '#6366f1', fontWeight: 600 }}>{getTimeAgo(c.last_update_time)}</span>
                                    <span>
                                      {new Date(c.last_update_time).toLocaleDateString('en-GB')} • 
                                      {new Date(c.last_update_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase()}
                                    </span>
                                 </div>
                               )}
                             </div>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                             <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                                <button onClick={() => toggleDrawer(c.id)} className={`btn btn-sm ${expandedIds.includes(c.id) ? 'btn-approve' : 'btn-outline'}`} title="Credentials"><HiKey /></button>
                                <button onClick={() => setActiveChannel(c)} className="btn btn-sm btn-outline" title="Update KPI"><HiChartBar /></button>
                             </div>
                          </td>
                        </tr>
                        {expandedIds.includes(c.id) && (
                          <tr className="drawer-row">
                            <td colSpan="8" style={{ padding: 0 }}>
                               <div className="credential-drawer">
                                  <div className="drawer-item"><strong>Created</strong> <span>{c.open_date ? new Date(c.open_date).toLocaleDateString() : '---'}</span></div>
                                  <div className="drawer-item"><strong>Gmail</strong> <span>{c.gmail || '---'}</span></div>
                                  <div className="drawer-item"><strong>Pass</strong> <span>{c.password || '---'}</span></div>
                               </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))}
                    {activeChannels.length === 0 && (
                      <tr><td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No matching channels found. Try adjusting your filters.</td></tr>
                    )}
                  </tbody>
                </>
              )}

              {activeTab === 'channels' && (
                <>
                  <thead>
                    <tr>
                      <th>SL.</th>
                      <th>Channel</th>
                      <th>Specialist</th>
                      {user.role === 'main' && <th>Added By</th>}
                      <th>Subs</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Ops</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeChannels.map((c, idx) => (
                      <Fragment key={c.id}>
                        <tr key={c.id}>
                          <td data-label="SL.">{idx + 1}</td>
                          <td data-label="Channel"><div style={{ fontWeight: 600 }}><a href={c.channel_link} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>{c.channel_name}</a></div></td>
                          <td data-label="Specialist"><div>{c.worker_name || 'PENDING'}</div></td>
                          {user.role === 'main' && <td data-label="Added By"><div>{c.creator_name || '---'}</div></td>}
                          <td data-label="Subs"><div>{c.sub_count || 0}</div></td>
                          <td>
                             <div>
                               <button onClick={() => handleToggle(c.id, c.is_selected)} className={`btn btn-sm ${c.is_selected ? 'btn-approve' : 'btn-outline'}`} style={{ fontSize: '10px', padding: '0.2rem 0.5rem' }}>
                                 {c.is_selected ? 'ONLINE' : 'OFFLINE'}
                               </button>
                             </div>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                             <div className="manage-actions">
                                <button onClick={() => toggleDrawer(c.id)} className={`btn btn-sm ${expandedIds.includes(c.id) ? 'btn-approve' : 'btn-outline'}`} title="Credentials"><HiKey /></button>
                                <button onClick={() => setEditChannel(c)} className="btn btn-sm btn-outline" title="Edit"><HiPencilAlt /></button>
                                <button onClick={async () => { if(await showConfirm('Delete?')) { await fetch(`/api/admin/channels/${c.id}`, {method: 'DELETE'}); loadData(); } }} className="btn btn-sm btn-reject" title="Delete"><HiOutlineTrash /></button>
                             </div>
                          </td>
                        </tr>
                        {expandedIds.includes(c.id) && (
                          <tr className="drawer-row">
                             <td colSpan="7" style={{ padding: 0 }}>
                                <div className="credential-drawer">
                                   <div className="drawer-item"><strong>Date</strong> <span>{c.open_date ? new Date(c.open_date).toLocaleDateString() : '---'}</span></div>
                                   <div className="drawer-item"><strong>Gmail</strong> <span>{c.gmail || '---'}</span></div>
                                   <div className="drawer-item"><strong>Pass</strong> <span>{c.password || '---'}</span></div>
                                </div>
                             </td>
                          </tr>
                        )}
                      </Fragment>
                    ))}
                    {activeChannels.length === 0 && (
                      <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No matching channels found. Try adjusting your filters.</td></tr>
                    )}
                  </tbody>
                </>
              )}

              {activeTab === 'sales' && user.role === 'main' && (
                <>
                  <thead>
                    <tr>
                      <th>SL.</th>
                      <th>Channel</th>
                      <th>Price</th>
                      <th>Cost</th>
                      <th>Profit</th>
                      <th style={{ textAlign: 'right' }}>Payout To</th>
                    </tr>
                  </thead>
                  <tbody>
                    {soldChannels.map((c, idx) => (
                      <tr key={c.id}>
                        <td data-label="SL.">{idx + 1}</td>
                        <td data-label="Channel"><div><a href={c.channel_link} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>{c.channel_name}</a></div></td>
                        <td data-label="Price"><div style={{ color: '#059669' }}>{c.sell_price}</div></td>
                        <td data-label="Cost"><div style={{ color: '#dc2626' }}>{c.worker_cost}</div></td>
                        <td data-label="Profit"><div style={{ fontWeight: 700 }}>{(c.sell_price - c.worker_cost).toFixed(2)}</div></td>
                        <td style={{ textAlign: 'right' }} data-label="Payout To">
                           <div style={{ fontSize: '11px', fontWeight: 600, color: '#1e293b' }}>
                              {c.creator_role === 'sub' ? c.creator_name : (c.worker_name || 'SPECIALIST')}
                           </div>
                        </td>
                      </tr>
                    ))}
                    {soldChannels.length > 0 && (
                      <tr style={{ background: '#f8fafc', fontWeight: 700, borderTop: '2px solid #e2e8f0' }}>
                        <td colSpan="2" style={{ textAlign: 'right', fontSize: '10px', color: '#64748b' }}>TOTAL SUMMARY</td>
                        <td style={{ color: '#059669' }}>{salesStats.totalRev.toFixed(2)}</td>
                        <td style={{ color: '#dc2626' }}>{salesStats.totalCost.toFixed(2)}</td>
                        <td style={{ color: '#1e293b' }}>{(salesStats.totalRev - salesStats.totalCost).toFixed(2)}</td>
                        <td></td>
                      </tr>
                    )}
                  </tbody>
                </>
              )}

              {activeTab === 'workers' && (
                <>
                  <thead>
                    <tr><th>SL.</th><th>Specialist</th><th>WhatsApp</th><th>Added By</th><th style={{ textAlign: 'right' }}>Action</th></tr>
                  </thead>
                  <tbody>
                    {workers.map((w, idx) => (
                      <tr key={w.id}>
                        <td data-label="SL.">{idx + 1}</td>
                        <td data-label="Specialist"><div>{w.name}</div></td>
                        <td data-label="WhatsApp"><div>{w.whatsapp || '---'}</div></td>
                        <td data-label="Added By"><div>{w.creator_name || '---'}</div></td>
                        <td style={{ textAlign: 'right' }}>
                           <div className="manage-actions" style={{ justifyContent: 'flex-end' }}>
                               <button onClick={() => setEditWorker(w)} className="btn btn-sm btn-outline" title="Edit"><HiPencilAlt /></button>
                               <button onClick={async () => { if(await showConfirm('Remove?')) { await fetch(`/api/admin/workers/${w.id}`, {method: 'DELETE'}); loadData(); } }} className="btn btn-sm btn-reject" title="Remove"><HiOutlineTrash /></button>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}

              {activeTab === 'sources' && (
                <>
                  <thead>
                    <tr><th>SL.</th><th>Title</th><th>Type</th><th>Link / Details</th><th style={{ textAlign: 'right' }}>Action</th></tr>
                  </thead>
                  <tbody>
                    {filteredSources?.map((s, idx) => (
                      <tr key={s.id}>
                        <td data-label="SL.">{idx + 1}</td>
                        <td data-label="Title"><div style={{ fontWeight: 600 }}>{s.caption}</div></td>
                        <td data-label="Type">
                          <div style={{ fontSize: '10px', fontWeight: 600, color: s.audio === 'audio' ? '#8b5cf6' : '#10b981', textTransform: 'uppercase' }}>
                            {s.audio === 'audio' ? 'Audio' : s.audio === 'caption' ? 'Caption' : '---'}
                          </div>
                        </td>
                        <td data-label="Link / Details">
                          <div>
                            {s.audio === 'audio' ? (s.link ? <a href={s.link} target="_blank" style={{ color: '#6366f1', textDecoration: 'underline', fontWeight: 600 }}>Visit Link</a> : '---') : (s.link || '---')}
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                           <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                               <button 
                                 onClick={() => {
                                   navigator.clipboard.writeText(s.link || '');
                                   toast.success('Copied to clipboard!');
                                 }} 
                                 className="btn btn-sm btn-outline" 
                                 title="Copy Link/Details"
                               >
                                 <HiOutlineClipboardCopy />
                               </button>
                               <button onClick={() => setEditSource(s)} className="btn btn-sm btn-outline" title="Edit"><HiPencilAlt /></button>
                               <button onClick={async () => { if(await showConfirm('Remove?')) { await fetch(`/api/admin/sources/${s.id}`, {method: 'DELETE'}); loadData(); } }} className="btn btn-sm btn-reject" title="Remove"><HiOutlineTrash /></button>
                           </div>
                        </td>
                      </tr>
                    ))}
                    {(!filteredSources || filteredSources.length === 0) && (
                      <tr><td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No sources found.</td></tr>
                    )}
                  </tbody>
                </>
              )}

              {activeTab === 'admins' && user.role === 'main' && (
                <>
                  <thead>
                    <tr><th>SL.</th><th>Username</th><th>Role</th><th style={{ textAlign: 'right' }}>Action</th></tr>
                  </thead>
                  <tbody>
                    {admins.map((adm, idx) => (
                      <tr key={adm.id}>
                        <td data-label="SL.">{idx + 1}</td>
                        <td data-label="Username"><div>{adm.username}</div></td>
                        <td data-label="Role"><div>{adm.role?.toUpperCase()}</div></td>
                        <td style={{ textAlign: 'right' }}>
                            <div className="manage-actions">
                               {adm.id !== user.userId && (
                                 <button onClick={async () => { if(await showConfirm('Delete?')) { await fetch(`/api/admin/users?id=${adm.id}`, {method: 'DELETE'}); loadData(); } }} className="btn btn-sm btn-reject" title="Delete"><HiOutlineTrash /></button>
                               )}
                            </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}
            </table>
          </div>
        )}

        {activeTab === 'sell' && user.role === 'main' && (
          <div style={{ padding: '0.75rem' }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '1rem', 
              marginBottom: '1.5rem',
              alignItems: 'flex-end'
            }}>
              <div className="compact-form-group" style={{ marginBottom: 0 }}>
                <label>Select Specialist</label>
                <select 
                  className="compact-form-control" 
                  value={sellWorkerId} 
                  onChange={(e) => { setSellWorkerId(e.target.value); setSelectedIds([]); }}
                >
                  <option value="">Choose Worker...</option>
                  {activeWorkers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
              
              {sellWorkerId && (
                 <form onSubmit={handleBulkSell} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', alignItems: 'flex-end' }}>
                    <div className="compact-form-group" style={{ marginBottom: 0 }}>
                      <label>Batch Total ($)</label>
                      <input 
                        type="number" step="0.01" className="compact-form-control" placeholder="0.00" required 
                        value={batchRev} onChange={e => setBatchRev(e.target.value)}
                      />
                    </div>
                    <div className="compact-form-group" style={{ marginBottom: 0 }}>
                      <label>Spec. Bill ($)</label>
                      <input 
                        type="number" step="0.01" className="compact-form-control" placeholder="0.00" required 
                        value={batchCost} onChange={e => setBatchCost(e.target.value)}
                      />
                    </div>
                    <div style={{ flex: '1' }}>
                       {selectedIds.length > 0 && (batchRev || batchCost) && (
                         <div style={{ fontSize: '10px', color: '#1e293b', marginBottom: '4px', fontWeight: 600 }}>
                           {selectedIds.length} Picked • {((parseFloat(batchRev) || 0) / selectedIds.length).toFixed(2)} rev / {((parseFloat(batchCost) || 0) / selectedIds.length).toFixed(2)} cost each
                         </div>
                       )}
                       <button type="submit" className="btn btn-sm" style={{ background: '#1e293b', color: '#fff', height: '31px', width: '100%', fontWeight: 700 }}>Execute Sale</button>
                    </div>
                 </form>
              )}
            </div>

            {sellWorkerId ? (
               <div className="table-responsive">
                <table className="compact-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>
                        <input 
                          type="checkbox" 
                          onChange={(e) => {
                            const workerIds = activeChannels.filter(c => c.worker_id == sellWorkerId).map(c => c.id);
                            if (e.target.checked) setSelectedIds(workerIds);
                            else setSelectedIds([]);
                          }} 
                          checked={selectedIds.length > 0 && selectedIds.length === activeChannels.filter(c => c.worker_id == sellWorkerId).length}
                        />
                      </th>
                      <th>Channel</th>
                      <th>Subs</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeChannels.filter(c => c.worker_id == sellWorkerId).map(c => (
                      <tr key={c.id}>
                        <td data-label="Pick">
                          <div>
                            <input 
                              type="checkbox" 
                              checked={selectedIds.includes(c.id)} 
                              onChange={(e) => {
                                if(e.target.checked) setSelectedIds([...selectedIds, c.id]);
                                else setSelectedIds(selectedIds.filter(id => id !== c.id));
                              }}
                            />
                          </div>
                        </td>
                        <td data-label="Channel"><div style={{ fontWeight: 600 }}>{c.channel_name}</div></td>
                        <td data-label="Subs"><div>{c.sub_count || 0}</div></td>
                        <td data-label="Status">
                          <div style={{ fontSize: '10px', fontWeight: 600, color: c.is_selected ? '#059669' : '#94a3b8' }}>
                            {c.is_selected ? 'ONLINE' : 'OFFLINE'}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {activeChannels.filter(c => c.worker_id == sellWorkerId).length === 0 && (
                      <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No unsold channels assigned to this specialist.</td></tr>
                    )}
                  </tbody>
                </table>
               </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '4rem', border: '1px dashed #e2e8f0', borderRadius: '8px', color: '#94a3b8' }}>
                Select a specialist to begin forming a Sale Unit.
              </div>
            )}
          </div>
        )}
      </div>
      )}

      {activeChannel && (
         <div className="modal-overlay">
            <div className="modal-content">
               <div style={{ marginBottom: '1rem', fontWeight: 700 }}>Update: {activeChannel.channel_name}</div>
               <form onSubmit={handleAddDailyUpdate}>
                  <div className="compact-form-group"><label>Uploads Today</label><input type="number" name="shorts_count" className="compact-form-control" defaultValue={activeChannel.shorts_count || 0} /></div>
                  <div className="compact-form-group"><label>Current Subs</label><input type="number" name="sub_count" className="compact-form-control" defaultValue={activeChannel.sub_count || 0} required /></div>
                  <div className="compact-form-group">
                    <label>Status</label>
                    <select name="status" className="compact-form-control" defaultValue={activeChannel.status || 'growing'}>
                       <option value="growing">Explosive (High)</option>
                       <option value="normal">Steady (Normal)</option>
                       <option value="flop">Stagnant (Low)</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem', marginTop: '1.5rem' }}>
                    <button type="button" onClick={() => setActiveChannel(null)} className="btn btn-sm btn-outline" style={{ flex: 1 }}>Cancel</button>
                    <button type="submit" className="btn btn-sm btn-approve" style={{ flex: 1 }}>Save</button>
                  </div>
               </form>
            </div>
         </div>
      )}

      {editWorker && (
         <div className="modal-overlay">
            <div className="modal-content">
               <div style={{ marginBottom: '1rem', fontWeight: 700 }}>Edit Specialist</div>
               <form onSubmit={handleUpdateWorker}>
                  <div className="compact-form-group"><label>Spec Name</label><input type="text" name="name" className="compact-form-control" defaultValue={editWorker.name} required /></div>
                  <div className="compact-form-group"><label>WhatsApp</label><input type="text" name="whatsapp" className="compact-form-control" defaultValue={editWorker.whatsapp} /></div>
                  <div style={{ display: 'flex', gap: '0.4rem', marginTop: '1.5rem' }}>
                    <button type="button" onClick={() => setEditWorker(null)} className="btn btn-sm btn-outline" style={{ flex: 1 }}>Cancel</button>
                    <button type="submit" disabled={submitting} className="btn btn-sm btn-approve" style={{ flex: 1 }}>{submitting ? '...' : 'Save'}</button>
                  </div>
               </form>
            </div>
         </div>
      )}

      {editSource && (
         <div className="modal-overlay">
            <div className="modal-content">
               <div style={{ marginBottom: '1rem', fontWeight: 700 }}>Edit Source</div>
               <form onSubmit={handleUpdateSource}>
                  <div className="compact-form-group"><label>Title</label><input type="text" name="caption" className="compact-form-control" defaultValue={editSource.caption} required /></div>
                  <div className="compact-form-group">
                    <label>Type</label>
                    <select name="audio" className="compact-form-control" defaultValue={editSource.audio} required>
                       <option value="audio">Audio</option>
                       <option value="caption">Caption</option>
                    </select>
                  </div>
                  <div className="compact-form-group"><label>Link or Caption Detail</label><input type="text" name="link" className="compact-form-control" defaultValue={editSource.link} required /></div>
                  <div style={{ display: 'flex', gap: '0.4rem', marginTop: '1.5rem' }}>
                    <button type="button" onClick={() => setEditSource(null)} className="btn btn-sm btn-outline" style={{ flex: 1 }}>Cancel</button>
                    <button type="submit" disabled={submitting} className="btn btn-sm btn-approve" style={{ flex: 1 }}>{submitting ? '...' : 'Save'}</button>
                  </div>
               </form>
            </div>
         </div>
      )}

      {editChannel && (
         <div className="modal-overlay">
            <div className="modal-content">
               <div style={{ marginBottom: '1rem', fontWeight: 700 }}>Edit Channel</div>
               <form onSubmit={handleEditChannel}>
                  <div className="compact-form-group"><label>Identity</label><input type="text" name="channel_name" className="compact-form-control" defaultValue={editChannel.channel_name} required /></div>
                  <div className="compact-form-group"><label>Link</label><input type="url" name="channel_link" className="compact-form-control" defaultValue={editChannel.channel_link} required /></div>
                  <div className="compact-form-group">
                    <label>Specialist</label>
                    <select name="worker_id" className="compact-form-control" defaultValue={editChannel.worker_id} required>
                       <option value="">N/A</option>
                       {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </select>
                  </div>
                  <div className="compact-form-group"><label>Date</label><input type="date" name="open_date" className="compact-form-control" defaultValue={editChannel.open_date ? editChannel.open_date.split('T')[0] : ''} /></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                     <div className="compact-form-group"><label>Gmail</label><input type="email" name="gmail" className="compact-form-control" defaultValue={editChannel.gmail || ''} /></div>
                     <div className="compact-form-group"><label>Password</label><input type="text" name="password" className="compact-form-control" defaultValue={editChannel.password || ''} /></div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem', marginTop: '1.5rem' }}>
                    <button type="button" onClick={() => setEditChannel(null)} className="btn btn-sm btn-outline" style={{ flex: 1 }}>Discard</button>
                    <button type="submit" className="btn btn-sm btn-approve" style={{ flex: 1 }}>Update</button>
                  </div>
               </form>
            </div>
         </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div style={{ padding: '1rem', fontSize: '12px' }}>Loading...</div>}>
      <AdminContent />
    </Suspense>
  );
}
