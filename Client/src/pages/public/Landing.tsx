import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { contactService } from "../../services/api";

const AuthDialog = lazy(() => import('./AuthDialog').then(m => ({ default: m.AuthDialog })));
const LandingCallWidget = lazy(() => import('../../components/LandingCallWidget'));
import Footer from "./Footer";

const LOGO_SRC = "/autoniv.png";

/* ─── Data ───────────────────────────────────────────────── */
const features = [
  { icon: "🎙️", title: "AI Voice Agents", desc: "Deploy intelligent voice assistants with 20+ languages and 100+ realistic voices for natural, human-like conversation.", metric: "3×", metricLabel: "faster response", color: "#22c55e" },
  { icon: "🌍", title: "Global Language Support", desc: "Serve customers worldwide with AI agents that speak 20+ languages including English, Hindi, Arabic, and more.", metric: "20+", metricLabel: "languages", color: "#16a34a" },
  { icon: "🎧", title: "Premium Voice Selection", desc: "Choose from 100+ realistic voices across different ages, genders, and accents to match your brand perfectly.", metric: "100+", metricLabel: "voices", color: "#22c55e" },
  { icon: "📊", title: "Smart Analytics", desc: "Track call performance, lead conversion, and agent effectiveness with real-time dashboards.", metric: "99.8%", metricLabel: "accuracy rate", color: "#16a34a" },
  { icon: "🔗", title: "CRM Integration", desc: "Seamlessly sync leads and call data with your existing CRM and business tools.", metric: "50+", metricLabel: "integrations", color: "#22c55e" },
  { icon: "🛡️", title: "Enterprise Security", desc: "Bank-grade encryption and compliance for your business communication needs.", metric: "SOC 2", metricLabel: "certified", color: "#16a34a" },
];

const STEPS = [
  { n: "01", title: "Describe", desc: "Tell us what your agent should do in plain text — no code, no prompts, no config files.", icon: "✍️" },
  { n: "02", title: "Configure", desc: "Pick a voice, language, and persona. Fine-tune with drag-and-drop or just keep chatting with the editor.", icon: "🎛️" },
  { n: "03", title: "Test", desc: "Simulate real calls, edge cases, and stress scenarios before going live. Catch issues early.", icon: "🧪" },
  { n: "04", title: "Deploy", desc: "Go live on your phone number, website widget, or API in one click.", icon: "🚀" },
  { n: "05", title: "Observe", desc: "Live dashboards, call transcripts, sentiment scores, and conversion tracking — all in one place.", icon: "📊" },
];

const COMPARISON = [
  { capability: "24/7 Availability", autoniv: { text: "Always on", status: "yes" }, human: { text: "9–6 only", status: "no" }, dialers: { text: "Yes but robotic", status: "maybe" } },
  { capability: "Human-like conversation", autoniv: { text: "Natural AI dialogue", status: "yes" }, human: { text: "Inconsistent", status: "maybe" }, dialers: { text: "Robotic scripts", status: "no" } },
  { capability: "Custom scripts per business", autoniv: { text: "Fully tailored", status: "yes" }, human: { text: "Depends on rep", status: "maybe" }, dialers: { text: "Generic only", status: "no" } },
  { capability: "CRM + WhatsApp sync", autoniv: { text: "Full integration", status: "yes" }, human: { text: "Manual entry", status: "no" }, dialers: { text: "Limited", status: "maybe" } },
  { capability: "Real-time analytics", autoniv: { text: "Live dashboard", status: "yes" }, human: { text: "No structure", status: "no" }, dialers: { text: "Basic only", status: "maybe" } },
  { capability: "Setup time", autoniv: { text: "48 hours", status: "yes" }, human: { text: "2–4 weeks", status: "no" }, dialers: { text: "1–2 weeks", status: "maybe" } },
  { capability: "Cost vs. human team", autoniv: { text: "−65% cost", status: "yes" }, human: { text: "Highest cost", status: "highest" }, dialers: { text: "−20% only", status: "maybe" } },
  { capability: "Scale instantly", autoniv: { text: "120 → 12,000", status: "yes" }, human: { text: "Hire & retrain", status: "no" }, dialers: { text: "Limited", status: "maybe" } }
];

const renderCellContent = (status: string, text: string) => {
  if (status === "yes") return <span style={{ color: "#15803d", fontWeight: 600 }}><span style={{ marginRight: 6, fontWeight: 700 }}>✓</span>{text}</span>;
  if (status === "no") return <span style={{ color: "#64748b" }}><span style={{ marginRight: 6, color: "#94a3b8", fontWeight: 700 }}>✗</span>{text}</span>;
  if (status === "maybe") return <span style={{ color: "#64748b" }}><span style={{ marginRight: 6, color: "#94a3b8", fontWeight: 700 }}>~</span>{text}</span>;
  if (status === "highest") return <span style={{ color: "#ef4444", fontWeight: 600 }}>{text}</span>;
  return <span>{text}</span>;
};

const ADDONS = [
  { id: "performance-report", icon: "📊", title: "Monthly Performance Report", price: "₹3,999–₹6,999 / month", category: "recurring", description: "Branded PDF with call quality scores, script performance, A/B outcomes, and industry benchmarks." },
  { id: "ab-testing", icon: "🧪", title: "Script A/B Testing", price: "₹8,999 / month", category: "recurring", description: "Run two scripts simultaneously. Analyze conversion rates and receive an optimized version monthly." },
  { id: "whatsapp-sequences", icon: "💬", title: "WhatsApp Follow-Up Sequences", price: "₹4,999 / month", category: "recurring", description: "Automated post-call WhatsApp flows: reminders, no-show follow-ups, requalification messages." },
  { id: "regional-language", icon: "🌐", title: "Regional Language Agent", price: "₹8,000 / month per language", category: "recurring", description: "Hindi, Tamil, Telugu, Bengali — reach Tier 2/3 city leads in their native language." },
  { id: "reactivation", icon: "🔁", title: "Reactivation Campaigns", price: "₹14,999 / campaign", category: "one-time", description: "We call your dormant lead database quarterly. New pipeline with zero new ad spend." },
  { id: "white-label", icon: "🏷️", title: "White-Label Reseller", price: "₹49,999 setup + revenue share", category: "one-time", description: "Agencies and consultants: resell Autoniv under your brand with full support." },
];

const testimonials = [
  { name: "Sarah Chen", role: "CEO, HealthFirst Clinic", quote: "Autoniv transformed our patient intake. We handle 3× more calls with the same staff.", initials: "SC", metric: "+40% leads" },
  { name: "Marcus Johnson", role: "Director, BrightHome Services", quote: "The AI receptionist never sleeps. Our leads increased by 40% in the first month alone.", initials: "MJ", metric: "3× capacity" },
  { name: "Emily Rodriguez", role: "VP Operations, FastTrack Auto", quote: "Setup was instant. The AI sounds so natural, customers don't know it's not human.", initials: "ER", metric: "2min setup" },
];

const useCases = [
  { title: "Healthcare", desc: "Automate patient scheduling, prescription reminders, and follow-up calls.", icon: "🏥", stat: "60% fewer no-shows" },
  { title: "Real Estate", desc: "Qualify leads, schedule viewings, and follow up on listings 24/7.", icon: "🏠", stat: "3× more qualified leads" },
  { title: "Financial Services", desc: "Handle loan inquiries, payment reminders, and account support calls.", icon: "🏦", stat: "50% cost reduction" },
];

const integrationsRow1 = [
  { name: "Azure", icon: "☁️" }, { name: "Gemini", icon: "💎" }, { name: "Anthropic", icon: "🧠" },
  { name: "Groq", icon: "⚡" }, { name: "Cartesia", icon: "🎙️" }, { name: "Make", icon: "🔄" },
  { name: "n8n", icon: "🔗" }, { name: "Google Calendar", icon: "📅" },
];

const integrationsRow2 = [
  { name: "WhatsApp", icon: "💬" }, { name: "Discord", icon: "💜" }, { name: "Instagram", icon: "📸" },
  { name: "Facebook", icon: "👤" }, { name: "Telegram", icon: "✈️" }, { name: "Google Docs", icon: "📄" },
  { name: "Microsoft", icon: "🪟" }, { name: "Twilio", icon: "📞" },
];

const CONVERSATION = [
  { role: "user", text: "Hi, I'd like to book an appointment", delay: 800 },
  { role: "agent", text: "Of course! What day works best for you?", delay: 2400 },
  { role: "user", text: "Next Tuesday around 2 PM if possible", delay: 4200 },
  { role: "agent", text: "Tuesday 2 PM is available — shall I confirm?", delay: 5900 },
  { role: "user", text: "Yes please!", delay: 7600 },
  { role: "agent", text: "Done! You're booked. See you Tuesday ✓", delay: 9100 },
];

/* ─── Noise Overlay ──────────────────────────────────────── */
function NoiseOverlay() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d")!; const S = 256;
    c.width = S; c.height = S;
    const id = ctx.createImageData(S, S);
    for (let i = 0; i < id.data.length; i += 4) {
      const v = Math.random() * 255;
      id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 10;
    }
    ctx.putImageData(id, 0, 0);
  }, []);
  return <canvas ref={ref} className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-[0.025]" style={{ imageRendering: "pixelated" }} />;
}

/* ─── Aurora ─────────────────────────────────────────────── */
function Aurora() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div className="aurora-orb aurora-1" /><div className="aurora-orb aurora-2" /><div className="aurora-orb aurora-3" />
    </div>
  );
}

/* ─── Waveform ───────────────────────────────────────────── */
function Waveform({ active, color = "#22c55e" }: { active: boolean; color?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2.5, height: 28 }}>
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} style={{ width: 2.5, borderRadius: 99, background: color, height: active ? `${8 + Math.abs(Math.sin(i * .75)) * 18}px` : "4px", opacity: active ? 1 : .2, animation: active ? `waveBar ${.55 + (i % 6) * .1}s ease-in-out ${i * .03}s infinite alternate` : "none", transition: "height .35s ease, opacity .35s ease" }} />
      ))}
    </div>
  );
}

