import { Link } from "react-router-dom";
import { Reveal } from "./utils";

const STUDIES = [
  {
    category: "Real Estate",
    subcategory: "Property Dealer (Bangalore)",
    icon: "🏠",
    metric: "+128%",
    metricLabel: "More Conversions",
    badgeColor: "#10B981",
    challenge: "High lead volume, missed calls, no proper follow-ups.",
    solutions: [
      { icon: "📞", label: "AI Voice Assistant" },
      { icon: "💬", label: "WhatsApp Chatbot" },
      { icon: "📈", label: "CRM Automation" },
    ],
    results: [
      { value: "3.2X", label: "Qualified Leads", color: "#10B981" },
      { value: "62%", label: "Call Answer Rate", color: "#10B981" },
      { value: "40%", label: "Sales Productivity", color: "#f97316" },
    ],
  },
  {
    category: "Healthcare",
    subcategory: "Multi-Speciality Clinic",
    icon: "🏥",
    metric: "-55%",
    metricLabel: "No-Show Rate",
    badgeColor: "#2563EB",
    challenge: "Manual appointment booking, no reminders, high no-shows.",
    solutions: [
      { icon: "📞", label: "AI Voice Agent" },
      { icon: "📅", label: "Appointment Bot" },
      { icon: "📈", label: "CRM + Reminders" },
    ],
    results: [
      { value: "+72%", label: "Appointments Booked", color: "#10B981" },
      { value: "-55%", label: "No-Show Rate", color: "#2563EB" },
      { value: "+45%", label: "Re-book Rate", color: "#f97316" },
    ],
  },
  {
    category: "E-Commerce",
    subcategory: "D2C Brand (Mumbai)",
    icon: "🛒",
    metric: "+96%",
    metricLabel: "Sales Growth",
    badgeColor: "#f97316",
    challenge: "High cart abandonment, slow replies, lost sales.",
    solutions: [
      { icon: "🤖", label: "AI Chatbot" },
      { icon: "💬", label: "WhatsApp Bot" },
      { icon: "📈", label: "CRM Automation" },
    ],
    results: [
      { value: "+96%", label: "Sales Growth", color: "#f97316" },
      { value: "2.8X", label: "Customer Engagement", color: "#10B981" },
      { value: "30%", label: "Repeat Purchases", color: "#2563EB" },
    ],
  },
];

