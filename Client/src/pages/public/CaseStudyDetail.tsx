import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { STUDIES } from './caseStudiesData';
import Footer from './Footer';
import ScrollToTop from '../../components/ScrollToTop';
import { PublicNavbar } from '../../components/PublicNavbar';
import { USPSlider } from './sections/USPSlider';

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
  const navigate = useNavigate();
  const goBack = () => navigate('/case-studies');
  const studyIndex = parseInt(id || '0');
  const study = STUDIES[studyIndex];

  if (!study || !study.story) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f8fafc' }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#0a0a0a] mb-4">Case Study Not Found</h1>
          <button onClick={goBack} className="text-[#2563EB] font-semibold hover:underline cursor-pointer" style={{ background: 'none', border: 'none' }}>← Back to Case Studies</button>
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
      <PublicNavbar />

      <div className="relative z-10" style={{ paddingTop: 130, paddingBottom: 80 }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Back Button */}
          <button 
            onClick={goBack} 
            className="inline-flex items-center gap-2 text-sm font-medium mb-8 transition-colors hover:underline cursor-pointer"
            style={{ color: '#64748b', background: 'none', border: 'none' }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Case Studies
          </button>

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
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12 p-6 rounded-2xl"
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
              className="rounded-2xl overflow-hidden overflow-x-auto"
              style={{
                background: '#ffffff',
                border: '1px solid rgba(37,99,235,0.06)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              }}
            >
              <table className="w-full text-left min-w-[420px] sm:min-w-0">
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