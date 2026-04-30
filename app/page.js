import Link from 'next/link';

export default function Home() {
  return (
    <main>
      <section className="hero">
        <h1>EasySell</h1>
        <p>
          A startup supplying high-quality YouTube channels for brands, agencies,
          and growth-focused marketing teams.
        </p>
      </section>

      <section className="common-container" style={{ maxWidth: '860px' }}>
        <div
          style={{
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '1.25rem',
            marginBottom: '1rem',
            background: 'var(--background)',
          }}
        >
          <h2 className="section-title" style={{ marginBottom: '0.75rem' }}>
            Company Overview
          </h2>
          <p style={{ color: 'var(--muted-foreground)', marginBottom: '0.65rem' }}>
            EasySell connects a high-volume buyer network with a reliable channel
            supply pipeline for marketing, branding, and campaign launches.
          </p>
          <p style={{ color: 'var(--muted-foreground)' }}>
            Demand is continuous and growing. Our focus is speed, consistency, and
            scalable delivery for buyers at every stage.
          </p>
        </div>

        <div
          style={{
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '1.25rem',
            marginBottom: '1rem',
            background: 'var(--background)',
          }}
        >
          <h2 className="section-title" style={{ marginBottom: '0.75rem' }}>
            What We Provide
          </h2>
          <ul style={{ color: 'var(--muted-foreground)', paddingLeft: '1rem' }}>
            <li>High-volume YouTube channel sourcing with consistent quality.</li>
            <li>Fast onboarding and structured handover workflow.</li>
            <li>Reliable support for long-term marketing operations.</li>
          </ul>
        </div>

        <div
          style={{
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '1.25rem',
            marginBottom: '1rem',
            background: 'var(--background)',
          }}
        >
          <h2 className="section-title" style={{ marginBottom: '0.75rem' }}>
            Why Buyers Choose EasySell
          </h2>
          <ul style={{ color: 'var(--muted-foreground)', paddingLeft: '1rem' }}>
            <li>Built for scale when demand grows rapidly.</li>
            <li>Startup agility with execution-focused delivery.</li>
            <li>Clear communication and dependable turnaround.</li>
          </ul>
        </div>

        <div
          style={{
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '1.25rem',
            background: 'var(--muted)',
            marginBottom: '2rem',
          }}
        >
          <h2 className="section-title" style={{ marginBottom: '0.75rem' }}>
            Vision
          </h2>
          <p style={{ color: 'var(--muted-foreground)' }}>
            Build the most dependable startup ecosystem for YouTube channel demand
            where buyers can scale without limits.
          </p>
        </div>

        <div
          style={{
            textAlign: 'center',
            padding: '1rem 0 2.25rem',
          }}
        >
          <p style={{ color: 'var(--muted-foreground)', marginBottom: '0.75rem' }}>
            Looking for a scalable YouTube channel supply partner?
          </p>
          <Link href="/admin/login" className="btn btn-outline">
            Partner With EasySell
          </Link>
        </div>
      </section>

      <Link
        href="/admin"
        className="admin-secret-link"
        style={{
          position: 'fixed',
          bottom: '8px',
          right: '8px',
          width: '10px',
          height: '10px',
          backgroundColor: '#475569',
          borderRadius: '2px',
          zIndex: 9999,
          cursor: 'pointer',
          textDecoration: 'none'
        }}
        title="Admin"
      />
    </main>
  );
}
