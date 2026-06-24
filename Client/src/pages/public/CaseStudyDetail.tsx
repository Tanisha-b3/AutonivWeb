import { useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { STUDIES } from './caseStudiesData';
import Footer from './Footer';
import ScrollToTop from '../../components/ScrollToTop';
import { USPSlider } from './sections/USPSlider';

const LOGO_SRC = '/autoniv.webp';

const navItems = [
  { label: 'Agents', href: '/agents' },
  { label: 'Case Studies', href: '/case-studies' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'News', href: '/news' },
];

/* ─── Nav ─── */
function Nav({
  mobileMenuOpen,
  setMobileMenuOpen,
}: {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (v: boolean) => void;
}) {
  const location = useLocation();
  return (
    <nav
      className="fixed top-[36px] inset-x-0 z-50"
      style={{
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(37,99,235,0.12)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[68px] flex items-center justify-between">
        <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <img src={LOGO_SRC} alt="Autoniv" className="h-20 sm:h-24 w-auto object-contain" />
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className="text-sm font-semibold transition-colors"
              style={{
                color: location.pathname === item.href ? '#2563EB' : '#475569',
              }}
              onMouseEnter={(e) => {
                if (location.pathname !== item.href) e.currentTarget.style.color = '#0a0a0a';
              }}
              onMouseLeave={(e) => {
                if (location.pathname !== item.href) e.currentTarget.style.color = '#475569';
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/"
            className="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
            style={{ color: '#475569' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#2563EB';
              e.currentTarget.style.background = 'rgba(37,99,235,0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#475569';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            Sign In
          </Link>
          <Link
            to="/"
            className="px-5 py-2.5 text-sm font-bold text-white rounded-full transition-all"
            style={{
              background: 'linear-gradient(135deg,#2563EB,#10B981)',
              boxShadow: '0 4px 20px rgba(16,185,129,0.35)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(16,185,129,0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(16,185,129,0.35)';
            }}
          >
            Get Started Free
          </Link>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2"
          style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer' }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {mobileMenuOpen && (
        <div
          className="md:hidden px-5 py-4 space-y-1"
          style={{
            background: 'rgba(255,255,255,0.98)',
            backdropFilter: 'blur(24px)',
            borderTop: '1px solid rgba(37,99,235,0.10)',
          }}
        >
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 text-sm font-semibold rounded-xl"
              style={{
                color: location.pathname === item.href ? '#2563EB' : '#475569',
                background:
                  location.pathname === item.href ? 'rgba(37,99,235,0.07)' : 'transparent',
              }}
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-2 flex flex-col gap-2">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-center px-4 py-3 text-sm font-semibold rounded-xl"
              style={{ color: '#475569' }}
            >
              Sign In
            </Link>
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-center px-4 py-3 text-sm font-bold text-white rounded-xl"
              style={{ background: 'linear-gradient(135deg,#2563EB,#10B981)' }}
            >
              Get Started Free
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

/* ─── FAQ Item ─── */
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="rounded-xl overflow-hidden transition-all duration-300"
      style={{
        background: open ? '#f8fafc' : '#ffffff',
        border: `1px solid ${open ? '#2563EB' : 'rgba(37,99,235,0.08)'}`,
        boxShadow: open ? '0 4px 20px rgba(37,99,235,0.06)' : '0 2px 8px rgba(0,0,0,0.04)',
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-5 sm:px-6 py-4 text-left cursor-pointer"
        style={{ background: 'none', border: 'none', color: '#0a0a0a' }}
      >
        <span className="text-sm sm:text-base font-semibold">{question}</span>
        <span
          className="text-lg flex-shrink-0 transition-transform duration-300"
          style={{
            transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
            color: open ? '#2563EB' : '#94a3b8',
          }}
        >
          +
        </span>
      </button>
      {open && (
        <div className="px-5 sm:px-6 pb-4">
          <p className="text-xs sm:text-sm leading-relaxed" style={{ color: '#64748b' }}>
            {answer}
          </p>
        </div>
      )}
    </div>
  );
}

export default function CaseStudyDetail() {
  const { id } = useParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const studyIndex = parseInt(id || '0');
  const study = STUDIES[studyIndex];

  if (!study || !study.story) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f8fafc' }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#0a0a0a] mb-4">Case Study Not Found</h1>
          <Link to="/case-studies" className="text-[#2563EB] font-semibold hover:underline">← Back to Case Studies</Link>
        </div>
      </div>
    );
  }

  const { story } = study;

  return (
    <div 
      className="min-h-screen relative"
      style={{
        background: '#f8fafc',
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        color: '#0a0a0a',
      }}
    >
      <USPSlider />
      <Nav mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

      <div className="relative z-10" style={{ paddingTop: 130, paddingBottom: 80 }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Back Button */}
          <Link 
            to="/case-studies" 
            className="inline-flex items-center gap-2 text-sm font-medium mb-8 transition-colors hover:underline"
            style={{ color: '#64748b' }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Case Studies
          </Link>

          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{ 
                  background: `${study.badgeColor}15`, 
                  border: `1px solid ${study.badgeColor}30` 
                }}
              >
                {study.icon}
              </div>
              <div>
                <div className="text-sm font-bold" style={{ color: study.badgeColor }}>{study.category}</div>
                <div className="text-xs" style={{ color: '#94a3b8' }}>{study.subcategory}</div>
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0a0a0a] mb-4 leading-tight">
              Voice AI for {study.category === 'Healthcare' ? 'Appointment-Based Businesses' : study.category === 'Real Estate' ? 'Smart Real Estate Sales' : study.category === 'E-Commerce' ? 'E-commerce Revenue Recovery' : 'Repetitive Customer Calls'}
            </h1>
            <p className="text-lg" style={{ color: '#64748b' }}>
              How Autoniv's AI Voice Agents helps {study.category === 'Healthcare' ? 'service businesses turn every enquiry into a confirmed booking' : study.category === 'Real Estate' ? 'real estate teams qualify leads faster and convert more site visits' : study.category === 'E-Commerce' ? 'D2C brands recover abandoned carts and verify COD orders' : 'businesses improve customer response and free their teams'}
            </p>
          </div>

          {/* Key Metrics */}
          <div 
            className="grid grid-cols-3 gap-4 mb-12 p-6 rounded-2xl"
            style={{
              background: '#ffffff',
              border: '1px solid rgba(37,99,235,0.06)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            }}
          >
            {study.results.map((r) => (
              <div key={r.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-black" style={{ color: r.color }}>{r.value}</div>
                <div className="text-xs mt-1" style={{ color: '#94a3b8' }}>{r.label}</div>
              </div>
            ))}
          </div>

          {/* Challenge Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-[#0a0a0a] mb-6">{story.challenge.title}</h2>
            <div className="space-y-4">
              {story.challenge.points.map((point, i) => (
                <div 
                  key={i} 
                  className="p-5 rounded-xl transition-all duration-300 hover:-translate-y-0.5"
                  style={{
                    background: '#ffffff',
                    border: '1px solid rgba(37,99,235,0.06)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  }}
                >
                  <h3 className="font-bold text-[#0a0a0a] mb-2">{i + 1}. {point.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#64748b' }}>{point.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Solution Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-[#0a0a0a] mb-4">{story.solution.title}</h2>
            <p className="text-sm mb-6" style={{ color: '#64748b' }}>{story.solution.description}</p>
            <div className="space-y-3">
              {story.solution.steps.map((step, i) => (
                <div 
                  key={i} 
                  className="flex items-start gap-3 p-4 rounded-xl transition-all duration-300 hover:-translate-y-0.5"
                  style={{
                    background: '#ffffff',
                    border: '1px solid rgba(16,185,129,0.12)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  }}
                >
                  <span 
                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: 'linear-gradient(135deg,#2563EB,#10B981)' }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-sm" style={{ color: '#475569' }}>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Solutions Tags */}
          {study.solutions && (
            <div className="mb-12">
              <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: '#94a3b8' }}>Key Solutions Deployed</h3>
              <div className="flex flex-wrap gap-2">
                {study.solutions.map((sol, i) => (
                  <span 
                    key={i} 
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                    style={{
                      background: 'rgba(37,99,235,0.06)',
                      border: '1px solid rgba(37,99,235,0.1)',
                      color: '#475569'
                    }}
                  >
                    <span className="text-sm">{sol.icon}</span>
                    {sol.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Impact Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-[#0a0a0a] mb-6">{story.impact.title}</h2>
            <div 
              className="rounded-2xl overflow-hidden"
              style={{
                background: '#ffffff',
                border: '1px solid rgba(37,99,235,0.06)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              }}
            >
              <table className="w-full text-left">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(37,99,235,0.08)' }}>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider" style={{ color: '#94a3b8' }}>Metric</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider" style={{ color: '#94a3b8' }}>Before Autoniv</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider" style={{ color: '#10B981' }}>After Autoniv</th>
                  </tr>
                </thead>
                <tbody>
                  {story.impact.metrics.map((m, i) => (
                    <tr key={i} style={{ borderBottom: i < story.impact.metrics.length - 1 ? '1px solid rgba(37,99,235,0.04)' : 'none' }}>
                      <td className="p-4 text-sm font-medium" style={{ color: '#0a0a0a' }}>{m.metric}</td>
                      <td className="p-4 text-sm" style={{ color: '#94a3b8' }}>{m.before}</td>
                      <td className="p-4 text-sm font-semibold" style={{ color: '#10B981' }}>{m.after}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quote */}
          {story.quote && (
            <div 
              className="mb-12 p-6 rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(37,99,235,0.04), rgba(16,185,129,0.04))',
                border: '1px solid rgba(16,185,129,0.12)',
              }}
            >
              <div className="text-3xl mb-4" style={{ color: '#10B981' }}>"</div>
              <p className="text-lg italic mb-4" style={{ color: '#475569' }}>{story.quote.text}</p>
              <p className="text-sm font-semibold" style={{ color: '#10B981' }}>— {story.quote.author}</p>
            </div>
          )}

          {/* FAQ Section */}
          {story.faqs && story.faqs.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-[#0a0a0a] mb-6">Frequently Asked Questions</h2>
              <div className="space-y-3">
                {story.faqs.map((faq, i) => (
                  <FAQItem key={i} question={faq.q} answer={faq.a} />
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div 
            className="text-center p-8 sm:p-10 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(37,99,235,0.04), rgba(16,185,129,0.04))',
              border: '1px solid rgba(16,185,129,0.12)',
            }}
          >
            <h3 className="text-xl font-bold text-[#0a0a0a] mb-3">Ready to get similar results?</h3>
            <p className="text-sm mb-5" style={{ color: '#64748b' }}>See how Autoniv can transform your {study.category.toLowerCase()} operations.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                to="/register" 
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-white no-underline transition-all hover:-translate-y-0.5"
                style={{
                  background: 'linear-gradient(135deg,#2563EB,#10B981)',
                  boxShadow: '0 4px 16px rgba(16,185,129,0.25)',
                }}
              >
                Get Started Free
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <Link 
                to="/demo" 
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium no-underline transition-all hover:-translate-y-0.5"
                style={{
                  background: '#ffffff',
                  border: '1px solid rgba(37,99,235,0.15)',
                  color: '#475569',
                }}
              >
                See a Live Demo →
              </Link>
            </div>
          </div>
        </div>
      </div>

      <ScrollToTop />
      <Footer />
    </div>
  );
}