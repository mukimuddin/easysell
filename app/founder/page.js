import Image from 'next/image';

export const metadata = {
  title: 'Mukim Uddin - Founder & Strategic Lead, YTM Bangladesh',
  description: 'Learn about Mukim Uddin, the visionary behind YTM Bangladesh. Discover his journey in building a professional YouTube channel supply network from Dhaka.',
  keywords: 'Mukim Uddin, YTM Bangladesh founder, YouTube entrepreneur Bangladesh, channel sourcing expert, digital marketing leader Dhaka',
}

const milestones = [
  { year: '2017', title: 'Market Entry', desc: 'Started as a solo channel sourcing consultant in Dhaka with a micro client base.' },
  { year: '2019', title: 'Team Build', desc: 'Built first structured field team and launched repeatable onboarding playbook.' },
  { year: '2021', title: 'Operations Scale', desc: 'Transitioned to hybrid model with dedicated verification, support, and buyer desks.' },
  { year: '2023', title: 'Process Leadership', desc: 'Introduced policy-first workflow and risk-controlled delivery checkpoints.' },
  { year: '2026', title: 'Dhaka HQ / Regional Desk', desc: 'Scaled buyer desks and delivery coordination from Bangladesh across multiple markets.' },
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
            Mukim Uddin leads YTM Bangladesh from Dhaka—the operating side of a channel sourcing and buyer-matching
            network built for people who buy and sell YouTube channels at volume. The idea was never “noise first”:
            it was steady vetting, clear handovers, and teams that could repeat the same quality week after week.
          </p>
          <p>
            Bangladesh’s digital commerce scene moves fast—freelancers, agencies, and cross-border buyers all share the
            same demand for reliable execution. Mukim’s focus has been to turn that demand into something boringly
            predictable: defined stages for sourcing, screening, matching, delivery, and follow-up so nothing important
            lives only in someone’s inbox or voice note.
          </p>
          <p>
            That meant building from the ground up in a local context—training field and desk teams, keeping escalation
            paths short, and documenting decisions so growth didn’t turn into chaos. The goal was always operational
            maturity: who owns what, where quality is checked, and how reporting reaches both sides when timelines tighten.
          </p>
          <p>
            Today the workflow stays measurable end to end—from first lead and seller onboarding through channel
            readiness checks, delivery assurance, and continuity after handover. Speed matters in this market; so does
            control. The aim is to improve both without cutting corners on verification or buyer trust.
          </p>
          <p>
            Mukim combines on-the-ground familiarity with how deals actually close in Bangladesh and the discipline you
            need when buyers sit in multiple time zones. Teams get simple frameworks they can run daily—not slide decks—so
            ambitious targets translate into repeatable execution, not one-off heroics.
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
        <h2>How the market sees the operation</h2>
        <p>
          People who work with YTM Bangladesh often describe Mukim as low-drama and high-follow-through—someone who took
          scattered sourcing activity and turned it into a routine: verify, document, hand over, support. In a sector where
          trust is everything, that consistency matters more than loud marketing.
        </p>
        <p>
          Under his direction, the team leaned into clear onboarding paths (remote and in-person where needed), staged
          reviews before money and assets move, and reporting rhythms that keep buyers and partners aligned—especially when
          deals span Bangladesh and overseas desks.
        </p>
        <p>
          The real contribution isn’t only volume; it’s a way of working where speed doesn’t automatically mean cutting
          corners—because the checkpoints are built into the process, not bolted on after something goes wrong.
        </p>
      </section>

      <section className="founder-block">
        <h2>Vision & direction</h2>
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
