import { features } from "./data";
import { Reveal, TiltCard } from "./utils";

export function Features() {
  return (
    <section id="features" className="section-box white">
      <div className="section-pad relative overflow-hidden">
        <div style={{ position: "absolute", bottom: 0, right: "10%", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(37,99,235,0.05), transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "10%", left: "5%", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(16,185,129,0.04), transparent 70%)", pointerEvents: "none" }} />
        <div className="relative" style={{ zIndex: 1 }}>
          <Reveal className="text-center mb-16 space-y-4">
            <span className="tag px-4 py-1.5 rounded-full inline-block" style={{ color: "#ffffff", background: "var(--gg)" }}>Platform Capabilities</span>
            <h2 className="font-extrabold tracking-tight mt-4" style={{ fontSize: "clamp(28px,4vw,48px)", color: "#0a0a0a" }}>
              Everything You Need<span className="gradient-text block">to Scale</span>
            </h2>
            <p style={{ color: "#475569", fontSize: 16, maxWidth: 520, margin: "0 auto" }}>Powerful AI infrastructure designed to capture more leads and serve customers around the clock.</p>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <TiltCard className="feature-card group relative p-7 rounded-2xl overflow-hidden h-full cursor-default"
                  style={{ background: "rgba(255, 255, 255, 0.9)", backdropFilter: "blur(12px)", border: "1px solid rgba(37, 99, 235, 0.14)", boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.04)" }}>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" style={{ background: `radial-gradient(ellipse at 30% 30%,${f.color}14,transparent 60%)` }} />
                  <div className="relative w-12 h-12 rounded-xl flex items-center justify-center mb-5 text-2xl" style={{ background: `${f.color}14`, border: `1px solid ${f.color}26` }}>
                    <span className="group-hover:scale-110 transition-transform duration-300 inline-block">{f.icon}</span>
                  </div>
                  <h3 className="text-base font-bold mb-2" style={{ color: "#0a0a0a" }}>{f.title}</h3>
                  <p className="text-sm leading-relaxed mb-5" style={{ color: "#475569" }}>{f.desc}</p>
                  <div className="flex items-baseline gap-2 pt-4" style={{ borderTop: "1px solid rgba(37, 99, 235, 0.14)" }}>
                    <span className="text-2xl font-extrabold" style={{ color: f.color }}>{f.metric}</span>
                    <span className="tag text-[10px]" style={{ color: "#2563EB" }}>{f.metricLabel}</span>
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
