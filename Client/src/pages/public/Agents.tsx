import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Footer from "./Footer";
import { Nav } from "./CaseStudies";
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

const AGENT_TYPES = [
  { icon: "📞", title: "AI Receptionist", desc: "Never miss another business call. Answers 24/7, handles FAQs, filters spam, and forwards high-priority calls.", features: ["Instant Call Routing", "Custom Greetings", "Spam Filtering"], color: "#2563EB", metric: "3.2X", metricLabel: "More Leads" },
  { icon: "📅", title: "Appointment Scheduler", desc: "Integrates with calendars to schedule, reschedule, or cancel client appointments on the call.", features: ["Calendar Sync", "SMS Confirmations", "Follow-up Automation"], color: "#10B981", metric: "+72%", metricLabel: "Bookings" },
  { icon: "💡", title: "FAQ Support Assistant", desc: "Trained on your knowledge base. Answers detailed product and service questions with 99%+ accuracy.", features: ["Knowledge Base Training", "Dynamic Responses", "Context Preservation"], color: "#f97316", metric: "99%", metricLabel: "Accuracy" },
  { icon: "🎯", title: "Lead Qualifier", desc: "Engages inbound leads instantly. Asks qualifying questions and syncs data to your CRM automatically.", features: ["CRM Auto-Sync", "Custom Scripts", "Sentiment Analysis"], color: "#8b5cf6", metric: "40%", metricLabel: "More Conversions" },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Connect Your Channel", desc: "Link your phone number, website widget, or WhatsApp in under 2 minutes.", icon: "🔗", color: "#2563EB" },
  { step: "02", title: "Train Your Agent", desc: "Upload your FAQ, knowledge base, and scripts. The AI learns your business instantly.", icon: "🧠", color: "#10B981" },
  { step: "03", title: "Go Live & Scale", desc: "Start receiving calls immediately. Scale to thousands of concurrent conversations.", icon: "🚀", color: "#f97316" },
];

const TRUSTED_BRANDS = [
  "RealtyMax", "Care+ Clinics", "LearnUp", "The Skin Lounge",
  "EduSphere", "FitNation", "UrbanCart", "FinTrack",
];

/* ─── Hero ─── */
function Hero() {
  return (
    <div style={{ background: 'linear-gradient(180deg, #ffffff 0%, #fbfcfe 100%)', borderBottom: `1px solid ${HAIRLINE}`, padding: '76px 24px 0', position: 'relative', overflow: 'hidden' }}>
      {/* <HeroWaveform /> */}
     <div
  className="max-w-6xl mx-auto flex flex-col items-center justify-center text-center"
  style={{ paddingBottom: 64, position: 'relative', zIndex: 1 }}
>
        <Reveal>
          <SectionLabel text="AI Voice Agents · Powered by Autoniv" />
          <h1 style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 900, letterSpacing: '-0.03em', color: INK, lineHeight: 1.15, margin: '0 0 14px' }}>
            AI Voice Agents{' '}
            <GradientText>That Work 24/7</GradientText>
          </h1>
          <p style={{ fontSize: 15, color: SLATE, maxWidth: 520, lineHeight: 1.6, margin: '0 0 32px' }}>
            Deploy AI Voice Agents that answer calls, qualify leads, and book appointments — so you never miss a customer again.
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

/* ─── Agent Card ─── */
function AgentCard({ agent }: { agent: typeof AGENT_TYPES[0]; }) {
  return (
    <div className="rounded-2xl p-6 h-full flex flex-col transition-all duration-300" style={{ background: SURFACE, border: `1px solid ${HAIRLINE}` }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = agent.color; e.currentTarget.style.boxShadow = `0 12px 32px -8px ${agent.color}18`; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = HAIRLINE; e.currentTarget.style.boxShadow = 'none'; }}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: `${agent.color}10`, border: `1px solid ${agent.color}20` }}>
            {agent.icon}
          </div>
          <div>
            <div className="text-sm font-bold" style={{ color: INK }}>{agent.title}</div>
            <div className="text-[10px] mt-0.5" style={{ color: MUTE }}>{agent.features.length} capabilities</div>
          </div>
        </div>
        <div className="w-16 h-16 rounded-full flex flex-col items-center justify-center flex-shrink-0" style={{ background: `${agent.color}08`, border: `1px solid ${agent.color}15` }}>
          <div className="text-sm font-bold" style={{ color: agent.color }}>{agent.metric}</div>
          <div className="text-[8px] text-center" style={{ color: MUTE }}>{agent.metricLabel}</div>
        </div>
      </div>
      <p className="text-sm leading-relaxed mb-4 flex-1" style={{ color: SLATE }}>{agent.desc}</p>
      <div className="mb-4">
        <div className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: MUTE, fontFamily: MONO }}>Key Capabilities</div>
        <div className="flex flex-wrap gap-1.5">
          {agent.features.map((f) => (
            <span key={f} className="px-2.5 py-1 rounded-full text-[10px] font-medium" style={{ background: `${agent.color}08`, border: `1px solid ${agent.color}15`, color: agent.color }}>✓ {f}</span>
          ))}
        </div>
      </div>
      <div className="h-px mb-4" style={{ background: HAIRLINE }} />
      <Link to="/register" className="text-sm font-semibold flex items-center gap-1 group no-underline transition-colors" style={{ color: '#2563EB' }}
        onMouseEnter={e => e.currentTarget.style.color = agent.color}
        onMouseLeave={e => e.currentTarget.style.color = '#2563EB'}>
        Learn More <span className="transition-transform group-hover:translate-x-1">→</span>
      </Link>
    </div>
  );
}

