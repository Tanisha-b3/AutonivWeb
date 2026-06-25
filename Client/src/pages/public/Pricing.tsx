import { useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from './Footer';
import { USPSlider } from './sections/USPSlider';
import { PublicNavbar } from '../../components/PublicNavbar';

/* ─── Nav (matching Agents component) ─── */


const chatPlans = [
  {
    name: 'Free', icon: '💬', iconBg: 'rgba(100,116,139,0.12)',
    price: '₹0', period: 'forever', badge: 'ALWAYS FREE',
    desc: 'For individuals & small projects testing the waters.',
    features: ['1 chatbot','100 conversations / month','Website embed','Basic FAQ & lead capture','WhatsApp not included','Branding visible'],
    cta: 'Get started free', popular: false, checkColor: '#64748b',
    border: '1px solid rgba(37,99,235,0.08)', bg: '#ffffff',
    shadow: '0 4px 20px rgba(0,0,0,0.04)', hoverShadow: '0 8px 40px rgba(0,0,0,0.08)',
  },
  {
    name: 'Starter', icon: '🚀', iconBg: 'rgba(37,99,235,0.10)',
    price: '₹3,499', period: '/month', badge: null,
    desc: 'Freelancers & small businesses getting serious.',
    features: ['3 chatbots','1,000 conversations / month','WhatsApp + website','Hindi & Hinglish support','Remove branding','CRM integration'],
    cta: 'Start 14-day trial', popular: false, checkColor: '#2563EB',
    border: '1px solid rgba(37,99,235,0.12)', bg: '#ffffff',
    shadow: '0 4px 20px rgba(0,0,0,0.04)', hoverShadow: '0 8px 40px rgba(0,0,0,0.08)',
  },
  {
    name: 'Growth', icon: '📈', iconBg: 'rgba(16,185,129,0.10)',
    price: '₹9,999', period: '/month', badge: 'MOST POPULAR',
    desc: 'SMBs scaling support, sales & engagement.',
    features: ['10 chatbots','5,000 conversations / month','All channels incl. Instagram','10+ Indian languages','CRM & helpdesk integrations','Full analytics dashboard'],
    cta: 'Start 14-day trial', popular: true, checkColor: '#10B981',
    border: '2px solid #10B981', bg: '#ffffff',
    shadow: '0 8px 30px rgba(16,185,129,0.15)', hoverShadow: '0 12px 48px rgba(16,185,129,0.25)',
  },
  {
    name: 'Enterprise', icon: '🏢', iconBg: 'rgba(139,92,246,0.10)',
    price: 'Custom', period: '', badge: 'CUSTOM',
    desc: 'Large businesses, compliance & custom AI.',
    features: ['Unlimited chatbots','Unlimited conversations','Custom AI model training','DPDP Act 2023 compliance','India-region cloud hosting','Dedicated account manager'],
    cta: 'Contact sales →', popular: false, checkColor: '#8b5cf6',
    border: '1px solid rgba(37,99,235,0.08)', bg: '#ffffff',
    shadow: '0 4px 20px rgba(0,0,0,0.04)', hoverShadow: '0 8px 40px rgba(0,0,0,0.08)',
  },
];

const voicePlans = [
  {
    name: 'Free', icon: '🎙️', iconBg: 'rgba(100,116,139,0.12)',
    price: '₹0', period: 'forever', badge: 'ALWAYS FREE',
    desc: 'Try voice agents with basic capabilities.',
    features: ['1 voice agent','50 voice minutes / month','Website embed','Basic call routing','Call recording not included','Custom voice model not included'],
    cta: 'Get started free', popular: false, checkColor: '#64748b',
    border: '1px solid rgba(37,99,235,0.08)', bg: '#ffffff',
    shadow: '0 4px 20px rgba(0,0,0,0.04)', hoverShadow: '0 8px 40px rgba(0,0,0,0.08)',
  },
  {
    name: 'Starter', icon: '🎤', iconBg: 'rgba(37,99,235,0.10)',
    price: '₹4,999', period: '/month', badge: null,
    desc: 'For businesses ready to automate phone support.',
    features: ['3 voice agents','500 voice minutes / month','Dedicated phone number','Hindi, English & Hinglish','Call recording & logs','CRM integration'],
    cta: 'Start 14-day trial', popular: false, checkColor: '#2563EB',
    border: '1px solid rgba(37,99,235,0.12)', bg: '#ffffff',
    shadow: '0 4px 20px rgba(0,0,0,0.04)', hoverShadow: '0 8px 40px rgba(0,0,0,0.08)',
  },
  {
    name: 'Growth', icon: '📞', iconBg: 'rgba(16,185,129,0.10)',
    price: '₹12,999', period: '/month', badge: 'MOST POPULAR',
    desc: 'For SMBs scaling phone support & outreach.',
    features: ['10 voice agents','3,000 voice minutes / month','Multiple phone numbers','10+ Indian languages','CRM & helpdesk integrations','Full analytics dashboard'],
    cta: 'Start 14-day trial', popular: true, checkColor: '#10B981',
    border: '2px solid #10B981', bg: '#ffffff',
    shadow: '0 8px 30px rgba(16,185,129,0.15)', hoverShadow: '0 12px 48px rgba(16,185,129,0.25)',
  },
  {
    name: 'Enterprise', icon: '🏢', iconBg: 'rgba(139,92,246,0.10)',
    price: 'Custom', period: '', badge: 'CUSTOM',
    desc: 'For large call centers & custom compliance needs.',
    features: ['Unlimited voice agents','Unlimited voice minutes','Custom voice AI training','DPDP Act 2023 compliance','India-region cloud hosting','Dedicated account manager'],
    cta: 'Contact sales →', popular: false, checkColor: '#8b5cf6',
    border: '1px solid rgba(37,99,235,0.08)', bg: '#ffffff',
    shadow: '0 4px 20px rgba(0,0,0,0.04)', hoverShadow: '0 8px 40px rgba(0,0,0,0.08)',
  },
];

/* ─── FAQ Item ─── */
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="rounded-xl overflow-hidden transition-all duration-300"
      style={{
        background: open ? '#f8fafc' : '#ffffff',
        border: `1px solid ${open ? '#2563EB' : 'rgba(37,99,235,0.08)'}`,
        boxShadow: open ? '0 4px 20px rgba(37,99,235,0.06)' : 'none',
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

/* ─── Why Choose Us ─── */
function WhyChooseUs() {
  const benefits = [
    { icon: '🇮🇳', title: 'Made for India', desc: 'Hindi, Tamil, Telugu, Bengali, Marathi and more — with region-appropriate accents and cultural context.', color: '#2563EB' },
    { icon: '⚡', title: 'Live in 24 Hours', desc: 'Onboarding in under a day. No 3-week enterprise sales cycles. Plug in your number and start receiving calls.', color: '#10B981' },
    { icon: '🔒', title: 'DPDP Act 2023 Ready', desc: 'Full compliance with India\'s data protection law. Your customer data stays in India-region cloud.', color: '#8b5cf6' },
    { icon: '💰', title: 'Transparent Pricing', desc: 'No hidden fees, no per-seat charges, no surprise bills. What you see is what you pay.', color: '#f97316' },
    { icon: '🤖', title: 'Human-Like AI', desc: 'Not robotic scripts. Natural conversations that qualify, convert, and book — just like your best agent.', color: '#ec4899' },
    { icon: '📊', title: 'Real-Time Insights', desc: 'Live dashboards with call transcripts, sentiment scores, conversion metrics, and custom reports.', color: '#06b6d4' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-14 sm:mb-20">
      <div className="text-center mb-10 sm:mb-12">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold tracking-[0.12em] mb-5"
          style={{
            background: 'rgba(37,99,235,0.08)',
            border: '1px solid rgba(37,99,235,0.2)',
            color: '#2563EB',
          }}
        >
          ✦ WHY US
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-[36px] font-black text-[#0a0a0a] mb-3">
          Why Businesses Choose{' '}
          <span
            style={{
              background: 'linear-gradient(135deg,#2563EB,#10B981)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Autoniv
          </span>
        </h2>
        <p className="text-sm sm:text-base" style={{ color: '#64748b', maxWidth: 520, margin: '0 auto' }}>
          Built for India. Designed for scale. Trusted by 500+ businesses across the country.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {benefits.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl p-6 transition-all duration-300 group hover:-translate-y-1"
            style={{
              background: '#ffffff',
              border: '1px solid rgba(37,99,235,0.06)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 transition-transform group-hover:scale-110"
              style={{ background: `${item.color}10`, border: `1px solid ${item.color}20` }}
            >
              {item.icon}
            </div>
            <h3 className="text-sm font-extrabold text-[#0a0a0a] mb-2">{item.title}</h3>
            <p className="text-xs leading-relaxed" style={{ color: '#64748b' }}>{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Value Props Bar ─── */
function ValuePropsBar() {
  const props = [
    { icon: '⚡', title: 'Setup in 24 Hours', sub: 'Get started quickly' },
    { icon: '🛡️', title: 'No Long-Term Contracts', sub: 'Cancel or change anytime' },
    { icon: '🌐', title: '20+ Languages Supported', sub: 'Global communication' },
    { icon: '🎧', title: 'Human Handoff Available', sub: 'Seamless escalation' },
  ];
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-10 sm:mb-14">
      <div
        className="grid grid-cols-2 md:grid-cols-4 gap-4 rounded-2xl p-5 sm:p-6"
        style={{
          background: '#ffffff',
          border: '1px solid rgba(37,99,235,0.06)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
        }}
      >
        {props.map((p, i) => (
          <div key={i} className="flex items-center gap-3">
            <div
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-lg sm:text-xl flex-shrink-0"
              style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}
            >
              {p.icon}
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-[#0a0a0a] leading-tight">{p.title}</div>
              <div className="text-[10px] sm:text-xs mt-0.5" style={{ color: '#94a3b8' }}>
                {p.sub}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Social Proof ─── */
function SocialProof() {
  const avatars = ['👨‍💼', '👩‍💼', '👨‍🔬', '👩‍🔬', '🧑‍💻'];
  return (
    <div
      className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-16 py-6"
      style={{ borderTop: '1px solid rgba(37,99,235,0.06)' }}
    >
      <div className="flex items-center gap-4">
        <div className="flex -space-x-2">
          {avatars.map((a, i) => (
            <div
              key={i}
              className="w-9 h-9 rounded-full flex items-center justify-center text-base border-2 border-white"
              style={{ background: `hsl(${210 + i * 20},60%,92%)` }}
            >
              {a}
            </div>
          ))}
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-white"
            style={{ background: '#2563EB' }}
          >
            100+
          </div>
        </div>
        <div>
          <div className="text-sm font-bold text-[#0a0a0a]">Trusted by 100+ Businesses</div>
          <div className="text-xs" style={{ color: '#94a3b8' }}>
            Across industries worldwide
          </div>
        </div>
      </div>

      <div className="hidden sm:block w-px h-10" style={{ background: 'rgba(37,99,235,0.08)' }} />

      <div className="flex items-center gap-3">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <span key={i} className="text-xl" style={{ color: i <= 4 ? '#FBBF24' : '#FBBF24', opacity: i === 5 ? 0.5 : 1 }}>
              ★
            </span>
          ))}
        </div>
        <div>
          <div className="text-sm font-bold text-[#0a0a0a]">4.9/5 Customer Rating</div>
          <div className="text-xs" style={{ color: '#94a3b8' }}>
            Based on real customer reviews
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Export ─── */
export function Pricing() {
  const [pricingMode, setPricingMode] = useState<'chat' | 'voice'>('chat');
  const plans = pricingMode === 'chat' ? chatPlans : voicePlans;

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

      <div style={{ paddingTop: 130, paddingBottom: 80 }}>
        {/* Hero */}
        <div className="relative text-center max-w-3xl mx-auto mb-14 sm:mb-20 px-4 sm:px-6">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold tracking-[0.12em] mb-5"
            style={{
              background: 'rgba(37,99,235,0.08)',
              border: '1px solid rgba(37,99,235,0.2)',
              color: '#2563EB',
            }}
          >
            ✦ SIMPLE, TRANSPARENT & SCALABLE
          </div>

          <h1
            className="text-4xl sm:text-6xl font-black leading-[1.1] mb-5"
            style={{ color: '#0a0a0a', letterSpacing: '-0.02em' }}
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

          <p className="text-sm sm:text-lg leading-relaxed max-w-lg mx-auto" style={{ color: '#64748b' }}>
            Powerful AI voice agents. Flexible plans. No hidden fees.
            <br />
            Choose the plan that's right for you.
          </p>
        </div>

        {/* Chat / Voice Toggle */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-0 bg-white border border-slate-200 rounded-full p-1 shadow-sm">
            <button onClick={() => setPricingMode('chat')} className={`px-6 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${pricingMode === 'chat' ? 'bg-gradient-to-r from-blue-600 to-emerald-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-800 bg-transparent'}`}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              Chat
            </button>
            <button onClick={() => setPricingMode('voice')} className={`px-6 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${pricingMode === 'voice' ? 'bg-gradient-to-r from-blue-600 to-emerald-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-800 bg-transparent'}`}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" /></svg>
              Voice
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div key={pricingMode} className="animate-fade-up max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 mb-12 sm:mb-16 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="rounded-2xl sm:rounded-3xl p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:-translate-y-1"
              style={{
                background: plan.bg,
                border: plan.border,
                boxShadow: plan.shadow,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = plan.hoverShadow;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = plan.shadow;
              }}
            >
              {plan.popular && (
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 px-5 py-1 rounded-b-xl text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-1.5"
                  style={{ background: 'linear-gradient(135deg,#2563EB,#10B981)' }}
                >
                  ★ MOST POPULAR
                </div>
              )}

              <div className={plan.popular ? 'pt-5' : ''}>
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
                    style={{ background: plan.iconBg }}
                  >
                    {plan.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-[#0a0a0a]">{plan.name}</h3>
                    <p className="text-[11px] leading-tight max-w-[160px]" style={{ color: '#94a3b8' }}>
                      {plan.desc}
                    </p>
                  </div>
                </div>

                <div className="flex items-baseline gap-1 mt-5 mb-5">
                  <span
                    className="font-black leading-none"
                    style={{
                      fontSize: plan.price === 'Custom' ? '2.6rem' : '2.8rem',
                      color: '#0a0a0a',
                      letterSpacing: '-0.03em',
                    }}
                  >
                    {plan.price}
                  </span>
                  <span className="text-sm" style={{ color: '#94a3b8' }}>
                    {plan.period}
                  </span>
                </div>

                <div className="mb-5" style={{ borderTop: '1px solid rgba(37,99,235,0.06)' }} />

                <ul className="space-y-3 mb-7">
                  {plan.features.map((feat) => (
                    <li
                      key={feat}
                      className="flex items-start gap-2.5 text-xs sm:text-sm"
                      style={{ color: '#475569' }}
                    >
                      <svg
                        className="w-4 h-4 flex-shrink-0 mt-0.5"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <circle cx="8" cy="8" r="7" fill={`${plan.checkColor}18`} />
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

              <button
                className="w-full py-3.5 rounded-xl font-bold transition-all duration-200 cursor-pointer text-sm flex items-center justify-center gap-2"
                style={{
                  background: plan.popular ? 'linear-gradient(135deg,#2563EB,#10B981)' : 'transparent',
                  color: plan.popular ? '#ffffff' : plan.checkColor,
                  border: plan.popular ? 'none' : `1.5px solid ${plan.checkColor}30`,
                }}
                onMouseEnter={(e) => {
                  if (!plan.popular) {
                    e.currentTarget.style.background = `${plan.checkColor}10`;
                  } else {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(16,185,129,0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!plan.popular) {
                    e.currentTarget.style.background = 'transparent';
                  } else {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                {plan.cta} →
              </button>
            </div>
          ))}
        </div>

        {/* Value Props Bar */}
        <ValuePropsBar />

        {/* Social Proof */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-14">
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: '#ffffff',
              border: '1px solid rgba(37,99,235,0.06)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            }}
          >
            <SocialProof />
          </div>
        </div>

        {/* Why Choose Us */}
        <WhyChooseUs />

        {/* FAQ */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 mb-14 sm:mb-20">
          <div className="text-center mb-10 sm:mb-12">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold tracking-[0.12em] mb-5"
              style={{
                background: 'rgba(37,99,235,0.08)',
                border: '1px solid rgba(37,99,235,0.2)',
                color: '#2563EB',
              }}
            >
              ✦ FAQ
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0a0a0a]">
              Frequently Asked{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg,#2563EB,#10B981)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Questions
              </span>
            </h2>
          </div>

          <div className="space-y-3">
            {[
              { q: 'What happens after the 14-day free trial?', a: 'You can choose to upgrade to a paid plan or stay on the Free plan. No credit card required to start the trial, and we\'ll never charge you without your consent.' },
              { q: 'Can I switch plans at any time?', a: 'Absolutely. Upgrade or downgrade anytime from your dashboard. When upgrading, you\'re billed the prorated difference. When downgrading, the credit applies to your next billing cycle.' },
              { q: 'What languages does the AI support?', a: 'Our AI Voice Agents support 20+ languages including Hindi, Tamil, Telugu, Bengali, Marathi, Kannada, Gujarati, and English — with region-appropriate accents for each.' },
              { q: 'Is my data secure and compliant?', a: 'Yes. We\'re SOC 2 Type II certified and fully compliant with India\'s DPDP Act 2023. All data is stored in India-region cloud infrastructure with end-to-end encryption.' },
              { q: 'Do you offer voice agent features in the Starter plan?', a: 'The Starter plan includes 500 voice agent calls per month with HD voice quality. For more calls and Ultra HD quality, upgrade to the Growth plan.' },
              { q: 'What integrations are available?', a: 'Free plan: website embed only. Starter: WhatsApp + website. Growth: all channels including Instagram, plus CRM integrations (HubSpot, Salesforce, Zoho). Enterprise: custom integrations via API.' },
              { q: 'How does the AI compare to a human agent?', a: 'Our AI handles 80% of routine calls with 98%+ accuracy. It qualifies leads, books appointments, answers FAQs, and escalates complex queries to human agents seamlessly.' },
              { q: 'Is there a setup fee?', a: 'No setup fees on any plan. The AI learns your business from uploaded documents and conversation history, so you can go live within hours, not weeks.' },
            ].map((faq) => (
              <FAQItem key={faq.q} question={faq.q} answer={faq.a} />
            ))}
          </div>
        </div>

        {/* CTA - Dark section matching Agents component */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div
            className="rounded-3xl p-10 sm:p-16 text-center relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg,#0a0a0a,#1a1a2e)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">Ready to Transform Your Business?</h2>
              <p className="text-sm sm:text-base mb-8" style={{ color: 'rgba(255,255,255,0.45)', maxWidth: 440, margin: '0 auto' }}>
                Join 500+ businesses using Autoniv AI Voice Agents to capture more leads and serve customers 24/7.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  to="/register"
                  className="px-8 py-4 rounded-full text-sm font-bold text-white border-none cursor-pointer transition-all hover:-translate-y-1 no-underline text-center"
                  style={{
                    background: 'linear-gradient(135deg,#2563EB,#10B981)',
                    boxShadow: '0 4px 24px rgba(16,185,129,0.3)',
                  }}
                >
                  Start Free Trial →
                </Link>
                <Link
                  to="/agents"
                  className="px-8 py-4 rounded-full text-sm font-bold text-white cursor-pointer transition-all hover:bg-white/10 no-underline text-center"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.15)',
                  }}
                >
                  Explore AI Agents →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-14">
          <div
            className="rounded-2xl sm:rounded-3xl p-5 sm:p-10 overflow-hidden"
            style={{
              background: '#ffffff',
              border: '1px solid rgba(37,99,235,0.06)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            }}
          >
            <h3
              className="text-xl sm:text-2xl font-extrabold mb-7 text-center sm:text-left"
              style={{ color: '#0a0a0a' }}
            >
              Compare Plan Features
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(37,99,235,0.08)' }}>
                    <th className="py-4 font-bold text-xs sm:text-sm pr-4" style={{ color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '11px' }}>
                      Feature
                    </th>
                    <th className="py-4 font-bold text-sm sm:text-base px-4" style={{ color: '#94a3b8' }}>
                      Free
                    </th>
                    <th className="py-4 font-bold text-sm sm:text-base px-4" style={{ color: '#0a0a0a' }}>
                      Starter
                    </th>
                    <th className="py-4 font-bold text-sm sm:text-base px-4" style={{ color: '#10B981' }}>
                      Growth
                    </th>
                    <th className="py-4 font-bold text-sm sm:text-base pl-4" style={{ color: '#0a0a0a' }}>
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
                    { feature: 'CRM Integration', free: 'No', starter: 'Yes', growth: 'Yes', enterprise: 'Custom' },
                    { feature: 'Analytics', free: 'Basic', starter: 'Standard', growth: 'Full Dashboard', enterprise: 'Advanced + API' },
                    { feature: 'Support', free: 'Community', starter: 'Email', growth: 'Priority', enterprise: 'Dedicated 24/7' },
                    { feature: 'DPDP Act 2023', free: '—', starter: '—', growth: '—', enterprise: '✓ Compliant' },
                    { feature: 'India-region hosting', free: '—', starter: '—', growth: '—', enterprise: '✓' },
                    { feature: 'Voice Agent Calls', free: '—', starter: '500/mo', growth: '2,000/mo', enterprise: 'Unlimited' },
                    { feature: 'AI Voice Quality', free: 'Standard', starter: 'HD Voice', growth: 'Ultra HD', enterprise: 'Custom Clone' },
                    { feature: 'Appointment Booking', free: '—', starter: '✓', growth: '✓ + Calendar Sync', enterprise: '✓ + Multi-Calendar' },
                    { feature: 'Sentiment Analysis', free: '—', starter: '—', growth: '✓', enterprise: '✓ + Custom Models' },
                    { feature: 'Custom Workflows', free: '—', starter: '3 automations', growth: '15 automations', enterprise: 'Unlimited + API' },
                    { feature: 'API Access', free: '—', starter: '—', growth: 'Read-only', enterprise: 'Full CRUD' },
                    { feature: 'Webhooks', free: '—', starter: '—', growth: '✓', enterprise: '✓ + Custom Events' },
                    { feature: 'SSO / SAML', free: '—', starter: '—', growth: '—', enterprise: '✓' },
                    { feature: 'Uptime SLA', free: '99%', starter: '99.5%', growth: '99.9%', enterprise: '99.99%' },
                    { feature: 'Data Retention', free: '7 days', starter: '30 days', growth: '90 days', enterprise: 'Custom + Export' },
                  ].map((row) => (
                    <tr
                      key={row.feature}
                      style={{ borderBottom: '1px solid rgba(37,99,235,0.04)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f8fafc';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <td className="py-3.5 font-medium text-xs sm:text-sm pr-4" style={{ color: '#0a0a0a' }}>
                        {row.feature}
                      </td>
                      <td className="py-3.5 text-xs sm:text-sm px-4" style={{ color: row.free === 'No' || row.free === '—' ? '#cbd5e1' : '#64748b' }}>
                        {row.free}
                      </td>
                      <td className="py-3.5 text-xs sm:text-sm px-4" style={{ color: row.starter === 'No' ? '#cbd5e1' : '#475569' }}>
                        {row.starter}
                      </td>
                      <td className="py-3.5 text-xs sm:text-sm px-4 font-medium" style={{ color: '#0a0a0a' }}>
                        {row.growth}
                      </td>
                      <td className="py-3.5 text-xs sm:text-sm pl-4" style={{ color: '#475569' }}>
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

      <Footer />
    </div>
  );
}

export default Pricing;