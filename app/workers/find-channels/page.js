'use client';

import { useState } from 'react';
import Link from 'next/link';

function formatSold(v) {
  if (v === 1 || v === true || v === '1') return 'হ্যাঁ';
  return 'না';
}

/** Admin `is_selected`: channel shown to buyers on the marketplace listing (online) or not. */
function formatMarketListing(v) {
  if (v === 1 || v === true || v === '1') return 'খোলা';
  return 'বন্ধ';
}

export default function FindWorkerChannelsPage() {
  const [whatsapp, setWhatsapp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [payload, setPayload] = useState(null);

  const search = async (e) => {
    e?.preventDefault();
    setError('');
    setPayload(null);
    const w = whatsapp.trim();
    if (!w) {
      setError('WhatsApp নম্বর দিন।');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/public/workers/channels-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whatsapp: w }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'খোঁজ ব্যর্থ।');
        return;
      }
      setPayload(data);
    } catch {
      setError('নেটওয়ার্ক সমস্যা। আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  const channels = payload?.channels || [];

  return (
    <main
      className="common-container worker-find-channels-page public-page-fill-below-navbar"
      style={{ maxWidth: '820px', paddingTop: '1rem', paddingBottom: '2.5rem' }}
    >
      <div style={{ marginBottom: '1rem' }}>
        <div
          style={{
            fontSize: '10px',
            textTransform: 'uppercase',
            color: 'var(--muted-foreground)',
            fontWeight: 700,
            letterSpacing: '0.08em',
          }}
        >
          Specialist
        </div>
        <h1 style={{ fontSize: '1.22rem', marginTop: '0.35rem', marginBottom: '0.35rem', lineHeight: 1.25 }}>
          Find your channels
        </h1>
        <p style={{ fontSize: '12.5px', color: 'var(--muted-foreground)', margin: 0, lineHeight: 1.45 }}>
          ওই WhatsApp দিন যেটা আপনি নিবন্ধনের সময় ব্যবহার করেছিলেন। সিস্টেমে সংযুক্ত সব চ্যানেল নীচের তালিকায় দেখাবে।
        </p>
      </div>

      <div
        style={{
          border: '1px solid var(--border)',
          borderRadius: '10px',
          padding: '0.95rem',
          background: 'var(--card)',
          marginBottom: '1rem',
        }}
      >
        <form onSubmit={search}>
          <div className="compact-form-group">
            <label style={{ fontSize: '11px', fontWeight: 700 }}>WhatsApp নম্বর</label>
            <input
              className="compact-form-control"
              placeholder="যেমন: 01712xxxxxx"
              value={whatsapp}
              onChange={(ev) => setWhatsapp(ev.target.value)}
              disabled={loading}
            />
          </div>
          <button type="submit" className="btn" style={{ width: '100%', marginTop: '0.35rem', fontWeight: 600 }} disabled={loading}>
            {loading ? 'খোঁজা হচ্ছে…' : 'চ্যানেলগুলো দেখুন'}
          </button>
        </form>

        {error ? (
          <div
            style={{
              marginTop: '0.65rem',
              padding: '0.45rem 0.55rem',
              background: '#fef2f2',
              color: '#b91c1c',
              borderRadius: '6px',
              fontSize: '12px',
            }}
          >
            {error}
          </div>
        ) : null}
      </div>

      {payload?.worker ? (
        <div
          style={{
            border: '1px solid var(--border)',
            borderRadius: '10px',
            overflow: 'hidden',
            background: 'var(--card)',
          }}
        >
          <div style={{ padding: '0.55rem 0.65rem', borderBottom: '1px solid var(--border)', background: '#f8fafc' }}>
            <div style={{ fontSize: '9px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              ওয়ার্কার (প্যানেল অনুযায়ী)
            </div>
            <div style={{ fontSize: '13px', fontWeight: 700, marginTop: '0.12rem', color: '#0f172a', lineHeight: 1.2 }}>
              {payload.worker.name || '—'}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '0.1rem', lineHeight: 1.2 }}>
              {payload.worker.whatsapp || whatsapp.trim()}
            </div>
          </div>

          <div style={{ padding: '0.42rem 0.65rem 0.35rem', fontSize: '10px', fontWeight: 700, color: '#475569' }}>
            চ্যানেল ({channels.length})
            <span style={{ fontWeight: 500, color: '#94a3b8', marginLeft: '8px', display: 'inline-block', maxWidth: '100%' }}>
              বাজার = বায়ার সাইডে ওয়েব লিস্টিংয়ে খোলা আছে কিনা।
            </span>
          </div>

          {channels.length === 0 ? (
            <div style={{ padding: '1rem 0.95rem', fontSize: '13px', color: '#64748b' }}>এই নম্বরের অধীনে কোনো চ্যানেল পাওয়া যায়নি।</div>
          ) : (
            <div className="find-channels-table-wrap" style={{ overflowX: 'auto' }}>
              <table
                className="find-channels-table"
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '10px',
                  lineHeight: 1.25,
                }}
              >
                <thead>
                  <tr style={{ textAlign: 'left', borderTop: '1px solid var(--border)', background: '#f1f5f9' }}>
                    <th style={{ padding: '5px 6px', fontWeight: 800, whiteSpace: 'nowrap', fontSize: '9px' }}>চ্যানেল</th>
                    <th style={{ padding: '5px 5px', fontWeight: 800, fontSize: '9px' }} title="ওপেন ডেট">
                      তারিখ
                    </th>
                    <th style={{ padding: '5px 4px', fontWeight: 800, fontSize: '9px', textAlign: 'right' }} title="Subscribers">
                      Sub
                    </th>
                    <th style={{ padding: '5px 4px', fontWeight: 800, fontSize: '9px', textAlign: 'right' }} title="Shorts count">
                      Shr
                    </th>
                    <th style={{ padding: '5px 5px', fontWeight: 800, fontSize: '9px' }} title="শেষ ডেইলি আপডেট স্ট্যাটাস">
                      KPI
                    </th>
                    <th style={{ padding: '5px 5px', fontWeight: 800, fontSize: '9px', whiteSpace: 'nowrap' }} title="বিক্রি হয়েছে কিনা">
                      বিক্রি
                    </th>
                    <th
                      style={{ padding: '5px 5px', fontWeight: 800, fontSize: '9px', whiteSpace: 'nowrap' }}
                      title="অ্যাডমিন প্যানেল ONLINE = বাজার লিস্টিং খোলা; OFFLINE = বন্ধ"
                    >
                      বাজার
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {channels.map((row) => (
                    <tr key={row.id} style={{ borderTop: '1px solid var(--border)' }}>
                      <td style={{ padding: '4px 6px', verticalAlign: 'top', maxWidth: '200px' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{row.channel_name || '—'}</div>
                        {row.channel_link ? (
                          <a
                            href={row.channel_link}
                            target="_blank"
                            rel="noreferrer"
                            style={{ fontSize: '9px', color: '#2563eb' }}
                          >
                            লিঙ্ক
                          </a>
                        ) : null}
                      </td>
                      <td style={{ padding: '4px 5px', whiteSpace: 'nowrap', color: '#475569' }}>{row.open_date || '—'}</td>
                      <td style={{ padding: '4px 4px', textAlign: 'right' }}>{row.sub_count ?? '—'}</td>
                      <td style={{ padding: '4px 4px', textAlign: 'right' }}>{row.shorts_count ?? '—'}</td>
                      <td style={{ padding: '4px 5px', color: '#475569', maxWidth: '88px' }}>{row.kpi_status || '—'}</td>
                      <td style={{ padding: '4px 5px', whiteSpace: 'nowrap' }}>{formatSold(row.is_sold)}</td>
                      <td style={{ padding: '4px 5px', whiteSpace: 'nowrap' }}>{formatMarketListing(row.is_selected)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : null}

      <p style={{ marginTop: '1rem', fontSize: '11px', color: '#94a3b8' }}>
        <Link href="/workers/submit">নতুন চ্যানেল জমা</Link>
        {' · '}
        <Link href="/help-center">Help Center</Link>
        {' · '}
        <Link href="/">হোম</Link>
      </p>
    </main>
  );
}
