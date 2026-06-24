import { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import Footer from "./Footer";
import { Nav } from "./CaseStudies";

const USPS = [
  { icon: "🎙️", text: "AI Voice Agents That Answer, Qualify & Convert Leads 24/7" },
  { icon: "🌍", text: "Multi-Language Support – AI That Speaks Your Customers' Language" },
  { icon: "⚡", text: "Quick Setup – Live in Minutes, No Code Needed" },
];

const STATS = [
  { value: "24/7", label: "Always On", icon: "🕐" },
  { value: "10K+", label: "Calls Handled Daily", icon: "📞" },
  { value: "98%", label: "Customer Satisfaction", icon: "⭐" },
  { value: "50+", label: "Languages Supported", icon: "🌐" },
];

const GLOBAL_STATS = [
  { value: "500+", label: "Businesses Served", icon: "🏢" },
  { value: "2M+", label: "Conversations Handled", icon: "💬" },
  { value: "30%+", label: "Avg Increase in Conversions", icon: "📈" },
  { value: "24/7", label: "AI Agents Working", icon: "⚡" },
  { value: "98%", label: "Client Satisfaction Rate", icon: "⭐" },
  { value: "₹50Cr+", label: "Revenue Generated for Clients", icon: "💰" },
];

const AGENT_TYPES = [
  { 
    icon: "📞", 
    title: "AI Receptionist", 
    desc: "Never miss another business call. Answers 24/7, handles FAQs, filters spam, and forwards high-priority calls.", 
    features: ["Instant Call Routing", "Custom Greetings", "Spam Filtering"], 
    color: "#2563EB", 
    metric: "3.2X", 
    metricLabel: "More Leads",
    bgGradient: "linear-gradient(135deg,#2563EB10,#2563EB05)"
  },
  { 
    icon: "📅", 
    title: "Appointment Scheduler", 
    desc: "Integrates with calendars to schedule, reschedule, or cancel client appointments on the call.", 
    features: ["Calendar Sync", "SMS Confirmations", "Follow-up Automation"], 
    color: "#10B981", 
    metric: "+72%", 
    metricLabel: "Bookings",
    bgGradient: "linear-gradient(135deg,#10B98110,#10B98105)"
  },
  { 
    icon: "💡", 
    title: "FAQ Support Assistant", 
    desc: "Trained on your knowledge base. Answers detailed product and service questions with 99%+ accuracy.", 
    features: ["Knowledge Base Training", "Dynamic Responses", "Context Preservation"], 
    color: "#f97316", 
    metric: "99%", 
    metricLabel: "Accuracy",
    bgGradient: "linear-gradient(135deg,#f9731610,#f9731605)"
  },
  { 
    icon: "🎯", 
    title: "Lead Qualifier", 
    desc: "Engages inbound leads instantly. Asks qualifying questions and syncs data to your CRM automatically.", 
    features: ["CRM Auto-Sync", "Custom Scripts", "Sentiment Analysis"], 
    color: "#8b5cf6", 
    metric: "40%", 
    metricLabel: "More Conversions",
    bgGradient: "linear-gradient(135deg,#8b5cf610,#8b5cf605)"
  },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Connect Your Channel", desc: "Link your phone number, website widget, or WhatsApp in under 2 minutes.", icon: "🔗", color: "#2563EB" },
  { step: "02", title: "Train Your Agent", desc: "Upload your FAQ, knowledge base, and scripts. The AI learns your business instantly.", icon: "🧠", color: "#10B981" },
  { step: "03", title: "Go Live & Scale", desc: "Start receiving calls immediately. Scale to thousands of concurrent conversations.", icon: "🚀", color: "#f97316" },
];

const TRUSTED_BRANDS = [
  { name: "RealtyMax", icon: "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" },
  { name: "Care+ Clinics", icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" },
  { name: "LearnUp", icon: "M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z" },
  { name: "The Skin Lounge", icon: "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" },
  { name: "EduSphere", icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" },
  { name: "FitNation", icon: "M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z" },
  { name: "UrbanCart", icon: "M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" },
  { name: "FinTrack", icon: "M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" },
];

/* ─── USP Banner ─── */
function USPBanner() {
  const [cur, setCur] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setCur((c) => (c + 1) % USPS.length), 4000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-9 flex items-center justify-center gap-2 overflow-hidden border-b border-blue-600/30" style={{ background: "linear-gradient(90deg,#0f2060,#0d1f4e,#0f2060)" }}>
      <span className="text-sm flex-shrink-0">{USPS[cur].icon}</span>
      <span className="text-[10px] sm:text-[11px] text-white/80 font-medium truncate max-w-[85vw]">{USPS[cur].text}</span>
    </div>
  );
}

/* ─── Hero ─── */
function Hero() {
  return (
    <section className="section-box tint" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Animated background blobs */}
      <div style={{
        position: 'absolute',
        top: '-20%',
        right: '-10%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(37,99,235,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
        animation: 'float 8s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-20%',
        left: '-10%',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
        animation: 'float 10s ease-in-out infinite reverse',
      }} />
      
      <div className="section-pad text-center" style={{ position: 'relative', zIndex: 1 }}>
        <div className="inline-flex items-center gap-2 border border-blue-600/20 rounded-full px-4 py-1.5 mb-5 animate-pulse" style={{ background: "rgba(37,99,235,0.06)" }}>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[10px] sm:text-xs font-bold tracking-widest" style={{ color: "#2563EB" }}>LIVE AI AGENTS • POWERED BY AUTONIV</span>
        </div>
        
        <h1 className="text-4xl sm:text-5xl lg:text-[58px] font-black leading-[1.05] tracking-tight mb-5" style={{ color: "#0a0a0a" }}>
          AI Voice Agents{" "}
          <span style={{ 
            background: "linear-gradient(135deg,#2563EB,#10B981,#34D399)", 
            WebkitBackgroundClip: "text", 
            WebkitTextFillColor: "transparent", 
            backgroundClip: "text",
            backgroundSize: '200% 200%',
            animation: 'gradientShift 3s ease-in-out infinite'
          }}>
            That Work 24/7
          </span>{" "}
          So You Don't Have To.
        </h1>
        
        <p className="text-base sm:text-lg leading-relaxed max-w-lg mx-auto mb-8" style={{ color: "#475569" }}>
          Deploy AI Voice Agents that answer calls, qualify leads, and book appointments — so you never miss a customer again.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Link to="/register" className="px-8 py-4 rounded-full text-sm font-bold text-white text-center no-underline transition-all duration-300 hover:-translate-y-1 hover:scale-105" style={{ 
            background: "linear-gradient(135deg,#2563EB,#10B981)", 
            boxShadow: "0 4px 24px rgba(16,185,129,0.35)",
          }}>
            Book a Free Demo →
          </Link>
          <button className="px-8 py-4 rounded-full text-sm font-semibold transition-all duration-300 hover:-translate-y-1 hover:shadow-lg" style={{ 
            background: "#fff", 
            border: "1px solid rgba(37,99,235,0.15)", 
            color: "#475569",
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            ▶ See How It Works
          </button>
        </div>

        {/* Animated counter bar */}
        <div className="mt-8 flex flex-wrap justify-center gap-6 sm:gap-10 text-xs" style={{ color: '#94a3b8' }}>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span>500+ active agents</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
            <span>99.9% uptime</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" style={{ animationDelay: '1s' }} />
            <span>2M+ calls handled</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(3deg); }
        }
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes ping {
          0% { transform: scale(1); opacity: 1; }
          75%, 100% { transform: scale(1.5); opacity: 0; }
        }
      `}</style>
    </section>
  );
}

/* ─── Stats Bar ─── */
function StatsBar() {
  const [counts, setCounts] = useState(STATS.map(() => 0));
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    const durations = [1000, 1200, 800, 1500];
    const targetValues = STATS.map(s => parseInt(s.value.replace(/[^0-9]/g, '')) || 100);
    
    const intervals = STATS.map((_, i) => {
      const start = 0;
      const end = targetValues[i];
      const duration = durations[i % durations.length];
      const startTime = Date.now();
      
      return setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(start + (end - start) * eased);
        
        setCounts(prev => {
          const newCounts = [...prev];
          newCounts[i] = current;
          return newCounts;
        });
      }, 16);
    });

    return () => intervals.forEach(i => clearInterval(i));
  }, [isVisible]);

  return (
    <section className="section-box white" ref={ref}>
      <div className="section-pad">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {STATS.map((s, i) => (
            <div key={s.label} className="flex items-center justify-center gap-3 py-2 group cursor-default">
              <span className="text-2xl sm:text-3xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">{s.icon}</span>
              <div>
                <div className="text-lg sm:text-2xl font-black" style={{ color: "#0a0a0a" }}>
                  {s.value.includes('+') ? `${counts[i]}+` : 
                   s.value.includes('%') ? `${counts[i]}%` :
                   s.value}
                </div>
                <div className="text-[9px] sm:text-[10px]" style={{ color: "#94a3b8" }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Agent Cards ─── */
function AgentCard({ agent, index }: { agent: typeof AGENT_TYPES[0]; index: number }) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className="rounded-2xl p-6 sm:p-7 h-full transition-all duration-500 group relative overflow-hidden"
      style={{
        background: "#fff",
        border: "1px solid rgba(37,99,235,0.1)",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated background gradient */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: agent.bgGradient,
        opacity: isHovered ? 1 : 0,
        transition: 'opacity 0.5s ease',
        pointerEvents: 'none',
      }} />
      
      {/* Glow effect */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        right: '-50%',
        width: '200%',
        height: '200%',
        background: `radial-gradient(circle, ${agent.color}10 0%, transparent 70%)`,
        opacity: isHovered ? 1 : 0,
        transition: 'opacity 0.6s ease',
        pointerEvents: 'none',
        transform: isHovered ? 'scale(1)' : 'scale(0.8)',
      }} />

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6" style={{ 
              background: `${agent.color}10`, 
              border: `1px solid ${agent.color}25`,
              transition: 'all 0.3s ease'
            }}>
              {agent.icon}
            </div>
            <div>
              <div className="text-sm font-extrabold" style={{ color: "#0a0a0a" }}>{agent.title}</div>
              <div className="text-[10px] mt-0.5" style={{ color: "#94a3b8" }}>{agent.features.length} capabilities</div>
            </div>
          </div>
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex-shrink-0 relative transition-all duration-500 group-hover:scale-110" style={{ 
            background: `conic-gradient(${agent.color} 0deg,${agent.color}88 200deg,#e2e8f0 200deg)`, 
            boxShadow: isHovered ? `0 0 40px ${agent.color}30` : `0 0 20px ${agent.color}15`
          }}>
            <div className="absolute inset-2 rounded-full bg-white flex flex-col items-center justify-center">
              <div className="text-xs sm:text-sm font-black leading-none" style={{ color: agent.color }}>{agent.metric}</div>
              <div className="text-[7px] sm:text-[8px] font-bold text-center mt-0.5 px-1 leading-tight" style={{ color: "#94a3b8" }}>{agent.metricLabel}</div>
            </div>
          </div>
        </div>
        
        <p className="text-xs sm:text-sm leading-relaxed mb-5" style={{ color: "#64748b" }}>{agent.desc}</p>
        
        <div className="mb-5">
          <div className="text-[9px] font-bold uppercase tracking-widest mb-2.5" style={{ color: "#94a3b8" }}>Key Capabilities</div>
          <div className="flex flex-wrap gap-1.5">
            {agent.features.map((f) => (
              <span key={f} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all duration-300" style={{ 
                background: `${agent.color}08`, 
                border: `1px solid ${agent.color}18`, 
                color: "#475569"
              }}>
                <span style={{ color: agent.color }}>✓</span>{f}
              </span>
            ))}
          </div>
        </div>
        
        <div className="h-px mb-4" style={{ background: "linear-gradient(90deg,transparent,#e2e8f0,transparent)" }} />
        
        <Link to="/register" className="text-xs sm:text-sm font-bold no-underline transition-all duration-300 flex items-center gap-1" style={{ color: agent.color }}>
          Learn More 
          <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
        </Link>
      </div>
    </div>
  );
}

