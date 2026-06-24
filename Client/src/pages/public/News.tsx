import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Footer from './Footer';
import ScrollToTop from '../../components/ScrollToTop';

const LOGO_SRC = '/autoniv.webp';

const navItems = [
  { label: 'Agents', href: '/agents' },
  { label: 'Case Studies', href: '/case-studies' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'News', href: '/news' },
  { label: 'About', href: '/about' },
];

const usps = [
  { icon: '🎙️', text: 'AI Voice Agents That Answer, Qualify & Convert Leads 24/7' },
  { icon: '🌍', text: 'Multi-Language Support – AI That Speaks Your Customers\' Language' },
  { icon: '⚡', text: 'Quick Setup – Live in Minutes, No Code Needed' },
];

const NEWS_ARTICLES = [
  {
    category: 'Product Release',
    date: 'June 18, 2026',
    title: 'Autoniv 2.0 Released: Real-time Voice Cloning & Calendar Sync',
    desc: 'We are thrilled to launch Autoniv 2.0, introducing state-of-the-art voice cloning latency improvements and direct native integrations with Google Calendar and Microsoft Outlook for seamless booking.',
    readTime: '4 min read',
    color: '#2563EB',
    emoji: '🖥️',
    featured: true,
  },
  {
    category: 'Industry Guide',
    date: 'June 10, 2026',
    title: 'How AI Voice Agents Are Redefining Customer Service in 2026',
    desc: 'Explore the state of voice conversational interfaces. We analyze latency benchmarks, accuracy improvements in accent comprehension, and why multi-lingual configurations are vital for modern scaling businesses.',
    readTime: '6 min read',
    color: '#10B981',
    emoji: '🎙️',
  },
  {
    category: 'Security & Compliance',
    date: 'May 28, 2026',
    title: 'Autoniv Achieves SOC 2 Type II Security Certification',
    desc: 'Security is at the core of our business communication platform. Autoniv has successfully completed the SOC 2 Type II audit, ensuring the highest standards of data protection and server compliance for enterprise customers.',
    readTime: '3 min read',
    color: '#8b5cf6',
    emoji: '🔒',
  },
  {
    category: 'Case Study Highlights',
    date: 'May 15, 2026',
    title: 'How a Local Home Services Agency Scaled to 10,000 Inbound Calls',
    desc: 'Read how PeakPlumbing integrated Autoniv scheduling agents to automate dispatch operations. The AI agent booked emergency service requests in real time, increasing clinic booking speed and customer satisfaction.',
    readTime: '5 min read',
    color: '#f97316',
    emoji: '🚐',
  },
  {
    category: 'Industry Guide',
    date: 'April 22, 2026',
    title: 'The Complete Guide to Building an AI-Powered Sales Funnel',
    desc: 'From lead capture to conversion, learn how AI voice agents can automate every stage of your sales pipeline and boost revenue by 30% or more.',
    readTime: '8 min read',
    color: '#10B981',
    emoji: '📈',
  },
  {
    category: 'Product Release',
    date: 'April 5, 2026',
    title: 'Introducing WhatsApp Business API Integration',
    desc: 'Connect your Autoniv AI agents directly to WhatsApp Business API for seamless customer engagement across voice and chat channels.',
    readTime: '3 min read',
    color: '#2563EB',
    emoji: '💬',
  },
];

const CATEGORIES = [
  { name: 'Product Releases', count: 12, color: '#2563EB', icon: '🚀' },
  { name: 'Industry Guides', count: 18, color: '#10B981', icon: '📚' },
  { name: 'Security & Compliance', count: 6, color: '#8b5cf6', icon: '🔒' },
  { name: 'Case Studies', count: 15, color: '#f97316', icon: '📊' },
  { name: 'Company News', count: 8, color: '#ec4899', icon: '🏢' },
  { name: 'Tips & Tutorials', count: 22, color: '#06b6d4', icon: '💡' },
];

const STATS = [
  { value: '50+', label: 'Articles Published', icon: '📝' },
  { value: '10K+', label: 'Monthly Readers', icon: '👥' },
  { value: '4.8', label: 'Avg. Reader Rating', icon: '⭐' },
  { value: '20+', label: 'Industry Topics', icon: '🎯' },
];

