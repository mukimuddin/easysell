import Link from 'next/link';

export const metadata = {
  title: 'YTM Bangladesh - YouTube Channel Supply & Sourcing Network',
  description: 'YTM Bangladesh is the leading professional marketplace for buying and sourcing YouTube channels in Bangladesh. High-volume supply, verified inventory, secure delivery.',
  keywords: 'buy YouTube channels Bangladesh, YTM Bangladesh, YouTube channel marketplace, monetized YouTube channels, channel sourcing network, buy YouTube accounts',
}

export default function Home() {
  const heroKpis = [
    { label: 'Live Buyers', value: '14,800+' },
    { label: 'Daily Deal Flow', value: '420+' },
    { label: 'Global Workers', value: '1,950+' },
    { label: 'Countries', value: '27' },
  ];

  const kpiCards = [
    { label: 'Established', value: '2017', note: 'Dhaka HQ launch' },
    { label: 'Total Buyers Served', value: '21,400+', note: 'B2B + direct teams' },
    { label: 'Closed Deals', value: '38,500+', note: 'Verified closures' },
    { label: 'Channels Delivered', value: '41,200+', note: 'Across 36 niches' },
    { label: 'Partner Channels', value: '96', note: 'Active network streams' },
    { label: 'Worker Coverage', value: '1,950+', note: 'Sourcing + compliance' },
    { label: 'Monthly Ticket Volume', value: '18,700+', note: 'Support + operations' },
    { label: 'Premium SLA Buyers', value: '3,200+', note: 'Priority handling desks' },
  ];

  const growthTimeline = [
    { period: '2018', buyers: 240, deals: 480, channels: 510 },
    { period: '2020', buyers: 1700, deals: 3900, channels: 4200 },
    { period: '2022', buyers: 5300, deals: 12300, channels: 13100 },
    { period: '2024', buyers: 10100, deals: 26400, channels: 28900 },
    { period: 'Q1 2026', buyers: 14800, deals: 38500, channels: 41200 },
  ];

  const categoryMix = [
    { name: 'Gaming', share: 22 },
    { name: 'Education', share: 18 },
    { name: 'Tech', share: 15 },
    { name: 'Vlog', share: 14 },
    { name: 'Business', share: 12 },
    { name: 'Other', share: 19 },
  ];

  const regionWorkers = [
    { region: 'Bangladesh', workers: 410, quality: 94 },
    { region: 'India', workers: 310, quality: 92 },
    { region: 'Pakistan', workers: 205, quality: 91 },
    { region: 'Philippines', workers: 188, quality: 93 },
    { region: 'Indonesia', workers: 176, quality: 90 },
    { region: 'UAE', workers: 120, quality: 95 },
    { region: 'Egypt', workers: 104, quality: 89 },
    { region: 'Brazil', workers: 87, quality: 88 },
    { region: 'Turkey', workers: 82, quality: 90 },
    { region: 'Others (18)', workers: 268, quality: 91 },
  ];

  const channelsPipeline = [
    { stage: 'Sourcing Queue', count: 9820, rate: 100 },
    { stage: 'Manual Verification', count: 7610, rate: 77 },
    { stage: 'Compliance Filter', count: 5430, rate: 55 },
    { stage: 'Buyer Match', count: 4110, rate: 42 },
    { stage: 'Deal Closure', count: 3290, rate: 34 },
  ];

  const opsMetrics = [
    ['Average response time', '2m 40s'],
    ['Median deal close cycle', '14h 20m'],
    ['Buyer satisfaction score', '4.8 / 5'],
    ['Repeat order frequency', 'Every 11 days'],
    ['Escalation rate', '1.9%'],
    ['Refund ratio', '0.8%'],
    ['Top volume day', 'Thursday'],
    ['Peak active channels/day', '1,140+'],
  ];

  const serviceColumns = [
    {
      title: 'Supply Engine',
      items: ['Niche-based channel inventory', 'Bulk-ready sourcing queues', 'Fast buyer-match routing'],
    },
    {
      title: 'Risk & Compliance',
      items: ['3-layer quality control checks', 'Fraud flag + history screening', 'Escalation-only expert review'],
    },
    {
      title: 'Delivery & Support',
      items: ['Structured handover SOP', '24/7 operations desk', 'Post-deal continuity support'],
    },
  ];

  return (
    <main>
      <section className="hero hero-v2" style={{ paddingBottom: '0.7rem', paddingTop: '0.3rem' }}>
        <div className="common-container hero-unique-wrap" style={{ maxWidth: '980px' }}>
          <div className="hero-unique-shell" style={{ border: '1px solid var(--border)', borderRadius: '16px', background: '#fff', overflow: 'hidden' }}>
            <div className="hero-unique-grid">
              <div className="hero-unique-main" style={{ padding: '1.1rem 1.1rem 1rem' }}>
                <div className="hero-unique-kicker" style={{ fontSize: '10px', letterSpacing: '0.14em', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.45rem' }}>
                  Quiet Infrastructure For Noisy Growth
                </div>
                <h1 className="hero-unique-title" style={{ fontSize: 'clamp(1.45rem, 3.8vw, 2.35rem)', lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '0.5rem', color: '#0f172a' }}>
                  We do not sell channels. We architect market readiness.
                </h1>
                <p className="hero-unique-copy" style={{ fontSize: '0.84rem', color: '#475569', maxWidth: '600px', marginBottom: '0.85rem' }}>
                  YTM Bangladesh runs a low-noise, high-control supply system where sourcing, screening, matching, and handover
                  happen as one continuous operating line.
                </p>

                <div className="hero-unique-tags" style={{ display: 'flex', gap: '0.42rem', flexWrap: 'wrap', marginBottom: '0.8rem' }}>
                  <span style={{ fontSize: '11px', border: '1px solid #e2e8f0', padding: '0.24rem 0.5rem', borderRadius: '999px', color: '#0f172a' }}>Deal Integrity First</span>
                  <span style={{ fontSize: '11px', border: '1px solid #e2e8f0', padding: '0.24rem 0.5rem', borderRadius: '999px', color: '#0f172a' }}>Operationally Verified</span>
                  <span style={{ fontSize: '11px', border: '1px solid #e2e8f0', padding: '0.24rem 0.5rem', borderRadius: '999px', color: '#0f172a' }}>Hybrid Workforce Model</span>
                </div>

                <div className="hero-unique-actions" style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                  <Link href="/contact-us" className="btn">Contact Team</Link>
                  <Link href="/jobs" className="btn btn-outline">Job Circular</Link>
                </div>
              </div>

              <div className="hero-unique-side" style={{ borderLeft: '1px solid #e2e8f0', background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)', padding: '0.9rem 0.85rem' }}>
                <div style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.1em', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.45rem' }}>
                  Signal Board
                </div>
                <div className="hero-unique-signal-list" style={{ display: 'grid', gap: '0.35rem' }}>
                  {heroKpis.map((item, i) => (
                    <div key={item.label} className="hero-unique-signal-item" style={{ display: 'grid', gridTemplateColumns: '16px 1fr auto', alignItems: 'center', gap: '0.45rem', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.35rem 0.45rem', background: '#fff' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: i % 2 === 0 ? '#10b981' : '#3b82f6', margin: '0 auto' }}></div>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>{item.label}</span>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>{item.value}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: '0.55rem', border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '0.45rem', fontSize: '10.5px', color: '#64748b' }}>
                  Live desk pulse: buyer queue, field onboarding, and verification nodes run continuously with monitored handoff states.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="common-container" style={{ maxWidth: '860px' }}>
        <Panel title="About YTM Bangladesh">
          <p style={{ color: 'var(--muted-foreground)', fontSize: '0.84rem' }}>
            YTM Bangladesh operates a multi-layer channel sourcing and buyer servicing model
            designed for high-volume demand. This page contains extended internal demo metrics
            and representative operational snapshots for presentation purposes.
          </p>
        </Panel>

        <Panel title="Executive KPI Grid">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))', gap: '0.55rem' }}>
            {kpiCards.map((card) => (
              <div
                key={card.label}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  padding: '0.6rem',
                  background: 'var(--muted)',
                }}
              >
                <p style={{ fontSize: '0.74rem', color: 'var(--muted-foreground)' }}>{card.label}</p>
                <p style={{ fontSize: '1.06rem', fontWeight: 700 }}>{card.value}</p>
                <p style={{ fontSize: '0.72rem', color: 'var(--muted-foreground)' }}>{card.note}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Service Architecture">
          <div className="service-architecture-grid" style={{ display: 'grid', gap: '0.55rem' }}>
            {serviceColumns.map((column) => (
              <div
                key={column.title}
                className="service-architecture-card"
                style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '0.55rem' }}
              >
                <p style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.35rem' }}>{column.title}</p>
                <ul style={{ color: 'var(--muted-foreground)', fontSize: '0.75rem', paddingLeft: '0.95rem' }}>
                  {column.items.map((point) => (
                    <li key={point} style={{ marginBottom: '0.18rem' }}>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Growth Timeline Chart">
          {growthTimeline.map((row) => (
            <div key={row.period} style={{ marginBottom: '0.55rem' }}>
              <p style={{ fontSize: '0.78rem', marginBottom: '0.2rem' }}>
                <strong>{row.period}</strong> - Buyers {row.buyers.toLocaleString()} | Deals{' '}
                {row.deals.toLocaleString()} | Channels {row.channels.toLocaleString()}
              </p>
              <Meter width={Math.min(100, (row.channels / 42000) * 100)} colors={['#14b8a6', '#3b82f6']} />
            </div>
          ))}
        </Panel>

        <Panel title="Category Distribution Chart">
          {categoryMix.map((item) => (
            <div key={item.name} style={{ marginBottom: '0.45rem' }}>
              <p
                style={{
                  fontSize: '0.77rem',
                  color: 'var(--muted-foreground)',
                  marginBottom: '0.2rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>{item.name}</span>
                <span>{item.share}%</span>
              </p>
              <Meter width={item.share} colors={['#0ea5e9', '#22c55e']} />
            </div>
          ))}
        </Panel>

        <Panel title="Country Worker Matrix">
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '0.35rem' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 600 }}>Region</p>
            <p style={{ fontSize: '0.75rem', fontWeight: 600 }}>Workers</p>
            <p style={{ fontSize: '0.75rem', fontWeight: 600 }}>Quality Index</p>
            {regionWorkers.map((item) => (
              <FragmentRow key={item.region} region={item.region} workers={item.workers} quality={item.quality} />
            ))}
          </div>
        </Panel>

        <Panel title="Channel Pipeline Funnel">
          {channelsPipeline.map((item) => (
            <div key={item.stage} style={{ marginBottom: '0.45rem' }}>
              <p style={{ fontSize: '0.76rem', marginBottom: '0.2rem' }}>
                {item.stage}: {item.count.toLocaleString()}
              </p>
              <Meter width={item.rate} colors={['#f59e0b', '#ef4444']} />
            </div>
          ))}
        </Panel>

        <Panel title="Operational Metrics Board">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.45rem' }}>
            {opsMetrics.map(([label, value]) => (
              <div key={label} style={{ border: '1px dashed var(--border)', borderRadius: '8px', padding: '0.5rem' }}>
                <p style={{ fontSize: '0.72rem', color: 'var(--muted-foreground)' }}>{label}</p>
                <p style={{ fontSize: '0.92rem', fontWeight: 600 }}>{value}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Channel Network & Buyer Segments">
          <p style={{ color: 'var(--muted-foreground)', fontSize: '0.83rem', marginBottom: '0.45rem' }}>
            96 active sourcing channels, 14 regional partner desks, 32 broker clusters, and 11
            internal risk-control cells running parallel compliance loops.
          </p>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '0.83rem' }}>
            Buyer composition: 39% agencies, 34% brand teams, 17% creators, 10% strategic media
            operators. Premium SLA enrollment grew 4.2x since 2023.
          </p>
        </Panel>

        <div
          style={{
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '0.95rem',
            marginBottom: '0.75rem',
            background: 'var(--muted)',
          }}
        >
          <h2 className="section-title" style={{ marginBottom: '0.55rem' }}>
            Strategic Direction
          </h2>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '0.83rem', marginBottom: '0.4rem' }}>
            Build the most dependable and scalable ecosystem for YouTube channel demand where
            buyers can execute campaigns at speed without operational bottlenecks.
          </p>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '0.83rem' }}>
            2026 roadmap focus: automation uplift, market expansion, deeper compliance tooling,
            and premium buyer SLA service density.
          </p>
        </div>

        <div style={{ textAlign: 'center', padding: '0.75rem 0 2rem' }}>
          <p style={{ color: 'var(--muted-foreground)', marginBottom: '0.75rem' }}>
            Looking for a scalable YouTube channel supply partner?
          </p>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.85rem',
              maxWidth: '420px',
              margin: '0 auto',
            }}
          >
            <Link href="/contact-us" className="btn btn-outline">
              Partner With YTM Bangladesh
            </Link>
            <Link href="/help-center" className="btn">
              Read Help Center
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function FragmentRow({ region, workers, quality }) {
  return (
    <>
      <p style={{ fontSize: '0.74rem', color: 'var(--muted-foreground)' }}>{region}</p>
      <p style={{ fontSize: '0.74rem' }}>{workers.toLocaleString()}</p>
      <p style={{ fontSize: '0.74rem' }}>{quality}%</p>
    </>
  );
}

function Meter({ width, colors }) {
  return (
    <div
      style={{
        height: '8px',
        borderRadius: '999px',
        background: 'var(--muted)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${width}%`,
          height: '100%',
          background: `linear-gradient(90deg, ${colors[0]}, ${colors[1]})`,
        }}
      />
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <div
      style={{
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '0.95rem',
        marginBottom: '0.75rem',
        background: 'var(--background)',
      }}
    >
      <h2 className="section-title" style={{ marginBottom: '0.75rem' }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

function Tag({ text }) {
  return (
    <span
      style={{
        border: '1px solid rgba(255, 255, 255, 0.55)',
        borderRadius: '999px',
        fontSize: '0.72rem',
        padding: '0.2rem 0.52rem',
        color: '#ffffff',
      }}
    >
      {text}
    </span>
  );
}
