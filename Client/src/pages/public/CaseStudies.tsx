import { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Footer from './Footer';
import ScrollToTop from '../../components/ScrollToTop';
import { PublicNavbar } from '../../components/PublicNavbar';
import { BRAND, INK, SLATE, MUTE, HAIRLINE, SURFACE, TINT, MONO, SANS, LOGO_SRC, Reveal, SectionLabel, GradientText, StatCard, CTADecorations } from './design';
import { STUDIES } from './caseStudiesData';

const AuthDialog = lazy(() =>
  import('./AuthDialog').then((m) => ({ default: m.AuthDialog }))
);

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
  { value: '500+', label: 'Businesses Served', desc: 'Across all industries' },
  { value: '2M+', label: 'Conversations', desc: 'Handled to date' },
  { value: '30%+', label: 'Conversion Lift', desc: 'Average increase' },
  { value: '24/7', label: 'AI Agents', desc: 'Always working' },
  { value: '98%', label: 'Satisfaction', desc: 'Client rating' },
  { value: '₹50Cr+', label: 'Revenue Generated', desc: 'For clients' },
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
        className="md:hidden fixed top-0 right-0 h-full z-[100] flex flex-col"
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
function StudyCard({ study, active, index }: { study: any; active: boolean; index: number }) {
  return (
    <div className="rounded-2xl sm:rounded-[20px] p-5 sm:p-7 w-full box-border relative overflow-hidden" style={{
      background: SURFACE,
      border: active ? '2px solid rgba(16,185,129,0.2)' : `1px solid ${HAIRLINE}`,
      boxShadow: active ? '0 24px 60px rgba(16,185,129,0.15), 0 8px 24px rgba(37,99,235,0.10)' : '0 1px 2px rgba(15,23,42,0.04)',
      transition: 'all 0.4s',
    }}>
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-lg sm:text-xl" style={{
            background: `linear-gradient(135deg, ${study.badgeColor}15, ${study.badgeColor}30)`,
            border: `1.5px solid ${study.badgeColor}40`,
          }}>{study.icon}</div>
          <div>
            <div className="text-sm font-extrabold" style={{ color: INK }}>{study.category}</div>
            <div className="text-[10px] sm:text-[11px] font-medium" style={{ color: MUTE }}>{study.subcategory}</div>
          </div>
        </div>
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex-shrink-0 flex flex-col items-center justify-center relative" style={{
          background: `conic-gradient(${study.badgeColor} 0deg, ${study.badgeColor}88 180deg, #e2e8f0 180deg)`,
          boxShadow: `0 0 24px ${study.badgeColor}40`,
        }}>
          <div className="absolute inset-1 sm:inset-1.5 rounded-full flex flex-col items-center justify-center" style={{ background: SURFACE }}>
            <div className="text-[11px] sm:text-xs font-black leading-none" style={{ color: study.badgeColor }}>{study.metric}</div>
            <div className="text-[7px] sm:text-[8px] font-bold text-center leading-tight mt-0.5 px-1" style={{ color: SLATE }}>{study.metricLabel}</div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: MUTE, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, fontFamily: MONO }}>Challenge</div>
        <p style={{ fontSize: 13, color: SLATE, lineHeight: 1.5, margin: 0 }}>{study.challenge}</p>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: MUTE, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, fontFamily: MONO }}>Our Solution</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {study.solutions.map((s: any) => (
            <span key={s.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600, color: SLATE, background: TINT, border: `1px solid ${HAIRLINE}` }}>
              <span>{s.icon}</span>{s.label}
            </span>
          ))}
        </div>
      </div>

      <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${HAIRLINE}, transparent)`, margin: '16px 0' }} />

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: MUTE, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, fontFamily: MONO }}>Results</div>
        <div className="grid grid-cols-3 gap-2 sm:gap-2 text-center">
          {study.results.map((r: any) => (
            <div key={r.label}>
              <div className="text-base sm:text-lg font-black" style={{ color: r.color }}>{r.value}</div>
              <div className="text-[9px] sm:text-[10px] mt-0.5" style={{ color: MUTE }}>{r.label}</div>
            </div>
          ))}
        </div>
      </div>

      <Link to={`/case-studies/${index}`} className="inline-flex items-center gap-1.5 text-sm font-bold no-underline transition-all"
        style={{ color: study.badgeColor }}
        onMouseEnter={e => e.currentTarget.style.gap = '8px'}
        onMouseLeave={e => e.currentTarget.style.gap = '6px'}>
        View Full Case Study →
      </Link>
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
      <button onClick={prev} className="flex" style={{
        position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
        width: 36, height: 36, borderRadius: '50%', border: `1px solid ${HAIRLINE}`,
        background: SURFACE, color: '#2563EB', cursor: 'pointer',
        alignItems: 'center', justifyContent: 'center', fontSize: 16,
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)', zIndex: 10, transition: 'all 0.2s',
      }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(37,99,235,0.08)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1.05)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = SURFACE; e.currentTarget.style.transform = 'translateY(-50%) scale(1)'; }}
      >‹</button>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-20 items-start">
        {indices.map((si, pos) => (
          <div key={si} className={`${pos === 1 ? 'block' : 'hidden sm:block'}`} style={{
            opacity: pos === 1 ? 1 : 0.6,
            transform: pos === 1 ? 'scale(1.02)' : 'scale(0.95)',
            transition: 'all 0.4s cubic-bezier(.16,1,.3,1)',
            cursor: pos !== 1 ? 'pointer' : 'default',
          }} onClick={() => { if (pos === 0) prev(); if (pos === 2) next(); }}>
            <StudyCard study={STUDIES[si]} active={pos === 1} index={si} />
          </div>
        ))}
      </div>

      <button onClick={next} className="flex" style={{
        position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
        width: 36, height: 36, borderRadius: '50%', border: `1px solid ${HAIRLINE}`,
        background: SURFACE, color: '#2563EB', cursor: 'pointer',
        alignItems: 'center', justifyContent: 'center', fontSize: 16,
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)', zIndex: 10, transition: 'all 0.2s',
      }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(37,99,235,0.08)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1.05)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = SURFACE; e.currentTarget.style.transform = 'translateY(-50%) scale(1)'; }}
      >›</button>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
        {STUDIES.map((_, i) => (
          <button key={i} onClick={() => setActive(i)} style={{
            width: i === active ? 24 : 8, height: 8, borderRadius: 99, border: 'none', cursor: 'pointer',
            background: i === active ? BRAND : '#d1d5db',
            transition: 'all 0.3s', padding: 0,
          }} />
        ))}
      </div>
    </div>
  );
}

/* ─── Main export ─── */
export function CaseStudies() {
  return (
    <div style={{ minHeight: '100vh', background: TINT, fontFamily: SANS, color: INK }}>
      <USPSlider />
      <PublicNavbar />

      <div style={{ paddingTop: 130 }}>

        {/* ── Hero ── */}
        <div style={{ background: 'linear-gradient(180deg, #ffffff 0%, #fbfcfe 100%)', borderBottom: `1px solid ${HAIRLINE}`, padding: '76px 24px 0', position: 'relative', overflow: 'hidden' }}>
          {/* <HeroWaveform /> */}
          <div
  className="max-w-6xl mx-auto flex flex-col items-center justify-center text-center"
  style={{ paddingBottom: 64, position: 'relative', zIndex: 1 }}
>
            <Reveal>
              <SectionLabel text="Case Studies" />
              <h1 style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 900, letterSpacing: '-0.03em', color: INK, lineHeight: 1.15, margin: '0 0 14px' }}>
                Real Businesses.{' '}
                <GradientText>Real Results.</GradientText>
              </h1>
              <p style={{ fontSize: 15, color: SLATE, maxWidth: 520, lineHeight: 1.6, margin: 0 }}>
                See how Autoniv's AI Voice Agents, Chatbots & CRM Automation are helping businesses save time, convert more and grow faster.
              </p>
            </Reveal>
          </div>
        </div>

        {/* ── Carousel ── */}
        <div style={{ padding: '64px 24px' }}>
          <div className="max-w-6xl mx-auto">
            <Reveal>
              <div className="text-center">
                <SectionLabel text="Success Stories" />
                <h2 style={{ fontSize: 'clamp(22px,3vw,34px)', fontWeight: 800, letterSpacing: '-0.025em', color: INK, margin: '0 0 28px' }}>
                  Featured <GradientText>Case Studies</GradientText>
                </h2>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <Carousel />
            </Reveal>
          </div>
        </div>

        {/* ── Trusted by ── */}
        <div style={{ padding: '64px 24px', background: SURFACE, borderTop: `1px solid ${HAIRLINE}` }}>
          <div className="max-w-6xl mx-auto text-center">
            <Reveal>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: MUTE, fontFamily: MONO, marginBottom: 24 }}>
                ● TRUSTED BY 500+ BUSINESSES ●
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {TRUSTED_BRANDS.map(b => (
                  <span key={b} className="px-4 py-2.5 rounded-xl text-xs font-medium transition-all"
                    style={{ background: SURFACE, border: `1px solid ${HAIRLINE}`, color: SLATE }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(37,99,235,0.2)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(37,99,235,0.06)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = HAIRLINE; e.currentTarget.style.boxShadow = 'none'; }}>
                    {b}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>
        </div>

        {/* ── Global Stats ── */}
        <div style={{ padding: '64px 24px' }}>
          <div className="max-w-6xl mx-auto">
            <Reveal>
              <div className="text-center">
                <SectionLabel text="By the Numbers" />
                <h2 style={{ fontSize: 'clamp(22px,3vw,34px)', fontWeight: 800, letterSpacing: '-0.025em', color: INK, margin: '0 0 28px' }}>
                  Autoniv in <GradientText>Numbers</GradientText>
                </h2>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {GLOBAL_STATS.map(s => (
                  <StatCard key={s.label} value={s.value} label={s.label} description={s.desc} />
                ))}
              </div>
            </Reveal>
          </div>
        </div>

        {/* ── CTA ── */}
        <div style={{ padding: '0 24px 80px', background: SURFACE }}>
          <div className="max-w-6xl mx-auto">
            <Reveal>
              <div className="rounded-3xl p-12 sm:p-16 text-center relative overflow-hidden" style={{
                background: 'linear-gradient(135deg,#eff6ff 0%,#f0fdf9 100%)',
                border: '1.5px solid rgba(37,99,235,0.14)',
                boxShadow: '0 20px 56px -16px rgba(37,99,235,0.14)',
              }}>
                <CTADecorations />
                <div className="relative z-10">
                  <h2 style={{ fontSize: 'clamp(24px,4vw,44px)', fontWeight: 900, letterSpacing: '-0.03em', color: INK, margin: '0 0 16px', lineHeight: 1.15 }}>
                    Let's Build Your <GradientText>Success Story</GradientText>
                  </h2>
                  <p style={{ fontSize: 15, color: SLATE, maxWidth: 440, margin: '0 auto 32px', lineHeight: 1.7 }}>
                    Join 500+ businesses already growing with Autoniv.
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center gap-3">
                    <Link to="/"
                      className="px-8 py-4 rounded-full text-sm font-bold text-white no-underline inline-block text-center transition-all duration-200"
                      style={{ background: BRAND, boxShadow: '0 8px 26px -4px rgba(16,185,129,0.34)' }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px -4px rgba(16,185,129,0.44)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 26px -4px rgba(16,185,129,0.34)'; }}>
                      Book a Demo →
                    </Link>
                    <button
                      className="px-8 py-4 rounded-full text-sm font-bold transition-all duration-200"
                      style={{ background: SURFACE, border: '1.5px solid rgba(15,23,42,0.10)', color: '#475569', cursor: 'pointer' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(37,99,235,0.32)'; e.currentTarget.style.color = '#2563EB'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(15,23,42,0.10)'; e.currentTarget.style.color = '#475569'; }}>
                      🎧 Talk to Expert
                    </button>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>

      </div>

      <ScrollToTop />
      <Footer />
    </div>
  );
}

export default CaseStudies;