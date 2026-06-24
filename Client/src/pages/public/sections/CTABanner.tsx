import { Reveal, MagBtn } from "./utils";

export function CTABanner({ openAuth }: { openAuth: (m: "login" | "register") => void }) {
  return (
    <section className="section-box black">
      <div className="section-pad relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 50%,rgba(37,99,235,.10) 0%,rgba(16,185,129,.08) 40%,transparent 65%)" }} />
        <Reveal className="relative text-center">
          <span className="tag px-4 py-1.5 rounded-full inline-block mb-6" style={{ color: "#ffffff", background: "var(--gg)" }}>Get Started</span>
          <h2 className="font-extrabold tracking-tight mb-4" style={{ fontSize: "clamp(28px,4.5vw,60px)", color: "#ffffff" }}>
            Ready to Transform<span className="gradient-text block">Your Business?</span>
          </h2>
          <p style={{ color: "#94a3b8", fontSize: 16, maxWidth: 480, margin: "0 auto 32px" }}>Join 10,000+ businesses already using AI voice agents to capture more leads and grow faster.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <MagBtn onClick={() => openAuth("register")} className="btn-responsive-xl font-bold text-white flex items-center gap-2.5"
              style={{ background: "var(--gg)", boxShadow: "0 4px 14px rgba(16,185,129,0.25)", borderRadius: 16, padding: "16px 28px" }}>
              Start Your Free Trial
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </MagBtn>
            <button onClick={() => openAuth("login")} className="btn-ghost-dark btn-responsive-xl font-medium" style={{ background: "none", cursor: "pointer" }}>Sign In Instead</button>
          </div>
          <div className="flex justify-center gap-10">
            {[{ n: "5M+", l: "Calls handled" }, { n: "99.8%", l: "Accuracy" }, { n: "2 min", l: "Setup time" }].map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-xl font-extrabold gradient-text">{s.n}</div>
                <div className="tag text-[10px] mt-1" style={{ color: "#94a3b8" }}>{s.l}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