/* ─── Voice Orb ──────────────────────────────────────────── */
function VoiceOrb({ speaking }: { speaking: "user" | "agent" | "idle" }) {
  const isAgent = speaking === "agent", isUser = speaking === "user";
  const coreColor = isAgent ? "#22c55e" : isUser ? "#16a34a" : "#64748b";
  const ringColor = isAgent ? "rgba(34,197,94,0.15)" : isUser ? "rgba(22,163,74,0.13)" : "rgba(100,116,139,0.05)";
  return (
    <div style={{ position: "relative", width: 160, height: 160, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {speaking !== "idle" && [0, 1, 2].map(i => (
        <div key={i} style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `1px solid ${ringColor}`, animation: `ringPulse 2s ease-out ${i * .65}s infinite`, pointerEvents: "none" }} />
      ))}
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px solid rgba(34,197,94,0.10)" }} />
      <div style={{ position: "absolute", width: 120, height: 120, borderRadius: "50%", background: isAgent ? "rgba(34,197,94,0.18)" : isUser ? "rgba(22,163,74,0.15)" : "rgba(100,116,139,0.05)", filter: "blur(28px)", transition: "background .6s ease" }} />
      <div style={{ position: "relative", zIndex: 2, width: 76, height: 76, borderRadius: "50%", background: speaking === "idle" ? "radial-gradient(circle at 35% 35%,#1a1a1a,#0a0a0a)" : isAgent ? "radial-gradient(circle at 35% 35%,#4ade80 0%,#22c55e 45%,#16a34a 100%)" : "radial-gradient(circle at 35% 35%,#4ade80 0%,#16a34a 60%,#15803d 100%)", border: `1.5px solid ${coreColor}35`, boxShadow: speaking !== "idle" ? `0 0 0 3px ${coreColor}15,0 0 40px ${coreColor}30,inset 0 1px 0 rgba(255,255,255,.12)` : "0 0 20px rgba(34,197,94,.10),inset 0 1px 0 rgba(255,255,255,.06)", transition: "all .5s cubic-bezier(.16,1,.3,1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={speaking === "idle" ? "#94a3b8" : "#fff"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "stroke .4s ease" }}>
          <rect x="9" y="2" width="6" height="12" rx="3" />
          <path d="M5 10a7 7 0 0014 0" /><line x1="12" y1="19" x2="12" y2="22" /><line x1="9" y1="22" x2="15" y2="22" />
        </svg>
      </div>
    </div>
  );
}

/* ─── Scroll Reveal ──────────────────────────────────────── */
function Reveal({ children, className, delay = 0, from = "bottom" }: { children: React.ReactNode; className?: string; delay?: number; from?: "bottom" | "left" | "right" | "scale" }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const t: Record<string, string> = { bottom: "translateY(32px)", left: "translateX(-32px)", right: "translateX(32px)", scale: "scale(0.92)" };
    el.style.opacity = "0"; el.style.transform = t[from];
    el.style.transition = `opacity .85s ${delay}s cubic-bezier(.16,1,.3,1),transform .85s ${delay}s cubic-bezier(.16,1,.3,1)`;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.style.opacity = "1"; el.style.transform = "none"; obs.disconnect(); } }, { threshold: .1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay, from]);
  return <div ref={ref} className={className}>{children}</div>;
}

/* ─── TiltCard ───────────────────────────────────────────── */
function TiltCard({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - .5; const y = (e.clientY - r.top) / r.height - .5;
    el.style.transform = `perspective(900px) rotateX(${-y * 10}deg) rotateY(${x * 10}deg) translateZ(14px)`;
    const sh = el.querySelector<HTMLElement>(".shine"); if (sh) sh.style.background = `radial-gradient(circle at ${(x + .5) * 100}% ${(y + .5) * 100}%,rgba(34,197,94,.10) 0%,transparent 60%)`;
  };
  const onLeave = () => { const el = ref.current; if (!el) return; el.style.transform = "perspective(900px) rotateX(0) rotateY(0)"; const sh = el.querySelector<HTMLElement>(".shine"); if (sh) sh.style.background = "transparent"; };
  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} className={className} style={{ transition: "transform .14s ease-out", transformStyle: "preserve-3d", ...style }}>
      <div className="shine absolute inset-0 rounded-[inherit] pointer-events-none z-10 transition-all duration-200" />
      {children}
    </div>
  );
}

/* ─── Magnetic Button ────────────────────────────────────── */
function MagBtn({ children, className, to, onClick, style }: { children: React.ReactNode; className: string; to?: string; onClick?: () => void; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.MouseEvent) => { const el = ref.current; if (!el) return; const r = el.getBoundingClientRect(); el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .35}px,${(e.clientY - r.top - r.height / 2) * .35}px)`; };
  const onLeave = () => { if (ref.current) ref.current.style.transform = "none"; };
  const inner = to ? <Link to={to} className={className} style={style}>{children}</Link> : <button onClick={onClick} className={className} style={style}>{children}</button>;
  return <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} style={{ transition: "transform .28s cubic-bezier(.23,1,.32,1)", display: "inline-block" }}>{inner}</div>;
}

/* ─── Contact Form ───────────────────────────────────────── */
function ContactForm() {
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [phone, setPhone] = useState("");
  const [company, setCompany] = useState(""); const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false); const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  const WA = "917065990307";
  const openWA = () => { const lines = ["Hello! I have an inquiry via Contact Us form:", "", `Name: ${name}`, `Email: ${email}`, phone ? `Phone: ${phone}` : "", company ? `Company: ${company}` : "", "", `Message: ${message}`].filter(Boolean); window.open(`https://wa.me/${WA}?text=${encodeURIComponent(lines.join("\n"))}`, "_blank"); };
  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); setLoading(true); setError(""); try { await contactService.submit({ name, email, phone, company, message }); openWA(); setSubmitted(true); } catch (err: any) { setError(err.response?.data?.message || "Something went wrong."); } finally { setLoading(false); }; };
  const inputStyle = { background: "rgba(34,197,94,.03)", border: "1px solid rgba(34,197,94,.18)", color: "#0a0a0a" } as React.CSSProperties;
  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => e.target.style.borderColor = "rgba(34,197,94,.5)";
  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => e.target.style.borderColor = "rgba(34,197,94,.18)";
  if (submitted) return (
    <div className="text-center py-8 space-y-4">
      <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center" style={{ background: "rgba(34,197,94,.1)", border: "1px solid rgba(34,197,94,.25)" }}>
        <svg className="w-7 h-7" fill="none" stroke="#16a34a" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
      </div>
      <h3 className="text-xl font-bold" style={{ color: "#0a0a0a" }}>Thank you!</h3>
      <p className="text-sm" style={{ color: "#52525b" }}>Your details have been sent to our team on WhatsApp. We'll get back to you within 24 hours.</p>
    </div>
  );
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[{ label: "Full Name *", type: "text", val: name, set: setName, ph: "John Doe", req: true }, { label: "Email *", type: "email", val: email, set: setEmail, ph: "you@company.com", req: true }].map(f => (
          <div key={f.label}><label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#52525b" }}>{f.label}</label>
            <input type={f.type} required={f.req} value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph} className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all placeholder-black/30" style={inputStyle} onFocus={onFocus} onBlur={onBlur} /></div>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[{ label: "Phone", type: "tel", val: phone, set: setPhone, ph: "9876543210" }, { label: "Company", type: "text", val: company, set: setCompany, ph: "Your Company" }].map(f => (
          <div key={f.label}><label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#52525b" }}>{f.label}</label>
            <input type={f.type} value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph} className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all placeholder-black/30" style={inputStyle} onFocus={onFocus} onBlur={onBlur} /></div>
        ))}
      </div>
      <div><label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#52525b" }}>Message *</label>
        <textarea required rows={4} value={message} onChange={e => setMessage(e.target.value)} placeholder="Tell us about your needs — team size, call volume, use case..." className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all resize-none placeholder-black/30" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
      </div>
      {error && <p className="text-sm font-medium" style={{ color: "#ff4d4d" }}>{error}</p>}
      <button type="submit" disabled={loading} className="btn-cta btn-responsive-lg w-full font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50">
        {loading ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Sending…</> : <>Send Message<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg></>}
      </button>
      <p className="text-center text-[11px]" style={{ color: "#a1a1aa" }}>No spam. We'll only reach out to discuss your requirements.</p>
    </form>
  );
}

