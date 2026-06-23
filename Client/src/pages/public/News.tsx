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

function USPSlider() {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setCurrent((i) => (i + 1) % usps.length), 3000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="fixed top-0 inset-x-0 z-[60] overflow-hidden" style={{ background: 'linear-gradient(90deg,#030B2E 0%,#0a1628 50%,#030B2E 100%)', borderBottom: '1px solid rgba(16,185,129,0.15)', height: '36px' }}>
      <div className="relative flex items-center justify-center h-full px-4 sm:px-6">
        {usps.map((usp, i) => (
          <span key={i} className="absolute inline-flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-sm font-medium transition-all duration-500 text-center whitespace-nowrap overflow-hidden text-ellipsis max-w-[90vw] sm:max-w-full"
            style={{ color: 'rgba(255,255,255,0.85)', opacity: i === current ? 1 : 0, transform: i === current ? 'translateY(0)' : 'translateY(12px)' }}>
            <span className="text-xs sm:text-sm flex-shrink-0">{usp.icon}</span><span className="truncate">{usp.text}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

const NEWS_ARTICLES = [
  {
    category: 'Product Release',
    date: 'June 18, 2026',
    title: 'Autoniv 2.0 Released: Real-time Voice Cloning & Calendar Sync',
    desc: 'We are thrilled to launch Autoniv 2.0, introducing state-of-the-art voice cloning latency improvements and direct native integrations with Google Calendar and Microsoft Outlook for seamless booking.',
    readTime: '4 min read',
    accent: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  },
  {
    category: 'Industry Guide',
    date: 'June 10, 2026',
    title: 'How AI Voice Agents Are Redefining Customer Service in 2026',
    desc: 'Explore the state of voice conversational interfaces. We analyze latency benchmarks, accuracy improvements in accent comprehension, and why multi-lingual configurations are vital for modern scaling businesses.',
    readTime: '6 min read',
    accent: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
  },
  {
    category: 'Security & Compliance',
    date: 'May 28, 2026',
    title: 'Autoniv Achieves SOC 2 Type II Security Certification',
    desc: 'Security is at the core of our business communication platform. Autoniv has successfully completed the SOC 2 Type II audit, ensuring the highest standards of data protection and server compliance for enterprise customers.',
    readTime: '3 min read',
    accent: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  },
  {
    category: 'Case Study Highlights',
    date: 'May 15, 2026',
    title: 'How a Local Home Services Agency Scaled to 10,000 Inbound Calls',
    desc: 'Read how PeakPlumbing integrated Autoniv scheduling agents to automate dispatch operations. The AI agent booked emergency service requests in real time, increasing clinic booking speed and customer satisfaction.',
    readTime: '5 min read',
    accent: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
  },
];

export function News() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen" style={{ background: '#ffffff', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
      {/* Nav */}
      <nav className="fixed top-[36px] inset-x-0 z-50 transition-all duration-300" style={{ background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(37,99,235,0.12)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[68px] flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src={LOGO_SRC} alt="Autoniv" className="h-30 w-auto object-contain" />
          </Link>
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link key={item.label} to={item.href} className="text-sm font-semibold transition-colors"
                style={{ color: location.pathname === item.href ? '#2563EB' : '#475569' }}
                onMouseEnter={(e) => { if (location.pathname !== item.href) e.currentTarget.style.color = '#0a0a0a'; }}
                onMouseLeave={(e) => { if (location.pathname !== item.href) e.currentTarget.style.color = '#475569'; }}
              >{item.label}</Link>
            ))}
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <Link to="/" className="px-4 py-2 text-sm font-medium rounded-lg transition-colors" style={{ color: '#475569' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#0a0a0a'; e.currentTarget.style.background = 'rgba(37,99,235,.07)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.background = 'transparent'; }}
            >Sign In</Link>
            <Link to="/" className="px-5 py-2.5 text-sm font-bold text-white rounded-full transition-all" style={{ background: 'linear-gradient(135deg,#2563EB,#10B981)', boxShadow: '0 4px 14px rgba(16,185,129,0.25)' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(16,185,129,0.35)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(16,185,129,0.25)'; }}
            >Get Started Free</Link>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2" style={{ color: '#475569', background: 'none', border: 'none', cursor: 'pointer' }}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden px-5 py-4 space-y-1" style={{ background: 'rgba(255,255,255,.98)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(37,99,235,.10)' }}>
            {navItems.map((item) => (
              <Link key={item.label} to={item.href} onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-sm font-semibold rounded-xl"
                style={{ color: location.pathname === item.href ? '#2563EB' : '#475569', background: location.pathname === item.href ? 'rgba(37,99,235,.07)' : 'transparent' }}
              >{item.label}</Link>
            ))}
            <div className="pt-2 space-y-2">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block w-full text-center px-4 py-3 text-sm font-semibold rounded-xl" style={{ color: '#475569' }}>Sign In</Link>
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block w-full text-center px-4 py-3 text-sm font-bold text-white rounded-xl" style={{ background: 'linear-gradient(135deg,#2563EB,#10B981)' }}>Get Started Free</Link>
            </div>
          </div>
        )}
      </nav>

      <USPSlider />
      
      {/* Content wrapper with top padding for fixed nav */}
      <div className="flex-1 pt-[140px] pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in-up">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full tag text-xs sm:text-sm bg-blue-500/10 border border-blue-500/30 text-blue-600 mb-4">
            ✦ LATEST NEWS
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#030B2E] tracking-tight mb-6">
            Autoniv <span className="gradient-text">News & Product Updates</span>
          </h1>
          <p className="text-lg text-[#475569] leading-relaxed">
            Stay up to date with the latest voice AI features, guides, security audits, and success stories.
          </p>
        </div>

        {/* News Feed Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {NEWS_ARTICLES.map((art, index) => (
            <div
              key={art.title}
              className="glass-card rounded-2xl p-6 sm:p-8 card-hover border border-blue-500/10 flex flex-col justify-between animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${art.accent}`}>
                    {art.category}
                  </span>
                  <span className="text-xs text-[#475569] font-medium">{art.date}</span>
                </div>
                
                <h3 className="text-xl font-bold text-[#030B2E] mb-3 leading-snug hover:text-blue-600 transition-colors">
                  {art.title}
                </h3>
                <p className="text-[#475569] text-sm leading-relaxed mb-6">
                  {art.desc}
                </p>
              </div>

              <div className="border-t border-slate-200/50 pt-4 flex items-center justify-between text-xs font-semibold text-[#475569]">
                <span>{art.readTime}</span>
                <span className="text-blue-600 hover:underline cursor-pointer flex items-center gap-1">
                  Read Article <span>→</span>
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Stay Updated Card */}
        <div className="glass-card rounded-3xl p-8 sm:p-12 border border-blue-500/10 text-center max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold text-[#030B2E] mb-2">Subscribe to our Newsletter</h3>
          <p className="text-sm text-[#475569] mb-6">
            Get product announcements, tips, and voice AI insights sent straight to your inbox.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert('Thank you for subscribing!');
            }}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              required
              placeholder="Enter your work email"
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white text-sm"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-[#030B2E] text-white hover:bg-slate-800 transition-colors rounded-xl text-sm font-bold shadow-md cursor-pointer"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default News;