const TIMELINE = [
  { date: 'June 2026', title: 'Autoniv 2.0 Launch', desc: 'Voice cloning, calendar sync, and 50+ improvements.', color: '#2563EB' },
  { date: 'May 2026', title: 'SOC 2 Type II Certified', desc: 'Enterprise-grade security compliance achieved.', color: '#8b5cf6' },
  { date: 'April 2026', title: 'WhatsApp API Integration', desc: 'Native WhatsApp Business API support launched.', color: '#10B981' },
  { date: 'March 2026', title: '100+ Businesses Milestone', desc: 'Crossed 100 active business customers.', color: '#f97316' },
];

/* ─── USP Ticker ─── */
function USPSlider() {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setCurrent(i => (i + 1) % usps.length), 3000);
    return () => clearInterval(t);
  }, [usps.length]);
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

/* ─── Nav ─── */
function Nav({ mobileMenuOpen, setMobileMenuOpen }: { mobileMenuOpen: boolean; setMobileMenuOpen: (v: boolean) => void }) {
  const location = useLocation();
  return (
    <nav className="fixed top-[36px] inset-x-0 z-50" style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(37,99,235,0.12)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[68px] flex items-center justify-between">
        <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><img src={LOGO_SRC} alt="Autoniv" className="h-20 sm:h-40 w-auto object-contain" /></Link>
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
          <Link to="/" className="px-4 py-2 text-sm font-medium rounded-lg transition-colors" style={{ color: '#475569' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#2563EB'; e.currentTarget.style.background = 'rgba(37,99,235,0.05)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.background = 'transparent'; }}
          >Sign In</Link>
          <Link to="/" className="px-5 py-2.5 text-sm font-bold text-white rounded-full transition-all" style={{ background: 'linear-gradient(135deg,#2563EB,#10B981)', boxShadow: '0 4px 20px rgba(16,185,129,0.35)' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(16,185,129,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(16,185,129,0.35)'; }}
          >Get Started Free</Link>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2" style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer' }}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>
      {mobileMenuOpen && (
        <div className="md:hidden px-5 py-4 space-y-1" style={{ background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(24px)', borderTop: '1px solid rgba(37,99,235,0.10)' }}>
          {navItems.map(item => (
            <Link key={item.label} to={item.href} onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 text-sm font-semibold rounded-xl"
              style={{ color: location.pathname === item.href ? '#2563EB' : '#475569', background: location.pathname === item.href ? 'rgba(37,99,235,0.07)' : 'transparent' }}
            >{item.label}</Link>
          ))}
          <div className="pt-2 flex flex-col gap-2">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block text-center px-4 py-3 text-sm font-semibold rounded-xl" style={{ color: '#475569' }}>Sign In</Link>
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block text-center px-4 py-3 text-sm font-bold text-white rounded-xl" style={{ background: 'linear-gradient(135deg,#2563EB,#10B981)' }}>Get Started Free</Link>
          </div>
        </div>
      )}
    </nav>
  );
}

/* ─── Main ─── */
export function News() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen relative" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
      <USPSlider />
      <Nav mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

      <div className="page-bg" style={{ paddingTop: 120, paddingBottom: 8 }}>
        <div className="box-wrap">

          {/* ── Hero ── */}
          <section className="section-box tint">
            <div className="section-pad text-center">
              <div className="tag inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold tracking-[0.1em] mb-4 sm:mb-5" style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)', color: '#2563EB' }}>
                ✦ LATEST NEWS
              </div>
              <h1 className="text-3xl sm:text-5xl font-black leading-tight mb-4 sm:mb-6" style={{ color: '#0a0a0a' }}>
                Autoniv{' '}
                <span style={{ background: 'linear-gradient(135deg,#2563EB,#10B981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>News & Product Updates</span>
              </h1>
              <p className="text-sm sm:text-lg leading-relaxed max-w-xl mx-auto" style={{ color: '#64748b' }}>
                Stay up to date with the latest voice AI features, guides, security audits, and success stories.
              </p>
            </div>
          </section>

          {/* ── Stats Bar ── */}
          <section className="section-box white">
            <div className="section-pad">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {STATS.map((s) => (
                  <div key={s.label} className="flex items-center justify-center gap-3 py-2 group cursor-default">
                    <span className="text-2xl sm:text-3xl transition-transform group-hover:scale-110">{s.icon}</span>
                    <div>
                      <div className="text-lg sm:text-2xl font-black" style={{ color: '#0a0a0a' }}>{s.value}</div>
                      <div className="text-[9px] sm:text-[10px]" style={{ color: '#94a3b8' }}>{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Featured Article ── */}
          <section className="section-box white">
            <div className="section-pad">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1 h-6 rounded-full" style={{ background: 'linear-gradient(180deg,#2563EB,#10B981)' }} />
                <h2 className="text-lg sm:text-xl font-extrabold" style={{ color: '#0a0a0a' }}>Featured Article</h2>
              </div>
              {NEWS_ARTICLES.filter(a => a.featured).map((art) => (
                <div key={art.title} className="group cursor-pointer rounded-2xl overflow-hidden transition-all duration-300" style={{ border: '1px solid rgba(37,99,235,0.1)' }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 20px 50px ${art.color}15`; e.currentTarget.style.borderColor = `${art.color}44`; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'rgba(37,99,235,0.1)'; }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="h-48 md:h-auto flex items-center justify-center text-6xl sm:text-7xl" style={{ background: `linear-gradient(135deg,${art.color}12,${art.color}06)` }}>
                      <span className="transition-transform group-hover:scale-110">{art.emoji}</span>
                    </div>
                    <div className="p-6 sm:p-8 flex flex-col justify-center">
                      <div className="flex items-center gap-2.5 mb-3">
                        <span className="px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-bold" style={{ background: `${art.color}12`, color: art.color }}>{art.category}</span>
                        <span className="text-[10px] sm:text-xs font-medium" style={{ color: '#94a3b8' }}>{art.date}</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-extrabold mb-3 leading-snug" style={{ color: '#0a0a0a' }}>{art.title}</h3>
                      <p className="text-sm leading-relaxed mb-5" style={{ color: '#64748b' }}>{art.desc}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] sm:text-xs font-semibold" style={{ color: '#94a3b8' }}>{art.readTime}</span>
                        <span className="flex items-center gap-1 text-sm font-bold transition-all group-hover:gap-2" style={{ color: art.color }}>Read Article →</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── News Grid ── */}
          <section className="section-box tint">
            <div className="section-pad">
              <div className="flex items-center gap-2 mb-8">
                <div className="w-1 h-6 rounded-full" style={{ background: 'linear-gradient(180deg,#10B981,#2563EB)' }} />
                <h2 className="text-lg sm:text-xl font-extrabold" style={{ color: '#0a0a0a' }}>All Articles</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {NEWS_ARTICLES.filter(a => !a.featured).map((art) => (
                  <div key={art.title} className="group cursor-pointer rounded-2xl overflow-hidden transition-all duration-300" style={{ background: '#fff', border: '1px solid rgba(37,99,235,0.1)' }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 20px 50px ${art.color}15`; e.currentTarget.style.borderColor = `${art.color}44`; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'rgba(37,99,235,0.1)'; }}
                  >
                    <div className="h-32 sm:h-36 flex items-center justify-center text-4xl sm:text-5xl" style={{ background: `linear-gradient(135deg,${art.color}12,${art.color}06)` }}>
                      <span className="transition-transform group-hover:scale-110">{art.emoji}</span>
                    </div>
                    <div className="p-5 sm:p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2 py-1 rounded-md text-[10px] font-bold" style={{ background: `${art.color}12`, color: art.color }}>{art.category}</span>
                        <span className="text-[10px]" style={{ color: '#94a3b8' }}>{art.date}</span>
                      </div>
                      <h3 className="text-sm sm:text-base font-extrabold mb-2 leading-snug" style={{ color: '#0a0a0a' }}>{art.title}</h3>
                      <p className="text-xs leading-relaxed mb-4 line-clamp-2" style={{ color: '#64748b' }}>{art.desc}</p>
                      <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid #f1f5f9' }}>
                        <span className="text-[10px] font-semibold" style={{ color: '#94a3b8' }}>{art.readTime}</span>
                        <span className="text-xs font-bold transition-all group-hover:translate-x-1" style={{ color: art.color }}>→</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Categories ── */}
          <section className="section-box white">
            <div className="section-pad">
              <div className="flex items-center gap-2 mb-8">
                <div className="w-1 h-6 rounded-full" style={{ background: 'linear-gradient(180deg,#f97316,#ec4899)' }} />
                <h2 className="text-lg sm:text-xl font-extrabold" style={{ color: '#0a0a0a' }}>Browse by Topic</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {CATEGORIES.map((cat) => (
                  <div key={cat.name} className="group cursor-pointer rounded-xl p-4 sm:p-5 transition-all duration-300 hover:-translate-y-1" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = `${cat.color}40`; e.currentTarget.style.boxShadow = `0 12px 30px ${cat.color}12`; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <div className="text-2xl mb-3">{cat.icon}</div>
                    <div className="text-sm font-extrabold mb-1" style={{ color: '#0a0a0a' }}>{cat.name}</div>
                    <div className="text-xs" style={{ color: '#94a3b8' }}>{cat.count} articles</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Timeline ── */}
          <section className="section-box tint">
            <div className="section-pad">
              <div className="flex items-center gap-2 mb-8">
                <div className="w-1 h-6 rounded-full" style={{ background: 'linear-gradient(180deg,#2563EB,#8b5cf6)' }} />
                <h2 className="text-lg sm:text-xl font-extrabold" style={{ color: '#0a0a0a' }}>Product Timeline</h2>
              </div>
              <div className="max-w-2xl mx-auto">
                {TIMELINE.map((item, i) => (
                  <div key={i} className="flex gap-4 sm:gap-6 mb-6 last:mb-0">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ background: item.color, boxShadow: `0 0 12px ${item.color}40` }} />
                      {i < TIMELINE.length - 1 && <div className="w-px flex-1 mt-1" style={{ background: '#e2e8f0' }} />}
                    </div>
                    <div className="pb-6">
                      <div className="text-[10px] font-bold tracking-widest mb-1" style={{ color: item.color }}>{item.date}</div>
                      <div className="text-sm font-extrabold mb-1" style={{ color: '#0a0a0a' }}>{item.title}</div>
                      <div className="text-xs" style={{ color: '#64748b' }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Newsletter CTA ── */}
          <section className="section-box white">
            <div className="section-pad">
              <div className="text-center max-w-2xl mx-auto">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5" style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.15)' }}>📬</div>
                <h3 className="text-xl sm:text-2xl font-extrabold mb-2" style={{ color: '#0a0a0a' }}>Subscribe to our Newsletter</h3>
                <p className="text-xs sm:text-sm mb-6" style={{ color: '#64748b' }}>
                  Get product announcements, tips, and voice AI insights sent straight to your inbox.
                </p>
                <form onSubmit={e => { e.preventDefault(); alert('Thank you for subscribing!'); }} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <input type="email" required placeholder="Enter your work email"
                    className="flex-1 px-4 py-3 rounded-xl text-sm outline-none" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#0a0a0a' }}
                  />
                  <button type="submit" className="px-6 py-3 rounded-xl text-sm font-bold text-white cursor-pointer transition-all" style={{ background: 'linear-gradient(135deg,#2563EB,#10B981)' }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 24px rgba(16,185,129,0.3)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                  >Subscribe</button>
                </form>
              </div>
            </div>
          </section>

          {/* ── CTA ── */}
          <section className="section-box black">
            <div className="section-pad text-center">
              <h2 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: '#fff' }}>Ready to Grow with AI?</h2>
              <p className="text-sm sm:text-base mb-10 max-w-md mx-auto" style={{ color: 'rgba(255,255,255,0.45)' }}>Join 500+ businesses using Autoniv AI Voice Agents to capture more leads and serve customers 24/7.</p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/register" className="px-8 py-4 rounded-full text-sm font-bold text-white border-none cursor-pointer transition-all hover:-translate-y-1 no-underline text-center" style={{ background: 'linear-gradient(135deg,#2563EB,#10B981)', boxShadow: '0 4px 24px rgba(16,185,129,0.3)' }}>Start Free Trial →</Link>
                <Link to="/agents" className="px-8 py-4 rounded-full text-sm font-bold cursor-pointer transition-all hover:bg-white/10 no-underline text-center" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}>Explore AI Agents →</Link>
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

export default News;
