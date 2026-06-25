import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Footer from "./Footer";
import { PublicNavbar } from "../../components/PublicNavbar";
import { USPSlider } from "./sections/USPSlider";
import { BRAND, INK, SLATE, MUTE, HAIRLINE, SURFACE, TINT, MONO, SANS, Reveal, SectionLabel, GradientText, StatCard, CTADecorations } from './design';

const HERO_STATS = [
  { value: "24/7", label: "Always On", desc: "99.9% uptime guaranteed" },
  { value: "10K+", label: "Calls Daily", desc: "Handled concurrently" },
  { value: "98%", label: "Satisfaction", desc: "Customer rating" },
  { value: "50+", label: "Languages", desc: "Supported natively" },
];

const GLOBAL_STATS = [
  { value: "500+", label: "Businesses Served", desc: "Across industries" },
  { value: "2M+", label: "Conversations", desc: "Handled to date" },
  { value: "30%+", label: "Conversion Lift", desc: "Average increase" },
  { value: "24/7", label: "AI Agents", desc: "Always working" },
  { value: "98%", label: "Satisfaction", desc: "Client rating" },
  { value: "₹50Cr+", label: "Revenue Generated", desc: "For clients" },
];

// ─── Services Data ───
const SERVICES = [
  {
    id: "chat",
    title: "Chat Assistant",
    icon: "💬",
    color: "#2563EB",
    description: "Intelligent AI chat assistants that handle customer queries, qualify leads, and provide instant support across websites, WhatsApp, and messaging platforms.",
    features: [
      "Instant Responses",
      "Lead Qualification",
      "Multi-platform Support",
      "Smart Escalation",
      "Analytics Dashboard"
    ],
    metrics: [
      { value: "85%", label: "Resolution Rate" },
      { value: "24/7", label: "Availability" },
      { value: "45%", label: "Cost Reduction" }
    ],
    useCases: [
      { icon: "🛒", title: "E-commerce Support", desc: "Help customers find products, track orders, and resolve issues." },
      { icon: "🏥", title: "Healthcare Triage", desc: "Pre-screen patients and schedule appointments." },
      { icon: "🏦", title: "Banking Queries", desc: "Handle account questions and transaction support." }
    ]
  },
  {
    id: "voice",
    title: "Voice Assistant",
    icon: "🎙️",
    color: "#10B981",
    description: "Advanced voice AI agents that handle inbound/outbound calls, book appointments, qualify leads, and provide natural conversational experiences.",
    features: [
      "Natural Language Understanding",
      "Call Routing",
      "Appointment Scheduling",
      "CRM Integration",
      "Multi-language Support"
    ],
    metrics: [
      { value: "98%", label: "Accuracy" },
      { value: "3.2X", label: "More Leads" },
      { value: "40%", label: "Efficiency Gain" }
    ],
    useCases: [
      { icon: "📞", title: "Receptionist", desc: "Answer calls 24/7, handle FAQs, and filter spam." },
      { icon: "📅", title: "Scheduler", desc: "Book, reschedule, or cancel appointments on the call." },
      { icon: "🎯", title: "Lead Qualifier", desc: "Engage leads instantly with qualifying questions." }
    ]
  }
];

