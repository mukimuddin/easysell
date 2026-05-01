import Link from 'next/link';

export default function JobsPage() {
  const commonResponsibilities = [
    'ইউটিউব চ্যানেল খোলার জন্য আগ্রহ সৃষ্টি করা এবং প্রার্থীদের অনবোর্ড করা',
    'গাইডলাইন অনুযায়ী চ্যানেল তৈরি এবং প্রাথমিক গ্রোথ নিশ্চিত করা',
    'প্রতিটি অনবোর্ডেড ক্লায়েন্ট/চ্যানেলের অগ্রগতি নিয়মিত মনিটর করা',
    'টার্গেট অনুযায়ী নির্দিষ্ট সংখ্যক চ্যানেল সম্পন্ন করে জমা দেওয়া',
    'ডাটা আপডেট রাখা এবং সুপারভাইজারকে নিয়মিত রিপোর্ট দেওয়া',
  ];

  const onlineModeResponsibilities = [
    'Facebook, WhatsApp, Telegram, YouTube group ইত্যাদির মাধ্যমে সম্ভাব্য প্রার্থী খুঁজে বের করা',
    'ফোন কল, মেসেঞ্জার, ভিডিও কলে রিমোটভাবে কাজ বুঝিয়ে onboarding সম্পন্ন করা',
    'অনলাইনে follow-up দিয়ে প্রার্থীদের channel setup ও submission support দেওয়া',
  ];

  const fieldModeResponsibilities = [
    'মাঠ পর্যায়ে নতুন সম্ভাব্য ব্যক্তিদের চিহ্নিত করা এবং সরাসরি যোগাযোগ স্থাপন করা',
    'সশরীরে মিটিং করে কাজের বিষয় বুঝানো, আগ্রহ সৃষ্টি করা ও রাজি করানো',
    'Field follow-up করে নির্ধারিত সময়ে চ্যানেল submission নিশ্চিত করা',
  ];

  const requirements = [
    'ন্যূনতম SSC / O-Level বা সমমানের শিক্ষাগত যোগ্যতা থাকতে হবে',
    'Online অথবা Field Work এর যেকোনো একটিতে অন্তত ১ বছরের অভিজ্ঞতা থাকলে অগ্রাধিকার',
    'শক্তিশালী যোগাযোগ দক্ষতা এবং মানুষকে বোঝানোর সক্ষমতা থাকতে হবে',
    'ইউটিউব প্ল্যাটফর্ম ও কনটেন্ট ক্রিয়েশন সম্পর্কে বেসিক ধারণা থাকতে হবে',
    'টার্গেট ভিত্তিক কাজ করার মানসিকতা এবং চাপের মধ্যে কাজ করার সক্ষমতা থাকতে হবে',
    'স্মার্টফোন ও ইন্টারনেট ব্যবহারে স্বাচ্ছন্দ্য থাকতে হবে',
  ];

  const minimumEligibility = [
    'ন্যূনতম SSC / O-Level বা সমমানের পরীক্ষায় উত্তীর্ণ হতে হবে',
    'প্রার্থীর বয়স ন্যূনতম ১৮ বছর হতে হবে',
    'মৌলিক পড়া-লেখা ও বোঝার সক্ষমতা থাকতে হবে',
    'মাঠ পর্যায়ে কাজ করার আগ্রহ ও সক্ষমতা থাকতে হবে',
    'স্মার্টফোন ব্যবহার এবং ইন্টারনেট সম্পর্কে বেসিক ধারণা থাকতে হবে',
    'শারীরিকভাবে সুস্থ এবং চলাফেরায় সক্ষম হতে হবে',
  ];

  return (
    <main className="common-container jobs-wrap">
      <div className="jobs-card">
        <div className="jobs-header">
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--muted-foreground)', fontWeight: 700, letterSpacing: '0.06em' }}>
              Job Circular
            </div>
            <h1 className="jobs-title">চ্যানেল সোর্সিং এক্সিকিউটিভ (ফিল্ড)</h1>
          </div>
          <div className="jobs-meta">
            <div style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>কোম্পানির নাম: <strong style={{ color: 'var(--foreground)' }}>YTM Bangladesh</strong></div>
            <div style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>কাজের ধরন: <strong style={{ color: 'var(--foreground)' }}>চুক্তিভিত্তিক</strong></div>
            <div style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>কাজের সেটআপ: <strong style={{ color: 'var(--foreground)' }}>হাইব্রিড (Online + Offline Field)</strong></div>
          </div>
        </div>

        <section style={{ marginTop: '0.85rem' }}>
          <h2 style={{ marginBottom: '0.35rem', fontSize: '1rem' }}>কাজের ধরন (২টি অপশন)</h2>
          <ul style={{ margin: 0, paddingLeft: '1.1rem', display: 'grid', gap: '0.3rem' }}>
            <li style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>
              <strong>Online Mode:</strong> বাসা/রিমোট থেকে ডিজিটাল চ্যানেলে লিড সংগ্রহ, যোগাযোগ ও onboarding।
            </li>
            <li style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>
              <strong>Offline Field Mode:</strong> মাঠ পর্যায়ে সরাসরি যোগাযোগ, মিটিং ও ক্লায়েন্ট onboarding।
            </li>
          </ul>
        </section>

        <Section title="সবার জন্য মূল দায়িত্ব" items={commonResponsibilities} />
        <Section title="Online Mode দায়িত্ব" items={onlineModeResponsibilities} />
        <Section title="Offline Field Mode দায়িত্ব" items={fieldModeResponsibilities} />
        <Section title="প্রয়োজনীয়তা ও দক্ষতা" items={requirements} />
        <Section title="ন্যূনতম যোগ্যতার প্রয়োজনীয়তা" items={minimumEligibility} />

        <div style={{ marginTop: '0.9rem', borderTop: '1px solid var(--border)', paddingTop: '0.8rem' }}>
          <div style={{ fontSize: '13px', marginBottom: '0.25rem' }}>
            <strong>ন্যূনতম অভিজ্ঞতা:</strong> ১ বছরের কম
          </div>
          <div style={{ fontSize: '13px', marginBottom: '0.25rem' }}>
            <strong>অভিজ্ঞতার ধরন:</strong> Online Sales / Telemarketing / Field Marketing - যেকোনো একটিতে অভিজ্ঞতা গ্রহণযোগ্য
          </div>
          <div style={{ fontSize: '13px', marginBottom: '0.25rem' }}>
            <strong>লোকেশন:</strong> ঢাকা
          </div>
          <div style={{ fontSize: '13px', marginBottom: '0.25rem' }}>
            <strong>বেতন:</strong> ২০,০০০–৩০,০০০ টাকা + TA/DA
          </div>
          <div style={{ fontSize: '13px' }}>
            <strong>Apply:</strong> <span style={{ fontFamily: 'monospace' }}>ytmarketbd2020</span> (Subject: Application for Field Sourcing Executive)
          </div>
        </div>

        <div className="jobs-actions">
          <Link href="/" className="btn jobs-btn">Back to Home</Link>
          <a
            href="https://wa.me/8801601315176?text=Hello%20YTM%20Bangladesh%2C%20I%20want%20information%20about%20the%20Channel%20Sourcing%20Executive%20job%20and%20want%20to%20apply%20with%20my%20CV."
            target="_blank"
            rel="noreferrer"
            className="btn btn-outline jobs-btn"
          >
            WhatsApp for Info & CV Apply
          </a>
        </div>
        <p style={{ marginTop: '0.6rem', marginBottom: 0, fontSize: '12px', color: 'var(--muted-foreground)' }}>
          WhatsApp: +8801601315176 (For information and apply CV)
        </p>
      </div>
    </main>
  );
}

function Section({ title, items }) {
  return (
    <section style={{ marginTop: '0.85rem' }}>
      <h2 style={{ marginBottom: '0.35rem', fontSize: '1rem' }}>{title}</h2>
      <ul style={{ margin: 0, paddingLeft: '1.1rem', display: 'grid', gap: '0.3rem' }}>
        {items.map((item) => (
          <li key={item} style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
