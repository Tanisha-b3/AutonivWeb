import { useState, useEffect } from 'react';
import { ScrollToTop } from '../../components/ScrollToTop';
import { Link, useLocation } from 'react-router-dom';
import Footer from './Footer';
import { STUDIES } from './caseStudiesData';

const LOGO_SRC = '/logo-autoniv.png';

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

/* ─── USP Ticker ─── */
function USPSlider() {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setCurrent(i => (i + 1) % usps.length), 3000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="fixed top-0 inset-x-0 z-[60] overflow-hidden" style={{ background: 'linear-gradient(90deg,#0f2060,#0d1f4e,#0f2060)', borderBottom: '1px solid rgba(16,185,129,0.2)', height: 36 }}>
      <div className="relative flex items-center justify-center h-full px-4 sm:px-6">
        {usps.map((usp, i) => (
          <span key={i} className="absolute inline-flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-sm font-medium transition-all duration-500 text-center whitespace-nowrap overflow-hidden text-ellipsis max-w-[90vw] sm:max-w-full"
            style={{ color: 'rgba(255,255,255,0.85)', opacity: i === current ? 1 : 0, transform: i === current ? 'translateY(0)' : 'translateY(10px)' }}>
            <span className="text-xs sm:text-sm flex-shrink-0">{usp.icon}</span><span className="truncate">{usp.text}</span>
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
export function Nav({ mobileMenuOpen, setMobileMenuOpen }: { mobileMenuOpen: boolean; setMobileMenuOpen: (v: boolean) => void }) {
  const location = useLocation();
  return (
    <nav className="fixed top-[36px] inset-x-0 z-50" style={{ background: 'rgba(3,11,46,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(37,99,235,0.15)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[68px] flex items-center justify-between">
        <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><img src={LOGO_SRC} alt="Autoniv" className="h-20 sm:h-28 w-auto object-contain" /></Link>
        <div className="hidden md:flex items-center gap-6">
          {navItems.map(item => (
            <Link key={item.label} to={item.href} className="text-sm font-semibold transition-colors"
              style={{ color: location.pathname === item.href ? '#10B981' : 'rgba(255,255,255,0.6)' }}
              onMouseEnter={e => { if (location.pathname !== item.href) e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { if (location.pathname !== item.href) e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
            >{item.label}</Link>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-3">
          <Link to="/" className="px-4 py-2 text-sm font-medium rounded-lg transition-colors" style={{ color: 'rgba(255,255,255,0.6)' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(37,99,235,0.15)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.background = 'transparent'; }}
          >Sign In</Link>
          <Link to="/" className="px-5 py-2.5 text-sm font-bold text-white rounded-full transition-all" style={{ background: 'linear-gradient(135deg,#2563EB,#10B981)', boxShadow: '0 4px 20px rgba(16,185,129,0.35)' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(16,185,129,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(16,185,129,0.35)'; }}
          >Get Started Free</Link>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2" style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>
      {mobileMenuOpen && (
        <div className="md:hidden px-5 py-4 space-y-1" style={{ background: 'rgba(3,11,46,0.98)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(37,99,235,0.12)' }}>
          {navItems.map(item => (
            <Link key={item.label} to={item.href} onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 text-sm font-semibold rounded-xl"
              style={{ color: location.pathname === item.href ? '#10B981' : 'rgba(255,255,255,0.7)', background: location.pathname === item.href ? 'rgba(16,185,129,0.1)' : 'transparent' }}
            >{item.label}</Link>
          ))}
          <div className="pt-2 flex flex-col gap-2">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block text-center px-4 py-3 text-sm font-semibold rounded-xl" style={{ color: 'rgba(255,255,255,0.7)' }}>Sign In</Link>
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block text-center px-4 py-3 text-sm font-bold text-white rounded-xl" style={{ background: 'linear-gradient(135deg,#2563EB,#10B981)' }}>Get Started Free</Link>
          </div>
        </div>
      )}
    </nav>
  );
}

/* ─── Carousel Card ─── */
function StudyCard({ study, active, index }: { study: any; active: boolean; index: number }) {
  return (
    <div className="bg-white rounded-2xl sm:rounded-[20px] p-5 sm:p-7 w-full box-border relative overflow-hidden" style={{
      boxShadow: active ? '0 24px 60px rgba(16,185,129,0.2), 0 8px 24px rgba(37,99,235,0.15)' : '0 8px 24px rgba(0,0,0,0.3)',
      transition: 'box-shadow 0.4s',
      fontFamily: "'Plus Jakarta Sans',sans-serif",
    }}>
      {/* Category badge + icon row */}
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-lg sm:text-xl" style={{
            background: `linear-gradient(135deg, ${study.badgeColor}22, ${study.badgeColor}44)`,
            border: `1.5px solid ${study.badgeColor}55`,
          }}>{study.icon}</div>
          <div>
            <div className="text-sm font-extrabold" style={{ color: '#030B2E' }}>{study.category}</div>
            <div className="text-[10px] sm:text-[11px] font-medium" style={{ color: '#94a3b8' }}>{study.subcategory}</div>
          </div>
        </div>
        {/* Metric badge circle */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex-shrink-0 flex flex-col items-center justify-center relative" style={{
          background: `conic-gradient(${study.badgeColor} 0deg, ${study.badgeColor}88 180deg, #e2e8f0 180deg)`,
          boxShadow: `0 0 24px ${study.badgeColor}60`,
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
      <Link to={`/case-studies/${index}`} style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        fontSize: 13, fontWeight: 700, color: study.badgeColor, textDecoration: 'none',
        transition: 'gap 0.2s',
      }}
        onMouseEnter={e => e.currentTarget.style.gap = '10px'}
        onMouseLeave={e => e.currentTarget.style.gap = '6px'}
      >View Full Case Study →</Link>
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
    <div className="px-10 sm:px-15 relative">
      {/* Arrow left */}
      <button onClick={prev} className="flex" style={{
        position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
        width: 36, height: 36, borderRadius: '50%', border: '1px solid rgba(16,185,129,0.4)',
        background: 'rgba(3,11,46,0.7)', color: '#10B981', cursor: 'pointer',
        alignItems: 'center', justifyContent: 'center', fontSize: 16,
        backdropFilter: 'blur(10px)', zIndex: 10, transition: 'all 0.2s',
      }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.2)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(3,11,46,0.7)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1)'; }}
      >‹</button>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-20 items-start">
        {indices.map((si, pos) => (
          <div key={si} className={`${pos === 1 ? 'block' : 'hidden sm:block'}`} style={{
            opacity: pos === 1 ? 1 : 0.55,
            transform: pos === 1 ? 'scale(1.03)' : 'scale(0.97)',
            transition: 'all 0.4s cubic-bezier(.16,1,.3,1)',
            cursor: pos !== 1 ? 'pointer' : 'default',
          }} onClick={() => { if (pos === 0) prev(); if (pos === 2) next(); }}>
            <StudyCard study={STUDIES[si]} active={pos === 1} index={si} />
          </div>
        ))}
      </div>

      {/* Arrow right */}
      <button onClick={next} className="flex" style={{
        position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
        width: 36, height: 36, borderRadius: '50%', border: '1px solid rgba(16,185,129,0.4)',
        background: 'rgba(3,11,46,0.7)', color: '#10B981', cursor: 'pointer',
        alignItems: 'center', justifyContent: 'center', fontSize: 16,
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

      <div className="relative z-10 pt-[140px] sm:pt-[140px] pb-16 sm:pb-24">

        {/* ── Hero ── */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16 px-4 sm:px-6">
          <div className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold tracking-[0.1em] mb-4 sm:mb-5" style={{
            background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#34D399',
          }}>• CASE STUDIES •</div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black leading-tight mb-4 sm:mb-5" style={{ color: '#fff' }}>
            Real Businesses.{' '}
            <span style={{
              background: 'linear-gradient(135deg,#2563EB 0%,#10B981 60%,#34D399 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>Real Results.</span>
          </h1>
          <p className="text-sm sm:text-base lg:text-lg leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
            See how Autoniv's AI Voice Agents, Chatbots & CRM Automation<br className="hidden sm:block" />are helping businesses save time, convert more and grow faster.
          </p>
        </div>

        {/* ── Carousel ── */}
        <div className="max-w-6xl mx-auto mb-12 sm:mb-20 px-4 sm:px-6">
          <Carousel />
        </div>

        {/* ── Trusted by ── */}
        <div className="max-w-6xl mx-auto mb-12 sm:mb-20 px-4 sm:px-6">
          <div className="flex flex-col items-center gap-4 py-6 sm:py-0">
            <span className="text-[10px] sm:text-[11px] font-bold text-white/30 tracking-[0.12em] whitespace-nowrap flex-shrink-0">
              • TRUSTED BY 500+ BUSINESSES •
            </span>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {TRUSTED_BRANDS.map(b => (
                <span key={b} className="px-3 sm:px-5 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-bold border" style={{
                  background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.65)',
                }}>{b}</span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Global Stats Banner ── */}
        <div className="max-w-6xl mx-auto mb-12 sm:mb-20 px-4 sm:px-6">
          <div style={{
            borderRadius: 24, overflow: 'hidden',
            background: 'linear-gradient(120deg, rgba(37,99,235,0.25) 0%, rgba(3,11,46,0.8) 40%, rgba(16,185,129,0.2) 100%)',
            border: '1px solid rgba(16,185,129,0.2)', backdropFilter: 'blur(20px)',
          }}>
            <div className="p-5 sm:p-10 grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8 text-center">
              {GLOBAL_STATS.map(s => (
                <div key={s.label}>
                  <div className="text-2xl sm:text-3xl font-black mb-1 sm:mb-2" style={{
                    background: 'linear-gradient(135deg,#2563EB,#10B981)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                  }}>{s.value}</div>
                  <div className="text-[10px] sm:text-xs text-white/45 leading-tight">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-14 text-center relative overflow-hidden" style={{
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
      `}</style>

      <ScrollToTop />
      <Footer />
    </div>
  );
}

export default CaseStudies;