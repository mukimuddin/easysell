'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { normalizeUrlForPaste } from '@/lib/youtubeChannelUrl';

const emptyChannel = () => ({
  channel_name: '',
  channel_link: '',
  gmail: '',
  password: '',
  open_date: '',
});

export default function PublicWorkerSubmitPage() {
  const [step, setStep] = useState(1);
  const [whatsapp, setWhatsapp] = useState('');
  const [canonical, setCanonical] = useState('');
  const [workerExisting, setWorkerExisting] = useState(false);
  const [workerName, setWorkerName] = useState('');
  const [channels, setChannels] = useState(() => [emptyChannel()]);
  const [dealers, setDealers] = useState([]);
  const [dealerId, setDealerId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (step >= 4) {
      fetch('/api/public/workers/dealers')
        .then((r) => r.json())
        .then((d) => {
          setDealers(Array.isArray(d) ? d : []);
        })
        .catch(() => setDealers([]));
    }
  }, [step]);

  const lookupWhatsapp = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/public/workers/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whatsapp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'যাচাই ব্যর্থ।');
        return;
      }
      setCanonical(data.canonical || '');
      setWorkerExisting(data.found === true);
      if (data.found && data.worker) {
        setWorkerName(data.worker.name || '');
      } else {
        setWorkerName('');
      }
      setStep(2);
    } catch {
      setError('নেটওয়ার্ক সমস্যা। আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  const goChannels = () => {
    setError('');
    const nm = workerName.trim();
    if (nm.length < 2) {
      setError('ওয়ার্কারের নাম অন্তত ২ অক্ষর দিন।');
      return;
    }
    setStep(3);
  };

  const addChannelRow = () => {
    setChannels((prev) => [...prev, emptyChannel()]);
  };

  const updateChannel = (idx, patch) => {
    setChannels((prev) => prev.map((c, i) => (i === idx ? { ...c, ...patch } : c)));
  };

  const removeChannel = (idx) => {
    setChannels((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx)));
  };

  const submitAll = async (e) => {
    e.preventDefault();
    setError('');
    if (!dealerId) {
      setError('আপনার ডিলার (কর্মী) নির্বাচন করুন।');
      return;
    }
    const cleaned = channels.map((c) => ({
      channel_name: c.channel_name.trim(),
      channel_link: c.channel_link.trim(),
      gmail: c.gmail.trim(),
      password: c.password.trim(),
      open_date: c.open_date.trim(),
    }));

    const invalid = cleaned.find((c) => !c.channel_name || !c.channel_link);
    if (invalid) {
      setError('প্রতিটি চ্যানেলের নাম ও লিঙ্ক লাগবে।');
      return;
    }
    const badLinkRow = cleaned.find((c) => !normalizeUrlForPaste(c.channel_link).ok);
    if (badLinkRow) {
      const chk = normalizeUrlForPaste(badLinkRow.channel_link);
      setError(chk.error || 'ইউটিউব চ্যানেল লিঙ্ক চেক করুন।');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/public/workers/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          whatsapp,
          canonical,
          name: workerName.trim(),
          dealerId: parseInt(dealerId, 10),
          channels: cleaned,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'জমা ব্যর্থ।');
        return;
      }
      setSuccessMsg(
        `${data.channelsAdded || cleaned.length}টি চ্যানেল সফলভাবে জমা হয়েছে। ধন্যবাদ।`
      );
      setStep(5);
    } catch {
      setError('সার্ভার সমস্যা। পরে চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  const StepDots = () => (
    <div style={{ display: 'flex', gap: '6px', marginBottom: '0.85rem', flexWrap: 'wrap', alignItems: 'center' }}>
      {[1, 2, 3, 4].map((s) => (
        <span
          key={s}
          style={{
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            fontWeight: 700,
            background: step === s ? '#0f172a' : step > s ? '#cbd5e1' : '#f1f5f9',
            color: step === s ? '#fff' : '#64748b',
          }}
        >
          {s}
        </span>
      ))}
    </div>
  );

  return (
    <main className="common-container worker-submit-page public-page-fill-below-navbar" style={{ maxWidth: '560px', paddingTop: '1rem', paddingBottom: '2.5rem' }}>
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--muted-foreground)', fontWeight: 700, letterSpacing: '0.08em' }}>
          Specialist onboarding
        </div>
        <h1 style={{ fontSize: '1.22rem', marginTop: '0.35rem', marginBottom: '0.2rem', lineHeight: 1.25 }}>
          ওয়ার্কার চ্যানেল সাবমিশন
        </h1>
      </div>

      <div style={{ border: '1px solid var(--border)', borderRadius: '10px', padding: '0.95rem', background: 'var(--card)' }}>
        {step !== 5 ? <StepDots /> : null}

        {error ? (
          <div style={{ padding: '0.45rem 0.55rem', marginBottom: '0.65rem', background: '#fef2f2', color: '#b91c1c', borderRadius: '6px', fontSize: '12px' }}>
            {error}
          </div>
        ) : null}

        {step !== 5 && (
        <>
        {step === 1 && (
          <>
            <div className="compact-form-group">
              <label style={{ fontSize: '11px', fontWeight: 700 }}>১. WhatsApp নম্বর</label>
              <input
                className="compact-form-control"
                placeholder="যেমন: 01712xxxxxx"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                disabled={loading}
              />
              <span style={{ fontSize: '10px', color: '#94a3b8' }}>
                এই নম্বর দিয়ে ডাটাবেসে ওয়ার্কার খোঁজা হয়।
              </span>
            </div>
            <button type="button" className="btn" style={{ width: '100%', marginTop: '0.5rem', fontWeight: 600 }} onClick={lookupWhatsapp} disabled={loading}>
              {loading ? 'চেক করা হচ্ছে…' : 'পরের ধাপ'}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="compact-form-group">
              <label style={{ fontSize: '11px', fontWeight: 700 }}>
                ২. ওয়ার্কারের নাম {workerExisting ? '(সিস্টেম অনুযায়ী ইডিটযোগ্য)' : '(নতুন — পূরণ করুন)'}
              </label>
              <input
                className="compact-form-control"
                placeholder={workerExisting ? '' : 'আপনার পূর্ণ নাম টাইপ করুন'}
                value={workerName}
                onChange={(e) => setWorkerName(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.65rem', flexWrap: 'wrap' }}>
              <button type="button" className="btn btn-outline" onClick={() => setStep(1)} disabled={loading}>
                ফিরুন
              </button>
              <button type="button" className="btn" style={{ flex: '1', minWidth: '160px', fontWeight: 600 }} onClick={goChannels}>
                পরের ধাপ
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div style={{ fontSize: '11px', fontWeight: 700, marginBottom: '0.35rem', color: '#475569' }}>৩. চ্যানেল তালিকা</div>
            {channels.map((c, idx) => (
              <div
                key={`ch-${idx}`}
                style={{
                  border: '1px dashed #cbd5e1',
                  borderRadius: '8px',
                  padding: '0.5rem',
                  marginBottom: '0.45rem',
                  display: 'grid',
                  gap: '0.35rem',
                  background: '#fafafa',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748b' }}>চ্যানেল {idx + 1}</span>
                  {channels.length > 1 ? (
                    <button type="button" className="btn btn-sm btn-outline" style={{ padding: '0.15rem 0.35rem', fontSize: '10px' }} onClick={() => removeChannel(idx)}>
                      মুছে ফেলুন
                    </button>
                  ) : null}
                </div>
                <div className="compact-form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '10px' }}>চ্যানেলের নাম / ID টাইটেল</label>
                  <input className="compact-form-control" value={c.channel_name} onChange={(e) => updateChannel(idx, { channel_name: e.target.value })} />
                </div>
                <div className="compact-form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '10px' }}>চ্যানেল লিঙ্ক (https://)</label>
                  <input type="url" className="compact-form-control" value={c.channel_link} onChange={(e) => updateChannel(idx, { channel_link: e.target.value })} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem' }}>
                  <div className="compact-form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '10px' }}>Gmail (optional)</label>
                    <input className="compact-form-control" value={c.gmail} onChange={(e) => updateChannel(idx, { gmail: e.target.value })} />
                  </div>
                  <div className="compact-form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '10px' }}>Password (optional)</label>
                    <input className="compact-form-control" value={c.password} onChange={(e) => updateChannel(idx, { password: e.target.value })} />
                  </div>
                </div>
                <div className="compact-form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '10px' }}>ওপেন ডেট (optional)</label>
                  <input type="date" className="compact-form-control" value={c.open_date} onChange={(e) => updateChannel(idx, { open_date: e.target.value })} />
                </div>
              </div>
            ))}
            <button type="button" className="btn btn-sm btn-outline" style={{ width: '100%', marginBottom: '0.65rem', fontWeight: 600 }} onClick={addChannelRow}>
              + আরেকটি চ্যানেল
            </button>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              <button type="button" className="btn btn-outline" onClick={() => setStep(2)}>
                ফিরুন
              </button>
              <button type="button" className="btn" style={{ flex: '1', minWidth: '160px', fontWeight: 600 }} onClick={() => setStep(4)}>
                পরের ধাপ (ডিলার)
              </button>
            </div>
          </>
        )}

        {step === 4 && (
          <form onSubmit={submitAll}>
            <div className="compact-form-group">
              <label style={{ fontSize: '11px', fontWeight: 700 }}>৪. ডিলার আপডেট — আপনাকে সংযোগকারী কর্মী</label>
              <select className="compact-form-control" value={dealerId} required onChange={(e) => setDealerId(e.target.value)}>
                <option value="">একটি কর্মী বেছে নিন…</option>
                {dealers.map((d) => (
                  <option key={d.admin_id} value={d.admin_id}>
                    {d.display_name || d.username} ({d.username})
                  </option>
                ))}
              </select>
              <span style={{ fontSize: '10px', color: '#94a3b8' }}>
                আপনার ওয়ার্কার ও চ্যানেল প্যানেলে এই কর্মীর নাম সংযোগ হিসাবে দেখাবে।
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.65rem', flexWrap: 'wrap' }}>
              <button type="button" className="btn btn-outline" onClick={() => setStep(3)} disabled={loading}>
                ফিরুন
              </button>
              <button type="submit" className="btn" style={{ flex: '1', minWidth: '160px', fontWeight: 700 }} disabled={loading}>
                {loading ? 'জমা হচ্ছে…' : 'সব চ্যানেল সাবমিট'}
              </button>
            </div>
          </form>
        )}
        </>
        )}

        {step === 5 && successMsg ? (
          <div>
            <p style={{ margin: '0 0 0.75rem', fontSize: '14px', color: '#166534', fontWeight: 600 }}>
              ✓ {successMsg}
            </p>
            <Link href="/" className="btn">
              হোমে ফিরুন
            </Link>
          </div>
        ) : null}
      </div>

      <p style={{ marginTop: '1rem', fontSize: '11px', color: '#94a3b8' }}>
        <Link href="/help-center">Help Center</Link>
        {' · '}
        <Link href="/">হোম</Link>
      </p>
    </main>
  );
}
