'use client';

import { useEffect, useState, useRef, Suspense, useMemo, Fragment } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  HiKey, HiPlus, HiRefresh, HiPencilAlt, 
  HiOutlineTrash, HiChartBar, HiX, HiMenu,
  HiTrendingUp, HiUsers, HiCube, HiCurrencyDollar, HiFire, HiStar, HiOutlineClipboardCopy,
  HiEye, HiEyeOff, HiCheck, HiLockClosed, HiLockOpen
} from 'react-icons/hi';
import { getSocket } from '@/lib/socket';
import { useUI } from '@/components/UIContext';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, AreaChart, Area
} from 'recharts';
import { normalizeUrlForPaste } from '@/lib/youtubeChannelUrl';

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

function CredentialCopyBtn({ gmail, pass }) {
  const [copied, setCopied] = useState(false);
  const { toast } = useUI();

  const handleCopy = () => {
    const text = `${gmail || ''}\n${pass || ''}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Credentials copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="drawer-item" style={{ minWidth: 'auto', marginLeft: 'auto', alignSelf: 'center' }}>
      <button 
        onClick={handleCopy}
        className={`btn btn-sm ${copied ? 'btn-approve' : 'btn-outline'}`}
        style={{ 
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          width: '32px', height: '32px', padding: 0,
          background: copied ? '#10b981' : '#fff', 
          borderRadius: '6px',
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transform: copied ? 'scale(1.15)' : 'scale(1)',
          color: copied ? '#fff' : '#1e293b'
        }}
        title="Copy All Credentials"
      >
        {copied ? <HiCheck style={{ fontSize: '16px' }} /> : <HiOutlineClipboardCopy style={{ fontSize: '16px' }} />}
      </button>
    </div>
  );
}

function AdminContent() {
  const { showConfirm, toast } = useUI();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';
  
  const [user, setUser] = useState(null);
  const [channels, setChannels] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [employeeApplications, setEmployeeApplications] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [sources, setSources] = useState([]);
  const [editEmployee, setEditEmployee] = useState(null);
  const [myProfile, setMyProfile] = useState(null);
  
  const [showAddChannel, setShowAddChannel] = useState(false);
  const [showAddWorker, setShowAddWorker] = useState(false);
  const [showAddSource, setShowAddSource] = useState(false);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [showAddBuyer, setShowAddBuyer] = useState(false);
  const [activeChannel, setActiveChannel] = useState(null);
  const [editChannel, setEditChannel] = useState(null); 
  const [editWorker, setEditWorker] = useState(null);
  const [editSource, setEditSource] = useState(null);
  const [passwordTargetEmployee, setPasswordTargetEmployee] = useState(null);
  const [employeeUsernameInput, setEmployeeUsernameInput] = useState('');
  const [employeePasswordInput, setEmployeePasswordInput] = useState('');
  const [employeeResetPassword, setEmployeeResetPassword] = useState(true);
  const [showEmployeePassword, setShowEmployeePassword] = useState(false);
  const [employeePasswordResult, setEmployeePasswordResult] = useState(null);
  const staffSessionRef = useRef({ userId: null, role: null });

  const [passwordTargetBuyer, setPasswordTargetBuyer] = useState(null);
  const [buyerPasswordInput, setBuyerPasswordInput] = useState('');
  const [showBuyerPassword, setShowBuyerPassword] = useState(false);
  const [buyerPasswordResult, setBuyerPasswordResult] = useState(null);

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

  const soldWorkers = useMemo(() => {
    const soldWorkerIds = new Set(channels.filter(c => c.is_sold).map(c => c.worker_id));
    return workers.filter(w => soldWorkerIds.has(w.id));
  }, [channels, workers]);

  const filteredWorkers = useMemo(() => {
    let result = workers || [];
    if (filters.search) {
      result = result.filter(w => 
        (w.name || '').toLowerCase().includes(filters.search.toLowerCase()) || 
        (w.whatsapp || '').toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    return result;
  }, [workers, filters]);

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
        const [cData, wData, sData] = await Promise.all([
          cRes.json(),
          wRes.json(),
          sRes.json()
        ]);
        setChannels(Array.isArray(cData) ? cData : []);
        setWorkers(Array.isArray(wData) ? wData : []);
        setSources(Array.isArray(sData) ? sData : []);
  
        if (profile.role === 'admin') {
          const [uRes, eRes, bRes, jobRes] = await Promise.all([
            fetch('/api/admin/users'),
            fetch('/api/admin/employees'),
            fetch('/api/admin/buyers'),
            fetch('/api/admin/employee-applications'),
          ]);
          
          const [uData, eData, bData, jData] = await Promise.all([
            uRes.json(),
            eRes.json(),
            bRes.json(),
            jobRes.json()
          ]);
          
          setAdmins(Array.isArray(uData) ? uData : []);
          setEmployees(Array.isArray(eData) ? eData : []);
          setBuyers(Array.isArray(bData) ? bData : []);
          setEmployeeApplications(Array.isArray(jData) ? jData : []);
        }

      // Fetch personal profile for everyone
      const mpRes = await fetch('/api/admin/employees?me=true');
      setMyProfile(await mpRes.json());
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
    // Clear all edit states when switching tabs to prevent blank pages or state leakage
    setEditEmployee(null);
    setEditChannel(null);
    setEditWorker(null);
    setEditSource(null);
    
    if (activeTab === 'dashboard') {
      loadAnalytics();
    }
  }, [activeTab]);

  useEffect(() => {
    if (user?.userId != null) {
      staffSessionRef.current = { userId: user.userId, role: user.role };
    }
  }, [user]);

  useEffect(() => {
    loadData();

    const socket = getSocket();
    if (socket) {
      const handleUpdate = () => {
        console.log('Real-time update received');
        loadData();
      };
      const handleSessionInvalidate = (data) => {
        const { userId: uid, role } = staffSessionRef.current;
        if (data?.userId != null && Number(data.userId) === Number(uid)) {
          window.location.href = role === 'employee' ? '/employee/login' : '/admin/login';
        }
      };
      socket.on('channel-updated', handleUpdate);
      socket.on('staff-session-invalidate', handleSessionInvalidate);
      return () => {
        socket.off('channel-updated', handleUpdate);
        socket.off('staff-session-invalidate', handleSessionInvalidate);
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

  const handleEmployeePasswordReset = async () => {
    const target = passwordTargetEmployee;
    if (!target) return;

    const nextUsername = employeeUsernameInput.trim();
    if (nextUsername.length < 2) {
      toast.error('Username must be at least 2 characters');
      return;
    }

    const usernameWillChange = nextUsername !== String(target.username || '').trim();
    const useGenerated = employeePasswordInput.trim() === '';
    if (employeeResetPassword && !useGenerated && employeePasswordInput.trim().length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (!employeeResetPassword && !usernameWillChange) {
      toast.error('Change the username or enable password reset');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        id: target.admin_id,
        username: nextUsername,
      };
      if (employeeResetPassword) {
        payload.newPassword = useGenerated ? undefined : employeePasswordInput.trim();
        payload.generate = useGenerated;
      }

      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to update staff account');
        return;
      }

      const shownPassword = data.generatedPassword;
      const newLoginName = data.username || nextUsername;

      setPasswordTargetEmployee(null);
      setEmployeePasswordInput('');
      setEmployeeUsernameInput('');
      setEmployeeResetPassword(true);
      setShowEmployeePassword(false);

      if (shownPassword) {
        setEmployeePasswordResult({ loginUsername: newLoginName, password: shownPassword });
        try {
          await navigator.clipboard.writeText(shownPassword);
          toast.success(
            data.username
              ? 'Username & password updated. Copied. Staff signed out elsewhere.'
              : 'Password updated. Copied. Staff signed out elsewhere.'
          );
        } catch {
          toast.success(
            data.username
              ? 'Username & password updated. Copy from the dialog.'
              : 'Password updated. Copy from the dialog.'
          );
        }
      } else {
        if (data.username) {
          toast.success('Username updated. Staff signed out elsewhere.');
        }
        loadData();
      }
    } catch (err) {
      console.error(err);
      toast.error('Error updating staff account');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBuyerPasswordReset = async () => {
    const target = passwordTargetBuyer;
    if (!target) return;
    setSubmitting(true);
    try {
      const useGenerated = buyerPasswordInput.trim() === '';
      const res = await fetch('/api/admin/buyers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: target.id,
          newPassword: useGenerated ? undefined : buyerPasswordInput.trim(),
          generate: useGenerated,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to reset password');
        return;
      }

      const shownPassword = data.generatedPassword;
      if (!shownPassword) {
        toast.error('Server did not return the new password');
        return;
      }

      setPasswordTargetBuyer(null);
      setBuyerPasswordInput('');
      setShowBuyerPassword(false);
      setBuyerPasswordResult({ label: target.full_name || target.email || 'Buyer', password: shownPassword });

      try {
        await navigator.clipboard.writeText(shownPassword);
        toast.success('Password updated. Copied to clipboard.');
      } catch {
        toast.success('Password updated. Copy from the dialog.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error resetting password');
    } finally {
      setSubmitting(false);
    }
  };

  const [submitting, setSubmitting] = useState(false);

  const handleBuyerStatus = async (buyerId, status) => {
    const approved = await showConfirm(`Set this buyer as ${status.toUpperCase()}?`);
    if (!approved) return;
    try {
      const res = await fetch('/api/admin/buyers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: buyerId, status })
      });
      if (res.ok) {
        toast.success('Buyer status updated.');
        loadData();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to update buyer.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update buyer.');
    }
  };

  const handleBuyerToggle = async (buyerId, key, value, confirmMsg) => {
    const approved = await showConfirm(confirmMsg);
    if (!approved) return;
    try {
      const payload = { id: buyerId };
      payload[key] = value;
      const res = await fetch('/api/admin/buyers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        toast.success('Buyer updated.');
        loadData();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to update buyer.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update buyer.');
    }
  };

  const handleAddBuyer = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const formData = new FormData(e.target);
      const res = await fetch('/api/admin/buyers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.get('full_name'),
          companyName: formData.get('company_name'),
          phone: formData.get('phone'),
          email: formData.get('email'),
          password: formData.get('password'),
          status: formData.get('status') || 'approved',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to create buyer.');
        return;
      }
      toast.success('Buyer account created.');
      setShowAddBuyer(false);
      loadData();
      e.target.reset();
    } catch (err) {
      console.error(err);
      toast.error('Failed to create buyer.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmployeeBlock = async (adminId, block) => {
    const ok = await showConfirm(
      block
        ? 'Block this staff member? They will be logged out immediately and cannot sign in until unblocked.'
        : 'Unblock this staff member? They will be able to sign in again.'
    );
    if (!ok) return;
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: adminId, is_blocked: block }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Update failed.');
        return;
      }
      toast.success(block ? 'Staff blocked.' : 'Staff unblocked.');
      loadData();
    } catch (err) {
      console.error(err);
      toast.error('Request failed.');
    }
  };

  const handleJobApplicationDecision = async (applicationId, status) => {
    const ok = await showConfirm(
      status === 'approved'
        ? 'Approve this applicant? A unique emp- username will be created and they can log in with their registration password.'
        : 'Reject this application?'
    );
    if (!ok) return;
    try {
      const res = await fetch('/api/admin/employee-applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: applicationId, status }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Update failed.');
        return;
      }
      if (status === 'approved' && data.assignedUsername) {
        toast.success(`Approved. Username: ${data.assignedUsername}`);
      } else {
        toast.success('Application updated.');
      }
      loadData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update application.');
    }
  };

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
    const linkCheck = normalizeUrlForPaste(String(formData.get('channel_link') || ''));
    if (!linkCheck.ok) {
      toast.error(linkCheck.error || 'Invalid YouTube channel link.');
      return;
    }
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
    if (res.ok) {
      setShowAddChannel(false);
      loadData();
      e.target.reset();
    } else {
      try {
        const err = await res.json();
        toast.error(err?.error || 'Could not save channel.');
      } catch {
        toast.error('Could not save channel.');
      }
    }
  };

  const handleAddDailyUpdate = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const channel_id = activeChannel.id;
    const shorts_count = parseInt(formData.get('shorts_count')) || 0;
    const sub_count = parseInt(formData.get('sub_count')) || 0;
    const status = formData.get('status');

    // Optimistic UI Update: close modal immediately
    setActiveChannel(null);

    // Update local channel state optimistically
    setChannels(prev => prev.map(c => 
      c.id === channel_id 
        ? { ...c, shorts_count, sub_count, status } 
        : c
    ));

    // Background fetch
    fetch('/api/admin/daily-updates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel_id,
        shorts_count,
        sub_count,
        status
      }),
    }).then(res => {
      if (res.ok) {
        loadData();
      } else {
        toast.error('Failed to update stats in background');
        loadData();
      }
    }).catch(err => {
      console.error(err);
      toast.error('Error updating stats');
      loadData();
    });
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
    const linkCheck = normalizeUrlForPaste(String(formData.get('channel_link') || ''));
    if (!linkCheck.ok) {
      toast.error(linkCheck.error || 'Invalid YouTube channel link.');
      return;
    }
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
    if (res.ok) {
      setEditChannel(null);
      loadData();
    } else {
      try {
        const err = await res.json();
        toast.error(err?.error || 'Update failed.');
      } catch {
        toast.error('Update failed.');
      }
    }
  };

  const handleToggle = async (id, status) => {
    // Optimistic local state update
    const newStatus = !status;
    setChannels(prev => prev.map(c => 
      c.id === id ? { ...c, is_selected: newStatus } : c
    ));

    // Background fetch
    fetch(`/api/admin/channels/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_selected: newStatus }),
    }).then(res => {
      if (res.ok) {
        // Success: sync data silently if needed, or just let it be
        loadData(); 
      } else {
        toast.error('Failed to update status on server');
        loadData(); // Revert on failure
      }
    }).catch(err => {
      console.error(err);
      toast.error('Network error updating status');
      loadData(); // Revert on failure
    });
  };

  const handleUpdateEmployeeProfile = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    data.admin_id = editEmployee.admin_id;

    console.log("[DEBUG] Updating Employee Profile:", data);

    try {
      const res = await fetch('/api/admin/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        toast.success('Staff profile updated!');
        setEditEmployee(null);
        loadData();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to update');
      }
    } catch (err) {
      toast.error('Server error');
    }
  };

  const activeChannels = filteredActive;
  const soldChannels = filteredSold;

  if (!user) return <div style={{ padding: '1rem', fontSize: '12px' }}>Loading...</div>;

  return (
    <div className="admin-dashboard">
      <header className="admin-header" style={{ padding: '0.75rem 0', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%' }}>
           <div>
              <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
                Internal Management System
              </div>
              <h1 className="admin-title" style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                 {activeTab === 'sales' ? 'Profit Ledger' : activeTab === 'admins' ? 'User Administration' : activeTab === 'buyers' ? 'Buyer Requests' : activeTab === 'recruitment' ? 'Job Applications' : activeTab === 'sell' ? 'Sell Unit' : activeTab === 'dashboard' ? 'Market Overview' : activeTab === 'performance' ? 'Staff Performance' : activeTab === 'profile' ? 'My Profile' : (activeTab || '').charAt(0).toUpperCase() + (activeTab || '').slice(1)}
              </h1>
           </div>
           <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
              <div style={{ fontSize: '9px', color: '#cbd5e1', fontWeight: 600, letterSpacing: '0.05em' }}>AUTHORIZED ACCESS ONLY</div>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                 {activeTab === 'admins' && user.role === 'admin' && (
                   <button onClick={() => setShowAddAdmin(!showAddAdmin)} className="btn btn-sm" style={{ background: '#1e293b', color: '#fff', fontSize: '11px' }}>
                     {showAddAdmin ? 'Cancel' : 'Add User'}
                   </button>
                 )}
                 {activeTab === 'workers' && (
                   <button onClick={() => setShowAddWorker(!showAddWorker)} className="btn btn-sm btn-approve" style={{ fontSize: '11px' }}>
                     {showAddWorker ? 'Cancel' : 'Add Specialist'}
                   </button>
                 )}
                 {activeTab === 'channels' && (
                   <button onClick={() => setShowAddChannel(!showAddChannel)} className="btn btn-sm btn-approve" style={{ fontSize: '11px' }}>
                     {showAddChannel ? 'Cancel' : 'Add Channel'}
                   </button>
                 )}
                 {activeTab === 'sources' && (
                   <button onClick={() => setShowAddSource(!showAddSource)} className="btn btn-sm btn-approve" style={{ fontSize: '11px' }}>
                     {showAddSource ? 'Cancel' : 'Add Source'}
                   </button>
                 )}
                 {activeTab === 'buyers' && user.role === 'admin' && (
                   <button onClick={() => setShowAddBuyer(!showAddBuyer)} className="btn btn-sm btn-approve" style={{ fontSize: '11px' }}>
                     {showAddBuyer ? 'Cancel' : 'Add Buyer'}
                   </button>
                 )}
              </div>
           </div>
        </div>
      </header>


      {activeTab === 'dashboard' && analytics && (
        <div className="dashboard-content" style={{ marginBottom: '1rem' }}>
           {user.role === 'employee' && (
              <div className="dashboard-card" style={{ marginBottom: '1rem', padding: '1rem', background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', color: '#fff', border: 'none' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div>
                       <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Inventory Mission</div>
                       <div style={{ fontSize: '18px', fontWeight: 800 }}>Channel Acquisition Goal</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                       <div style={{ fontSize: '24px', fontWeight: 900, color: '#10b981' }}>
                          {analytics?.summary?.contract_target > 0 
                             ? ((analytics?.summary?.total_channels / analytics?.summary?.contract_target) * 100).toFixed(1) 
                             : '0.0'}%
                       </div>
                       <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                          {analytics?.summary?.total_channels} / {analytics?.summary?.contract_target || 0} Complete
                       </div>
                    </div>
                 </div>
                 <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ 
                       width: `${Math.min(100, analytics?.summary?.contract_target > 0 ? (analytics?.summary?.total_channels / analytics?.summary?.contract_target) * 100 : 0)}%`, 
                       height: '100%', 
                       background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)',
                       boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)',
                       transition: 'width 1s ease-in-out'
                    }} />
                 </div>
                 <div style={{ marginTop: '0.5rem', fontSize: '11px', color: '#cbd5e1', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Started from zero</span>
                    <span>Target: {analytics?.summary?.contract_target || 0} Units</span>
                 </div>
              </div>
           )}

           <div className="analytics-grid" style={{ gap: '0.6rem', marginBottom: '1rem' }}>
              {user.role !== 'employee' && (
                <>
                  <div className="stat-card" style={{ padding: '0.6rem 0.85rem' }}>
                    <div className="stat-label">Total Revenue</div>
                    <div className="stat-value" style={{ fontSize: '1.15rem' }}>৳{parseFloat(analytics?.summary?.total_revenue || 0).toLocaleString()}</div>
                  </div>
                  <div className="stat-card" style={{ padding: '0.6rem 0.85rem' }}>
                    <div className="stat-label">Net Profit</div>
                    <div className="stat-value" style={{ fontSize: '1.15rem' }}>৳{parseFloat(analytics?.summary?.total_profit || 0).toLocaleString()}</div>
                  </div>
                </>
              )}
              <div className="stat-card" style={{ padding: '0.6rem 0.85rem' }}>
                 <div className="stat-label">Active Stock</div>
                 <div className="stat-value" style={{ fontSize: '1.15rem' }}>{analytics?.summary?.active_count || 0}</div>
              </div>
              <div className="stat-card" style={{ padding: '0.6rem 0.85rem' }}>
                 <div className="stat-label">Total Sold</div>
                 <div className="stat-value" style={{ fontSize: '1.15rem' }}>{analytics?.summary?.sold_count || 0}</div>
              </div>
              {user.role === 'employee' && (
                 <div className="stat-card" style={{ padding: '0.6rem 0.85rem', borderLeft: '3px solid #10b981', background: 'rgba(16, 185, 129, 0.05)' }}>
                    <div className="stat-label" style={{ color: '#059669', fontWeight: 800 }}>Personal Earnings</div>
                    <div className="stat-value" style={{ fontSize: '1.15rem', color: '#10b981' }}>
                       ৳{parseFloat(analytics?.summary?.earnings_so_far || 0).toLocaleString()}
                    </div>
                    <div style={{ fontSize: '9px', color: '#64748b', marginTop: '2px' }}>
                       Rate: ৳{(analytics?.summary?.earnings_per_channel || 0).toFixed(2)} / unit
                    </div>
                 </div>
              )}
           </div>

        {activeTab === 'admins' && user.role === 'admin' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
             {/* Admin specific stats can go here if needed */}
          </div>
        )}


           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '0.3rem', marginBottom: '1rem' }}>
              <div className="dashboard-card" style={{ minHeight: '320px', display: 'flex', flexDirection: 'column', padding: '1.5rem' }}>
                 <div className="dashboard-card-title" style={{ textAlign: 'center', marginBottom: '1rem', width: '100%' }}>Stock Status Flow</div>
                 <div style={{ flex: 1, width: '100%', minHeight: '250px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ResponsiveContainer width="100%" height={250}>
                       <PieChart>
                          <Pie
                             data={analytics.statusDist || []}
                             cx="50%"
                             cy="50%"
                             innerRadius={65}
                             outerRadius={85}
                             paddingAngle={8}
                             dataKey="count"
                             nameKey="status"
                             stroke="none"
                          >
                             {(analytics.statusDist || []).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={
                                   entry.status === 'growing' ? '#10b981' : 
                                   entry.status === 'normal' ? '#3b82f6' : 
                                   entry.status === 'flop' ? '#ef4444' : '#94a3b8'
                                } />
                             ))}
                          </Pie>
                          <Tooltip 
                             contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.12)', fontSize: '12px', padding: '8px 12px' }}
                             formatter={(value, name) => [value, (name || '').charAt(0).toUpperCase() + (name || '').slice(1)]}
                          />
                          <Legend 
                             verticalAlign="bottom" 
                             align="center" 
                             iconType="circle" 
                             iconSize={8}
                             wrapperStyle={{ fontSize: '11px', fontWeight: 600, color: '#64748b', paddingTop: '20px' }} 
                          />
                       </PieChart>
                    </ResponsiveContainer>
                 </div>
              </div>

              <div className="dashboard-card" style={{ minHeight: '300px' }}>
                 <div className="dashboard-card-title">Growth Velocity (Historical)</div>
                 <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={analytics.creationTrend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                       <defs>
                          <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#1e293b" stopOpacity={0.1}/>
                             <stop offset="95%" stopColor="#1e293b" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                       <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                       <Tooltip 
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
                       />
                       <Area type="monotone" dataKey="count" name="Channels Added" stroke="#1e293b" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>

              <div className="dashboard-card" style={{ minHeight: '300px' }}>
                 <div className="dashboard-card-title">Specialist Benchmark</div>
                 <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={analytics?.bestWorkers?.slice(0, 5)} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                       <XAxis type="number" hide />
                       <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#1e293b', fontWeight: 600 }} width={80} />
                       <Tooltip 
                          cursor={{ fill: 'transparent' }}
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
                          formatter={(value) => [value.toLocaleString(), 'Total Subs']}
                       />
                       <Bar dataKey="total_subs" radius={[0, 4, 4, 0]} barSize={20}>
                          {analytics?.bestWorkers?.slice(0, 5).map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]} />
                          ))}
                       </Bar>
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>

           <div className="dashboard-sections">
              <div className="dashboard-card">
                 <div className="dashboard-card-title">High Performance</div>
                 <div className="bento-list">
                    {(analytics?.bestChannels || []).map(c => (
                      <div key={c.id} className="bento-item">
                         <div className="bento-main">
                            <div className="bento-name">{c.channel_name}</div>
                            <div className="bento-sub">{c.worker_name || 'N/A'} • {c.status || 'New'}</div>
                         </div>
                         <div className="bento-badge">{c.sub_count?.toLocaleString() || 0}</div>
                      </div>
                    ))}
                    {(analytics?.bestChannels || []).length === 0 && <div style={{ textAlign: 'center', padding: '0.5rem', color: '#94a3b8', fontSize: '10px' }}>No data</div>}
                 </div>
              </div>

              <div className="dashboard-card">
                 <div className="dashboard-card-title">Top Specialists</div>
                 <div className="bento-list">
                    {(analytics?.bestWorkers || []).map((w, idx) => (
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
                    {(analytics?.oldChannels || []).map(c => (
                      <div key={c.id} className="bento-item">
                         <div className="bento-main">
                            <div className="bento-name">{c.channel_name}</div>
                            <div className="bento-sub">{c.days_old}d in stock</div>
                         </div>
                         <div className="bento-badge">{c.open_date ? new Date(c.open_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '--'}</div>
                      </div>
                    ))}
                    {(analytics?.oldChannels || []).length === 0 && <div style={{ textAlign: 'center', padding: '0.5rem', color: '#94a3b8', fontSize: '10px' }}>No data</div>}
                 </div>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'performance' && analytics && user.role === 'admin' && (
        <div className="dashboard-content">
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="dashboard-card" style={{ minHeight: '350px' }}>
                 <div className="dashboard-card-title">Staff Acquisition Benchmark (Pillar Chart)</div>
                 <div style={{ flex: 1, padding: '1rem' }}>
                   <ResponsiveContainer width="100%" height={280}>
                       <BarChart data={analytics?.staffPerformance || []} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                         <XAxis dataKey="username" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600 }} />
                         <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                         <Tooltip 
                           cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                           contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}
                         />
                         <Bar dataKey="total_brought" name="Channels Brought" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={35} />
                         <Bar dataKey="sold_count" name="Channels Sold" fill="#10b981" radius={[4, 4, 0, 0]} barSize={35} />
                       </BarChart>
                   </ResponsiveContainer>
                 </div>
              </div>

              <div className="dashboard-card" style={{ minHeight: '350px' }}>
                 <div className="dashboard-card-title">Inventory Share by Staff</div>
                 <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <ResponsiveContainer width="100%" height={280}>
                       <PieChart>
                         <Pie
                           data={analytics?.staffPerformance || []}
                           cx="50%"
                           cy="50%"
                           innerRadius={70}
                           outerRadius={95}
                           paddingAngle={5}
                           dataKey="total_brought"
                           nameKey="username"
                           stroke="none"
                         >
                           {(analytics?.staffPerformance || []).map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'][index % 6]} />
                           ))}
                         </Pie>
                         <Tooltip 
                           contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}
                         />
                         <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 600, paddingTop: '15px' }} />
                       </PieChart>
                   </ResponsiveContainer>
                 </div>
              </div>
           </div>

           <div className="dashboard-card">
              <div className="dashboard-card-title">Staff Performance Leaderboard</div>
              <div className="table-responsive">
                <table className="compact-table">
                  <thead>
                    <tr>
                      <th>Staff Member</th>
                      <th>Total Brought</th>
                      <th>Sold Units</th>
                      <th>Conv. Rate</th>
                      <th style={{ textAlign: 'right' }}>Total Commission</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(analytics?.staffPerformance || []).map((staff, idx) => (
                      <tr key={idx}>
                        <td>
                           <div style={{ fontWeight: 700, fontSize: '13px' }}>{staff.full_name}</div>
                           <div style={{ fontSize: '10px', color: '#94a3b8' }}>@{staff.username}</div>
                        </td>
                        <td><div style={{ fontWeight: 600 }}>{staff.total_brought} Units</div></td>
                        <td><div style={{ fontWeight: 600, color: '#10b981' }}>{staff.sold_count} Sold</div></td>
                        <td>
                           <div style={{ fontSize: '11px', fontWeight: 700 }}>
                              {staff.total_brought > 0 ? ((staff.sold_count / staff.total_brought) * 100).toFixed(1) : 0}%
                           </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                           <div style={{ fontWeight: 800, color: '#0f172a' }}>৳{parseFloat(staff.earnings || 0).toLocaleString()}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
           </div>
        </div>
      )}

      {showAddAdmin && (
        <div style={{ padding: '0.6rem 0.75rem', border: '1px solid #f1f5f9', borderRadius: '4px', marginBottom: '0.75rem', background: '#f8fafc' }}>
           <form onSubmit={handleCreateAdmin} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem', alignItems: 'flex-end' }}>
              <div className="compact-form-group" style={{ marginBottom: 0 }}><label style={{ fontSize: '10px' }}>User ID</label><input type="text" name="username" className="compact-form-control" style={{ fontSize: '11.5px' }} required /></div>
              <div className="compact-form-group" style={{ marginBottom: 0 }}><label style={{ fontSize: '10px' }}>Password</label><input type="password" name="password" className="compact-form-control" style={{ fontSize: '11.5px' }} required /></div>
              <div className="compact-form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '10px' }}>Access Level</label>
                <select name="role" className="compact-form-control" style={{ fontSize: '11.5px' }} required>
                   <option value="employee">Employee</option>
                   <option value="admin">Admin</option>
                </select>
              </div>
              <button type="submit" className="btn btn-sm" style={{ background: '#0f172a', color: '#fff', height: '28px', fontSize: '11px' }}>Create User</button>
           </form>
        </div>
      )}

      {showAddWorker && (
        <div style={{ padding: '0.6rem 0.75rem', border: '1px solid #f1f5f9', borderRadius: '4px', marginBottom: '0.75rem', background: '#f8fafc' }}>
           <form onSubmit={handleAddWorker} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
              <div className="compact-form-group" style={{ flex: 1, marginBottom: 0 }}><label style={{ fontSize: '10px' }}>Spec Name</label><input type="text" name="name" className="compact-form-control" style={{ fontSize: '11.5px' }} required /></div>
              <div className="compact-form-group" style={{ flex: 1, marginBottom: 0 }}><label style={{ fontSize: '10px' }}>WhatsApp</label><input type="text" name="whatsapp" className="compact-form-control" style={{ fontSize: '11.5px' }} /></div>
              <button type="submit" disabled={submitting} className="btn btn-sm btn-approve" style={{ height: '28px', fontSize: '11px' }}>
                {submitting ? 'Registering...' : 'Register Specialist'}
              </button>
           </form>
        </div>
      )}

      {showAddSource && (
        <div style={{ padding: '0.6rem 0.75rem', border: '1px solid #f1f5f9', borderRadius: '4px', marginBottom: '0.75rem', background: '#f8fafc' }}>
           <form onSubmit={handleAddSource} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem', alignItems: 'flex-end' }}>
              <div className="compact-form-group" style={{ marginBottom: 0 }}><label style={{ fontSize: '10px' }}>Title</label><input type="text" name="caption" className="compact-form-control" style={{ fontSize: '11.5px' }} required /></div>
              <div className="compact-form-group" style={{ marginBottom: 0 }}>
                 <label style={{ fontSize: '10px' }}>Type</label>
                 <select name="audio" className="compact-form-control" style={{ fontSize: '11.5px' }} required>
                    <option value="audio">Audio</option>
                    <option value="caption">Caption</option>
                 </select>
              </div>
              <div className="compact-form-group" style={{ marginBottom: 0 }}><label style={{ fontSize: '10px' }}>Link or Caption</label><input type="text" name="link" className="compact-form-control" style={{ fontSize: '11.5px' }} required /></div>
              <button type="submit" disabled={submitting} className="btn btn-sm btn-approve" style={{ height: '28px', fontSize: '11px' }}>
                {submitting ? '...' : 'Add Source'}
              </button>
           </form>
        </div>
      )}

      {showAddChannel && (
        <div style={{ padding: '0.6rem 0.75rem', border: '1px solid #f1f5f9', borderRadius: '4px', marginBottom: '0.75rem', background: '#f8fafc' }}>
           <form onSubmit={handleAddChannel} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.5rem', alignItems: 'flex-end' }}>
              <div className="compact-form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '10px' }}>ID Name</label>
                <input type="text" name="channel_name" className="compact-form-control" style={{ fontSize: '11.5px' }} required />
              </div>
              <div className="compact-form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '10px' }}>Link</label>
                <input type="url" name="channel_link" className="compact-form-control" style={{ fontSize: '11.5px' }} required />
              </div>
              <div className="compact-form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '10px' }}>Specialist</label>
                <select name="worker_id" className="compact-form-control" style={{ fontSize: '11.5px' }} required>
                   <option value="">Choose...</option>
                   {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
              <div className="compact-form-group" style={{ marginBottom: 0 }}><label style={{ fontSize: '10px' }}>Open Date</label><input type="date" name="open_date" className="compact-form-control" style={{ fontSize: '11.5px' }} /></div>
              <div className="compact-form-group" style={{ marginBottom: 0 }}><label style={{ fontSize: '10px' }}>Gmail</label><input type="email" name="gmail" className="compact-form-control" style={{ fontSize: '11.5px' }} placeholder="Optional" /></div>
              <div className="compact-form-group" style={{ marginBottom: 0 }}><label style={{ fontSize: '10px' }}>Pass</label><input type="text" name="password" className="compact-form-control" style={{ fontSize: '11.5px' }} placeholder="Optional" /></div>
              <button type="submit" className="btn btn-sm btn-approve" style={{ height: '28px', fontSize: '11px' }}>List Channel</button>
           </form>
        </div>
      )}

      {showAddBuyer && activeTab === 'buyers' && user.role === 'admin' && (
        <div style={{ padding: '0.6rem 0.75rem', border: '1px solid #f1f5f9', borderRadius: '4px', marginBottom: '0.75rem', background: '#f8fafc' }}>
          <form onSubmit={handleAddBuyer} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem', alignItems: 'flex-end' }}>
            <div className="compact-form-group" style={{ marginBottom: 0 }}><label style={{ fontSize: '10px' }}>Full Name</label><input type="text" name="full_name" className="compact-form-control" style={{ fontSize: '11.5px' }} required /></div>
            <div className="compact-form-group" style={{ marginBottom: 0 }}><label style={{ fontSize: '10px' }}>Company</label><input type="text" name="company_name" className="compact-form-control" style={{ fontSize: '11.5px' }} /></div>
            <div className="compact-form-group" style={{ marginBottom: 0 }}><label style={{ fontSize: '10px' }}>Phone</label><input type="text" name="phone" className="compact-form-control" style={{ fontSize: '11.5px' }} required /></div>
            <div className="compact-form-group" style={{ marginBottom: 0 }}><label style={{ fontSize: '10px' }}>Email</label><input type="email" name="email" className="compact-form-control" style={{ fontSize: '11.5px' }} required /></div>
            <div className="compact-form-group" style={{ marginBottom: 0 }}><label style={{ fontSize: '10px' }}>Password</label><input type="text" name="password" minLength={6} className="compact-form-control" style={{ fontSize: '11.5px' }} required /></div>
            <div className="compact-form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '10px' }}>Initial Status</label>
              <select name="status" className="compact-form-control" style={{ fontSize: '11.5px' }}>
                <option value="approved">Approved (instant access)</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <button type="submit" disabled={submitting} className="btn btn-sm btn-approve" style={{ height: '28px', fontSize: '11px' }}>
              {submitting ? 'Creating...' : 'Create Buyer'}
            </button>
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

      {['monitoring', 'channels', 'sales', 'workers', 'admins', 'employees'].includes(activeTab) && !editEmployee && (
        <div style={{ 
          display: 'flex', gap: '0.4rem', marginBottom: '0.75rem', 
          flexWrap: 'wrap', alignItems: 'center', background: '#fff', 
          padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid var(--adm-border)'
        }}>
          <div style={{ flex: '2', minWidth: '180px' }}>
            <input 
              type="text" 
              placeholder={activeTab === 'workers' ? "Search specialists..." : activeTab === 'sources' ? "Search sources..." : "Search accounts..."} 
              className="compact-form-control"
              value={filters.search} onChange={(e) => setFilters({...filters, search: e.target.value})}
              style={{ padding: '0.4rem 0.6rem', fontSize: '11.5px' }}
            />
          </div>
          {(['monitoring', 'channels', 'sales'].includes(activeTab)) && (
            <div style={{ flex: '1', minWidth: '110px' }}>
              <select 
                className="compact-form-control"
                style={{ padding: '0.4rem 0.6rem', fontSize: '11.5px' }}
                value={filters.workerId}
                onChange={(e) => setFilters({...filters, workerId: e.target.value})}
              >
                <option value="all">Any Staff</option>
                {(activeTab === 'sales' ? soldWorkers : workers).map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
          )}
          {(['monitoring', 'channels'].includes(activeTab)) && (
            <>
              <div style={{ flex: '1', minWidth: '110px' }}>
                <select 
                  className="compact-form-control"
                  style={{ padding: '0.4rem 0.6rem', fontSize: '11.5px' }}
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
              <div style={{ flex: '1', minWidth: '110px' }}>
                <select 
                  className="compact-form-control"
                  style={{ padding: '0.4rem 0.6rem', fontSize: '11.5px' }}
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
          {['monitoring', 'channels', 'sales'].includes(activeTab) && (
            <div style={{ flex: '1', minWidth: '110px' }}>
              <select 
                className="compact-form-control"
                style={{ padding: '0.4rem 0.6rem', fontSize: '11.5px' }}
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
          )}
          <button 
            onClick={() => setFilters({ search: '', workerId: 'all', kpiStatus: 'all', marketStatus: 'all', sortBy: 'default', sourceType: 'all' })}
            className="btn btn-sm btn-outline"
            style={{ padding: '0.35rem 0.6rem', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '11px', border: '1px solid #e2e8f0' }}
          >
            <HiRefresh /> Reset
          </button>
        </div>
      )}

      {activeTab === 'sources' && (
        <div style={{ 
          display: 'flex', gap: '0.4rem', marginBottom: '0.75rem', 
          flexWrap: 'wrap', alignItems: 'center', background: '#fff', 
          padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid var(--adm-border)'
        }}>
          <div style={{ flex: '2', minWidth: '180px' }}>
            <input 
              type="text" placeholder="Search title or details..." className="compact-form-control"
              value={filters.search} onChange={(e) => setFilters({...filters, search: e.target.value})}
              style={{ padding: '0.4rem 0.6rem', fontSize: '11.5px' }}
            />
          </div>
          <div style={{ flex: '1', minWidth: '110px' }}>
            <select 
              className="compact-form-control" value={filters.sourceType} onChange={(e) => setFilters({...filters, sourceType: e.target.value})}
              style={{ padding: '0.4rem 0.6rem', fontSize: '11.5px' }}
            >
              <option value="all">All Types</option>
              <option value="audio">Audio</option>
              <option value="caption">Caption</option>
            </select>
          </div>
          <button 
            onClick={() => setFilters({ search: '', workerId: 'all', kpiStatus: 'all', marketStatus: 'all', sortBy: 'default', sourceType: 'all' })}
            className="btn btn-sm btn-outline"
            style={{ padding: '0.35rem 0.6rem', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '11px', border: '1px solid #e2e8f0' }}
          >
            <HiRefresh /> Reset
          </button>
        </div>
      )}

      {['monitoring', 'channels', 'sales', 'workers', 'sources', 'admins', 'employees', 'buyers', 'recruitment', 'sell'].includes(activeTab) && !editEmployee && (
        <div className="compact-table-wrapper">
          {activeTab === 'recruitment' && user.role === 'admin' ? (
            <div className="table-responsive">
              <table className="compact-table">
                <thead>
                  <tr>
                    <th>SL.</th>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Mode</th>
                    <th>Circular</th>
                    <th>Status</th>
                    <th>Username</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {employeeApplications.map((row, idx) => (
                    <tr key={row.id}>
                      <td data-label="SL.">{idx + 1}</td>
                      <td data-label="Name"><div style={{ fontWeight: 600, fontSize: '12.5px' }}>{row.full_name}</div></td>
                      <td data-label="Phone"><div style={{ fontSize: '12px' }}>{row.phone}</div></td>
                      <td data-label="Email"><div style={{ fontSize: '12px' }}>{row.email}</div></td>
                      <td data-label="Mode"><div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 600 }}>{row.work_preference}</div></td>
                      <td data-label="Circular"><div style={{ fontSize: '11px', fontWeight: 500 }}>{row.job_reference || '—'}</div></td>
                      <td data-label="Status">
                        <div style={{ fontSize: '10.5px', fontWeight: 800, color: row.status === 'approved' ? '#059669' : row.status === 'rejected' ? '#dc2626' : '#b45309' }}>
                          {row.status?.toUpperCase()}
                        </div>
                      </td>
                      <td data-label="Username">
                        <div style={{ fontSize: '11px', fontWeight: 600, color: '#10b981' }}>
                          {row.assigned_username || '—'}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {row.status === 'pending' ? (
                          <div className="manage-actions" style={{ justifyContent: 'flex-end' }}>
                            <button
                              type="button"
                              onClick={() => handleJobApplicationDecision(row.id, 'approved')}
                              className="btn btn-sm btn-approve"
                              title="Approve"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
                            >
                              <HiCheck /> Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleJobApplicationDecision(row.id, 'rejected')}
                              className="btn btn-sm btn-reject"
                              title="Reject"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
                            >
                              <HiX /> Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '11px', color: '#94a3b8' }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {employeeApplications.length === 0 && (
                    <tr>
                      <td colSpan="9" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', fontSize: '12px' }}>
                        No job applications yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : activeTab !== 'sell' ? (
          <div className="table-responsive">
            <table className="compact-table">
              {activeTab === 'monitoring' && (
                <>
                  <thead>
                    <tr>
                      <th>Reg.</th>
                      <th>Channel</th>
                      <th>Specialist</th>
                      {user.role === 'admin' && <th>Added</th>}
                      <th>Total uploads</th>
                      <th>Subs</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Manage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeChannels.map((c, idx) => (
                      <Fragment key={c.id}>
                        <tr key={c.id}>
                          <td data-label="Reg.">{c.reg_no || (idx + 1)}</td>
                          <td data-label="Channel">
                            <div className="cell-content">
                              <div style={{ fontWeight: 600, fontSize: '12.5px' }}><a href={c.channel_link} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>{c.channel_name}</a></div>
                            </div>
                          </td>
                          <td data-label="Specialist"><div style={{ fontSize: '12px' }}>{c.worker_name || 'PENDING'}</div></td>
                          {user.role === 'admin' && <td data-label="Added By"><div style={{ fontSize: '11px', color: '#64748b' }}>{c.creator_name || '---'}</div></td>}
                          <td data-label="Total uploads"><div style={{ fontSize: '12px', fontWeight: 600 }}>{c.shorts_count || 0}</div></td>
                          <td data-label="Subs"><div style={{ fontSize: '12px', fontWeight: 600 }}>{c.sub_count ? c.sub_count.toLocaleString() : '---'}</div></td>
                          <td data-label="Status">
                             <div className="status-cell">
                               <div style={{ fontSize: '10px', fontWeight: 800, color: c.status === 'growing' ? '#059669' : c.status === 'normal' ? '#475569' : '#dc2626' }}>
                                  {c.status?.toUpperCase() || 'NEW'}
                               </div>
                               {c.last_update_time && (
                                 <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '1px', display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                                    <span style={{ color: '#6366f1', fontWeight: 700 }}>{getTimeAgo(c.last_update_time)}</span>
                                    <span style={{ fontSize: '8.5px' }}>
                                      {new Date(c.last_update_time).toLocaleDateString('en-GB')}
                                    </span>
                                 </div>
                               )}
                             </div>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                             <div style={{ display: 'flex', gap: '0.3rem', justifyContent: 'flex-end' }}>
                                <button onClick={() => { navigator.clipboard.writeText(c.channel_link || ''); toast.success('Link copied!'); }} className="btn btn-sm btn-outline" title="Copy Link"><HiOutlineClipboardCopy /></button>
                                <button onClick={() => toggleDrawer(c.id)} className="btn btn-sm btn-outline" title="Credentials">{expandedIds.includes(c.id) ? <HiEyeOff /> : <HiKey />}</button>
                                <button onClick={() => setActiveChannel(c)} className="btn btn-sm btn-outline" title="Update"><HiChartBar /></button>
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
                                   {(c.gmail || c.password) && <CredentialCopyBtn gmail={c.gmail} pass={c.password} />}
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
                      <th>Reg.</th>
                      <th>Channel</th>
                      <th>Specialist</th>
                      {user.role === 'admin' && <th>Added By</th>}
                      <th>Subs</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Ops</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeChannels.map((c, idx) => (
                      <Fragment key={c.id}>
                        <tr key={c.id}>
                          <td data-label="Reg.">{c.reg_no || (idx + 1)}</td>
                          <td data-label="Channel"><div style={{ fontWeight: 600, fontSize: '12.5px' }}><a href={c.channel_link} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>{c.channel_name}</a></div></td>
                          <td data-label="Specialist"><div style={{ fontSize: '12px' }}>{c.worker_name || 'PENDING'}</div></td>
                          {user.role === 'admin' && <td data-label="Added By"><div style={{ fontSize: '11px', color: '#64748b' }}>{c.creator_name || '---'}</div></td>}
                          <td data-label="Subs"><div style={{ fontSize: '12px', fontWeight: 600 }}>{c.sub_count || 0}</div></td>
                          <td>
                             <button onClick={() => handleToggle(c.id, c.is_selected)} className="action-link" style={{ color: c.is_selected ? '#10b981' : '#64748b' }}>
                               {c.is_selected ? 'ONLINE' : 'OFFLINE'}
                             </button>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                             <div className="manage-actions">
                                <button onClick={() => { navigator.clipboard.writeText(c.channel_link || ''); toast.success('Link copied!'); }} className="btn btn-sm btn-outline" title="Copy Link"><HiOutlineClipboardCopy /></button>
                                <button onClick={() => toggleDrawer(c.id)} className="btn btn-sm btn-outline" title="Credentials">{expandedIds.includes(c.id) ? <HiEyeOff /> : <HiKey />}</button>
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
                                   {(c.gmail || c.password) && <CredentialCopyBtn gmail={c.gmail} pass={c.password} />}
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

              {activeTab === 'sales' && user.role === 'admin' && (
                <>
                  <thead>
                    <tr>
                      <th>Reg.</th>
                      <th>Channel</th>
                      <th>Price (৳)</th>
                      <th>Cost (৳)</th>
                      <th>Profit (৳)</th>
                      <th style={{ textAlign: 'right' }}>Payout To</th>
                    </tr>
                  </thead>
                  <tbody>
                    {soldChannels.map((c, idx) => (
                      <tr key={c.id}>
                        <td data-label="Reg.">{c.reg_no || (idx + 1)}</td>
                        <td data-label="Channel"><div><a href={c.channel_link} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none', fontSize: '12.5px', fontWeight: 600 }}>{c.channel_name}</a></div></td>
                        <td data-label="Price"><div style={{ color: '#059669', fontSize: '12px', fontWeight: 600 }}>৳{c.sell_price}</div></td>
                        <td data-label="Cost"><div style={{ color: '#dc2626', fontSize: '12px', fontWeight: 600 }}>৳{c.worker_cost}</div></td>
                        <td data-label="Profit"><div style={{ fontWeight: 700, fontSize: '12px' }}>৳{(c.sell_price - c.worker_cost).toFixed(2)}</div></td>
                        <td style={{ textAlign: 'right' }} data-label="Payout To">
                           <div style={{ fontSize: '10.5px', fontWeight: 600, color: '#1e293b' }}>
                              {c.worker_name || 'SPECIALIST'}
                           </div>
                        </td>
                      </tr>
                    ))}
                    {soldChannels.length > 0 && (
                      <tr style={{ background: '#f8fafc', fontWeight: 700, borderTop: '2px solid #e2e8f0' }}>
                        <td colSpan="2" style={{ textAlign: 'right', fontSize: '10px', color: '#64748b' }}>TOTAL SUMMARY</td>
                        <td style={{ color: '#059669' }}>৳{salesStats.totalRev.toFixed(2)}</td>
                        <td style={{ color: '#dc2626' }}>৳{salesStats.totalCost.toFixed(2)}</td>
                        <td style={{ color: '#1e293b' }}>৳{(salesStats.totalRev - salesStats.totalCost).toFixed(2)}</td>
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
                    {filteredWorkers.map((w, idx) => (
                      <tr key={w.id}>
                        <td data-label="SL.">{idx + 1}</td>
                        <td data-label="Specialist"><div style={{ fontWeight: 600, fontSize: '12.5px' }}>{w.name}</div></td>
                        <td data-label="WhatsApp"><div style={{ fontSize: '12px' }}>{w.whatsapp || '---'}</div></td>
                        <td data-label="Added By"><div style={{ fontSize: '11px', color: '#64748b' }}>{w.creator_name || '---'}</div></td>
                        <td style={{ textAlign: 'right' }}>
                           <div className="manage-actions" style={{ justifyContent: 'flex-end' }}>
                               <button onClick={() => setEditWorker(w)} className="btn btn-sm btn-outline" title="Edit"><HiPencilAlt /></button>
                               <button onClick={async () => { if(await showConfirm('Remove?')) { await fetch(`/api/admin/workers/${w.id}`, {method: 'DELETE'}); loadData(); } }} className="btn btn-sm btn-reject" title="Remove"><HiOutlineTrash /></button>
                           </div>
                        </td>
                      </tr>
                    ))}
                    {filteredWorkers.length === 0 && (
                      <tr><td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No matching specialists found. Try adjusting your search.</td></tr>
                    )}
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
                        <td data-label="Title"><div style={{ fontWeight: 600, fontSize: '12px', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.caption}</div></td>
                        <td data-label="Type">
                          <div style={{ fontSize: '10px', fontWeight: 600, color: s.audio === 'audio' ? '#8b5cf6' : '#10b981', textTransform: 'uppercase' }}>
                            {s.audio === 'audio' ? 'Audio' : s.audio === 'caption' ? 'Caption' : '---'}
                          </div>
                        </td>
                        <td data-label="Link / Details">
                          <div style={{ fontSize: '11px' }}>
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

               {activeTab === 'employees' && user.role === 'admin' && (
                 <>
                   <thead>
                     <tr><th>SL.</th><th>Username</th><th>Name</th><th>Phone</th><th>Salary</th><th>Access</th><th style={{ textAlign: 'right' }}>Ops</th></tr>
                   </thead>
                   <tbody>
                     {employees.map((emp, idx) => (
                       <tr key={emp.admin_id}>
                         <td data-label="SL.">{idx + 1}</td>
                         <td data-label="Username"><div style={{ fontWeight: 600, fontSize: '12.5px' }}>{emp.username}</div></td>
                         <td data-label="Name"><div style={{ fontSize: '12px' }}>{emp.full_name || 'PENDING'}</div></td>
                         <td data-label="Phone"><div style={{ fontSize: '12px' }}>{emp.phone || '---'}</div></td>
                         <td data-label="Salary"><div style={{ fontSize: '12px', fontWeight: 600 }}>৳{parseFloat(emp.basic_salary || 0).toLocaleString()}</div></td>
                         <td data-label="Access">
                           <div style={{ fontSize: '10px', fontWeight: 800, color: Number(emp.is_blocked) ? '#dc2626' : '#059669' }}>
                             {Number(emp.is_blocked) ? 'BLOCKED' : 'ACTIVE'}
                           </div>
                         </td>
                         <td style={{ textAlign: 'right' }}>
                             <div className="manage-actions">
                                 <button onClick={() => setEditEmployee(emp)} className="btn btn-sm btn-outline" title="Edit Profile"><HiPencilAlt /></button>
                                <button
                                  onClick={() => {
                                    setPasswordTargetEmployee(emp);
                                    setEmployeeUsernameInput(emp.username || '');
                                    setEmployeePasswordInput('');
                                    setEmployeeResetPassword(true);
                                    setShowEmployeePassword(false);
                                    setEmployeePasswordResult(null);
                                  }}
                                  className="btn btn-sm btn-outline"
                                  title="Staff login & password"
                                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                  <HiKey />
                                </button>
                                {Number(emp.is_blocked) ? (
                                  <button type="button" onClick={() => handleEmployeeBlock(emp.admin_id, false)} className="btn btn-sm btn-approve" title="Unblock" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><HiLockOpen /></button>
                                ) : (
                                  <button type="button" onClick={() => handleEmployeeBlock(emp.admin_id, true)} className="btn btn-sm btn-outline" title="Block" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#991b1b', borderColor: '#fecaca' }}><HiLockClosed /></button>
                                )}
                                 <button onClick={async () => { if(await showConfirm('Delete user?')) { await fetch(`/api/admin/users?id=${emp.admin_id}`, {method: 'DELETE'}); loadData(); } }} className="btn btn-sm btn-reject" title="Delete"><HiOutlineTrash /></button>
                             </div>
                         </td>
                       </tr>
                     ))}
                     {employees.length === 0 && (
                       <tr><td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No employees found.</td></tr>
                     )}
                   </tbody>
                 </>
               )}

               {activeTab === 'admins' && user.role === 'admin' && (
                <>
                  <thead>
                    <tr><th>SL.</th><th>Username</th><th>Role</th><th style={{ textAlign: 'right' }}>Action</th></tr>
                  </thead>
                  <tbody>
                    {admins.map((adm, idx) => (
                      <tr key={adm.id}>
                        <td data-label="SL.">{idx + 1}</td>
                        <td data-label="Username"><div style={{ fontWeight: 600, fontSize: '12.5px' }}>{adm.username}</div></td>
                        <td data-label="Role"><div style={{ fontSize: '12px' }}>{adm.role?.toUpperCase()}</div></td>
                        <td style={{ textAlign: 'right' }}>
                            <div className="manage-actions">
                               {adm.id !== user.userId && (
                                 <button onClick={async () => { if(await showConfirm('Delete account?')) { await fetch(`/api/admin/users?id=${adm.id}`, {method: 'DELETE'}); loadData(); } }} className="btn btn-sm btn-reject" title="Delete"><HiOutlineTrash /></button>
                               )}
                            </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}

              {activeTab === 'buyers' && user.role === 'admin' && (
                <>
                  <thead>
                    <tr><th>SL.</th><th>Name</th><th>Company</th><th>Phone</th><th>Email</th><th>Status</th><th style={{ textAlign: 'right' }}>Action</th></tr>
                  </thead>
                  <tbody>
                    {buyers.map((buyer, idx) => (
                      <tr key={buyer.id}>
                        <td>{idx + 1}</td>
                        <td><div style={{ fontWeight: 600, fontSize: '12px' }}>{buyer.full_name}</div></td>
                        <td><div style={{ fontSize: '12px' }}>{buyer.company_name || 'N/A'}</div></td>
                        <td><div style={{ fontSize: '12px' }}>{buyer.phone}</div></td>
                        <td><div style={{ fontSize: '12px' }}>{buyer.email}</div></td>
                        <td>
                          <div style={{ fontSize: '11px', fontWeight: 700, color: buyer.status === 'approved' ? '#059669' : buyer.status === 'rejected' ? '#dc2626' : '#b45309' }}>
                            {buyer.status?.toUpperCase()}
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="manage-actions">
                            {buyer.status !== 'approved' && (
                              <button onClick={() => handleBuyerStatus(buyer.id, 'approved')} className="btn btn-sm btn-approve" title="Approve" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><HiCheck /></button>
                            )}
                            {buyer.status !== 'rejected' && (
                              <button onClick={() => handleBuyerStatus(buyer.id, 'rejected')} className="btn btn-sm btn-reject" title="Reject" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><HiX /></button>
                            )}
                            {buyer.status === 'approved' && (
                              <>
                                {Number(buyer.is_blocked) ? (
                                  <button type="button" onClick={() => handleBuyerToggle(buyer.id, 'is_blocked', false, 'Unblock this buyer?')} className="btn btn-sm btn-approve" title="Unblock" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><HiLockOpen /></button>
                                ) : (
                                  <button type="button" onClick={() => handleBuyerToggle(buyer.id, 'is_blocked', true, 'Block this buyer?')} className="btn btn-sm btn-outline" title="Block" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#991b1b', borderColor: '#fecaca' }}><HiLockClosed /></button>
                                )}
                                {Number(buyer.credentials_unlocked) ? (
                                  <button type="button" onClick={() => handleBuyerToggle(buyer.id, 'credentials_unlocked', false, 'Lock credentials for this buyer?')} className="btn btn-sm btn-reject" title="Lock Credentials" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><HiEyeOff /></button>
                                ) : (
                                  <button type="button" onClick={() => handleBuyerToggle(buyer.id, 'credentials_unlocked', true, 'Unlock credentials for this buyer?')} className="btn btn-sm btn-approve" title="Unlock Credentials" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><HiEye /></button>
                                )}
                                <button
                                  onClick={() => {
                                    setPasswordTargetBuyer(buyer);
                                    setBuyerPasswordInput('');
                                    setShowBuyerPassword(false);
                                    setBuyerPasswordResult(null);
                                  }}
                                  className="btn btn-sm btn-outline"
                                  title="Reset Password"
                                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                  <HiKey />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {buyers.length === 0 && (
                      <tr><td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No buyer requests yet.</td></tr>
                    )}
                  </tbody>
                </>
              )}
            </table>
          </div>
          ) : null}


        {activeTab === 'sell' && user.role === 'admin' && (
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
                 <form onSubmit={handleBulkSell} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.3rem', alignItems: 'flex-end' }}>
                    <div className="compact-form-group" style={{ marginBottom: 0 }}>
                      <label>Batch Total (৳)</label>
                      <input 
                        type="number" step="0.01" className="compact-form-control" placeholder="0.00" required 
                        value={batchRev} onChange={e => setBatchRev(e.target.value)}
                      />
                    </div>
                    <div className="compact-form-group" style={{ marginBottom: 0 }}>
                      <label>Spec. Bill (৳)</label>
                      <input 
                        type="number" step="0.01" className="compact-form-control" placeholder="0.00" required 
                        value={batchCost} onChange={e => setBatchCost(e.target.value)}
                      />
                    </div>
                    <div style={{ flex: '1' }}>
                       {selectedIds.length > 0 && (batchRev || batchCost) && (
                         <div style={{ fontSize: '10px', color: '#1e293b', marginBottom: '4px', fontWeight: 600 }}>
                           {selectedIds.length} Picked • ৳{((parseFloat(batchRev) || 0) / selectedIds.length).toFixed(2)} rev / ৳{((parseFloat(batchCost) || 0) / selectedIds.length).toFixed(2)} cost each
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
 
       {activeTab === 'profile' && myProfile && (
          <div style={{ maxWidth: '700px' }}>
            <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
              {myProfile.username} · {myProfile.role?.toUpperCase()}
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              setSubmitting(true);
              const formData = new FormData(e.target);
              const data = Object.fromEntries(formData.entries());
              data.admin_id = user.userId;
              try {
                const res = await fetch('/api/admin/employees', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(data)
                });
                if (res.ok) { toast.success('Profile updated!'); loadData(); }
                else toast.error('Check your input and try again.');
              } catch(err) { toast.error('Server error'); }
              finally { setSubmitting(false); }
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <div className="compact-form-group" style={{ marginBottom: 0 }}><label>Full Name</label><input name="full_name" defaultValue={myProfile.full_name} className="compact-form-control" placeholder="Legal Name" /></div>
                <div className="compact-form-group" style={{ marginBottom: 0 }}><label>Phone</label><input name="phone" defaultValue={myProfile.phone} className="compact-form-control" /></div>
                <div className="compact-form-group" style={{ marginBottom: 0 }}><label>Email</label><input name="email" type="email" defaultValue={myProfile.email} className="compact-form-control" /></div>
                <div className="compact-form-group" style={{ marginBottom: 0 }}><label>Date of Birth</label><input name="dob" type="date" defaultValue={myProfile.dob?.split('T')[0]} className="compact-form-control" /></div>
                <div className="compact-form-group" style={{ marginBottom: 0 }}><label>NID / ID No</label><input name="nid_no" defaultValue={myProfile.nid_no} className="compact-form-control" /></div>
                <div className="compact-form-group" style={{ marginBottom: 0 }}><label>Joining Date</label><input name="joining_date" type="date" defaultValue={myProfile.joining_date?.split('T')[0]} className="compact-form-control" disabled={user.role !== 'admin'} /></div>
                <div className="compact-form-group" style={{ marginBottom: 0 }}><label>Designation</label><input name="designation" defaultValue={myProfile.designation} className="compact-form-control" disabled={user.role !== 'admin'} /></div>
                <div className="compact-form-group" style={{ marginBottom: 0 }}><label>Basic Salary (৳)</label><input name="basic_salary" type="number" defaultValue={myProfile.basic_salary} className="compact-form-control" disabled={user.role !== 'admin'} /></div>
                <div className="compact-form-group" style={{ marginBottom: 0 }}><label>Contract Target</label><input name="contract_target" type="number" defaultValue={myProfile.contract_target} className="compact-form-control" disabled={user.role !== 'admin'} /></div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <div className="compact-form-group" style={{ marginBottom: 0 }}><label>Present Address</label><textarea name="present_address" defaultValue={myProfile.present_address} className="compact-form-control" style={{ minHeight: '52px', resize: 'none' }}></textarea></div>
                <div className="compact-form-group" style={{ marginBottom: 0 }}><label>Permanent Address</label><textarea name="permanent_address" defaultValue={myProfile.permanent_address} className="compact-form-control" style={{ minHeight: '52px', resize: 'none' }}></textarea></div>
              </div>

              <div style={{ border: '1px solid #f1f5f9', borderRadius: '4px', padding: '0.6rem 0.75rem', marginBottom: '0.75rem', background: '#fafafa' }}>
                <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Emergency & Financial</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem' }}>
                  <div className="compact-form-group" style={{ marginBottom: 0 }}><label>Contact Person</label><input name="emergency_contact_name" defaultValue={myProfile.emergency_contact_name} className="compact-form-control" /></div>
                  <div className="compact-form-group" style={{ marginBottom: 0 }}><label>Relationship</label><input name="emergency_contact_relation" defaultValue={myProfile.emergency_contact_relation} className="compact-form-control" /></div>
                  <div className="compact-form-group" style={{ marginBottom: 0 }}><label>Emergency Phone</label><input name="emergency_contact_phone" defaultValue={myProfile.emergency_contact_phone} className="compact-form-control" /></div>
                  <div className="compact-form-group" style={{ marginBottom: 0 }}><label>Bank Name</label><input name="bank_name" defaultValue={myProfile.bank_name} className="compact-form-control" /></div>
                  <div className="compact-form-group" style={{ marginBottom: 0 }}><label>Account No</label><input name="account_no" defaultValue={myProfile.account_no} className="compact-form-control" /></div>
                </div>
              </div>

              <button type="submit" disabled={submitting} className="btn btn-sm btn-approve" style={{ width: '100%', height: '30px', fontSize: '11px', fontWeight: 700 }}>
                {submitting ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </div>
       )}

      {activeTab === 'employees' && editEmployee && (
         <div style={{ maxWidth: '700px' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
             <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
               {editEmployee.username} · EMPLOYEE
             </div>
             <button onClick={() => setEditEmployee(null)} className="btn btn-sm btn-outline" style={{ fontSize: '10px', padding: '0.2rem 0.5rem' }}>← Back</button>
           </div>
           <form onSubmit={handleUpdateEmployeeProfile}>
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem', marginBottom: '0.5rem' }}>
               <div className="compact-form-group" style={{ marginBottom: 0 }}><label>Full Name</label><input name="full_name" defaultValue={editEmployee.full_name} className="compact-form-control" placeholder="Legal Name" /></div>
               <div className="compact-form-group" style={{ marginBottom: 0 }}><label>{'Father\u2019s Name'}</label><input name="father_name" defaultValue={editEmployee.father_name} className="compact-form-control" /></div>
               <div className="compact-form-group" style={{ marginBottom: 0 }}><label>{'Mother\u2019s Name'}</label><input name="mother_name" defaultValue={editEmployee.mother_name} className="compact-form-control" /></div>
               <div className="compact-form-group" style={{ marginBottom: 0 }}><label>Phone</label><input name="phone" defaultValue={editEmployee.phone} className="compact-form-control" /></div>
               <div className="compact-form-group" style={{ marginBottom: 0 }}><label>Email</label><input name="email" type="email" defaultValue={editEmployee.email} className="compact-form-control" /></div>
               <div className="compact-form-group" style={{ marginBottom: 0 }}><label>Date of Birth</label><input name="dob" type="date" defaultValue={editEmployee.dob?.split('T')[0]} className="compact-form-control" /></div>
               <div className="compact-form-group" style={{ marginBottom: 0 }}><label>NID / ID No</label><input name="nid_no" defaultValue={editEmployee.nid_no} className="compact-form-control" /></div>
               <div className="compact-form-group" style={{ marginBottom: 0 }}><label>Joining Date</label><input name="joining_date" type="date" defaultValue={editEmployee.joining_date?.split('T')[0]} className="compact-form-control" /></div>
               <div className="compact-form-group" style={{ marginBottom: 0 }}><label>Designation</label><input name="designation" defaultValue={editEmployee.designation} className="compact-form-control" placeholder="e.g. Sales Executive" /></div>
               <div className="compact-form-group" style={{ marginBottom: 0 }}><label>Basic Salary (৳)</label><input name="basic_salary" type="number" defaultValue={editEmployee.basic_salary} className="compact-form-control" /></div>
               <div className="compact-form-group" style={{ marginBottom: 0 }}><label>Contract Target</label><input name="contract_target" type="number" defaultValue={editEmployee.contract_target} className="compact-form-control" /></div>
               <div className="compact-form-group" style={{ marginBottom: 0 }}><label>Bank Name</label><input name="bank_name" defaultValue={editEmployee.bank_name} className="compact-form-control" /></div>
               <div className="compact-form-group" style={{ marginBottom: 0 }}><label>Account No</label><input name="account_no" defaultValue={editEmployee.account_no} className="compact-form-control" /></div>
             </div>

             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.5rem', marginBottom: '0.5rem' }}>
               <div className="compact-form-group" style={{ marginBottom: 0 }}><label>Present Address</label><textarea name="present_address" defaultValue={editEmployee.present_address} className="compact-form-control" style={{ minHeight: '52px', resize: 'none' }}></textarea></div>
               <div className="compact-form-group" style={{ marginBottom: 0 }}><label>Permanent Address</label><textarea name="permanent_address" defaultValue={editEmployee.permanent_address} className="compact-form-control" style={{ minHeight: '52px', resize: 'none' }}></textarea></div>
             </div>

             <div style={{ border: '1px solid #f1f5f9', borderRadius: '4px', padding: '0.6rem 0.75rem', marginBottom: '0.75rem', background: '#fafafa' }}>
               <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Emergency Contact</div>
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem' }}>
                 <div className="compact-form-group" style={{ marginBottom: 0 }}><label>Contact Person</label><input name="emergency_contact_name" defaultValue={editEmployee.emergency_contact_name} className="compact-form-control" /></div>
                 <div className="compact-form-group" style={{ marginBottom: 0 }}><label>Relationship</label><input name="emergency_contact_relation" defaultValue={editEmployee.emergency_contact_relation} className="compact-form-control" /></div>
                 <div className="compact-form-group" style={{ marginBottom: 0 }}><label>Emergency Phone</label><input name="emergency_contact_phone" defaultValue={editEmployee.emergency_contact_phone} className="compact-form-control" /></div>
               </div>
             </div>

             <div style={{ display: 'flex', gap: '0.4rem' }}>
               <button type="button" onClick={() => setEditEmployee(null)} className="btn btn-sm btn-outline" style={{ flex: 1, height: '30px', fontSize: '11px' }}>Discard</button>
               <button type="submit" className="btn btn-sm btn-approve" style={{ flex: 2, height: '30px', fontSize: '11px', fontWeight: 700 }}>Save Staff Profile</button>
             </div>
           </form>
         </div>
       )}


      {activeChannel && (
         <div className="modal-overlay">
            <div className="modal-content">
               <div style={{ marginBottom: '1rem', fontWeight: 700 }}>Update: {activeChannel.channel_name}</div>
               <form onSubmit={handleAddDailyUpdate}>
                  <div className="compact-form-group"><label>Total uploads</label><input type="number" name="shorts_count" className="compact-form-control" defaultValue={activeChannel.shorts_count || 0} /></div>
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
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.3rem' }}>
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

      {passwordTargetEmployee && (
        <div
          className="modal-overlay"
          role="presentation"
          onClick={() => {
            setPasswordTargetEmployee(null);
            setEmployeeUsernameInput('');
            setEmployeePasswordInput('');
            setEmployeeResetPassword(true);
            setShowEmployeePassword(false);
          }}
        >
          <div className="modal-content" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div style={{ marginBottom: '1rem', fontWeight: 700 }}>
              Staff account: {passwordTargetEmployee.username}
            </div>

            <div className="compact-form-group">
              <label>Username</label>
              <input
                type="text"
                className="compact-form-control"
                value={employeeUsernameInput}
                onChange={(e) => setEmployeeUsernameInput(e.target.value)}
                autoComplete="off"
              />
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '0.4rem' }}>
                একই নাম অন্য ইউজার নিলে সেভ হবে না। পরিবর্তন হলে স্টাফের সব ডিভাইস থেকে লগআউট হবে।
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '12px', marginBottom: '0.75rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={employeeResetPassword}
                onChange={(e) => setEmployeeResetPassword(e.target.checked)}
              />
              <span>Set or reset password</span>
            </label>

            {employeeResetPassword && (
              <div className="compact-form-group">
                <label>New password</label>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <input
                    type={showEmployeePassword ? 'text' : 'password'}
                    className="compact-form-control"
                    value={employeePasswordInput}
                    onChange={(e) => setEmployeePasswordInput(e.target.value)}
                    placeholder="Leave empty to auto-generate"
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-outline"
                    onClick={() => setShowEmployeePassword((prev) => !prev)}
                    title={showEmployeePassword ? 'Hide' : 'Show'}
                  >
                    {showEmployeePassword ? <HiEyeOff /> : <HiEye />}
                  </button>
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '0.4rem' }}>
                  Empty রাখলে auto-generated temporary password set হবে।
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '1.2rem' }}>
              <button
                type="button"
                onClick={() => {
                  setPasswordTargetEmployee(null);
                  setEmployeeUsernameInput('');
                  setEmployeePasswordInput('');
                  setEmployeeResetPassword(true);
                  setShowEmployeePassword(false);
                }}
                className="btn btn-sm btn-outline"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleEmployeePasswordReset}
                disabled={submitting}
                className="btn btn-sm btn-approve"
                style={{ flex: 1 }}
              >
                {submitting ? '...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {employeePasswordResult && (
        <div
          className="modal-overlay"
          role="presentation"
          onClick={() => {
            setEmployeePasswordResult(null);
            loadData();
          }}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ marginBottom: '0.5rem', fontWeight: 700 }}>
              নতুন পাসওয়ার্ড — লগইন ইউজারনেম:{' '}
              <span style={{ fontFamily: 'ui-monospace, monospace' }}>{employeePasswordResult.loginUsername}</span>
            </div>
            <div
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                padding: '0.75rem',
                marginBottom: '1rem',
                fontFamily: 'ui-monospace, monospace',
                fontSize: '13px',
                fontWeight: 700,
                wordBreak: 'break-all',
              }}
            >
              {employeePasswordResult.password}
            </div>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button
                type="button"
                className="btn btn-sm btn-outline"
                style={{ flex: 1 }}
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(employeePasswordResult.password);
                    toast.success('Copied');
                  } catch {
                    toast.error('Could not copy');
                  }
                }}
              >
                Copy
              </button>
              <button
                type="button"
                className="btn btn-sm btn-approve"
                style={{ flex: 1 }}
                onClick={() => {
                  setEmployeePasswordResult(null);
                  loadData();
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {passwordTargetBuyer && (
        <div
          className="modal-overlay"
          role="presentation"
          onClick={() => {
            setPasswordTargetBuyer(null);
            setBuyerPasswordInput('');
            setShowBuyerPassword(false);
          }}
        >
          <div className="modal-content" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div style={{ marginBottom: '1rem', fontWeight: 700 }}>
              Reset Buyer Password: {passwordTargetBuyer.full_name}
            </div>

            <div className="compact-form-group">
              <label>New Password (optional)</label>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <input
                  type={showBuyerPassword ? 'text' : 'password'}
                  className="compact-form-control"
                  value={buyerPasswordInput}
                  onChange={(e) => setBuyerPasswordInput(e.target.value)}
                  placeholder="Leave empty to auto-generate"
                />
                <button
                  type="button"
                  className="btn btn-sm btn-outline"
                  onClick={() => setShowBuyerPassword((prev) => !prev)}
                  title={showBuyerPassword ? 'Hide' : 'Show'}
                >
                  {showBuyerPassword ? <HiEyeOff /> : <HiEye />}
                </button>
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '0.4rem' }}>
                Empty রাখলে auto-generated temporary password set হবে।
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '1.2rem' }}>
              <button
                type="button"
                onClick={() => {
                  setPasswordTargetBuyer(null);
                  setBuyerPasswordInput('');
                  setShowBuyerPassword(false);
                }}
                className="btn btn-sm btn-outline"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBuyerPasswordReset}
                disabled={submitting}
                className="btn btn-sm btn-approve"
                style={{ flex: 1 }}
              >
                {submitting ? '...' : 'Reset'}
              </button>
            </div>
          </div>
        </div>
      )}

      {buyerPasswordResult && (
        <div className="modal-overlay" role="presentation" onClick={() => setBuyerPasswordResult(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ marginBottom: '1rem', fontWeight: 700 }}>
              নতুন পাসওয়ার্ড — {buyerPasswordResult.label}
            </div>
            <div
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                padding: '0.75rem',
                marginBottom: '1rem',
                fontFamily: 'ui-monospace, monospace',
                fontSize: '13px',
                fontWeight: 700,
                wordBreak: 'break-all',
              }}
            >
              {buyerPasswordResult.password}
            </div>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button
                type="button"
                className="btn btn-sm btn-outline"
                style={{ flex: 1 }}
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(buyerPasswordResult.password);
                    toast.success('Copied');
                  } catch {
                    toast.error('Could not copy');
                  }
                }}
              >
                Copy
              </button>
              <button
                type="button"
                className="btn btn-sm btn-approve"
                style={{ flex: 1 }}
                onClick={() => setBuyerPasswordResult(null)}
              >
                Done
              </button>
            </div>
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
