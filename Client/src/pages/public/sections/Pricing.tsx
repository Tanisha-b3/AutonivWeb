import { useState } from "react";
import { Link } from "react-router-dom";
import { Reveal } from "./utils";

const plans = [
  { name: "Free", icon: "💬", monthlyPrice: "₹0", yearlyPrice: "₹0", period: "forever", badge: "ALWAYS FREE", desc: "For individuals & small projects testing the waters.", features: [{ text: "1 chatbot", included: true }, { text: "100 conversations / month", included: true }, { text: "Website embed", included: true }, { text: "Basic FAQ & lead capture", included: true }, { text: "WhatsApp not included", included: false }, { text: "Branding visible", included: false }], cta: "Get started free", highlight: false },
  { name: "Starter", icon: "🚀", monthlyPrice: "₹3,499", yearlyPrice: "₹2,799", period: "/month", desc: "Freelancers & small businesses getting serious.", features: [{ text: "3 chatbots", included: true }, { text: "1,000 conversations / month", included: true }, { text: "WhatsApp + website", included: true }, { text: "Hindi & Hinglish support", included: true }, { text: "Remove branding", included: true }, { text: "No CRM integration", included: false }], cta: "Start 14-day trial", highlight: false, badge: null },
  { name: "Growth", icon: "📈", monthlyPrice: "₹9,999", yearlyPrice: "₹7,999", period: "/month", desc: "SMBs scaling support, sales & engagement.", features: [{ text: "10 chatbots", included: true }, { text: "5,000 conversations / month", included: true }, { text: "All channels incl. Instagram", included: true }, { text: "10+ Indian languages", included: true }, { text: "CRM & helpdesk integrations", included: true }, { text: "Full analytics dashboard", included: true }], cta: "Start 14-day trial", highlight: true, badge: "MOST POPULAR" },
  { name: "Enterprise", icon: "🏢", monthlyPrice: "Custom", yearlyPrice: "Custom", period: "", badge: "CUSTOM", desc: "Large businesses, compliance & custom AI.", features: [{ text: "Unlimited chatbots", included: true }, { text: "Unlimited conversations", included: true }, { text: "Custom AI model training", included: true }, { text: "DPDP Act 2023 compliance", included: true }, { text: "India-region cloud hosting", included: true }, { text: "Dedicated account manager", included: true }], cta: "Contact sales →", highlight: false },
];