/* ─── Hero ─── */
function Hero() {
  return (
    <div style={{ background: 'linear-gradient(180deg, #ffffff 0%, #fbfcfe 100%)', borderBottom: `1px solid ${HAIRLINE}`, padding: '76px 24px 0', position: 'relative', overflow: 'hidden' }}>
      <div className="max-w-6xl mx-auto flex flex-col items-center justify-center text-center" style={{ paddingBottom: 64, position: 'relative', zIndex: 1 }}>
        <Reveal>
          <SectionLabel text="AI Services · Powered by Autoniv" />
          <h1 style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 900, letterSpacing: '-0.03em', color: INK, lineHeight: 1.15, margin: '0 0 14px' }}>
            Chat & Voice <GradientText>AI Solutions</GradientText>
          </h1>
          <p style={{ fontSize: 15, color: SLATE, maxWidth: 560, lineHeight: 1.6, margin: '0 0 32px' }}>
            Deploy intelligent chat and voice assistants that work 24/7 to engage customers, 
            qualify leads, and drive conversions — across every channel.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/register"
              className="px-8 py-3.5 rounded-full text-sm font-bold text-white no-underline text-center transition-all duration-200"
              style={{ background: BRAND, boxShadow: '0 8px 26px -4px rgba(16,185,129,0.34)' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px -4px rgba(16,185,129,0.44)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 26px -4px rgba(16,185,129,0.34)'; }}>
              Book a Free Demo →
            </Link>
            <button className="px-8 py-3.5 rounded-full text-sm font-bold text-center transition-all duration-200"
              style={{ background: SURFACE, border: '1.5px solid rgba(15,23,42,0.10)', color: '#475569', cursor: 'pointer' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(37,99,235,0.32)'; e.currentTarget.style.color = '#2563EB'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(15,23,42,0.10)'; e.currentTarget.style.color = '#475569'; }}>
              ▶ See How It Works
            </button>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

/* ─── Service Card ─── */
function ServiceCard({ service  }: { service: typeof SERVICES[0]}) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className="rounded-2xl p-8 h-full flex flex-col transition-all duration-500"
      style={{ 
        background: SURFACE, 
        border: `2px solid ${isHovered ? service.color : HAIRLINE}`,
        boxShadow: isHovered ? `0 20px 60px -12px ${service.color}25` : '0 4px 12px rgba(0,0,0,0.04)',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 transition-all duration-300"
          style={{ 
            background: `${service.color}12`, 
            border: `2px solid ${service.color}25`,
            transform: isHovered ? 'scale(1.05) rotate(-3deg)' : 'scale(1) rotate(0)'
          }}>
          {service.icon}
        </div>
        <div>
          <h3 className="text-xl font-bold" style={{ color: INK }}>{service.title}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-mono" style={{ color: service.color }}>●</span>
            <span className="text-xs" style={{ color: MUTE }}>{service.features.length} capabilities</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm leading-relaxed mb-6" style={{ color: SLATE }}>
        {service.description}
      </p>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {service.metrics.map((metric) => (
          <div key={metric.label} className="text-center p-3 rounded-xl" style={{ background: `${service.color}06`, border: `1px solid ${service.color}12` }}>
            <div className="text-lg font-bold" style={{ color: service.color }}>{metric.value}</div>
            <div className="text-[10px] font-medium" style={{ color: MUTE }}>{metric.label}</div>
          </div>
        ))}
      </div>

      {/* Features */}
      <div className="mb-6">
        <div className="text-[10px] font-semibold uppercase tracking-wider mb-3" style={{ color: MUTE, fontFamily: MONO }}>
          Key Features
        </div>
        <div className="flex flex-wrap gap-2">
          {service.features.map((f) => (
            <span key={f} className="px-3 py-1.5 rounded-full text-[11px] font-medium transition-all duration-300"
              style={{ 
                background: `${service.color}08`, 
                border: `1px solid ${service.color}15`, 
                color: service.color,
                transform: isHovered ? 'scale(1.02)' : 'scale(1)'
              }}>
              ✓ {f}
            </span>
          ))}
        </div>
      </div>

      {/* Use Cases */}
      <div className="mb-6">
        <div className="text-[10px] font-semibold uppercase tracking-wider mb-3" style={{ color: MUTE, fontFamily: MONO }}>
          Use Cases
        </div>
        <div className="space-y-2">
          {service.useCases.map((useCase) => (
            <div key={useCase.title} className="flex items-start gap-2 p-2 rounded-lg transition-all duration-300"
              style={{ background: isHovered ? `${service.color}04` : 'transparent' }}>
              <span className="text-base flex-shrink-0 mt-0.5">{useCase.icon}</span>
              <div>
                <div className="text-xs font-semibold" style={{ color: INK }}>{useCase.title}</div>
                <div className="text-[11px]" style={{ color: SLATE }}>{useCase.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="h-px mb-5" style={{ background: HAIRLINE }} />
      
      {/* CTA */}
      <Link to="/register" 
        className="text-sm font-semibold flex items-center justify-center gap-2 py-3 px-6 rounded-xl transition-all duration-300 no-underline"
        style={{ 
          background: `${service.color}08`,
          border: `1px solid ${service.color}20`,
          color: service.color,
          transform: isHovered ? 'scale(1.02)' : 'scale(1)'
        }}
        onMouseEnter={e => { e.currentTarget.style.background = service.color; e.currentTarget.style.color = 'white'; }}
        onMouseLeave={e => { e.currentTarget.style.background = `${service.color}08`; e.currentTarget.style.color = service.color; }}>
        Get Started <span className="transition-transform group-hover:translate-x-1">→</span>
      </Link>
    </div>
  );
}

/* ─── Services Section ─── */
function ServicesSection() {
  return (
    <div className="max-w-6xl mx-auto">
      <Reveal>
        <div className="text-center">
          <SectionLabel text="Our Services" />
          <h2 style={{ fontSize: 'clamp(22px,3vw,34px)', fontWeight: 800, letterSpacing: '-0.025em', color: INK, margin: '0 0 10px' }}>
            Chat & Voice <GradientText>AI Solutions</GradientText>
          </h2>
          <p style={{ fontSize: 14, color: SLATE, marginBottom: 36, maxWidth: 540, marginLeft: 'auto', marginRight: 'auto' }}>
            Choose the right AI assistant for your business needs or combine both for 
            omnichannel customer engagement.
          </p>
        </div>
      </Reveal>

      <Reveal delay={80}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {SERVICES.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </Reveal>
    </div>
  );
}

/* ─── Comparison Section ─── */
function ComparisonSection() {
  return (
    <div className="max-w-6xl mx-auto">
      <Reveal>
        <div className="text-center">
          <SectionLabel text="Compare Solutions" />
          <h2 style={{ fontSize: 'clamp(20px,2.5vw,30px)', fontWeight: 800, letterSpacing: '-0.025em', color: INK, margin: '0 0 10px' }}>
            Choose Your <GradientText>AI Assistant</GradientText>
          </h2>
          <p style={{ fontSize: 14, color: SLATE, marginBottom: 36 }}>
            Compare features and capabilities to find the perfect fit for your business.
          </p>
        </div>
      </Reveal>

      <Reveal delay={80}>
        <div className="overflow-x-auto">
          <table className="w-full rounded-2xl" style={{ background: SURFACE, border: `1px solid ${HAIRLINE}` }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: MUTE, fontFamily: MONO }}>Feature</th>
                <th className="p-4 text-center text-sm font-bold" style={{ color: SERVICES[0].color }}>💬 Chat Assistant</th>
                <th className="p-4 text-center text-sm font-bold" style={{ color: SERVICES[1].color }}>🎙️ Voice Assistant</th>
              </tr>
            </thead>
            <tbody>
              {[
                { feature: "24/7 Availability", chat: "✅", voice: "✅" },
                { feature: "Natural Language Processing", chat: "✅", voice: "✅" },
                { feature: "Multi-language Support", chat: "✅", voice: "✅" },
                { feature: "Real-time Responses", chat: "✅", voice: "✅" },
                { feature: "Phone Call Handling", chat: "❌", voice: "✅" },
                { feature: "Website Widget", chat: "✅", voice: "❌" },
                { feature: "WhatsApp Integration", chat: "✅", voice: "✅" },
                { feature: "Appointment Scheduling", chat: "✅", voice: "✅" },
                { feature: "CRM Integration", chat: "✅", voice: "✅" },
                { feature: "Lead Qualification", chat: "✅", voice: "✅" },
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: i < 9 ? `1px solid ${HAIRLINE}` : 'none' }}>
                  <td className="p-4 text-sm font-medium" style={{ color: INK }}>{row.feature}</td>
                  <td className="p-4 text-center text-lg" style={{ color: SERVICES[0].color }}>{row.chat}</td>
                  <td className="p-4 text-center text-lg" style={{ color: SERVICES[1].color }}>{row.voice}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Reveal>
    </div>
  );
}

/* ─── How It Works ─── */
function HowItWorks() {
  return (
    <div className="max-w-6xl mx-auto">
      <Reveal>
        <div className="text-center">
          <SectionLabel text="How It Works" />
          <h2 style={{ fontSize: 'clamp(22px,3vw,34px)', fontWeight: 800, letterSpacing: '-0.025em', color: INK, margin: '0 0 10px' }}>
            Deploy in <GradientText>3 Simple Steps</GradientText>
          </h2>
          <p style={{ fontSize: 14, color: SLATE, marginBottom: 36 }}>
            From setup to launch in under 48 hours.
          </p>
        </div>
      </Reveal>
      <Reveal delay={80}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            { step: "01", title: "Connect Your Channels", desc: "Link your website, WhatsApp, or phone number in under 2 minutes.", icon: "🔗", color: "#2563EB" },
            { step: "02", title: "Train Your AI", desc: "Upload your knowledge base, FAQs, and scripts. The AI learns instantly.", icon: "🧠", color: "#10B981" },
            { step: "03", title: "Go Live & Scale", desc: "Launch your AI assistant and scale to thousands of conversations.", icon: "🚀", color: "#f97316" },
          ].map((step) => (
            <div key={step.step} className="rounded-2xl p-6 sm:p-8 transition-all duration-300 hover:-translate-y-1" style={{ background: SURFACE, border: `1px solid ${HAIRLINE}` }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = step.color; e.currentTarget.style.boxShadow = `0 12px 32px -8px ${step.color}15`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = HAIRLINE; e.currentTarget.style.boxShadow = 'none'; }}>
              <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-4" style={{ background: `${step.color}10`, border: `1px solid ${step.color}20` }}>
                {step.icon}
              </div>
              <div className="text-[10px] font-semibold mb-1 tracking-wider" style={{ color: step.color, fontFamily: MONO }}>STEP {step.step}</div>
              <h3 className="text-base font-bold mb-2" style={{ color: INK }}>{step.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: SLATE }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  );
}

/* ─── Trusted Brands ─── */
function TrustedSection() {
  const TRUSTED_BRANDS = [
    "RealtyMax", "Care+ Clinics", "LearnUp", "The Skin Lounge",
    "EduSphere", "FitNation", "UrbanCart", "FinTrack",
  ];
  
  return (
    <div className="max-w-6xl mx-auto" style={{ textAlign: 'center' }}>
      <Reveal>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: MUTE, fontFamily: MONO, marginBottom: 24 }}>
          ● TRUSTED BY 500+ BUSINESSES ●
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {TRUSTED_BRANDS.map((b) => (
            <span key={b} className="px-4 py-2.5 rounded-xl text-xs font-medium transition-all"
              style={{ background: SURFACE, border: `1px solid ${HAIRLINE}`, color: SLATE }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(37,99,235,0.2)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(37,99,235,0.06)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = HAIRLINE; e.currentTarget.style.boxShadow = 'none'; }}>
              {b}
            </span>
          ))}
        </div>
      </Reveal>
    </div>
  );
}

/* ─── Global Stats ─── */
function GlobalStats() {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setIsVisible(true); }, { threshold: 0.2 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref}>
      <Reveal>
        <div className="text-center">
          <SectionLabel text="By the Numbers" />
          <h2 style={{ fontSize: 'clamp(22px,3vw,34px)', fontWeight: 800, letterSpacing: '-0.025em', color: INK, margin: '0 0 28px' }}>
            Autoniv in <GradientText>Numbers</GradientText>
          </h2>
        </div>
      </Reveal>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {GLOBAL_STATS.map((s, i) => (
          <div key={s.label} style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: `opacity 0.6s ease ${i * 0.1}s, transform 0.6s ease ${i * 0.1}s`
          }}>
            <StatCard value={s.value} label={s.label} description={s.desc} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── CTA ─── */
function CTASection() {
  return (
    <Reveal>
      <div className="rounded-3xl p-12 sm:p-16 text-center relative overflow-hidden" style={{
        background: 'linear-gradient(135deg,#eff6ff 0%,#f0fdf9 100%)',
        border: '1.5px solid rgba(37,99,235,0.14)',
        boxShadow: '0 20px 56px -16px rgba(37,99,235,0.14)',
      }}>
        <CTADecorations />
        <div className="relative z-10">
          <h2 style={{ fontSize: 'clamp(24px,4vw,44px)', fontWeight: 900, letterSpacing: '-0.03em', color: INK, margin: '0 0 16px', lineHeight: 1.15 }}>
            Deploy Your <GradientText>AI Assistant</GradientText> Today
          </h2>
          <p style={{ fontSize: 15, color: SLATE, maxWidth: 440, margin: '0 auto 32px', lineHeight: 1.7 }}>
            Join 500+ businesses already growing with Autoniv.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link to="/register"
              className="px-8 py-4 rounded-full text-sm font-bold text-white no-underline inline-block text-center transition-all duration-200"
              style={{ background: BRAND, boxShadow: '0 8px 26px -4px rgba(16,185,129,0.34)' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px -4px rgba(16,185,129,0.44)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 26px -4px rgba(16,185,129,0.34)'; }}>
              Book a Demo →
            </Link>
            <button className="px-8 py-4 rounded-full text-sm font-bold transition-all duration-200"
              style={{ background: SURFACE, border: '1.5px solid rgba(15,23,42,0.10)', color: '#475569', cursor: 'pointer' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(37,99,235,0.32)'; e.currentTarget.style.color = '#2563EB'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(15,23,42,0.10)'; e.currentTarget.style.color = '#475569'; }}>
              🎧 Talk to Expert
            </button>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

/* ─── Main ─── */
export function Agents() {
  return (
    <div style={{ minHeight: '100vh', background: TINT, fontFamily: SANS, color: INK }}>
      <USPSlider />
      <PublicNavbar />
      <div style={{ paddingTop: 130 }}>
        <Hero />

        {/* ── Stats ── */}
        <div style={{ padding: '64px 24px' }}>
          <div className="max-w-6xl mx-auto">
            <Reveal>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {HERO_STATS.map((s) => (
                  <StatCard key={s.label} value={s.value} label={s.label} description={s.desc} />
                ))}
              </div>
            </Reveal>
          </div>
        </div>

        {/* ── Services Section ── */}
        <div style={{ padding: '64px 24px', background: SURFACE, borderTop: `1px solid ${HAIRLINE}` }}>
          <ServicesSection />
        </div>

        {/* ── Comparison Section ── */}
        <div style={{ padding: '64px 24px' }}>
          <ComparisonSection />
        </div>

        {/* ── How It Works ── */}
        <div style={{ padding: '64px 24px', background: SURFACE, borderTop: `1px solid ${HAIRLINE}` }}>
          <HowItWorks />
        </div>

        {/* ── Trusted Brands ── */}
        <div style={{ padding: '64px 24px' }}>
          <TrustedSection />
        </div>

        {/* ── Global Stats ── */}
        <div style={{ padding: '64px 24px', background: SURFACE, borderTop: `1px solid ${HAIRLINE}` }}>
          <div className="max-w-6xl mx-auto">
            <GlobalStats />
          </div>
        </div>

        {/* ── CTA ── */}
        <div style={{ padding: '0 24px 80px' }}>
          <div className="max-w-6xl mx-auto">
            <CTASection />
          </div>
        </div>

      </div>
      <Footer />
    </div>
  );
}

export default Agents;