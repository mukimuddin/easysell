import Link from 'next/link';

export const metadata = {
  title: 'Help Center - YTM Bangladesh Support & FAQ',
  description: 'Find answers to common questions about YTM Bangladesh. Learn about account approval, channel status, communication policy, and payment flows.',
  keywords: 'YTM Bangladesh help, YouTube marketplace FAQ, buyer support, channel handover help, YouTube business guide',
}

export default function HelpCenterPage() {
  return (
    <main className="common-container info-page">
      <h1>Help Center</h1>
      <p className="info-lead">
        Welcome to the YTM Bangladesh Help Center. This page explains the end-to-end workflow of our marketplace,
        from account onboarding and channel listing to communication policy, payment flow, handover, and dispute support.
      </p>

      <section>
        <h2>1) Getting Started</h2>
        <p>
          YTM Bangladesh operates a managed marketplace where channel sourcing, quality check, buyer matching, and operational follow-up
          are coordinated by our team. To get started, choose the role that matches your objective:
        </p>
        <ul>
          <li><strong>Buyer:</strong> Register, wait for approval, then browse online channels from your panel.</li>
          <li><strong>Internal Admin/Employee:</strong> Use admin access to manage workers, channels, analytics, and updates.</li>
          <li><strong>Job Applicant:</strong> Review the jobs page and apply by email/WhatsApp/call.</li>
        </ul>
      </section>

      <section>
        <h2>2) Buyer Account Approval Process</h2>
        <p>
          Buyer registration is reviewed before login is enabled. This protects existing sellers and keeps marketplace quality high.
        </p>
        <ol>
          <li>Submit buyer registration form with correct contact details.</li>
          <li>Admin reviews your request and marks it as approved or rejected.</li>
          <li>Approved buyers can log in and access available online inventory.</li>
          <li>Pending or rejected accounts cannot access buyer dashboard.</li>
        </ol>
      </section>

      <section>
        <h2>3) Channel Status & Inventory Visibility</h2>
        <p>
          Channels are visible to buyers when they are marked <strong>Online</strong> in internal operations. Inventory can change in real time,
          so availability, price context, and assignment status may update during business hours.
        </p>
        <ul>
          <li>Online channels are visible in buyer panel.</li>
          <li>Sold or restricted channels may be hidden automatically.</li>
          <li>Operational updates may temporarily affect display order.</li>
          <li>Always confirm current availability before finalizing.</li>
        </ul>
      </section>

      <section>
        <h2>4) Communication Channels</h2>
        <p>
          For fastest support, contact us using the same identity (phone/email/WhatsApp) you used during onboarding.
          This helps us verify requests and protect account ownership.
        </p>
        <ul>
          <li><strong>General support:</strong> Use Contact page channels.</li>
          <li><strong>Job-related communication:</strong> Use jobs page email/WhatsApp/call.</li>
          <li><strong>Urgent account security issues:</strong> Report immediately with screenshots and timestamps.</li>
        </ul>
      </section>

      <section>
        <h2>5) Payments, Handover, and Documentation</h2>
        <p>
          Financial steps and handover details should always be confirmed in writing. Keep all receipts, screenshots,
          and timeline logs until delivery is fully complete.
        </p>
        <ul>
          <li>Use agreed channels for payment communication.</li>
          <li>Keep transaction references and date/time logs.</li>
          <li>Confirm handover checklist before closure.</li>
          <li>Report mismatch quickly with verifiable evidence.</li>
        </ul>
      </section>

      <section>
        <h2>6) Issue Types We Handle</h2>
        <ul>
          <li>Login/access problem</li>
          <li>Buyer approval delay</li>
          <li>Channel data mismatch</li>
          <li>Communication dispute</li>
          <li>Delivery timeline clarification</li>
          <li>Policy explanation requests</li>
        </ul>
      </section>

      <section>
        <h2>7) Typical Resolution Timeline</h2>
        <p>
          Most standard inquiries are handled within business hours. Complex disputes needing audit may take longer because
          logs, assignment history, and communication evidence must be reviewed carefully.
        </p>
        <ul>
          <li>General inquiry: same day to 24 hours</li>
          <li>Approval review: usually 24-72 hours</li>
          <li>Evidence-based dispute: 3-7 business days</li>
        </ul>
      </section>

      <section>
        <h2>8) Best Practices for Faster Support</h2>
        <ul>
          <li>Include account email/phone used in registration.</li>
          <li>Mention exact channel name or ID where relevant.</li>
          <li>Attach screenshots with date/time visible.</li>
          <li>Explain expected resolution clearly in 2-3 lines.</li>
        </ul>
      </section>

      <section>
        <h2>9) Related Policies</h2>
        <p>
          Before requesting escalation, review our policy pages for legal, privacy, and refund scope.
        </p>
        <div className="info-links">
          <Link href="/safety-tips">Safety Tips</Link>
          <Link href="/terms-of-service">Terms of Service</Link>
          <Link href="/privacy-policy">Privacy Policy</Link>
          <Link href="/refund-policy">Refund Policy</Link>
        </div>
      </section>
    </main>
  );
}
