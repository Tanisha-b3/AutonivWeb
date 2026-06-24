import { testimonials } from "./data";
import { Reveal } from "./utils";

export function Testimonials() {
  return (
    <section className="section-box" style={{ background: "#050d1a" }}>
      <div className="section-pad">
        <Reveal className="text-center mb-16 space-y-4">
          <span className="tag px-4 py-1.5 rounded-full inline-block" style={{ color: "#ffffff", background: "var(--gg)" }}>What Our Users Say</span>
          <h2 className="font-extrabold tracking-tight mt-4" style={{ fontSize: "clamp(28px,4vw,48px)", color: "#ffffff" }}>
            Trusted by <span className="gradient-text">Industry Leaders</span>
          </h2>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {testimonials.map((t, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div className="testimonial-card group relative p-5 sm:p-7 rounded-2xl overflow-hidden h-full flex flex-col cursor-default" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <span className="absolute top-2 right-5 text-[70px] sm:text-[90px] leading-none font-serif select-none" style={{ color: "rgba(255,255,255,.04)" }}>"</span>
                <div className="flex gap-0.5 mb-4 sm:mb-5">
                  {[...Array(5)].map((_, k) => (
                    <svg key={k} className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ fill: "#ffe484" }} viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-4 sm:mb-5" style={{ color: "rgba(255,255,255,0.65)", flex: 1 }}>"{t.quote}"</p>
                <div className="flex items-center justify-between pt-3 sm:pt-4 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0" style={{ background: "linear-gradient(135deg,#2563EB,#10B981)" }}>{t.initials}</div>
                    <div className="min-w-0">
                      <div className="text-[13px] font-bold text-white truncate">{t.name}</div>
                      <div className="text-[11px] truncate" style={{ color: "rgba(255,255,255,0.45)" }}>{t.role}</div>
                    </div>
                  </div>
                  <span className="tag px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] flex-shrink-0 ml-2"
                    style={{ color: "#10B981", background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.2)" }}>{t.metric}</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
