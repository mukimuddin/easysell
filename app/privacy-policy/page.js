export const metadata = {
  title: 'Privacy Policy - YTM Bangladesh',
  description: 'Learn how YTM Bangladesh collects, processes, and protects your personal data. Our privacy policy explains your rights and our data security measures.',
  keywords: 'YTM Bangladesh privacy, data protection policy, YouTube marketplace privacy',
}

export default function PrivacyPolicyPage() {
  return (
    <main className="common-container info-page">
      <h1>Privacy Policy</h1>
      <p className="info-lead">
        Effective Date: 01 May 2026. This Privacy Policy explains how YTM Bangladesh collects, processes, stores,
        and protects user information for operational and compliance purposes.
      </p>

      <section>
        <h2>1) Information We Collect</h2>
        <ul>
          <li>Registration data (name, phone, email, account role)</li>
          <li>Authentication and security logs (session tokens, login attempts)</li>
          <li>Operational records (channel status, internal updates, assignments)</li>
          <li>Communication artifacts (support messages, escalation history)</li>
        </ul>
      </section>

      <section>
        <h2>2) Why We Use Your Data</h2>
        <ul>
          <li>Account setup, identity verification, and access control</li>
          <li>Marketplace operations and workflow coordination</li>
          <li>Security monitoring and abuse prevention</li>
          <li>Service improvement, analytics, and issue resolution</li>
          <li>Legal and compliance obligations</li>
        </ul>
      </section>

      <section>
        <h2>3) Lawful Basis & Consent</h2>
        <p>
          Data processing may be based on consent, contractual necessity, legitimate interest, and compliance requirements,
          depending on the specific use case.
        </p>
      </section>

      <section>
        <h2>4) Data Sharing</h2>
        <p>
          We do not sell personal data. Limited data may be shared with authorized operational staff, service providers,
          and legal authorities where required by law or security investigation.
        </p>
      </section>

      <section>
        <h2>5) Security Measures</h2>
        <ul>
          <li>Role-based access restrictions</li>
          <li>Session validation and cookie security controls</li>
          <li>Password hashing and login attempt monitoring</li>
          <li>Internal review workflows for sensitive updates</li>
        </ul>
      </section>

      <section>
        <h2>6) Data Retention</h2>
        <p>
          Data is retained as long as required for active services, dispute handling, legal compliance, and audit integrity.
          Retention duration may vary by record type.
        </p>
      </section>

      <section>
        <h2>7) Your Rights</h2>
        <ul>
          <li>Request correction of inaccurate personal data</li>
          <li>Request account review or status clarification</li>
          <li>Request policy explanation about data usage scope</li>
          <li>Request deletion where legally and operationally permissible</li>
        </ul>
      </section>

      <section>
        <h2>8) Cookies and Session Data</h2>
        <p>
          We use secure cookies for authentication and session continuity. Disabling required cookies may affect platform functionality.
        </p>
      </section>

      <section>
        <h2>9) Children’s Privacy</h2>
        <p>
          Our services are not intended for children under applicable legal age for contractual participation.
        </p>
      </section>

      <section>
        <h2>10) Policy Changes</h2>
        <p>
          We may revise this policy periodically. Updated versions become effective upon publication.
        </p>
      </section>
    </main>
  );
}
