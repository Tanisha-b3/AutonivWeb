import { useState } from "react";
import { Link } from "react-router-dom";
import { Reveal } from "./utils";

const plans = [
  {
    name: "Free",
    icon: "💬",
    monthlyPrice: "₹0",
    yearlyPrice: "₹0",
    period: "forever",
    badge: "ALWAYS FREE",
    desc: "Perfect for individuals & small projects testing the waters.",
    features: [
      { text: "1 chatbot", included: true },
      { text: "100 conversations / month", included: true },
      { text: "Website embed", included: true },
      { text: "Basic FAQ & lead capture", included: true },
      { text: "WhatsApp integration", included: false },
      { text: "Remove branding", included: false },
    ],
    cta: "Get started free",
    highlight: false,
  },
  {
    name: "Starter",
    icon: "🚀",
    monthlyPrice: "₹3,499",
    yearlyPrice: "₹2,799",
    period: "/month",
    badge: null,
    desc: "For freelancers & small businesses getting serious.",
    features: [
      { text: "3 chatbots", included: true },
      { text: "1,000 conversations / month", included: true },
      { text: "WhatsApp + website", included: true },
      { text: "Hindi & Hinglish support", included: true },
      { text: "Remove branding", included: true },
      { text: "CRM integration", included: false },
    ],
    cta: "Start 14-day trial",
    highlight: false,
  },
  {
    name: "Growth",
    icon: "📈",
    monthlyPrice: "₹9,999",
    yearlyPrice: "₹7,999",
    period: "/month",
    badge: "MOST POPULAR",
    desc: "For SMBs scaling support, sales & engagement.",
    features: [
      { text: "10 chatbots", included: true },
      { text: "5,000 conversations / month", included: true },
      { text: "All channels incl. Instagram", included: true },
      { text: "10+ Indian languages", included: true },
      { text: "CRM & helpdesk integrations", included: true },
      { text: "Full analytics dashboard", included: true },
    ],
    cta: "Start 14-day trial",
    highlight: true,
  },
  {
    name: "Enterprise",
    icon: "🏢",
    monthlyPrice: "Custom",
    yearlyPrice: "Custom",
    period: "",
    badge: "CUSTOM",
    desc: "For large businesses, compliance & custom AI.",
    features: [
      { text: "Unlimited chatbots", included: true },
      { text: "Unlimited conversations", included: true },
      { text: "Custom AI model training", included: true },
      { text: "DPDP Act 2023 compliance", included: true },
      { text: "India-region cloud hosting", included: true },
      { text: "Dedicated account manager", included: true },
    ],
    cta: "Contact sales →",
    highlight: false,
  },
];

export function Pricing({ openAuth }: { openAuth: (m: "login" | "register") => void }) {
  const [pricingYearly, setPricingYearly] = useState(false);

  return (
    <section id="pricing" className="section-box black">
      <div className="section-pad relative overflow-hidden">
        {/* Background gradients */}
        <div className="absolute top-10 left-5 w-[500px] h-[500px] pointer-events-none bg-gradient-radial from-blue-600/10 to-transparent" />
        <div className="absolute bottom-10 right-5 w-[500px] h-[500px] pointer-events-none bg-gradient-radial from-emerald-500/8 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] pointer-events-none bg-gradient-ellipse from-emerald-500/4 to-transparent" />

        {/* Header */}
        <Reveal className="text-center mb-12 space-y-4">
          <span className="inline-block px-4 py-1.5 rounded-full text-white text-sm font-semibold" style={{ background: "var(--gg)" }}>
            Pricing Plans
          </span>
          <h2 className="font-extrabold tracking-tight mt-4" style={{ fontSize: "clamp(28px, 4vw, 48px)", color: "#ffffff" }}>
            Simple, transparent pricing.{" "}
            <span className="gradient-text">No hidden costs.</span>
          </h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Choose the plan that fits your business. Upgrade or cancel anytime.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-0 bg-white/5 border border-white/10 rounded-full p-1 mt-2">
            <button
              onClick={() => setPricingYearly(false)}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                !pricingYearly
                  ? "bg-gradient-to-r from-blue-600 to-emerald-500 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setPricingYearly(true)}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
                pricingYearly
                  ? "bg-gradient-to-r from-blue-600 to-emerald-500 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Yearly
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  pricingYearly
                    ? "bg-white/20 text-white"
                    : "bg-gradient-to-r from-blue-600 to-emerald-500 text-white"
                }`}
              >
                Save 20%
              </span>
            </button>
          </div>
        </Reveal>

        {/* Pricing Cards */}
        <div className="grid gap-6 max-w-6xl mx-auto grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
          {plans.map((plan, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <div
                className={`relative flex flex-col h-full rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] ${
                  plan.highlight
                    ? "bg-gradient-to-br from-blue-600/15 to-emerald-500/15 border-2 border-emerald-400/40 shadow-2xl shadow-emerald-500/10 -translate-y-2"
                    : "bg-white/5 border border-white/10 hover:border-white/20"
                }`}
              >
                {/* Highlight bar */}
                {plan.highlight && (
                  <div className="h-1 bg-gradient-to-r from-blue-600 to-emerald-500 flex-shrink-0" />
                )}

                {/* Badge */}
                {plan.badge && (
                  <div className="absolute top-4 right-4">
                    <span
                      className={`text-[10px] font-bold px-3 py-1 rounded-full ${
                        plan.highlight
                          ? "bg-gradient-to-r from-blue-600 to-emerald-500 text-white"
                          : "bg-slate-700 text-slate-300"
                      }`}
                    >
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* Content */}
                <div className="p-6 flex-1">
                  <div className="mb-4">
                    <div className="text-3xl mb-2">{plan.icon}</div>
                    <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{plan.desc}</p>
                  </div>

                  {/* Price */}
                  <div className="py-3 border-y border-white/5 mb-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-white font-mono tracking-tight">
                        {pricingYearly ? plan.yearlyPrice : plan.monthlyPrice}
                      </span>
                      {plan.period && (
                        <span className="text-sm text-slate-500 font-medium">
                          {plan.period}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                            feature.included
                              ? "bg-emerald-500/10 border border-emerald-500/20"
                              : "bg-slate-700/10 border border-slate-700/20"
                          }`}
                        >
                          {feature.included ? (
                            <svg
                              className="w-3 h-3 text-emerald-500"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-3 h-3 text-slate-600"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          )}
                        </div>
                        <span
                          className={`text-xs ${
                            feature.included ? "text-slate-300" : "text-slate-600"
                          }`}
                        >
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
                    className={`w-full font-bold text-sm py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 ${
                      plan.highlight
                        ? "bg-gradient-to-r from-blue-600 to-emerald-500 text-white hover:shadow-lg hover:shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98]"
                        : "bg-transparent text-emerald-500 border border-emerald-500/30 hover:bg-emerald-500/10 hover:border-emerald-500/50"
                    }`}
                  >
                    {plan.cta}
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
                  </button>
                </div>
              </div>
            </Reveal>
          ))}
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
                <span className="text-xs text-slate-500 font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Footer Link */}
        <p className="text-center text-xs mt-8 text-slate-700">
          All plans include 99.9% uptime SLA and zero setup fees.{" "}
          <Link to="/pricing" className="font-semibold text-emerald-500 hover:text-emerald-400 transition-colors">
            View full pricing →
          </Link>
        </p>
      </div>
    </section>
  );
}