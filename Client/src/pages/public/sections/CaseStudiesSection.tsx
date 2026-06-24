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
            style={{ color: "#ffffff", background: "var(--gg)" }}
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
            style={{ color: "rgba(255,255,255,0.45)", fontSize: 15, maxWidth: 520 }}
          >
            See how Autoniv's AI Voice Agents are helping businesses save
            time, convert more, and grow faster.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {STUDIES.map((s, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div className="feature-card group p-5 sm:p-6 rounded-2xl h-full flex flex-col" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
                      style={{
                        background: `${s.badgeColor}18`,
                        border: `1px solid ${s.badgeColor}30`,
                      }}
                    >
                      {s.icon}
                    </div>
                    <div>
                      <div
                        className="text-sm font-bold"
                        style={{ color: "#ffffff" }}
                      >
                        {s.category}
                      </div>
                      <div
                        className="text-[11px]"
                        style={{ color: "rgba(255,255,255,0.45)" }}
                      >
                        {s.subcategory}
                      </div>
                    </div>
                  </div>
                  <div
                    className="w-16 h-16 rounded-full flex-shrink-0 flex flex-col items-center justify-center relative"
                    style={{
                      background: `conic-gradient(${s.badgeColor} 0deg,${s.badgeColor}88 180deg,rgba(255,255,255,0.08) 180deg)`,
                      boxShadow: `0 0 20px ${s.badgeColor}25`,
                    }}
                  >
                    <div className="absolute w-[58px] h-[58px] rounded-full flex flex-col items-center justify-center" style={{ background: "#050d1a" }}>
                      <div
                        className="text-xs font-black leading-none"
                        style={{ color: s.badgeColor }}
                      >
                        {s.metric}
                      </div>
                      <div
                        className="text-[7px] font-bold text-center leading-tight mt-0.5"
                        style={{ color: "rgba(255,255,255,0.45)" }}
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
                    style={{ color: "rgba(255,255,255,0.4)" }}
                  >
                    Challenge
                  </div>
                  <p
                    className="text-[13px] leading-relaxed"
                    style={{ color: "rgba(255,255,255,0.6)" }}
                  >
                    {s.challenge}
                  </p>
                </div>

                {/* Solutions */}
                <div className="mb-4">
                  <div
                    className="text-[10px] font-bold uppercase tracking-widest mb-2"
                    style={{ color: "rgba(255,255,255,0.4)" }}
                  >
                    Our Solution
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {s.solutions.map((sol) => (
                      <span
                        key={sol.label}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                        style={{
                          color: "rgba(255,255,255,0.7)",
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.1)",
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
                    background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent)",
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
                        style={{ color: "rgba(255,255,255,0.4)" }}
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
                    background: `${s.badgeColor}12`,
                    border: `1px solid ${s.badgeColor}25`,
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `${s.badgeColor}20`;
                    e.currentTarget.style.borderColor = `${s.badgeColor}40`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = `${s.badgeColor}12`;
                    e.currentTarget.style.borderColor = `${s.badgeColor}25`;
                  }}
                >
                  View Full Case Study →
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
