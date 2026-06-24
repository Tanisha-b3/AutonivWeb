import { STEPS } from "./data";
import { Reveal, MagBtn } from "./utils";

export function HowItWorks({ openAuth }: { openAuth: (m: "login" | "register") => void }) {
  return (
    <section id="how-it-works" className="section-box black">
      <div className="section-pad relative overflow-hidden">
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "100%", height: "100%", background: "radial-gradient(circle at top, rgba(16,185,129,0.10), transparent 70%)", pointerEvents: "none" }} />
        <div className="relative" style={{ zIndex: 1 }}>
          <Reveal className="text-center mb-16 space-y-4">
            <span className="tag px-4 py-1.5 rounded-full inline-block" style={{ color: "#ffffff", background: "var(--gg)" }}>Simple Process</span>
            <h2 className="font-extrabold tracking-tight mt-4" style={{ fontSize: "clamp(28px,4vw,48px)", color: "#ffffff" }}>
              Live in <span className="gradient-text">5 Steps</span>
            </h2>
            <p style={{ color: "#94a3b8", fontSize: 16, maxWidth: 440, margin: "0 auto" }}>From idea to deployed voice agent in under 5 minutes — no code required.</p>
          </Reveal>
          <Reveal>
            <div style={{ background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #f8fafc 100%)", border: "1px solid rgba(37,99,235,0.14)", borderRadius: 24, padding: "40px 36px", boxShadow: "0 20px 50px -15px rgba(37,99,235,0.10)" }}>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
                {STEPS.map((step, i) => (
                  <div key={i} className="flex flex-col items-center text-center relative h-full group">
                    {i < STEPS.length - 1 && (
                      <div className="hidden md:block absolute top-5 left-[50%] right-[-50%] h-[2px] bg-gradient-to-r from-blue-500/25 via-emerald-500/20 to-[var(--primary)]/5 z-0 pointer-events-none" />
                    )}
                    <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm shadow-md z-10 mb-4 group-hover:scale-110 transition-all duration-300"
                      style={{ color: "#ffffff", background: "linear-gradient(135deg,#2563EB,#10B981)", boxShadow: "0 4px 14px rgba(16,185,129,0.35)" }}>
                      {step.n}
                    </div>
                    <div className="rounded-2xl p-5 flex-1 flex flex-col items-center w-full transition-all duration-300"
                      style={{ background: "rgba(37,99,235,0.04)", border: "1px solid rgba(37,99,235,0.12)" }}>
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-3 flex-shrink-0"
                        style={{ background: "rgba(16,185,129,0.10)", border: "1px solid rgba(16,185,129,0.20)" }}>
                        {step.icon}
                      </div>
                      <h3 className="text-sm font-bold mb-2" style={{ color: "#0a0a0a" }}>{step.title}</h3>
                      <p className="text-[12px] leading-relaxed m-0" style={{ color: "#64748b" }}>{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal className="text-center mt-14">
            <MagBtn onClick={() => openAuth("register")} className="btn-responsive-lg font-bold text-white flex items-center gap-2 mx-auto"
              style={{ background: "var(--gg)", boxShadow: "0 4px 14px rgba(16,185,129,0.25)", borderRadius: 14, padding: "14px 24px" }}>
              Build Your First Agent Free
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </MagBtn>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
