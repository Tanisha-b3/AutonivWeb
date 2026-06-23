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

const AGENT_TYPES = [
  {
    icon: '📞',
    title: 'AI Receptionist',
    desc: 'Never miss another business call. Answers 24/7, handles general FAQs, filters spam, and forwards high-priority calls to your team.',
    features: ['Instant Call Routing', 'Custom Greeting Messages', 'Spam Filtering'],
  },
  {
    icon: '📅',
    title: 'Appointment Scheduler',
    desc: 'Integrates directly with calendars (Google Calendar, Outlook, Calendly) to schedule, reschedule, or cancel client appointments on the call.',
    features: ['Real-Time Calendar Sync', 'SMS Confirmations', 'Follow-up Automation'],
  },
  {
    icon: '💡',
    title: 'FAQ Support Assistant',
    desc: 'Trained on your knowledge base, website, or custom documents. Answers detailed product and service questions with 99%+ accuracy.',
    features: ['Knowledge Base Training', 'Dynamic Responses', 'Context Preservation'],
  },
  {
    icon: '🎯',
    title: 'Lead Qualifier',
    desc: 'Engages inbound leads instantly. Asks qualifying questions, captures budgets and timelines, and syncs data to your CRM automatically.',
    features: ['CRM Auto-Sync', 'Custom Qualification Scripts', 'Sentiment Analysis'],
  },
];

export function Agents() {
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
              <Link
                key={item.label}
                to={item.href}
                className="text-sm font-semibold transition-colors"
                style={{ color: location.pathname === item.href ? '#2563EB' : '#475569' }}
                onMouseEnter={(e) => { if (location.pathname !== item.href) e.currentTarget.style.color = '#0a0a0a'; }}
                onMouseLeave={(e) => { if (location.pathname !== item.href) e.currentTarget.style.color = '#475569'; }}
              >
                {item.label}
              </Link>
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
            ✦ MEeT OUR AGENTS
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#030B2E] tracking-tight mb-6">
            Intelligent <span className="gradient-text">AI Voice Agents</span> Tailored to Your Business
          </h1>
          <p className="text-lg text-[#475569] leading-relaxed">
            Deploy specialized voice assistants that look up information, book calendar slots, and converse naturally in 20+ languages.
          </p>
        </div>

        {/* Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {AGENT_TYPES.map((agent, index) => (
            <div
              key={agent.title}
              className="glass-card rounded-2xl p-6 sm:p-8 card-hover border border-blue-500/10 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-4 mb-6">
                <span className="text-4xl p-3 bg-blue-500/10 rounded-2xl">{agent.icon}</span>
                <h3 className="text-2xl font-bold text-[#030B2E]">{agent.title}</h3>
              </div>
              <p className="text-[#475569] leading-relaxed mb-6">{agent.desc}</p>
              
              <div className="border-t border-slate-200/50 pt-6">
                <h4 className="text-sm font-semibold text-[#030B2E] mb-3 uppercase tracking-wider">Key Capabilities</h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {agent.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2 text-sm text-[#475569]">
                      <span className="text-emerald-500 font-bold">✓</span>
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Feature Highlights */}
        <div className="glass-card rounded-3xl p-8 sm:p-12 border border-blue-500/10 mb-16 text-center max-w-4xl mx-auto">
          <h2 className="text-3xl font-extrabold text-[#030B2E] mb-4">
            Custom Persona & Accent Tuning
          </h2>
          <p className="text-[#475569] leading-relaxed max-w-2xl mx-auto mb-8">
            Choose from over 100+ highly realistic, human-like male and female voices. Customize the speaking speed, friendliness level, and matching regional accents to perfectly reflect your brand identity.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div className="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
              <span className="block text-3xl font-bold text-blue-600 mb-1">100+</span>
              <span className="text-xs font-semibold text-[#475569] uppercase tracking-wider">Voices</span>
            </div>
            <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
              <span className="block text-3xl font-bold text-emerald-600 mb-1">20+</span>
              <span className="text-xs font-semibold text-[#475569] uppercase tracking-wider">Languages</span>
            </div>
            <div className="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
              <span className="block text-3xl font-bold text-blue-600 mb-1">&lt; 1.2s</span>
              <span className="text-xs font-semibold text-[#475569] uppercase tracking-wider">Latency</span>
            </div>
            <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
              <span className="block text-3xl font-bold text-emerald-600 mb-1">24/7</span>
              <span className="text-xs font-semibold text-[#475569] uppercase tracking-wider">Availability</span>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Agents;
