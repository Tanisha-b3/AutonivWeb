import { useState, useEffect, useMemo } from "react";
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
  { value: "500+", label: "Businesses Served" },
  { value: "2M+", label: "Conversations Handled" },
  { value: "30%+", label: "Avg Increase in Conversions" },
  { value: "24/7", label: "AI Agents Working" },
  { value: "98%", label: "Client Satisfaction Rate" },
  { value: "₹50Cr+", label: "Revenue Generated for Clients" },
];

const AGENT_TYPES = [
  { icon: "📞", title: "AI Receptionist", desc: "Never miss another business call. Answers 24/7, handles FAQs, filters spam, and forwards high-priority calls.", features: ["Instant Call Routing", "Custom Greetings", "Spam Filtering"], color: "#2563EB", metric: "3.2X", metricLabel: "More Leads" },
  { icon: "📅", title: "Appointment Scheduler", desc: "Integrates with calendars to schedule, reschedule, or cancel client appointments on the call.", features: ["Calendar Sync", "SMS Confirmations", "Follow-up Automation"], color: "#10B981", metric: "+72%", metricLabel: "Bookings" },
  { icon: "💡", title: "FAQ Support Assistant", desc: "Trained on your knowledge base. Answers detailed product and service questions with 99%+ accuracy.", features: ["Knowledge Base Training", "Dynamic Responses", "Context Preservation"], color: "#f97316", metric: "99%", metricLabel: "Accuracy" },
  { icon: "🎯", title: "Lead Qualifier", desc: "Engages inbound leads instantly. Asks qualifying questions and syncs data to your CRM automatically.", features: ["CRM Auto-Sync", "Custom Scripts", "Sentiment Analysis"], color: "#8b5cf6", metric: "40%", metricLabel: "More Conversions" },
];

const TRUSTED_BRANDS = ["RealtyMax", "Care+ Clinics", "LearnUp", "The Skin Lounge", "EduSphere", "FitNation", "UrbanCart", "FinTrack"];

