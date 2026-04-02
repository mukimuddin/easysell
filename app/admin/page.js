'use client';

import { useEffect, useState } from 'react';

export default function AdminPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const loadSubmissions = async () => {
    try {
      const response = await fetch('/api/admin/submissions');
      const data = await response.json();
      setSubmissions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    const formData = new FormData(e.target);
    const data = {
      channel_links: formData.get('channel_links'),
      whatsapp: formData.get('whatsapp'),
      owner_name: formData.get('owner_name')
    };
    
    try {
      const res = await fetch('/api/admin/create-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (res.ok) {
        alert(`${result.count} listings created and approved successfully!`);
        setShowForm(false);
        loadSubmissions();
        e.target.reset();
      } else {
        alert('Error: ' + result.error);
      }
    } catch (err) {
      alert('An error occurred');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to PERMANENTLY delete this listing? This cannot be undone.')) return;
    
    try {
      const response = await fetch('/api/admin/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      
      const result = await response.json();
      if (response.ok) {
        alert('Listing deleted successfully!');
        loadSubmissions();
      } else {
        alert('Error deleting listing: ' + result.error);
      }
    } catch (err) {
      console.error('Error deleting listing:', err);
      alert('An error occurred while deleting.');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  };

  return (
    <main className="admin-container" style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
        <h2 className="section-title" style={{ marginBottom: 0 }}>Manage Marketplace</h2>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => setShowForm(!showForm)} className={`btn btn-sm ${showForm ? 'btn-outline' : 'btn-approve'}`}>
            {showForm ? 'Cancel' : '+ Create Listing'}
          </button>
          <button onClick={handleLogout} className="btn btn-outline btn-sm">Logout</button>
        </div>
      </div>

      {showForm && (
        <div className="form-container" style={{ margin: '0 0 3rem', maxWidth: 'none', background: 'var(--muted)', borderStyle: 'dashed' }}>
          <h3 className="section-title" style={{ fontSize: '1rem' }}>Bulk Channel Listing</h3>
          <form className="admin-form" onSubmit={handleAdminSubmit}>
            <div className="form-group full-width">
              <label>Owner's Name *</label>
              <input type="text" name="owner_name" className="form-control" placeholder="Enter owner name" required />
            </div>

            <div className="form-group full-width">
              <label>Channel Links (One per line) *</label>
              <textarea name="channel_links" className="form-control" rows="5" placeholder="https://youtube.com/channel1
https://youtube.com/channel2..." required></textarea>
            </div>
            
            <div className="form-group">
              <label>WhatsApp Number (BD Prefix: +880) *</label>
              <input type="text" name="whatsapp" className="form-control" placeholder="017... or 880..." required />
            </div>

            <button type="submit" className="btn btn-approve" style={{ width: '100%', padding: '0.65rem' }} disabled={formLoading}>
              {formLoading ? 'Creating Listings...' : 'Create & Approve Bulk Listings'}
            </button>
          </form>
        </div>
      )}

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Owner Name</th>
              <th>Channel Link</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="3" className="center-text" style={{ padding: '3rem 1rem', color: 'var(--muted-foreground)' }}>Loading submissions...</td></tr>
            ) : submissions.length === 0 ? (
              <tr><td colSpan="3" className="center-text" style={{ padding: '3rem 1rem', color: 'var(--muted-foreground)' }}>No channels found.</td></tr>
            ) : (
              submissions.map(item => (
                <tr key={item.id}>
                  <td data-label="Owner" style={{ fontWeight: 600 }}>{item.channel_name}</td>
                  <td data-label="Channel">
                    <a href={item.channel_link} target="_blank" rel="noopener noreferrer" className="channel-link" style={{ fontSize: '0.875rem', color: 'var(--info)' }}>
                      Visit Channel
                    </a>
                  </td>
                  <td data-label="Actions" style={{ textAlign: 'right' }}>
                    <button className="btn btn-sm btn-reject" onClick={() => handleDelete(item.id)}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '3rem', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
        <h3 className="section-title" style={{ fontSize: '1rem', marginBottom: '1rem' }}>Security Settings</h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', marginBottom: '1.5rem' }}>Update your administrator access passcode. Changes are saved directly to the database.</p>
        <form 
          className="form-container" 
          style={{ margin: 0, padding: '1.5rem', maxWidth: '400px', boxShadow: 'none', background: 'var(--muted)' }}
          onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const currentPasscode = formData.get('currentPasscode');
            const newPasscode = formData.get('newPasscode');
            
            try {
              const res = await fetch('/api/admin/change-passcode', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPasscode, newPasscode })
              });
              const data = await res.json();
              if (res.ok) {
                alert('Passcode updated successfully! Please login again.');
                handleLogout();
              } else {
                alert('Error: ' + data.error);
              }
            } catch (err) {
              alert('An error occurred');
            }
          }}
        >
          <div className="form-group">
            <label htmlFor="currentPasscode">Current Passcode</label>
            <input type="password" id="currentPasscode" name="currentPasscode" className="form-control" required />
          </div>
          <div className="form-group">
            <label htmlFor="newPasscode">New Passcode</label>
            <input type="password" id="newPasscode" name="newPasscode" className="form-control" required minLength="4" />
          </div>
          <button type="submit" className="btn btn-sm" style={{ width: '100%', padding: '0.65rem' }}>Update Admin Passcode</button>
        </form>
      </div>
    </main>
  );
}
