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
    gradient: 'from-blue-500/5 to-blue-600/5',
    border: 'border-slate-200',
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
    gradient: 'from-blue-500/10 to-emerald-500/10',
    border: 'border-emerald-500',
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
    gradient: 'from-blue-600/5 to-emerald-500/5',
    border: 'border-slate-200',
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

export function Pricing() {
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
            ✦ PRICING OPTIONS
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#030B2E] tracking-tight mb-6">
            Simple, Transparent <span className="gradient-text">Pricing Plans</span>
          </h1>
          <p className="text-lg text-[#475569] leading-relaxed">
            Choose the perfect plan for your calling volume. No hidden fees. Upgrade or downgrade anytime.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 items-stretch">
          {PLANS.map((plan, index) => (
            <div
              key={plan.name}
              className={`glass-card rounded-3xl p-8 border ${plan.popular ? 'border-2 ring-4 ring-emerald-500/10' : ''} ${plan.border} bg-gradient-to-br ${plan.gradient} flex flex-col justify-between card-hover relative`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {plan.popular && (
                <span className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 px-4 py-1 rounded-full text-xs font-bold text-white bg-emerald-500 uppercase tracking-widest">
                  Most Popular
                </span>
              )}
              
              <div>
                <h3 className="text-2xl font-bold text-[#030B2E] mb-2">{plan.name}</h3>
                <p className="text-sm text-[#475569] mb-6 min-h-[60px]">{plan.desc}</p>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-4xl sm:text-5xl font-black text-[#030B2E]">{plan.price}</span>
                  {plan.period && <span className="text-[#475569] text-sm">/ {plan.period}</span>}
                </div>
                
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-3 text-sm text-[#475569]">
                      <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                className={`w-full py-3 rounded-xl font-bold transition-all duration-200 border cursor-pointer ${
                  plan.popular
                    ? 'bg-gradient-to-r from-blue-600 to-emerald-500 text-white border-transparent hover:shadow-lg'
                    : 'bg-white text-blue-600 border-blue-500/30 hover:bg-blue-500/5'
                }`}
                onClick={() => {
                  const btn = document.querySelector('button[style*="var(--gg)"]') as HTMLButtonElement;
                  if (btn) btn.click();
                }}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Detailed Comparison Table */}
        <div className="glass-card rounded-3xl p-6 sm:p-10 border border-blue-500/10 overflow-hidden">
          <h3 className="text-2xl font-bold text-[#030B2E] mb-8 text-center sm:text-left">Compare Plan Features</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-4 font-bold text-[#030B2E] text-sm sm:text-base pr-4">Feature</th>
                  <th className="py-4 font-bold text-[#030B2E] text-sm sm:text-base px-4">Starter</th>
                  <th className="py-4 font-bold text-[#030B2E] text-sm sm:text-base px-4">Pro</th>
                  <th className="py-4 font-bold text-[#030B2E] text-sm sm:text-base pl-4">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {COMPARISON.map((row) => (
                  <tr key={row.feature} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 font-medium text-[#030B2E] text-sm sm:text-base pr-4">{row.feature}</td>
                    <td className="py-4 text-[#475569] text-sm sm:text-base px-4">{row.starter}</td>
                    <td className="py-4 text-[#475569] text-sm sm:text-base px-4 font-medium">{row.pro}</td>
                    <td className="py-4 text-[#475569] text-sm sm:text-base pl-4">{row.enterprise}</td>
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
