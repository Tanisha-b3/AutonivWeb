import { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Footer from './Footer';
import ScrollToTop from '../../components/ScrollToTop';

const AuthDialog = lazy(() =>
  import('./AuthDialog').then((m) => ({ default: m.AuthDialog }))
);

const LOGO_SRC = '/autoniv.webp';

const navItems = [
  { label: 'Agents', href: '/agents' },
  { label: 'Case Studies', href: '/case-studies' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'News', href: '/news' },
  { label: 'About', href: '/about' }
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

import { USPSlider } from './sections/USPSlider';

/* ─── Nav ─── */
export function Nav({ mobileMenuOpen, setMobileMenuOpen }: { mobileMenuOpen: boolean; setMobileMenuOpen: (v: boolean) => void }) {
  const location = useLocation();
  const drawerRef = useRef<HTMLDivElement>(null);
  const [authDialog, setAuthDialog] = useState<'login' | 'register' | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const openAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setAuthDialog(mode);
  };
  const closeAuth = () => setAuthDialog(null);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const c = (e: MouseEvent) => {
      const target = e.target as Node;
      if (drawerRef.current && drawerRef.current.contains(target)) return;
      setMobileMenuOpen(false);
    };
    document.addEventListener('mousedown', c);
    return () => document.removeEventListener('mousedown', c);
  }, [mobileMenuOpen, setMobileMenuOpen]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname, setMobileMenuOpen]);

  useEffect(() => {
    if (mobileMenuOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mobileMenuOpen, setMobileMenuOpen]);

  return (
    <>
      <nav className="fixed top-[36px] inset-x-0 z-50" style={{
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(37,99,235,0.12)',
      }}>
        <div className="max-w-7xl -ml-10 lg:ml-30 md:ml-5 px-6 sm:px-6 h-[68px] flex items-center justify-between">
          <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img src={LOGO_SRC} alt="Autoniv" className="h-40 sm:h-40 w-auto object-contain" />
          </Link>
          <div className="hidden md:flex items-center gap-6">
            {navItems.map(item => (
              <Link key={item.label} to={item.href} className="text-sm font-semibold transition-colors"
                style={{ color: location.pathname === item.href ? '#2563EB' : '#475569' }}
                onMouseEnter={e => { if (location.pathname !== item.href) e.currentTarget.style.color = '#0a0a0a'; }}
                onMouseLeave={e => { if (location.pathname !== item.href) e.currentTarget.style.color = '#475569'; }}
              >{item.label}</Link>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => openAuth('login')}
              className="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
              style={{ color: '#475569', border: 'none', cursor: 'pointer', background: 'transparent' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#2563EB'; e.currentTarget.style.background = 'rgba(37,99,235,0.05)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.background = 'transparent'; }}
            >Sign In</button>
            <button
              onClick={() => openAuth('register')}
              className="px-5 py-2.5 text-sm font-bold text-white rounded-full transition-all"
              style={{ background: 'linear-gradient(135deg,#2563EB,#10B981)', boxShadow: '0 4px 20px rgba(16,185,129,0.35)', border: 'none', cursor: 'pointer' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(16,185,129,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(16,185,129,0.35)'; }}
            >Get Started Free</button>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer' }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </nav>

      {/* Backdrop overlay */}
      <div
        onClick={() => setMobileMenuOpen(false)}
        className="md:hidden fixed inset-0 z-[55] transition-opacity duration-300"
        style={{
          background: 'rgba(15,23,42,0.45)',
          opacity: mobileMenuOpen ? 1 : 0,
          pointerEvents: mobileMenuOpen ? 'auto' : 'none',
        }}
        aria-hidden={!mobileMenuOpen}
      />

      {/* Slide-in side drawer */}
      <div
        ref={drawerRef}
        className="md:hidden mt-9.5 fixed top-0 right-0 h-full z-[100] flex flex-col"
        style={{
          width: 'min(82vw, 340px)',
          background: 'rgba(255,255,255,0.98)',
          backdropFilter: 'blur(24px)',
          borderLeft: '1px solid rgba(37,99,235,0.12)',
          boxShadow: mobileMenuOpen ? '-12px 0 32px rgba(0,0,0,0.12)' : 'none',
          transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform .32s cubic-bezier(.23,1,.32,1)',
        }}
        role="dialog"
        aria-modal="true"
        aria-hidden={!mobileMenuOpen}
      >
        <div className="flex items-center justify-between px-5 h-[64px]" style={{ borderBottom: '1px solid rgba(37,99,235,0.10)' }}>
          <Link to="/" onClick={() => { setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            <img src={LOGO_SRC} alt="Autoniv" className="-ml-8 h-40 w-auto" />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
            className="p-2 rounded-lg"
            style={{ color: '#475569', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1">
          {navItems.map(item => (
            <Link
              key={item.label}
              to={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 text-sm font-semibold rounded-xl"
              style={{
                color: location.pathname === item.href ? '#2563EB' : '#475569',
                background: location.pathname === item.href ? 'rgba(37,99,235,0.07)' : 'transparent',
              }}
            >{item.label}</Link>
          ))}
        </div>

        <div className="px-5 py-5 mb-10 space-y-2" style={{ borderTop: '1px solid rgba(37,99,235,0.10)' }}>
          <button
            onClick={() => { openAuth('login'); setMobileMenuOpen(false); }}
            className="block w-full text-left px-4 py-3 text-sm font-semibold rounded-xl"
            style={{
              color: '#475569', background: 'none',
              border: '1px solid rgba(37,99,235,0.15)', cursor: 'pointer',
            }}
          >Sign In</button>
          <button
            onClick={() => { openAuth('register'); setMobileMenuOpen(false); }}
            className="block w-full text-center font-bold text-white px-4 py-3 rounded-xl"
            style={{
              background: 'linear-gradient(135deg,#2563EB,#10B981)',
              boxShadow: '0 4px 14px rgba(16,185,129,0.25)',
              border: 'none', cursor: 'pointer',
            }}
          >Get Started Free</button>
        </div>
      </div>

      <Suspense fallback={null}>
        <AuthDialog
          isOpen={authDialog !== null}
          mode={authMode}
          onClose={closeAuth}
          onSwitch={(m) => {
            setAuthMode(m === 'forgot_password' || m === 'reset_password' ? 'login' : m);
            setAuthDialog(m === 'forgot_password' || m === 'reset_password' ? 'login' : m);
          }}
        />
      </Suspense>
    </>
  );
}

/* ─── Carousel Card ─── */
function StudyCard({ study, active }: { study: any; active: boolean }) {
  return (
    <div className="bg-white rounded-2xl sm:rounded-[20px] p-5 sm:p-7 w-full box-border relative overflow-hidden" style={{
      boxShadow: active 
        ? '0 24px 60px rgba(16,185,129,0.15), 0 8px 24px rgba(37,99,235,0.10)' 
        : '0 8px 24px rgba(0,0,0,0.06)',
      transition: 'box-shadow 0.4s',
      fontFamily: "'Plus Jakarta Sans',sans-serif",
      border: active ? '2px solid rgba(16,185,129,0.2)' : '1px solid rgba(37,99,235,0.06)',
    }}>
      {/* Category badge + icon row */}
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-lg sm:text-xl" style={{
            background: `linear-gradient(135deg, ${study.badgeColor}15, ${study.badgeColor}30)`,
            border: `1.5px solid ${study.badgeColor}40`,
          }}>{study.icon}</div>
          <div>
            <div className="text-sm font-extrabold" style={{ color: '#0a0a0a' }}>{study.category}</div>
            <div className="text-[10px] sm:text-[11px] font-medium" style={{ color: '#94a3b8' }}>{study.subcategory}</div>
          </div>
        </div>
        {/* Metric badge circle */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex-shrink-0 flex flex-col items-center justify-center relative" style={{
          background: `conic-gradient(${study.badgeColor} 0deg, ${study.badgeColor}88 180deg, #e2e8f0 180deg)`,
          boxShadow: `0 0 24px ${study.badgeColor}40`,
        }}>
          <div className="absolute inset-1 sm:inset-1.5 rounded-full bg-white flex flex-col items-center justify-center">
            <div className="text-[11px] sm:text-xs font-black leading-none" style={{ color: study.badgeColor }}>{study.metric}</div>
            <div className="text-[7px] sm:text-[8px] font-bold text-center leading-tight mt-0.5 px-1" style={{ color: '#64748b' }}>{study.metricLabel}</div>
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
        <div className="grid grid-cols-3 gap-2 sm:gap-2 text-center">
          {study.results.map((r: any) => (
            <div key={r.label}>
              <div className="text-base sm:text-lg font-black" style={{ color: r.color }}>{r.value}</div>
              <div className="text-[9px] sm:text-[10px] mt-0.5" style={{ color: '#94a3b8' }}>{r.label}</div>
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

  const indices = [
    (active - 1 + total) % total,
    active,
    (active + 1) % total,
  ];

  return (
    <div className="px-10 sm:px-15 relative">
      {/* Arrow left */}
      <button onClick={prev} className="flex" style={{
        position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
        width: 36, height: 36, borderRadius: '50%', border: '1px solid rgba(37,99,235,0.2)',
        background: 'rgba(255,255,255,0.8)', color: '#2563EB', cursor: 'pointer',
        alignItems: 'center', justifyContent: 'center', fontSize: 16,
        backdropFilter: 'blur(10px)', zIndex: 10, transition: 'all 0.2s',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(37,99,235,0.08)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1.05)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.8)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1)'; }}
      >‹</button>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-20 items-start">
        {indices.map((si, pos) => (
          <div key={si} className={`${pos === 1 ? 'block' : 'hidden sm:block'}`} style={{
            opacity: pos === 1 ? 1 : 0.6,
            transform: pos === 1 ? 'scale(1.02)' : 'scale(0.95)',
            transition: 'all 0.4s cubic-bezier(.16,1,.3,1)',
            cursor: pos !== 1 ? 'pointer' : 'default',
          }} onClick={() => { if (pos === 0) prev(); if (pos === 2) next(); }}>
            <StudyCard study={STUDIES[si]} active={pos === 1} />
          </div>
        ))}
      </div>

      {/* Arrow right */}
      <button onClick={next} className="flex" style={{
        position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
        width: 36, height: 36, borderRadius: '50%', border: '1px solid rgba(37,99,235,0.2)',
        background: 'rgba(255,255,255,0.8)', color: '#2563EB', cursor: 'pointer',
        alignItems: 'center', justifyContent: 'center', fontSize: 16,
        backdropFilter: 'blur(10px)', zIndex: 10, transition: 'all 0.2s',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(37,99,235,0.08)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1.05)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.8)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1)'; }}
      >›</button>

      {/* Dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
        {STUDIES.map((_, i) => (
          <button key={i} onClick={() => setActive(i)} style={{
            width: i === active ? 24 : 8, height: 8, borderRadius: 99, border: 'none', cursor: 'pointer',
            background: i === active ? 'linear-gradient(90deg,#2563EB,#10B981)' : '#d1d5db',
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
      background: '#f8fafc',
      fontFamily: "'Plus Jakarta Sans',sans-serif", color: '#0a0a0a',
    }}>
      <USPSlider />
      <Nav mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

      <div className="relative z-10 pt-[140px] sm:pt-[140px] pb-16 sm:pb-24">

        {/* ── Hero ── */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16 px-4 sm:px-6">
          <div className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold tracking-[0.1em] mb-4 sm:mb-5" style={{
            background: 'rgba(37,99,235,0.08)',
            border: '1px solid rgba(37,99,235,0.2)',
            color: '#2563EB',
          }}>✦ CASE STUDIES</div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black leading-tight mb-4 sm:mb-5" style={{ color: '#0a0a0a' }}>
            Real Businesses.{' '}
            <span style={{
              background: 'linear-gradient(135deg,#2563EB 0%,#10B981 60%,#34D399 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>Real Results.</span>
          </h1>
          <p className="text-sm sm:text-base lg:text-lg leading-relaxed" style={{ color: '#64748b' }}>
            See how Autoniv's AI Voice Agents, Chatbots & CRM Automation<br className="hidden sm:block" />are helping businesses save time, convert more and grow faster.
          </p>
        </div>

        {/* ── Carousel ── */}
        <div className="max-w-6xl mx-auto mb-12 sm:mb-20 px-4 sm:px-6">
          <Carousel />
        </div>

        {/* ── Trusted by ── */}
        <div className="max-w-6xl mx-auto mb-12 sm:mb-20 px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-16 py-6 sm:py-0" style={{
            borderTop: '1px solid rgba(37,99,235,0.06)',
            borderBottom: '1px solid rgba(37,99,235,0.06)',
          }}>
            <span className="text-[10px] sm:text-[11px] font-bold text-[#94a3b8] tracking-[0.12em] whitespace-nowrap flex-shrink-0">
              • TRUSTED BY 500+ BUSINESSES •
            </span>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {TRUSTED_BRANDS.map(b => (
                <span key={b} className="px-3 sm:px-5 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-bold" style={{
                  background: 'rgba(37,99,235,0.04)',
                  border: '1px solid rgba(37,99,235,0.08)',
                  color: '#475569',
                }}>{b}</span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Global Stats Banner ── */}
        <div className="max-w-6xl mx-auto mb-12 sm:mb-20 px-4 sm:px-6">
          <div style={{
            borderRadius: 24, overflow: 'hidden',
            background: '#ffffff',
            border: '1px solid rgba(37,99,235,0.06)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
          }}>
            <div className="p-5 sm:p-10 grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8 text-center">
              {GLOBAL_STATS.map(s => (
                <div key={s.label}>
                  <div className="text-2xl sm:text-3xl font-black mb-1 sm:mb-2" style={{
                    background: 'linear-gradient(135deg,#2563EB,#10B981)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                  }}>{s.value}</div>
                  <div className="text-[10px] sm:text-xs text-[#94a3b8] leading-tight">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-14 text-center relative overflow-hidden" style={{
            background: 'linear-gradient(135deg,#0a0a0a,#1a1a2e)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            {/* Rocket */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: 80, height: 80, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36,
                  boxShadow: '0 0 40px rgba(16,185,129,0.15)',
                  animation: 'rocketFloat 3s ease-in-out infinite',
                }}>🚀</div>
              </div>
            </div>
            <h2 style={{ fontSize: 'clamp(26px,4vw,40px)', fontWeight: 900, color: '#fff', margin: '0 0 12px' }}>
              Let's Build Your Success Story
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', margin: '0 0 36px' }}>
              Join 500+ businesses already growing with Autoniv.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
              <Link to="/" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '14px 32px', borderRadius: 999, fontSize: 15, fontWeight: 700,
                textDecoration: 'none',
                background: 'linear-gradient(135deg,#2563EB,#10B981)', color: '#fff',
                boxShadow: '0 4px 20px rgba(16,185,129,0.3)', transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 32px rgba(16,185,129,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(16,185,129,0.3)'; }}
              >Book a Demo →</Link>
              <Link to="/" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '14px 32px', borderRadius: 999, fontSize: 15, fontWeight: 700,
                color: '#fff', textDecoration: 'none',
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}
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
      `}</style>

      <ScrollToTop />
      <Footer />
    </div>
  );
}

export default CaseStudies;