function AgentsSection() {
  const [active, setActive] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (autoplay) timerRef.current = setInterval(() => setActive((a) => (a + 1) % AGENT_TYPES.length), 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [autoplay]);

  const handleDotClick = (index: number) => { setActive(index); setAutoplay(false); setTimeout(() => setAutoplay(true), 5000); };

  return (
    <div className="max-w-6xl mx-auto">
      <Reveal>
        <div className="text-center">
          <SectionLabel text="Meet Our Agents" />
          <h2 style={{ fontSize: 'clamp(22px,3vw,34px)', fontWeight: 800, letterSpacing: '-0.025em', color: INK, margin: '0 0 10px' }}>
            Intelligent <GradientText>AI Voice Agents</GradientText>
            <br />Tailored to Your Business
          </h2>
          <p style={{ fontSize: 14, color: SLATE, marginBottom: 36 }}>Deploy specialized voice assistants that look up information, book slots, and converse in 20+ languages.</p>
        </div>
      </Reveal>

      <Reveal delay={80}>
        <div className="hidden lg:grid grid-cols-4 gap-5">
          {AGENT_TYPES.map((agent) => <AgentCard key={agent.title} agent={agent} />)}
        </div>
        <div className="lg:hidden relative px-10">
          <button onClick={() => { setActive((a) => (a - 1 + AGENT_TYPES.length) % AGENT_TYPES.length); setAutoplay(false); setTimeout(() => setAutoplay(true), 5000); }}
            className="absolute left-0 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center text-lg z-10 transition-all duration-300"
            style={{ background: SURFACE, border: `1px solid ${HAIRLINE}`, color: '#2563EB', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', cursor: 'pointer' }}>‹</button>
          <AgentCard agent={AGENT_TYPES[active]} />
          <button onClick={() => { setActive((a) => (a + 1) % AGENT_TYPES.length); setAutoplay(false); setTimeout(() => setAutoplay(true), 5000); }}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center text-lg z-10 transition-all duration-300"
            style={{ background: SURFACE, border: `1px solid ${HAIRLINE}`, color: '#2563EB', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', cursor: 'pointer' }}>›</button>
        </div>
        <div className="flex justify-center gap-2 mt-8">
          {AGENT_TYPES.map((_, i) => (
            <button key={i} onClick={() => handleDotClick(i)} className="h-1.5 rounded-full border-none transition-all duration-300 p-0"
              style={{ width: i === active ? 32 : 8, background: i === active ? '#2563EB' : '#d1d5db', cursor: 'pointer' }} />
          ))}
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
            Go Live in <GradientText>3 Simple Steps</GradientText>
          </h2>
          <p style={{ fontSize: 14, color: SLATE, marginBottom: 36 }}>
            From setup to launch in under 48 hours.
          </p>
        </div>
      </Reveal>
      <Reveal delay={80}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {HOW_IT_WORKS.map((step) => (
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
            Deploy Your <GradientText>AI Agent</GradientText> Today
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <div style={{ minHeight: '100vh', background: TINT, fontFamily: SANS, color: INK }}>
      <USPSlider />
      <Nav mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
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

        {/* ── Agent Cards ── */}
        <div style={{ padding: '64px 24px', background: SURFACE, borderTop: `1px solid ${HAIRLINE}` }}>
          <AgentsSection />
        </div>

        {/* ── How It Works ── */}
        <div style={{ padding: '64px 24px' }}>
          <HowItWorks />
        </div>

        {/* ── Trusted Brands ── */}
        <div style={{ padding: '64px 24px', background: SURFACE, borderTop: `1px solid ${HAIRLINE}` }}>
          <TrustedSection />
        </div>

        {/* ── Global Stats ── */}
        <div style={{ padding: '64px 24px' }}>
          <div className="max-w-6xl mx-auto">
            <GlobalStats />
          </div>
        </div>

        {/* ── CTA ── */}
        <div style={{ padding: '0 24px 80px', background: SURFACE }}>
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