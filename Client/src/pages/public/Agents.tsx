import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Footer from './Footer';

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

const AGENT_TYPES = [
  {
    icon: '📞',
    title: 'AI Receptionist',
    desc: 'Never miss another business call. Answers 24/7, handles general FAQs, filters spam, and forwards high-priority calls to your team.',
    features: ['Instant Call Routing', 'Custom Greeting Messages', 'Spam Filtering'],
    color: '#2563EB',
  },
  {
    icon: '📅',
    title: 'Appointment Scheduler',
    desc: 'Integrates directly with calendars (Google Calendar, Outlook, Calendly) to schedule, reschedule, or cancel client appointments on the call.',
    features: ['Real-Time Calendar Sync', 'SMS Confirmations', 'Follow-up Automation'],
    color: '#10B981',
  },
  {
    icon: '💡',
    title: 'FAQ Support Assistant',
    desc: 'Trained on your knowledge base, website, or custom documents. Answers detailed product and service questions with 99%+ accuracy.',
    features: ['Knowledge Base Training', 'Dynamic Responses', 'Context Preservation'],
    color: '#f97316',
  },
  {
    icon: '🎯',
    title: 'Lead Qualifier',
    desc: 'Engages inbound leads instantly. Asks qualifying questions, captures budgets and timelines, and syncs data to your CRM automatically.',
    features: ['CRM Auto-Sync', 'Custom Qualification Scripts', 'Sentiment Analysis'],
    color: '#8b5cf6',
  },
];

/* ─── USP Ticker ─── */
function USPSlider() {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setCurrent(i => (i + 1) % usps.length), 3000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="fixed top-0 inset-x-0 z-[60] overflow-hidden" style={{ background: 'linear-gradient(90deg,#030B2E 0%,#051a3a 50%,#030B2E 100%)', borderBottom: '1px solid rgba(16,185,129,0.2)', height: 36 }}>
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
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    r: Math.random() * 1.5 + 0.5, op: Math.random() * 0.5 + 0.1, dur: Math.random() * 4 + 3,
  }));
  return (
    <svg className="fixed inset-0 w-full h-full pointer-events-none z-0" xmlns="http://www.w3.org/2000/svg">
      {stars.map(s => (
        <circle key={s.id} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} fill="white" opacity={s.op}>
          <animate attributeName="opacity" values={`${s.op};${s.op * 0.2};${s.op}`} dur={`${s.dur}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </svg>
  );
}

/* ─── Nav ─── */
function Nav({ mobileMenuOpen, setMobileMenuOpen }: { mobileMenuOpen: boolean; setMobileMenuOpen: (v: boolean) => void }) {
  const location = useLocation();
  return (
    <nav className="fixed top-[36px] inset-x-0 z-50" style={{ background: 'rgba(3,11,46,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(37,99,235,0.15)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[68px] flex items-center justify-between">
        <Link to="/"><img src={LOGO_SRC} alt="Autoniv" className="h-20 sm:h-28 w-auto object-contain" /></Link>
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

/* ─── Agent Card ─── */
function AgentCard({ agent }: { agent: any }) {
  return (
    <div className="rounded-2xl sm:rounded-3xl p-5 sm:p-8 relative overflow-hidden transition-all duration-300" style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      backdropFilter: 'blur(12px)',
    }}
      onMouseEnter={e => { e.currentTarget.style.border = `${agent.color}44`; e.currentTarget.style.boxShadow = `0 20px 50px ${agent.color}15`; }}
      onMouseLeave={e => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center text-2xl sm:text-3xl" style={{ background: `${agent.color}15`, border: `1px solid ${agent.color}30` }}>
          {agent.icon}
        </div>
        <h3 className="text-lg sm:text-2xl font-extrabold" style={{ color: '#fff' }}>{agent.title}</h3>
      </div>
      <p className="text-sm sm:text-base leading-relaxed mb-5 sm:mb-6" style={{ color: 'rgba(255,255,255,0.55)' }}>{agent.desc}</p>
      <div className="border-t pt-5 sm:pt-6" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <h4 className="text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'rgba(255,255,255,0.35)' }}>Key Capabilities</h4>
        <div className="flex flex-wrap gap-2">
          {agent.features.map((feat: string) => (
            <span key={feat} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-semibold" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.65)' }}>
              <span style={{ color: agent.color }}>✓</span>{feat}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Main export ─── */
export function Agents() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen relative" style={{ background: 'linear-gradient(160deg, #030B2E 0%, #051530 40%, #030f28 70%, #020a1e 100%)', fontFamily: "'Plus Jakarta Sans',sans-serif", color: '#fff' }}>
      <Stars />

      {/* Glow blobs */}
      <div className="fixed pointer-events-none z-0" style={{ top: '-15%', left: '-10%', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 65%)' }} />
      <div className="fixed pointer-events-none z-0" style={{ top: '30%', right: '-15%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 65%)' }} />

      <USPSlider />
      <Nav mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

      <div className="relative z-10 pt-[140px] pb-16 sm:pb-24">
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-20 px-4 sm:px-6">
          <div className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold tracking-[0.1em] mb-4 sm:mb-5" style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.3)', color: '#60A5FA' }}>
            ✦ MEET OUR AGENTS
          </div>
          <h1 className="text-3xl sm:text-5xl font-black leading-tight mb-4 sm:mb-6" style={{ color: '#fff' }}>
            Intelligent <span style={{ background: 'linear-gradient(135deg,#2563EB,#10B981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>AI Voice Agents</span> Tailored to Your Business
          </h1>
          <p className="text-sm sm:text-lg leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Deploy specialized voice assistants that look up information, book calendar slots, and converse naturally in 20+ languages.
          </p>
        </div>

        {/* Agents Grid */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8 mb-16 sm:mb-24">
          {AGENT_TYPES.map((agent) => (
            <AgentCard key={agent.title} agent={agent} />
          ))}
        </div>

        {/* Feature Highlights */}
        <div className="max-w-4xl mx-auto mx-4 sm:mx-auto px-4 sm:px-6 rounded-2xl sm:rounded-3xl p-6 sm:p-12 text-center relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)' }}>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3 sm:mb-4" style={{ color: '#fff' }}>
            Custom Persona & Accent Tuning
          </h2>
          <p className="text-sm sm:text-base leading-relaxed max-w-2xl mx-auto mb-8 sm:mb-10" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Choose from over 100+ highly realistic, human-like male and female voices. Customize the speaking speed, friendliness level, and matching regional accents to perfectly reflect your brand identity.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
            {[
              { value: '100+', label: 'Voices', color: '#2563EB' },
              { value: '20+', label: 'Languages', color: '#10B981' },
              { value: '< 1.2s', label: 'Latency', color: '#2563EB' },
              { value: '24/7', label: 'Availability', color: '#10B981' },
            ].map(s => (
              <div key={s.label} className="p-3 sm:p-4 rounded-xl sm:rounded-2xl" style={{ background: `${s.color}10`, border: `1px solid ${s.color}25` }}>
                <div className="text-xl sm:text-3xl font-black mb-1" style={{ color: s.color }}>{s.value}</div>
                <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.45)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Agents;
