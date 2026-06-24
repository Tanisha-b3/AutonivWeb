import { Reveal } from "./utils";

const SERVICES = [
  { icon: "📞", title: "AI Voice Agents", desc: "Human-like voice calls that answer, qualify, and convert leads around the clock — in 20+ languages.", color: "#2563EB" },
  { icon: "💬", title: "WhatsApp & Chatbots", desc: "Automated chat flows on WhatsApp, website, and social media to engage visitors and capture leads instantly.", color: "#10B981" },
  { icon: "📅", title: "Smart Appointment Booking", desc: "AI schedules meetings directly into Google Calendar, Outlook, or Calendly — zero back-and-forth.", color: "#f97316" },
  { icon: "🔄", title: "CRM & Lead Management", desc: "Auto-sync lead data to your CRM, tag conversations, score quality, and trigger follow-up sequences.", color: "#8b5cf6" },
  { icon: "📊", title: "Analytics & Reporting", desc: "Real-time dashboards with call transcripts, sentiment scores, conversion metrics, and custom reports.", color: "#ec4899" },
  { icon: "🌍", title: "Multi-Language & Accent Tuning", desc: "Deploy agents in Hindi, Tamil, Telugu, Bengali, and more — with region-appropriate accents.", color: "#06b6d4" },
];

export function Services() {
  return (
    <section id="services" className="section-box tint">
      <div className="section-pad relative overflow-hidden">
        <div style={{ position: "absolute", top: "10%", right: "5%", width: 400, height: 400, background: "radial-gradient(circle, rgba(37,99,235,0.06), transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "10%", left: "10%", width: 300, height: 300, background: "radial-gradient(circle, rgba(16,185,129,0.05), transparent 70%)", pointerEvents: "none" }} />

        <div className="relative" style={{ zIndex: 1 }}>
          <Reveal className="text-center mb-12 sm:mb-16 space-y-3 sm:space-y-4">
            <span className="tag px-4 py-1.5 rounded-full inline-block text-xs sm:text-sm" style={{ color: "#ffffff", background: "var(--gg)" }}>
              What We Offer
            </span>
            <h2 className="font-extrabold tracking-tight mt-3 sm:mt-4" style={{ fontSize: "clamp(26px,4vw,46px)", color: "#0a0a0a" }}>
              Our <span className="gradient-text">Services</span>
            </h2>
            <p style={{ color: "#475569", fontSize: "clamp(14px,2vw,16px)", maxWidth: 560, margin: "0 auto" }}>
              End-to-end AI automation solutions designed to help businesses capture more leads, serve customers 24/7, and scale without hiring.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {SERVICES.map((s, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div className="group rounded-2xl p-6 sm:p-7 transition-all duration-300 cursor-default h-full" style={{
                  background: "rgba(255,255,255,0.85)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(37,99,235,0.1)",
                  boxShadow: "0 8px 24px -8px rgba(0,0,0,0.04)",
                }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 20px 50px -10px ${s.color}18`; e.currentTarget.style.borderColor = `${s.color}30`; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 8px 24px -8px rgba(0,0,0,0.04)"; e.currentTarget.style.borderColor = "rgba(37,99,235,0.1)"; }}
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl mb-4 sm:mb-5" style={{ background: `${s.color}10`, border: `1px solid ${s.color}25` }}>
                    {s.icon}
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold mb-2" style={{ color: "#0a0a0a" }}>{s.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#475569" }}>{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
