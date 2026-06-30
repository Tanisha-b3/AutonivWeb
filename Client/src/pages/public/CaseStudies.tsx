import { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Footer from './Footer';
import ScrollToTop from '../../components/ScrollToTop';
import { PublicNavbar } from '../../components/PublicNavbar';
import { BRAND, INK, SLATE, MUTE, HAIRLINE, SURFACE, TINT, MONO, SANS, LOGO_SRC, Reveal, SectionLabel, GradientText, StatCard, CTADecorations } from './design';
import { motion, AnimatePresence } from 'framer-motion';
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
        background: 'rgba(255,255,255,0.97)',
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

      <div
        ref={drawerRef}
        className="md:hidden fixed top-0 right-0 h-full z-[100] flex flex-col"
        style={{
          width: 'min(82vw, 340px)',
          background: 'rgba(255,255,255,0.99)',
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

/* ─── Case Study Card ─── */
function StudyCard({ study, index }: { study: any; index: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="rounded-2xl overflow-hidden flex flex-col border transition-all duration-300"
      style={{
        background: 'rgba(255,255,255,0.95)',
        borderColor: hovered ? `${study.badgeColor}30` : 'rgba(37,99,235,0.10)',
        boxShadow: hovered
          ? `0 20px 50px -12px ${study.badgeColor}18, 0 0 0 1px ${study.badgeColor}12`
          : '0 4px 20px rgba(0,0,0,0.04)',
      }}
    >
      {/* Top accent bar */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: index * 0.1 + 0.2, ease: [0.22, 1, 0.36, 1] }}
        style={{ height: 3, background: `linear-gradient(90deg, ${study.badgeColor}, ${study.badgeColor}44)`, transformOrigin: 'left' }}
      />

      <div className="p-6 sm:p-7 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.1, rotate: -5 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
              style={{ background: `${study.badgeColor}10`, border: `1px solid ${study.badgeColor}18` }}
            >
              {study.icon}
            </motion.div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">{study.category}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">{study.subcategory}</p>
            </div>
          </div>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.1 + 0.3, type: 'spring', stiffness: 200 }}
            className="px-3 py-1.5 rounded-lg text-sm font-black"
            style={{ color: study.badgeColor, background: `${study.badgeColor}10` }}
          >
            {study.metric}
          </motion.div>
        </div>

        {/* Challenge */}
        <div className="mb-5">
          <p className="text-sm text-slate-600 leading-relaxed">{study.challenge}</p>
        </div>

        {/* Solutions */}
        <div className="mb-5">
          <div className="flex flex-wrap gap-2">
            {study.solutions.map((s: any, i: number) => (
              <motion.span
                key={s.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 + 0.4 + i * 0.05 }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600"
                style={{ background: 'rgba(37,99,235,0.04)', border: '1px solid rgba(37,99,235,0.08)' }}
              >
                <span>{s.icon}</span>
                <span>{s.label}</span>
              </motion.span>
            ))}
          </div>
        </div>

        <div className="h-px bg-slate-100 my-4" />

        {/* Results */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {study.results.map((r: any, i: number) => (
            <motion.div
              key={r.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 + 0.5 + i * 0.1 }}
              className="text-center"
            >
              <div className="text-lg font-black font-mono tracking-tight" style={{ color: r.color }}>{r.value}</div>
              <div className="text-[10px] text-slate-400 font-medium mt-0.5 leading-tight">{r.label}</div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Link
            to={`/case-studies/${index}`}
            className="mt-auto w-full py-3 rounded-xl text-sm font-bold text-center transition-all duration-200 no-underline block"
            style={{
              color: hovered ? '#ffffff' : study.badgeColor,
              background: hovered ? study.badgeColor : `${study.badgeColor}08`,
              border: `1px solid ${hovered ? study.badgeColor : `${study.badgeColor}20`}`,
            }}
          >
            Read Full Story →
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ─── Filter Tabs ─── */
function FilterTabs({ active, onChange }: { active: string; onChange: (v: string) => void }) {
  const categories = ['All', 'Healthcare', 'Real Estate', 'E-Commerce', 'Customer Support'];
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 mb-10 max-w-2xl mx-auto">
      {categories.map(cat => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className="px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer border"
          style={{
            borderColor: active === cat ? 'transparent' : 'rgba(255,255,255,0.08)',
            background: active === cat ? 'linear-gradient(135deg,#2563EB,#10B981)' : 'rgba(255,255,255,0.06)',
            color: active === cat ? '#ffffff' : 'rgba(255,255,255,0.5)',
            boxShadow: active === cat ? '0 6px 20px -6px rgba(16,185,129,0.35)' : 'none',
          }}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}

/* ─── Main export ─── */
export function CaseStudies() {
  const [activeTab, setActiveTab] = useState('All');

  const filtered = activeTab === 'All'
    ? STUDIES.map((s, i) => ({ ...s, _idx: i }))
    : STUDIES.map((s, i) => ({ ...s, _idx: i })).filter(s => s.category === activeTab);

  return (
    <div style={{ minHeight: '100vh', background: TINT, fontFamily: SANS, color: INK }}>
      <USPSlider />
      <PublicNavbar />

      <div className="page-bg" style={{ paddingTop: 130, paddingBottom: 8 }}>
        <div className="box-wrap">

          {/* ── Hero ── */}
          <section className="section-box tint">
            <div
              className="max-w-5xl mx-auto flex flex-col items-center justify-center text-center section-pad"
              style={{ position: 'relative', zIndex: 1 }}
            >
              <Reveal>
                <SectionLabel text="Case Studies" />
                <h1 style={{ fontSize: 'clamp(32px,5vw,56px)', fontWeight: 900, letterSpacing: '-0.03em', color: INK, lineHeight: 1.1, margin: '0 0 18px' }}>
                  Real Businesses.<br />
                  <GradientText>Real Results.</GradientText>
                </h1>
                <p style={{ fontSize: 16, color: SLATE, maxWidth: 500, lineHeight: 1.7, margin: '0 auto' }}>
                  See how Autoniv's AI Voice Agents, Chatbots & CRM Automation are helping businesses save time, convert more and grow faster.
                </p>
              </Reveal>
            </div>
          </section>

          {/* ── Case Studies Grid (Dark) ── */}
          <section className="section-box black" style={{ background: '#030812', position: 'relative' }}>
            <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

            <div className="section-pad max-w-6xl mx-auto relative z-10">
              <Reveal>
                <div className="text-center mb-10">
                  <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-3">
                    Featured <GradientText>Case Studies</GradientText>
                  </h2>
                  <p className="text-sm text-white/40 max-w-md mx-auto">
                    Explore how businesses across industries are leveraging Autoniv to drive measurable growth.
                  </p>
                </div>
              </Reveal>

              <Reveal delay={60}>
                <FilterTabs active={activeTab} onChange={setActiveTab} />
              </Reveal>

              <Reveal delay={100}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                  <AnimatePresence mode="popLayout">
                    {filtered.map((study, i) => (
                      <StudyCard key={study._idx} study={study} index={i} />
                    ))}
                  </AnimatePresence>
                </div>
              </Reveal>
            </div>
          </section>

          {/* ── Trusted By ── */}
          <section className="section-box white">
            <div className="section-pad max-w-6xl mx-auto text-center">
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
          </section>

          {/* ── Stats ── */}
          <section className="section-box tint">
            <div className="section-pad max-w-6xl mx-auto">
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
          </section>

          {/* ── CTA ── */}
          <section className="section-box white" style={{ background: 'linear-gradient(135deg,#eff6ff 0%,#f0fdf9 100%)', border: '1.5px solid rgba(37,99,235,0.14)', boxShadow: '0 20px 56px -16px rgba(37,99,235,0.14)' }}>
            <div className="section-pad max-w-6xl mx-auto text-center relative overflow-hidden">
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
                    Talk to Expert
                  </button>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>

      <ScrollToTop />
      <Footer />
    </div>
  );
}

export default CaseStudies;
