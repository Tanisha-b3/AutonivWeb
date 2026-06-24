import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";

// ─── Data ────────────────────────────────────────────────────────────────────

const services = [
  {
    id: "voice",
    icon: "📞",
    tag: "VOICE AI",
    title: "AI Voice Agents",
    subtitle:
      "Human-like agents that pick up every call, qualify leads, and book appointments — without a single dropped conversation.",
    accent: "var(--primary-blue)",
    accentDim: "var(--primary-blue-soft)",
    accentBorder: "rgba(37,99,235,0.25)",
    glow: "rgba(37,99,235,0.18)",
    features: [
      "Inbound & Outbound Calls",
      "Natural Conversation Flow",
      "Appointment Booking",
      "Call Summary in CRM",
    ],
    stat: { value: "99.3%", label: "Answer Rate" },
  },
  {
    id: "chat",
    icon: "💬",
    tag: "MESSAGING",
    title: "AI Chatbot",
    subtitle:
      "Deploy smart chatbots across your website, WhatsApp, Facebook & Instagram. Capture leads and support customers around the clock.",
    accent: "var(--secondary)",
    accentDim: "var(--emerald-dim)",
    accentBorder: "rgba(16,185,129,0.25)",
    glow: "rgba(16,185,129,0.18)",
    features: [
      "Multi-platform Support",
      "Lead Capture & Qualification",
      "Instant Responses",
      "Human Handover",
    ],
    stat: { value: "4× faster", label: "Response Time" },
  },
  {
    id: "crm",
    icon: "🔄",
    tag: "AUTOMATION",
    title: "CRM Automation",
    subtitle:
      "Automate workflows, follow-ups, and pipeline management. Plugs directly into your existing CRM without ripping it apart.",
    accent: "var(--violet)",
    accentDim: "rgba(124,58,237,0.12)",
    accentBorder: "rgba(124,58,237,0.25)",
    glow: "rgba(124,58,237,0.18)",
    features: [
      "Lead Management",
      "Automated Follow-ups",
      "Pipeline Management",
      "Reports & Analytics",
    ],
    stat: { value: "60%", label: "Less Manual Work" },
  },
  {
    id: "booking",
    icon: "📅",
    tag: "SCHEDULING",
    title: "Smart Appointment Booking",
    subtitle:
      "AI books directly into Google Calendar, Outlook, or Calendly — no back-and-forth emails, no missed slots.",
    accent: "var(--primary-blue)",
    accentDim: "var(--primary-blue-soft)",
    accentBorder: "rgba(37,99,235,0.25)",
    glow: "rgba(37,99,235,0.18)",
    features: [
      "Google Calendar Sync",
      "Outlook & Calendly",
      "Auto Reminders",
      "Rescheduling Flows",
    ],
    stat: { value: "3× more", label: "Bookings/Day" },
  },
  {
    id: "analytics",
    icon: "📊",
    tag: "INSIGHTS",
    title: "Analytics & Reporting",
    subtitle:
      "Real-time dashboards with call transcripts, sentiment scores, and conversion metrics so you always know what's working.",
    accent: "var(--warning)",
    accentDim: "rgba(245,158,11,0.12)",
    accentBorder: "rgba(245,158,11,0.25)",
    glow: "rgba(245,158,11,0.18)",
    features: [
      "Call Transcripts",
      "Sentiment Scores",
      "Conversion Metrics",
      "Custom Reports",
    ],
    stat: { value: "2.4×", label: "ROI Average" },
  },
  {
    id: "language",
    icon: "🌍",
    tag: "MULTILINGUAL",
    title: "Multi-Language Support",
    subtitle:
      "Deploy agents in Hindi, Tamil, Telugu, Bengali and 17 more — with region-appropriate accents and cultural context baked in.",
    accent: "var(--secondary)",
    accentDim: "var(--emerald-dim)",
    accentBorder: "rgba(16,185,129,0.25)",
    glow: "rgba(16,185,129,0.18)",
    features: [
      "20+ Languages",
      "Regional Accents",
      "Script Adaptation",
      "Cultural Context",
    ],
    stat: { value: "20+", label: "Languages" },
  },
];

const trustItems = [
  { icon: "🛡️", label: "Secure & Compliant", desc: "Enterprise-grade security" },
  { icon: "⚡", label: "Go Live in Days", desc: "No lengthy onboarding" },
  { icon: "🔗", label: "Easy Integrations", desc: "Works with your stack" },
  { icon: "🎧", label: "24/7 Support", desc: "Always here to help" },
];

// ─── Mini sparkline SVG per service ──────────────────────────────────────────

function Sparkline({ accent }: { accent: string }) {
  const points = [
    [0, 40], [16, 32], [32, 36], [48, 22], [64, 28], [80, 14], [96, 18], [112, 8],
  ];
  const pts = points.map(([x, y]) => `${x},${y}`).join(" ");
  const fill = [...points, [112, 48], [0, 48]].map(([x, y]) => `${x},${y}`).join(" ");
  return (
    <svg viewBox="0 0 112 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <polyline points={fill} fill={accent} fillOpacity="0.08" />
      <polyline
        points={pts}
        fill="none"
        stroke={accent}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity="0.9"
      />
      <circle cx="112" cy="8" r="3.5" fill={accent} />
    </svg>
  );
}

// ─── Service Card ─────────────────────────────────────────────────────────────

