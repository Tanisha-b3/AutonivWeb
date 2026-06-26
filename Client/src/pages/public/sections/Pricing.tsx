import { useState } from "react";
import { Link } from "react-router-dom";
import { Reveal } from "./utils";
import { motion } from "framer-motion";

const chatPlans = [
  {
    name: "Free", icon: "💬", monthlyPrice: "$0", yearlyPrice: "$0", period: "forever",
    badge: "ALWAYS FREE",
    monthlyPriceINR: "₹0", yearlyPriceINR: "₹0",
    desc: "For individuals & small side projects.",
    features: [
      { text: "1 chatbot", included: true },
      { text: "100 conversations / month", included: true },
      { text: "Website embed", included: true },
      { text: "Basic FAQ & lead capture", included: true },
      { text: "No CRM integration", included: false },
      { text: "Branding visible", included: false },
    ],
    cta: "Get started free", highlight: false,
  },
  {
    name: "Starter", icon: "🚀", monthlyPrice: "$49", yearlyPrice: "$39", period: "/month",
    badge: null,
    monthlyPriceINR: "₹3,499", yearlyPriceINR: "₹2,799",
    desc: "Freelancers & small businesses getting serious.",
    features: [
      { text: "3 chatbots", included: true },
      { text: "1,000 conversations / month", included: true },
      { text: "Website + email channel", included: true },
      { text: "Remove branding", included: true },
      { text: "Email & chat support", included: true },
      { text: "No CRM integration", included: false },
    ],
    cta: "Start 14-day trial", highlight: false,
  },
  {
    name: "Growth", icon: "📈", monthlyPrice: "$149", yearlyPrice: "$119", period: "/month",
    badge: "MOST POPULAR",
    monthlyPriceINR: "₹9,999", yearlyPriceINR: "₹7,999",
    desc: "SMBs and mid-market teams scaling fast.",
    features: [
      { text: "10 chatbots", included: true },
      { text: "5,000 conversations / month", included: true },
      { text: "All channels + multi-language", included: true },
      { text: "CRM & helpdesk integrations", included: true },
      { text: "Full analytics dashboard", included: true },
      { text: "Priority support", included: true },
    ],
    cta: "Start 14-day trial", highlight: true,
  },
  {
    name: "Enterprise", icon: "🏢", monthlyPrice: "Custom", yearlyPrice: "Custom", period: "",
    badge: "CUSTOM",
    monthlyPriceINR: "Custom", yearlyPriceINR: "Custom",
    desc: "Large orgs with custom AI, compliance & SLAs.",
    features: [
      { text: "Unlimited chatbots", included: true },
      { text: "Unlimited conversations", included: true },
      { text: "Custom AI model training", included: true },
      { text: "GDPR / HIPAA / SOC 2", included: true },
      { text: "SLA + 99.9% uptime", included: true },
      { text: "Dedicated account manager", included: true },
    ],
    cta: "Contact sales", highlight: false,
  },
];

