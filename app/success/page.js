import Link from 'next/link';

export default function SuccessPage() {
  return (
    <main className="common-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div className="form-container" style={{ margin: 0 }}>
        <h1 className="section-title" style={{ color: 'var(--success)', justifyContent: 'center' }}>Success!</h1>
        <p style={{ marginBottom: '2rem', color: 'var(--muted-foreground)', textAlign: 'center' }}>Your submission has been received and is currently under review by our team.</p>
        <Link href="/" className="btn full-width">Back to Home</Link>
      </div>
    </main>
  );
}
