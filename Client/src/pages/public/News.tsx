import { useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from './Footer';
import ScrollToTop from '../../components/ScrollToTop';
import { USPSlider } from './sections/USPSlider';
import { Nav } from './CaseStudies';

const NEWS_ARTICLES = [
  {
    id: 1,
    category: 'Product Release',
    date: 'June 18, 2026',
    title: 'Autoniv 2.0 Released: Real-time Voice Cloning & Calendar Sync',
    desc: 'We are thrilled to launch Autoniv 2.0, introducing state-of-the-art voice cloning latency improvements and direct native integrations with Google Calendar and Microsoft Outlook for seamless booking.',
    fullContent: 'We are thrilled to launch Autoniv 2.0, introducing state-of-the-art voice cloning latency improvements and direct native integrations with Google Calendar and Microsoft Outlook for seamless booking. This major update reduces voice cloning latency by 40% and introduces real-time voice modulation capabilities. The new calendar sync feature automatically detects scheduling conflicts and suggests optimal meeting times, reducing back-and-forth communication by up to 70%. Early adopters have reported a 45% increase in booking conversion rates within the first week of implementation.',
    readTime: '4 min read',
    emoji: '🖥️',
    featured: true,
    tag: 'Featured',
  },
  {
    id: 2,
    category: 'Industry Guide',
    date: 'June 10, 2026',
    title: 'How AI Voice Agents Are Redefining Customer Service in 2026',
    desc: 'Explore the state of voice conversational interfaces. We analyze latency benchmarks, accuracy improvements in accent comprehension, and why multi-lingual configurations are vital for modern scaling businesses.',
    fullContent: 'Explore the state of voice conversational interfaces. We analyze latency benchmarks, accuracy improvements in accent comprehension, and why multi-lingual configurations are vital for modern scaling businesses. Our comprehensive guide covers the evolution of voice AI from basic IVR systems to sophisticated conversational agents capable of understanding context, emotion, and intent. We examine real-world case studies showing how businesses have reduced customer service costs by 60% while improving satisfaction scores by 35%. The guide also provides actionable insights on implementing multilingual support, handling complex queries, and measuring ROI from AI voice investments.',
    readTime: '6 min read',
    emoji: '🎙️',
  },
  {
    id: 3,
    category: 'Security & Compliance',
    date: 'May 28, 2026',
    title: 'Autoniv Achieves SOC 2 Type II Security Certification',
    desc: 'Security is at the core of our business communication platform. Autoniv has successfully completed the SOC 2 Type II audit, ensuring the highest standards of data protection and server compliance for enterprise customers.',
    fullContent: 'Security is at the core of our business communication platform. Autoniv has successfully completed the SOC 2 Type II audit, ensuring the highest standards of data protection and server compliance for enterprise customers. This certification validates our commitment to security across five key trust service criteria: security, availability, processing integrity, confidentiality, and privacy. The rigorous audit process involved thorough examination of our access controls, encryption standards, incident response procedures, and disaster recovery plans. Enterprise customers can now confidently deploy Autoniv knowing their data meets the strictest compliance requirements.',
    readTime: '3 min read',
    emoji: '🔒',
  },
  {
    id: 4,
    category: 'Case Study Highlights',
    date: 'May 15, 2026',
    title: 'How a Local Home Services Agency Scaled to 10,000 Inbound Calls',
    desc: 'Read how PeakPlumbing integrated Autoniv scheduling agents to automate dispatch operations. The AI agent booked emergency service requests in real time, increasing clinic booking speed and customer satisfaction.',
    fullContent: 'Read how PeakPlumbing integrated Autoniv scheduling agents to automate dispatch operations. The AI agent booked emergency service requests in real time, increasing clinic booking speed and customer satisfaction. Within three months of implementation, PeakPlumbing scaled from managing 500 monthly calls to handling over 10,000 inbound inquiries. The AI voice agent successfully booked 82% of calls directly without human intervention, reducing dispatcher workload by 75%. Customer satisfaction scores rose from 3.2 to 4.8 out of 5, with customers praising the quick response times and seamless booking experience. The case study details implementation strategies, common challenges, and key metrics for measuring success.',
    readTime: '5 min read',
    emoji: '🚐',
  },
  {
    id: 5,
    category: 'Industry Guide',
    date: 'April 22, 2026',
    title: 'The Complete Guide to Building an AI-Powered Sales Funnel',
    desc: 'From lead capture to conversion, learn how AI voice agents can automate every stage of your sales pipeline and boost revenue by 30% or more.',
    fullContent: 'From lead capture to conversion, learn how AI voice agents can automate every stage of your sales pipeline and boost revenue by 30% or more. This comprehensive guide walks through each stage of the sales funnel—awareness, interest, consideration, intent, evaluation, and purchase—and shows how AI voice agents can optimize conversion at every step. Discover how to design conversational scripts that qualify leads, handle objections, and close sales automatically. The guide includes templates for call scripts, integration strategies for CRMs, and analytics frameworks to track AI performance. Real examples from successful implementations demonstrate how businesses have doubled their conversion rates using AI voice technology.',
    readTime: '8 min read',
    emoji: '📈',
  },
  {
    id: 6,
    category: 'Product Release',
    date: 'April 5, 2026',
    title: 'Introducing WhatsApp Business API Integration',
    desc: 'Connect your Autoniv AI agents directly to WhatsApp Business API for seamless customer engagement across voice and chat channels.',
    fullContent: 'Connect your Autoniv AI agents directly to WhatsApp Business API for seamless customer engagement across voice and chat channels. This integration allows businesses to manage customer communications through a unified interface, switching between voice and text channels based on customer preference and context. The WhatsApp integration supports automated responses, order confirmations, appointment reminders, and customer support queries. Early beta testers have reported a 40% increase in customer engagement and a 55% reduction in response times. The integration complies with WhatsApp\'s business policies and includes built-in analytics for tracking conversation metrics.',
    readTime: '3 min read',
    emoji: '💬',
  },
];

const CATEGORIES = [
  { name: 'Product Releases', count: 12, icon: '🚀' },
  { name: 'Industry Guides', count: 18, icon: '📚' },
  { name: 'Security & Compliance', count: 6, icon: '🔒' },
  { name: 'Case Studies', count: 15, icon: '📊' },
  { name: 'Company News', count: 8, icon: '🏢' },
  { name: 'Tips & Tutorials', count: 22, icon: '💡' },
];

const STATS = [
  { value: '50+', label: 'Articles Published', icon: '📝' },
  { value: '10K+', label: 'Monthly Readers', icon: '👥' },
  { value: '4.8', label: 'Avg. Reader Rating', icon: '⭐' },
  { value: '20+', label: 'Industry Topics', icon: '🎯' },
];

const TIMELINE = [
  { date: 'June 2026', title: 'Autoniv 2.0 Launch', desc: 'Voice cloning, calendar sync, and 50+ improvements.' },
  { date: 'May 2026', title: 'SOC 2 Type II Certified', desc: 'Enterprise-grade security compliance achieved.' },
  { date: 'April 2026', title: 'WhatsApp API Integration', desc: 'Native WhatsApp Business API support launched.' },
  { date: 'March 2026', title: '100+ Businesses Milestone', desc: 'Crossed 100 active business customers.' },
];

// Article Modal Component
function ArticleModal({ article, onClose }: { article: typeof NEWS_ARTICLES[0] | null; onClose: () => void }) {
  if (!article) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slideUp" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{article.emoji}</span>
            <span className="text-xs font-medium text-gray-500">{article.category}</span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-medium text-gray-500">{article.date}</span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs font-medium text-gray-500">{article.readTime}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{article.title}</h2>
          <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
            <p>{article.fullContent}</p>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-500">Share this article</span>
            <div className="flex gap-3">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">📧</button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">🐦</button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">🔗</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function News() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<typeof NEWS_ARTICLES[0] | null>(null);

  return (
    <div className="min-h-screen relative" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <USPSlider />
      <Nav mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

      <div className="page-bg" style={{ paddingTop: 120, paddingBottom: 8 }}>
        <div className="box-wrap">

          {/* ── Hero ── */}
          <section className="section-box white mb-8 sm:mb-12">
            <div className="text-center max-w-4xl mx-auto px-4 py-8 sm:py-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wider mb-5" style={{
                background: 'rgba(37,99,235,0.08)',
                border: '1px solid rgba(37,99,235,0.2)',
                color: 'var(--primary-blue)',
              }}>
                <span style={{ color: 'var(--secondary)' }}>✦</span>
                LATEST NEWS
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight mb-5">
                Autoniv{' '}
                <span className="gradient-text">News & Updates</span>
              </h1>
              <p className="text-base sm:text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--text)' }}>
                Stay up to date with the latest voice AI features, guides, security audits, and success stories.
              </p>
            </div>
          </section>

          {/* ── Stats Bar ── */}
          <section className="px-4 mb-8 sm:mb-12">
            <div className="rounded-2xl p-6 sm:p-10" style={{
              background: '#050d1a',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
                {STATS.map((s) => (
                  <div key={s.label} className="text-center">
                    <span className="text-3xl sm:text-4xl block mb-2">{s.icon}</span>
                    <div className="text-xl sm:text-2xl font-black mb-1" style={{
                      background: 'linear-gradient(135deg,var(--primary-blue),var(--secondary))',
                      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                    }}>{s.value}</div>
                    <div className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.45)' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Featured Article ── */}
          <section className="px-4 mb-8 sm:mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-7 rounded-full" style={{ background: 'var(--primary-blue)' }} />
              <h2 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--text)' }}>Featured Article</h2>
            </div>
            {NEWS_ARTICLES.filter(a => a.featured).map((art) => (
              <div
                key={art.title}
                className="section-box white group rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 hover:shadow-xl"
                onClick={() => setSelectedArticle(art)}
              >
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="h-56 md:h-auto flex items-center justify-center p-8 border-b md:border-b-0 md:border-r" style={{
                    background: '#f8fafc',
                    borderColor: 'rgba(37,99,235,0.06)',
                  }}>
                    <span className="text-7xl md:text-8xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">{art.emoji}</span>
                  </div>
                  <div className="p-6 sm:p-8 flex flex-col justify-center">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold" style={{
                        background: 'rgba(37,99,235,0.08)',
                        color: 'var(--primary-blue)',
                      }}>
                        {art.category}
                      </span>
                      <span className="text-xs font-medium" style={{ color: '#94a3b8' }}>{art.date}</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold mb-3 leading-snug transition-colors" style={{ color: 'var(--text)' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--primary-blue)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text)'}
                    >
                      {art.title}
                    </h3>
                    <p className="text-sm leading-relaxed mb-5" style={{ color: '#64748b' }}>{art.desc}</p>
                    <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid rgba(37,99,235,0.06)' }}>
                      <span className="text-xs font-medium" style={{ color: '#94a3b8' }}>{art.readTime}</span>
                      <span className="inline-flex items-center gap-2 text-sm font-medium transition-all group-hover:gap-3" style={{ color: 'var(--primary-blue)' }}>
                        Read More
                        <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </section>

          {/* ── News Grid ── */}
          <section className="section-box white mb-8 sm:mb-12 px-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-7 rounded-full" style={{ background: 'var(--secondary)' }} />
              <h2 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--text)' }}>All Articles</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {NEWS_ARTICLES.filter(a => !a.featured).map((art) => (
                <div
                  key={art.title}
                  className="section-box white group rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
                  onClick={() => setSelectedArticle(art)}
                >
                  <div className="h-40 flex items-center justify-center" style={{
                    background: '#f8fafc',
                    borderBottom: '1px solid rgba(37,99,235,0.06)',
                  }}>
                    <span className="text-5xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">{art.emoji}</span>
                  </div>
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold" style={{
                        background: 'rgba(37,99,235,0.08)',
                        color: 'var(--primary-blue)',
                      }}>
                        {art.category}
                      </span>
                      <span className="text-[10px] font-medium" style={{ color: '#94a3b8' }}>{art.date}</span>
                    </div>
                    <h3 className="text-sm font-bold mb-2 leading-snug line-clamp-2 transition-colors" style={{ color: 'var(--text)' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--primary-blue)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text)'}
                    >
                      {art.title}
                    </h3>
                    <p className="text-xs leading-relaxed mb-4 line-clamp-2" style={{ color: '#64748b' }}>{art.desc}</p>
                    <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid rgba(37,99,235,0.06)' }}>
                      <span className="text-[10px] font-medium" style={{ color: '#94a3b8' }}>{art.readTime}</span>
                      <span className="text-sm font-medium transition-all group-hover:translate-x-1" style={{ color: 'var(--primary-blue)' }}>Read More →</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Categories ── */}
          <section className="section-box white mb-8 sm:mb-12 px-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-7 rounded-full" style={{ background: 'var(--primary-blue)' }} />
              <h2 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--text)' }}>Browse by Topic</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {CATEGORIES.map((cat) => (
                <div key={cat.name} className="group rounded-2xl p-5 sm:p-6 transition-all duration-300 hover:-translate-y-1 cursor-pointer" style={{
                  background: 'rgba(37,99,235,0.03)',
                  border: '1px solid rgba(37,99,235,0.08)',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(37,99,235,0.2)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(37,99,235,0.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(37,99,235,0.08)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{cat.icon}</div>
                  <div className="text-sm font-bold mb-1" style={{ color: 'var(--text)' }}>{cat.name}</div>
                  <div className="text-xs" style={{ color: '#94a3b8' }}>{cat.count} articles</div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Timeline ── */}
          <section className="mb-8 sm:mb-12 px-4">
            <div className="rounded-2xl p-6 sm:p-10" style={{
              background: '#050d1a',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-7 rounded-full" style={{ background: 'var(--secondary)' }} />
                <h2 className="text-xl sm:text-2xl font-bold text-white">Product Timeline</h2>
              </div>
              <div className="max-w-3xl mx-auto">
                {TIMELINE.map((item, i) => (
                  <div key={i} className="flex gap-4 sm:gap-6 mb-6 last:mb-0">
                    <div className="flex flex-col items-center">
<div className="w-4 h-4 rounded-full shrink-0" style={{
  background: 'var(--secondary)',
  boxShadow: '0 0 0 4px #050d1a',
}} />
                      {i < TIMELINE.length - 1 && <div className="w-0.5 flex-1 mt-2" style={{ background: 'rgba(255,255,255,0.08)' }} />}
                    </div>
                    <div className="pb-6 flex-1">
                      <div className="text-xs font-bold tracking-wider mb-1" style={{ color: 'var(--secondary)' }}>{item.date}</div>
                      <div className="text-sm font-bold text-white mb-1">{item.title}</div>
                      <div className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Newsletter CTA ── */}
          <section className="section-box white mb-8 sm:mb-12 px-4">
            <div className="text-center max-w-2xl mx-auto py-6 sm:py-8">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5" style={{
                background: 'rgba(37,99,235,0.05)',
                border: '1px solid rgba(37,99,235,0.08)',
              }}>
                📬
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: 'var(--text)' }}>Subscribe to our Newsletter</h3>
              <p className="text-sm mb-6" style={{ color: '#64748b' }}>
                Get product announcements, tips, and voice AI insights sent straight to your inbox.
              </p>
              <form onSubmit={e => { e.preventDefault(); alert('Thank you for subscribing!'); }} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  required
                  placeholder="Enter your work email"
                  className="flex-1 px-5 py-3.5 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: '#f8fafc',
                    border: '1px solid rgba(37,99,235,0.12)',
                    color: 'var(--text)',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'var(--primary-blue)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'rgba(37,99,235,0.12)'; e.currentTarget.style.boxShadow = 'none'; }}
                />
                <button
                  type="submit"
                  className="px-8 py-3.5 rounded-xl text-sm font-bold text-white cursor-pointer transition-all"
                  style={{ background: 'var(--gg)' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(16,185,129,0.35)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  Subscribe
                </button>
              </form>
            </div>
          </section>

          {/* ── CTA ── */}
          <section className="px-4 mb-8 sm:mb-12">
            <div className="rounded-3xl p-8 sm:p-14 text-center relative overflow-hidden" style={{
              background: 'linear-gradient(135deg,#0a0a0a,#1a1a2e)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <div className="relative z-10">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to Grow with AI?</h2>
                <p className="text-sm sm:text-base mb-10 max-w-md mx-auto" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  Join 500+ businesses using Autoniv AI Voice Agents to capture more leads and serve customers 24/7.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Link
                    to="/register"
                    className="px-8 py-4 rounded-full text-sm font-bold text-white no-underline text-center transition-all duration-300"
                    style={{ background: 'var(--gg)', boxShadow: '0 4px 20px rgba(16,185,129,0.3)' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(16,185,129,0.45)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(16,185,129,0.3)'; }}
                  >
                    Start Free Trial →
                  </Link>
                  <Link
                    to="/agents"
                    className="px-8 py-4 rounded-full text-sm font-bold text-white no-underline text-center transition-all duration-300"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    Explore AI Agents
                  </Link>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>

      {/* ── Article Modal ── */}
      {selectedArticle && (
        <ArticleModal article={selectedArticle} onClose={() => setSelectedArticle(null)} />
      )}

      <ScrollToTop />
      <Footer />
    </div>
  );
}

export default News;