const voicePlans = [
  {
    name: "Trial", icon: "🎙️", monthlyPrice: "$59", yearlyPrice: "$59", period: "/month",
    badge: "TRIAL",
    monthlyPriceINR: "₹4,999", yearlyPriceINR: "₹4,999",
    desc: "Test the system. See results in 30 days.",
    features: [
      { text: "1 AI Voice Assistant", included: true },
      { text: "30 calls / month", included: true },
      { text: "Lead capture & logging", included: true },
      { text: "WhatsApp delivery", included: true },
      { text: "30-day upgrade path", included: true },
      { text: "CRM integration", included: false },
    ],
    cta: "Start Free Trial", highlight: false,
  },
  {
    name: "Foundation", icon: "🎤", monthlyPrice: "$179", yearlyPrice: "$143", period: "/month",
    badge: null,
    monthlyPriceINR: "₹14,999", yearlyPriceINR: "₹11,999",
    desc: "For businesses automating first conversations.",
    features: [
      { text: "1 AI Voice Assistant", included: true },
      { text: "120 calls / month", included: true },
      { text: "Lead capture & logging", included: true },
      { text: "WhatsApp data delivery", included: true },
      { text: "Basic analytics", included: true },
      { text: "Free demo call", included: true },
    ],
    cta: "Book Demo Call", highlight: false,
  },
  {
    name: "Scale", icon: "📞", monthlyPrice: "$359", yearlyPrice: "$287", period: "/month",
    badge: "MOST POPULAR",
    monthlyPriceINR: "₹29,999", yearlyPriceINR: "₹23,999",
    desc: "For teams replacing a full calling function.",
    features: [
      { text: "Up to 3 AI Workflows", included: true },
      { text: "400 calls / month", included: true },
      { text: "Custom call scripts", included: true },
      { text: "CRM integration", included: true },
      { text: "Analytics dashboard", included: true },
      { text: "Priority support", included: true },
    ],
    cta: "Book Demo Call", highlight: true,
  },
  {
    name: "Dominate", icon: "🏢", monthlyPrice: "$899", yearlyPrice: "$719", period: "/month",
    badge: "ENTERPRISE",
    monthlyPriceINR: "₹74,999", yearlyPriceINR: "₹59,999",
    desc: "For high-volume operations that can't slow down.",
    features: [
      { text: "Unlimited Workflows", included: true },
      { text: "1,200 calls / month", included: true },
      { text: "Advanced automation", included: true },
      { text: "Full API & CRM integrations", included: true },
      { text: "Dedicated account manager", included: true },
      { text: "Custom reporting", included: true },
    ],
    cta: "Contact Sales", highlight: false,
  },
];

const getPlanColor = (name: string) => {
  switch (name) {
    case 'Free':
    case 'Trial':
      return '#64748b';
    case 'Starter':
    case 'Foundation':
      return '#2563EB';
    case 'Growth':
    case 'Scale':
      return '#10B981';
    case 'Enterprise':
    case 'Dominate':
      return '#8b5cf6';
    default:
      return '#10B981';
  }
};

