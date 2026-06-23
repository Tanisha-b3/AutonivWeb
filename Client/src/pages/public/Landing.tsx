import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { contactService } from "../../services/api";
import { PublicNavbar } from "../../components/PublicNavbar";
import {
  MicrophoneIcon,
  Squares2X2Icon,
  SpeakerWaveIcon,
} from "@heroicons/react/24/outline";
import { PhoneIcon } from "@heroicons/react/24/solid";

const AuthDialog = lazy(() =>
  import("./AuthDialog").then((m) => ({ default: m.AuthDialog })),
);
// const LandingCallWidget = lazy(() => import('../../components/LandingCallWidget'));
import Footer from "./Footer";

const LOGO_SRC = "/autoniv.png";

/* ─── Data ───────────────────────────────────────────────── */
const features = [
  {
    icon: "🎙️",
    title: "AI Voice Agents",
    desc: "Deploy intelligent voice assistants with 20+ languages and 100+ realistic voices for natural, human-like conversation.",
    metric: "3×",
    metricLabel: "faster response",
    color: "#2563EB",
  },
  {
    icon: "🌍",
    title: "Global Language Support",
    desc: "Serve customers worldwide with AI agents that speak 20+ languages including English, Hindi, Arabic, and more.",
    metric: "20+",
    metricLabel: "languages",
    color: "#10B981",
  },
  {
    icon: "🎧",
    title: "Premium Voice Selection",
    desc: "Choose from 100+ realistic voices across different ages, genders, and accents to match your brand perfectly.",
    metric: "100+",
    metricLabel: "voices",
    color: "#10B981",
  },
  {
    icon: "📊",
    title: "Smart Analytics",
    desc: "Track call performance, lead conversion, and agent effectiveness with real-time dashboards.",
    metric: "99.8%",
    metricLabel: "accuracy rate",
    color: "#2563EB",
  },
  {
    icon: "🔗",
    title: "CRM Integration",
    desc: "Seamlessly sync leads and call data with your existing CRM and business tools.",
    metric: "50+",
    metricLabel: "integrations",
    color: "#10B981",
  },
  {
    icon: "🛡️",
    title: "Enterprise Security",
    desc: "Bank-grade encryption and compliance for your business communication needs.",
    metric: "SOC 2",
    metricLabel: "certified",
    color: "#10B981",
  },
];

// Random-ish base heights for an organic spectrum look (in px)
const WAVE_HEIGHTS = Array.from({ length: 38 }, (_, i) => {
  return 14 + Math.sin(i * 0.7) * 18 + Math.cos(i * 1.3) * 10 + Math.sin(i * 2.1) * 6;
});


const STEPS = [
  {
    n: "01",
    title: "Describe",
    desc: "Tell us what your agent should do in plain text — no code, no prompts, no config files.",
    icon: "✍️",
  },
  {
    n: "02",
    title: "Configure",
    desc: "Pick a voice, language, and persona. Fine-tune with drag-and-drop or just keep chatting with the editor.",
    icon: "🎛️",
  },
  {
    n: "03",
    title: "Test",
    desc: "Simulate real calls, edge cases, and stress scenarios before going live. Catch issues early.",
    icon: "🧪",
  },
  {
    n: "04",
    title: "Deploy",
    desc: "Go live on your phone number, website widget, or API in one click.",
    icon: "🚀",
  },
  {
    n: "05",
    title: "Observe",
    desc: "Live dashboards, call transcripts, sentiment scores, and conversion tracking — all in one place.",
    icon: "📊",
  },
];

const COMPARISON = [
  {
    capability: "24/7 Availability",
    autoniv: { text: "Always on", status: "yes" },
    human: { text: "9–6 only", status: "no" },
    dialers: { text: "Yes but robotic", status: "maybe" },
  },
  {
    capability: "Human-like conversation",
    autoniv: { text: "Natural AI dialogue", status: "yes" },
    human: { text: "Inconsistent", status: "maybe" },
    dialers: { text: "Robotic scripts", status: "no" },
  },
  {
    capability: "Custom scripts per business",
    autoniv: { text: "Fully tailored", status: "yes" },
    human: { text: "Depends on rep", status: "maybe" },
    dialers: { text: "Generic only", status: "no" },
  },
  {
    capability: "CRM + WhatsApp sync",
    autoniv: { text: "Full integration", status: "yes" },
    human: { text: "Manual entry", status: "no" },
    dialers: { text: "Limited", status: "maybe" },
  },
  {
    capability: "Real-time analytics",
    autoniv: { text: "Live dashboard", status: "yes" },
    human: { text: "No structure", status: "no" },
    dialers: { text: "Basic only", status: "maybe" },
  },
  {
    capability: "Setup time",
    autoniv: { text: "48 hours", status: "yes" },
    human: { text: "2–4 weeks", status: "no" },
    dialers: { text: "1–2 weeks", status: "maybe" },
  },
  {
    capability: "Cost vs. human team",
    autoniv: { text: "−65% cost", status: "yes" },
    human: { text: "Highest cost", status: "highest" },
    dialers: { text: "−20% only", status: "maybe" },
  },
  {
    capability: "Scale instantly",
    autoniv: { text: "120 → 12,000", status: "yes" },
    human: { text: "Hire & retrain", status: "no" },
    dialers: { text: "Limited", status: "maybe" },
  },
];

const renderCellContent = (status: string, text: string) => {
  if (status === "yes")
    return (
      <span style={{ color: "#10B981", fontWeight: 600 }}>
        <span style={{ marginRight: 6, fontWeight: 700 }}>✓</span>
        {text}
      </span>
    );
  if (status === "no")
    return (
      <span style={{ color: "#64748b" }}>
        <span style={{ marginRight: 6, color: "#94a3b8", fontWeight: 700 }}>
          ✗
        </span>
        {text}
      </span>
    );
  if (status === "maybe")
    return (
      <span style={{ color: "#64748b" }}>
        <span style={{ marginRight: 6, color: "#94a3b8", fontWeight: 700 }}>
          ~
        </span>
        {text}
      </span>
    );
  if (status === "highest")
    return <span style={{ color: "#ef4444", fontWeight: 600 }}>{text}</span>;
  return <span>{text}</span>;
};

const ADDONS = [
  {
    id: "performance-report",
    icon: "📊",
    title: "Monthly Performance Report",
    price: "₹3,999–₹6,999 / month",
    category: "recurring",
    description:
      "Branded PDF with call quality scores, script performance, A/B outcomes, and industry benchmarks.",
  },
  {
    id: "ab-testing",
    icon: "🧪",
    title: "Script A/B Testing",
    price: "₹8,999 / month",
    category: "recurring",
    description:
      "Run two scripts simultaneously. Analyze conversion rates and receive an optimized version monthly.",
  },
  {
    id: "whatsapp-sequences",
    icon: "💬",
    title: "WhatsApp Follow-Up Sequences",
    price: "₹4,999 / month",
    category: "recurring",
    description:
      "Automated post-call WhatsApp flows: reminders, no-show follow-ups, requalification messages.",
  },
  {
    id: "regional-language",
    icon: "🌐",
    title: "Regional Language Agent",
    price: "₹8,000 / month per language",
    category: "recurring",
    description:
      "Hindi, Tamil, Telugu, Bengali — reach Tier 2/3 city leads in their native language.",
  },
  {
    id: "reactivation",
    icon: "🔁",
    title: "Reactivation Campaigns",
    price: "₹14,999 / campaign",
    category: "one-time",
    description:
      "We call your dormant lead database quarterly. New pipeline with zero new ad spend.",
  },
  {
    id: "white-label",
    icon: "🏷️",
    title: "White-Label Reseller",
    price: "₹49,999 setup + revenue share",
    category: "one-time",
    description:
      "Agencies and consultants: resell Autoniv under your brand with full support.",
  },
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "CEO, HealthFirst Clinic",
    quote:
      "Autoniv transformed our patient intake. We handle 3× more calls with the same staff.",
    initials: "SC",
    metric: "+40% leads",
  },
  {
    name: "Marcus Johnson",
    role: "Director, BrightHome Services",
    quote:
      "The AI receptionist never sleeps. Our leads increased by 40% in the first month alone.",
    initials: "MJ",
    metric: "3× capacity",
  },
  {
    name: "Emily Rodriguez",
    role: "VP Operations, FastTrack Auto",
    quote:
      "Setup was instant. The AI sounds so natural, customers don't know it's not human.",
    initials: "ER",
    metric: "2min setup",
  },
];

const useCases = [
  {
    title: "Healthcare",
    desc: "Automate patient scheduling, prescription reminders, and follow-up calls.",
    icon: "🏥",
    stat: "60% fewer no-shows",
  },
  {
    title: "Real Estate",
    desc: "Qualify leads, schedule viewings, and follow up on listings 24/7.",
    icon: "🏠",
    stat: "3× more qualified leads",
  },
  {
    title: "Financial Services",
    desc: "Handle loan inquiries, payment reminders, and account support calls.",
    icon: "🏦",
    stat: "50% cost reduction",
  },
];

const integrationsRow1 = [
  { name: "Azure", icon: "☁️" },
  { name: "Gemini", icon: "💎" },
  { name: "Anthropic", icon: "🧠" },
  { name: "Groq", icon: "⚡" },
  { name: "Cartesia", icon: "🎙️" },
  { name: "Make", icon: "🔄" },
  { name: "n8n", icon: "🔗" },
  { name: "Google Calendar", icon: "📅" },
];

const integrationsRow2 = [
  { name: "WhatsApp", icon: "💬" },
  { name: "Discord", icon: "💜" },
  { name: "Instagram", icon: "📸" },
  { name: "Facebook", icon: "👤" },
  { name: "Telegram", icon: "✈️" },
  { name: "Google Docs", icon: "📄" },
  { name: "Microsoft", icon: "🪟" },
  { name: "Twilio", icon: "📞" },
];

const CONVERSATION = [
  { role: "user", text: "Hi, I'd like to book an appointment", delay: 800 },
  {
    role: "agent",
    text: "Of course! What day works best for you?",
    delay: 2400,
  },
  { role: "user", text: "Next Tuesday around 2 PM if possible", delay: 4200 },
  {
    role: "agent",
    text: "Tuesday 2 PM is available — shall I confirm?",
    delay: 5900,
  },
  { role: "user", text: "Yes please!", delay: 7600 },
  {
    role: "agent",
    text: "Done! You're booked. See you Tuesday ✓",
    delay: 9100,
  },
];

/* ─── Noise Overlay ──────────────────────────────────────── */
function NoiseOverlay() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    const S = 256;
    c.width = S;
    c.height = S;
    const id = ctx.createImageData(S, S);
    for (let i = 0; i < id.data.length; i += 4) {
      const v = Math.random() * 255;
      id.data[i] = id.data[i + 1] = id.data[i + 2] = v;
      id.data[i + 3] = 10;
    }
    ctx.putImageData(id, 0, 0);
  }, []);
  return (
    <canvas
      ref={ref}
      className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-[0.025]"
      style={{ imageRendering: "pixelated" }}
    />
  );
}

/* ─── Aurora ─────────────────────────────────────────────── */
function Aurora() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div className="aurora-orb aurora-1" />
      <div className="aurora-orb aurora-2" />
      <div className="aurora-orb aurora-3" />
    </div>
  );
}

const PARTICLE_FIELD = Array.from({ length: 90 }).map((_, i) => {
  const seed = (i * 9301 + 49297) % 233280;
  const rand = seed / 233280;
  const x = (i / 90) * 100;
  const distFromCenter = Math.abs(x - 50) / 50; // 0 center, 1 edges
  const density = Math.max(0.15, 1 - distFromCenter * 0.7);
  return {
    x,
    y: (rand - 0.5) * 1.3,
    size: 1 + rand * 1.5,
    opacity: density * (0.3 + rand * 0.5),
    delay: rand * 3.5,
  };
});

/* ───────────────────────────────────────────────────────────────────
   2) COMPONENTS — add alongside your other component definitions
   (e.g. near Waveform / VoiceOrb)
   ─────────────────────────────────────────────────────────────────── */

/* ─── Full Spectrum Field (bars + particles, low height, slow speed) ── */

function SpectrumField({ active }: { active: boolean }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        transform: "none",
        perspective: "none",
      }}
    >
      {/* Particle dots layer */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
      >
        {PARTICLE_FIELD.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={50 + p.y * 38}
            r={p.size * 0.35}
            fill={p.x < 50 ? "#34D399" : "#60a5fa"}
            opacity={active ? p.opacity : p.opacity * 0.35}
            style={{
              animation: active
                ? `dotFlicker ${2.2 + p.delay}s ease-in-out ${p.delay}s infinite`
                : "none",
            }}
          />
        ))}
      </svg>

      {/* Bar spectrum layer — bars are centered vertically as a column, growing symmetrically
          from a fixed midline (NOT skewed/rotated). Each bar's own height controls how far
          it extends above/below that midline equally, capped well inside the panel. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 3,
          transform: "none",
        }}
      >
        {Array.from({ length: 64 }).map((_, i) => {
          const total = 64;
          const center = (total - 1) / 2;
          const dist = Math.abs(i - center);
          const distRatio = dist / center;

          // gap near the very center so the orb sits cleanly on top — widened for breathing room
          const centerGap = distRatio < 0.3 ? 0 : 1;

          // peak sits a little out from the ring, leaving visible space before bars start
          const peakPos = 0.18;
          const envelope =
            distRatio < peakPos
              ? 0.45 + (distRatio / peakPos) * 0.35
              : 1 - ((distRatio - peakPos) / (1 - peakPos)) * 0.78;

          const seed = (i * 7919 + 104729) % 1000;
          const jitter = 0.75 + (seed / 1000) * 0.4;

          // height capped much lower so bars stay small, leaving the ring's glow clearly visible
          const h = Math.max(
            2,
            Math.min(46, envelope * jitter * 46 * centerGap),
          );

          const isLeftHalf = i < total / 2;

          return (
            <div
              key={i}
              style={{
                width: 3,
                borderRadius: 99,
                height: active ? `${h}%` : "2%",
                background: isLeftHalf
                  ? "linear-gradient(180deg,#5eead4,#10b981)"
                  : "linear-gradient(180deg,#7dd3fc,#3b82f6)",
                opacity: active ? 0.92 : 0.18,
                boxShadow: active
                  ? isLeftHalf
                    ? "0 0 6px rgba(16,185,129,0.35)"
                    : "0 0 6px rgba(59,130,246,0.35)"
                  : "none",
                animation: active
                  ? `waveBounce ${1.9 + (i % 6) * 0.25}s ease-in-out ${i * 0.05}s infinite`
                  : "none",
                transition: "height .4s ease, opacity .4s ease",
                flexShrink: 0,
                transform: "none",
              }}
            />
          );
        })}
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 60% 90% at 50% 50%, transparent 0%, transparent 55%, rgba(10,10,10,0.0) 100%)",
        }}
      />
    </div>
  );
}

/* ─── Glow Ring Orb (cyan ring + solid mic circle) ── */
function GlowRingOrb({
  active,
  scale = 1,
}: {
  active: boolean;
  scale?: number;
}) {
  const s = (n: number) => n * scale;
  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: s(150),
        height: s(150),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10,
      }}
    >
      {/* outer soft glow */}
      <div
        style={{
          position: "absolute",
          width: s(140),
          height: s(140),
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(34,211,238,0.18) 0%, rgba(34,211,238,0.04) 55%, transparent 75%)",
          filter: `blur(${s(10)}px)`,
          animation: active ? "orbPulseGlow 2.6s ease-in-out infinite" : "none",
        }}
      />
      {/* glowing ring */}
      <div
        style={{
          position: "absolute",
          width: s(110),
          height: s(110),
          borderRadius: "50%",
          border: `${Math.max(2, s(4))}px solid`,
          borderColor: "#22d3ee",
          boxShadow: `0 0 ${s(12)}px rgba(34,211,238,0.45), 0 0 ${s(24)}px rgba(59,130,246,0.2), inset 0 0 ${s(10)}px rgba(34,211,238,0.20)`,
        }}
      />
      {/* faint outer ring echo */}
      <div
        style={{
          position: "absolute",
          width: s(130),
          height: s(130),
          borderRadius: "50%",
          border: "1px solid rgba(34,211,238,0.12)",
        }}
      />
      {/* solid mic circle */}
      <div
        style={{
          position: "relative",
          width: s(60),
          height: s(60),
          borderRadius: "50%",
          background: "radial-gradient(circle at 35% 35%,#3b82f6,#1d4ed8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 0 ${s(16)}px rgba(37,99,235,0.4)`,
        }}
      >
        <svg
          width={s(24)}
          height={s(24)}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="9" y="2" width="6" height="12" rx="3" />
          <path d="M5 10a7 7 0 0014 0" />
          <line x1="12" y1="19" x2="12" y2="22" />
          <line x1="9" y1="22" x2="15" y2="22" />
        </svg>
      </div>
    </div>
  );
}

