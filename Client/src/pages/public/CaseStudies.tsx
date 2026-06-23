import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Footer from './Footer';

const LOGO_SRC = '/autoniv.png';

const navItems = [
  { label: 'Agents', href: '/agents' },
  { label: 'Case Studies', href: '/case-studies' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'News', href: '/news' },
];

const usps = [
  { icon: '🎙️', text: 'AI Voice Agents That Answer, Qualify & Convert Leads 24/7 — Without Hiring More Staff.' },
  { icon: '🌍', text: 'Multi-Language Support – AI That Speaks Your Customers\' Language' },
  { icon: '⚡', text: 'Quick Setup – Live in Minutes, No Code Needed' },
];

const TRUSTED_BRANDS = [
  'RealtyMax', 'Care+ Clinics', 'LearnUp', 'The Skin Lounge',
  'EduSphere', 'FitNation', 'UrbanCart', 'FinTrack',
];

const GLOBAL_STATS = [
  { value: '500+', label: 'Businesses Served' },
  { value: '2M+', label: 'Conversations Handled' },
  { value: '30%+', label: 'Average Increase in Conversions' },
  { value: '24/7', label: 'AI Agents Working' },
  { value: '98%', label: 'Client Satisfaction Rate' },
  { value: '₹50Cr+', label: 'Revenue Generated for Clients' },
];

const STUDIES = [
  {
    category: 'Real Estate',
    subcategory: 'Property Dealer (Bangalore)',
    icon: '🏠',
    metric: '+128%',
    metricLabel: 'More Conversions',
    badgeColor: '#10B981',
    challenge: 'High lead volume, missed calls, no proper follow-ups.',
    solutions: [
      { icon: '📞', label: 'AI Voice Assistant' },
      { icon: '💬', label: 'WhatsApp Chatbot' },
      { icon: '📈', label: 'CRM Automation' },
    ],
    results: [
      { value: '3.2X', label: 'More Qualified Leads', color: '#10B981' },
      { value: '62%', label: 'Call Answer Rate', color: '#10B981' },
      { value: '40%', label: 'Sales Team Productivity', color: '#f97316' },
    ],
  },
  {
    category: 'Healthcare',
    subcategory: 'Multi-Speciality Clinic',
    icon: '🏥',
    metric: '-55%',
    metricLabel: 'No-Show Rate',
    badgeColor: '#2563EB',
    challenge: 'Manual appointment booking, no reminders, high no-shows.',
    solutions: [
      { icon: '📞', label: 'AI Voice Agent' },
      { icon: '📅', label: 'Appointment Bot' },
      { icon: '📈', label: 'CRM + Reminders' },
    ],
    results: [
      { value: '+72%', label: 'Appointments Booked', color: '#10B981' },
      { value: '-55%', label: 'No-Show Rate', color: '#2563EB' },
      { value: '+45%', label: 'Patient Re-book Rate', color: '#f97316' },
    ],
  },
  {
    category: 'E-Commerce',
    subcategory: 'D2C Brand (Mumbai)',
    icon: '🛒',
    metric: '+96%',
    metricLabel: 'Sales Growth',
    badgeColor: '#f97316',
    challenge: 'High cart abandonment, slow replies, lost sales.',
    solutions: [
      { icon: '🤖', label: 'AI Chatbot' },
      { icon: '💬', label: 'WhatsApp Bot' },
      { icon: '📈', label: 'CRM Automation' },
    ],
    results: [
      { value: '+96%', label: 'Sales Growth', color: '#f97316' },
      { value: '2.8X', label: 'Customer Engagement', color: '#10B981' },
      { value: '30%', label: 'Repeat Purchases', color: '#2563EB' },
    ],
  },
];

