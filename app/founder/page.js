import Image from 'next/image';

const milestones = [
  { year: '2017', title: 'Market Entry', desc: 'Started as a solo channel sourcing consultant in Dhaka with a micro client base.' },
  { year: '2019', title: 'Team Build', desc: 'Built first structured field team and launched repeatable onboarding playbook.' },
  { year: '2021', title: 'Operations Scale', desc: 'Transitioned to hybrid model with dedicated verification, support, and buyer desks.' },
  { year: '2023', title: 'Process Leadership', desc: 'Introduced policy-first workflow and risk-controlled delivery checkpoints.' },
  { year: '2026', title: 'Regional Recognition', desc: 'Positioned YTM Bangladesh as a high-performance sourcing and delivery operation.' },
];

const achievements = [
  ['Total Deals Guided', '38,500+'],
  ['Buyer Network Reach', '14,800+'],
  ['Partner Channels', '96'],
  ['Operational Workforce', '1,950+'],
  ['Client Satisfaction Trend', '4.8/5'],
  ['Countries Connected', '27'],
];

const signatureTraits = [
  'Disciplined execution under high-volume conditions',
  'Data-backed operational decision making',
  'Policy-aligned client relationship management',
  'Long-term ecosystem thinking over short-term wins',
  'Team-first leadership with clear accountability',
];

export default function FounderPage() {
  return (
    <main className="common-container founder-page">
      <section className="founder-hero">
        <div className="founder-photo-wrap">
          <Image
            src="/mukimuddin.JPG.jpeg"
            alt="Mukim Uddin"
            width={460}
            height={560}
            className="founder-photo"
            priority
          />
        </div>
        <div className="founder-intro">
          <div className="founder-kicker">Owner & Strategic Lead</div>
          <h1>Mukim Uddin</h1>
          <p>
            Mukim Uddin is presented as a high-impact operations entrepreneur who transformed YTM Bangladesh into a
            trusted, process-driven ecosystem for channel sourcing, buyer matching, and scalable delivery execution.
          </p>
          <p>
            This profile page is built with premium dummy data to reflect a 100% success-oriented leadership story:
            long-term consistency, resilient decision-making, and exceptional marketplace execution discipline.
          </p>
          <p>
            Over the years, his leadership model has been defined by precision, patience, and process maturity.
            Rather than chasing short-term visibility, he focused on building durable systems: clear workflow ownership,
            quality checkpoints, operational accountability, and transparent reporting layers that can survive growth pressure.
          </p>
          <p>
            He is known for converting complex, noisy operations into structured pipelines where every phase is measurable:
            lead generation, candidate onboarding, channel readiness, delivery assurance, and post-handover continuity.
            This systems-first mindset enabled teams to improve both speed and reliability without compromising control.
          </p>
          <p>
            In this premium profile narrative, Mukim Uddin is positioned as a benchmark success figure — someone who blends
            field intelligence with executive-level strategy, empowers teams with practical frameworks, and consistently turns
            ambitious targets into repeatable outcomes.
          </p>
          <div className="founder-tags">
            <span>Process Architect</span>
            <span>Growth Operator</span>
            <span>Market Strategist</span>
          </div>
        </div>
      </section>

      <section className="founder-block">
        <h2>Executive Snapshot</h2>
        <div className="founder-stats">
          {achievements.map(([label, value]) => (
            <div key={label} className="founder-stat-card">
              <p>{label}</p>
              <h3>{value}</h3>
            </div>
          ))}
        </div>
      </section>

      <section className="founder-block">
        <h2>Professional History Timeline</h2>
        <div className="founder-timeline">
          {milestones.map((item) => (
            <article key={item.year} className="founder-timeline-item">
              <div className="founder-year">{item.year}</div>
              <div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="founder-grid">
        <article className="founder-block">
          <h2>Leadership Philosophy</h2>
          <p>
            Mukim Uddin believes sustainable success is created through structured repetition, not random momentum.
            His operating model focuses on clarity, measurable targets, and execution stability under pressure.
          </p>
          <p>
            The leadership approach combines field realism with system-level thinking. Every workflow is designed to
            be auditable, repeatable, and scalable.
          </p>
        </article>
        <article className="founder-block">
          <h2>Signature Strengths</h2>
          <ul>
            {signatureTraits.map((trait) => (
              <li key={trait}>{trait}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="founder-block">
        <h2>Media-Style Narrative (Dummy)</h2>
        <p>
          Industry observers describe Mukim Uddin as a "silent execution machine" who turned fragmented sourcing activity
          into a full-stack operational discipline. His reputation is built on consistency, not hype.
        </p>
        <p>
          Under his direction, teams adopted hybrid onboarding channels, risk-aware review checkpoints, and high-frequency
          reporting standards that elevated delivery confidence among buyers and partners.
        </p>
        <p>
          His core contribution is not only scaling numbers, but building a framework where quality and speed can coexist
          without operational chaos.
        </p>
      </section>

      <section className="founder-block">
        <h2>Vision 2030 (Dummy Strategic Outlook)</h2>
        <ul>
          <li>Establish YTM Bangladesh as the most process-reliable channel operations brand in the region.</li>
          <li>Launch advanced compliance and quality intelligence systems for marketplace transparency.</li>
          <li>Develop leadership pipelines that can run independent high-performance operating units.</li>
          <li>Expand multi-country partner desk networks while preserving delivery quality standards.</li>
        </ul>
      </section>
    </main>
  );
}