export function CaseStudiesSection() {
  return (
    <section className="section-box" style={{ background: "#050d1a" }}>
      <div className="section-pad">
        <Reveal className="text-center mb-14 space-y-4">
          <span
            className="tag px-4 py-1.5 rounded-full inline-block"
            style={{ color: "#ffffff", background: "var(--gg)", border: "none" }}
          >
            Case Studies
          </span>
          <h2
            className="font-extrabold tracking-tight mt-4"
            style={{ fontSize: "clamp(28px,4vw,48px)", color: "#ffffff" }}
          >
            Real Businesses.{" "}
            <span className="gradient-text">Real Results.</span>
          </h2>
          <p
            className="mx-auto leading-relaxed"
            style={{ color: "rgba(255,255,255,0.45)", fontSize: 15, maxWidth: 680 }}
          >
            See how Autoniv's AI Voice Agents, Chatbots & CRM Automation are helping businesses save time, convert more, and grow faster.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {STUDIES.map((s, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div 
                className="feature-card group p-5 sm:p-6 rounded-2xl h-full flex flex-col transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5" 
                style={{ 
                  background: "linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(239,246,255,0.96) 100%)", 
                  border: "1px solid rgba(37,99,235,0.18)",
                  boxShadow: "0 20px 40px -15px rgba(0,0,0,0.25), 0 0 40px rgba(37,99,235,0.06)"
                }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
                      style={{
                        background: `${s.badgeColor}12`,
                        border: `1px solid ${s.badgeColor}25`,
                      }}
                    >
                      {s.icon}
                    </div>
                    <div>
                      <div
                        className="text-sm font-bold"
                        style={{ color: "#0f172a" }}
                      >
                        {s.category}
                      </div>
                      <div
                        className="text-[11px]"
                        style={{ color: "#64748b" }}
                      >
                        {s.subcategory}
                      </div>
                    </div>
                  </div>
                  <div
                    className="w-16 h-16 rounded-full flex-shrink-0 flex flex-col items-center justify-center relative"
                    style={{
                      background: `conic-gradient(${s.badgeColor} 0deg,${s.badgeColor}88 180deg,rgba(37,99,235,0.1) 180deg)`,
                      boxShadow: `0 0 20px ${s.badgeColor}18`,
                    }}
                  >
                    <div className="absolute w-[58px] h-[58px] rounded-full flex flex-col items-center justify-center" style={{ background: "#ffffff" }}>
                      <div
                        className="text-xs font-black leading-none"
                        style={{ color: s.badgeColor }}
                      >
                        {s.metric}
                      </div>
                      <div
                        className="text-[7px] font-bold text-center leading-tight mt-0.5"
                        style={{ color: "#64748b" }}
                      >
                        {s.metricLabel}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Challenge */}
                <div className="mb-4">
                  <div
                    className="text-[10px] font-bold uppercase tracking-widest mb-1.5"
                    style={{ color: "#64748b" }}
                  >
                    Challenge
                  </div>
                  <p
                    className="text-[13px] leading-relaxed"
                    style={{ color: "#334155" }}
                  >
                    {s.challenge}
                  </p>
                </div>

                {/* Solutions */}
                <div className="mb-4">
                  <div
                    className="text-[10px] font-bold uppercase tracking-widest mb-2"
                    style={{ color: "#64748b" }}
                  >
                    Our Solution
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {s.solutions.map((sol) => (
                      <span
                        key={sol.label}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                        style={{
                          color: "#334155",
                          background: "rgba(37,99,235,0.05)",
                          border: "1px solid rgba(37,99,235,0.12)",
                        }}
                      >
                        <span>{sol.icon}</span>
                        {sol.label}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <div
                  className="h-px my-3"
                  style={{
                    background: "linear-gradient(90deg,transparent,#e2e8f0,transparent)",
                  }}
                />

                {/* Results */}
                <div className="grid grid-cols-3 gap-2 text-center mb-4">
                  {s.results.map((r) => (
                    <div key={r.label}>
                      <div
                        className="text-base font-black"
                        style={{ color: r.color }}
                      >
                        {r.value}
                      </div>
                      <div
                        className="text-[9px] leading-tight mt-0.5"
                        style={{ color: "#64748b" }}
                      >
                        {r.label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Read More */}
                <Link
                  to={`/case-studies/${i}`}
                  className="flex items-center justify-center gap-2 text-xs font-bold py-2.5 rounded-xl transition-all mt-auto"
                  style={{
                    color: s.badgeColor,
                    background: `${s.badgeColor}0d`,
                    border: `1px solid ${s.badgeColor}20`,
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `${s.badgeColor}18`;
                    e.currentTarget.style.borderColor = `${s.badgeColor}35`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = `${s.badgeColor}0d`;
                    e.currentTarget.style.borderColor = `${s.badgeColor}20`;
                  }}
                >
                  View Full Case Study →
                </Link>
              </div>
            </Reveal>
          ))}
        </div>

        {/* View All Button */}
        <Reveal className="text-center mt-12" delay={0.2}>
          <Link
            to="/case-studies"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-bold text-white transition-all duration-300 bg-slate-900/40 border border-slate-800 backdrop-blur-md hover:border-emerald-500/40 hover:bg-slate-900/60"
            style={{ 
              textDecoration: "none",
              boxShadow: "0 4px 20px -2px rgba(0,0,0,0.3)"
            }}
          >
            View All Case Studies
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </Reveal>
          
      </div>
    </section>
  );
}