/* ─── USP Ticker ─── */
function USPSlider() {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setCurrent(i => (i + 1) % usps.length), 3000);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 60, height: 36,
      background: 'linear-gradient(90deg,#030B2E 0%,#051a3a 50%,#030B2E 100%)',
      borderBottom: '1px solid rgba(16,185,129,0.2)', overflow: 'hidden',
    }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '0 16px' }}>
        {usps.map((usp, i) => (
          <span key={i} style={{
            position: 'absolute', display: 'inline-flex', alignItems: 'center', gap: 8,
            fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.85)',
            opacity: i === current ? 1 : 0, transition: 'opacity 0.5s, transform 0.5s',
            transform: i === current ? 'translateY(0)' : 'translateY(10px)',
            whiteSpace: 'nowrap',
          }}>
            <span>{usp.icon}</span><span>{usp.text}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Starfield ─── */
function Stars() {
  const stars = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    r: Math.random() * 1.5 + 0.5,
    op: Math.random() * 0.5 + 0.1,
    dur: Math.random() * 4 + 3,
  }));
  return (
    <svg style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }} xmlns="http://www.w3.org/2000/svg">
      {stars.map(s => (
        <circle key={s.id} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} fill="white" opacity={s.op}>
          <animate attributeName="opacity" values={`${s.op};${s.op * 0.2};${s.op}`} dur={`${s.dur}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </svg>
  );
}

/* ─── Nav ─── */
function Nav({ mobileMenuOpen, setMobileMenuOpen }: { mobileMenuOpen: boolean; setMobileMenuOpen: (v: boolean) => void }) {
  const location = useLocation();
  return (
    <nav style={{
      position: 'fixed', top: 36, left: 0, right: 0, zIndex: 50,
      background: 'rgba(3,11,46,0.85)', backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(37,99,235,0.15)',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/"><img src={LOGO_SRC} alt="Autoniv" style={{ height: 36 }} /></Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }} className="hidden-mobile">
          {navItems.map(item => (
            <Link key={item.label} to={item.href} style={{
              fontSize: 14, fontWeight: 600, textDecoration: 'none',
              color: location.pathname === item.href ? '#10B981' : 'rgba(255,255,255,0.6)',
              transition: 'color 0.2s',
            }}
              onMouseEnter={e => { if (location.pathname !== item.href) e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { if (location.pathname !== item.href) e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
            >{item.label}</Link>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }} className="hidden-mobile">
          <Link to="/" style={{ padding: '8px 16px', fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', borderRadius: 8, transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(37,99,235,0.15)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.background = 'transparent'; }}
          >Sign In</Link>
          <Link to="/" style={{
            padding: '10px 22px', fontSize: 14, fontWeight: 700, color: '#fff', textDecoration: 'none',
            borderRadius: 999, background: 'linear-gradient(135deg,#2563EB,#10B981)',
            boxShadow: '0 4px 20px rgba(16,185,129,0.35)', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(16,185,129,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(16,185,129,0.35)'; }}
          >Get Started Free</Link>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ display: 'none', background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }} className="show-mobile">
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>
      {mobileMenuOpen && (
        <div style={{ background: 'rgba(3,11,46,0.98)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(37,99,235,0.12)', padding: '16px 20px' }}>
          {navItems.map(item => (
            <Link key={item.label} to={item.href} onClick={() => setMobileMenuOpen(false)} style={{
              display: 'block', padding: '12px 16px', fontSize: 14, fontWeight: 600,
              borderRadius: 12, textDecoration: 'none', marginBottom: 4,
              color: location.pathname === item.href ? '#10B981' : 'rgba(255,255,255,0.7)',
              background: location.pathname === item.href ? 'rgba(16,185,129,0.1)' : 'transparent',
            }}>{item.label}</Link>
          ))}
          <div style={{ paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Link to="/" style={{ textAlign: 'center', padding: '12px', fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Sign In</Link>
            <Link to="/" style={{ textAlign: 'center', padding: '12px', fontSize: 14, fontWeight: 700, color: '#fff', borderRadius: 12, textDecoration: 'none', background: 'linear-gradient(135deg,#2563EB,#10B981)' }}>Get Started Free</Link>
          </div>
        </div>
      )}
    </nav>
  );
}

/* ─── Carousel Card ─── */
function StudyCard({ study, active }: { study: any; active: boolean }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 20,
      padding: '28px 28px 24px',
      width: '100%',
      boxSizing: 'border-box',
      boxShadow: active ? '0 24px 60px rgba(16,185,129,0.2), 0 8px 24px rgba(37,99,235,0.15)' : '0 8px 24px rgba(0,0,0,0.3)',
      transition: 'box-shadow 0.4s',
      fontFamily: "'Plus Jakarta Sans',sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Category badge + icon row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            background: `linear-gradient(135deg, ${study.badgeColor}22, ${study.badgeColor}44)`,
            border: `1.5px solid ${study.badgeColor}55`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
          }}>{study.icon}</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#030B2E' }}>{study.category}</div>
            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>{study.subcategory}</div>
          </div>
        </div>
        {/* Metric badge circle */}
        <div style={{
          width: 80, height: 80, borderRadius: '50%', flexShrink: 0,
          background: `conic-gradient(${study.badgeColor} 0deg, ${study.badgeColor}88 180deg, #e2e8f0 180deg)`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 24px ${study.badgeColor}60`,
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute', inset: 5, borderRadius: '50%', background: '#fff',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: study.badgeColor, lineHeight: 1 }}>{study.metric}</div>
            <div style={{ fontSize: 8, fontWeight: 700, color: '#64748b', textAlign: 'center', lineHeight: 1.2, marginTop: 2, padding: '0 4px' }}>{study.metricLabel}</div>
          </div>
        </div>
      </div>

      {/* Challenge */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Challenge</div>
        <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, margin: 0 }}>{study.challenge}</p>
      </div>

      {/* Solutions */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Our Solution</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {study.solutions.map((s: any) => (
            <span key={s.label} style={{
              display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 10px',
              borderRadius: 999, fontSize: 11, fontWeight: 600, color: '#475569',
              background: '#f1f5f9', border: '1px solid #e2e8f0',
            }}>
              <span>{s.icon}</span>{s.label}
            </span>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, #e2e8f0, transparent)', margin: '16px 0' }} />

      {/* Results */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Results</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, textAlign: 'center' }}>
          {study.results.map((r: any) => (
            <div key={r.label}>
              <div style={{ fontSize: 18, fontWeight: 900, color: r.color }}>{r.value}</div>
              <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>{r.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <a href="#" style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        fontSize: 13, fontWeight: 700, color: study.badgeColor, textDecoration: 'none',
        transition: 'gap 0.2s',
      }}
        onMouseEnter={e => e.currentTarget.style.gap = '10px'}
        onMouseLeave={e => e.currentTarget.style.gap = '6px'}
      >View Full Case Study →</a>
    </div>
  );
}

/* ─── Carousel ─── */
function Carousel() {
  const [active, setActive] = useState(1);
  const total = STUDIES.length;
  const prev = () => setActive(i => (i - 1 + total) % total);
  const next = () => setActive(i => (i + 1) % total);

  // Show prev, active, next (3 visible on desktop)
  const indices = [
    (active - 1 + total) % total,
    active,
    (active + 1) % total,
  ];

  return (
    <div style={{ position: 'relative', padding: '0 60px' }}>
      {/* Arrow left */}
      <button onClick={prev} style={{
        position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
        width: 44, height: 44, borderRadius: '50%', border: '1px solid rgba(16,185,129,0.4)',
        background: 'rgba(3,11,46,0.7)', color: '#10B981', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
        backdropFilter: 'blur(10px)', zIndex: 10, transition: 'all 0.2s',
      }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.2)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(3,11,46,0.7)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1)'; }}
      >‹</button>

      {/* Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, alignItems: 'start' }}>
        {indices.map((si, pos) => (
          <div key={si} style={{
            opacity: pos === 1 ? 1 : 0.55,
            transform: pos === 1 ? 'scale(1.03)' : 'scale(0.97)',
            transition: 'all 0.4s cubic-bezier(.16,1,.3,1)',
            cursor: pos !== 1 ? 'pointer' : 'default',
          }} onClick={() => { if (pos === 0) prev(); if (pos === 2) next(); }}>
            <StudyCard study={STUDIES[si]} active={pos === 1} />
          </div>
        ))}
      </div>

      {/* Arrow right */}
      <button onClick={next} style={{
        position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
        width: 44, height: 44, borderRadius: '50%', border: '1px solid rgba(16,185,129,0.4)',
        background: 'rgba(3,11,46,0.7)', color: '#10B981', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
        backdropFilter: 'blur(10px)', zIndex: 10, transition: 'all 0.2s',
      }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.2)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(3,11,46,0.7)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1)'; }}
      >›</button>

      {/* Dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
        {STUDIES.map((_, i) => (
          <button key={i} onClick={() => setActive(i)} style={{
            width: i === active ? 24 : 8, height: 8, borderRadius: 99, border: 'none', cursor: 'pointer',
            background: i === active ? 'linear-gradient(90deg,#2563EB,#10B981)' : 'rgba(255,255,255,0.2)',
            transition: 'all 0.3s', padding: 0,
          }} />
        ))}
      </div>
    </div>
  );
}

/* ─── Main export ─── */
export function CaseStudies() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div style={{
      minHeight: '100vh', position: 'relative',
      background: 'linear-gradient(160deg, #030B2E 0%, #051530 40%, #030f28 70%, #020a1e 100%)',
      fontFamily: "'Plus Jakarta Sans',sans-serif", color: '#fff',
    }}>
      <Stars />

      {/* Glow blobs */}
      <div style={{ position: 'fixed', top: '-15%', left: '-10%', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 65%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', top: '30%', right: '-15%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 65%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '5%', left: '30%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 65%)', pointerEvents: 'none', zIndex: 0 }} />

      <USPSlider />
      <Nav mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

      <div style={{ position: 'relative', zIndex: 10, paddingTop: 140, paddingBottom: 96 }}>

        {/* ── Hero ── */}
        <div style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto 64px', padding: '0 24px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 16px',
            borderRadius: 999, fontSize: 12, fontWeight: 700, letterSpacing: '0.1em',
            background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#34D399',
            marginBottom: 20,
          }}>• CASE STUDIES •</div>
          <h1 style={{ fontSize: 'clamp(36px,5vw,60px)', fontWeight: 900, lineHeight: 1.1, margin: '0 0 20px', color: '#fff' }}>
            Real Businesses.{' '}
            <span style={{
              background: 'linear-gradient(135deg,#2563EB 0%,#10B981 60%,#34D399 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>Real Results.</span>
          </h1>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, margin: 0 }}>
            See how Autoniv's AI Voice Agents, Chatbots & CRM Automation<br />are helping businesses save time, convert more and grow faster.
          </p>
        </div>

        {/* ── Carousel ── */}
        <div style={{ maxWidth: 1200, margin: '0 auto 80px', padding: '0 24px' }}>
          <Carousel />
        </div>

        {/* ── Trusted by ── */}
        <div style={{ maxWidth: 1200, margin: '0 auto 80px', padding: '0 24px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 16,
            borderTop: '1px solid rgba(255,255,255,0.07)',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            padding: '28px 0',
          }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.12em', whiteSpace: 'nowrap', flexShrink: 0 }}>
              • TRUSTED BY 500+ BUSINESSES •
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, flex: 1 }}>
              {TRUSTED_BRANDS.map(b => (
                <span key={b} style={{
                  padding: '7px 18px', borderRadius: 999, fontSize: 12, fontWeight: 700,
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.65)',
                }}>{b}</span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Global Stats Banner ── */}
        <div style={{ maxWidth: 1200, margin: '0 auto 80px', padding: '0 24px' }}>
          <div style={{
            borderRadius: 24, overflow: 'hidden',
            background: 'linear-gradient(120deg, rgba(37,99,235,0.25) 0%, rgba(3,11,46,0.8) 40%, rgba(16,185,129,0.2) 100%)',
            border: '1px solid rgba(16,185,129,0.2)', backdropFilter: 'blur(20px)',
          }}>
            <div style={{ padding: '48px 40px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 32, textAlign: 'center' }}>
              {GLOBAL_STATS.map(s => (
                <div key={s.label}>
                  <div style={{
                    fontSize: 32, fontWeight: 900, marginBottom: 6,
                    background: 'linear-gradient(135deg,#2563EB,#10B981)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                  }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── CTA ── */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{
            borderRadius: 24, padding: '56px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden',
            background: 'linear-gradient(135deg, rgba(37,99,235,0.2) 0%, rgba(3,11,46,0.95) 50%, rgba(16,185,129,0.15) 100%)',
            border: '1px solid rgba(16,185,129,0.25)',
          }}>
            {/* Rocket */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: 80, height: 80, borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(37,99,235,0.4), rgba(16,185,129,0.3))',
                  border: '1px solid rgba(16,185,129,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36,
                  boxShadow: '0 0 40px rgba(16,185,129,0.3)',
                  animation: 'rocketFloat 3s ease-in-out infinite',
                }}>🚀</div>
              </div>
            </div>
            <h2 style={{ fontSize: 'clamp(26px,4vw,40px)', fontWeight: 900, color: '#fff', margin: '0 0 12px' }}>
              Let's Build Your Success Story
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', margin: '0 0 36px' }}>
              Join 500+ businesses already growing with Autoniv.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
              <Link to="/" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '14px 32px', borderRadius: 999, fontSize: 15, fontWeight: 700,
                textDecoration: 'none',
                background: 'linear-gradient(135deg,#2563EB,#10B981)', color: '#fff',
                boxShadow: '0 4px 20px rgba(255,255,255,0.2)', transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 32px rgba(255,255,255,0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(255,255,255,0.2)'; }}
              >Book a Demo →</Link>
              <Link to="/" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '14px 32px', borderRadius: 999, fontSize: 15, fontWeight: 700,
                color: '#fff', textDecoration: 'none',
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >🎧 Talk to Expert</Link>
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes rocketFloat {
          0%,100%{transform:translateY(0)}
          50%{transform:translateY(-10px)}
        }
        @media(max-width:768px){
          .hidden-mobile{display:none!important}
          .show-mobile{display:flex!important}
        }
        @media(min-width:769px){
          .show-mobile{display:none!important}
        }
      `}</style>

      <Footer />
    </div>
  );
}

export default CaseStudies;