{
  /*
  USAGE — pass a smaller scale when placing inside the hero phone mockup, e.g.:
    <GlowRingOrb active={true} scale={0.45} />   // ~67px wide, fits a 144px phone screen area
    <GlowRingOrb active={true} scale={0.6} />    // ~90px wide, for sm breakpoint phone
  Default scale={1} keeps it at full 150px size for the demo section.
*/
}

// /* ─── Waveform ───────────────────────────────────────────── */
// function Waveform({ active, color = "#10B981" }: { active: boolean; color?: string }) {
//   return (
//     <div style={{ display: "flex", alignItems: "center", gap: 2.5, height: 28 }}>
//       {Array.from({ length: 20 }).map((_, i) => (
//         <div key={i} style={{ width: 2.5, borderRadius: 99, background: color, height: active ? `${8 + Math.abs(Math.sin(i * .75)) * 18}px` : "4px", opacity: active ? 1 : .2, animation: active ? `waveBar ${.55 + (i % 6) * .1}s ease-in-out ${i * .03}s infinite alternate` : "none", transition: "height .35s ease, opacity .35s ease" }} />
//       ))}
//     </div>
//   );
// }

// /* ─── Orb Waveform (organic spectrum, wraps radially around the orb) ── */
// function OrbWaveform({ active, color = "#10B981" }: { active: boolean; color?: string }) {
//   return (
//     <div className="absolute inset-0 flex items-center justify-center gap-[2px] sm:gap-[2.5px] z-0 pointer-events-none">
//       {WAVE_HEIGHTS.map((baseH, i) => {
//         const center = (WAVE_HEIGHTS.length - 1) / 2;
//         const dist = Math.abs(i - center);
//         const envelope = Math.max(0.16, 1 - (dist / center) * 0.84);
//         const h = Math.max(6, baseH * envelope * 1.6);
//         return (
//           <div
//             key={i}
//             className="rounded-full"
//             style={{
//               width: "3px",
//               height: active ? `${h}px` : "6px",
//               background: i % 2 === 0
//                 ? `linear-gradient(180deg,${color},#0a8f63)`
//                 : "linear-gradient(180deg,#60a5fa,#1d4ed8)",
//               opacity: active ? 0.95 : 0.25,
//               animation: active ? "waveBounce 1s ease-in-out infinite" : "none",
//               animationDelay: `${i * 0.045}s`,
//               transition: "height .35s ease, opacity .35s ease"
//             }}
//           />
//         );
//       })}
//     </div>
//   );
// }

// /* ─── Voice Orb ──────────────────────────────────────────── */
// function VoiceOrb({ speaking }: { speaking: "user" | "agent" | "idle" }) {
//   const isAgent = speaking === "agent", isUser = speaking === "user";
//   const coreColor = isAgent ? "#10B981" : isUser ? "#2563EB" : "#64748b";
//   const ringColor = isAgent ? "rgba(16,185,129,0.15)" : isUser ? "rgba(37,99,235,0.13)" : "rgba(100,116,139,0.05)";
//   return (
//     <div style={{ position: "relative", width: 160, height: 160, display: "flex", alignItems: "center", justifyContent: "center" }}>
//       {speaking !== "idle" && [0, 1, 2].map(i => (
//         <div key={i} style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `1px solid ${ringColor}`, animation: `ringPulse 2s ease-out ${i * .65}s infinite`, pointerEvents: "none" }} />
//       ))}
//       <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px solid rgba(16,185,129,0.10)" }} />
//       <div style={{ position: "absolute", width: 120, height: 120, borderRadius: "50%", background: isAgent ? "rgba(16,185,129,0.18)" : isUser ? "rgba(37,99,235,0.15)" : "rgba(100,116,139,0.05)", filter: "blur(28px)", transition: "background .6s ease" }} />
//       <div style={{ position: "relative", zIndex: 2, width: 76, height: 76, borderRadius: "50%", background: speaking === "idle" ? "radial-gradient(circle at 35% 35%,#1a1a1a,#0a0a0a)" : isAgent ? "radial-gradient(circle at 35% 35%,#34d399 0%,#10b981 45%,#059669 100%)" : "radial-gradient(circle at 35% 35%,#60a5fa 0%,#2563eb 60%,#1d4ed8 100%)", border: `1.5px solid ${coreColor}35`, boxShadow: speaking !== "idle" ? `0 0 0 3px ${coreColor}15,0 0 40px ${coreColor}30,inset 0 1px 0 rgba(255,255,255,.12)` : "0 0 20px rgba(16,185,129,.10),inset 0 1px 0 rgba(255,255,255,.06)", transition: "all .5s cubic-bezier(.16,1,.3,1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
//         <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={speaking === "idle" ? "#94a3b8" : "#fff"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "stroke .4s ease" }}>
//           <rect x="9" y="2" width="6" height="12" rx="3" />
//           <path d="M5 10a7 7 0 0014 0" /><line x1="12" y1="19" x2="12" y2="22" /><line x1="9" y1="22" x2="15" y2="22" />
//         </svg>
//       </div>
//     </div>
//   );
// }

/* ─── Scroll Reveal ──────────────────────────────────────── */
function Reveal({
  children,
  className,
  delay = 0,
  from = "bottom",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  from?: "bottom" | "left" | "right" | "scale";
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const t: Record<string, string> = {
      bottom: "translateY(32px)",
      left: "translateX(-32px)",
      right: "translateX(32px)",
      scale: "scale(0.92)",
    };
    el.style.opacity = "0";
    el.style.transform = t[from];
    el.style.transition = `opacity .85s ${delay}s cubic-bezier(.16,1,.3,1),transform .85s ${delay}s cubic-bezier(.16,1,.3,1)`;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.style.opacity = "1";
          el.style.transform = "none";
          obs.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay, from]);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/* ─── TiltCard ───────────────────────────────────────────── */
function TiltCard({
  children,
  className = "",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateX(${-y * 10}deg) rotateY(${x * 10}deg) translateZ(14px)`;
    const sh = el.querySelector<HTMLElement>(".shine");
    if (sh)
      sh.style.background = `radial-gradient(circle at ${(x + 0.5) * 100}% ${(y + 0.5) * 100}%,rgba(34,197,94,.10) 0%,transparent 60%)`;
  };
  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(900px) rotateX(0) rotateY(0)";
    const sh = el.querySelector<HTMLElement>(".shine");
    if (sh) sh.style.background = "transparent";
  };
  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={className}
      style={{
        transition: "transform .14s ease-out",
        transformStyle: "preserve-3d",
        ...style,
      }}
    >
      <div className="shine absolute inset-0 rounded-[inherit] pointer-events-none z-10 transition-all duration-200" />
      {children}
    </div>
  );
}

/* ─── Magnetic Button ────────────────────────────────────── */
function MagBtn({
  children,
  className,
  to,
  onClick,
  style,
}: {
  children: React.ReactNode;
  className: string;
  to?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.35}px,${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "none";
  };
  const inner = to ? (
    <Link to={to} className={className} style={style}>
      {children}
    </Link>
  ) : (
    <button onClick={onClick} className={className} style={style}>
      {children}
    </button>
  );
  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        transition: "transform .28s cubic-bezier(.23,1,.32,1)",
        display: "inline-block",
      }}
    >
      {inner}
    </div>
  );
}

/* ─── Contact Form ───────────────────────────────────────── */
function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const WA = "917065990307";
  const openWA = () => {
    const lines = [
      "Hello! I have an inquiry via Contact Us form:",
      "",
      `Name: ${name}`,
      `Email: ${email}`,
      phone ? `Phone: ${phone}` : "",
      company ? `Company: ${company}` : "",
      "",
      `Message: ${message}`,
    ].filter(Boolean);
    window.open(
      `https://wa.me/${WA}?text=${encodeURIComponent(lines.join("\n"))}`,
      "_blank",
    );
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await contactService.submit({ name, email, phone, company, message });
      openWA();
      setSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };
  const inputStyle = {
    background: "rgba(37,99,235,.03)",
    border: "1px solid rgba(37,99,235,.18)",
    color: "#0a0a0a",
  } as React.CSSProperties;
  const onFocus = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => (e.target.style.borderColor = "rgba(37,99,235,.5)");
  const onBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => (e.target.style.borderColor = "rgba(37,99,235,.18)");
  if (submitted)
    return (
      <div className="text-center py-8 space-y-4">
        <div
          className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center"
          style={{
            background: "rgba(16,185,129,.1)",
            border: "1px solid rgba(16,185,129,.25)",
          }}
        >
          <svg
            className="w-7 h-7"
            fill="none"
            stroke="#10B981"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-xl font-bold" style={{ color: "#0a0a0a" }}>
          Thank you!
        </h3>
        <p className="text-sm" style={{ color: "#52525b" }}>
          Your details have been sent to our team on WhatsApp. We'll get back to
          you within 24 hours.
        </p>
      </div>
    );
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          {
            label: "Full Name *",
            type: "text",
            val: name,
            set: setName,
            ph: "John Doe",
            req: true,
          },
          {
            label: "Email *",
            type: "email",
            val: email,
            set: setEmail,
            ph: "you@company.com",
            req: true,
          },
        ].map((f) => (
          <div key={f.label}>
            <label
              className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
              style={{ color: "#52525b" }}
            >
              {f.label}
            </label>
            <input
              type={f.type}
              required={f.req}
              value={f.val}
              onChange={(e) => f.set(e.target.value)}
              placeholder={f.ph}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all placeholder-black/30"
              style={inputStyle}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          {
            label: "Phone",
            type: "tel",
            val: phone,
            set: setPhone,
            ph: "9876543210",
          },
          {
            label: "Company",
            type: "text",
            val: company,
            set: setCompany,
            ph: "Your Company",
          },
        ].map((f) => (
          <div key={f.label}>
            <label
              className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
              style={{ color: "#52525b" }}
            >
              {f.label}
            </label>
            <input
              type={f.type}
              value={f.val}
              onChange={(e) => f.set(e.target.value)}
              placeholder={f.ph}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all placeholder-black/30"
              style={inputStyle}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>
        ))}
      </div>
      <div>
        <label
          className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
          style={{ color: "#52525b" }}
        >
          Message *
        </label>
        <textarea
          required
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us about your needs — team size, call volume, use case..."
          className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all resize-none placeholder-black/30"
          style={inputStyle}
          onFocus={onFocus}
          onBlur={onBlur}
        />
      </div>
      {error && (
        <p className="text-sm font-medium" style={{ color: "#ff4d4d" }}>
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="btn-cta btn-responsive-lg w-full font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50"
        style={{ background: "var(--gg)", color: "#ffffff" }}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Sending…
          </>
        ) : (
          <>
            Send Message
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </>
        )}
      </button>
      <p className="text-center text-[11px]" style={{ color: "#a1a1aa" }}>
        No spam. We'll only reach out to discuss your requirements.
      </p>
    </form>
  );
}

