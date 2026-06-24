import { useParams, Link } from 'react-router-dom';
import { STUDIES } from './caseStudiesData';
import Footer from './Footer';

export default function CaseStudyDetail() {
  const { id } = useParams();
  const studyIndex = parseInt(id || '0');
  const study = STUDIES[studyIndex];

  if (!study || !study.story) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#030B2E' }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Case Study Not Found</h1>
          <Link to="/case-studies" className="text-[#10B981] font-semibold">← Back to Case Studies</Link>
        </div>
      </div>
    );
  }

  const { story } = study;

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #030B2E 0%, #051530 40%, #030f28 70%, #020a1e 100%)', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50" style={{ background: 'rgba(3,11,46,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(37,99,235,0.15)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 no-underline">
            <img src="/logo-autoniv.png" alt="Autoniv" className="h-20 sm:h-28 w-auto object-contain" />
          </Link>
          <Link to="/case-studies" className="text-sm font-semibold text-white/60 hover:text-white transition-colors no-underline">
            ← Back to Case Studies
          </Link>
        </div>
      </nav>

      <div className="relative z-10 pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: `${study.badgeColor}20`, border: `1px solid ${study.badgeColor}40` }}>
                {study.icon}
              </div>
              <div>
                <div className="text-sm font-bold" style={{ color: study.badgeColor }}>{study.category}</div>
                <div className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{study.subcategory}</div>
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight">
              Voice AI for {study.category === 'Healthcare' ? 'Appointment-Based Businesses' : study.category === 'Real Estate' ? 'Smart Real Estate Sales' : study.category === 'E-Commerce' ? 'E-commerce Revenue Recovery' : 'Repetitive Customer Calls'}
            </h1>
            <p className="text-lg" style={{ color: 'rgba(255,255,255,0.6)' }}>
              How Autoniv's AI Voice Agents helps {study.category === 'Healthcare' ? 'service businesses turn every enquiry into a confirmed booking' : study.category === 'Real Estate' ? 'real estate teams qualify leads faster and convert more site visits' : study.category === 'E-Commerce' ? 'D2C brands recover abandoned carts and verify COD orders' : 'businesses improve customer response and free their teams'}
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-4 mb-12 p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {study.results.map((r) => (
              <div key={r.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-black" style={{ color: r.color }}>{r.value}</div>
                <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{r.label}</div>
              </div>
            ))}
          </div>

          {/* Challenge Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">{story.challenge.title}</h2>
            <div className="space-y-4">
              {story.challenge.points.map((point, i) => (
                <div key={i} className="p-5 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <h3 className="font-bold text-white mb-2">{i + 1}. {point.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>{point.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Solution Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">{story.solution.title}</h2>
            <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.6)' }}>{story.solution.description}</p>
            <div className="space-y-3">
              {story.solution.steps.map((step, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl" style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)' }}>
                  <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'var(--gg)', color: '#fff' }}>{i + 1}</span>
                  <span className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Impact Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">{story.impact.title}</h2>
            <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <table className="w-full text-left">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>Metric</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>Before Autoniv</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider" style={{ color: '#10B981' }}>After Autoniv</th>
                  </tr>
                </thead>
                <tbody>
                  {story.impact.metrics.map((m, i) => (
                    <tr key={i} style={{ borderBottom: i < story.impact.metrics.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                      <td className="p-4 text-sm font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>{m.metric}</td>
                      <td className="p-4 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>{m.before}</td>
                      <td className="p-4 text-sm font-semibold" style={{ color: '#10B981' }}>{m.after}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quote */}
          {story.quote && (
            <div className="mb-12 p-6 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.1), rgba(16,185,129,0.1))', border: '1px solid rgba(16,185,129,0.2)' }}>
              <div className="text-3xl mb-4" style={{ color: '#10B981' }}>"</div>
              <p className="text-lg italic mb-4" style={{ color: 'rgba(255,255,255,0.8)' }}>{story.quote.text}</p>
              <p className="text-sm font-semibold" style={{ color: '#10B981' }}>— {story.quote.author}</p>
            </div>
          )}

          {/* FAQ Section */}
          {story.faqs && story.faqs.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {story.faqs.map((faq, i) => (
                  <details key={i} className="group rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <summary className="p-5 cursor-pointer font-semibold text-white list-none flex items-center justify-between">
                      {faq.q}
                      <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="px-5 pb-5 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      {faq.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="text-center p-8 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.15), rgba(16,185,129,0.15))', border: '1px solid rgba(16,185,129,0.2)' }}>
            <h3 className="text-xl font-bold text-white mb-3">Ready to get similar results?</h3>
            <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.6)' }}>See how Autoniv can transform your {study.category.toLowerCase()} operations.</p>
            <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-white no-underline" style={{ background: 'var(--gg)' }}>
              Get Started Free
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
