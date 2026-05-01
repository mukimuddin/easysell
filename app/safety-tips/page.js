import Link from 'next/link';

export default function SafetyTipsPage() {
  return (
    <main className="common-container info-page">
      <h1>Safety Tips</h1>
      <p className="info-lead">
        Safety is a shared responsibility between platform operations, channel suppliers, and buyers.
        Follow these guidelines to reduce fraud risk, protect credentials, and avoid transactional confusion.
      </p>

      <section>
        <h2>1) Identity Verification First</h2>
        <ul>
          <li>Communicate using registered contact details only.</li>
          <li>Cross-check account identity before discussing payment or handover.</li>
          <li>Avoid third-party intermediaries not approved by YTM Bangladesh.</li>
          <li>Report impersonation immediately with screenshots.</li>
        </ul>
      </section>

      <section>
        <h2>2) Protect Login & Credential Data</h2>
        <ul>
          <li>Never share OTP, password reset links, or backup codes.</li>
          <li>Use strong passwords and change them after handover.</li>
          <li>Enable two-factor authentication where possible.</li>
          <li>Do not store sensitive credentials in public chats.</li>
        </ul>
      </section>

      <section>
        <h2>3) Transaction Safety Checklist</h2>
        <ul>
          <li>Confirm channel status, ownership proof, and delivery scope in writing.</li>
          <li>Keep payment records: amount, date, reference, and conversation logs.</li>
          <li>Use step-based confirmation: initiation, verification, handover, closure.</li>
          <li>Do not finalize any transfer without checklist completion.</li>
        </ul>
      </section>

      <section>
        <h2>4) Red Flags You Should Never Ignore</h2>
        <ul>
          <li>Urgent pressure to pay without verification</li>
          <li>Sudden change of payment receiver/account details</li>
          <li>Refusal to provide basic channel evidence</li>
          <li>Conflicting statements across chat, call, and email</li>
          <li>Requests to bypass platform communication route</li>
        </ul>
      </section>

      <section>
        <h2>5) Buyer-Side Safety Tips</h2>
        <ul>
          <li>Verify channel metrics against recent update history.</li>
          <li>Ask for clear handover terms before commitment.</li>
          <li>Document every milestone and follow-up deadline.</li>
          <li>Escalate early if delivery terms differ from agreement.</li>
        </ul>
      </section>

      <section>
        <h2>6) Seller/Operator Safety Tips</h2>
        <ul>
          <li>Keep creator and channel records organized and timestamped.</li>
          <li>Use official templates for onboarding and status reporting.</li>
          <li>Confirm buyer identity before sharing sensitive channel assets.</li>
          <li>Escalate suspicious behavior to admin immediately.</li>
        </ul>
      </section>

      <section>
        <h2>7) Device & Network Security</h2>
        <ul>
          <li>Use updated browser and operating system patches.</li>
          <li>Avoid public Wi-Fi for sensitive account operations.</li>
          <li>Lock your phone/laptop and avoid shared-device sessions.</li>
          <li>Sign out from old sessions after major account changes.</li>
        </ul>
      </section>

      <section>
        <h2>8) If You Suspect Fraud</h2>
        <ol>
          <li>Stop transaction immediately.</li>
          <li>Take screenshots and preserve the chat timeline.</li>
          <li>Write a short incident summary with date/time.</li>
          <li>Contact support through verified channels.</li>
        </ol>
      </section>

      <section>
        <h2>9) Related Pages</h2>
        <div className="info-links">
          <Link href="/help-center">Help Center</Link>
          <Link href="/contact-us">Contact Us</Link>
          <Link href="/privacy-policy">Privacy Policy</Link>
        </div>
      </section>
    </main>
  );
}