export function Pricing({ openAuth }: { openAuth: (m: "login" | "register") => void }) {
  const [pricingYearly, setPricingYearly] = useState(false);
  const [pricingMode, setPricingMode] = useState<"chat" | "voice">("chat");
  const [currency, setCurrency] = useState<'usd' | 'inr'>('usd');
  const plans = pricingMode === "chat" ? chatPlans : voicePlans;

  return (
    <section id="pricing" className="section-box black" style={{ background: '#030812', border: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="section-pad relative overflow-hidden">
        {/* Background gradients */}
        <div className="absolute top-10 left-5 w-[500px] h-[500px] pointer-events-none bg-gradient-radial from-blue-600/5 to-transparent blur-[100px]" />
        <div className="absolute bottom-10 right-5 w-[500px] h-[500px] pointer-events-none bg-gradient-radial from-emerald-500/5 to-transparent blur-[100px]" />

        {/* Header */}
        <Reveal className="text-center mb-12 flex flex-col items-center">
          <span className="inline-block px-4 py-1.5 rounded-full text-white text-xs font-bold uppercase tracking-widest" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", color: "#10B981" }}>
            Pricing Plans
          </span>
          <h2 className="font-black tracking-tight mt-5 text-white" style={{ fontSize: "clamp(28px, 4vw, 44px)" }}>
            Simple, transparent pricing.{" "}
            <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">No hidden costs.</span>
          </h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto mt-3">
            Choose the plan that fits your business. Upgrade or cancel anytime.
          </p>

          {/* Toggles Panel */}
          <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-10 mb-12 bg-slate-900/40 border border-slate-800/80 backdrop-blur-md px-6 py-4 rounded-3xl max-w-4xl mx-auto shadow-xl mt-8">
            
            {/* Billing Toggle */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono">Billing:</span>
              <div className="relative inline-flex items-center bg-slate-950 border border-slate-800/60 rounded-full p-1 shadow-inner">
                <button
                  onClick={() => setPricingYearly(false)}
                  className="relative px-5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer overflow-hidden"
                >
                  {!pricingYearly && (
                    <motion.div
                      layoutId="section-yearly-toggle"
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-emerald-500 shadow-md"
                      style={{ zIndex: 0 }}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 transition-colors duration-200" style={{ color: !pricingYearly ? '#ffffff' : '#94a3b8' }}>
                    Monthly
                  </span>
                </button>
                <button
                  onClick={() => setPricingYearly(true)}
                  className="relative px-5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer overflow-hidden"
                >
                  {pricingYearly && (
                    <motion.div
                      layoutId="section-yearly-toggle"
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-emerald-500 shadow-md"
                      style={{ zIndex: 0 }}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 transition-colors duration-200 flex items-center gap-1.5" style={{ color: pricingYearly ? '#ffffff' : '#94a3b8' }}>
                    Yearly
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full transition-colors ${pricingYearly ? 'bg-white/20 text-white' : 'bg-emerald-500/10 text-emerald-400'}`}>
                      Save 20%
                    </span>
                  </span>
                </button>
              </div>
            </div>

            {/* Chat / Voice Toggle */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono">Channel:</span>
              <div className="relative inline-flex items-center bg-slate-950 border border-slate-800/60 rounded-full p-1 shadow-inner">
                <button
                  onClick={() => setPricingMode('chat')}
                  className="relative px-5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer overflow-hidden"
                >
                  {pricingMode === 'chat' && (
                    <motion.div
                      layoutId="section-mode-toggle"
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-emerald-500 shadow-md"
                      style={{ zIndex: 0 }}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 transition-colors duration-200 flex items-center gap-1.5" style={{ color: pricingMode === 'chat' ? '#ffffff' : '#94a3b8' }}>
                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                    Chat
                  </span>
                </button>
                <button
                  onClick={() => setPricingMode('voice')}
                  className="relative px-5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer overflow-hidden"
                >
                  {pricingMode === 'voice' && (
                    <motion.div
                      layoutId="section-mode-toggle"
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-emerald-500 shadow-md"
                      style={{ zIndex: 0 }}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 transition-colors duration-200 flex items-center gap-1.5" style={{ color: pricingMode === 'voice' ? '#ffffff' : '#94a3b8' }}>
                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" /></svg>
                    Voice
                  </span>
                </button>
              </div>
            </div>

            {/* Currency Toggle */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono">Currency:</span>
              <div className="relative inline-flex items-center bg-slate-950 border border-slate-800/60 rounded-full p-1 shadow-inner">
                <button
                  onClick={() => setCurrency('usd')}
                  className="relative px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer overflow-hidden"
                >
                  {currency === 'usd' && (
                    <motion.div
                      layoutId="section-currency-toggle"
                      className="absolute inset-0 rounded-full bg-slate-800 shadow-md"
                      style={{ zIndex: 0 }}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 transition-colors duration-200" style={{ color: currency === 'usd' ? '#ffffff' : '#94a3b8' }}>
                    $ USD
                  </span>
                </button>
                <button
                  onClick={() => setCurrency('inr')}
                  className="relative px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer overflow-hidden"
                >
                  {currency === 'inr' && (
                    <motion.div
                      layoutId="section-currency-toggle"
                      className="absolute inset-0 rounded-full bg-slate-800 shadow-md"
                      style={{ zIndex: 0 }}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 transition-colors duration-200" style={{ color: currency === 'inr' ? '#ffffff' : '#94a3b8' }}>
                    ₹ INR
                  </span>
                </button>
              </div>
            </div>

          </div>
        </Reveal>

        {/* Pricing Cards */}
        <div key={pricingMode} className="grid gap-6 max-w-6xl mx-auto grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 items-stretch mt-12">
          {plans.map((plan, i) => {
            const planColor = getPlanColor(plan.name);
            return (
              <Reveal key={i} delay={i * 0.08}>
                <div
                  className="relative flex flex-col h-full rounded-3xl overflow-hidden transition-all duration-300 bg-slate-950/40 backdrop-blur-md border cursor-default group"
                  style={{
                    borderColor: plan.highlight ? `${planColor}` : 'rgba(255, 255, 255, 0.06)',
                    boxShadow: plan.highlight ? `0 10px 30px -10px ${planColor}45` : 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${planColor}40`;
                    e.currentTarget.style.boxShadow = plan.highlight 
                      ? `0 20px 45px -10px ${planColor}60, 0 0 0 1px ${planColor}30` 
                      : `0 20px 40px -10px rgba(0,0,0,0.4), 0 0 0 1px ${planColor}30`;
                    e.currentTarget.style.transform = 'translateY(-6px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = plan.highlight ? `${planColor}` : 'rgba(255, 255, 255, 0.06)';
                    e.currentTarget.style.boxShadow = plan.highlight 
                      ? `0 10px 30px -10px ${planColor}45` 
                      : 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Badge */}
                  {plan.badge && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 px-5 py-1 rounded-b-xl text-[10px] font-bold text-white uppercase tracking-widest"
                      style={{ background: plan.highlight ? 'linear-gradient(135deg,#2563EB,#10B981)' : 'rgba(255,255,255,0.08)' }}
                    >
                      {plan.badge}
                    </div>
                  )}

                  {/* Content */}
                  <div className={`p-6 flex-1 ${plan.badge ? 'pt-10' : ''}`}>
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-5deg]"
                        style={{
                          background: plan.highlight ? `${planColor}1c` : 'rgba(255,255,255,0.03)',
                          border: `1.5px solid ${planColor}25`
                        }}
                      >
                        {plan.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white leading-tight">{plan.name}</h3>
                        <p className="text-[11px] text-slate-400 leading-snug mt-0.5">{plan.desc}</p>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="py-4 border-y border-slate-800/60 mb-5">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent font-mono tracking-tight">
                          {pricingYearly
                            ? (currency === 'inr' ? plan.yearlyPriceINR : plan.yearlyPrice)
                            : (currency === 'inr' ? plan.monthlyPriceINR : plan.monthlyPrice)}
                        </span>
                        {plan.period && (
                          <span className="text-xs text-slate-500 font-medium">
                            {plan.period}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Features */}
                    <ul className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs">
                          <div
                            className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              feature.included
                                ? "bg-emerald-500/10 border border-emerald-500/20"
                                : "bg-slate-700/10 border border-slate-700/20"
                            }`}
                          >
                            {feature.included ? (
                              <svg className="w-2.5 h-2.5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-2.5 h-2.5 text-slate-600" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            )}
                          </div>
                          <span className={feature.included ? "text-slate-300" : "text-slate-600"}>
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA */}
                  <div className="p-6 pt-0 mt-auto">
                    <button
                      onClick={() => openAuth("register")}
                      className={`w-full font-bold text-xs py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        plan.highlight
                          ? "bg-gradient-to-r from-blue-600 to-emerald-500 text-white hover:shadow-lg hover:shadow-emerald-500/25 active:scale-[0.98]"
                          : "bg-transparent text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/10 hover:border-emerald-500/50"
                      }`}
                    >
                      {plan.cta}
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* Trust Badges */}
        <Reveal className="mt-12">
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {[
              { icon: "🔒", text: "No credit card required" },
              { icon: "⚡", text: "Live in under 48 hours" },
              { icon: "↩️", text: "Cancel anytime" },
              { icon: "🎧", text: "24/7 support included" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-base">{item.icon}</span>
                <span className="text-xs text-slate-400 font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Footer Link */}
        <p className="text-center text-xs mt-8 text-slate-500">
          All plans include 99.9% uptime SLA and zero setup fees.{" "}
          <Link to="/pricing" className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
            View full pricing →
          </Link>
        </p>
      </div>
    </section>
  );
}