function AgentsSection() {
  const [active, setActive] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (autoplay) {
      timerRef.current = setInterval(() => {
        setActive((a) => (a + 1) % AGENT_TYPES.length);
      }, 5000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoplay]);

  const handleDotClick = (index: number) => {
    setActive(index);
    setAutoplay(false);
    setTimeout(() => setAutoplay(true), 5000);
  };

  return (
    <section className="section-box white">
      <div className="section-pad">
        <div className="text-center mb-12 sm:mb-16">
          <div className="tag inline-flex items-center gap-1.5 border border-blue-600/20 rounded-full px-4 py-1.5 mb-5" style={{ background: "rgba(37,99,235,0.06)" }}>
            <span className="text-[10px] sm:text-xs font-bold tracking-widest" style={{ color: "#2563EB" }}>✦ MEET OUR AGENTS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[48px] font-black mb-4 leading-tight tracking-tight" style={{ color: "#0a0a0a" }}>
            Intelligent{" "}
            <span style={{ 
              background: "linear-gradient(135deg,#2563EB,#10B981,#34D399)", 
              WebkitBackgroundClip: "text", 
              WebkitTextFillColor: "transparent", 
              backgroundClip: "text",
              backgroundSize: '200% 200%',
              animation: 'gradientShift 4s ease-in-out infinite'
            }}>
              AI Voice Agents
            </span>{" "}
            <br className="hidden sm:block" />Tailored to Your Business
          </h2>
          <p className="text-sm sm:text-base max-w-xl mx-auto" style={{ color: "#64748b" }}>Deploy specialized voice assistants that look up information, book slots, and converse in 20+ languages.</p>
        </div>

        {/* Desktop Grid */}
        <div className="hidden lg:grid grid-cols-4 gap-5">
          {AGENT_TYPES.map((agent, i) => (
            <div key={i} style={{ animationDelay: `${i * 0.1}s` }} className="animate-fadeInUp">
              <AgentCard agent={agent} index={i} />
            </div>
          ))}
        </div>

        {/* Mobile Carousel */}
        <div className="lg:hidden relative px-10">
          <button 
            onClick={() => {
              setActive((a) => (a - 1 + AGENT_TYPES.length) % AGENT_TYPES.length);
              setAutoplay(false);
              setTimeout(() => setAutoplay(true), 5000);
            }} 
            className="absolute left-0 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full cursor-pointer flex items-center justify-center text-xl z-10 transition-all duration-300 hover:scale-110" 
            style={{ 
              background: "#fff", 
              border: "1px solid rgba(37,99,235,0.2)", 
              color: "#2563EB", 
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)" 
            }}
          >
            ‹
          </button>
          
          <div className="transition-all duration-500 ease-in-out">
            <AgentCard agent={AGENT_TYPES[active]} index={active} />
          </div>
          
          <button 
            onClick={() => {
              setActive((a) => (a + 1) % AGENT_TYPES.length);
              setAutoplay(false);
              setTimeout(() => setAutoplay(true), 5000);
            }} 
            className="absolute right-0 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full cursor-pointer flex items-center justify-center text-xl z-10 transition-all duration-300 hover:scale-110" 
            style={{ 
              background: "#fff", 
              border: "1px solid rgba(37,99,235,0.2)", 
              color: "#2563EB", 
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)" 
            }}
          >
            ›
          </button>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {AGENT_TYPES.map((_, i) => (
            <button 
              key={i} 
              onClick={() => handleDotClick(i)} 
              className="h-2 rounded-full border-none cursor-pointer transition-all duration-300 p-0" 
              style={{ 
                width: i === active ? 32 : 8, 
                background: i === active ? "linear-gradient(90deg,#2563EB,#10B981)" : "rgba(37,99,235,0.15)",
                transform: i === active ? 'scale(1)' : 'scale(0.8)',
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </section>
  );
}

/* ─── How It Works ─── */
function HowItWorks() {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);
  
  return (
    <section className="section-box tint">
      <div className="section-pad">
        <div className="text-center mb-12 sm:mb-16">
          <div className="tag inline-flex items-center gap-1.5 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-5" style={{ background: "rgba(16,185,129,0.06)" }}>
            <span className="text-[10px] sm:text-xs font-bold tracking-widest" style={{ color: "#10B981" }}>HOW IT WORKS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[48px] font-black mb-4 leading-tight tracking-tight" style={{ color: "#0a0a0a" }}>
            Go Live in{" "}
            <span style={{ 
              background: "linear-gradient(135deg,#10B981,#2563EB)", 
              WebkitBackgroundClip: "text", 
              WebkitTextFillColor: "transparent", 
              backgroundClip: "text" 
            }}>
              3 Simple Steps
            </span>
          </h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
          {HOW_IT_WORKS.map((step, i) => (
            <div 
              key={i} 
              className="relative group"
              onMouseEnter={() => setHoveredStep(i)}
              onMouseLeave={() => setHoveredStep(null)}
            >
              {i < HOW_IT_WORKS.length - 1 && (
                <div className="hidden sm:block absolute top-10 left-[60%] right-[-40%] h-px" style={{ 
                  background: `linear-gradient(90deg,${step.color}40,${HOW_IT_WORKS[i+1].color}20)`,
                  transform: hoveredStep === i || hoveredStep === i+1 ? 'scaleX(1.2)' : 'scaleX(1)',
                  transition: 'transform 0.3s ease'
                }} />
              )}
              <div className="rounded-2xl p-6 sm:p-8 transition-all duration-500 group-hover:-translate-y-2" style={{ 
                background: "#fff", 
                border: "1px solid rgba(37,99,235,0.1)",
                boxShadow: hoveredStep === i ? `0 20px 60px ${step.color}15` : 'none'
              }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-5 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6" style={{ 
                  background: `${step.color}08`, 
                  border: `1px solid ${step.color}20`,
                  transition: 'all 0.3s ease'
                }}>
                  {step.icon}
                </div>
                <div className="text-[10px] font-bold mb-2 tracking-widest" style={{ color: step.color }}>STEP {step.step}</div>
                <h3 className="text-lg font-extrabold mb-2" style={{ color: "#0a0a0a" }}>{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Trusted Brands ─── */
function TrustedSection() {
  return (
    <section className="section-box white">
      <div className="section-pad">
        <p className="text-center text-[10px] sm:text-xs font-bold tracking-widest mb-6" style={{ color: "#94a3b8" }}>TRUSTED BY 500+ BUSINESSES</p>
        <div className="flex flex-wrap justify-center gap-3">
          {TRUSTED_BRANDS.map((b, i) => (
            <div 
              key={b.name} 
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 hover:-translate-y-1 hover:shadow-md" 
              style={{ 
                background: "#f8fafc", 
                border: "1px solid #e2e8f0", 
                color: "#475569",
                animationDelay: `${i * 50}ms`
              }}
            >
              <svg className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: 0.4 }}>
                <path d={b.icon} />
              </svg>
              {b.name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Global Stats ─── */
function GlobalStats() {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="section-box tint" ref={ref}>
      <div className="section-pad">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 sm:gap-10 text-center">
          {GLOBAL_STATS.map((s, i) => (
            <div 
              key={s.label} 
              className="group cursor-default transition-all duration-500"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                transitionDelay: `${i * 0.1}s`
              }}
            >
              <div className="text-2xl sm:text-3xl font-black mb-2 transition-all duration-500 group-hover:scale-110" style={{ 
                background: "linear-gradient(135deg,#2563EB,#10B981)", 
                WebkitBackgroundClip: "text", 
                WebkitTextFillColor: "transparent", 
                backgroundClip: "text" 
              }}>
                {s.value}
              </div>
              <div className="text-[10px] sm:text-xs" style={{ color: "#64748b" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── CTA Section ─── */
function CTASection() {
  return (
    <section className="section-box black" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Animated background */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        left: '-20%',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
        animation: 'float 12s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-50%',
        right: '-20%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
        animation: 'float 10s ease-in-out infinite reverse',
      }} />
      
      <div className="section-pad text-center" style={{ position: 'relative', zIndex: 1 }}>
        <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-black mb-4 leading-tight" style={{ color: "#fff" }}>
          Deploy Your AI Agent Today
        </h2>
        <p className="text-sm sm:text-base mb-10 max-w-md mx-auto" style={{ color: "rgba(255,255,255,0.45)" }}>
          Join 500+ businesses already growing with Autoniv.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link 
            to="/register" 
            className="px-8 py-4 rounded-full text-sm font-bold text-white border-none cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:scale-105 no-underline text-center" 
            style={{ 
              background: "linear-gradient(135deg,#2563EB,#10B981)", 
              boxShadow: "0 4px 24px rgba(16,185,129,0.3)",
            }}
          >
            Book a Demo →
          </Link>
          <button 
            className="px-8 py-4 rounded-full text-sm font-bold cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:bg-white/10" 
            style={{ 
              background: "rgba(255,255,255,0.06)", 
              border: "1px solid rgba(255,255,255,0.15)", 
              color: "#fff" 
            }}
          >
            🎧 Talk to Expert
          </button>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(5deg); }
        }
      `}</style>
    </section>
  );
}

/* ─── Main ─── */
export function Agents() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <div className="min-h-screen relative" style={{ fontFamily: "'Plus Jakarta Sans',Inter,sans-serif" }}>
      <USPBanner />
      <Nav mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      <div className="page-bg" style={{ paddingTop: 120, paddingBottom: 8 }}>
        <div className="box-wrap">
          <Hero />
          <StatsBar />
          <AgentsSection />
          <HowItWorks />
          <TrustedSection />
          <GlobalStats />
          <CTASection />
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Agents;