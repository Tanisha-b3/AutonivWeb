import { useCases, integrationsRow1, integrationsRow2 } from "./data";
import { Reveal } from "./utils";

export function Industry({ activeUseCase, setActiveUseCase, openAuth }: {
  activeUseCase: number; setActiveUseCase: (i: number) => void; openAuth: (m: "login" | "register") => void;
}) {
  const keyOutcomes = [
    [{ label: "No-show reduction", value: "60%" }, { label: "Calls handled/day", value: "500+" }, { label: "Avg handle time", value: "< 2 min" }],
    [{ label: "Lead qualification rate", value: "3×" }, { label: "Response time", value: "< 5 sec" }, { label: "Viewing bookings", value: "+85%" }],
    [{ label: "Cost reduction", value: "50%" }, { label: "Inquiry resolution", value: "92%" }, { label: "Collections rate", value: "+38%" }],
  ];
  const features = [
    ["Automated patient appointment scheduling", "Prescription refill reminders via call", "Post-visit follow-up and satisfaction surveys", "Insurance pre-auth intake collection"],
    ["Instant lead qualification from property portals", "24/7 viewing slot booking & confirmation", "Automated follow-ups on expired listings", "Multi-language support for NRI buyers"],
    ["Loan inquiry intake and pre-qualification", "EMI due-date reminders and payment nudges", "KYC document follow-up automation", "Account support without agent involvement"],
  ];

  return (
    <section className="section-box white">
      <div className="section-pad">
        <Reveal className="text-center mb-12 sm:mb-16 space-y-4">
          <span className="tag px-3 sm:px-4 py-1 sm:py-1.5 rounded-full inline-block text-xs sm:text-sm" style={{ color: "#ffffff", background: "var(--gg)" }}>Industry Solutions</span>
          <h2 className="font-extrabold tracking-tight mt-3 sm:mt-4" style={{ fontSize: "clamp(24px,6vw,48px)", color: "#0a0a0a" }}>
            Built for <span className="gradient-text">Every Industry</span>
          </h2>
          <p className="text-sm sm:text-base max-w-2xl mx-auto" style={{ color: "#475569" }}>
            Plug into the tools your team already uses — connects with your existing CRM, telephony, and automation tools instantly.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          {useCases.map((uc, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <div onClick={() => setActiveUseCase(i)} className="relative rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300" style={{
                background: activeUseCase === i ? "linear-gradient(135deg, rgba(37,99,235,0.07), rgba(16,185,129,0.07))" : "#ffffff",
                border: activeUseCase === i ? "2px solid rgba(16,185,129,0.35)" : "1px solid rgba(37,99,235,0.10)",
                boxShadow: activeUseCase === i ? "0 16px 48px rgba(16,185,129,0.10)" : "0 4px 16px rgba(0,0,0,0.03)",
                transform: activeUseCase === i ? "translateY(-4px)" : "translateY(0)",
              }}>
                {activeUseCase === i && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg,#2563EB,#10B981)" }} />}
                <div style={{ padding: "28px 24px 24px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                    <div style={{ width: 52, height: 52, borderRadius: 14, background: activeUseCase === i ? "linear-gradient(135deg, rgba(37,99,235,0.12), rgba(16,185,129,0.12))" : "rgba(37,99,235,0.06)", border: activeUseCase === i ? "1px solid rgba(16,185,129,0.25)" : "1px solid rgba(37,99,235,0.10)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, transition: "all 0.3s" }}>{uc.icon}</div>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: "4px 10px", borderRadius: 99, background: activeUseCase === i ? "rgba(16,185,129,0.10)" : "rgba(37,99,235,0.06)", color: activeUseCase === i ? "#10B981" : "#2563EB", border: activeUseCase === i ? "1px solid rgba(16,185,129,0.22)" : "1px solid rgba(37,99,235,0.14)", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.06em", transition: "all 0.3s" }}>
                      {["Healthcare", "Real Estate", "Finance"][i]}
                    </span>
                  </div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: "#0a0a0a", marginBottom: 8 }}>{uc.title}</h3>
                  <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.65, marginBottom: 18 }}>{uc.desc}</p>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 99, background: activeUseCase === i ? "linear-gradient(135deg, rgba(37,99,235,0.10), rgba(16,185,129,0.10))" : "rgba(37,99,235,0.04)", border: activeUseCase === i ? "1px solid rgba(16,185,129,0.25)" : "1px solid rgba(37,99,235,0.10)" }}>
                    <svg width="14" height="14" fill="none" stroke={activeUseCase === i ? "#10B981" : "#2563EB"} strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                    <span style={{ fontSize: 12, fontWeight: 700, color: activeUseCase === i ? "#10B981" : "#2563EB" }}>{uc.stat}</span>
                  </div>
                </div>
                {activeUseCase === i && (
                  <div style={{ height: 2, background: "rgba(16,185,129,0.08)", overflow: "hidden" }}>
                    <div key={`pb-${activeUseCase}`} style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg,#2563EB,#10B981)", animation: "progressFill 3.5s linear forwards" }} />
                  </div>
                )}
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div key={activeUseCase} className="animate-fade-up rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.04), rgba(16,185,129,0.03))", border: "1px solid rgba(16,185,129,0.14)", marginBottom: 48 }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              <div style={{ padding: "32px 36px", borderRight: "1px solid rgba(37,99,235,0.08)" }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: "#2563EB", letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "'JetBrains Mono',monospace", marginBottom: 12 }}>Key outcomes</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {keyOutcomes[activeUseCase].map((item, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: 12, background: "rgba(255,255,255,0.65)", border: "1px solid rgba(37,99,235,0.08)" }}>
                      <span style={{ fontSize: 13, color: "#475569" }}>{item.label}</span>
                      <span style={{ fontSize: 16, fontWeight: 700, color: "#0a0a0a", fontFamily: "'JetBrains Mono',monospace" }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ padding: "32px 36px" }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: "#10B981", letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "'JetBrains Mono',monospace", marginBottom: 12 }}>What Autoniv does</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {features[activeUseCase].map((feat, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <div style={{ width: 20, height: 20, borderRadius: "50%", flexShrink: 0, marginTop: 1, background: "rgba(16,185,129,0.10)", border: "1px solid rgba(16,185,129,0.22)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="10" height="10" fill="none" stroke="#10B981" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <span style={{ fontSize: 13, color: "#475569", lineHeight: 1.55 }}>{feat}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 20, paddingTop: 18, borderTop: "1px solid rgba(37,99,235,0.08)", display: "flex", gap: 10 }}>
                  <button onClick={() => openAuth("register")} className="font-bold text-white flex items-center gap-2" style={{ padding: "9px 18px", borderRadius: 10, fontSize: 13, background: "linear-gradient(135deg,#2563EB,#10B981)", boxShadow: "0 4px 14px rgba(16,185,129,0.20)", border: "none", cursor: "pointer" }}>
                    Try for {useCases[activeUseCase].title}
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <div>
          <Reveal className="text-center mb-8">
            <h3 className="text-xl sm:text-2xl font-extrabold" style={{ color: "#0a0a0a" }}>Integrations</h3>
            <p className="text-sm mt-2" style={{ color: "#475569" }}>Connect Your Favorite Tools & Platforms</p>
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
          <Reveal className="mt-8">
            <div className="grid grid-cols-3 gap-4">
              {[{ n: "40+", l: "Pre-built integrations" }, { n: "∞", l: "Custom API possibilities" }, { n: "5 min", l: "Average setup time" }].map((s, i) => (
                <div key={i} className="rounded-2xl p-4 sm:p-6 text-center" style={{ background: "rgba(37,99,235,0.03)", border: "1px solid rgba(37,99,235,0.08)" }}>
                  <div className="text-2xl sm:text-3xl font-bold mb-1 gradient-text">{s.n}</div>
                  <div className="text-xs" style={{ color: "#475569" }}>{s.l}</div>
                </div>
              ))}
            </div>
          </Reveal>
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
      <style>{`@keyframes progressFill { from { width: 0%; } to { width: 100%; } }`}</style>
    </section>
  );
}