export function Pricing({ openAuth }: { openAuth: (m: "login" | "register") => void }) {
  const [pricingYearly, setPricingYearly] = useState(false);

  return (
    <section id="pricing" className="section-box black">
      <div className="section-pad relative overflow-hidden">
        <div style={{ position: "absolute", top: "10%", left: "5%", width: 500, height: 500, background: "radial-gradient(circle, rgba(37,99,235,0.10), transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "10%", right: "5%", width: 500, height: 500, background: "radial-gradient(circle, rgba(16,185,129,0.08), transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 800, height: 400, background: "radial-gradient(ellipse, rgba(16,185,129,0.04), transparent 70%)", pointerEvents: "none" }} />
        <Reveal className="text-center mb-12 space-y-4">
          
          <span className="tag px-4 py-1.5 rounded-full inline-block" style={{ color: "#ffffff", background: "var(--gg)" }}>Pricing Plans</span>
          <h2 className="font-extrabold tracking-tight mt-4" style={{ fontSize: "clamp(28px,4vw,48px)", color: "#ffffff" }}>
            Simple, transparent pricing. <span className="gradient-text">No hidden costs.</span>
          </h2>
          <p style={{ color: "#64748b", fontSize: 15, maxWidth: 480, margin: "0 auto" }}>Choose the plan that fits your business. Upgrade or cancel anytime.</p>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 0, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 99, padding: "4px", marginTop: 8 }}>
            <button onClick={() => setPricingYearly(false)} style={{ padding: "8px 22px", borderRadius: 99, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, transition: "all 0.2s", background: !pricingYearly ? "linear-gradient(135deg,#2563EB,#10B981)" : "transparent", color: !pricingYearly ? "#fff" : "#64748b" }}>Monthly</button>
            <button onClick={() => setPricingYearly(true)} style={{ padding: "8px 22px", borderRadius: 99, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, transition: "all 0.2s", display: "flex", alignItems: "center", gap: 8, background: pricingYearly ? "linear-gradient(135deg,#2563EB,#10B981)" : "transparent", color: pricingYearly ? "#fff" : "#64748b" }}>
              Yearly
              <span style={{ fontSize: 10, fontWeight: 700, background: pricingYearly ? "rgba(255,255,255,0.25)" : "linear-gradient(135deg,#2563EB,#10B981)", color: "#fff", padding: "2px 8px", borderRadius: 99 }}>Save 20%</span>
            </button>
          </div>
        </Reveal>
        <div className="grid gap-5 max-w-6xl mx-auto" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", alignItems: "stretch" }}>
          {plans.map((plan, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <div className="relative flex flex-col h-full rounded-2xl overflow-hidden transition-all duration-300" style={{
                background: plan.highlight ? "linear-gradient(160deg, rgba(37,99,235,0.14), rgba(16,185,129,0.12))" : "rgba(255,255,255,0.03)",
                border: plan.highlight ? "1.5px solid rgba(16,185,129,0.45)" : "1px solid rgba(255,255,255,0.07)",
                boxShadow: plan.highlight ? "0 0 48px rgba(16,185,129,0.10), inset 0 1px 0 rgba(255,255,255,0.06)" : "inset 0 1px 0 rgba(255,255,255,0.03)",
                transform: plan.highlight ? "translateY(-8px)" : "none",
              }}>
                {plan.highlight && <div style={{ height: 3, background: "linear-gradient(90deg,#2563EB,#10B981)", flexShrink: 0 }} />}
                {plan.badge && (
                  <div style={{ position: "absolute", top: plan.highlight ? 20 : 16, right: 16 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 99, background: "linear-gradient(135deg,#2563EB,#10B981)", color: "#fff", fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.06em" }}>{plan.badge}</span>
                  </div>
                )}
                <div style={{ padding: "24px 24px 0" }}>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 26, marginBottom: 8 }}>{plan.icon}</div>
                    <h3 style={{ fontSize: 17, fontWeight: 700, color: "#f1f5f9", margin: "0 0 5px" }}>{plan.name}</h3>
                    <p style={{ fontSize: 12, color: "#475569", lineHeight: 1.5, margin: 0 }}>{plan.desc}</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4, padding: "14px 0", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 18 }}>
                    <span style={{ fontSize: (pricingYearly ? plan.yearlyPrice : plan.monthlyPrice) === "Custom" ? 30 : 34, fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em", fontFamily: "'JetBrains Mono',monospace" }}>
                      {pricingYearly ? plan.yearlyPrice : plan.monthlyPrice}
                    </span>
                    {plan.period && <span style={{ fontSize: 13, color: "#475569", fontWeight: 500 }}>{plan.period}</span>}
                  </div>
                  <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                    {plan.features.map((f, j) => (
                      <li key={j} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                        <div style={{ width: 18, height: 18, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: f.included ? "rgba(16,185,129,0.10)" : "rgba(75,85,99,0.10)", border: f.included ? "1px solid rgba(16,185,129,0.25)" : "1px solid rgba(75,85,99,0.18)" }}>
                          {f.included ? <svg width="9" height="9" fill="none" stroke="#10B981" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> : <svg width="8" height="8" fill="none" stroke="#4B5563" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" /></svg>}
                        </div>
                        <span style={{ fontSize: 12.5, color: f.included ? "#cbd5e1" : "#374151" }}>{f.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div style={{ padding: "20px 24px 24px", marginTop: "auto" }}>
                  <button onClick={() => openAuth("register")} className="w-full font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200"
                    style={{ padding: "12px 20px", borderRadius: 12, cursor: "pointer", ...(plan.highlight ? { background: "linear-gradient(135deg,#2563EB,#10B981)", color: "#fff", border: "none", boxShadow: "0 4px 16px rgba(16,185,129,0.25)" } : { background: "transparent", color: "#10B981", border: "1px solid rgba(16,185,129,0.30)" }) }}>
                    {plan.cta}
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                  </button>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-12">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-10">
            {[{ icon: "🔒", text: "No credit card required" }, { icon: "⚡", text: "Live in under 48 hours" }, { icon: "↩️", text: "Cancel anytime" }, { icon: "🎧", text: "24/7 support included" }].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ fontSize: 15 }}>{item.icon}</span>
                <span style={{ fontSize: 12, color: "#475569", fontWeight: 500 }}>{item.text}</span>
              </div>
            ))}
          </div>
        </Reveal>
        <p className="text-center text-xs mt-6" style={{ color: "#374151" }}>
          All plans include 99.9% uptime SLA and zero setup fees. <Link to="/" className="font-semibold" style={{ color: "#10B981" }}>View full pricing →</Link>
        </p>
      </div>
    </section>
  );
}