function ServiceCard({
  s,
  index,
}: {
  s: (typeof services)[0];
  index: number;
}) {
  const [hovered, setHovered] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative flex flex-col rounded-2xl cursor-default overflow-hidden"
      style={{
        background:
          "linear-gradient(145deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.015) 100%)",
        border: `1px solid ${hovered ? s.accentBorder : "rgba(255,255,255,0.07)"}`,
        boxShadow: hovered
          ? `0 0 0 1px ${s.accentBorder}, 0 24px 64px ${s.glow}`
          : "none",
        transition: "border 0.3s, box-shadow 0.3s",
      }}
    >
      {/* Top ambient glow strip */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${s.accent}60, transparent)`,
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.3s",
        }}
      />

      {/* Header row */}
      <div className="flex items-start justify-between px-5 pt-5 pb-4">
        {/* Icon pill */}
        <div
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl"
          style={{
            background: s.accentDim,
            border: `1px solid ${s.accentBorder}`,
          }}
        >
          <span className="text-base leading-none">{s.icon}</span>
          <span
            className="text-[10px] font-bold tracking-widest"
            style={{ color: s.accent }}
          >
            {s.tag}
          </span>
        </div>

        {/* Stat badge */}
        <div className="text-right">
          <p
            className="text-xl font-extrabold leading-none tracking-tight"
            style={{ color: s.accent, fontFamily: "'JetBrains Mono', monospace" }}
          >
            {s.stat.value}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5 font-medium">{s.stat.label}</p>
        </div>
      </div>

      {/* Sparkline strip */}
      <div className="px-5 h-12 mb-4">
        <Sparkline accent={s.accent} />
      </div>

      {/* Text */}
      <div className="px-5 flex-1 flex flex-col">
        <h3 className="text-white font-bold text-lg mb-2 leading-snug">{s.title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed mb-5">{s.subtitle}</p>

        {/* Feature list */}
        <ul className="space-y-2.5 mb-6 flex-1">
          {s.features.map((f, j) => (
            <li key={j} className="flex items-center gap-2.5 text-sm text-slate-300">
              <span
                className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: s.accentDim, border: `1px solid ${s.accentBorder}` }}
              >
                <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2 6l3 3 5-5"
                    stroke={s.accent}
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              {f}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <button
          className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 mb-5 transition-all duration-200"
          style={{
            background: hovered ? s.accentDim : "rgba(255,255,255,0.04)",
            border: `1px solid ${hovered ? s.accent : "rgba(255,255,255,0.08)"}`,
            color: hovered ? s.accent : "rgba(255,255,255,0.55)",
          }}
        >
          Learn More
          <svg
            width="13"
            height="13"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
            />
          </svg>
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────

export function Services() {
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-80px" });

  return (
    <section
      id="services"
      className="relative overflow-hidden"
      style={{ background: "#050d1a" }}
    >
      {/* Ambient blobs */}
      <div
        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full"
        style={{
          background:
            "radial-gradient(ellipse, rgba(37,99,235,0.06) 0%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute bottom-0 right-0 w-[600px] h-[400px] rounded-full"
        style={{
          background:
            "radial-gradient(ellipse, rgba(16,185,129,0.05) 0%, transparent 70%)",
        }}
      />

      {/* Subtle grid texture */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(37,99,235,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">

        {/* ── Header ── */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 24 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold tracking-[0.18em] uppercase mb-6"
            style={{
              background: "rgba(37,99,235,0.06)",
              border: "1px solid rgba(37,99,235,0.12)",
              color: "var(--primary-blue)",
            }}
          >
            <svg
              width="6"
              height="6"
              viewBox="0 0 6 6"
              className="animate-pulse"
            >
              <circle cx="3" cy="3" r="3" fill="#64ddff" />
            </svg>
            OUR SERVICES
          </span>

          <h2 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight leading-[1.08] text-white mb-4">
            Everything your business needs
            <br />
            <span
              style={{
                background:
                  "linear-gradient(92deg, #64ddff 0%, #34d399 55%, #60a5fa 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              to run on autopilot.
            </span>
          </h2>
          <p className="text-slate-400 text-base max-w-lg mx-auto leading-relaxed">
            Six AI-powered modules that work independently or as a unified stack — deploy
            the ones you need, scale when you're ready.
          </p>

          {/* Module count strip */}
          <div className="flex items-center justify-center gap-6 mt-8">
            {[
              { v: "6", l: "Modules" },
              { v: "20+", l: "Languages" },
              { v: "99.9%", l: "Uptime SLA" },
              { v: "$0", l: "Setup Fees" },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <p
                  className="text-xl font-extrabold leading-none"
                  style={{
                    color: "#64ddff",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {item.v}
                </p>
                <p className="text-[11px] text-slate-500 mt-1 font-medium tracking-wide">
                  {item.l}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Cards Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {services.map((s, i) => (
            <ServiceCard key={s.id} s={s} index={i} />
          ))}
        </div>

        {/* ── Trust Bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl px-6 sm:px-10 py-6 mt-6"
          style={{
            background:
              "linear-gradient(135deg, rgba(100,221,255,0.04) 0%, rgba(52,211,153,0.03) 100%)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div className="flex flex-wrap items-center justify-center sm:justify-between gap-6">
            {trustItems.map((t, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{
                    background: "rgba(100,221,255,0.08)",
                    border: "1px solid rgba(100,221,255,0.15)",
                  }}
                >
                  {t.icon}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm leading-tight">
                    {t.label}
                  </p>
                  <p className="text-slate-500 text-xs mt-0.5">{t.desc}</p>
                </div>
                {i < trustItems.length - 1 && (
                  <div className="hidden sm:block w-px h-8 bg-white/[0.06] ml-3" />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Footer line */}
        <p className="text-center text-xs text-slate-600 mt-7">
          All plans include a 14-day free trial.{" "}
          <a
            href="/services"
            className="font-semibold transition-opacity hover:opacity-75"
            style={{ color: "#64ddff" }}
          >
            View full pricing →
          </a>
        </p>
      </div>
    </section>
  );
}