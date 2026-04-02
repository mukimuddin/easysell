'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

export default function SubmitPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        router.push('/success');
      } else {
        alert('Error: ' + (result.error || 'Failed to submit'));
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred while submitting. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="common-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '66vh' }}>
      <div className="form-container" style={{ margin: 0, textAlign: 'center' }}>
        <h2 className="section-title" style={{ justifyContent: 'center', color: 'var(--destructive)' }}>Submissions Closed</h2>
        <p style={{ marginBottom: '2rem', color: 'var(--muted-foreground)' }}>Public channel listings are currently disabled. Only administrators can list new channels at this time.</p>
        <Link href="/" className="btn full-width">Back to Home</Link>
      </div>
    </main>
  );
}
