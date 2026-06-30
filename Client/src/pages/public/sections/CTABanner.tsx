import { useMemo, useRef } from "react";
import { motion, useInView, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { MagBtn } from "./utils";
import { GradientText } from "./anim";

function AnimatedStat({ n, l, delay }: { n: string; l: string; delay: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className="group relative text-center cursor-default"
    >
      <div className="absolute -inset-4 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(16,185,129,0.08), transparent 70%)" }}
      />
      <div className="relative">
        <div className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-blue-400 via-emerald-400 to-blue-400 bg-clip-text text-transparent"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          {n}
        </div>
        <div className="text-[11px] text-slate-500 mt-1.5 font-medium tracking-wide uppercase">{l}</div>
      </div>
    </motion.div>
  );
}

function ParticleField() {
  const particles = useMemo(() => {
    const seed = [12, 45, 78, 23, 56, 89, 34, 67, 90, 11];
    return seed.map((s, i) => ({
      id: i,
      x: `${(s * 7) % 100}%`,
      y: `${(s * 13) % 100}%`,
      size: (s % 3) + 1,
      delay: (s % 50) / 10,
      duration: (s % 8) + 6,
    }));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            background: "rgba(255,255,255,0.15)",
          }}
          animate={{
            y: [0, -40, 0],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

function MorphingBlob({ color, delay = 0 }: { color: string; delay?: number }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      animate={{
        borderRadius: [
          "30% 70% 70% 30% / 30% 30% 70% 70%",
          "50% 50% 20% 80% / 25% 80% 20% 75%",
          "60% 40% 30% 70% / 60% 30% 70% 40%",
          "30% 70% 70% 30% / 30% 30% 70% 70%",
        ],
        x: [0, 30, -20, 0],
        y: [0, -20, 15, 0],
        scale: [1, 1.1, 0.95, 1],
      }}
      transition={{
        duration: 12,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      style={{
        width: 300,
        height: 300,
        background: `radial-gradient(circle, ${color}30, transparent 70%)`,
        willChange: "transform",
      }}
    />
  );
}

export function CTABanner({ openAuth }: { openAuth: (m: "login" | "register") => void }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduced = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [0, -60]);

  return (
    <section ref={ref} className="section-box black" style={{ background: "#050d1a" }}>
      {/* Morphing blobs */}
      <MorphingBlob color="#2563EB" delay={0} />
      <MorphingBlob color="#10B981" delay={2} />
      <MorphingBlob color="#8b5cf6" delay={4} />

      {/* Particle field */}
      <ParticleField />

      {/* Grid pattern */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "linear-gradient(rgba(37,99,235,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse 70% 50% at 50% 50%, black 30%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 50% at 50% 50%, black 30%, transparent 100%)",
        }}
      />

      {/* Central glow */}
      <motion.div
        style={{ y: bgY }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] pointer-events-none"
      >
        <div className="w-full h-full" style={{ background: "radial-gradient(ellipse, rgba(37,99,235,0.08) 0%, rgba(16,185,129,0.05) 40%, transparent 70%)" }} />
      </motion.div>

      <div className="relative z-10 py-20 sm:py-28 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold tracking-[0.18em] uppercase mb-8"
              style={{ color: "#10B981", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              GET STARTED
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h2
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-extrabold tracking-tight mb-5"
            style={{ fontSize: "clamp(32px, 5vw, 60px)", color: "#ffffff", lineHeight: 1.1 }}
          >
            Ready to Transform
            <br />
            <GradientText animate={true} colors={["#60a5fa", "#34d399", "#a78bfa", "#60a5fa"]}>
              Your Business?
            </GradientText>
          </motion.h2>

          <motion.p
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-400 text-sm sm:text-base max-w-lg mx-auto mb-10 leading-relaxed"
          >
            Join 10,000+ businesses already using AI voice agents to capture more leads and grow faster.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
          >
            <MagBtn
              onClick={() => openAuth("register")}
              className="group relative font-bold text-white flex items-center gap-2.5 overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #2563EB, #10B981)",
                boxShadow: "0 4px 24px rgba(16,185,129,0.3), 0 0 0 1px rgba(16,185,129,0.2)",
                borderRadius: 16,
                padding: "16px 32px",
                border: "none",
                cursor: "pointer",
              }}
            >
              {/* Shimmer */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)" }}
              />
              <span className="relative text-sm">Start Your Free Trial</span>
              <svg className="w-4 h-4 relative group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </MagBtn>
            <button
              onClick={() => openAuth("login")}
              className="group px-8 py-4 rounded-2xl text-sm font-semibold text-slate-300 transition-all duration-300 hover:text-white hover:bg-white/[0.04] cursor-pointer"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              Sign In Instead
            </button>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 sm:gap-10 max-w-xl mx-auto">
            <AnimatedStat n="5M+" l="Calls handled" delay={0.4} />
            <AnimatedStat n="99.8%" l="Accuracy" delay={0.5} />
            <AnimatedStat n="2 min" l="Setup time" delay={0.6} />
          </div>

          {/* Trust indicators */}
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 mt-12"
          >
            {[
              { icon: "🔒", text: "SOC 2 Compliant" },
              { icon: "⚡", text: "99.9% Uptime" },
              { icon: "🌍", text: "20+ Languages" },
              { icon: "💳", text: "No Credit Card" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-slate-500 hover:text-slate-400 transition-colors duration-300">
                <span className="text-sm">{item.icon}</span>
                <span className="text-[11px] font-medium tracking-wide">{item.text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
