export const metadata = {
  title: 'Refund Policy - YTM Bangladesh',
  description: 'Understand the refund eligibility and process at YTM Bangladesh. Learn about required evidence, timelines, and resolution pathways.',
  keywords: 'YTM Bangladesh refund, YouTube marketplace refund policy, transaction dispute resolution',
}

export default function RefundPolicyPage() {
  return (
    <main className="common-container info-page">
      <h1>Refund Policy</h1>
      <p className="info-lead">
        Effective Date: 01 May 2026. This Refund Policy defines eligibility standards, evidence requirements,
        and resolution pathways for refund-related requests in YTM Bangladesh service workflows.
      </p>

      <section>
        <h2>1) Core Principle</h2>
        <p>
          Refund decisions are based on documented commitments, delivery status, communication history, and verifiable evidence.
          Claims without sufficient evidence may be delayed or rejected.
        </p>
      </section>

      <section>
        <h2>2) Potentially Eligible Cases</h2>
        <ul>
          <li>Confirmed non-delivery within agreed documented timeline</li>
          <li>Material mismatch between documented scope and delivered scope</li>
          <li>Duplicate charge proven by transaction records</li>
          <li>Platform-side administrative error acknowledged by support review</li>
        </ul>
      </section>

      <section>
        <h2>3) Non-Eligible Cases</h2>
        <ul>
          <li>Change of mind after successful delivery completion</li>
          <li>Delay caused by requester non-response or missing required inputs</li>
          <li>Disputes based only on verbal claims without records</li>
          <li>Off-platform side agreements outside official workflow</li>
        </ul>
      </section>

      <section>
        <h2>4) Required Evidence for Request</h2>
        <ul>
          <li>Payment reference(s) and timestamps</li>
          <li>Conversation screenshots or email thread</li>
          <li>Defined agreed scope and expected milestone</li>
          <li>Clear explanation of issue in concise timeline format</li>
        </ul>
      </section>

      <section>
        <h2>5) Refund Request Procedure</h2>
        <ol>
          <li>Contact support with subject: "Refund Request".</li>
          <li>Attach full evidence set in a single message.</li>
          <li>Wait for acknowledgement and case ID.</li>
          <li>Respond quickly to additional verification queries.</li>
        </ol>
      </section>

      <section>
        <h2>6) Review Timeline</h2>
        <ul>
          <li>Initial acknowledgement: usually within 24 hours</li>
          <li>Standard review: 3-7 business days</li>
          <li>Complex multi-party disputes: may require extended review window</li>
        </ul>
      </section>

      <section>
        <h2>7) Approved Refund Handling</h2>
        <p>
          If approved, refund is processed through the appropriate channel and can be subject to banking/payment processor timing.
          Partial refunds may apply where partial delivery is verified.
        </p>
      </section>

      <section>
        <h2>8) Dispute Integrity</h2>
        <p>
          Misleading or manipulated evidence may lead to claim rejection and account action under Terms of Service.
        </p>
      </section>

      <section>
        <h2>9) Related Policies</h2>
        <ul>
          <li>Terms of Service for general liability and conduct limits</li>
          <li>Privacy Policy for data handling during dispute review</li>
          <li>Help Center for support workflow best practices</li>
        </ul>
      </section>
    </main>
  );
}
