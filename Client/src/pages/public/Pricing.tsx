import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'Agents', href: '/agents' },
  { label: 'Case Studies', href: '/case-studies' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'News', href: '/news' },
];

const PLANS = [
  {
    name: 'Free',
    icon: '💬',
    iconBg: 'rgba(100,116,139,0.15)',
    price: '₹0',
    period: 'forever',
    badge: 'ALWAYS FREE',
    desc: 'For individuals & small projects testing the waters.',
    features: [
      '1 chatbot',
      '100 conversations / month',
      'Website embed',
      'Basic FAQ & lead capture',
      'WhatsApp not included',
      'Branding visible',
    ],
    cta: 'Get started free',
    popular: false,
    checkColor: '#64748b',
    border: '1px solid rgba(255,255,255,0.12)',
    bg: 'rgba(255,255,255,0.04)',
    glow: 'none',
  },
  {
    name: 'Starter',
    icon: '🚀',
    iconBg: 'rgba(37,99,235,0.15)',
    price: '₹3,499',
    period: '/month',
    desc: 'Freelancers & small businesses getting serious.',
    features: [
      '3 chatbots',
      '1,000 conversations / month',
      'WhatsApp + website',
      'Hindi & Hinglish support',
      'Remove branding',
      'No CRM integration',
    ],
    cta: 'Start 14-day trial',
    popular: false,
    checkColor: '#2563EB',
    border: '1px solid rgba(255,255,255,0.12)',
    bg: 'rgba(255,255,255,0.04)',
    glow: 'none',
  },
  {
    name: 'Growth',
    icon: '📈',
    iconBg: 'rgba(16,185,129,0.15)',
    price: '₹9,999',
    period: '/month',
    badge: 'MOST POPULAR',
    desc: 'SMBs scaling support, sales & engagement.',
    features: [
      '10 chatbots',
      '5,000 conversations / month',
      'All channels incl. Instagram',
      '10+ Indian languages',
      'CRM & helpdesk integrations',
      'Full analytics dashboard',
    ],
    cta: 'Start 14-day trial',
    popular: true,
    checkColor: '#10B981',
    border: '2px solid rgba(16,185,129,0.5)',
    bg: 'rgba(16,185,129,0.06)',
    glow: '0 0 60px rgba(16,185,129,0.2)',
  },
  {
    name: 'Enterprise',
    icon: '🏢',
    iconBg: 'rgba(139,92,246,0.15)',
    price: 'Custom',
    period: '',
    badge: 'CUSTOM',
    desc: 'Large businesses, compliance & custom AI.',
    features: [
      'Unlimited chatbots',
      'Unlimited conversations',
      'Custom AI model training',
      'DPDP Act 2023 compliance',
      'India-region cloud hosting',
      'Dedicated account manager',
    ],
    cta: 'Contact sales →',
    popular: false,
    checkColor: '#8b5cf6',
    border: '1px solid rgba(255,255,255,0.12)',
    bg: 'rgba(255,255,255,0.04)',
    glow: 'none',
  },
];

const USP_ITEMS = [
  'AI-Powered Voice Agents',
  'No Long-Term Contracts',
  '20+ Languages Supported',
  'Setup in 24 Hours',
  'Human Handoff Available',
  '99.9% Uptime SLA',
  'CRM Integrations',
  'Real-Time Analytics',
];

/* ─── USP Slider ─── */
function USPSlider() {
  const [cur, setCur] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setCur((c) => (c + 1) % USP_ITEMS.length), 4000);
    return () => clearInterval(t);
  }, []);
  return (
    <div
      className="fixed top-0 left-0 right-0 z-[60] h-9 flex items-center justify-center gap-2 overflow-hidden border-b border-blue-600/30"
      style={{ background: 'linear-gradient(90deg,#0f2060,#0d1f4e,#0f2060)' }}
    >
      <span className="text-[10px] sm:text-[11px] text-white/80 font-medium truncate max-w-[85vw]">
        ✦ {USP_ITEMS[cur]}
      </span>
    </div>
  );
}

