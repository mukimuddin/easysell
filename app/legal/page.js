import Link from 'next/link';

export default function LegalPage() {
  return (
    <main className="common-container info-page">
      <h1>Legal</h1>
      <p className="info-lead">
        This Legal overview page summarizes the key contractual and compliance documents that govern access to
        YTM Bangladesh services. Please read the full policy documents before using the platform or entering any transaction.
      </p>

      <section>
        <h2>Document Index</h2>
        <ul>
          <li><Link href="/terms-of-service">Terms of Service</Link> - core contractual terms and service boundaries.</li>
          <li><Link href="/privacy-policy">Privacy Policy</Link> - collection, usage, retention, and protection of data.</li>
          <li><Link href="/refund-policy">Refund Policy</Link> - eligibility, non-eligibility, and refund process.</li>
          <li><Link href="/safety-tips">Safety Tips</Link> - operational security guidelines for users and partners.</li>
        </ul>
      </section>

      <section>
        <h2>Important Legal Notes</h2>
        <ul>
          <li>Policy acceptance may be implied through continued use of the platform.</li>
          <li>Operational and legal updates can be published without prior individual notice.</li>
          <li>In case of policy conflict, the latest published official version applies.</li>
          <li>Users are responsible for lawful use within their jurisdiction.</li>
        </ul>
      </section>

      <section>
        <h2>Compliance & Conduct</h2>
        <p>
          Users must avoid fraud, impersonation, unauthorized data access, and deceptive communication.
          Violation may result in account restriction, contract termination, or legal action where applicable.
        </p>
      </section>

      <section>
        <h2>Questions About Legal Terms</h2>
        <p>
          If you need clarification before engaging in transaction-level commitments, contact us from the official support channels.
        </p>
        <div className="info-links">
          <Link href="/contact-us">Contact Us</Link>
          <Link href="/help-center">Help Center</Link>
        </div>
      </section>
    </main>
  );
}