const NEWS = [
  { tag: "Product Release", tagColor: "#3b82f6", date: "June 18, 2026", title: "Autoniv 2.0 Released: Real-time Voice Cloning & Calendar Sync", desc: "Introducing state-of-the-art voice cloning and direct native integrations with Google Calendar.", read: "4 min read", emoji: "🖥️" },
  { tag: "Industry Guide", tagColor: "#10b981", date: "June 10, 2026", title: "How AI Voice Agents Are Redefining Customer Service in 2026", desc: "We analyze latency benchmarks, accuracy improvements, and why multi-lingual configs are vital.", read: "6 min read", emoji: "🎙️" },
  { tag: "Security", tagColor: "#8b5cf6", date: "May 28, 2026", title: "Autoniv Achieves SOC 2 Type II Security Certification", desc: "Autoniv has successfully completed the SOC 2 Type II audit for enterprise customers.", read: "3 min read", emoji: "🔒" },
  { tag: "Case Study", tagColor: "#f97316", date: "May 15, 2026", title: "How a Local Agency Scaled to 10,000 Inbound Calls", desc: "Read how PeakPlumbing integrated Autoniv scheduling agents to automate dispatch operations.", read: "5 min read", emoji: "🚐" },
];

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function Stars() {
  const stars = useMemo(() => {
    const rand = seededRandom(42);
    return Array.from({ length: 60 }, (_, i) => ({
      id: i, x: rand() * 100, y: rand() * 100,
      r: rand() * 1.4 + 0.4, op: rand() * 0.45 + 0.1, dur: rand() * 4 + 3,
    }));
  }, []);
  return (
    <svg className="fixed inset-0 w-full h-full pointer-events-none z-0" xmlns="http://www.w3.org/2000/svg">
      {stars.map((s) => (
        <circle key={s.id} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} fill="white" opacity={s.op}>
          <animate attributeName="opacity" values={`${s.op};${s.op * 0.15};${s.op}`} dur={`${s.dur}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </svg>
  );
}

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

// function Nav() {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const [menuOpen, setMenuOpen] = useState(false);
//   return (
//     <nav className="fixed top-9 left-0 right-0 z-50 border-b border-blue-600/15" style={{ background: "rgba(3,11,46,0.88)", backdropFilter: "blur(20px)" }}>
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
//         <Link to="/" className="flex items-center gap-2.5 no-underline">
//           <img src="/logo-autoniv.png" alt="Autoniv" className="h-35 w-auto" />
//         </Link>
//         <div className="hidden md:flex items-center gap-8">
//           {NAV_ITEMS.map((item) => (
//             <Link key={item.label} to={item.path} className={`text-sm font-bold transition-colors no-underline ${location.pathname === item.path ? "text-emerald-400" : "text-white/60 hover:text-white"}`}>
//               {item.label}
//             </Link>
//           ))}
//         </div>
//         <div className="hidden md:flex items-center gap-3">
//           <button onClick={() => navigate("/login")} className="bg-transparent border-none cursor-pointer text-sm font-medium text-white/60 px-4 py-2 rounded-lg transition-all hover:bg-blue-600/15 hover:text-white">Sign In</button>
//           <button onClick={() => navigate("/register")} className="border-none cursor-pointer text-white text-sm font-extrabold px-5 py-2.5 rounded-full transition-all hover:-translate-y-0.5" style={{ background: "linear-gradient(135deg,#2563EB,#10B981)", boxShadow: "0 4px 20px rgba(16,185,129,0.35)" }}>Get Started Free</button>
//         </div>
//         <button className="md:hidden flex flex-col gap-1.5 p-2 bg-transparent border-none cursor-pointer" onClick={() => setMenuOpen(!menuOpen)}>
//           <span className={`block w-5 h-0.5 bg-white transition-all ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
//           <span className={`block w-5 h-0.5 bg-white transition-all ${menuOpen ? "opacity-0" : ""}`} />
//           <span className={`block w-5 h-0.5 bg-white transition-all ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
//         </button>
//       </div>
//       {menuOpen && (
//         <div className="md:hidden border-t border-blue-600/15 px-4 py-4 flex flex-col gap-3" style={{ background: "rgba(3,11,46,0.97)" }}>
//           {NAV_ITEMS.map((item) => (
//             <Link key={item.label} to={item.path} onClick={() => setMenuOpen(false)} className={`text-sm font-bold py-2 no-underline ${location.pathname === item.path ? "text-emerald-400" : "text-white/60"}`}>{item.label}</Link>
//           ))}
//           <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
//             <button onClick={() => { navigate("/login"); setMenuOpen(false); }} className="text-sm font-medium text-white/60 py-2.5 rounded-lg bg-white/5 border border-white/10 text-center">Sign In</button>
//             <button onClick={() => { navigate("/register"); setMenuOpen(false); }} className="text-sm font-extrabold text-white py-2.5 rounded-full border-none" style={{ background: "linear-gradient(135deg,#2563EB,#10B981)" }}>Get Started Free</button>
//           </div>
//         </div>
//       )}
//     </nav>
//   );
// }

function DashboardMock() {
  const calls = [
    { num: "+1 (415) 879-2563", time: "10:24 AM", status: "Qualified", color: "#10B981" },
    { num: "+1 (213) 555-0198", time: "9:47 AM", status: "Booked", color: "#2563EB" },
    { num: "+1 (904) 555-0147", time: "9:12 AM", status: "Qualified", color: "#10B981" },
  ];
  const wavePoints = [40, 25, 50, 30, 60, 20, 55, 35, 65, 28, 58, 42, 70, 30, 52].map((v, i) => `${i * 50},${80 - v}`).join(" ");
  return (
    <div className="rounded-2xl border border-blue-600/30 overflow-hidden w-full" style={{ background: "rgba(5,15,50,0.9)", backdropFilter: "blur(20px)", boxShadow: "0 32px 80px rgba(0,0,0,0.5)" }}>
      <div className="flex overflow-x-auto border-b border-blue-600/15" style={{ background: "rgba(3,11,46,0.6)", scrollbarWidth: "none" }}>
        {["Overview", "Calls", "Leads", "Calendar", "Analytics", "Settings"].map((tab, i) => (
          <div key={tab} className={`flex items-center gap-1 px-3 py-2.5 text-[10px] whitespace-nowrap flex-shrink-0 ${i === 0 ? "font-bold text-emerald-400 border-b-2 border-emerald-400" : "font-medium text-white/40"}`}>
            <span className="text-[10px]">{["📊", "📞", "👥", "📅", "📈", "⚙️"][i]}</span>
            <span className="hidden sm:inline">{tab}</span>
          </div>
        ))}
      </div>
      <div className="p-3 sm:p-4">
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3">
          {[
            { label: "Total Calls", value: "12,458", up: "+28%", color: "#2563EB" },
            { label: "Qualified Leads", value: "3,682", up: "+32%", color: "#10B981" },
            { label: "Appointments", value: "1,256", up: "+24%", color: "#8b5cf6" },
          ].map((m) => (
            <div key={m.label} className="rounded-xl p-2 sm:p-3 border border-white/[0.07]" style={{ background: "rgba(255,255,255,0.04)" }}>
              <div className="text-[8px] sm:text-[10px] text-white/40 mb-1">{m.label}</div>
              <div className="text-sm sm:text-lg font-black text-white">{m.value}</div>
              <div className="text-[8px] sm:text-[10px] font-semibold mt-0.5" style={{ color: m.color }}>{m.up}</div>
            </div>
          ))}
        </div>
        <div className="rounded-xl p-2 sm:p-3 border border-white/[0.06] mb-3" style={{ background: "rgba(255,255,255,0.03)" }}>
          <div className="text-[10px] font-bold text-white/70 mb-2">Call Volume</div>
          <svg width="100%" height="60" viewBox="0 0 700 80" preserveAspectRatio="none">
            <defs><linearGradient id="wg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10B981" stopOpacity="0.4" /><stop offset="100%" stopColor="#10B981" stopOpacity="0" /></linearGradient></defs>
            <polyline points={wavePoints} fill="none" stroke="#10B981" strokeWidth="2" />
            <polygon points={`0,80 ${wavePoints} 700,80`} fill="url(#wg)" />
          </svg>
        </div>
        <div>
          <div className="text-[9px] font-bold text-white/40 mb-2 uppercase tracking-widest">Recent Calls</div>
          {calls.map((c) => (
            <div key={c.num} className="flex items-center gap-2 py-1.5 border-b border-white/[0.05]">
              <span className="text-[10px]">📞</span>
              <span className="flex-1 text-[9px] sm:text-[10px] text-white/70 font-mono truncate">{c.num}</span>
              <span className="text-[8px] sm:text-[10px] text-white/35 hidden sm:block">{c.time}</span>
              <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${c.color}22`, color: c.color }}>{c.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// function Hero() {
//   return (
//     <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 sm:pt-32 pb-12 sm:pb-16 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
//       <div>
//         <div className="inline-flex items-center gap-2 border border-blue-600/30 rounded-full px-3 sm:px-4 py-1.5 mb-5" style={{ background: "rgba(37,99,235,0.12)" }}>
//           <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10B981]" />
//           <span className="text-[9px] sm:text-[11px] text-blue-400 font-bold tracking-widest">LIVE AI AGENTS • POWERED BY AUTONIV</span>
//         </div>
//         <h1 className="text-3xl sm:text-4xl lg:text-[52px] font-black leading-[1.05] text-white mb-5" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
//           AI VOICE AGENTS<br />
//           <span style={{ background: "linear-gradient(135deg,#2563EB,#10B981,#34D399)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>THAT WORK 24/7</span><br />
//           SO YOU DON'T HAVE TO.
//         </h1>
//         <p className="text-sm sm:text-base text-white/55 leading-relaxed mb-7 max-w-md">
//           Autoniv's AI Voice Agents answer calls, qualify leads, and book appointments—so you never miss a customer again.
//         </p>
//         <div className="flex flex-col sm:flex-row gap-3 mb-7">
//           <button className="border-none cursor-pointer text-white text-sm font-bold px-7 py-3.5 rounded-full transition-all hover:-translate-y-1 text-center" style={{ background: "linear-gradient(135deg,#2563EB,#10B981)", boxShadow: "0 4px 24px rgba(16,185,129,0.4)" }}>Book a Demo →</button>
//           <button className="cursor-pointer text-white text-sm font-semibold px-6 py-3.5 rounded-full transition-all border border-white/20 hover:bg-white/10 text-center" style={{ background: "rgba(255,255,255,0.06)" }}>▶ See How It Works</button>
//         </div>
//         <div className="flex flex-wrap gap-4 sm:gap-6">
//           {["No credit card required", "Setup in minutes", "Cancel anytime"].map((t) => (
//             <div key={t} className="flex items-center gap-1.5 text-[11px] sm:text-xs text-white/55">
//               <span className="text-emerald-400">✓</span>{t}
//             </div>
//           ))}
//         </div>
//       </div>
//       <div className="relative">
//         <div className="absolute -inset-5 rounded-3xl pointer-events-none" style={{ background: "radial-gradient(ellipse at center, rgba(37,99,235,0.2) 0%, transparent 70%)" }} />
//         <DashboardMock />
//       </div>
//     </section>
//   );
// }

function StatsBar() {
  return (
    <div className="border-t border-b border-blue-600/20" style={{ background: "rgba(5,15,50,0.7)", backdropFilter: "blur(20px)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 sm:grid-cols-4 divide-x divide-white/[0.07]">
        {STATS.map((s) => (
          <div key={s.label} className="py-4 sm:py-5 flex items-center justify-center gap-2 sm:gap-3">
            <span className="text-lg sm:text-xl">{s.icon}</span>
            <div>
              <div className="text-base sm:text-xl font-black text-white">{s.value}</div>
              <div className="text-[9px] sm:text-[10px] text-white/40">{s.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AgentCard({ agent, active }) {
  return (
    <div className={`bg-white rounded-2xl p-5 sm:p-7 h-full transition-shadow duration-300 ${active ? "shadow-[0_24px_60px_rgba(16,185,129,0.2)]" : "shadow-[0_8px_24px_rgba(0,0,0,0.25)]"}`}>
      <div className="flex justify-between items-start mb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl" style={{ background: `linear-gradient(135deg,${agent.color}22,${agent.color}44)`, border: `1.5px solid ${agent.color}55` }}>{agent.icon}</div>
          <div className="text-sm font-extrabold text-slate-900">{agent.title}</div>
        </div>
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex-shrink-0 relative" style={{ background: `conic-gradient(${agent.color} 0deg,${agent.color}88 200deg,#e2e8f0 200deg)`, boxShadow: `0 0 24px ${agent.color}60` }}>
          <div className="absolute inset-1.5 rounded-full bg-white flex flex-col items-center justify-center">
            <div className="text-xs sm:text-sm font-black leading-none" style={{ color: agent.color }}>{agent.metric}</div>
            <div className="text-[7px] sm:text-[8px] font-bold text-slate-400 text-center mt-0.5 px-1 leading-tight">{agent.metricLabel}</div>
          </div>
        </div>
      </div>
      <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-4">{agent.desc}</p>
      <div className="mb-4">
        <div className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Key Capabilities</div>
        <div className="flex flex-wrap gap-1.5">
          {agent.features.map((f) => (
            <span key={f} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-semibold text-slate-500 bg-slate-100 border border-slate-200">
              <span style={{ color: agent.color }}>✓</span>{f}
            </span>
          ))}
        </div>
      </div>
      <div className="h-px mb-4" style={{ background: "linear-gradient(90deg,transparent,#e2e8f0,transparent)" }} />
      <a href="#" className="text-xs sm:text-sm font-bold no-underline" style={{ color: agent.color }}>Learn More →</a>
    </div>
  );
}

function AgentsCarousel() {
  const [active, setActive] = useState(1);
  const total = AGENT_TYPES.length;
  const prev = () => setActive((i) => (i - 1 + total) % total);
  const next = () => setActive((i) => (i + 1) % total);
  return (
    <div>
      <div className="relative md:hidden px-8">
        <button onClick={prev} className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-emerald-500/40 text-emerald-400 cursor-pointer flex items-center justify-center text-xl z-10" style={{ background: "rgba(3,11,46,0.7)", backdropFilter: "blur(10px)" }}>‹</button>
        <AgentCard agent={AGENT_TYPES[active]} active={true} />
        <button onClick={next} className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-emerald-500/40 text-emerald-400 cursor-pointer flex items-center justify-center text-xl z-10" style={{ background: "rgba(3,11,46,0.7)", backdropFilter: "blur(10px)" }}>›</button>
      </div>
      <div className="hidden md:block relative px-10">
        <button onClick={prev} className="absolute left-0 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full border border-emerald-500/40 text-emerald-400 cursor-pointer flex items-center justify-center text-xl z-10" style={{ background: "rgba(3,11,46,0.7)" }}>‹</button>
        <div className="grid grid-cols-3 gap-5 items-start">
          {[(active - 1 + total) % total, active, (active + 1) % total].map((si, pos) => (
            <div key={si} onClick={() => { if (pos === 0) prev(); if (pos === 2) next(); }} className="transition-all duration-500" style={{ opacity: pos === 1 ? 1 : 0.5, transform: pos === 1 ? "scale(1.03)" : "scale(0.96)", cursor: pos !== 1 ? "pointer" : "default" }}>
              <AgentCard agent={AGENT_TYPES[si]} active={pos === 1} />
            </div>
          ))}
        </div>
        <button onClick={next} className="absolute right-0 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full border border-emerald-500/40 text-emerald-400 cursor-pointer flex items-center justify-center text-xl z-10" style={{ background: "rgba(3,11,46,0.7)" }}>›</button>
      </div>
      <div className="flex justify-center gap-2 mt-6">
        {AGENT_TYPES.map((_, i) => (
          <button key={i} onClick={() => setActive(i)} className="h-2 rounded-full border-none cursor-pointer transition-all p-0" style={{ width: i === active ? 24 : 8, background: i === active ? "linear-gradient(90deg,#2563EB,#10B981)" : "rgba(255,255,255,0.2)" }} />
        ))}
      </div>
    </div>
  );
}

function AgentsSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
      <div className="text-center mb-10 sm:mb-14">
        <div className="inline-flex items-center gap-1.5 border border-blue-600/30 rounded-full px-3 sm:px-4 py-1.5 mb-5" style={{ background: "rgba(37,99,235,0.1)" }}>
          <span className="text-[9px] sm:text-[11px] text-blue-400 font-bold tracking-widest">✦ MEET OUR AGENTS</span>
        </div>
        <h2 className="text-2xl sm:text-4xl lg:text-[44px] font-black text-white mb-4 leading-tight">
          Intelligent{" "}
          <span style={{ background: "linear-gradient(135deg,#2563EB,#10B981,#34D399)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>AI Voice Agents</span>{" "}
          <br className="hidden sm:block" />Tailored to Your Business
        </h2>
        <p className="text-sm sm:text-base text-white/50 max-w-xl mx-auto">Deploy specialized voice assistants that look up information, book slots, and converse in 20+ languages.</p>
      </div>
      <AgentsCarousel />
    </section>
  );
}

function TrustedSection() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 sm:pb-16">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
        <span className="text-[9px] sm:text-[10px] font-bold text-white/30 tracking-widest whitespace-nowrap">• TRUSTED BY 500+ BUSINESSES •</span>
        <div className="flex flex-wrap gap-2">
          {TRUSTED_BRANDS.map((b) => (
            <span key={b} className="px-3 py-1.5 rounded-full text-[10px] sm:text-[11px] font-bold border border-white/10 text-white/60" style={{ background: "rgba(255,255,255,0.05)" }}>{b}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function GlobalStats() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-14 sm:pb-20">
      <div className="rounded-2xl sm:rounded-3xl overflow-hidden border border-emerald-500/20" style={{ background: "linear-gradient(120deg,rgba(37,99,235,0.25) 0%,rgba(3,11,46,0.8) 40%,rgba(16,185,129,0.2) 100%)", backdropFilter: "blur(20px)" }}>
        <div className="p-5 sm:p-10 grid grid-cols-2 sm:grid-cols-3 gap-5 sm:gap-8 text-center">
          {GLOBAL_STATS.map((s) => (
            <div key={s.label}>
              <div className="text-xl sm:text-3xl font-black mb-1.5" style={{ background: "linear-gradient(135deg,#2563EB,#10B981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{s.value}</div>
              <div className="text-[9px] sm:text-[11px] text-white/40">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function NewsSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-14 sm:pb-20">
      <div className="text-center mb-10 sm:mb-12">
        <h2 className="text-xl sm:text-2xl lg:text-[28px] font-black text-white mb-3 tracking-widest">LATEST NEWS & UPDATES</h2>
        <div className="w-10 h-0.5 rounded-full mx-auto" style={{ background: "linear-gradient(90deg,#2563EB,#10B981)" }} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
        {NEWS.map((n) => (
          <div key={n.title} className="border border-blue-600/15 rounded-2xl overflow-hidden cursor-pointer transition-all hover:-translate-y-1 hover:border-emerald-500/30" style={{ background: "rgba(5,15,50,0.7)" }}>
            <div className="h-28 sm:h-36 flex items-center justify-center text-4xl sm:text-5xl" style={{ background: "linear-gradient(135deg,rgba(37,99,235,0.2),rgba(16,185,129,0.1))" }}>{n.emoji}</div>
            <div className="p-3 sm:p-4">
              <span className="text-[8px] sm:text-[9px] font-bold px-2 py-1 rounded" style={{ background: `${n.tagColor}22`, color: n.tagColor }}>{n.tag}</span>
              <div className="text-[9px] sm:text-[10px] text-white/35 mt-2 mb-2">{n.date}</div>
              <div className="text-xs sm:text-sm font-extrabold text-white leading-snug mb-2">{n.title}</div>
              <p className="text-[10px] sm:text-[11px] text-white/45 leading-relaxed mb-3 line-clamp-3">{n.desc}</p>
              <div className="flex justify-between items-center">
                <span className="text-[9px] sm:text-[10px] text-white/30">{n.read}</span>
                <span className="text-[11px] sm:text-xs text-emerald-400">→</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="text-center">
        <button className="px-6 sm:px-8 py-2.5 sm:py-3 rounded-full border border-white/20 text-white text-sm font-semibold cursor-pointer inline-flex items-center gap-2 transition-colors hover:bg-white/10" style={{ background: "rgba(255,255,255,0.05)" }}>View All News →</button>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-14 sm:pb-20">
      <div className="rounded-2xl sm:rounded-3xl p-8 sm:p-16 text-center border border-emerald-500/25 relative overflow-hidden" style={{ background: "linear-gradient(135deg,rgba(37,99,235,0.2),rgba(3,11,46,0.95) 50%,rgba(16,185,129,0.15))" }}>
        <div className="flex justify-center mb-5 sm:mb-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-emerald-500/30 flex items-center justify-center text-3xl sm:text-4xl animate-bounce" style={{ background: "linear-gradient(135deg,rgba(37,99,235,0.4),rgba(16,185,129,0.3))", boxShadow: "0 0 40px rgba(16,185,129,0.3)" }}>🚀</div>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-[40px] font-black text-white mb-3">Deploy Your AI Agent Today</h2>
        <p className="text-sm sm:text-base text-white/50 mb-8 sm:mb-10">Join 500+ businesses already growing with Autoniv.</p>
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
          <button className="px-6 sm:px-8 py-3 sm:py-3.5 rounded-full text-sm font-bold text-white border-none cursor-pointer transition-all hover:-translate-y-0.5" style={{ background: "linear-gradient(135deg,#2563EB,#10B981)", boxShadow: "0 4px 20px rgba(255,255,255,0.2)" }}>Book a Demo →</button>
          <button className="px-6 sm:px-8 py-3 sm:py-3.5 rounded-full text-sm font-bold text-white cursor-pointer transition-all hover:bg-white/10" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)" }}>🎧 Talk to Expert</button>
        </div>
      </div>
    </div>
  );
}


export function Agents() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <div className="min-h-screen text-white relative" style={{ background: "linear-gradient(160deg,#030B2E 0%,#051530 40%,#030f28 70%,#020a1e 100%)", fontFamily: "'Plus Jakarta Sans',Inter,sans-serif" }}>
      <Stars />
      <div className="fixed -top-[15%] -left-[10%] w-[600px] sm:w-[700px] aspect-square rounded-full pointer-events-none z-0" style={{ background: "radial-gradient(circle,rgba(37,99,235,0.15) 0%,transparent 65%)" }} />
      <div className="fixed top-[30%] -right-[15%] w-[400px] sm:w-[600px] aspect-square rounded-full pointer-events-none z-0" style={{ background: "radial-gradient(circle,rgba(16,185,129,0.12) 0%,transparent 65%)" }} />
      <USPBanner />
      <Nav mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      <div className="relative z-10">
        {/* <Hero /> */}
        <StatsBar />
        <AgentsSection />
        <TrustedSection />
        <GlobalStats />
        <NewsSection />
        <CTASection />
        <Footer />
      </div>
    
    </div>
  );
}

export default Agents;