/* ─── Stars ─── */
function Stars() {
  const stars = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    x: ((i * 137.508) % 100),
    y: ((i * 97.3) % 100),
    r: (i % 3) * 0.6 + 0.5,
    op: (i % 5) * 0.08 + 0.1,
    dur: (i % 4) + 3,
  }));
  return (
    <svg
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      xmlns="http://www.w3.org/2000/svg"
    >
      {stars.map((s) => (
        <circle key={s.id} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} fill="white" opacity={s.op}>
          <animate
            attributeName="opacity"
            values={`${s.op};${s.op * 0.2};${s.op}`}
            dur={`${s.dur}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}
    </svg>
  );
}

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
        background: 'rgba(3,11,46,0.9)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(37,99,235,0.15)',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-[68px] flex items-center justify-between">
        {/* Logo */}
        <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <img src="/logo-autoniv.png" alt="Autoniv" className="h-20 sm:h-28 w-auto object-contain" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className="text-sm font-semibold transition-colors relative"
              style={{ color: location.pathname === item.href ? '#10B981' : 'rgba(255,255,255,0.6)' }}
              onMouseEnter={(e) => {
                if (location.pathname !== item.href) e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                if (location.pathname !== item.href)
                  e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
              }}
            >
              {item.label}
              {location.pathname === item.href && (
                <span
                  className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full"
                  style={{ background: '#10B981' }}
                />
              )}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/"
            className="px-4 py-2 text-sm font-medium rounded-lg transition-all"
            style={{ color: 'rgba(255,255,255,0.7)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#fff';
              e.currentTarget.style.background = 'rgba(37,99,235,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            Sign In
          </Link>
          <Link
            to="/"
            className="px-5 py-2.5 text-sm font-bold text-white rounded-full flex items-center gap-2 transition-all"
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
            Get Started →
          </Link>
        </div>

        {/* Mobile burger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2"
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}
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

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div
          className="md:hidden px-5 py-4 space-y-1"
          style={{
            background: 'rgba(3,11,46,0.98)',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(37,99,235,0.12)',
          }}
        >
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 text-sm font-semibold rounded-xl"
              style={{
                color: location.pathname === item.href ? '#10B981' : 'rgba(255,255,255,0.7)',
                background:
                  location.pathname === item.href ? 'rgba(16,185,129,0.1)' : 'transparent',
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
              style={{ color: 'rgba(255,255,255,0.7)' }}
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

/* ─── Wave decoration (left) ─── */
function WaveDecor() {
  return (
    <div
      className="absolute left-0 top-[200px] pointer-events-none z-0 hidden lg:block"
      style={{ width: 220, opacity: 0.7 }}
    >
      <svg viewBox="0 0 220 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        {[0, 1, 2, 3, 4].map((i) => (
          <path
            key={i}
            d={`M${-10 + i * 6},100 Q${30 + i * 8},${50 - i * 8} ${80 + i * 6},100 Q${130 + i * 4},${150 + i * 8} ${180 + i * 6},100`}
            stroke={`rgba(37,99,235,${0.6 - i * 0.1})`}
            strokeWidth={2 - i * 0.2}
            fill="none"
          />
        ))}
        {/* Vertical lines */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <line
            key={`v${i}`}
            x1={10 + i * 30}
            y1={20}
            x2={10 + i * 30}
            y2={180}
            stroke="rgba(37,99,235,0.15)"
            strokeWidth="1"
          />
        ))}
      </svg>
    </div>
  );
}

/* ─── Planet decoration (right) ─── */
function PlanetDecor() {
  return (
    <div
      className="absolute right-0 top-[150px] pointer-events-none z-0 hidden lg:block"
      style={{ width: 220, height: 220, opacity: 0.85 }}
    >
      <svg viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="planetGrad" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#1565c0" />
            <stop offset="45%" stopColor="#0d47a1" />
            <stop offset="100%" stopColor="#010d26" />
          </radialGradient>
          <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
          </radialGradient>
          <clipPath id="planetClip">
            <circle cx="110" cy="110" r="80" />
          </clipPath>
        </defs>
        {/* Outer glow */}
        <circle cx="110" cy="110" r="105" fill="url(#glowGrad)" />
        {/* Planet body */}
        <circle cx="110" cy="110" r="80" fill="url(#planetGrad)" />
        {/* Grid lines */}
        {[60, 80, 100, 120, 140, 160].map((y, i) => (
          <line
            key={i}
            x1="30"
            y1={y}
            x2="190"
            y2={y}
            stroke="rgba(16,185,129,0.15)"
            strokeWidth="1"
            clipPath="url(#planetClip)"
          />
        ))}
        {[60, 80, 100, 120, 140, 160].map((x, i) => (
          <line
            key={`v${i}`}
            x1={x}
            y1="30"
            x2={x}
            y2="190"
            stroke="rgba(16,185,129,0.15)"
            strokeWidth="1"
            clipPath="url(#planetClip)"
          />
        ))}
        {/* Highlight */}
        <ellipse cx="85" cy="80" rx="28" ry="18" fill="rgba(255,255,255,0.08)" />
        {/* Ring */}
        <ellipse cx="110" cy="115" rx="105" ry="22" stroke="rgba(16,185,129,0.4)" strokeWidth="2" fill="none" />
        {/* Dots on ring */}
        {[0, 1, 2].map((i) => (
          <circle
            key={i}
            cx={110 + Math.cos((i * Math.PI * 2) / 3) * 100}
            cy={115 + Math.sin((i * Math.PI * 2) / 3) * 20}
            r="3"
            fill="#10B981"
            opacity="0.6"
          />
        ))}
      </svg>
    </div>
  );
}

/* ─── Value props bar ─── */
function ValuePropsBar() {
  const props = [
    { icon: '⚡', title: 'Setup in 24 Hours', sub: 'Get started quickly' },
    { icon: '🛡️', title: 'No Long-Term Contracts', sub: 'Cancel or change anytime' },
    { icon: '🌐', title: '20+ Languages Supported', sub: 'Global communication' },
    { icon: '🎧', title: 'Human Handoff Available', sub: 'Seamless escalation' },
  ];
  return (
    <div
      className="max-w-6xl mx-auto px-4 sm:px-6 mb-10 sm:mb-14"
    >
      <div
        className="grid grid-cols-2 md:grid-cols-4 gap-4 rounded-2xl p-5 sm:p-6"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(12px)',
        }}
      >
        {props.map((p, i) => (
          <div key={i} className="flex items-center gap-3">
            <div
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-lg sm:text-xl flex-shrink-0"
              style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.2)' }}
            >
              {p.icon}
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-white leading-tight">{p.title}</div>
              <div className="text-[10px] sm:text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {p.sub}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Social proof ─── */
function SocialProof() {
  const avatars = ['👨‍💼', '👩‍💼', '👨‍🔬', '👩‍🔬', '🧑‍💻'];
  return (
    <div
      className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-16 py-6"
      style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
    >
      {/* Trusted by */}
      <div className="flex items-center gap-4">
        <div className="flex -space-x-2">
          {avatars.map((a, i) => (
            <div
              key={i}
              className="w-9 h-9 rounded-full flex items-center justify-center text-base border-2 border-[#030B2E]"
              style={{ background: `hsl(${210 + i * 20},60%,30%)` }}
            >
              {a}
            </div>
          ))}
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-[#030B2E]"
            style={{ background: '#2563EB' }}
          >
            100+
          </div>
        </div>
        <div>
          <div className="text-sm font-bold text-white">Trusted by 100+ Businesses</div>
          <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Across industries worldwide
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="hidden sm:block w-px h-10" style={{ background: 'rgba(255,255,255,0.1)' }} />

      {/* Rating */}
      <div className="flex items-center gap-3">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <span key={i} className="text-xl" style={{ color: i <= 4 ? '#FBBF24' : '#FBBF24', opacity: i === 5 ? 0.5 : 1 }}>
              ★
            </span>
          ))}
        </div>
        <div>
          <div className="text-sm font-bold text-white">4.9/5 Customer Rating</div>
          <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Based on real customer reviews
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main export ─── */
export function Pricing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div
      className="min-h-screen relative overflow-x-hidden"
      style={{
        background: 'linear-gradient(160deg, #030B2E 0%, #051530 40%, #030f28 70%, #020a1e 100%)',
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        color: '#fff',
      }}
    >
      <Stars />

      {/* Glow blobs */}
      <div
        className="fixed pointer-events-none z-0"
        style={{
          top: '-15%',
          left: '-10%',
          width: 700,
          height: 700,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 65%)',
        }}
      />
      <div
        className="fixed pointer-events-none z-0"
        style={{
          top: '30%',
          right: '-15%',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 65%)',
        }}
      />

      <USPSlider />
      <Nav mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

      <div className="relative z-10 pt-[130px] pb-20">

        {/* ── Hero ── */}
        <div className="relative text-center max-w-3xl mx-auto mb-14 sm:mb-20 px-4 sm:px-6">
          <WaveDecor />
          <PlanetDecor />

          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold tracking-[0.12em] mb-5"
            style={{
              background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.3)',
              color: '#34D399',
            }}
          >
            ✦ SIMPLE, TRANSPARENT &amp; SCALABLE
          </div>

          <h1
            className="text-4xl sm:text-6xl font-black leading-[1.1] mb-5"
            style={{ color: '#fff', letterSpacing: '-0.02em' }}
          >
            Pricing That Scales
            <br />
            <span
              style={{
                background: 'linear-gradient(135deg,#2563EB 0%,#10B981 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              With Your Business
            </span>
          </h1>

          <p className="text-sm sm:text-lg leading-relaxed max-w-lg mx-auto" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Powerful AI voice agents. Flexible plans. No hidden fees.
            <br />
            Choose the plan that's right for you.
          </p>
        </div>

        {/* ── Pricing Cards ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 mb-12 sm:mb-16 items-stretch">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className="rounded-2xl sm:rounded-3xl p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden transition-all duration-300"
              style={{
                background: plan.bg,
                border: plan.border,
                backdropFilter: 'blur(12px)',
                boxShadow: plan.glow,
              }}
            >
              {/* Most popular badge */}
              {plan.popular && (
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 px-5 py-1 rounded-b-xl text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-1.5"
                  style={{ background: 'linear-gradient(135deg,#2563EB,#10B981)' }}
                >
                  ★ MOST POPULAR
                </div>
              )}

              <div className={plan.popular ? 'pt-5' : ''}>
                {/* Icon + Name */}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
                    style={{ background: plan.iconBg }}
                  >
                    {plan.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-white">{plan.name}</h3>
                    <p className="text-[11px] leading-tight max-w-[160px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      {plan.desc}
                    </p>
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-1 mt-5 mb-5">
                  <span
                    className="font-black leading-none"
                    style={{
                      fontSize: plan.price === 'Custom' ? '2.6rem' : '2.8rem',
                      color: '#fff',
                      letterSpacing: '-0.03em',
                    }}
                  >
                    {plan.price}
                  </span>
                  <span className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    {plan.period}
                  </span>
                </div>

                {/* Divider */}
                <div className="mb-5" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }} />

                {/* Features */}
                <ul className="space-y-3 mb-7">
                  {plan.features.map((feat) => (
                    <li
                      key={feat}
                      className="flex items-start gap-2.5 text-xs sm:text-sm"
                      style={{ color: 'rgba(255,255,255,0.65)' }}
                    >
                      <svg
                        className="w-4 h-4 flex-shrink-0 mt-0.5"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <circle cx="8" cy="8" r="7" fill={`${plan.checkColor}22`} />
                        <path
                          d="M5 8l2 2 4-4"
                          stroke={plan.checkColor}
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <button
                className="w-full py-3.5 rounded-xl font-bold transition-all duration-200 cursor-pointer text-sm flex items-center justify-center gap-2"
                style={{
                  background: plan.popular ? 'linear-gradient(135deg,#2563EB,#10B981)' : 'transparent',
                  color: plan.popular ? '#fff' : plan.checkColor,
                  border: plan.popular ? 'none' : `1.5px solid ${plan.checkColor}55`,
                  boxShadow: plan.popular ? '0 4px 24px rgba(16,185,129,0.3)' : 'none',
                }}
                onMouseEnter={(e) => {
                  if (!plan.popular) {
                    e.currentTarget.style.background = `${plan.checkColor}18`;
                  } else {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(16,185,129,0.45)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!plan.popular) {
                    e.currentTarget.style.background = 'transparent';
                  } else {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 24px rgba(16,185,129,0.3)';
                  }
                }}
              >
                {plan.cta} →
              </button>
            </div>
          ))}
        </div>

        {/* ── Value Props Bar ── */}
        <ValuePropsBar />

        {/* ── Social Proof ── */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-14">
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <SocialProof />
          </div>
        </div>

        {/* ── Comparison Table ── */}
        <div
          className="max-w-6xl mx-auto px-4 sm:px-6 rounded-2xl sm:rounded-3xl p-5 sm:p-10 overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <h3
            className="text-xl sm:text-2xl font-extrabold mb-7 text-center sm:text-left"
            style={{ color: '#fff' }}
          >
            Compare Plan Features
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th className="py-4 font-bold text-xs sm:text-sm pr-4" style={{ color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '11px' }}>
                    Feature
                  </th>
                  <th className="py-4 font-bold text-sm sm:text-base px-4" style={{ color: '#64748b' }}>
                    Free
                  </th>
                  <th className="py-4 font-bold text-sm sm:text-base px-4" style={{ color: '#fff' }}>
                    Starter
                  </th>
                  <th className="py-4 font-bold text-sm sm:text-base px-4" style={{ color: '#10B981' }}>
                    Growth
                  </th>
                  <th className="py-4 font-bold text-sm sm:text-base pl-4" style={{ color: '#fff' }}>
                    Enterprise
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Chatbots', free: '1', starter: '3', growth: '10', enterprise: 'Unlimited' },
                  { feature: 'Conversations / month', free: '100', starter: '1,000', growth: '5,000', enterprise: 'Unlimited' },
                  { feature: 'Channels', free: 'Website', starter: 'WhatsApp + Website', growth: 'All incl. Instagram', enterprise: 'All Channels' },
                  { feature: 'Languages', free: 'English', starter: 'Hindi & Hinglish', growth: '10+ Indian Languages', enterprise: 'All + Custom' },
                  { feature: 'Branding', free: 'Visible', starter: 'Removed', growth: 'Removed', enterprise: 'White Label' },
                  { feature: 'CRM Integration', free: 'No', starter: 'No', growth: 'Yes', enterprise: 'Custom' },
                  { feature: 'Analytics', free: 'Basic', starter: 'Standard', growth: 'Full Dashboard', enterprise: 'Advanced + API' },
                  { feature: 'Support', free: 'Community', starter: 'Email', growth: 'Priority', enterprise: 'Dedicated 24/7' },
                  { feature: 'DPDP Act 2023', free: '—', starter: '—', growth: '—', enterprise: '✓ Compliant' },
                  { feature: 'India-region hosting', free: '—', starter: '—', growth: '—', enterprise: '✓' },
                ].map((row) => (
                  <tr
                    key={row.feature}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.025)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <td className="py-3.5 font-medium text-xs sm:text-sm pr-4" style={{ color: 'rgba(255,255,255,0.8)' }}>
                      {row.feature}
                    </td>
                    <td className="py-3.5 text-xs sm:text-sm px-4" style={{ color: row.free === 'No' || row.free === '—' ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.45)' }}>
                      {row.free}
                    </td>
                    <td className="py-3.5 text-xs sm:text-sm px-4" style={{ color: row.starter === 'No' ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.55)' }}>
                      {row.starter}
                    </td>
                    <td className="py-3.5 text-xs sm:text-sm px-4 font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>
                      {row.growth}
                    </td>
                    <td className="py-3.5 text-xs sm:text-sm pl-4" style={{ color: 'rgba(255,255,255,0.55)' }}>
                      {row.enterprise}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Pricing;