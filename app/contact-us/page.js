import Link from 'next/link';

export default function ContactUsPage() {
  return (
    <main className="common-container info-page">
      <h1>Contact Us</h1>
      <p className="info-lead">
        Contact YTM Bangladesh for buyer onboarding, channel sourcing inquiries, policy questions, or issue escalation.
        For faster support, include your registered name, phone, and the specific topic.
      </p>

      <section>
        <h2>1) Primary Contact Channels</h2>
        <ul>
          <li><strong>Email (Job & General):</strong> ytmarketbd2020@gmail.com</li>
          <li><strong>WhatsApp (Info & CV):</strong> +8801601315176</li>
          <li><strong>Call:</strong> +8801601315176</li>
          <li><strong>Location:</strong> Dhaka, Bangladesh (hybrid operations)</li>
        </ul>
      </section>

      <section>
        <h2>2) When to Contact Which Channel</h2>
        <ul>
          <li><strong>Email:</strong> Detailed cases, formal documents, CV submission, policy queries.</li>
          <li><strong>WhatsApp:</strong> Quick communication, initial confirmation, status follow-up.</li>
          <li><strong>Call:</strong> Urgent clarifications during operational hours.</li>
        </ul>
      </section>

      <section>
        <h2>3) Recommended Message Format</h2>
        <p>Use this structure for faster resolution:</p>
        <ol>
          <li>Full name and role (buyer/applicant/partner)</li>
          <li>Registered phone/email</li>
          <li>Issue category (login, approval, channel, policy, payment)</li>
          <li>Short timeline with date/time</li>
          <li>Expected resolution</li>
        </ol>
      </section>

      <section>
        <h2>4) Business Communication Policy</h2>
        <ul>
          <li>Respectful, professional communication is mandatory.</li>
          <li>All major confirmations should be in writing.</li>
          <li>Abusive language or threat behavior may lead to communication restriction.</li>
          <li>Fraud or impersonation evidence is escalated for policy action.</li>
        </ul>
      </section>

      <section>
        <h2>5) Expected Response Window</h2>
        <ul>
          <li>General message: usually within 24 hours.</li>
          <li>Approval/account checks: 24-72 hours.</li>
          <li>Complex disputes: up to 3-7 business days.</li>
        </ul>
      </section>

      <section>
        <h2>6) Escalation Guidance</h2>
        <p>
          If your issue remains unresolved after initial support, send an escalation message with subject
          <strong> "Escalation Request"</strong> and include evidence bundle (screenshots, references, timeline).
        </p>
      </section>

      <section>
        <h2>7) Related Documents</h2>
        <div className="info-links">
          <Link href="/help-center">Help Center</Link>
          <Link href="/terms-of-service">Terms of Service</Link>
          <Link href="/privacy-policy">Privacy Policy</Link>
          <Link href="/refund-policy">Refund Policy</Link>
        </div>
      </section>
    </main>
  );
}