/* ─── Main Component ─────────────────────────────────────── */
export function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authDialog, setAuthDialog] = useState<"login" | "register" | "forgot_password" | "reset_password" | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "register" | "forgot_password" | "reset_password">("login");
  const [activeUseCase, setActiveUseCase] = useState(0);
  // Demo state
  const [demoMsgs, setDemoMsgs] = useState<{ role: string; text: string; id: number }[]>([]);
  const [speaking, setSpeaking] = useState<"user" | "agent" | "idle">("idle");
  const [demoRunning, setDemoRunning] = useState(false);
  const [demoDone, setDemoDone] = useState(false);
  const demoTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);

  const openAuth = (mode: typeof authMode) => { setAuthMode(mode); setAuthDialog(mode); };
  const closeAuth = () => setAuthDialog(null);
  const scrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => { e.preventDefault(); document.querySelector(id)?.scrollIntoView({ behavior: "smooth" }); };

  useEffect(() => { const f = () => setScrolled(window.scrollY > 24); window.addEventListener("scroll", f, { passive: true }); return () => window.removeEventListener("scroll", f); }, []);
  useEffect(() => { if (!mobileMenuOpen) return; const c = (e: MouseEvent) => { if (navRef.current && !navRef.current.contains(e.target as Node)) setMobileMenuOpen(false); }; document.addEventListener("mousedown", c); return () => document.removeEventListener("mousedown", c); }, [mobileMenuOpen]);
  useEffect(() => { const t = setInterval(() => setActiveUseCase(i => (i + 1) % useCases.length), 3500); return () => clearInterval(t); }, []);
  useEffect(() => {
    const container = chatEndRef.current?.parentElement;
    if (container) container.scrollTop = container.scrollHeight;
  }, [demoMsgs]);
  useEffect(() => () => { demoTimers.current.forEach(clearTimeout); }, []);

  // Auto-play demo when section is visible
  const demoSectionRef = useRef<HTMLDivElement>(null);
  const demoRunningRef = useRef(false);
  useEffect(() => { demoRunningRef.current = demoRunning; }, [demoRunning]);
  useEffect(() => {
    const el = demoSectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !demoRunningRef.current) {
        setTimeout(() => startDemo(), 600);
      }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const startDemo = () => {
    demoTimers.current.forEach(clearTimeout); demoTimers.current = [];
    setDemoMsgs([]); setSpeaking("idle"); setDemoDone(false); setDemoRunning(true);
    CONVERSATION.forEach((msg, i) => {
      const tS = setTimeout(() => setSpeaking(msg.role as "user" | "agent"), msg.delay - 350);
      const tM = setTimeout(() => {
        setDemoMsgs(p => [...p, { ...msg, id: i }]);
        const next = CONVERSATION[i + 1]; const gap = next ? next.delay - msg.delay : 1800;
        if (gap > 900) { const tI = setTimeout(() => setSpeaking("idle"), Math.min(gap - 400, 1200)); demoTimers.current.push(tI); }
        if (i === CONVERSATION.length - 1) { const tD = setTimeout(() => { setDemoMsgs([]); setDemoDone(false); startDemo(); }, 1800); demoTimers.current.push(tD); }
      }, msg.delay);
      demoTimers.current.push(tS, tM);
    });
  };

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: "#ffffff", fontFamily: "'Plus Jakarta Sans',sans-serif", color: "#475569" }}>
      {/* JSON-LD Structured Data for SEO/AEO/GEO */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Autoniv",
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "Web",
          "description": "Deploy intelligent AI voice agents that handle calls 24/7 in 20+ languages. Automate appointments, qualify leads, and boost conversions.",
          "url": "https://autoniv.com",
          "logo": "https://autoniv.com/logo-autoniv.png",
          "screenshot": "https://autoniv.com/og-image.png",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR", "description": "Free tier available" },
          "featureList": ["AI Voice Agents", "20+ Languages Support", "100+ Realistic Voices", "Smart Analytics", "CRM Integration", "Enterprise Security"],
          "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.8", "ratingCount": "150" },
          "author": { "@type": "Organization", "name": "Autoniv", "url": "https://autoniv.com" }
        })
      }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Autoniv",
          "url": "https://autoniv.com",
          "logo": "https://autoniv.com/logo-autoniv.png",
          "description": "AI Voice Agents for Business Communication",
          "sameAs": [],
          "contactPoint": { "@type": "ContactPoint", "contactType": "Sales", "availableLanguage": ["English", "Hindi"] }
        })
      }} />

      <Suspense fallback={null}>
        <AuthDialog isOpen={authDialog !== null} mode={authMode} onClose={closeAuth} onSwitch={(m) => { setAuthMode(m); setAuthDialog(m); }} />
        <LandingCallWidget />
      </Suspense>
      <Aurora />
      <NoiseOverlay />

      <style>{`
        html, body { max-width: 100%; overflow-x: hidden; }
        :root{--bg:#ffffff;--s1:#f8fafc;--s2:#f1f5f9;--card:rgba(255,255,255,0.75);--border:rgba(34,197,94,0.08);--text:#0f172a;--muted:#475569;--dim:#94a3b8;--g1:#22c55e;--g2:#16a34a;--g3:#15803d;}

        /* ── Section box system ─────────────────────────── */
        .box-wrap{ max-width: 1440px; margin: 0 auto; padding: 0 20px; }
        .section-box{
          position: relative;
          border-radius: 28px;
          overflow: hidden;
          margin: 18px auto;
        }
        .section-box.white{
          background: #ffffff;
          border: 1px solid rgba(34,197,94,0.14);
          box-shadow: 0 1px 2px rgba(15,23,42,0.03), 0 24px 60px -24px rgba(34,197,94,0.12);
        }
        .section-box.tint{
          background: linear-gradient(180deg,#f4fdf6 0%, #eafbef 100%);
          border: 1px solid rgba(34,197,94,0.16);
          box-shadow: 0 1px 2px rgba(15,23,42,0.03), 0 24px 60px -24px rgba(34,197,94,0.14);
        }
        .section-box.black{
          background: #0a0a0a;
          border: 1px solid rgba(34,197,94,0.18);
          box-shadow: 0 1px 2px rgba(0,0,0,0.4), 0 30px 70px -20px rgba(0,0,0,0.55), 0 0 0 1px rgba(34,197,94,0.04) inset;
        }
        .section-pad{ padding: 72px 28px; }
        @media(min-width:768px){ .section-pad{ padding: 96px 56px; } }
        .page-bg{
          background:
            radial-gradient(900px 500px at 12% 0%, rgba(34,197,94,0.07), transparent 60%),
            radial-gradient(900px 600px at 88% 18%, rgba(22,163,74,0.06), transparent 60%),
            radial-gradient(1000px 700px at 50% 100%, rgba(34,197,94,0.05), transparent 60%),
            #ffffff;
        }

        @keyframes float-y-1{0%,100%{transform:translateY(0px)}50%{transform:translateY(-9px)}}
        @keyframes float-y-2{0%,100%{transform:translateY(0px)}50%{transform:translateY(-12px)}}
        @keyframes float-y-3{0%,100%{transform:translateY(0px)}50%{transform:translateY(-8px)}}
        @keyframes float-y-4{0%,100%{transform:translateY(0px)}50%{transform:translateY(-10px)}}
        @keyframes orbPulseGlow{0%,100%{transform:scale(1);box-shadow:0 0 24px rgba(34,197,94,0.4)}50%{transform:scale(1.05);box-shadow:0 0 40px rgba(34,197,94,0.6)}}
        @keyframes marquee{0%{transform:translateX(0%)}100%{transform:translateX(-50%)}}
        .animate-marquee{display:flex;width:max-content;animation:marquee 25s linear infinite}
        .animate-float-1{animation:float-y-1 6s ease-in-out infinite}
        .animate-float-2{animation:float-y-2 7s ease-in-out infinite}
        .animate-float-3{animation:float-y-3 5.5s ease-in-out infinite}
        .animate-float-4{animation:float-y-4 6.5s ease-in-out infinite}
        @keyframes waveBar{from{transform:scaleY(0.3);opacity:.4}to{transform:scaleY(1);opacity:1}}
        @keyframes shimmer{from{background-position:0% center}to{background-position:200% center}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes livePulse{0%{box-shadow:0 0 0 0 rgba(34,197,94,.3)}70%{box-shadow:0 0 0 9px rgba(34,197,94,0)}100%{box-shadow:0 0 0 0 rgba(34,197,94,0)}}
        @keyframes slideIn{from{opacity:0;transform:translateY(10px) scale(0.97)}to{opacity:1;transform:none}}
        @keyframes ringPulse{0%{transform:scale(1);opacity:.7}100%{transform:scale(2.6);opacity:0}}
        @keyframes auroraPulse{0%,100%{opacity:.6;transform:scale(1) translate(0,0)}33%{opacity:.8;transform:scale(1.15) translate(3%,-4%)}66%{opacity:.5;transform:scale(.95) translate(-3%,5%)}}
        @keyframes borderFlow{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
        @keyframes progressBar{from{width:0%}to{width:100%}}
        @keyframes orbIdle{0%,100%{opacity:.7}50%{opacity:1}}

        .gradient-text{background:linear-gradient(135deg,#22c55e 0%,#16a34a 60%,#15803d 100%);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 4s linear infinite;}
        .aurora-orb{position:absolute;border-radius:50%;filter:blur(80px);animation:auroraPulse ease-in-out infinite;}
        .aurora-1{width:700px;height:700px;top:-200px;left:-150px;background:radial-gradient(circle,rgba(34,197,94,0.08) 0%,transparent 70%);animation-duration:18s;}
        .aurora-2{width:500px;height:500px;top:20%;right:-100px;background:radial-gradient(circle,rgba(22,163,74,0.08) 0%,transparent 70%);animation-duration:22s;animation-delay:-8s;}
        .aurora-3{width:600px;height:600px;bottom:-150px;left:30%;background:radial-gradient(circle,rgba(21,128,61,0.07) 0%,transparent 70%);animation-duration:26s;animation-delay:-12s;}
        .animate-fade-up{animation:fadeUp .85s cubic-bezier(.16,1,.3,1) both;}
        .animate-blink{animation:blink 1.1s step-start infinite;}
        .animate-live-pulse{animation:livePulse 2s infinite;}
        .animate-slide-in{animation:slideIn .4s cubic-bezier(.16,1,.3,1) both;}
        .delay-100{animation-delay:.1s}.delay-200{animation-delay:.2s}.delay-300{animation-delay:.3s}.delay-400{animation-delay:.4s}.delay-500{animation-delay:.5s}

        .glass-card{background:rgba(255,255,255,0.7);backdrop-filter:blur(20px);border:1px solid rgba(34,197,94,0.06);box-shadow:0 4px 30px rgba(0,0,0,0.02);}
        .glass-card:hover{border-color:rgba(34,197,94,0.18);box-shadow:0 10px 40px rgba(34,197,94,0.04);}
        .glass-card-dark{background:rgba(255,255,255,0.04);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.08);}
        .glass-card-dark:hover{border-color:rgba(34,197,94,0.30);background:rgba(255,255,255,0.06);}

        .btn-cta{background:linear-gradient(135deg,#22c55e,#16a34a);background-size:200% 200%;animation:borderFlow 4s ease infinite;box-shadow:0 0 0 1px rgba(255,255,255,.15) inset,0 4px 14px rgba(34,197,94,.20);transition:transform .18s cubic-bezier(.16,1,.3,1),box-shadow .18s;}
        .btn-cta:hover{transform:translateY(-2px);box-shadow:0 0 0 1px rgba(255,255,255,.20) inset,0 6px 20px rgba(22,163,74,.30);}
        .btn-ghost{border:1px solid rgba(34,197,94,.20);color:#22c55e;transition:all .25s cubic-bezier(.16,1,.3,1);}
        .btn-ghost:hover{background:rgba(34,197,94,.06);border-color:rgba(34,197,94,.40);transform:translateY(-2px);}
        .btn-ghost-dark{border:1px solid rgba(34,197,94,.35);color:#4ade80;transition:all .25s cubic-bezier(.16,1,.3,1);}
        .btn-ghost-dark:hover{background:rgba(34,197,94,.10);border-color:rgba(34,197,94,.6);transform:translateY(-2px);}

        .nav-glass{background:linear-gradient(90deg, rgba(255,255,255,0.88) 0%, rgba(220,252,231,0.85) 100%);backdrop-filter:blur(24px);border-bottom:1px solid rgba(34,197,94,0.12);}
        .nav-glass.scrolled{box-shadow:0 4px 30px rgba(34,197,94,0.06);}

        .divider{height:1px;background:linear-gradient(90deg,transparent,rgba(34,197,94,.08),rgba(22,163,74,.12),rgba(34,197,94,.08),transparent);}

        .btn-responsive{padding:10px 18px;border-radius:12px;font-size:13px;min-height:42px;}
        .btn-responsive-lg{padding:14px 24px;border-radius:14px;font-size:14px;min-height:48px;}
        .btn-responsive-xl{padding:16px 28px;border-radius:16px;font-size:15px;min-height:52px;}
        @media(min-width:640px){.btn-responsive{padding:12px 22px;font-size:14px;min-height:44px;}.btn-responsive-lg{padding:16px 28px;font-size:15px;min-height:50px;}.btn-responsive-xl{padding:18px 32px;font-size:16px;min-height:54px;}}
        @media(min-width:1024px){.btn-responsive{padding:14px 28px;font-size:15px;min-height:48px;}.btn-responsive-lg{padding:18px 36px;font-size:16px;min-height:54px;}.btn-responsive-xl{padding:20px 40px;font-size:17px;min-height:58px;}}

        .tag{font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:500;letter-spacing:0.12em;text-transform:uppercase;}
        .logo-img{height:140px;width:auto;object-fit:contain;}

        .step-line{position:absolute;left:19px;top:44px;bottom:-24px;width:1px;background:linear-gradient(to bottom,rgba(34,197,94,0.25),rgba(34,197,94,0.05));}

        .feature-card{transform-style:preserve-3d;transition:box-shadow .45s cubic-bezier(.16,1,.3,1),border-color .3s;}
        .feature-card:hover{box-shadow:0 32px 80px rgba(34,197,94,.10),0 8px 28px rgba(0,0,0,0.05);}

        .use-case-tab{position:relative;transition:all .3s cubic-bezier(.16,1,.3,1);cursor:pointer;}
        .use-case-tab.active::after{content:'';position:absolute;bottom:-1px;left:0;right:0;height:2px;background:linear-gradient(90deg,#22c55e,#16a34a);border-radius:1px;}
        .progress-bar{animation:progressBar 3.5s linear;}

        .testimonial-card{transition:transform .4s cubic-bezier(.16,1,.3,1),box-shadow .4s;}
        .testimonial-card:hover{transform:perspective(1000px) rotateY(-5deg) rotateX(3deg) translateZ(10px);box-shadow:0 24px 60px rgba(34,197,94,.10);}

        .stat-pill{background:rgba(255,255,255,.80);border:1px solid rgba(34,197,94,.14);transition:all .3s cubic-bezier(.16,1,.3,1);}
        .stat-pill:hover{background:rgba(255,255,255,.95);border-color:rgba(34,197,94,.35);transform:translateY(-3px);box-shadow:0 10px 30px rgba(34,197,94,.10);}

        .chat-bubble-in{animation:slideIn .4s cubic-bezier(.16,1,.3,1) both;}
        .orb-idle{animation:orbIdle 3s ease-in-out infinite;}

        .use-case-tabs::-webkit-scrollbar{display:none;}

        @media(max-width:640px){
          .section-box{ border-radius: 20px; margin: 12px auto; }
          .section-pad{ padding: 48px 18px; }
          .demo-grid{grid-template-columns:1fr !important;min-height:auto !important;}
          .demo-grid > div:first-child{border-right:none !important;border-bottom:1px solid rgba(255,255,255,0.08) !important;padding:28px 20px !important;min-height:200px;}
          .demo-grid > div:last-child{padding:16px !important;min-height:200px;}
          .use-case-tabs{gap:2px !important;}
          .use-case-tabs button{padding:8px 10px !important;font-size:12px !important;}
          .integrations-grid{grid-template-columns:repeat(3,1fr) !important;}
          .use-case-card{padding:20px !important;}
          .use-case-card .icon{font-size:36px !important;margin-bottom:12px !important;}
          .use-case-card h3{font-size:18px !important;}
          .use-case-card p{font-size:14px !important;}
          .integrations-grid .glass-card{padding:10px !important;}
          .integrations-grid .glass-card span:first-child{font-size:18px !important;}
          .integrations-grid .glass-card span:last-child{font-size:9px !important;}
          .hero-cta-row{display:flex !important;flex-wrap:nowrap !important;gap:8px !important;width:100% !important;}
          .hero-cta-row > *{flex:1 1 0 !important;min-width:0 !important;max-width:none !important;display:flex !important;align-items:center !important;justify-content:center !important;min-height:42px !important;font-size:11.5px !important;padding:8px 8px !important;gap:5px !important;white-space:nowrap !important;overflow:hidden !important;border-radius:999px !important;}
          .hero-cta-row > * svg.w-4{width:12px !important;height:12px !important;flex-shrink:0 !important;}
          .hero-cta-row > * .w-6{width:20px !important;height:20px !important;flex-shrink:0 !important;}
          .hero-cta-row > * .w-2\\.5{width:7px !important;height:7px !important;}
        }
      `}</style>

      {/* ══════════════════════════════════════════════
          NAV
      ══════════════════════════════════════════════ */}
      <nav ref={navRef} className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 nav-glass${scrolled ? " scrolled" : ""}`}>
        <div className="max-w-7xl mx-auto px-2 sm:px-4 h-[68px] flex items-center justify-between">
          <Link to="/"><img src={LOGO_SRC} alt="Autoniv" className="logo-img" /></Link>
          <div className="hidden sm:flex items-center gap-7">
            {["#features", "#how-it-works", "#addons", "#contact"].map((href, i) => (
              <a key={href} href={href} onClick={e => scrollTo(e, href)} className="text-sm font-medium transition-colors" style={{ color: "#475569" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#0a0a0a")} onMouseLeave={e => (e.currentTarget.style.color = "#475569")}>
                {["Features", "How It Works", "Add-Ons", "Contact"][i]}
              </a>
            ))}
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <button onClick={() => openAuth("login")} className="px-4 py-2 text-sm font-medium rounded-lg transition-colors" style={{ color: "#475569" }}
              onMouseEnter={e => { e.currentTarget.style.color = "#0a0a0a"; e.currentTarget.style.background = "rgba(34,197,94,.07)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "#475569"; e.currentTarget.style.background = "transparent"; }}>Sign In</button>
            <MagBtn onClick={() => openAuth("register")} className="btn-cta btn-responsive font-bold text-white">Get Started Free</MagBtn>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="sm:hidden p-2" style={{ color: "#475569", background: "none", border: "none", cursor: "pointer" }}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="sm:hidden px-5 py-4 space-y-1" style={{ background: "rgba(255,255,255,.98)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(34,197,94,.10)" }}>
            {["#features", "#how-it-works", "#addons", "#contact"].map((href, i) => (
              <a key={href} href={href} onClick={e => { scrollTo(e, href); setMobileMenuOpen(false); }} className="block px-4 py-3 text-sm font-medium rounded-xl" style={{ color: "#475569" }}>
                {["Features", "How It Works", "Add-Ons", "Contact"][i]}
              </a>
            ))}
            <div className="pt-2 space-y-2">
              <button onClick={() => { openAuth("login"); setMobileMenuOpen(false); }} className="block w-full text-left px-4 py-3 text-sm font-medium rounded-xl" style={{ color: "#475569", background: "none", border: "none", cursor: "pointer" }}>Sign In</button>
              <button onClick={() => { openAuth("register"); setMobileMenuOpen(false); }} className="btn-cta btn-responsive block w-full text-center font-bold text-white">Get Started Free</button>
            </div>
          </div>
        )}
      </nav>

      <div className="page-bg" style={{ paddingTop: 84, paddingBottom: 8 }}>
        <div className="box-wrap">

          {/* ══════════════════════════════════════════════
              HERO — tint box
          ══════════════════════════════════════════════ */}
          <section className="section-box tint">
            <div className="section-pad relative overflow-hidden" style={{ paddingTop: 56, paddingBottom: 56 }}>
              <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(34,197,94,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(34,197,94,0.05) 1px,transparent 1px)", backgroundSize: "48px 48px", maskImage: "radial-gradient(ellipse 80% 50% at 50% 100%,black,transparent)", WebkitMaskImage: "radial-gradient(ellipse 80% 50% at 50% 100%,black,transparent)" }} />

              <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center w-full">
                {/* Left Column */}
                <div className="lg:col-span-7 flex flex-col justify-center text-left space-y-6 lg:space-y-8 z-10">
                  <div className="animate-fade-up delay-100">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full tag" style={{ color: "#15803d", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.3)" }}>
                      ✦ AI Voice • Chat Solutions
                    </span>
                  </div>

                  <div className="animate-fade-up delay-200">
                    <h1 className="font-extrabold leading-[1.08] tracking-tight" style={{ fontSize: "clamp(38px,5vw,66px)", color: "#0a0a0a" }}>
                      AI Employees That <span className="block sm:inline" style={{ background: "linear-gradient(135deg,#22c55e,#16a34a,#15803d)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Never Miss A Call</span>
                    </h1>
                  </div>

                  <p className="animate-fade-up delay-300 text-[#475569] text-base sm:text-lg leading-relaxed max-w-[560px] m-0">
                    Deploy AI Voice Agents and AI Chatbots that handle calls, chats, and more – 24/7. Qualify leads, book appointments, answer questions and delight customers automatically.
                  </p>

                  <div className="mt-6 hero-cta-row animate-fade-up delay-400 flex flex-wrap items-center gap-4">
                    <MagBtn onClick={() => openAuth("register")} className="btn-cta btn-responsive-lg font-bold flex items-center justify-center gap-2" style={{ background: "linear-gradient(135deg,#22c55e,#15803d)", boxShadow: "0 4px 16px rgba(34,197,94,0.35)", color: "#ffffff", whiteSpace: "nowrap" }}>
                      Book a Free Demo
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                    </MagBtn>
                    <button onClick={() => openAuth("register")} className="btn-ghost btn-responsive-lg font-medium flex items-center justify-center gap-2.5" style={{ background: "#fff", color: "#15803d", borderColor: "rgba(34,197,94,0.4)", cursor: "pointer", whiteSpace: "nowrap" }}>
                      <span className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(34,197,94,0.1)" }}>
                        <svg className="w-2.5 h-2.5" style={{ fill: "#16a34a" }} viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" fill="#16a34a" /></svg>
                      </span>
                      Watch Live Demo
                    </button>
                  </div>

                  {/* Social Proof */}
                  <div className="animate-fade-up delay-500 flex flex-wrap items-center gap-4 pt-4">
                    <div className="flex -space-x-2">
                      {[
                        { init: "SC", bg: "#16a34a" }, { init: "MJ", bg: "#15803d" }, { init: "ER", bg: "#22c55e" }, { init: "AK", bg: "#166534" }
                      ].map((av, i) => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold text-white shadow-sm" style={{ background: av.bg, zIndex: 5 - i }}>{av.init}</div>
                      ))}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, k) => (
                          <svg key={k} className="w-4 h-4" style={{ fill: "#f59e0b" }} viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <p className="text-xs text-[#475569] m-0">
                        Trusted by <span className="font-semibold text-slate-800">100+</span> businesses
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Column — Phone mockup & floating cards */}
                <div className="lg:col-span-5 flex justify-center items-center relative min-h-[400px] lg:min-h-[580px] z-10 w-full pt-10 lg:pt-0">
                  <div className="absolute top-[20%] left-[20%] w-[320px] h-[320px] rounded-full bg-[radial-gradient(circle,rgba(34,197,94,0.16)_0%,transparent_70%)] filter blur-3xl pointer-events-none" />
                  <div className="absolute bottom-[20%] right-[10%] w-[260px] h-[260px] rounded-full bg-[radial-gradient(circle,rgba(22,163,74,0.12)_0%,transparent_70%)] filter blur-3xl pointer-events-none" />

                  <div className="w-[180px] h-[360px] sm:w-[245px] sm:h-[490px] bg-[#0a0a0a] rounded-[32px] sm:rounded-[42px] border-[5px] sm:border-[7px] border-[#1a1a1a] shadow-2xl relative flex flex-col items-center p-2 sm:p-3 select-none mx-auto" style={{ transform: "rotate(3deg)", transformStyle: "preserve-3d" }}>
                    <div className="w-24 h-4 bg-black rounded-full absolute top-2.5 z-30" />
                    <div className="absolute inset-0 rounded-[35px] overflow-hidden bg-gradient-to-b from-[#0f0f0f] via-[#0a0a0a] to-[#030303] z-0" />

                    <div className="relative z-10 w-full h-full flex flex-col items-center justify-between py-6">
                      <div className="text-center mt-3">
                        <p className="text-xs text-slate-400 font-medium tracking-wide uppercase m-0">AI Voice Agent</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5 m-0">00:24</p>
                      </div>

                      <div className="relative w-24 h-24 sm:w-36 sm:h-36 flex items-center justify-center">
                        <div className="absolute w-20 h-20 sm:w-32 sm:h-32 rounded-full border border-green-500/20 animate-ping" style={{ animationDuration: "3s" }} />
                        <div className="absolute w-16 h-16 sm:w-24 sm:h-24 rounded-full border border-emerald-500/15 animate-ping" style={{ animationDuration: "2s" }} />
                        <div className="w-18 h-18 rounded-full flex items-center justify-center shadow-lg relative overflow-hidden" style={{ animation: "orbPulseGlow 3s ease-in-out infinite", background: "linear-gradient(135deg,#22c55e,#15803d)", boxShadow: "0 0 24px rgba(34,197,94,0.4)" }}>
                          <div className="absolute inset-2 rounded-full bg-slate-900/60 flex items-center justify-center">
                            <svg className="w-5 h-5 text-green-400 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div className="w-full px-4 space-y-4">
                        <div className="grid grid-cols-3 gap-y-3 text-center">
                          {[{ icon: "🎙️", label: "Mute" }, { icon: "🔢", label: "Keypad" }, { icon: "🔊", label: "Speaker" }].map((item, idx) => (
                            <div key={idx} className="flex flex-col items-center">
                              <div className="w-9 h-9 rounded-full bg-slate-800/60 border border-slate-700/30 flex items-center justify-center text-sm text-slate-300">{item.icon}</div>
                              <span className="text-[9px] text-slate-400 mt-1">{item.label}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-center">
                          <div className="w-11 h-11 rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/20 cursor-pointer hover:bg-red-600 transition-colors">
                            <svg className="w-5 h-5 text-white transform rotate-[135deg]" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M21 16.5c0 .38-.21.71-.53.88l-7.9 4.44c-.16.12-.36.18-.57.18-.21 0-.41-.06-.57-.18l-7.9-4.44A1.003 1.003 0 0 1 3.5 16.5v-9c0-.38.21-.71.53-.88l7.9-4.44c.16-.12.36-.18.57-.18s.41.06.57.18l7.9 4.44c.32.17.53.5.53.88v9z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Floating Card 1: Incoming Call */}
                  <div className="hidden sm:block absolute top-[8%] -left-[8%] sm:-left-[8%] z-20 pointer-events-auto">
                    <div className="animate-float-1 w-[185px] bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-[0_8px_28px_rgba(34,197,94,0.10)] border border-[rgba(34,197,94,0.2)] flex flex-col gap-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-semibold text-[#15803d] tracking-wide uppercase">Incoming Call</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800 m-0" style={{ color: "#0a0a0a" }}>+1 (415) 555-0178</div>
                        <p className="text-[9px] text-slate-500 m-0 mt-0.5">Sales Inquiry</p>
                      </div>
                      <div className="flex gap-2 justify-end mt-1">
                        <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center cursor-pointer hover:bg-red-200 transition-colors"><span className="text-[9px]">❌</span></div>
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center cursor-pointer hover:bg-green-200 transition-colors"><span className="text-[9px]">📞</span></div>
                      </div>
                    </div>
                  </div>

                  {/* Floating Card 2: Appointment Booked */}
                  <div className="hidden sm:block absolute bottom-[16%] -left-[5%] sm:-left-[8%] z-20 pointer-events-auto">
                    <div className="animate-float-2 w-[180px] bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-[0_8px_28px_rgba(34,197,94,0.10)] border border-[rgba(34,197,94,0.2)] flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[rgba(34,197,94,0.08)] border border-[rgba(34,197,94,0.2)] flex items-center justify-center text-lg flex-shrink-0">📅</div>
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold text-slate-800 leading-tight m-0" style={{ color: "#0a0a0a" }}>Appointment Booked</div>
                        <p className="text-[9px] text-slate-500 mt-0.5 m-0">May 24, 2025</p>
                        <p className="text-[9px] text-[#15803d] font-medium m-0">10:00 AM</p>
                      </div>
                    </div>
                  </div>

                  {/* Floating Card 3: AI Assistant */}
                  <div className="hidden sm:block absolute top-[4%] -right-[8%] sm:-right-[8%] z-20 pointer-events-auto">
                    <div className="animate-float-3 w-[195px] bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-[0_8px_28px_rgba(34,197,94,0.10)] border border-[rgba(34,197,94,0.2)] flex flex-col gap-2">
                      <div className="flex items-center gap-1.5"><span className="text-[9px] text-slate-400">🤖 AI Assistant</span></div>
                      <div className="space-y-1.5">
                        <div className="bg-[rgba(34,197,94,0.06)] border border-[rgba(34,197,94,0.12)] text-slate-700 p-2 rounded-xl rounded-tl-sm text-[10px] leading-relaxed max-w-[90%]">How can I help you today?</div>
                        <div className="flex justify-end">
                          <div className="text-white p-2 rounded-xl rounded-tr-sm text-[10px] leading-relaxed max-w-[90%]" style={{ background: "linear-gradient(135deg,#15803d,#22c55e)" }}>I need help with my order.</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Floating Card 4: Leads Captured */}
                  <div className="hidden sm:block absolute bottom-[8%] -right-[10%] sm:-right-[10%] z-20 pointer-events-auto">
                    <div className="animate-float-4 w-[185px] bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-[0_8px_28px_rgba(34,197,94,0.10)] border border-[rgba(34,197,94,0.2)] flex flex-col gap-1.5">
                      <div>
                        <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider m-0">Leads Captured</p>
                        <div className="flex items-baseline gap-1.5 mt-0.5">
                          <span className="text-lg font-bold text-slate-800">2,847</span>
                          <span className="text-[9px] font-semibold text-emerald-600">+32.6%</span>
                        </div>
                      </div>
                      <div className="h-10 w-full mt-1">
                        <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="chart-glow" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.2" />
                              <stop offset="100%" stopColor="#22c55e" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>
                          <path d="M0,25 Q15,22 30,12 T60,18 T90,5 L100,5 L100,30 L0,30 Z" fill="url(#chart-glow)" />
                          <path d="M0,25 Q15,22 30,12 T60,18 T90,5 L100,5" fill="none" stroke="#15803d" strokeWidth="2" strokeLinecap="round" />
                          <circle cx="100" cy="5" r="2.5" fill="#15803d" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Logo marquee inside hero box */}
              <div style={{ marginTop: 56, paddingTop: 32, borderTop: "1px solid rgba(34,197,94,0.12)" }}>
                <p className="text-center tag mb-6 m-0" style={{ color: "#94a3b8", letterSpacing: "0.18em" }}>Trusted by leading companies</p>
                <div className="relative w-full overflow-hidden">
                  <div className="absolute inset-y-0 left-0 w-16 z-10 pointer-events-none" style={{ background: "linear-gradient(90deg, #eafbef, transparent)" }} />
                  <div className="absolute inset-y-0 right-0 w-16 z-10 pointer-events-none" style={{ background: "linear-gradient(270deg, #eafbef, transparent)" }} />
                  <div className="flex gap-16 items-center animate-marquee opacity-60">
                    {[...Array(2)].flatMap((_, dup) => [{ n: "HealthFirst", i: "🏥" }, { n: "BrightHome", i: "🏠" }, { n: "FastTrack", i: "⚡" }, { n: "CloudBase", i: "☁️" }, { n: "NovaTech", i: "🚀" }, { n: "ZenithAI", i: "🧠" }].map((c, i) => (
                      <div key={`${dup}-${i}`} className="flex items-center gap-3 whitespace-nowrap">
                        <span className="text-xl grayscale">{c.i}</span>
                        <span className="text-sm font-semibold tracking-tight" style={{ color: "#475569" }}>{c.n}</span>
                      </div>
                    )))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════
              VOICE DEMO — black box
          ══════════════════════════════════════════════ */}
          <section ref={demoSectionRef} id="demo" className="section-box black">
            <div className="section-pad relative overflow-hidden">
              <div style={{ position: "absolute", bottom: 0, right: "10%", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(34,197,94,0.10), transparent 70%)", pointerEvents: "none" }} />
              <div style={{ position: "absolute", top: 0, left: "10%", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(22,163,74,0.08), transparent 70%)", pointerEvents: "none" }} />

              <div className="relative" style={{ zIndex: 1 }}>
                <Reveal className="text-center mb-14 space-y-4">
                  <span className="tag px-4 py-1.5 rounded-full inline-block" style={{ color: "#4ade80", background: "rgba(34,197,94,.10)", border: "1px solid rgba(34,197,94,.25)" }}>Live Demo</span>
                  <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight mt-4" style={{ color: "#ffffff", fontSize: "clamp(30px,4vw,52px)" }}>
                    Hear It in <span className="gradient-text">Action</span>
                  </h2>
                  <p style={{ color: "#94a3b8", fontSize: 16, maxWidth: 440, margin: "0 auto" }}>
                    Watch Autoniv handle a real customer booking — start to finish.
                  </p>
                </Reveal>

                <Reveal>
                  <div style={{ background: "linear-gradient(160deg,#141414,#0a0a0a)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, overflow: "hidden", boxShadow: "0 20px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)" }}>
                    {/* Title bar */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)", overflow: "hidden" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57" }} />
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#febc2e" }} />
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840" }} />
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, overflow: "hidden", margin: "0 8px" }}>
                        <div style={{ width: 7, height: 7, borderRadius: "50%", background: demoRunning ? "#22c55e" : "#94a3b8", flexShrink: 0, animation: demoRunning ? "livePulse 1.8s infinite" : "none" }} />
                        <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono',monospace", color: "#94a3b8", letterSpacing: "0.1em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {demoRunning ? "autoniv-agent · live call" : demoDone ? "call ended · booked ✓" : "autoniv-agent · ready"}
                        </span>
                      </div>
                      <div style={{ width: 52, flexShrink: 0 }} />
                    </div>

                    {/* Two-column layout */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: 420 }} className="demo-grid">
                      {/* LEFT — Orb */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "44px 32px", borderRight: "1px solid rgba(255,255,255,0.08)", background: "radial-gradient(ellipse at 50% 45%,rgba(34,197,94,0.10) 0%,transparent 65%)", position: "relative", gap: 28 }}>
                        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: .2, backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)", backgroundSize: "32px 32px", maskImage: "radial-gradient(ellipse at 50% 60%,black 20%,transparent 75%)", WebkitMaskImage: "radial-gradient(ellipse at 50% 60%,black 20%,transparent 75%)" }} />

                        <div className={!demoRunning && !demoDone ? "orb-idle" : ""}>
                          <VoiceOrb speaking={speaking} />
                        </div>

                        <div style={{ textAlign: "center" }}>
                          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 99, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", fontSize: 12, fontFamily: "'JetBrains Mono',monospace", color: speaking === "agent" ? "#22c55e" : speaking === "user" ? "#4ade80" : "#94a3b8", transition: "color .3s ease", justifyContent: "center", whiteSpace: "nowrap" }}>
                            {speaking === "agent" ? "🤖 AI Agent speaking" : speaking === "user" ? "👤 Caller speaking" : "🔄 Restarting…"}
                          </div>
                        </div>

                        <Waveform active={speaking !== "idle"} color={speaking === "agent" ? "#22c55e" : speaking === "user" ? "#4ade80" : "#94a3b8"} />
                      </div>

                      {/* RIGHT — Chat */}
                      <div style={{ display: "flex", flexDirection: "column", padding: "28px 24px", gap: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid rgba(255,255,255,0.08)", gap: 8 }}>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "#ffffff", marginBottom: 2 }}>Booking Assistant</div>
                            <div style={{ fontSize: 11, color: "#94a3b8", fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.08em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{demoMsgs.length > 0 ? `${demoMsgs.length}/${CONVERSATION.length} turns` : "starting…"}</div>
                          </div>
                          <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "5px 10px", borderRadius: 99, background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.15)", flexShrink: 0 }}>
                            <div style={{ width: 6, height: 6, borderRadius: "50%", background: demoRunning ? "#22c55e" : "#94a3b8" }} />
                            <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono',monospace", color: demoRunning ? "#22c55e" : "#94a3b8", letterSpacing: "0.1em" }}>{demoRunning ? "LIVE" : "IDLE"}</span>
                          </div>
                        </div>

                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10, overflowY: "auto", minHeight: 240 }}>
                          {demoMsgs.length === 0 && !demoRunning && !demoDone && (
                            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: 13, textAlign: "center", padding: "20px 0" }}>
                              Press Start Demo to watch<br />the conversation unfold
                            </div>
                          )}
                          {demoMsgs.map((msg, i) => {
                            const isAgent = msg.role === "agent";
                            return (
                              <div key={msg.id} className="chat-bubble-in" style={{ display: "flex", justifyContent: isAgent ? "flex-start" : "flex-end", animationDelay: `${i * .04}s` }}>
                                {isAgent && <div style={{ width: 26, height: 26, borderRadius: "50%", flexShrink: 0, marginRight: 8, marginTop: 2, background: "linear-gradient(135deg,#22c55e,#15803d)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#ffffff" }}>A</div>}
                                <div style={{ maxWidth: "76%", padding: "9px 13px", borderRadius: isAgent ? "4px 14px 14px 14px" : "14px 4px 14px 14px", fontSize: 13.5, lineHeight: 1.45, background: isAgent ? "rgba(34,197,94,0.08)" : "rgba(74,222,128,0.08)", border: isAgent ? "1px solid rgba(34,197,94,0.2)" : "1px solid rgba(74,222,128,0.2)", color: "#e2e8f0" }}>
                                  {msg.text}
                                </div>
                                {!isAgent && <div style={{ width: 26, height: 26, borderRadius: "50%", flexShrink: 0, marginLeft: 8, marginTop: 2, background: "linear-gradient(135deg,#4ade80,#16a34a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#ffffff" }}>U</div>}
                              </div>
                            );
                          })}
                          {demoRunning && speaking !== "idle" && demoMsgs.length < CONVERSATION.length && (
                            <div style={{ display: "flex", alignItems: "center", gap: 5, paddingLeft: 34 }}>
                              {[0, 1, 2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: speaking === "agent" ? "#22c55e" : "#4ade80", animation: `waveBar .75s ease-in-out ${i * .18}s infinite alternate`, opacity: .7 }} />)}
                            </div>
                          )}
                          <div ref={chatEndRef} />
                        </div>

                        {demoDone && (
                          <div style={{ display: "flex", gap: 8, marginTop: 16, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.08)", animation: "slideIn .5s ease both" }}>
                            {[{ icon: "📞", label: "1 call", sub: "handled" }, { icon: "📅", label: "Booked", sub: "instantly" }, { icon: "⏱", label: "< 10s", sub: "response" }].map((m, i) => (
                              <div key={i} style={{ flex: 1, textAlign: "center", padding: "8px 6px", borderRadius: 10, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
                                <div style={{ fontSize: 16 }}>{m.icon}</div>
                                <div style={{ fontSize: 12, fontWeight: 700, color: "#22c55e", marginTop: 2 }}>{m.label}</div>
                                <div style={{ fontSize: 10, color: "#94a3b8", fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.06em" }}>{m.sub}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Reveal>

                <div className="flex flex-wrap items-center justify-center gap-8 mt-8">
                  {["3× faster response", "20+ languages", "24/7 availability"].map((t, i) => (
                    <span key={i} className="tag flex items-center gap-2" style={{ color: "#94a3b8" }}>
                      <span style={{ color: "#4ade80", fontSize: 10 }}>✓</span>{t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════
              FEATURES — white box
          ══════════════════════════════════════════════ */}
          <section id="features" className="section-box white">
            <div className="section-pad relative overflow-hidden">
              <div style={{ position: "absolute", bottom: 0, right: "10%", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(34,197,94,0.05), transparent 70%)", pointerEvents: "none" }} />
              <div style={{ position: "absolute", top: "10%", left: "5%", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(34,197,94,0.04), transparent 70%)", pointerEvents: "none" }} />

              <div className="relative" style={{ zIndex: 1 }}>
                <Reveal className="text-center mb-16 space-y-4">
                  <span className="tag px-4 py-1.5 rounded-full inline-block" style={{ color: "#15803d", background: "rgba(34,197,94,.07)", border: "1px solid rgba(34,197,94,.16)" }}>Platform Capabilities</span>
                  <h2 className="font-extrabold tracking-tight mt-4" style={{ fontSize: "clamp(28px,4vw,48px)", color: "#0a0a0a" }}>
                    Everything You Need<span className="gradient-text block">to Scale</span>
                  </h2>
                  <p style={{ color: "#475569", fontSize: 16, maxWidth: 520, margin: "0 auto" }}>Powerful AI infrastructure designed to capture more leads and serve customers around the clock.</p>
                </Reveal>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {features.map((f, i) => (
                    <Reveal key={i} delay={i * .08}>
                      <TiltCard className="feature-card group relative p-7 rounded-2xl overflow-hidden h-full cursor-default" style={{ background: "rgba(255, 255, 255, 0.9)", backdropFilter: "blur(12px)", border: "1px solid rgba(34, 197, 94, 0.14)", boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.04)" }}>
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" style={{ background: `radial-gradient(ellipse at 30% 30%,${f.color}14,transparent 60%)` }} />
                        <div className="relative w-12 h-12 rounded-xl flex items-center justify-center mb-5 text-2xl" style={{ background: `${f.color}14`, border: `1px solid ${f.color}26` }}>
                          <span className="group-hover:scale-110 transition-transform duration-300 inline-block">{f.icon}</span>
                        </div>
                        <h3 className="text-base font-bold mb-2" style={{ color: "#0a0a0a" }}>{f.title}</h3>
                        <p className="text-sm leading-relaxed mb-5" style={{ color: "#475569" }}>{f.desc}</p>
                        <div className="flex items-baseline gap-2 pt-4" style={{ borderTop: "1px solid rgba(34, 197, 94, 0.14)" }}>
                          <span className="text-2xl font-extrabold" style={{ color: f.color }}>{f.metric}</span>
                          <span className="tag text-[10px]" style={{ color: "#15803d" }}>{f.metricLabel}</span>
                        </div>
                      </TiltCard>
                    </Reveal>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════
              HOW IT WORKS — black box
          ══════════════════════════════════════════════ */}
          <section id="how-it-works" className="section-box black">
            <div className="section-pad relative overflow-hidden">
              <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "100%", height: "100%", background: "radial-gradient(circle at top, rgba(34,197,94,0.10), transparent 70%)", pointerEvents: "none" }} />
              <div className="relative" style={{ zIndex: 1 }}>
                <Reveal className="text-center mb-16 space-y-4">
                  <span className="tag px-4 py-1.5 rounded-full inline-block" style={{ color: "#4ade80", background: "rgba(34,197,94,0.10)", border: "1px solid rgba(34,197,94,0.22)" }}>Simple Process</span>
                  <h2 className="font-extrabold tracking-tight mt-4" style={{ fontSize: "clamp(28px,4vw,48px)", color: "#ffffff" }}>
                    Live in <span style={{ color: "#4ade80" }}>5 Steps</span>
                  </h2>
                  <p style={{ color: "#94a3b8", fontSize: 16, maxWidth: 440, margin: "0 auto" }}>From idea to deployed voice agent in under 5 minutes — no code required.</p>
                </Reveal>

                <Reveal>
                  <div style={{ background: "linear-gradient(135deg, #161616 0%, #0a0a0a 50%, #161616 100%)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, padding: "40px 36px", boxShadow: "0 20px 50px -15px rgba(0,0,0,0.5)" }}>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
                      {STEPS.map((step, i) => (
                        <div key={i} className="flex flex-col items-center text-center relative h-full group">
                          {i < STEPS.length - 1 && (
                            <div className="hidden md:block absolute top-5 left-[50%] right-[-50%] h-[2px] bg-gradient-to-r from-green-500/25 to-green-500/5 z-0 pointer-events-none" />
                          )}
                          <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm shadow-md z-10 mb-4 group-hover:scale-110 transition-all duration-300" style={{ color: "#ffffff", background: "linear-gradient(135deg,#22c55e,#16a34a)", boxShadow: "0 4px 14px rgba(34,197,94,0.35)" }}>
                            {step.n}
                          </div>
                          <div className="rounded-2xl p-5 flex-1 flex flex-col items-center w-full transition-all duration-300" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-3 flex-shrink-0" style={{ background: "rgba(34,197,94,0.10)", border: "1px solid rgba(34,197,94,0.20)" }}>
                              {step.icon}
                            </div>
                            <h3 className="text-sm font-bold mb-2" style={{ color: "#ffffff" }}>{step.title}</h3>
                            <p className="text-[12px] leading-relaxed m-0" style={{ color: "#94a3b8" }}>{step.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Reveal>

                <Reveal className="text-center mt-14">
                  <MagBtn onClick={() => openAuth("register")} className="btn-cta btn-responsive-lg font-bold text-white flex items-center gap-2 mx-auto">
                    Build Your First Agent Free
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                  </MagBtn>
                </Reveal>
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════
              COMPARISON — tint box
          ══════════════════════════════════════════════ */}
          <section id="comparison" className="section-box tint">
            <div className="section-pad relative overflow-hidden">
              <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "100%", height: "100%", background: "radial-gradient(circle at center, rgba(34,197,94,0.06), transparent 70%)", pointerEvents: "none" }} />
              <div className="relative" style={{ zIndex: 1 }}>
                <Reveal className="text-center mb-16 space-y-4">
                  <span className="tag px-4 py-1.5 rounded-full inline-block" style={{ color: "#15803d", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.3)" }}>Why Autoniv</span>
                  <h2 className="font-extrabold tracking-tight mt-4" style={{ fontSize: "clamp(28px,4vw,48px)", color: "#0a0a0a" }}>
                    A Clear <span className="gradient-text">Competitive Advantage</span>
                  </h2>
                  <p style={{ color: "#475569", fontSize: 16, maxWidth: 520, margin: "0 auto" }}>An honest side-by-side against the alternatives you're considering.</p>
                </Reveal>

                <Reveal>
                  <div className="overflow-x-auto" style={{ border: "1px solid rgba(34,197,94,0.16)", borderRadius: 20, background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", boxShadow: "0 20px 40px -15px rgba(0,0,0,0.04)" }}>
                    <table className="w-full text-left border-collapse" style={{ minWidth: 720 }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid rgba(34,197,94,0.16)", background: "rgba(34,197,94,0.03)" }}>
                          <th className="p-5 text-xs font-bold uppercase tracking-wider text-[#475569]" style={{ width: "28%" }}>Capability</th>
                          <th className="p-5 text-xs font-bold uppercase tracking-wider text-[#15803d]" style={{ background: "rgba(34,197,94,0.06)", width: "24%" }}>✦ Autoniv</th>
                          <th className="p-5 text-xs font-bold uppercase tracking-wider text-[#64748b]" style={{ width: "24%" }}>Human Callers</th>
                          <th className="p-5 text-xs font-bold uppercase tracking-wider text-[#64748b]" style={{ width: "24%" }}>Generic Dialers</th>
                        </tr>
                      </thead>
                      <tbody>
                        {COMPARISON.map((row, index) => (
                          <tr key={index} className="table-row" style={{ borderBottom: index < COMPARISON.length - 1 ? "1px solid rgba(34,197,94,0.08)" : "none" }}>
                            <td className="p-5 text-xs font-semibold text-slate-800" style={{ color: "#0a0a0a" }}>{row.capability}</td>
                            <td className="p-5 text-xs" style={{ background: "rgba(34,197,94,0.04)" }}>{renderCellContent(row.autoniv.status, row.autoniv.text)}</td>
                            <td className="p-5 text-xs">{renderCellContent(row.human.status, row.human.text)}</td>
                            <td className="p-5 text-xs">{renderCellContent(row.dialers.status, row.dialers.text)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Reveal>
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════
              USE CASES + INTEGRATIONS — white box
          ══════════════════════════════════════════════ */}
          <section className="section-box white">
            <div className="section-pad">
              <Reveal className="text-center mb-16 space-y-4">
                <span className="tag px-4 py-1.5 rounded-full inline-block" style={{ color: "#15803d", background: "rgba(34,197,94,.07)", border: "1px solid rgba(34,197,94,.18)" }}>Industry Solutions</span>
                <h2 className="font-extrabold tracking-tight mt-4" style={{ fontSize: "clamp(28px,4vw,48px)", color: "#0a0a0a" }}>
                  Built for <span className="gradient-text">Every Industry</span>
                </h2>
              </Reveal>

              <div className="grid lg:grid-cols-2 gap-10 items-start">
                {/* Use case tabs */}
                <div>
                  <div className="use-case-tabs" style={{ borderBottom: "1px solid rgba(34,197,94,0.10)", display: "flex", gap: 4, marginBottom: 16, overflowX: "auto", WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}>
                    {useCases.map((uc, i) => (
                      <button key={i} onClick={() => setActiveUseCase(i)} className={`use-case-tab px-4 py-2.5 text-sm font-medium rounded-t-lg whitespace-nowrap${activeUseCase === i ? " active" : ""}`} style={{ color: activeUseCase === i ? "#0a0a0a" : "#94a3b8", background: activeUseCase === i ? "rgba(34,197,94,.05)" : "transparent", border: "none", cursor: "pointer", flexShrink: 0 }}>
                        {uc.icon} {uc.title}
                      </button>
                    ))}
                  </div>
                  <div key={activeUseCase} className="use-case-card glass-card rounded-2xl p-8 animate-fade-up">
                    <div className="icon" style={{ fontSize: 48, marginBottom: 16 }}>{useCases[activeUseCase].icon}</div>
                    <h3 style={{ fontSize: 22, fontWeight: 700, color: "#0a0a0a", marginBottom: 10 }}>{useCases[activeUseCase].title}</h3>
                    <p style={{ color: "#475569", lineHeight: 1.65, marginBottom: 16, fontSize: 15 }}>{useCases[activeUseCase].desc}</p>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 99, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.22)" }}>
                      <svg className="w-4 h-4" style={{ color: "#15803d" }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#15803d" }}>{useCases[activeUseCase].stat}</span>
                    </div>
                    <div style={{ height: 2, borderRadius: 99, background: "rgba(34,197,94,0.10)", marginTop: 20, overflow: "hidden" }}>
                      <div key={`pb-${activeUseCase}`} className="progress-bar h-full rounded-full" style={{ background: "linear-gradient(90deg,#22c55e,#16a34a)" }} />
                    </div>
                  </div>
                </div>

                {/* Integrations grid */}
                <Reveal from="right">
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0a0a0a", marginBottom: 6 }}>Plug into the tools your team already uses</h3>
                    <p style={{ fontSize: 14, color: "#475569", marginBottom: 20, lineHeight: 1.6 }}>Connects with your existing CRM, telephony, and automation tools instantly — no developer needed.</p>
                    <div className="integrations-grid grid grid-cols-4 gap-3">
                      {[...integrationsRow1.slice(0, 4), ...integrationsRow2.slice(0, 4)].map((intg, i) => (
                        <div key={i} className="glass-card rounded-xl p-4 flex flex-col items-center gap-2 group hover:scale-105 transition-all duration-300 cursor-default">
                          <span style={{ fontSize: 22 }}>{intg.icon}</span>
                          <span style={{ fontSize: 11, color: "#15803d", fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.06em", textAlign: "center" }}>{intg.name}</span>
                        </div>
                      ))}
                      <div className="glass-card rounded-xl p-4 flex flex-col items-center gap-2 cursor-default col-span-full" style={{ borderStyle: "dashed", borderColor: "rgba(34,197,94,0.25)" }}>
                        <span style={{ fontSize: 13, color: "#15803d", fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.1em" }}>+40 more integrations →</span>
                      </div>
                    </div>
                  </div>
                </Reveal>
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════
              INTEGRATIONS MARQUEE — black box
          ══════════════════════════════════════════════ */}
         <section id="integrations" style={{ 
  padding: "96px 20px", 
  background: "#090d16", 
  position: "relative", 
  overflow: "hidden" 
}}>
  {/* Enhanced background with multiple layers */}
  <div style={{ 
    position: "absolute", 
    inset: 0, 
    background: "radial-gradient(ellipse at 30% 20%, rgba(16,185,129,0.06), transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(5,150,105,0.04), transparent 50%)", 
    pointerEvents: "none" 
  }} />
  
  {/* Floating glow orbs */}
  <div style={{ 
    position: "absolute", 
    top: "10%", 
    right: "5%", 
    width: "300px", 
    height: "300px", 
    background: "radial-gradient(circle, rgba(16,185,129,0.08), transparent 70%)", 
    borderRadius: "50%",
    filter: "blur(60px)",
    animation: "auroraPulse 20s ease-in-out infinite"
  }} />
  <div style={{ 
    position: "absolute", 
    bottom: "20%", 
    left: "5%", 
    width: "250px", 
    height: "250px", 
    background: "radial-gradient(circle, rgba(5,150,105,0.06), transparent 70%)", 
    borderRadius: "50%",
    filter: "blur(60px)",
    animation: "auroraPulse 25s ease-in-out infinite reverse"
  }} />

  <div className="max-w-6xl mx-auto" style={{ position: "relative", zIndex: 1 }}>
    {/* Header */}
    <Reveal className="text-center mb-12">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4" style={{ 
        background: "rgba(16,185,129,0.08)", 
        border: "1px solid rgba(16,185,129,0.15)" 
      }}>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-xs font-medium text-emerald-400 tracking-wider uppercase">Integrations</span>
      </div>
      <h2 className="font-extrabold tracking-tight" style={{ 
        fontSize: "clamp(32px,4vw,52px)", 
        color: "#ffffff",
        lineHeight: 1.1
      }}>
        Connect Your Favorite
        <span className="block" style={{ 
          background: "linear-gradient(135deg, #10b981, #34d399, #059669)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text"
        }}>Tools & Platforms</span>
      </h2>
      <p className="mt-3" style={{ color: "#94a3b8", fontSize: 15, maxWidth: 500, margin: "0 auto" }}>
        Seamlessly integrate with 40+ apps or build custom workflows with our flexible API.
      </p>
    </Reveal>

    {/* Main Integration Grid */}
    <Reveal>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4 mb-8">
        {[...integrationsRow1, ...integrationsRow2].slice(0, 12).map((item, i) => (
          <div
            key={i}
            className="group relative rounded-2xl p-4 text-center transition-all duration-300 cursor-default"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              transition: "all 0.3s cubic-bezier(.16,1,.3,1)"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(16,185,129,0.06)";
              e.currentTarget.style.borderColor = "rgba(16,185,129,0.2)";
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 12px 40px rgba(16,185,129,0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.03)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">
              {item.icon}
            </div>
            <div className="text-xs font-medium truncate" style={{ color: "#e2e8f0" }}>
              {item.name}
            </div>
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{
              background: "linear-gradient(135deg, rgba(16,185,129,0.04), transparent)"
            }} />
          </div>
        ))}
      </div>
    </Reveal>

    {/* Scrolling Marquee Rows */}
    <div className="space-y-4">
      <Reveal>
        <div className="relative overflow-hidden rounded-2xl" style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.04)"
        }}>
          <div className="absolute inset-y-0 left-0 w-24 z-10 pointer-events-none" style={{ 
            background: "linear-gradient(90deg, #090d16, transparent)" 
          }} />
          <div className="absolute inset-y-0 right-0 w-24 z-10 pointer-events-none" style={{ 
            background: "linear-gradient(270deg, #090d16, transparent)" 
          }} />
          
          <div className="flex gap-4 animate-marquee py-4" style={{ width: "max-content" }}>
            {[...integrationsRow1, ...integrationsRow1, ...integrationsRow1].map((item, i) => (
              <div 
                key={i} 
                className="flex items-center gap-3 px-5 py-2 rounded-xl flex-shrink-0"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.04)"
                }}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm font-medium" style={{ color: "#94a3b8" }}>{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal from="right">
        <div className="relative overflow-hidden rounded-2xl" style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.04)"
        }}>
          <div className="absolute inset-y-0 left-0 w-24 z-10 pointer-events-none" style={{ 
            background: "linear-gradient(90deg, #090d16, transparent)" 
          }} />
          <div className="absolute inset-y-0 right-0 w-24 z-10 pointer-events-none" style={{ 
            background: "linear-gradient(270deg, #090d16, transparent)" 
          }} />
          
          <div className="flex gap-4 py-4" style={{ 
            width: "max-content", 
            animation: "marquee 30s linear infinite reverse" 
          }}>
            {[...integrationsRow2, ...integrationsRow2, ...integrationsRow2].map((item, i) => (
              <div 
                key={i} 
                className="flex items-center gap-3 px-5 py-2 rounded-xl flex-shrink-0"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.04)"
                }}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm font-medium" style={{ color: "#94a3b8" }}>{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </div>

    {/* Integration Stats & CTA */}
    <Reveal className="mt-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl p-6 text-center" style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.04)"
        }}>
          <div className="text-3xl font-bold mb-1" style={{ 
            background: "linear-gradient(135deg, #10b981, #34d399)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text"
          }}>40+</div>
          <div className="text-xs" style={{ color: "#64748b" }}>Pre-built integrations</div>
        </div>
        
        <div className="rounded-2xl p-6 text-center" style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.04)"
        }}>
          <div className="text-3xl font-bold mb-1" style={{ 
            background: "linear-gradient(135deg, #10b981, #34d399)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text"
          }}>∞</div>
          <div className="text-xs" style={{ color: "#64748b" }}>Custom API possibilities</div>
        </div>
        
        <div className="rounded-2xl p-6 text-center" style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.04)"
        }}>
          <div className="text-3xl font-bold mb-1" style={{ 
            background: "linear-gradient(135deg, #10b981, #34d399)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text"
          }}>5 min</div>
          <div className="text-xs" style={{ color: "#64748b" }}>Average setup time</div>
        </div>
      </div>
    </Reveal>

    {/* CTA Section */}
    <Reveal className="mt-8">
      <div className="rounded-2xl p-8 relative overflow-hidden" style={{
        background: "linear-gradient(135deg, rgba(16,185,129,0.04), rgba(5,150,105,0.02))",
        border: "1px solid rgba(16,185,129,0.06)"
      }}>
        <div className="absolute inset-0 opacity-50" style={{
          background: "radial-gradient(circle at 70% 30%, rgba(16,185,129,0.04), transparent 70%)"
        }} />
        
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">
              Need a custom integration?
            </h3>
            <p className="text-sm" style={{ color: "#94a3b8" }}>
              Our API supports webhooks, real-time events, and everything in between.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-300" style={{
              background: "linear-gradient(135deg, #10b981, #059669)",
              boxShadow: "0 4px 16px rgba(16,185,129,0.2)"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(16,185,129,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(16,185,129,0.2)";
            }}>
              View API Docs →
            </button>
            <button className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300" style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
              color: "#94a3b8"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.08)";
              e.currentTarget.style.color = "#e2e8f0";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.04)";
              e.currentTarget.style.color = "#94a3b8";
            }}>
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </Reveal>
  </div>
</section>

          {/* ══════════════════════════════════════════════
              ADD-ONS — white box
          ══════════════════════════════════════════════ */}
          <section id="addons" className="section-box white">
            <div className="section-pad relative overflow-hidden">
              <div style={{ position: "absolute", bottom: 0, right: "10%", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(34,197,94,0.05), transparent 70%)", pointerEvents: "none" }} />
              <div className="relative" style={{ zIndex: 1 }}>
                <Reveal className="text-center mb-16 space-y-4">
                  <span className="tag px-4 py-1.5 rounded-full inline-block" style={{ color: "#15803d", background: "rgba(34,197,94,.07)", border: "1px solid rgba(34,197,94,.18)" }}>Add-Ons</span>
                  <h2 className="font-extrabold tracking-tight mt-4" style={{ fontSize: "clamp(28px,4vw,48px)", color: "#0a0a0a" }}>
                    Supercharge Your Results<span className="gradient-text block">Further</span>
                  </h2>
                  <p style={{ color: "#475569", fontSize: 16, maxWidth: 500, margin: "0 auto" }}>Customize your AI voice solution with powerful add-ons for every business need.</p>
                </Reveal>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {ADDONS.map((addon, i) => (
                    <Reveal key={addon.id} delay={i * .06}>
                      <TiltCard className="feature-card group relative p-6 rounded-2xl overflow-hidden h-full cursor-default" style={{ background: "rgba(255, 255, 255, 0.9)", backdropFilter: "blur(12px)", border: "1px solid rgba(34, 197, 94, 0.14)", boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.04)" }}>
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" style={{ background: "radial-gradient(ellipse at 30% 30%,rgba(34,197,94,0.10),transparent 60%)" }} />
                        <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", marginBottom: 16 }}>
                          <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.22)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{addon.icon}</div>
                          <span className="tag px-2.5 py-1 rounded-full text-[9px]" style={{ background: addon.category === "recurring" ? "rgba(34,197,94,0.12)" : "rgba(22,163,74,0.12)", color: addon.category === "recurring" ? "#15803d" : "#166534", border: `1px solid ${addon.category === "recurring" ? "rgba(34,197,94,0.25)" : "rgba(22,163,74,0.25)"}` }}>
                            {addon.category === "recurring" ? "Monthly" : "One-time"}
                          </span>
                        </div>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0a0a0a", marginBottom: 8 }}>{addon.title}</h3>
                        <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.6 }}>{addon.description}</p>
                      </TiltCard>
                    </Reveal>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════
              TESTIMONIALS — tint box
          ══════════════════════════════════════════════ */}
          <section className="section-box tint">
            <div className="section-pad">
              <Reveal className="text-center mb-16 space-y-4">
                <span className="tag px-4 py-1.5 rounded-full inline-block" style={{ color: "#15803d", background: "rgba(34,197,94,.07)", border: "1px solid rgba(34,197,94,.18)" }}>What Our Users Say</span>
                <h2 className="font-extrabold tracking-tight mt-4" style={{ fontSize: "clamp(28px,4vw,48px)", color: "#0a0a0a" }}>
                  Trusted by <span className="gradient-text">Industry Leaders</span>
                </h2>
              </Reveal>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {testimonials.map((t, i) => (
                  <Reveal key={i} delay={i * .1}>
                    <div className="testimonial-card group relative p-7 rounded-2xl glass-card overflow-hidden h-full flex flex-col cursor-default">
                      <span className="absolute top-2 right-5 text-[90px] leading-none font-serif select-none" style={{ color: "rgba(34,197,94,.06)" }}>"</span>
                      <div className="flex gap-0.5 mb-5">{[...Array(5)].map((_, k) => <svg key={k} className="w-4 h-4" style={{ fill: "#ffe484" }} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}</div>
                      <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.7, flex: 1, marginBottom: 16 }}>"{t.quote}"</p>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 14, borderTop: "1px solid rgba(34,197,94,0.10)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg,#22c55e,#15803d)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#ffffff", flexShrink: 0 }}>{t.initials}</div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "#0a0a0a" }}>{t.name}</div>
                            <div style={{ fontSize: 11, color: "#94a3b8" }}>{t.role}</div>
                          </div>
                        </div>
                        <span className="tag px-3 py-1.5 rounded-full text-[10px]" style={{ color: "#15803d", background: "rgba(34,197,94,.08)", border: "1px solid rgba(34,197,94,.18)" }}>{t.metric}</span>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════
              CTA BANNER — black box
          ══════════════════════════════════════════════ */}
          <section className="section-box black">
            <div className="section-pad relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 50%,rgba(34,197,94,.12) 0%,transparent 65%)" }} />
              <Reveal className="relative text-center">
                <span className="tag px-4 py-1.5 rounded-full inline-block mb-6" style={{ color: "#4ade80", background: "rgba(34,197,94,.10)", border: "1px solid rgba(34,197,94,.28)" }}>Get Started</span>
                <h2 className="font-extrabold tracking-tight mb-4" style={{ fontSize: "clamp(28px,4.5vw,60px)", color: "#ffffff" }}>
                  Ready to Transform<span className="gradient-text block">Your Business?</span>
                </h2>
                <p style={{ color: "#94a3b8", fontSize: 16, maxWidth: 480, margin: "0 auto 32px" }}>Join 10,000+ businesses already using AI voice agents to capture more leads and grow faster.</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
                  <MagBtn onClick={() => openAuth("register")} className="btn-cta btn-responsive-xl font-bold text-white flex items-center gap-2.5">
                    Start Your Free Trial
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                  </MagBtn>
                  <button onClick={() => openAuth("login")} className="btn-ghost-dark btn-responsive-xl font-medium" style={{ background: "none", cursor: "pointer" }}>Sign In Instead</button>
                </div>
                <div className="flex justify-center gap-10">
                  {[{ n: "5M+", l: "Calls handled" }, { n: "99.8%", l: "Accuracy" }, { n: "2 min", l: "Setup time" }].map((s, i) => (
                    <div key={i} className="text-center">
                      <div className="text-xl font-extrabold gradient-text">{s.n}</div>
                      <div className="tag text-[10px] mt-1" style={{ color: "#94a3b8" }}>{s.l}</div>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          </section>

          {/* ══════════════════════════════════════════════
              CONTACT — white box
          ══════════════════════════════════════════════ */}
          <section id="contact" className="section-box white">
            <div className="section-pad relative overflow-hidden">
              <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "100%", height: "100%", background: "radial-gradient(circle at center, rgba(34,197,94,0.05), transparent 70%)", pointerEvents: "none" }} />
              <div className="relative" style={{ zIndex: 1 }}>
                <Reveal className="text-center mb-16 space-y-4">
                  <span className="tag px-4 py-1.5 rounded-full inline-block" style={{ color: "#15803d", background: "rgba(34,197,94,.08)", border: "1px solid rgba(34,197,94,.20)" }}>Contact Us</span>
                  <h2 className="font-extrabold tracking-tight mt-4" style={{ fontSize: "clamp(26px,3.5vw,44px)", color: "#0a0a0a" }}>Get In Touch for Pricing</h2>
                  <p style={{ color: "#475569", fontSize: 16 }}>Tell us about your needs. Our team will get back within 24 hours.</p>
                </Reveal>
                <div className="grid lg:grid-cols-2 gap-10 max-w-5xl mx-auto items-start">
                  {/* Contact card */}
                  <Reveal from="left">
                    <div className="rounded-3xl p-8 sm:p-10" style={{ background: "linear-gradient(160deg,rgba(34,197,94,.04),#ffffff)", border: "1px solid rgba(34,197,94,.16)", boxShadow: "0 0 60px rgba(34,197,94,.05),0 40px 80px rgba(0,0,0,.05)" }}>
                      <ContactForm />
                      <div style={{ marginTop: 24, paddingTop: 24, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, borderTop: "1px solid rgba(34,197,94,.10)" }}>
                        <span style={{ fontSize: 14, color: "#475569" }}>Or chat directly on</span>
                        <a href="https://wa.me/917065990307" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 14px", borderRadius: 99, background: "rgba(37,211,102,.1)", border: "1px solid rgba(37,211,102,.25)", color: "#25d366", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                          WhatsApp
                        </a>
                      </div>
                    </div>
                  </Reveal>

                  {/* Contact info panel */}
                  <Reveal from="right" delay={.1}>
                    <div className="space-y-6">
                      <div className="rounded-2xl p-6" style={{ background: "rgba(255, 255, 255, 0.9)", backdropFilter: "blur(12px)", border: "1px solid rgba(34, 197, 94, 0.14)", boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.04)" }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0a0a0a", marginBottom: 14 }}>Why businesses choose Autoniv</h3>
                        <div className="space-y-4">
                          {[
                            { icon: "⚡", title: "2-min setup", desc: "No code, no engineers. Describe your agent and go live instantly." },
                            { icon: "🌍", title: "20+ languages", desc: "Serve customers in their native language across India and worldwide." },
                            { icon: "📊", title: "Real-time analytics", desc: "Live dashboards with call logs, transcripts, and conversion scores." },
                            { icon: "🔗", title: "50+ integrations", desc: "Plugs into your existing CRM, scheduling tools, and APIs." },
                          ].map((item, i) => (
                            <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                              <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.18)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{item.icon}</div>
                              <div>
                                <div style={{ fontSize: 14, fontWeight: 600, color: "#0a0a0a", marginBottom: 2 }}>{item.title}</div>
                                <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.55 }}>{item.desc}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-2xl p-6" style={{ background: "rgba(255, 255, 255, 0.9)", backdropFilter: "blur(12px)", border: "1px solid rgba(34, 197, 94, 0.14)", boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.04)" }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0a0a0a", marginBottom: 12 }}>What happens next?</h3>
                        {[{ n: "1", t: "We review your message within 24 hours" }, { n: "2", t: "Schedule a 15-min discovery call" }, { n: "3", t: "Get a custom pricing plan for your use case" }].map((s, i) => (
                          <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: i < 2 ? 12 : 0 }}>
                            <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.22)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#15803d", flexShrink: 0, fontFamily: "'JetBrains Mono',monospace" }}>{s.n}</div>
                            <span style={{ fontSize: 13, color: "#475569" }}>{s.t}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Reveal>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>

      <Footer />
    </div>
  );
}