/* ─── USP Slider (auto-rotate every 3s) ───────────────────── */
function USPSlider() {
  const [current, setCurrent] = useState(0);
  const usps = [
    { icon: '🎙️', text: 'AI Voice Agents – Answer, Qualify & Convert Leads 24/7' },
    { icon: '🌍', text: 'Multi-Language Support – AI That Speaks Your Customers\' Language' },
    { icon: '⚡', text: 'Quick Setup – Live in Minutes, No Code Needed' },
  ];

  useEffect(() => {
    const t = setInterval(() => setCurrent((i) => (i + 1) % usps.length), 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className="fixed top-0 inset-x-0 z-[60] overflow-hidden"
      style={{
        background: 'linear-gradient(90deg,#030B2E 0%,#0a1628 50%,#030B2E 100%)',
        borderBottom: '1px solid rgba(16,185,129,0.15)',
        height: '36px',
      }}
    >
      <div className="relative flex items-center justify-center h-full px-4 sm:px-6">
        {usps.map((usp, i) => (
          <span
            key={i}
            className="absolute inline-flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-sm font-medium transition-all duration-500 text-center whitespace-nowrap overflow-hidden text-ellipsis max-w-[90vw] sm:max-w-full"
            style={{
              color: 'rgba(255,255,255,0.85)',
              opacity: i === current ? 1 : 0,
              transform: i === current ? 'translateY(0)' : 'translateY(12px)',
            }}
          >
            <span className="text-xs sm:text-sm flex-shrink-0">{usp.icon}</span>
            <span className="truncate">{usp.text}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── FAQ Accordion Item ───────────────────────────────── */
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="rounded-xl overflow-hidden transition-all duration-300"
      style={{
        background: '#ffffff',
        border: open ? '1px solid rgba(37,99,235,0.2)' : '1px solid rgba(37,99,235,0.08)',
        boxShadow: open ? '0 8px 30px rgba(37,99,235,0.06)' : '0 2px 10px rgba(0,0,0,0.02)',
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
        style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
      >
        <span className="text-sm sm:text-base font-semibold pr-4" style={{ color: '#0a0a0a' }}>{question}</span>
        <svg
          className="w-5 h-5 shrink-0 transition-transform duration-300"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', color: '#2563EB' }}
          fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: open ? '200px' : '0', opacity: open ? 1 : 0 }}
      >
        <p className="px-5 pb-4 text-sm leading-relaxed" style={{ color: '#475569' }}>{answer}</p>
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────── */
export function Landing() {
  const [authDialog, setAuthDialog] = useState<
    "login" | "register" | "forgot_password" | "reset_password" | null
  >(null);
  const [authMode, setAuthMode] = useState<
    "login" | "register" | "forgot_password" | "reset_password"
  >("login");
  const [activeUseCase, setActiveUseCase] = useState(0);
  // Demo state
  const [demoMsgs, setDemoMsgs] = useState<
    { role: string; text: string; id: number }[]
  >([]);
  const [speaking, setSpeaking] = useState<"user" | "agent" | "idle">("idle");
  const [demoRunning, setDemoRunning] = useState(false);
  const [demoDone, setDemoDone] = useState(false);
  const demoTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const openAuth = (mode: typeof authMode) => {
    setAuthMode(mode);
    setAuthDialog(mode);
  };
  const closeAuth = () => setAuthDialog(null);
  const scrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const t = setInterval(
      () => setActiveUseCase((i) => (i + 1) % useCases.length),
      3500,
    );
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    const container = chatEndRef.current?.parentElement;
    if (container) container.scrollTop = container.scrollHeight;
  }, [demoMsgs]);
  useEffect(
    () => () => {
      demoTimers.current.forEach(clearTimeout);
    },
    [],
  );

  const [pricingYearly, setPricingYearly] = useState(false);

  // Auto-play demo when section is visible
  const demoSectionRef = useRef<HTMLDivElement>(null);
  const demoRunningRef = useRef(false);
  useEffect(() => {
    demoRunningRef.current = demoRunning;
  }, [demoRunning]);
  useEffect(() => {
    const el = demoSectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !demoRunningRef.current) {
          setTimeout(() => startDemo(), 600);
        }
      },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const startDemo = () => {
    demoTimers.current.forEach(clearTimeout);
    demoTimers.current = [];
    setDemoMsgs([]);
    setSpeaking("idle");
    setDemoDone(false);
    setDemoRunning(true);
    CONVERSATION.forEach((msg, i) => {
      const tS = setTimeout(
        () => setSpeaking(msg.role as "user" | "agent"),
        msg.delay - 350,
      );
      const tM = setTimeout(() => {
        setDemoMsgs((p) => [...p, { ...msg, id: i }]);
        const next = CONVERSATION[i + 1];
        const gap = next ? next.delay - msg.delay : 1800;
        if (gap > 900) {
          const tI = setTimeout(
            () => setSpeaking("idle"),
            Math.min(gap - 400, 1200),
          );
          demoTimers.current.push(tI);
        }
        if (i === CONVERSATION.length - 1) {
          const tD = setTimeout(() => {
            setDemoMsgs([]);
            setDemoDone(false);
            startDemo();
          }, 1800);
          demoTimers.current.push(tD);
        }
      }, msg.delay);
      demoTimers.current.push(tS, tM);
    });
  };

  const waveKeyframes = `
    @keyframes waveBounce {
      0%, 100% { transform: scaleY(1); }
      50% { transform: scaleY(2.2); }
    }
    @keyframes bgWaveBounce {
      0%, 100% { transform: scaleY(1); }
      50% { transform: scaleY(1.8); }
    }
    @keyframes orbPulseGlow {
      0%, 100% { box-shadow: 0 0 18px rgba(34,211,238,0.3), 0 0 36px rgba(34,211,238,0.1); }
      50% { box-shadow: 0 0 28px rgba(34,211,238,0.5), 0 0 56px rgba(34,211,238,0.2); }
    }
  `;
  
    const styleRef = useRef<HTMLStyleElement | null>(null);

  useEffect(() => {
    if (!styleRef.current) {
      const style = document.createElement("style");
      style.textContent = waveKeyframes;
      document.head.appendChild(style);
      styleRef.current = style;
    }
    return () => {
      if (styleRef.current) {
        document.head.removeChild(styleRef.current);
        styleRef.current = null;
      }
    };
  }, []);
  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{
        background: "#ffffff",
        fontFamily: "'Plus Jakarta Sans',sans-serif",
        color: "#475569",
      }}
    >
      {/* JSON-LD Structured Data for SEO/AEO/GEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Autoniv",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            description:
              "Deploy intelligent AI voice agents that handle calls 24/7 in 20+ languages. Automate appointments, qualify leads, and boost conversions.",
            url: "https://autoniv.com",
            logo: "https://autoniv.com/logo-autoniv.png",
            screenshot: "https://autoniv.com/og-image.png",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "INR",
              description: "Free tier available",
            },
            featureList: [
              "AI Voice Agents",
              "20+ Languages Support",
              "100+ Realistic Voices",
              "Smart Analytics",
              "CRM Integration",
              "Enterprise Security",
            ],
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "4.8",
              ratingCount: "150",
            },
            author: {
              "@type": "Organization",
              name: "Autoniv",
              url: "https://autoniv.com",
            },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Autoniv",
            url: "https://autoniv.com",
            logo: "https://autoniv.com/logo-autoniv.png",
            description: "AI Voice Agents for Business Communication",
            sameAs: [],
            contactPoint: {
              "@type": "ContactPoint",
              contactType: "Sales",
              availableLanguage: ["English", "Hindi"],
            },
          }),
        }}
      />

      <Suspense fallback={null}>
        <AuthDialog
          isOpen={authDialog !== null}
          mode={authMode}
          onClose={closeAuth}
          onSwitch={(m) => {
            setAuthMode(m);
            setAuthDialog(m);
          }}
        />
      </Suspense>
      <Aurora />
      <NoiseOverlay />

      <style>{`
        html, body { max-width: 100%; overflow-x: hidden; }
        :root{--bg:#ffffff;--s1:#F5F7FA;--s2:#e2e8f0;--card:rgba(255,255,255,0.75);--border:rgba(37,99,235,0.08);--text:#030B2E;--muted:#475569;--dim:#94a3b8;--g1:#2563EB;--g2:#10B981;--g3:#34D399;}

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
          border: 1px solid rgba(37,99,235,0.14);
          box-shadow: 0 1px 2px rgba(3,11,46,0.03), 0 24px 60px -24px rgba(37,99,235,0.12);
        }
        .section-box.tint{
          background: linear-gradient(180deg,#F5F7FA 0%, rgba(37,99,235,0.08) 100%);
          border: 1px solid rgba(37,99,235,0.16);
          box-shadow: 0 1px 2px rgba(3,11,46,0.03), 0 24px 60px -24px rgba(37,99,235,0.14);
        }
        .section-box.black{
          background: #030B2E;
          border: 1px solid rgba(16,185,129,0.18);
          box-shadow: 0 1px 2px rgba(0,0,0,0.4), 0 30px 70px -20px rgba(0,0,0,0.55), 0 0 0 1px rgba(16,185,129,0.04) inset;
        }
        .section-pad{ padding: 72px 28px; }
        @media(min-width:768px){ .section-pad{ padding: 96px 56px; } }
        .page-bg{
          background:
            radial-gradient(900px 500px at 12% 0%, rgba(37,99,235,0.07), transparent 60%),
            radial-gradient(900px 600px at 88% 18%, rgba(16,185,129,0.06), transparent 60%),
            radial-gradient(1000px 700px at 50% 100%, rgba(52,211,153,0.05), transparent 60%),
            #ffffff;
        }

        @keyframes float-y-1{0%,100%{transform:translateY(0px)}50%{transform:translateY(-9px)}}
        @keyframes float-y-2{0%,100%{transform:translateY(0px)}50%{transform:translateY(-12px)}}
        @keyframes float-y-3{0%,100%{transform:translateY(0px)}50%{transform:translateY(-8px)}}
        @keyframes float-y-4{0%,100%{transform:translateY(0px)}50%{transform:translateY(-10px)}}
        @keyframes orbPulseGlow{0%,100%{transform:scale(1);box-shadow:0 0 24px rgba(16,185,129,0.4)}50%{transform:scale(1.05);box-shadow:0 0 40px rgba(37,99,235,0.6)}}
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
        @keyframes livePulse{0%{box-shadow:0 0 0 0 rgba(16,185,129,.3)}70%{box-shadow:0 0 0 9px rgba(16,185,129,0)}100%{box-shadow:0 0 0 0 rgba(16,185,129,0)}}
        @keyframes slideIn{from{opacity:0;transform:translateY(10px) scale(0.97)}to{opacity:1;transform:none}}
        @keyframes ringPulse{0%{transform:scale(1);opacity:.7}100%{transform:scale(2.6);opacity:0}}
        @keyframes auroraPulse{0%,100%{opacity:.6;transform:scale(1) translate(0,0)}33%{opacity:.8;transform:scale(1.15) translate(3%,-4%)}66%{opacity:.5;transform:scale(.95) translate(-3%,5%)}}
        @keyframes borderFlow{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
        @keyframes progressBar{from{width:0%}to{width:100%}}
        @keyframes orbIdle{0%,100%{opacity:.7}50%{opacity:1}}
        
        @keyframes waveBounce {
  0%, 100% { transform: scaleY(0.4); opacity: 0.3; }
  50% { transform: scaleY(1); opacity: 0.8; }
}

@keyframes waveBounce {
  0%, 100% { transform: scaleY(1); }
  50% { transform: scaleY(0.25); }
}

@keyframes bgWaveBounce {
  0%, 100% { transform: scaleY(1); opacity: 0.2; }
  50% { transform: scaleY(0.15); opacity: 0.06; }
}

@keyframes orbPulseGlow {
  0%, 100% { box-shadow: 0 0 30px rgba(34,211,238,0.5), 0 0 60px rgba(34,211,238,0.2); }
  50% { box-shadow: 0 0 50px rgba(34,211,238,0.7), 0 0 90px rgba(34,211,238,0.3); }
}

        .gradient-text{background:linear-gradient(135deg,#2563EB 0%,#10B981 60%,#34D399 100%);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 4s linear infinite;}
        .aurora-orb{position:absolute;border-radius:50%;filter:blur(80px);animation:auroraPulse ease-in-out infinite;}
        .aurora-1{width:700px;height:700px;top:-200px;left:-150px;background:radial-gradient(circle,rgba(37,99,235,0.08) 0%,transparent 70%);animation-duration:18s;}
        .aurora-2{width:500px;height:500px;top:20%;right:-100px;background:radial-gradient(circle,rgba(16,185,129,0.08) 0%,transparent 70%);animation-duration:22s;animation-delay:-8s;}
        .aurora-3{width:600px;height:600px;bottom:-150px;left:30%;background:radial-gradient(circle,rgba(52,211,153,0.07) 0%,transparent 70%);animation-duration:26s;animation-delay:-12s;}
        .animate-fade-up{animation:fadeUp .85s cubic-bezier(.16,1,.3,1) both;}
        .animate-blink{animation:blink 1.1s step-start infinite;}
        .animate-live-pulse{animation:livePulse 2s infinite;}
        .animate-slide-in{animation:slideIn .4s cubic-bezier(.16,1,.3,1) both;}
        .delay-100{animation-delay:.1s}.delay-200{animation-delay:.2s}.delay-300{animation-delay:.3s}.delay-400{animation-delay:.4s}.delay-500{animation-delay:.5s}

        .glass-card{background:rgba(255,255,255,0.7);backdrop-filter:blur(20px);border:1px solid rgba(37,99,235,0.06);box-shadow:0 4px 30px rgba(0,0,0,0.02);}
        .glass-card:hover{border-color:rgba(37,99,235,0.18);box-shadow:0 10px 40px rgba(37,99,235,0.04);}
        .glass-card-dark{background:rgba(255,255,255,0.04);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.08);}
        .glass-card-dark:hover{border-color:rgba(16,185,129,0.30);background:rgba(255,255,255,0.06);}

        .btn-cta{background:linear-gradient(135deg,#2563EB,#10B981);background-size:200% 200%;animation:borderFlow 4s ease infinite;box-shadow:0 0 0 1px rgba(255,255,255,.15) inset,0 4px 14px rgba(37,99,235,.20);transition:transform .18s cubic-bezier(.16,1,.3,1),box-shadow .18s;}
        .btn-cta:hover{transform:translateY(-2px);box-shadow:0 0 0 1px rgba(255,255,255,.20) inset,0 6px 20px rgba(16,185,129,.30);}
        .btn-ghost{border:1px solid rgba(37,99,235,.20);color:#2563EB;transition:all .25s cubic-bezier(.16,1,.3,1);}
        .btn-ghost:hover{background:rgba(37,99,235,.06);border-color:rgba(37,99,235,.40);transform:translateY(-2px);}
        .btn-ghost-dark{border:1px solid rgba(16,185,129,.35);color:#34D399;transition:all .25s cubic-bezier(.16,1,.3,1);}
        .btn-ghost-dark:hover{background:rgba(16,185,129,.10);border-color:rgba(16,185,129,.6);transform:translateY(-2px);}

        .nav-glass{background:linear-gradient(90deg, rgba(255,255,255,0.88) 0%, rgba(245,247,250,0.85) 100%);backdrop-filter:blur(24px);border-bottom:1px solid rgba(37,99,235,0.12);}
        .nav-glass.scrolled{box-shadow:0 4px 30px rgba(37,99,235,0.06);}

        .divider{height:1px;background:linear-gradient(90deg,transparent,rgba(37,99,235,.08),rgba(16,185,129,.12),rgba(37,99,235,.08),transparent);}

        .btn-responsive{padding:10px 18px;border-radius:12px;font-size:13px;min-height:42px;}
        .btn-responsive-lg{padding:14px 24px;border-radius:14px;font-size:14px;min-height:48px;}
        .btn-responsive-xl{padding:16px 28px;border-radius:16px;font-size:15px;min-height:52px;}
        @media(min-width:640px){.btn-responsive{padding:12px 22px;font-size:14px;min-height:44px;}.btn-responsive-lg{padding:16px 28px;font-size:15px;min-height:50px;}.btn-responsive-xl{padding:18px 32px;font-size:16px;min-height:54px;}}
        @media(min-width:1024px){.btn-responsive{padding:14px 28px;font-size:15px;min-height:48px;}.btn-responsive-lg{padding:18px 36px;font-size:16px;min-height:54px;}.btn-responsive-xl{padding:20px 40px;font-size:17px;min-height:58px;}}

        .tag{font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:500;letter-spacing:0.12em;text-transform:uppercase;}
        .logo-img{height:140px;width:auto;object-fit:contain;}

        .step-line{position:absolute;left:19px;top:44px;bottom:-24px;width:1px;background:linear-gradient(to bottom,rgba(37,99,235,0.25),rgba(37,99,235,0.05));}

        .feature-card{transform-style:preserve-3d;transition:box-shadow .45s cubic-bezier(.16,1,.3,1),border-color .3s;}
        .feature-card:hover{box-shadow:0 32px 80px rgba(37,99,235,.10),0 8px 28px rgba(0,0,0,0.05);}

        .use-case-tab{position:relative;transition:all .3s cubic-bezier(.16,1,.3,1);cursor:pointer;}
        .use-case-tab.active::after{content:'';position:absolute;bottom:-1px;left:0;right:0;height:2px;background:linear-gradient(90deg,#2563EB,#10B981);border-radius:1px;}
        .progress-bar{animation:progressBar 3.5s linear;}

        .testimonial-card{transition:transform .4s cubic-bezier(.16,1,.3,1),box-shadow .4s;}
        .testimonial-card:hover{transform:perspective(1000px) rotateY(-5deg) rotateX(3deg) translateZ(10px);box-shadow:0 24px 60px rgba(37,99,235,.10);}

        .stat-pill{background:rgba(255,255,255,.80);border:1px solid rgba(37,99,235,.14);transition:all .3s cubic-bezier(.16,1,.3,1);}
        .stat-pill:hover{background:rgba(255,255,255,.95);border-color:rgba(37,99,235,.35);transform:translateY(-3px);box-shadow:0 10px 30px rgba(37,99,235,.10);}

        .chat-bubble-in{animation:slideIn .4s cubic-bezier(.16,1,.3,1) both;}
        .orb-idle{animation:orbIdle 3s ease-in-out infinite;}

        .use-case-tabs::-webkit-scrollbar{display:none;}


        @media(max-width:640px){
          .section-box{ border-radius: 20px; margin: 12px auto; }
          .section-pad{ padding: 48px 18px; }
          .demo-grid{grid-template-columns:1fr !important;min-height:auto !important;}
          .demo-grid > div:first-child{border-right:none !important;border-bottom:1px solid rgba(255,255,255,0.08) !important;padding:28px 20px !important;min-height:200px;}
          .demo-grid > div:last-child{padding:16px !important;min-height:200px;}
          .demo-status-text{font-size:9px !important;letter-spacing:0.05em !important;}
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
          
        }

        @media(max-width:640px){
          .hero-cta-row{display:flex !important;flex-direction:column !important;gap:12px !important;width:100% !important;}
          .hero-cta-row .hero-btn-row{display:flex !important;flex-direction:row !important;flex-wrap:nowrap !important;gap:8px !important;width:100% !important;}
          .hero-cta-row .hero-btn-row > button{flex:1 1 0 !important;min-width:0 !important;display:flex !important;align-items:center !important;justify-content:center !important;min-height:42px !important;font-size:11.5px !important;padding:8px 8px !important;gap:5px !important;white-space:nowrap !important;overflow:hidden !important;border-radius:12px !important;}
          .hero-cta-row .hero-btn-row > button svg.w-4{width:12px !important;height:12px !important;flex-shrink:0 !important;}
      `}</style>

      {/* ── USP Slider Bar ─────────────────────────── */}
      <USPSlider />

      <PublicNavbar />

      <div className="page-bg" style={{ paddingTop: 120, paddingBottom: 8 }}>
        <div className="box-wrap">
          <section className="section-box tint">
            <div
              className="section-pad relative overflow-hidden"
              style={{ paddingTop: 40, paddingBottom: 40 }}
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(37,99,235,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(37,99,235,0.05) 1px,transparent 1px)",
                  backgroundSize: "48px 48px",
                  maskImage:
                    "radial-gradient(ellipse 80% 50% at 50% 100%,black,transparent)",
                  WebkitMaskImage:
                    "radial-gradient(ellipse 80% 50% at 50% 100%,black,transparent)",
                }}
              />

              <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center w-full">
                {/* Text Content - First on mobile (order-1), Left on desktop (lg:order-1) */}
                <div className="lg:col-span-7 flex flex-col justify-center text-left space-y-4 lg:space-y-6 z-10 order-1 lg:order-1">
                  <div className="animate-fade-up delay-100">
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full tag text-xs sm:text-sm"
                      style={{
                        color: "#2563EB",
                        background: "rgba(37,99,235,0.08)",
                        border: "1px solid rgba(37,99,235,0.3)",
                      }}
                    >
                      ✦ AI Voice • Chat Solutions
                    </span>
                  </div>

                  <div className="animate-fade-up delay-200">
                    <h1
                      className="font-extrabold leading-[1.08] tracking-tight"
                      style={{
                        fontSize: "clamp(32px,8vw,66px)",
                        color: "#0a0a0a",
                      }}
                    >
                      Your Business Never Stops. <br />
                     <span
                        style={{
                          background:
                            "linear-gradient(135deg,#2563EB 0%,#2563EB 35%,#10B981 75%,#34D399 100%)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                        }}
                      >
                        Neither Does Your AI Team.
                      </span>
                    </h1>
                  </div>

                  <p className="animate-fade-up delay-300 text-[#475569] text-sm sm:text-base lg:text-lg leading-relaxed max-w-[560px] m-0">
                    Deploy AI Voice Agents and AI Chatbots that handle calls,
                    chats, and more – 24/7. Qualify leads, book appointments,
                    answer questions and delight customers automatically.
                  </p>

                  {/* Buttons - Mobile Optimized */}
                  <div className="mt-4 hero-cta-row flex flex-col gap-4 w-full" style={{ opacity: 1, overflow: "visible" }}>

  {/* Row 1: Buttons */}
  <div className="hero-btn-row flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full" style={{ overflow: "visible" }}>
   <button
      onClick={() => openAuth("register")}
      className="font-bold flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-white"
      style={{
        background: "var(--gg)",
        boxShadow: "0 4px 14px rgba(16,185,129,0.25)",
        minHeight: "48px",
        fontSize: "15px",
      }}
    >
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M13 2L3 14h6l-1 8 10-12h-6l1-8z" />
      </svg>
      Book a Free Demo
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
      </svg>
    </button>

    <button
      onClick={() => openAuth("register")}
      className="font-bold flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl"
      style={{
        background: "#ffffff",
        color: "#0a0a0a",
        border: "1px solid rgba(10,10,10,0.15)",
        minHeight: "48px",
        fontSize: "15px",
      }}
    >
      <span
        className="flex items-center justify-center rounded-full shrink-0"
        style={{ width: "22px", height: "22px", background: "#2563EB" }}
      >
        <svg className="w-3 h-3" fill="white" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
      Watch Live Demo
      
    </button>
  </div>

  {/* Row 2: Avatars + rating */}
  <div className="flex items-center gap-3 flex-wrap w-full">
    <div className="flex -space-x-2 shrink-0">
      {[
        { img: "https://i.pravatar.cc/80?img=11", alt: "Sarah C." },
        { img: "https://i.pravatar.cc/80?img=32", alt: "Michael J." },
        { img: "https://i.pravatar.cc/80?img=47", alt: "Emma R." },
        { img: "https://i.pravatar.cc/80?img=56", alt: "Alex K." },
      ].map((av, i) => (
        <div
          key={i}
          className="w-8 h-8 rounded-full border-2 border-white shadow-sm overflow-hidden"
          style={{ zIndex: 5 - i }}
        >
          <img
            src={av.img}
            alt={av.alt}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      ))}
    </div>
    <div className="flex flex-col gap-0.5 min-w-0">
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, k) => (
          <svg key={k} className="w-4 h-4 shrink-0" style={{ fill: "#f59e0b" }} viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <p className="text-xs text-[#475569] m-0">
        Trusted by{" "}
        <span className="font-semibold text-[var(--text)]">100+</span>{" "}
        businesses
      </p>
    </div>
  </div>
</div>
                </div>

                <div className="mt-4 lg:col-span-5 flex justify-center items-center relative min-h-[380px] sm:min-h-[450px] lg:min-h-[580px] z-10 w-full order-2 lg:order-2 pt-4 lg:pt-0">
                  <div className="absolute top-[20%] left-[20%] w-[320px] h-[320px] rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.16)_0%,transparent_70%)] filter blur-3xl pointer-events-none" />
                  <div className="absolute bottom-[20%] right-[10%] w-[260px] h-[260px] rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.12)_0%,transparent_70%)] filter blur-3xl pointer-events-none" />

                  {/* Phone Mockup - Smaller on mobile */}
                 <div
      className="w-[150px] h-[310px] sm:w-[200px] sm:h-[410px] lg:w-[245px] lg:h-[490px] bg-[#0a0a0a] rounded-[28px] sm:rounded-[36px] lg:rounded-[42px] border-[4px] sm:border-[6px] lg:border-[7px] border-[#1a1a1a] shadow-2xl relative flex flex-col items-center p-2 sm:p-3 select-none"
      style={{
        transform: "perspective(1000px) rotateY(-18deg) rotateX(6deg) rotate(6deg)",
        transformStyle: "flat",
        overflow: "hidden",
      }}
    >
      {/* Notch */}
      <div className="w-20 sm:w-24 h-3 sm:h-4 bg-black rounded-full absolute top-2 sm:top-2.5 z-30" />
      {/* Screen bg */}
      <div className="absolute inset-0 rounded-[28px] sm:rounded-[36px] lg:rounded-[42px] overflow-hidden bg-gradient-to-b from-[#0f0f0f] via-[#0a0a0a] to-[#030303] z-0" />

      <div className="relative z-10 w-full h-full flex flex-col items-center justify-between py-4 sm:py-6">
        {/* Header */}
        <div className="text-center mt-2 sm:mt-3">
          <p className="text-[8px] sm:text-xs text-white/40 font-medium tracking-wide uppercase m-0">
            AI Voice Agent
          </p>
          <p className="text-[8px] sm:text-[10px] text-white/30 font-mono mt-0.5 m-0">
            00:24
          </p>
        </div>

        {/* Orb + Waves */}
        <div
          className="relative flex items-center justify-center"
          style={{ width: "160px", height: "100px" }}
        >
          {/* Rings */}
          <div className="absolute rounded-full border border-cyan-400/20 z-0" style={{ width: "90px", height: "90px" }} />
          <div className="absolute rounded-full border border-cyan-400/10 z-0" style={{ width: "120px", height: "120px" }} />
          <div className="absolute rounded-full border border-cyan-400/[0.06] z-0" style={{ width: "155px", height: "155px" }} />

          {/* BG wave bars — behind orb, z-10 */}
          <div className="absolute inset-0 flex items-center justify-center gap-[2px] z-10 pointer-events-none">
            {WAVE_HEIGHTS.map((baseH, i) => {
              const center = (WAVE_HEIGHTS.length - 1) / 2;
              const dist = Math.abs(i - center);
              const envelope = Math.max(0.15, 1 - (dist / center) * 0.7);
              const h = Math.max(4, baseH * envelope * 0.45);
              return (
                <div
                  key={i}
                  className="rounded-full flex-shrink-0"
                  style={{
                    width: "2px",
                    height: `${h}px`,
                    background: "rgba(34,211,238,0.12)",
                    animation: "bgWaveBounce 1.2s ease-in-out infinite",
                    animationDelay: `${i * 0.045}s`,
                    transformOrigin: "center",
                  }}
                />
              );
            })}
          </div>

          {/* Orb — z-20 */}
          <div
            className="relative z-20 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              width: "64px",
              height: "64px",
              background: "radial-gradient(circle at 35% 35%, #22d3ee, #0ea5e9, #1d4ed8)",
              animation: "orbPulseGlow 3s ease-in-out infinite",
            }}
          >
            <div
              className="absolute rounded-full flex items-center justify-center"
              style={{
                inset: "4px",
                background: "radial-gradient(circle at 35% 35%, #0e7490, #0c4a6e)",
                boxShadow: "inset 0 0 20px rgba(0,0,0,0.5)",
              }}
            >
              <svg width="22" height="22" fill="none" stroke="#22d3ee" strokeWidth="2" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"
                />
              </svg>
            </div>
          </div>

          {/* FG wave bars — in front of orb, z-30, center hidden */}
          <div className="absolute inset-0 flex items-center justify-center gap-[2px] z-30 pointer-events-none">
            {WAVE_HEIGHTS.map((baseH, i) => {
              const center = (WAVE_HEIGHTS.length - 1) / 2;
              const dist = Math.abs(i - center);
              const envelope = Math.max(0.15, 1 - (dist / center) * 0.7);
              // Full height — no * 0.5 reduction, taller bars
              const h = Math.max(5, baseH * envelope);

              if (dist < 7) {
                return (
                  <div
                    key={i}
                    className="flex-shrink-0"
                    style={{ width: "2px", height: `${h}px`, opacity: 0 }}
                  />
                );
              }
              return (
                <div
                  key={i}
                  className="rounded-full flex-shrink-0"
                  style={{
                    width: "2px",
                    height: `${h}px`,
                    background:
                      i % 3 === 0
                        ? "linear-gradient(180deg,#67e8f9,#0891b2)"
                        : i % 3 === 1
                        ? "linear-gradient(180deg,#34d399,#059669)"
                        : "linear-gradient(180deg,#22d3ee,#0e7490)",
                    opacity: 0.65,
                    animation: "waveBounce 1s ease-in-out infinite",
                    animationDelay: `${i * 0.045}s`,
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Controls */}
        <div className="w-full px-2 sm:px-4 space-y-2 sm:space-y-4">
          <div className="grid grid-cols-3 gap-y-2 sm:gap-y-3 text-center">
            {[
              { icon: MicrophoneIcon, label: "Mute" },
              { icon: Squares2X2Icon, label: "Keypad" },
              { icon: SpeakerWaveIcon, label: "Speaker" },
            ].map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <div key={idx} className="flex flex-col items-center">
                  <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-[#141414] border border-slate-700/30 flex items-center justify-center text-white/40">
                    <IconComponent className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5" />
                  </div>
                  <span className="text-[7px] sm:text-[9px] text-white/30 mt-0.5 sm:mt-1">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex justify-center">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/20 cursor-pointer hover:bg-red-600 transition-colors">
              <PhoneIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white transform rotate-[135deg]" />
            </div>
          </div>
        </div>
      </div>
    </div>

                  {/* Floating Cards - Smaller on mobile */}

                  {/* Card 1: Incoming Call - Top Right */}
                  <div className="absolute top-[10%] right-[0%] sm:top-[4%] sm:-right-[8%] z-20 pointer-events-auto w-[100px] sm:w-[185px]">
                    <div className="animate-float-1 bg-[var(--surface)] backdrop-blur-md rounded-lg sm:rounded-2xl p-1.5 sm:p-3.5 shadow-[0_8px_28px_rgba(37,99,235,0.10)] border border-[rgba(37,99,235,0.2)]">
                      <div className="flex justify-between items-center">
                        <span className="text-[6px] sm:text-[10px] font-semibold text-[#2563EB] tracking-wide uppercase">
                          Incoming Call
                        </span>
                        <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-blue-500 animate-pulse" />
                      </div>
                      <div className="mt-0.5 sm:mt-1">
                        <div
                          className="text-[8px] sm:text-xs font-bold text-[var(--text)] m-0 truncate"
                          style={{ color: "#0a0a0a" }}
                        >
                          +1 (415) 555-0178
                        </div>
                        <p className="text-[6px] sm:text-[9px] text-[var(--muted)] m-0 mt-0.5">
                          Sales Inquiry
                        </p>
                      </div>
                      <div className="flex gap-0.5 sm:gap-2 justify-end mt-0.5 sm:mt-1">
                        <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-red-100 flex items-center justify-center cursor-pointer hover:bg-red-200 transition-colors">
                          <span className="text-[5px] sm:text-[9px]">❌</span>
                        </div>
                        <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-green-100 flex items-center justify-center cursor-pointer hover:bg-green-200 transition-colors">
                          <span className="text-[5px] sm:text-[9px]">📞</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Appointment Booked - Bottom Right */}
                  <div className="absolute bottom-[2%] right-[4%] sm:bottom-[16%] sm:-right-[2%] z-20 pointer-events-auto w-[95px] sm:w-[180px]">
                    <div className="animate-float-2 bg-[var(--surface)] backdrop-blur-md rounded-lg sm:rounded-2xl p-1.5 sm:p-3.5 shadow-[0_8px_28px_rgba(37,99,235,0.10)] border border-[rgba(37,99,235,0.2)] flex items-center gap-1.5 sm:gap-3">
                      <div className="w-5 h-5 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-[rgba(37,99,235,0.08)] border border-[rgba(37,99,235,0.2)] flex items-center justify-center text-xs sm:text-lg flex-shrink-0">
                        📅
                      </div>
                      <div className="min-w-0">
                        <div
                          className="text-[7px] sm:text-[11px] font-bold text-[var(--text)] leading-tight m-0 truncate"
                          style={{ color: "#0a0a0a" }}
                        >
                          Appointment Booked
                        </div>
                        <p className="text-[5px] sm:text-[9px] text-[var(--muted)] mt-0.5 m-0">
                          May 24, 2025
                        </p>
                        <p className="text-[5px] sm:text-[9px] text-[#2563EB] font-medium m-0">
                          10:00 AM
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: AI Assistant - Top Left */}
                  <div className="absolute top-[10%] left-[4%] sm:top-[4%] sm:-left-[4%] z-20 pointer-events-auto w-[100px] sm:w-[195px]">
                    <div className="animate-float-3 bg-[var(--surface)] backdrop-blur-md rounded-lg sm:rounded-2xl p-1.5 sm:p-3 shadow-[0_8px_28px_rgba(37,99,235,0.10)] border border-[rgba(37,99,235,0.2)]">
                      <div className="flex items-center gap-1 sm:gap-1.5">
                        <span className="text-[6px] sm:text-[9px] text-[var(--muted)]">
                          🤖 AI Assistant
                        </span>
                      </div>
                      <div className="space-y-0.5 sm:space-y-1.5 mt-0.5 sm:mt-1">
                        <div className="bg-[rgba(37,99,235,0.06)] border border-[rgba(37,99,235,0.12)] text-[var(--text-secondary)] p-1 sm:p-2 rounded-lg sm:rounded-xl rounded-tl-sm text-[6px] sm:text-[10px] leading-relaxed max-w-[90%]">
                          How can I help you today?
                        </div>
                        <div className="flex justify-end">
                          <div
                            className="text-white p-1 sm:p-2 rounded-lg sm:rounded-xl rounded-tr-sm text-[6px] sm:text-[10px] leading-relaxed max-w-[90%]"
                            style={{
                              background:
                                "linear-gradient(135deg,#2563EB,#10B981)",
                            }}
                          >
                            I need help with my order.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 4: Leads Captured - Bottom Left */}
                  <div className="absolute bottom-[2%] left-[4%] sm:bottom-[8%] sm:-left-[4%] z-20 pointer-events-auto w-[100px] sm:w-[185px]">
                    <div className="animate-float-4 bg-[var(--surface)] backdrop-blur-md rounded-lg sm:rounded-2xl p-1.5 sm:p-3.5 shadow-[0_8px_28px_rgba(37,99,235,0.10)] border border-[rgba(37,99,235,0.2)]">
                      <div>
                        <p className="text-[5px] sm:text-[9px] font-semibold text-[var(--muted)] uppercase tracking-wider m-0">
                          Leads Captured
                        </p>
                        <div className="flex items-baseline gap-0.5 sm:gap-1.5 mt-0.5">
                          <span className="text-sm sm:text-lg font-bold text-[var(--text)]">
                            2,847
                          </span>
                          <span className="text-[5px] sm:text-[9px] font-semibold text-[var(--primary)]">
                            +32.6%
                          </span>
                        </div>
                      </div>
                      <div className="h-5 sm:h-10 w-full mt-0.5 sm:mt-1">
                        <svg
                          className="w-full h-full"
                          viewBox="0 0 100 30"
                          preserveAspectRatio="none"
                        >
                          <defs>
                            <linearGradient
                              id="chart-glow"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor="#2563EB"
                                stopOpacity="0.2"
                              />
                              <stop
                                offset="100%"
                                stopColor="#2563EB"
                                stopOpacity="0.0"
                              />
                            </linearGradient>
                          </defs>
                          <path
                            d="M0,25 Q15,22 30,12 T60,18 T90,5 L100,5 L100,30 L0,30 Z"
                            fill="url(#chart-glow)"
                          />
                          <path
                            d="M0,25 Q15,22 30,12 T60,18 T90,5 L100,5"
                            fill="none"
                            stroke="#2563EB"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                          <circle cx="100" cy="5" r="2.5" fill="#2563EB" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Logo marquee inside hero box */}
              <div
                style={{
                  marginTop: 40,
                  paddingTop: 24,
                  borderTop: "1px solid rgba(37,99,235,0.12)",
                }}
              >
                <p
                  className="text-center tag mb-4 sm:mb-6 m-0 text-[10px] sm:text-xs"
                  style={{ color: "#475569", letterSpacing: "0.18em", fontWeight: 500 }}
                >
                  Trusted by leading companies
                </p>
                <div className="relative w-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 w-8 sm:w-16 z-10 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(90deg, #F5F7FA, transparent)",
                    }}
                  />
                  <div
                    className="absolute inset-y-0 right-0 w-8 sm:w-16 z-10 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(270deg, #F5F7FA, transparent)",
                    }}
                  />
                  <div className="flex gap-8 sm:gap-16 items-center animate-marquee opacity-90">
                    {[...Array(2)].flatMap((_, dup) =>
                      [
                        { n: "HealthFirst", c: "#0EA5E9", icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" },
                        { n: "BrightHome", c: "#10B981", icon: "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" },
                        { n: "FastTrack", c: "#F59E0B", icon: "M13 2L3 14h6l-1 8 10-12h-6l1-8z" },
                        { n: "CloudBase", c: "#6366F1", icon: "M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" },
                        { n: "NovaTech", c: "#EC4899", icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" },
                        { n: "ZenithAI", c: "#8B5CF6", icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" },
                      ].map((c, i) => (
                        <div
                          key={`${dup}-${i}`}
                          className="flex items-center gap-2 sm:gap-3 whitespace-nowrap"
                        >
                          <svg className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" viewBox="0 0 24 24" fill={c.c} style={{ opacity: 0.7 }}>
                            <path d={c.icon} />
                          </svg>
                          <span
                            className="text-xs sm:text-sm font-semibold tracking-tight"
                            style={{ color: "#030B2E" }}
                          >
                            {c.n}
                          </span>
                        </div>
                      )),
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section ref={demoSectionRef} id="demo" className="section-box black">
            <div className="section-pad relative overflow-hidden">
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: "10%",
                  width: "400px",
                  height: "400px",
                  background:
                    "radial-gradient(circle, rgba(37,99,235,0.10), transparent 70%)",
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: "10%",
                  width: "400px",
                  height: "400px",
                  background:
                    "radial-gradient(circle, rgba(16,185,129,0.08), transparent 70%)",
                  pointerEvents: "none",
                }}
              />

              <div className="relative" style={{ zIndex: 1 }}>
                <Reveal className="text-center mb-14 space-y-4">
                  <span
                    className="tag px-4 py-1.5 rounded-full inline-block"
                    style={{
                      color: "#ffffff",
                      background: "var(--gg)",
                      border: "none",
                    }}
                  >
                    Live Demo
                  </span>
                  <h2
                    className="text-4xl sm:text-5xl font-extrabold tracking-tight mt-4"
                    style={{
                      color: "#ffffff",
                      fontSize: "clamp(30px,4vw,52px)",
                    }}
                  >
                    Hear It in <span className="gradient-text">Action</span>
                  </h2>
                  <p
                    style={{
                      color: "#94a3b8",
                      fontSize: 16,
                      maxWidth: 440,
                      margin: "0 auto",
                    }}
                  >
                    Watch Autoniv handle a real customer booking — start to
                    finish.
                  </p>
                </Reveal>

                <Reveal>
                  <div
                    style={{
                      background: "linear-gradient(160deg,#141414,#0a0a0a)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: 24,
                          overflow: "hidden",
                          boxShadow:
                            "0 20px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
                    }}
                  >
                    {/* Title bar */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "14px 20px",
                        borderBottom: "1px solid rgba(255,255,255,0.08)",
                        background:
                          "linear-gradient(135deg, rgba(37,99,235,0.08), rgba(16,185,129,0.06))",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          flexShrink: 0,
                        }}
                      >
                        <div
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            background: "#ff5f57",
                          }}
                        />
                        <div
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            background: "#febc2e",
                          }}
                        />
                        <div
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            background: "#28c840",
                          }}
                        />
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 7,
                          overflow: "hidden",
                          margin: "0 8px",
                          minWidth: 0,
                        }}
                      >
                        <div
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: "50%",
                            background: demoRunning ? "#10B981" : "#94a3b8",
                            flexShrink: 0,
                            animation: demoRunning
                              ? "livePulse 1.8s infinite"
                              : "none",
                          }}
                        />
                        <span
                          className="demo-status-text"
                          style={{
                            fontSize: 11,
                            fontFamily: "'JetBrains Mono',monospace",
                            color: "#94a3b8",
                            letterSpacing: "0.1em",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            minWidth: 0,
                          }}
                        >
                          {demoRunning
                            ? "autoniv-agent · live call"
                            : demoDone
                              ? "call ended · booked ✓"
                              : "autoniv-agent · ready"}
                        </span>
                      </div>
                      <div style={{ width: 52, flexShrink: 0 }} />
                    </div>

                    {/* Two-column layout */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        minHeight: 420,
                      }}
                      className="demo-grid"
                    >
                      {/* LEFT — Orb */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "44px 32px",
                          borderRight: "1px solid rgba(255,255,255,0.08)",
                          background: "#0a0e16",
                          position: "relative",
                          gap: 28,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            pointerEvents: "none",
                            opacity: 0.2,
                            backgroundImage:
                              "linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)",
                            backgroundSize: "32px 32px",
                            maskImage:
                              "radial-gradient(ellipse at 50% 60%,black 20%,transparent 75%)",
                            WebkitMaskImage:
                              "radial-gradient(ellipse at 50% 60%,black 20%,transparent 75%)",
                          }}
                        />

                        <SpectrumField
                          active={speaking !== "idle" || demoRunning}
                        />

                        <div
                          style={{
                            position: "relative",
                            zIndex: 10,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 28,
                          }}
                        >
                          <GlowRingOrb
                            active={speaking !== "idle" || demoRunning}
                          />

                          <div
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 10,
                              padding: "8px 18px",
                              borderRadius: 99,
                              background: "rgba(10,14,22,0.85)",
                              border: "1px solid rgba(255,255,255,0.10)",
                              fontSize: 13,
                              color: "#e2e8f0",
                              backdropFilter: "blur(8px)",
                            }}
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 20 20"
                              style={{ flexShrink: 0 }}
                            >
                              {[0, 1, 2, 3, 4].map((i) => (
                                <rect
                                  key={i}
                                  x={i * 4}
                                  y={10 - [6, 9, 5, 8, 4][i] / 2}
                                  width="2.5"
                                  rx="1.25"
                                  height={[6, 9, 5, 8, 4][i]}
                                  fill="#34D399"
                                  style={{
                                    animation:
                                      speaking !== "idle" || demoRunning
                                        ? `waveBounce 0.9s ease-in-out ${i * 0.1}s infinite`
                                        : "none",
                                  }}
                                />
                              ))}
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* RIGHT — Chat */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          padding: "28px 24px",
                          gap: 0,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: 16,
                            paddingBottom: 12,
                            borderBottom: "1px solid rgba(255,255,255,0.08)",
                            gap: 8,
                          }}
                        >
                          <div style={{ minWidth: 0 }}>
                            <div
                              style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: "#ffffff",
                                marginBottom: 2,
                              }}
                            >
                              Booking Assistant
                            </div>
                            <div
                              style={{
                                fontSize: 11,
                                color: "#94a3b8",
                                fontFamily: "'JetBrains Mono',monospace",
                                letterSpacing: "0.08em",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {demoMsgs.length > 0
                                ? `${demoMsgs.length}/${CONVERSATION.length} turns`
                                : "starting…"}
                            </div>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              gap: 5,
                              alignItems: "center",
                              padding: "5px 10px",
                              borderRadius: 99,
                              background:
                                "linear-gradient(135deg, rgba(37,99,235,0.10), rgba(16,185,129,0.10))",
                              border: "1px solid rgba(16,185,129,0.20)",
                              flexShrink: 0,
                            }}
                          >
                            <div
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                background: demoRunning ? "#10B981" : "#94a3b8",
                              }}
                            />
                            <span
                              style={{
                                fontSize: 10,
                                fontFamily: "'JetBrains Mono',monospace",
                                color: demoRunning ? "#10B981" : "#94a3b8",
                                letterSpacing: "0.1em",
                              }}
                            >
                              {demoRunning ? "LIVE" : "IDLE"}
                            </span>
                          </div>
                        </div>

                        <div
                          style={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            gap: 10,
                            overflowY: "auto",
                            minHeight: 240,
                          }}
                        >
                          {demoMsgs.length === 0 &&
                            !demoRunning &&
                            !demoDone && (
                              <div
                                style={{
                                  flex: 1,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "#94a3b8",
                                  fontSize: 13,
                                  textAlign: "center",
                                  padding: "20px 0",
                                }}
                              >
                                Press Start Demo to watch
                                <br />
                                the conversation unfold
                              </div>
                            )}
                          {demoMsgs.map((msg, i) => {
                            const isAgent = msg.role === "agent";
                            return (
                              <div
                                key={msg.id}
                                className="chat-bubble-in"
                                style={{
                                  display: "flex",
                                  justifyContent: isAgent
                                    ? "flex-start"
                                    : "flex-end",
                                  animationDelay: `${i * 0.04}s`,
                                }}
                              >
                                {isAgent && (
                                  <div
                                    style={{
                                      width: 26,
                                      height: 26,
                                      borderRadius: "50%",
                                      flexShrink: 0,
                                      marginRight: 8,
                                      marginTop: 2,
                                      background:
                                        "linear-gradient(135deg,#10B981,#2563EB)",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      fontSize: 11,
                                      fontWeight: 700,
                                      color: "#ffffff",
                                    }}
                                  >
                                    A
                                  </div>
                                )}
                                <div
                                  style={{
                                    maxWidth: "76%",
                                    padding: "9px 13px",
                                    borderRadius: isAgent
                                      ? "4px 14px 14px 14px"
                                      : "14px 4px 14px 14px",
                                    fontSize: 13.5,
                                    lineHeight: 1.45,
                                    background: isAgent
                                      ? "rgba(16,185,129,0.08)"
                                      : "rgba(37,99,235,0.08)",
                                    border: isAgent
                                      ? "1px solid rgba(16,185,129,0.2)"
                                      : "1px solid rgba(37,99,235,0.2)",
                                    color: "#e2e8f0",
                                  }}
                                >
                                  {msg.text}
                                </div>
                                {!isAgent && (
                                  <div
                                    style={{
                                      width: 26,
                                      height: 26,
                                      borderRadius: "50%",
                                      flexShrink: 0,
                                      marginLeft: 8,
                                      marginTop: 2,
                                      background:
                                        "linear-gradient(135deg,#2563EB,#10B981)",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      fontSize: 11,
                                      fontWeight: 700,
                                      color: "#ffffff",
                                    }}
                                  >
                                    U
                                  </div>
                                )}
                              </div>
                            );
                          })}
                          <div ref={chatEndRef} />
                        </div>

                        {demoDone && (
                          <div
                            style={{
                              display: "flex",
                              gap: 8,
                              marginTop: 16,
                              paddingTop: 14,
                              borderTop: "1px solid rgba(255,255,255,0.08)",
                              justifyContent: "center",
                            }}
                          >
                            <span style={{ fontSize: 12, color: "#94a3b8" }}>
                              Demo complete — restarting…
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Reveal>
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════
              FEATURES — white box
          ══════════════════════════════════════════════ */}
          <section id="features" className="section-box white">
            <div className="section-pad relative overflow-hidden">
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: "10%",
                  width: "400px",
                  height: "400px",
                  background:
                    "radial-gradient(circle, rgba(37,99,235,0.05), transparent 70%)",
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "10%",
                  left: "5%",
                  width: "300px",
                  height: "300px",
                  background:
                    "radial-gradient(circle, rgba(16,185,129,0.04), transparent 70%)",
                  pointerEvents: "none",
                }}
              />

              <div className="relative" style={{ zIndex: 1 }}>
                <Reveal className="text-center mb-16 space-y-4">
                  <span
                    className="tag px-4 py-1.5 rounded-full inline-block"
                    style={{ color: "#ffffff", background: "var(--gg)" }}
                  >
                    Platform Capabilities
                  </span>
                  <h2
                    className="font-extrabold tracking-tight mt-4"
                    style={{
                      fontSize: "clamp(28px,4vw,48px)",
                      color: "#0a0a0a",
                    }}
                  >
                    Everything You Need
                    <span className="gradient-text block">to Scale</span>
                  </h2>
                  <p
                    style={{
                      color: "#475569",
                      fontSize: 16,
                      maxWidth: 520,
                      margin: "0 auto",
                    }}
                  >
                    Powerful AI infrastructure designed to capture more leads
                    and serve customers around the clock.
                  </p>
                </Reveal>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {features.map((f, i) => (
                    <Reveal key={i} delay={i * 0.08}>
                      <TiltCard
                        className="feature-card group relative p-7 rounded-2xl overflow-hidden h-full cursor-default"
                        style={{
                          background: "rgba(255, 255, 255, 0.9)",
                          backdropFilter: "blur(12px)",
                          border: "1px solid rgba(37, 99, 235, 0.14)",
                          boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.04)",
                        }}
                      >
                        <div
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                          style={{
                            background: `radial-gradient(ellipse at 30% 30%,${f.color}14,transparent 60%)`,
                          }}
                        />
                        <div
                          className="relative w-12 h-12 rounded-xl flex items-center justify-center mb-5 text-2xl"
                          style={{
                            background: `${f.color}14`,
                            border: `1px solid ${f.color}26`,
                          }}
                        >
                          <span className="group-hover:scale-110 transition-transform duration-300 inline-block">
                            {f.icon}
                          </span>
                        </div>
                        <h3
                          className="text-base font-bold mb-2"
                          style={{ color: "#0a0a0a" }}
                        >
                          {f.title}
                        </h3>
                        <p
                          className="text-sm leading-relaxed mb-5"
                          style={{ color: "#475569" }}
                        >
                          {f.desc}
                        </p>
                        <div
                          className="flex items-baseline gap-2 pt-4"
                          style={{
                            borderTop: "1px solid rgba(37, 99, 235, 0.14)",
                          }}
                        >
                          <span
                            className="text-2xl font-extrabold"
                            style={{ color: f.color }}
                          >
                            {f.metric}
                          </span>
                          <span
                            className="tag text-[10px]"
                            style={{ color: "#2563EB" }}
                          >
                            {f.metricLabel}
                          </span>
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
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "100%",
                  height: "100%",
                  background:
                    "radial-gradient(circle at top, rgba(16,185,129,0.10), transparent 70%)",
                  pointerEvents: "none",
                }}
              />
              <div className="relative" style={{ zIndex: 1 }}>
                <Reveal className="text-center mb-16 space-y-4">
                  <span
                    className="tag px-4 py-1.5 rounded-full inline-block"
                    style={{ color: "#ffffff", background: "var(--gg)" }}
                  >
                    Simple Process
                  </span>
                  <h2
                    className="font-extrabold tracking-tight mt-4"
                    style={{
                      fontSize: "clamp(28px,4vw,48px)",
                      color: "#ffffff",
                    }}
                  >
                    Live in <span className="gradient-text">5 Steps</span>
                  </h2>
                  <p
                    style={{
                      color: "#94a3b8",
                      fontSize: 16,
                      maxWidth: 440,
                      margin: "0 auto",
                    }}
                  >
                    From idea to deployed voice agent in under 5 minutes — no
                    code required.
                  </p>
                </Reveal>

                <Reveal>
                  <div
                    style={{
                      background:
                        "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #f8fafc 100%)",
                      border: "1px solid rgba(37,99,235,0.14)",
                      borderRadius: 24,
                      padding: "40px 36px",
                      boxShadow: "0 20px 50px -15px rgba(37,99,235,0.10)",
                    }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
                      {STEPS.map((step, i) => (
                        <div
                          key={i}
                          className="flex flex-col items-center text-center relative h-full group"
                        >
                          {i < STEPS.length - 1 && (
                            <div className="hidden md:block absolute top-5 left-[50%] right-[-50%] h-[2px] bg-gradient-to-r from-blue-500/25 via-emerald-500/20 to-[var(--primary)]/5 z-0 pointer-events-none" />
                          )}
                          <div
                            className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm shadow-md z-10 mb-4 group-hover:scale-110 transition-all duration-300"
                            style={{
                              color: "#ffffff",
                              background:
                                "linear-gradient(135deg,#2563EB,#10B981)",
                              boxShadow: "0 4px 14px rgba(16,185,129,0.35)",
                            }}
                          >
                            {step.n}
                          </div>
                          <div
                            className="rounded-2xl p-5 flex-1 flex flex-col items-center w-full transition-all duration-300"
                            style={{
                              background: "rgba(37,99,235,0.04)",
                              border: "1px solid rgba(37,99,235,0.12)",
                            }}
                          >
                            <div
                              className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-3 flex-shrink-0"
                              style={{
                                background: "rgba(16,185,129,0.10)",
                                border: "1px solid rgba(16,185,129,0.20)",
                              }}
                            >
                              {step.icon}
                            </div>
                            <h3
                              className="text-sm font-bold mb-2"
                              style={{ color: "#0a0a0a" }}
                            >
                              {step.title}
                            </h3>
                            <p
                              className="text-[12px] leading-relaxed m-0"
                              style={{ color: "#64748b" }}
                            >
                              {step.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Reveal>

                <Reveal className="text-center mt-14">
                  <MagBtn
                    onClick={() => openAuth("register")}
                    className="btn-responsive-lg font-bold text-white flex items-center gap-2 mx-auto"
                    style={{
                      background: "var(--gg)",
                      boxShadow: "0 4px 14px rgba(16,185,129,0.25)",
                      borderRadius: 14,
                      padding: "14px 24px",
                    }}
                  >
                    Build Your First Agent Free
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                      />
                    </svg>
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
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "100%",
                  height: "100%",
                  background:
                    "radial-gradient(circle at center, rgba(34,197,94,0.06), transparent 70%)",
                  pointerEvents: "none",
                }}
              />
              <div className="relative" style={{ zIndex: 1 }}>
                <Reveal className="text-center mb-16 space-y-4">
                  <span
                    className="tag px-4 py-1.5 rounded-full inline-block"
                    style={{ color: "#ffffff", background: "var(--gg)" }}
                  >
                    Why Autoniv
                  </span>
                  <h2
                    className="font-extrabold tracking-tight mt-4"
                    style={{
                      fontSize: "clamp(28px,4vw,48px)",
                      color: "#0a0a0a",
                    }}
                  >
                    A Clear{" "}
                    <span className="gradient-text">Competitive Advantage</span>
                  </h2>
                  <p
                    style={{
                      color: "#475569",
                      fontSize: 16,
                      maxWidth: 520,
                      margin: "0 auto",
                    }}
                  >
                    An honest side-by-side against the alternatives you're
                    considering.
                  </p>
                </Reveal>

                <Reveal>
                  <div
                    className="overflow-x-auto"
                    style={{
                      border: "1px solid rgba(34,197,94,0.16)",
                      borderRadius: 20,
                      background: "rgba(255,255,255,0.85)",
                      backdropFilter: "blur(12px)",
                      boxShadow: "0 20px 40px -15px rgba(0,0,0,0.04)",
                    }}
                  >
                    <table
                      className="w-full text-left border-collapse"
                      style={{ minWidth: 720 }}
                    >
                      <thead>
                        <tr
                          style={{
                            borderBottom: "1px solid rgba(34,197,94,0.16)",
                            background: "rgba(34,197,94,0.03)",
                          }}
                        >
                          <th
                            className="p-5 text-xs font-bold uppercase tracking-wider text-[#475569]"
                            style={{ width: "28%" }}
                          >
                            Capability
                          </th>
                          <th
                            className="p-5 text-xs font-bold uppercase tracking-wider text-[#15803d]"
                            style={{
                              background:
                                "linear-gradient(135deg, rgba(37,99,235,0.06), rgba(16,185,129,0.06))",
                              width: "24%",
                            }}
                          >
                            ✦ Autoniv
                          </th>
                          <th
                            className="p-5 text-xs font-bold uppercase tracking-wider text-[#64748b]"
                            style={{ width: "24%" }}
                          >
                            Human Callers
                          </th>
                          <th
                            className="p-5 text-xs font-bold uppercase tracking-wider text-[#64748b]"
                            style={{ width: "24%" }}
                          >
                            Generic Dialers
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {COMPARISON.map((row, index) => (
                          <tr
                            key={index}
                            className="table-row"
                            style={{
                              borderBottom:
                                index < COMPARISON.length - 1
                                  ? "1px solid rgba(34,197,94,0.08)"
                                  : "none",
                            }}
                          >
                            <td
                              className="p-5 text-xs font-semibold text-[var(--text)]"
                              style={{ color: "#0a0a0a" }}
                            >
                              {row.capability}
                            </td>
                            <td
                              className="p-5 text-xs"
                              style={{
                                background:
                                  "linear-gradient(135deg, rgba(37,99,235,0.04), rgba(16,185,129,0.04))",
                              }}
                            >
                              {renderCellContent(
                                row.autoniv.status,
                                row.autoniv.text,
                              )}
                            </td>
                            <td className="p-5 text-xs">
                              {renderCellContent(
                                row.human.status,
                                row.human.text,
                              )}
                            </td>
                            <td className="p-5 text-xs">
                              {renderCellContent(
                                row.dialers.status,
                                row.dialers.text,
                              )}
                            </td>
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
              INDUSTRY + INTEGRATIONS — merged white box
          ══════════════════════════════════════════════ */}
         {/* ══════════════════════════════════════════════
    INDUSTRY + INTEGRATIONS — merged white box
══════════════════════════════════════════════ */}
<section className="section-box white">
  <div className="section-pad">
    <Reveal className="text-center mb-12 sm:mb-16 space-y-4">
      <span className="tag px-3 sm:px-4 py-1 sm:py-1.5 rounded-full inline-block text-xs sm:text-sm" style={{ color: "#ffffff", background: "var(--gg)" }}>
        Industry Solutions
      </span>
      <h2 className="font-extrabold tracking-tight mt-3 sm:mt-4" style={{ fontSize: "clamp(24px,6vw,48px)", color: "#0a0a0a" }}>
        Built for <span className="gradient-text">Every Industry</span>
      </h2>
      <p className="text-sm sm:text-base max-w-2xl mx-auto" style={{ color: "#475569" }}>
        Plug into the tools your team already uses — connects with your existing CRM, telephony, and automation tools instantly.
      </p>
    </Reveal>

    {/* Industry Cards Grid */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
      {useCases.map((uc, i) => (
        <Reveal key={i} delay={i * 0.08}>
          <div
            onClick={() => setActiveUseCase(i)}
            className="relative rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300"
            style={{
              background: activeUseCase === i
                ? "linear-gradient(135deg, rgba(37,99,235,0.07), rgba(16,185,129,0.07))"
                : "#ffffff",
              border: activeUseCase === i
                ? "2px solid rgba(16,185,129,0.35)"
                : "1px solid rgba(37,99,235,0.10)",
              boxShadow: activeUseCase === i
                ? "0 16px 48px rgba(16,185,129,0.10)"
                : "0 4px 16px rgba(0,0,0,0.03)",
              transform: activeUseCase === i ? "translateY(-4px)" : "translateY(0)",
            }}
          >
            {activeUseCase === i && (
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 3,
                background: "linear-gradient(90deg,#2563EB,#10B981)",
              }} />
            )}
            <div style={{ padding: "28px 24px 24px" }}>
              {/* Icon + badge row */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: activeUseCase === i ? "linear-gradient(135deg, rgba(37,99,235,0.12), rgba(16,185,129,0.12))" : "rgba(37,99,235,0.06)",
                  border: activeUseCase === i ? "1px solid rgba(16,185,129,0.25)" : "1px solid rgba(37,99,235,0.10)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 24, transition: "all 0.3s",
                }}>
                  {uc.icon}
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 600, padding: "4px 10px", borderRadius: 99,
                  background: activeUseCase === i ? "rgba(16,185,129,0.10)" : "rgba(37,99,235,0.06)",
                  color: activeUseCase === i ? "#10B981" : "#2563EB",
                  border: activeUseCase === i ? "1px solid rgba(16,185,129,0.22)" : "1px solid rgba(37,99,235,0.14)",
                  fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.06em",
                  transition: "all 0.3s",
                }}>
                  {["Healthcare", "Real Estate", "Finance"][i]}
                </span>
              </div>

              <h3 style={{ fontSize: 17, fontWeight: 700, color: "#0a0a0a", marginBottom: 8 }}>{uc.title}</h3>
              <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.65, marginBottom: 18 }}>{uc.desc}</p>

              {/* Stat pill */}
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "6px 14px", borderRadius: 99,
                background: activeUseCase === i
                  ? "linear-gradient(135deg, rgba(37,99,235,0.10), rgba(16,185,129,0.10))"
                  : "rgba(37,99,235,0.04)",
                border: activeUseCase === i ? "1px solid rgba(16,185,129,0.25)" : "1px solid rgba(37,99,235,0.10)",
              }}>
                <svg width="14" height="14" fill="none" stroke={activeUseCase === i ? "#10B981" : "#2563EB"} strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span style={{ fontSize: 12, fontWeight: 700, color: activeUseCase === i ? "#10B981" : "#2563EB" }}>{uc.stat}</span>
              </div>
            </div>

            {/* Bottom progress bar — active card only */}
            {activeUseCase === i && (
              <div style={{ height: 2, background: "rgba(16,185,129,0.08)", overflow: "hidden" }}>
                <div
                  key={`pb-${activeUseCase}`}
                  style={{
                    height: "100%", borderRadius: 99,
                    background: "linear-gradient(90deg,#2563EB,#10B981)",
                    animation: "progressFill 3.5s linear forwards",
                  }}
                />
              </div>
            )}
          </div>
        </Reveal>
      ))}
    </div>

    {/* Expanded detail panel for active use case */}
    <Reveal>
      <div
        key={activeUseCase}
        className="animate-fade-up rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(37,99,235,0.04), rgba(16,185,129,0.03))",
          border: "1px solid rgba(16,185,129,0.14)",
          marginBottom: 48,
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Left: key outcomes */}
          <div style={{ padding: "32px 36px", borderRight: "1px solid rgba(37,99,235,0.08)" }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "#2563EB", letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "'JetBrains Mono',monospace", marginBottom: 12 }}>
              Key outcomes
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                [
                  { label: "No-show reduction", value: "60%" },
                  { label: "Calls handled/day", value: "500+" },
                  { label: "Avg handle time", value: "< 2 min" },
                ],
                [
                  { label: "Lead qualification rate", value: "3×" },
                  { label: "Response time", value: "< 5 sec" },
                  { label: "Viewing bookings", value: "+85%" },
                ],
                [
                  { label: "Cost reduction", value: "50%" },
                  { label: "Inquiry resolution", value: "92%" },
                  { label: "Collections rate", value: "+38%" },
                ],
              ][activeUseCase].map((item, j) => (
                <div key={j} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 14px", borderRadius: 12,
                  background: "rgba(255,255,255,0.65)",
                  border: "1px solid rgba(37,99,235,0.08)",
                }}>
                  <span style={{ fontSize: 13, color: "#475569" }}>{item.label}</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: "#0a0a0a", fontFamily: "'JetBrains Mono',monospace" }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: use case feature list */}
          <div style={{ padding: "32px 36px" }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "#10B981", letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "'JetBrains Mono',monospace", marginBottom: 12 }}>
              What Autoniv does
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                [
                  "Automated patient appointment scheduling",
                  "Prescription refill reminders via call",
                  "Post-visit follow-up and satisfaction surveys",
                  "Insurance pre-auth intake collection",
                ],
                [
                  "Instant lead qualification from property portals",
                  "24/7 viewing slot booking & confirmation",
                  "Automated follow-ups on expired listings",
                  "Multi-language support for NRI buyers",
                ],
                [
                  "Loan inquiry intake and pre-qualification",
                  "EMI due-date reminders and payment nudges",
                  "KYC document follow-up automation",
                  "Account support without agent involvement",
                ],
              ][activeUseCase].map((feat, j) => (
                <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: "50%", flexShrink: 0, marginTop: 1,
                    background: "rgba(16,185,129,0.10)", border: "1px solid rgba(16,185,129,0.22)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <svg width="10" height="10" fill="none" stroke="#10B981" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span style={{ fontSize: 13, color: "#475569", lineHeight: 1.55 }}>{feat}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 20, paddingTop: 18, borderTop: "1px solid rgba(37,99,235,0.08)", display: "flex", gap: 10 }}>
              <button
                onClick={() => openAuth("register")}
                className="font-bold text-white flex items-center gap-2"
                style={{
                  padding: "9px 18px", borderRadius: 10, fontSize: 13,
                  background: "linear-gradient(135deg,#2563EB,#10B981)",
                  boxShadow: "0 4px 14px rgba(16,185,129,0.20)", border: "none", cursor: "pointer",
                }}
              >
                Try for {useCases[activeUseCase].title}
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Reveal>

    {/* Integrations */}
    <div>
      <Reveal className="text-center mb-8">
        <h3 className="text-xl sm:text-2xl font-extrabold" style={{ color: "#0a0a0a" }}>
          Integrations
        </h3>
        <p className="text-sm mt-2" style={{ color: "#475569" }}>
          Connect Your Favorite Tools & Platforms
        </p>
      </Reveal>
      <div className="space-y-3">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl" style={{ background: "rgba(37,99,235,0.03)", border: "1px solid rgba(37,99,235,0.08)" }}>
            <div className="absolute inset-y-0 left-0 w-20 z-10 pointer-events-none" style={{ background: "linear-gradient(90deg, #ffffff, transparent)" }} />
            <div className="absolute inset-y-0 right-0 w-20 z-10 pointer-events-none" style={{ background: "linear-gradient(270deg, #ffffff, transparent)" }} />
            <div className="flex gap-4 animate-marquee py-4" style={{ width: "max-content" }}>
              {[...integrationsRow1, ...integrationsRow1, ...integrationsRow1].map((item, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-2 rounded-xl flex-shrink-0 transition-all duration-300 hover:scale-105"
                  style={{ background: "rgba(255,255,255,0.8)", border: "1px solid rgba(37,99,235,0.08)" }}>
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm font-medium" style={{ color: "#475569" }}>{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
        <Reveal from="right">
          <div className="relative overflow-hidden rounded-2xl" style={{ background: "rgba(16,185,129,0.03)", border: "1px solid rgba(16,185,129,0.08)" }}>
            <div className="absolute inset-y-0 left-0 w-20 z-10 pointer-events-none" style={{ background: "linear-gradient(90deg, #ffffff, transparent)" }} />
            <div className="absolute inset-y-0 right-0 w-20 z-10 pointer-events-none" style={{ background: "linear-gradient(270deg, #ffffff, transparent)" }} />
            <div className="flex gap-4 py-4" style={{ width: "max-content", animation: "marquee 30s linear infinite reverse" }}>
              {[...integrationsRow2, ...integrationsRow2, ...integrationsRow2].map((item, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-2 rounded-xl flex-shrink-0 transition-all duration-300 hover:scale-105"
                  style={{ background: "rgba(255,255,255,0.8)", border: "1px solid rgba(16,185,129,0.08)" }}>
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm font-medium" style={{ color: "#475569" }}>{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>

      {/* Stats */}
      <Reveal className="mt-8">
        <div className="grid grid-cols-3 gap-4">
          {[
            { n: "40+", l: "Pre-built integrations" },
            { n: "∞", l: "Custom API possibilities" },
            { n: "5 min", l: "Average setup time" },
          ].map((s, i) => (
            <div key={i} className="rounded-2xl p-4 sm:p-6 text-center" style={{ background: "rgba(37,99,235,0.03)", border: "1px solid rgba(37,99,235,0.08)" }}>
              <div className="text-2xl sm:text-3xl font-bold mb-1 gradient-text">{s.n}</div>
              <div className="text-xs" style={{ color: "#475569" }}>{s.l}</div>
            </div>
          ))}
        </div>
      </Reveal>

      {/* CTA */}
      <Reveal className="mt-6">
        <div className="rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.04), rgba(16,185,129,0.04))", border: "1px solid rgba(37,99,235,0.12)" }}>
          <div>
            <h4 className="text-base font-bold" style={{ color: "#0a0a0a" }}>Need a custom integration?</h4>
            <p className="text-xs mt-1" style={{ color: "#475569" }}>Our API supports webhooks, real-time events, and everything in between.</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 rounded-xl text-xs font-semibold text-white" style={{ background: "var(--gg)", boxShadow: "0 4px 16px rgba(16,185,129,0.2)" }}>View API Docs →</button>
            <button className="px-4 py-2 rounded-xl text-xs font-medium" style={{ border: "1px solid rgba(37,99,235,0.2)", color: "#2563EB" }}>Contact Support</button>
          </div>
        </div>
      </Reveal>
    </div>
  </div>

  <style>{`
    @keyframes progressFill { from { width: 0%; } to { width: 100%; } }
  `}</style>
</section>

          {/* ══════════════════════════════════════════════
              ADD-ONS — white box
          ══════════════════════════════════════════════ */}
          <section id="addons" className="section-box white">
            <div className="section-pad relative overflow-hidden">
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: "10%",
                  width: "400px",
                  height: "400px",
                  background:
                    "radial-gradient(circle, rgba(34,197,94,0.05), transparent 70%)",
                  pointerEvents: "none",
                }}
              />
              <div className="relative" style={{ zIndex: 1 }}>
                <Reveal className="text-center mb-16 space-y-4">
                  <span
                    className="tag px-4 py-1.5 rounded-full inline-block"
                    style={{ color: "#ffffff", background: "var(--gg)" }}
                  >
                    Add-Ons
                  </span>
                  <h2
                    className="font-extrabold tracking-tight mt-4"
                    style={{
                      fontSize: "clamp(28px,4vw,48px)",
                      color: "#0a0a0a",
                    }}
                  >
                    Supercharge Your Results
                    <span className="gradient-text block">Further</span>
                  </h2>
                  <p
                    style={{
                      color: "#475569",
                      fontSize: 16,
                      maxWidth: 500,
                      margin: "0 auto",
                    }}
                  >
                    Customize your AI voice solution with powerful add-ons for
                    every business need.
                  </p>
                </Reveal>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {ADDONS.map((addon, i) => (
                    <Reveal key={addon.id} delay={i * 0.06}>
                      <TiltCard
                        className="feature-card group relative p-6 rounded-2xl overflow-hidden h-full cursor-default"
                        style={{
                          background: "rgba(255, 255, 255, 0.9)",
                          backdropFilter: "blur(12px)",
                          border: "1px solid rgba(34, 197, 94, 0.14)",
                          boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.04)",
                        }}
                      >
                        <div
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                          style={{
                            background:
                              "radial-gradient(ellipse at 30% 30%,rgba(34,197,94,0.10),transparent 60%)",
                          }}
                        />
                        <div
                          style={{
                            display: "flex",
                            alignItems: "start",
                            justifyContent: "space-between",
                            marginBottom: 16,
                          }}
                        >
                          <div
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: 12,
                              background: "rgba(34,197,94,0.08)",
                              border: "1px solid rgba(34,197,94,0.22)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 20,
                            }}
                          >
                            {addon.icon}
                          </div>
                          <span
                            className="tag px-2.5 py-1 rounded-full text-[9px]"
                            style={{
                              background:
                                addon.category === "recurring"
                                  ? "rgba(34,197,94,0.12)"
                                  : "rgba(22,163,74,0.12)",
                              color:
                                addon.category === "recurring"
                                  ? "#15803d"
                                  : "#166534",
                              border: `1px solid ${addon.category === "recurring" ? "rgba(34,197,94,0.25)" : "rgba(22,163,74,0.25)"}`,
                            }}
                          >
                            {addon.category === "recurring"
                              ? "Monthly"
                              : "One-time"}
                          </span>
                        </div>
                        <h3
                          style={{
                            fontSize: 15,
                            fontWeight: 700,
                            color: "#0a0a0a",
                            marginBottom: 8,
                          }}
                        >
                          {addon.title}
                        </h3>
                        <p
                          style={{
                            fontSize: 13,
                            color: "#475569",
                            lineHeight: 1.6,
                          }}
                        >
                          {addon.description}
                        </p>
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
                <span
                  className="tag px-4 py-1.5 rounded-full inline-block"
                  style={{ color: "#ffffff", background: "var(--gg)" }}
                >
                  What Our Users Say
                </span>
                <h2
                  className="font-extrabold tracking-tight mt-4"
                  style={{ fontSize: "clamp(28px,4vw,48px)", color: "#0a0a0a" }}
                >
                  Trusted by{" "}
                  <span className="gradient-text">Industry Leaders</span>
                </h2>
              </Reveal>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                {testimonials.map((t, i) => (
                  <Reveal key={i} delay={i * 0.1}>
                    <div className="testimonial-card group relative p-5 sm:p-7 rounded-2xl glass-card overflow-hidden h-full flex flex-col cursor-default">
                      <span
                        className="absolute top-2 right-5 text-[70px] sm:text-[90px] leading-none font-serif select-none"
                        style={{ color: "rgba(34,197,94,.06)" }}
                      >
                        "
                      </span>
                      <div className="flex gap-0.5 mb-4 sm:mb-5">
                        {[...Array(5)].map((_, k) => (
                          <svg
                            key={k}
                            className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                            style={{ fill: "#ffe484" }}
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <p
                        className="text-sm leading-relaxed mb-4 sm:mb-5"
                        style={{
                          color: "#475569",
                          flex: 1,
                        }}
                      >
                        "{t.quote}"
                      </p>
                      <div
                        className="flex items-center justify-between pt-3 sm:pt-4 border-t"
                        style={{ borderColor: "rgba(34,197,94,0.10)" }}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                            style={{
                              background: "linear-gradient(135deg,#22c55e,#15803d)",
                            }}
                          >
                            {t.initials}
                          </div>
                          <div className="min-w-0">
                            <div className="text-[13px] font-bold text-[#0a0a0a] truncate">
                              {t.name}
                            </div>
                            <div className="text-[11px] text-[#94a3b8] truncate">
                              {t.role}
                            </div>
                          </div>
                        </div>
                        <span
                          className="tag px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] flex-shrink-0 ml-2"
                          style={{
                            color: "#15803d",
                            background: "rgba(34,197,94,.08)",
                            border: "1px solid rgba(34,197,94,.18)",
                          }}
                        >
                          {t.metric}
                        </span>
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
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse at 50% 50%,rgba(37,99,235,.10) 0%,rgba(16,185,129,.08) 40%,transparent 65%)",
                }}
              />
              <Reveal className="relative text-center">
                <span
                  className="tag px-4 py-1.5 rounded-full inline-block mb-6"
                  style={{ color: "#ffffff", background: "var(--gg)" }}
                >
                  Get Started
                </span>
                <h2
                  className="font-extrabold tracking-tight mb-4"
                  style={{
                    fontSize: "clamp(28px,4.5vw,60px)",
                    color: "#ffffff",
                  }}
                >
                  Ready to Transform
                  <span className="gradient-text block">Your Business?</span>
                </h2>
                <p
                  style={{
                    color: "#94a3b8",
                    fontSize: 16,
                    maxWidth: 480,
                    margin: "0 auto 32px",
                  }}
                >
                  Join 10,000+ businesses already using AI voice agents to
                  capture more leads and grow faster.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
                  <MagBtn
                    onClick={() => openAuth("register")}
                    className="btn-responsive-xl font-bold text-white flex items-center gap-2.5"
                    style={{
                      background: "var(--gg)",
                      boxShadow: "0 4px 14px rgba(16,185,129,0.25)",
                      borderRadius: 16,
                      padding: "16px 28px",
                    }}
                  >
                    Start Your Free Trial
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                      />
                    </svg>
                  </MagBtn>
                  <button
                    onClick={() => openAuth("login")}
                    className="btn-ghost-dark btn-responsive-xl font-medium"
                    style={{ background: "none", cursor: "pointer" }}
                  >
                    Sign In Instead
                  </button>
                </div>
                <div className="flex justify-center gap-10">
                  {[
                    { n: "5M+", l: "Calls handled" },
                    { n: "99.8%", l: "Accuracy" },
                    { n: "2 min", l: "Setup time" },
                  ].map((s, i) => (
                    <div key={i} className="text-center">
                      <div className="text-xl font-extrabold gradient-text">
                        {s.n}
                      </div>
                      <div
                        className="tag text-[10px] mt-1"
                        style={{ color: "#94a3b8" }}
                      >
                        {s.l}
                      </div>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          </section>

          {/* ══════════════════════════════════════════════
              PRICING — Starting Prices
          ══════════════════════════════════════════════ */}
          {/* ══════════════════════════════════════════════
    PRICING
══════════════════════════════════════════════ */}
{/* ══════════════════════════════════════════════
    PRICING — Dark 4-plan layout with monthly/yearly toggle
══════════════════════════════════════════════ */}

{/* Add this state at the top of your Landing component alongside other useState hooks: */}
{/* const [pricingYearly, setPricingYearly] = useState(false); */}



          {/* ══════════════════════════════════════════════
              FAQ — Accordion
          ══════════════════════════════════════════════ */}
          <section id="faq" className="section-box tint">
            <div className="section-pad relative overflow-hidden">
              <Reveal className="text-center mb-12 space-y-4">
                <span className="tag px-4 py-1.5 rounded-full inline-block" style={{ color: "#2563EB", background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.3)" }}>
                  FAQ
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold" style={{ color: "#0a0a0a" }}>
                  Frequently Asked Questions
                </h2>
                <p className="text-sm sm:text-base max-w-2xl mx-auto" style={{ color: "#475569" }}>
                  Everything you need to know about Autoniv
                </p>
              </Reveal>

              <div className="max-w-3xl mx-auto space-y-3">
                {[
                  { q: "What is Autoniv?", a: "Autoniv is an AI-powered voice agent platform that handles business calls 24/7 in 20+ languages. Our AI agents answer calls, qualify leads, book appointments, and integrate with your existing CRM — no human intervention needed." },
                  { q: "How long does setup take?", a: "Most businesses are live within 48 hours. Simply describe what your agent should do, pick a voice and language, test it with our simulation tool, and deploy to your phone number or website widget in one click." },
                  { q: "Does it work with my existing phone number?", a: "Yes. Autoniv integrates with your current phone system via SIP trunking. You can forward calls to our AI agent or use a dedicated number — your choice. No hardware changes required." },
                  { q: "What languages are supported?", a: "We support 20+ languages including English, Hindi, Spanish, French, Arabic, Mandarin, and more. Each agent can handle multiple languages and switch mid-conversation based on the caller's preference." },
                  { q: "How much does it cost?", a: "Plans start at ₹4,999/month for small businesses (500 minutes, 1 agent). Pro plans at ₹12,999/month include 3 agents, 1,500 minutes, CRM integrations, and premium voices. Enterprise pricing is custom." },
                  { q: "Can I try before I buy?", a: "Yes! You can test our AI agents with a free demo. Sign up, configure your agent, and run simulated calls before going live. No credit card required for the trial." },
                  { q: "What integrations do you support?", a: "We integrate with 50+ tools including HubSpot, Salesforce, Google Calendar, Outlook, Zapier, Make, n8n, WhatsApp, and more. Our API also allows custom integrations for enterprise needs." },
                  { q: "Is my data secure?", a: "Absolutely. We use bank-grade encryption, SOC 2 certified infrastructure, and GDPR-compliant data handling. All call data is encrypted at rest and in transit. Enterprise plans include dedicated instances." },
                ].map((faq, i) => (
                  <FAQItem key={i} question={faq.q} answer={faq.a} />
                ))}
              </div>

              <p className="text-center text-xs mt-8" style={{ color: '#94a3b8' }}>
                Written by our content team. Need more info?{' '}
                <a href="#contact" onClick={(e) => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }} className="font-semibold" style={{ color: '#2563EB' }}>Contact us →</a>
              </p>
            </div>
          </section>

          {/* ══════════════════════════════════════════════
              BLOG
          ══════════════════════════════════════════════ */}
          <section id="blog" className="section-box white">
            <div className="section-pad relative overflow-hidden">
              <Reveal className="text-center mb-12 space-y-4">
                <span className="tag px-4 py-1.5 rounded-full inline-block" style={{ color: "#2563EB", background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.3)" }}>
                  Blog
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold" style={{ color: "#0a0a0a" }}>
                  Latest Insights
                </h2>
                <p className="text-sm sm:text-base max-w-2xl mx-auto" style={{ color: "#475569" }}>
                  Tips, guides, and news from the Autoniv team
                </p>
              </Reveal>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {[
                  { tag: "Product", date: "June 18, 2026", title: "Autoniv 2.0: Real-time Voice Cloning & Calendar Sync", desc: "Introducing state-of-the-art voice cloning latency improvements and direct native integrations with Google Calendar and Outlook.", readTime: "4 min read" },
                  { tag: "Industry", date: "June 10, 2026", title: "How AI Voice Agents Are Redefining Customer Service in 2026", desc: "Explore the state of voice conversational interfaces — latency benchmarks, accuracy improvements, and multi-lingual configurations.", readTime: "6 min read" },
                  { tag: "Security", date: "May 28, 2026", title: "Autoniv Achieves SOC 2 Type II Security Certification", desc: "Security is at the core of our platform. Learn how we completed the SOC 2 Type II audit for enterprise-grade data protection.", readTime: "3 min read" },
                ].map((post, i) => (
                  <Reveal key={i} delay={i * 0.1}>
                    <div className="rounded-2xl overflow-hidden transition-all duration-300 group cursor-pointer"
                      style={{ background: '#ffffff', border: '1px solid rgba(37,99,235,0.08)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 12px 40px rgba(37,99,235,0.08)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.03)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                      <div className="h-40 w-full" style={{ background: `linear-gradient(135deg, rgba(37,99,235,${0.06 + i * 0.02}), rgba(16,185,129,${0.04 + i * 0.02}))` }} />
                      <div className="p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ color: '#2563EB', background: 'rgba(37,99,235,0.08)' }}>{post.tag}</span>
                          <span className="text-xs" style={{ color: '#94a3b8' }}>{post.date}</span>
                        </div>
                        <h3 className="text-base font-bold mb-2 leading-snug" style={{ color: '#0a0a0a' }}>{post.title}</h3>
                        <p className="text-xs leading-relaxed mb-3" style={{ color: '#475569' }}>{post.desc}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs" style={{ color: '#94a3b8' }}>{post.readTime}</span>
                          <span className="text-xs font-semibold group-hover:translate-x-1 transition-transform" style={{ color: '#10B981' }}>Read →</span>
                        </div>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>

              <div className="text-center mt-8">
                <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all"
                  style={{ border: '1px solid rgba(37,99,235,0.2)', color: '#2563EB', background: 'transparent' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(37,99,235,0.06)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                  View All Articles
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                </Link>
              </div>
            </div>
          </section>


          <section id="pricing" className="section-box black">
  <div className="section-pad relative overflow-hidden">
    {/* Background glows */}
    <div style={{ position: "absolute", top: "10%", left: "5%", width: 500, height: 500, background: "radial-gradient(circle, rgba(37,99,235,0.10), transparent 70%)", pointerEvents: "none" }} />
    <div style={{ position: "absolute", bottom: "10%", right: "5%", width: 500, height: 500, background: "radial-gradient(circle, rgba(16,185,129,0.08), transparent 70%)", pointerEvents: "none" }} />
    <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 800, height: 400, background: "radial-gradient(ellipse, rgba(16,185,129,0.04), transparent 70%)", pointerEvents: "none" }} />

    <Reveal className="text-center mb-12 space-y-4">
      <span className="tag px-4 py-1.5 rounded-full inline-block" style={{ color: "#ffffff", background: "var(--gg)", border: "none" }}>
        Pricing Plans
      </span>
      <h2 className="font-extrabold tracking-tight mt-4" style={{ fontSize: "clamp(28px,4vw,48px)", color: "#ffffff" }}>
        Simple, transparent pricing.{" "}
        <span className="gradient-text">No hidden costs.</span>
      </h2>
      <p style={{ color: "#64748b", fontSize: 15, maxWidth: 480, margin: "0 auto" }}>
        Choose the plan that fits your business. Upgrade or cancel anytime.
      </p>

      {/* Monthly / Yearly Toggle */}
      <div style={{ display: "inline-flex", alignItems: "center", gap: 0, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 99, padding: "4px", marginTop: 8 }}>
        <button
          onClick={() => setPricingYearly(false)}
          style={{
            padding: "8px 22px", borderRadius: 99, border: "none", cursor: "pointer",
            fontSize: 13, fontWeight: 600, transition: "all 0.2s",
            background: !pricingYearly ? "linear-gradient(135deg,#2563EB,#10B981)" : "transparent",
            color: !pricingYearly ? "#fff" : "#64748b",
          }}
        >
          Monthly
        </button>
        <button
          onClick={() => setPricingYearly(true)}
          style={{
            padding: "8px 22px", borderRadius: 99, border: "none", cursor: "pointer",
            fontSize: 13, fontWeight: 600, transition: "all 0.2s", display: "flex", alignItems: "center", gap: 8,
            background: pricingYearly ? "linear-gradient(135deg,#2563EB,#10B981)" : "transparent",
            color: pricingYearly ? "#fff" : "#64748b",
          }}
        >
          Yearly
          <span style={{ fontSize: 10, fontWeight: 700, background: pricingYearly ? "rgba(255,255,255,0.25)" : "linear-gradient(135deg,#2563EB,#10B981)", color: "#fff", padding: "2px 8px", borderRadius: 99 }}>
            Save 20%
          </span>
        </button>
      </div>
    </Reveal>

    {/* Cards */}
    <div
      className="grid gap-5 max-w-6xl mx-auto"
      style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", alignItems: "stretch" }}
    >
      {[
        {
          name: "Starter",
          icon: "🚀",
          monthlyPrice: "₹4,999",
          yearlyPrice: "₹3,999",
          period: "/month",
          desc: "Perfect for small businesses getting started with AI voice.",
          features: [
            { text: "1 AI Voice Agent", included: true },
            { text: "500 minutes / month", included: true },
            { text: "5 Languages", included: true },
            { text: "10 Voices", included: true },
            { text: "Basic Reports", included: true },
            { text: "CRM Integration", included: false },
            { text: "WhatsApp Integration", included: false },
            { text: "Voice Cloning", included: false },
          ],
          cta: "Get Started",
          highlight: false,
          badge: null,
        },
        {
          name: "Growth",
          icon: "📈",
          monthlyPrice: "₹12,999",
          yearlyPrice: "₹10,399",
          period: "/month",
          desc: "For growing teams that need more power and integrations.",
          features: [
            { text: "3 AI Voice Agents", included: true },
            { text: "1,500 minutes / month", included: true },
            { text: "20+ Languages", included: true },
            { text: "100+ Voices", included: true },
            { text: "CRM Integration", included: true },
            { text: "WhatsApp Integration", included: true },
            { text: "Voice Cloning", included: false },
            { text: "Priority Support", included: false },
          ],
          cta: "Get Started",
          highlight: true,
          badge: "Most Popular",
        },
        {
          name: "Business",
          icon: "🏢",
          monthlyPrice: "₹24,999",
          yearlyPrice: "₹19,999",
          period: "/month",
          desc: "For scaling businesses that need advanced automation.",
          features: [
            { text: "10 AI Voice Agents", included: true },
            { text: "5,000 minutes / month", included: true },
            { text: "All Languages", included: true },
            { text: "All Voices", included: true },
            { text: "CRM Integration", included: true },
            { text: "WhatsApp Integration", included: true },
            { text: "Voice Cloning", included: true },
            { text: "Priority Support", included: false },
          ],
          cta: "Get Started",
          highlight: false,
          badge: null,
        },
        {
          name: "Enterprise",
          icon: "👑",
          monthlyPrice: "Custom",
          yearlyPrice: "Custom",
          period: "",
          desc: "For large organizations that need full control and support.",
          features: [
            { text: "Unlimited Agents", included: true },
            { text: "Custom Minutes", included: true },
            { text: "All Languages", included: true },
            { text: "All Voices", included: true },
            { text: "CRM Integration", included: true },
            { text: "WhatsApp Integration", included: true },
            { text: "Voice Cloning", included: true },
            { text: "Priority Support", included: true },
          ],
          cta: "Contact Sales",
          highlight: false,
          badge: null,
        },
      ].map((plan, i) => (
        <Reveal key={i} delay={i * 0.08}>
          <div
            className="relative flex flex-col h-full rounded-2xl overflow-hidden transition-all duration-300"
            style={{
              background: plan.highlight
                ? "linear-gradient(160deg, rgba(37,99,235,0.14), rgba(16,185,129,0.12))"
                : "rgba(255,255,255,0.03)",
              border: plan.highlight
                ? "1.5px solid rgba(16,185,129,0.45)"
                : "1px solid rgba(255,255,255,0.07)",
              boxShadow: plan.highlight
                ? "0 0 48px rgba(16,185,129,0.10), inset 0 1px 0 rgba(255,255,255,0.06)"
                : "inset 0 1px 0 rgba(255,255,255,0.03)",
              transform: plan.highlight ? "translateY(-8px)" : "none",
            }}
          >
            {/* Top accent bar */}
            {plan.highlight && (
              <div style={{ height: 3, background: "linear-gradient(90deg,#2563EB,#10B981)", flexShrink: 0 }} />
            )}

            {/* Badge */}
            {plan.badge && (
              <div style={{ position: "absolute", top: plan.highlight ? 20 : 16, right: 16 }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 99,
                  background: "linear-gradient(135deg,#2563EB,#10B981)",
                  color: "#fff", fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.06em",
                }}>
                  {plan.badge}
                </span>
              </div>
            )}

            {/* Header */}
            <div style={{ padding: "24px 24px 0" }}>
              {/* Icon + Name */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 26, marginBottom: 8 }}>{plan.icon}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: "#f1f5f9", margin: "0 0 5px" }}>{plan.name}</h3>
                <p style={{ fontSize: 12, color: "#475569", lineHeight: 1.5, margin: 0 }}>{plan.desc}</p>
              </div>

              {/* Price */}
              <div style={{
                display: "flex", alignItems: "baseline", gap: 4,
                padding: "14px 0",
                borderTop: "1px solid rgba(255,255,255,0.06)",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                marginBottom: 18,
              }}>
                <span style={{
                  fontSize: (pricingYearly ? plan.yearlyPrice : plan.monthlyPrice) === "Custom" ? 30 : 34,
                  fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em",
                  fontFamily: "'JetBrains Mono',monospace",
                }}>
                  {pricingYearly ? plan.yearlyPrice : plan.monthlyPrice}
                </span>
                {plan.period && (
                  <span style={{ fontSize: 13, color: "#475569", fontWeight: 500 }}>{plan.period}</span>
                )}
              </div>

              {/* Features */}
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                {plan.features.map((f, j) => (
                  <li key={j} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: f.included ? "rgba(16,185,129,0.10)" : "rgba(75,85,99,0.10)",
                      border: f.included ? "1px solid rgba(16,185,129,0.25)" : "1px solid rgba(75,85,99,0.18)",
                    }}>
                      {f.included ? (
                        <svg width="9" height="9" fill="none" stroke="#10B981" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg width="8" height="8" fill="none" stroke="#4B5563" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" />
                        </svg>
                      )}
                    </div>
                    <span style={{ fontSize: 12.5, color: f.included ? "#cbd5e1" : "#374151" }}>
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA — pushed to bottom */}
            <div style={{ padding: "20px 24px 24px", marginTop: "auto" }}>
              <button
                onClick={() => openAuth("register")}
                className="w-full font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200"
                style={{
                  padding: "12px 20px",
                  borderRadius: 12,
                  cursor: "pointer",
                  ...(plan.highlight
                    ? {
                        background: "linear-gradient(135deg,#2563EB,#10B981)",
                        color: "#fff",
                        border: "none",
                        boxShadow: "0 4px 16px rgba(16,185,129,0.25)",
                      }
                    : {
                        background: "transparent",
                        color: "#10B981",
                        border: "1px solid rgba(16,185,129,0.30)",
                      }),
                }}
              >
                {plan.cta}
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </div>
          </div>
        </Reveal>
      ))}
    </div>

    {/* Bottom trust row */}
    <Reveal className="mt-12">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-10">
        {[
          { icon: "🔒", text: "No credit card required" },
          { icon: "⚡", text: "Live in under 48 hours" },
          { icon: "↩️", text: "Cancel anytime" },
          { icon: "🎧", text: "24/7 support included" },
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ fontSize: 15 }}>{item.icon}</span>
            <span style={{ fontSize: 12, color: "#475569", fontWeight: 500 }}>{item.text}</span>
          </div>
        ))}
      </div>
    </Reveal>

    <p className="text-center text-xs mt-6" style={{ color: "#374151" }}>
      All plans include 99.9% uptime SLA and zero setup fees.{" "}
      <Link to="/" className="font-semibold" style={{ color: "#10B981" }}>View full pricing →</Link>
    </p>
  </div>
</section>

          {/* ══════════════════════════════════════════════
              CONTACT — white box
          ══════════════════════════════════════════════ */}
          <section id="contact" className="section-box white">
            <div className="section-pad relative overflow-hidden">
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "100%",
                  height: "100%",
                  background:
                    "radial-gradient(circle at center, rgba(37,99,94,0.05), transparent 70%)",
                  pointerEvents: "none",
                }}
              />
              <div className="relative" style={{ zIndex: 1 }}>
                <Reveal className="text-center mb-16 space-y-4">
                  <span
                    className="tag px-4 py-1.5 rounded-full inline-block"
                    style={{ color: "#ffffff", background: "var(--gg)" }}
                  >
                    Contact Us
                  </span>
                  <h2
                    className="font-extrabold tracking-tight mt-4"
                    style={{
                      fontSize: "clamp(26px,3.5vw,44px)",
                      color: "#0a0a0a",
                    }}
                  >
                    Get In Touch for Pricing
                  </h2>
                  <p style={{ color: "#475569", fontSize: 16 }}>
                    Tell us about your needs. Our team will get back within 24
                    hours.
                  </p>
                </Reveal>
                <div className="grid lg:grid-cols-2 gap-10 max-w-5xl mx-auto items-start">
                  {/* Contact card */}
                  <Reveal from="left">
                    <div
                      className="rounded-3xl p-8 sm:p-10"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(37,99,235,.04), rgba(16,185,129,.03), #ffffff)",
                        border: "1px solid rgba(16,185,129,.16)",
                        boxShadow:
                          "0 0 60px rgba(16,185,129,.05), 0 40px 80px rgba(0,0,0,.05)",
                      }}
                    >
                      <ContactForm />
                      <div
                        style={{
                          marginTop: 24,
                          paddingTop: 24,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 12,
                          borderTop: "1px solid rgba(37,99,235,.10)",
                        }}
                      >
                        <span style={{ fontSize: 14, color: "#0a0a0a" }}>
                          Or chat directly on
                        </span>
                        <a
                          href="https://wa.me/917065990307"
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "7px 14px",
                            borderRadius: 99,
                            background: "rgba(37,211,102,.1)",
                            border: "1px solid rgba(37,211,102,.25)",
                            color: "#25d366",
                            fontSize: 13,
                            fontWeight: 600,
                            textDecoration: "none",
                          }}
                        >
                          <svg
                            className="w-4 h-4"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                          </svg>
                          WhatsApp
                        </a>
                      </div>
                    </div>
                  </Reveal>

                  {/* Contact info panel */}
                  <Reveal from="right" delay={0.1}>
                    <div className="space-y-6">
                      <div
                        className="rounded-2xl p-6"
                        style={{
                          background: "rgba(255, 255, 255, 0.9)",
                          backdropFilter: "blur(12px)",
                          border: "1px solid rgba(37, 99, 235, 0.14)",
                          boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.04)",
                        }}
                      >
                        <h3
                          style={{
                            fontSize: 16,
                            fontWeight: 700,
                            color: "#0a0a0a",
                            marginBottom: 14,
                          }}
                        >
                          Why businesses choose Autoniv
                        </h3>
                        <div className="space-y-4">
                          {[
                            {
                              icon: "⚡",
                              title: "2-min setup",
                              desc: "No code, no engineers. Describe your agent and go live instantly.",
                            },
                            {
                              icon: "🌍",
                              title: "20+ languages",
                              desc: "Serve customers in their native language across India and worldwide.",
                            },
                            {
                              icon: "📊",
                              title: "Real-time analytics",
                              desc: "Live dashboards with call logs, transcripts, and conversion scores.",
                            },
                            {
                              icon: "🔗",
                              title: "50+ integrations",
                              desc: "Plugs into your existing CRM, scheduling tools, and APIs.",
                            },
                          ].map((item, i) => (
                            <div
                              key={i}
                              style={{
                                display: "flex",
                                gap: 12,
                                alignItems: "flex-start",
                              }}
                            >
                              <div
                                style={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: 10,
                                  background: "rgba(37,99,235,0.08)",
                                  border: "1px solid rgba(37,99,235,0.18)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: 16,
                                  flexShrink: 0,
                                }}
                              >
                                {item.icon}
                              </div>
                              <div>
                                <div
                                  style={{
                                    fontSize: 14,
                                    fontWeight: 600,
                                    color: "#0a0a0a",
                                    marginBottom: 2,
                                  }}
                                >
                                  {item.title}
                                </div>
                                <div
                                  style={{
                                    fontSize: 12,
                                    color: "#475569",
                                    lineHeight: 1.55,
                                  }}
                                >
                                  {item.desc}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div
                        className="rounded-2xl p-6"
                        style={{
                          background: "rgba(255, 255, 255, 0.9)",
                          backdropFilter: "blur(12px)",
                          border: "1px solid rgba(37, 99, 235, 0.14)",
                          boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.04)",
                        }}
                      >
                        <h3
                          style={{
                            fontSize: 15,
                            fontWeight: 700,
                            color: "#0a0a0a",
                            marginBottom: 12,
                          }}
                        >
                          What happens next?
                        </h3>
                        {[
                          {
                            n: "1",
                            t: "We review your message within 24 hours",
                          },
                          { n: "2", t: "Schedule a 15-min discovery call" },
                          {
                            n: "3",
                            t: "Get a custom pricing plan for your use case",
                          },
                        ].map((s, i) => (
                          <div
                            key={i}
                            style={{
                              display: "flex",
                              gap: 12,
                              alignItems: "center",
                              marginBottom: i < 2 ? 12 : 0,
                            }}
                          >
                            <div
                              style={{
                                width: 24,
                                height: 24,
                                borderRadius: "50%",
                                background: "rgba(37,99,235,0.12)",
                                border: "1px solid rgba(37,99,235,0.22)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 10,
                                fontWeight: 700,
                                color: "#2563EB",
                                flexShrink: 0,
                                fontFamily: "'JetBrains Mono',monospace",
                              }}
                            >
                              {s.n}
                            </div>
                            <span style={{ fontSize: 13, color: "#475569" }}>
                              {s.t}
                            </span>
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