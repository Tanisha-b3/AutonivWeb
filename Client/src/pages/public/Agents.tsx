import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Footer from "./Footer";
import { PublicNavbar } from "../../components/PublicNavbar";
import { USPSlider } from "./sections/USPSlider";
import { BRAND, INK, SLATE, MUTE, HAIRLINE, SURFACE, TINT, MONO, SANS, Reveal, SectionLabel, GradientText, StatCard, CTADecorations } from './design';
import { motion } from "framer-motion";
import { Pricing as PricingSection } from "./sections/Pricing";

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
    <section className="section-box tint">
      <div className="max-w-6xl mx-auto flex flex-col items-center justify-center text-center section-pad" style={{ position: 'relative', zIndex: 1 }}>
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
    </section>
  );
}

/* ─── Service Card ─── */
function ServiceCard({ service, index }: { service: typeof SERVICES[0]; index: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl p-8 h-full flex flex-col justify-between border relative overflow-hidden bg-white"
      style={{ 
        borderColor: '#e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.02)',
      }}
    >
      {/* Subtle blue decoration */}
      <div 
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-[100px] pointer-events-none opacity-30"
        style={{
          background: `radial-gradient(circle, ${service.color}10 0%, rgba(37,99,235,0.04) 50%, transparent 70%)`,
        }}
      />

      {/* Left accent bar */}
      <div 
        className="absolute top-12 bottom-12 left-0 w-1 rounded-r-full"
        style={{
          background: `linear-gradient(180deg, ${service.color}, rgba(37,99,235,0.3))`,
          opacity: 0.4
        }}
      />

      <div>
        {/* Header */}
        <div className="flex items-start gap-4 mb-6 relative z-10">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ 
              background: '#f8faff', 
              border: '1px solid #e2e8f0',
            }}>
            {service.icon}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 leading-tight">{service.title}</h3>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                {service.features.length} features
              </span>
              <span className="text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-gray-50 text-gray-500 border border-gray-100">
                {service.useCases.length} use cases
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm leading-relaxed mb-6 text-gray-600 relative z-10">
          {service.description}
        </p>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-3 mb-6 relative z-10">
          {service.metrics.map((metric) => (
            <div 
              key={metric.label} 
              className="text-center p-3 rounded-xl border"
              style={{ 
                background: '#fafcff', 
                borderColor: '#eef2f6'
              }}
            >
              <div className="text-lg font-bold font-mono tracking-tight" style={{ color: service.color }}>{metric.value}</div>
              <div className="text-[9px] font-medium uppercase tracking-wider text-gray-400 mt-0.5">{metric.label}</div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="mb-6 relative z-10">
          <div className="text-[10px] font-semibold uppercase tracking-wider mb-2.5 text-blue-500">
            What's included
          </div>
          <div className="flex flex-wrap gap-1.5">
            {service.features.map((f) => (
              <span 
                key={f} 
                className="px-3 py-1.5 rounded-lg text-[11px] font-medium border flex items-center gap-1.5"
                style={{ 
                  background: '#fafcff',
                  borderColor: '#eef2f6',
                  color: '#4a5568',
                }}
              >
                <span style={{ color: service.color, fontSize: 8 }}>●</span> {f}
              </span>
            ))}
          </div>
        </div>

        {/* Use Cases */}
        <div className="mb-8 relative z-10">
          <div className="text-[10px] font-semibold uppercase tracking-wider mb-2.5 text-blue-500">
            Best for
          </div>
          <div className="space-y-2">
            {service.useCases.map((useCase) => (
              <div 
                key={useCase.title} 
                className="flex items-start gap-3 p-2.5 rounded-xl border"
                style={{ 
                  background: 'transparent',
                  borderColor: 'transparent'
                }}
              >
                <span className="text-sm p-1.5 rounded-lg bg-blue-50/60 flex-shrink-0 mt-0.5 border border-blue-100/30">{useCase.icon}</span>
                <div>
                  <div className="text-xs font-semibold text-gray-800">{useCase.title}</div>
                  <div className="text-[11px] text-gray-500 mt-0.5 leading-snug">{useCase.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="h-px mb-5 bg-gradient-to-r from-blue-200/40 via-blue-300/20 to-transparent" />
      
      {/* CTA */}
      <Link to="/register" 
        className="text-sm font-semibold flex items-center justify-center gap-2 py-3 px-6 rounded-xl no-underline cursor-pointer"
        style={{ 
          background: '#f8faff',
          border: '1.5px solid #e2e8f0',
          color: '#2563EB',
        }}
      >
        <span className="flex items-center gap-2">
          Get Started 
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </span>
      </Link>
    </motion.div>
  );
}

/* ─── Services Section ─── */
function ServicesSection() {
  return (
    <div className="max-w-6xl mx-auto">
      <Reveal>
        <div className="text-center mb-14">
          <SectionLabel text="Our Services" />
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white mb-4">
            Chat & Voice <GradientText>AI Solutions</GradientText>
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-lg mx-auto leading-relaxed">
            Choose the right AI assistant for your business needs or combine both for
            omnichannel customer engagement.
          </p>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {SERVICES.map((service, index) => (
          <ServiceCard key={service.id} service={service} index={index} />
        ))}
      </div>
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
    <div className="max-w-6xl mx-auto relative">
      <Reveal>
        <div className="text-center mb-16">
          <SectionLabel text="How It Works" />
          <h2 style={{ fontSize: 'clamp(24px,3.5vw,38px)', fontWeight: 900, letterSpacing: '-0.03em', color: INK, margin: '0 0 10px' }}>
            Deploy in <GradientText>3 Simple Steps</GradientText>
          </h2>
          <p className="text-sm sm:text-base max-w-md mx-auto" style={{ color: SLATE }}>
            Get your custom AI agent trained and live on your channels in under 48 hours.
          </p>
        </div>
      </Reveal>

      <div className="relative">
        {/* Connection line for desktop */}
        <div className="hidden md:block absolute top-[52px] left-[15%] right-[15%] h-0.5 border-t-2 border-dashed border-slate-200/60 z-0 pointer-events-none" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          {[
            { step: "01", title: "Connect Your Channels", desc: "Link your website, WhatsApp, or phone number in under 2 minutes.", icon: "🔗", color: "#2563EB" },
            { step: "02", title: "Train Your AI", desc: "Upload your knowledge base, FAQs, and scripts. The AI learns instantly.", icon: "🧠", color: "#10B981" },
            { step: "03", title: "Go Live & Scale", desc: "Launch your AI assistant and scale to thousands of conversations.", icon: "🚀", color: "#f97316" },
          ].map((item, index) => (
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: index * 0.12 }}
              key={item.step}
              className="rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1.5 bg-white border border-slate-200/50 flex flex-col items-center text-center group cursor-default"
              style={{
                boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = item.color;
                e.currentTarget.style.boxShadow = `0 20px 40px -10px ${item.color}15`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(226, 232, 240, 0.5)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.02)';
              }}
            >
              {/* Step number badge & icon */}
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-3xl mb-6 relative z-10 transition-transform duration-300 group-hover:scale-105"
                style={{
                  background: `${item.color}0c`,
                  border: `2.5px solid ${item.color}25`
                }}
              >
                {item.icon}
                <div
                  className="absolute -top-1 -right-1 w-6 h-6 rounded-full text-[9px] font-black text-white flex items-center justify-center font-mono"
                  style={{ background: item.color }}
                >
                  {item.step}
                </div>
              </div>

              <h3 className="text-base font-extrabold mb-2 text-slate-900 group-hover:text-slate-950 transition-colors">{item.title}</h3>
              <p className="text-xs sm:text-sm leading-relaxed text-slate-500 max-w-[240px]">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
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

/* ─── Integrations Wall ─── */
function IntegrationsSection() {
  const integrations = [
    { name: "Azure", icon: "☁️" }, { name: "Gemini", icon: "💎" }, { name: "Anthropic", icon: "🧠" }, { name: "Groq", icon: "⚡" },
    { name: "Cartesia", icon: "🎙️" }, { name: "Make", icon: "🔄" }, { name: "n8n", icon: "🔗" }, { name: "Google Calendar", icon: "📅" },
    { name: "WhatsApp", icon: "💬" }, { name: "Discord", icon: "💜" }, { name: "Instagram", icon: "📸" }, { name: "Facebook", icon: "👤" },
    { name: "Telegram", icon: "✈️" }, { name: "Google Docs", icon: "📄" }, { name: "Microsoft", icon: "🪟" }, { name: "Twilio", icon: "📞" },
  ];

  return (
    <div className="max-w-6xl mx-auto text-center overflow-hidden">
      <Reveal>
        <div className="mb-6">
          <SectionLabel text="Integrations" />
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0a0a0a] mb-3">
          Seamlessly plugs into <GradientText>your tech stack</GradientText>
        </h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto mb-10">
          Autoniv connects directly with the platforms, CRMs, and LLMs you already use.
        </p>
      </Reveal>

      {/* Marquee Row */}
      <div className="relative flex overflow-x-hidden py-4 mask-image:linear-gradient(to_right,transparent,black_20%,black_80%,transparent)">
        <div className="flex gap-4 animate-marquee whitespace-nowrap min-w-full">
          {integrations.concat(integrations).map((item, i) => (
            <div
              key={i}
              className="inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-white border border-slate-200/60 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-500/20"
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-sm font-semibold text-slate-700">{item.name}</span>
            </div>
          ))}
        </div>

        {/* Style block for keyframe animation inside the component */}
        <style>{`
          @keyframes marquee {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            animation: marquee 25s linear infinite;
          }
          .animate-marquee:hover {
            animation-play-state: paused;
          }
        `}</style>
      </div>
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
    <section className="section-box white" style={{ background: 'linear-gradient(135deg,#eff6ff 0%,#f0fdf9 100%)', border: '1.5px solid rgba(37,99,235,0.14)', boxShadow: '0 20px 56px -16px rgba(37,99,235,0.14)' }}>
      <div className="section-pad text-center relative overflow-hidden">
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
    </section>
  );
}

/* ─── Main ─── */
export function Agents() {
  return (
    <div style={{ minHeight: '100vh', background: TINT, fontFamily: SANS, color: INK }}>
      <USPSlider />
      <PublicNavbar />

      <div className="page-bg" style={{ paddingTop: 130, paddingBottom: 8 }}>
        <div className="box-wrap">
          <Hero />

          {/* ── Stats ── */}
          <section className="section-box white">
            <div className="section-pad max-w-6xl mx-auto">
              <Reveal>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {HERO_STATS.map((s) => (
                    <StatCard key={s.label} value={s.value} label={s.label} description={s.desc} />
                  ))}
                </div>
              </Reveal>
            </div>
          </section>

          {/* ── Services Section ── */}
          <section className="section-box black" style={{ background: '#030812' }}>
            {/* Ambient background glow blur blobs */}
            <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

            <div className="section-pad max-w-6xl mx-auto relative z-10">
              <ServicesSection />
            </div>
          </section>

          {/* ── Comparison Section ── */}
          <section className="section-box tint">
            <div className="section-pad max-w-6xl mx-auto">
              <ComparisonSection />
            </div>
          </section>

          {/* ── How It Works ── */}
          <section className="section-box white">
            <div className="section-pad max-w-6xl mx-auto">
              <HowItWorks />
            </div>
          </section>

          {/* ── Pricing Section ── */}
          <PricingSection openAuth={() => window.location.href = '/register'} />

          {/* ── Trusted Brands ── */}
          <section className="section-box white">
            <div className="section-pad max-w-6xl mx-auto">
              <TrustedSection />
            </div>
          </section>

          {/* ── Integrations Section ── */}
          <section className="section-box tint">
            <div className="section-pad max-w-6xl mx-auto">
              <IntegrationsSection />
            </div>
          </section>

          {/* ── Global Stats ── */}
          <section className="section-box white">
            <div className="section-pad max-w-6xl mx-auto">
              <GlobalStats />
            </div>
          </section>

          {/* ── CTA ── */}
          <CTASection />

        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Agents;