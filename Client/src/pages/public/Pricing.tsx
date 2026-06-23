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

const PLANS = [
  {
    name: 'Starter',
    price: '₹4,999',
    period: 'month',
    desc: 'Perfect for small businesses looking to automate basic inbound FAQs and simple appointment routing.',
    features: [
      '1 AI Voice Agent',
      '500 Outbound/Inbound Minutes/mo',
      '5 Supported Languages',
      'Choose from 10 Default Voices',
      'Standard Web Dashboard',
      'Email Customer Support',
    ],
    cta: 'Get Started Free',
    popular: false,
    color: '#2563EB',
  },
  {
    name: 'Pro',
    price: '₹12,999',
    period: 'month',
    desc: 'Our most popular plan. Designed for growing companies that require deep CRM integrations and outbound lead qualification.',
    features: [
      '3 AI Voice Agents',
      '1,500 Outbound/Inbound Minutes/mo',
      'All 20+ Languages Supported',
      'Access to all 100+ Premium Voices',
      'Full CRM & HubSpot Integrations',
      'Custom Script & Dialogue Editor',
      'API Access & Webhook Integrations',
      'Priority Email & Chat Support',
    ],
    cta: 'Start Pro Trial',
    popular: true,
    color: '#10B981',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'tailored',
    desc: 'For high-volume operations requiring dedicated instances, custom voice cloning, and custom SLA agreements.',
    features: [
      'Unlimited AI Voice Agents',
      'Customized Minute Bundles',
      'Dedicated Instance Hosting',
      'Custom Voice Cloning & Accents',
      'SLA & Uptime Commitments',
      'Dedicated Account Manager',
      '24/7 Telephone Support',
    ],
    cta: 'Contact Sales',
    popular: false,
    color: '#8b5cf6',
  },
];

const COMPARISON = [
  { feature: 'Supported Agents', starter: '1 Agent', pro: '3 Agents', enterprise: 'Unlimited' },
  { feature: 'Included Minutes', starter: '500 min', pro: '1,500 min', enterprise: 'Custom' },
  { feature: 'Languages', starter: '5 Languages', pro: '20+ Languages', enterprise: 'All + Custom' },
  { feature: 'Voice Library', starter: '10 Standard', pro: '100+ Premium', enterprise: '100+ & Voice Cloning' },
  { feature: 'CRM Integration', starter: 'No', pro: 'Yes', enterprise: 'Custom Integrations' },
  { feature: 'Script Editor', starter: 'Basic', pro: 'Advanced Dynamic', enterprise: 'Fully Custom' },
  { feature: 'API & Webhooks', starter: 'No', pro: 'Yes', enterprise: 'Full API Access' },
  { feature: 'Customer Support', starter: 'Email', pro: 'Priority Email/Chat', enterprise: 'Dedicated 24/7 Support' },
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
        <Link to="/"><img src={LOGO_SRC} alt="Autoniv" className="h-28 sm:h-30 w-auto object-contain" /></Link>
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

/* ─── Main export ─── */
export function Pricing() {
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
          <div className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold tracking-[0.1em] mb-4 sm:mb-5" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#34D399' }}>
            ✦ PRICING OPTIONS
          </div>
          <h1 className="text-3xl sm:text-5xl font-black leading-tight mb-4 sm:mb-6" style={{ color: '#fff' }}>
            Simple, Transparent{' '}
            <span style={{ background: 'linear-gradient(135deg,#2563EB,#10B981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Pricing Plans</span>
          </h1>
          <p className="text-sm sm:text-lg leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Choose the perfect plan for your calling volume. No hidden fees. Upgrade or downgrade anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8 mb-16 sm:mb-24 items-stretch">
          {PLANS.map((plan) => (
            <div key={plan.name} className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden transition-all duration-300" style={{
              background: plan.popular ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.04)',
              border: plan.popular ? '2px solid rgba(16,185,129,0.4)' : '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(12px)',
              boxShadow: plan.popular ? '0 0 40px rgba(16,185,129,0.15)' : 'none',
            }}>
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 px-4 py-1 rounded-b-xl text-[10px] sm:text-xs font-bold text-white uppercase tracking-widest" style={{ background: 'linear-gradient(135deg,#2563EB,#10B981)' }}>
                  Most Popular
                </div>
              )}
              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold mb-2" style={{ color: '#fff' }}>{plan.name}</h3>
                <p className="text-xs sm:text-sm leading-relaxed mb-5 sm:mb-6 min-h-[50px] sm:min-h-[60px]" style={{ color: 'rgba(255,255,255,0.45)' }}>{plan.desc}</p>
                <div className="flex items-baseline gap-1 mb-6 sm:mb-8">
                  <span className="text-3xl sm:text-5xl font-black" style={{ color: '#fff' }}>{plan.price}</span>
                  {plan.period && <span className="text-xs sm:text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>/ {plan.period}</span>}
                </div>
                <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                  {plan.features.map(feat => (
                    <li key={feat} className="flex items-start gap-2.5 text-xs sm:text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      <span className="font-bold mt-0.5" style={{ color: plan.color }}>✓</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button className="w-full py-3 rounded-xl font-bold transition-all duration-200 cursor-pointer text-sm sm:text-base" style={{
                background: plan.popular ? 'linear-gradient(135deg,#2563EB,#10B981)' : 'transparent',
                color: plan.popular ? '#fff' : plan.color,
                border: plan.popular ? 'none' : `1px solid ${plan.color}44`,
              }}
                onMouseEnter={e => { if (!plan.popular) e.currentTarget.style.background = `${plan.color}15`; }}
                onMouseLeave={e => { if (!plan.popular) e.currentTarget.style.background = 'transparent'; }}
              >{plan.cta}</button>
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 rounded-2xl sm:rounded-3xl p-5 sm:p-10 overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)' }}>
          <h3 className="text-xl sm:text-2xl font-extrabold mb-6 sm:mb-8 text-center sm:text-left" style={{ color: '#fff' }}>Compare Plan Features</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                  <th className="py-3 sm:py-4 font-bold text-xs sm:text-base pr-4" style={{ color: '#fff' }}>Feature</th>
                  <th className="py-3 sm:py-4 font-bold text-xs sm:text-base px-4" style={{ color: '#fff' }}>Starter</th>
                  <th className="py-3 sm:py-4 font-bold text-xs sm:text-base px-4" style={{ color: '#10B981' }}>Pro</th>
                  <th className="py-3 sm:py-4 font-bold text-xs sm:text-base pl-4" style={{ color: '#fff' }}>Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map(row => (
                  <tr key={row.feature} className="border-b transition-colors" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                    <td className="py-3 sm:py-4 font-medium text-xs sm:text-base pr-4" style={{ color: 'rgba(255,255,255,0.8)' }}>{row.feature}</td>
                    <td className="py-3 sm:py-4 text-xs sm:text-base px-4" style={{ color: 'rgba(255,255,255,0.45)' }}>{row.starter}</td>
                    <td className="py-3 sm:py-4 text-xs sm:text-base px-4 font-medium" style={{ color: 'rgba(255,255,255,0.65)' }}>{row.pro}</td>
                    <td className="py-3 sm:py-4 text-xs sm:text-base pl-4" style={{ color: 'rgba(255,255,255,0.45)' }}>{row.enterprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Pricing;
