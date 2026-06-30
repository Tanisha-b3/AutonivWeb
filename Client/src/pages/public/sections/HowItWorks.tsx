import { useRef, useState } from "react";
import { motion, useScroll, useReducedMotion, useInView, useMotionValueEvent } from "framer-motion";
import { STEPS } from "./data";
import { MagBtn } from "./utils";
import { GradientText } from "./anim";
import { EASE_OUT } from "./motionConstants";

const STEP_COLORS = ["#2563EB", "#10B981", "#8B5CF6", "#F59E0B", "#EC4899"];

function colorFor(i: number) {
  return STEP_COLORS[i % STEP_COLORS.length];
}

// ─── Single timeline step ───────────────────────────────────────────────────

function TimelineStep({
  step,
  index,
  active,
}: {
  step: (typeof STEPS)[0];
  index: number;
  active: boolean;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduced = useReducedMotion() ?? false;
  const color = colorFor(index);

  return (
    <motion.div
      ref={ref}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.96 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.75, delay: index * 0.1, ease: EASE_OUT }}
      className="relative flex-1 min-w-[220px]"
    >
      <motion.div
        whileHover={reduced ? undefined : { y: -6, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="group relative rounded-2xl p-6 h-full overflow-hidden cursor-default"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: `1px solid ${active ? `${color}55` : "rgba(255,255,255,0.08)"}`,
          backdropFilter: "blur(14px)",
          boxShadow: active ? `0 16px 48px ${color}26` : "none",
          transition: "border-color 0.5s ease, box-shadow 0.5s ease",
        }}
      >
        {/* Animated corner glow */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-2xl"
          style={{ background: `radial-gradient(ellipse at 20% 20%, ${color}22, transparent 60%)` }}
        />

        {/* Top hairline shimmer */}
        <motion.div
          className="absolute inset-x-0 top-0 h-px pointer-events-none"
          style={{ background: `linear-gradient(90deg, transparent, ${color}90, transparent)` }}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: [0, 1, 0.3] } : {}}
          transition={{ duration: 1.2, delay: 0.3 }}
        />

        {/* Step number + icon */}
        <div className="relative z-10 flex items-center gap-4 mb-4">
          <motion.div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: `${color}1a`, border: `1px solid ${color}33` }}
            animate={active && !reduced ? { scale: [1, 1.08, 1] } : {}}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            whileHover={reduced ? undefined : { scale: 1.15, rotate: 8 }}
          >
            {step.icon}
          </motion.div>
          <div>
            <span
              className="text-[10px] font-bold tracking-[0.18em] uppercase block"
              style={{ color }}
            >
              Step {String(step.n).padStart(2, "0")}
            </span>
            <h3 className="text-base font-bold text-white">{step.title}</h3>
          </div>
        </div>

        <p className="relative z-10 text-[13px] leading-relaxed text-slate-400 m-0">{step.desc}</p>

        {/* Bottom progress sliver */}
        <div className="relative z-10 mt-4 h-[3px] w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${color}, ${color}88)` }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: active ? 1 : 0 }}
            transition={{ duration: 0.6, ease: EASE_OUT }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Ambient floating particles in the background ───────────────────────────

function AmbientParticles({ reduced }: { reduced: boolean }) {
  if (reduced) return null;
  const particles = Array.from({ length: 14 });
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((_, i) => {
        const size = 2 + (i % 3);
        const left = (i * 137.5) % 100;
        const color = colorFor(i);
        const duration = 9 + (i % 5) * 1.6;
        return (
          <motion.span
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${left}%`,
              width: size,
              height: size,
              background: color,
              opacity: 0.35,
              boxShadow: `0 0 8px ${color}`,
            }}
            initial={{ y: "110%", opacity: 0 }}
            animate={{ y: "-10%", opacity: [0, 0.5, 0] }}
            transition={{ duration, repeat: Infinity, delay: i * 0.9, ease: "linear" }}
          />
        );
      })}
    </div>
  );
}

// ─── Main section ────────────────────────────────────────────────────────────

export function HowItWorks({ openAuth }: { openAuth: (m: "login" | "register") => void }) {
  const reduced = useReducedMotion() ?? false;
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const [activeIndex, setActiveIndex] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const clamped = Math.min(Math.max(v, 0), 1);
    const idx = Math.min(STEPS.length - 1, Math.floor(clamped * STEPS.length));
    setActiveIndex(idx);
  });

  return (
    <section id="how-it-works" ref={sectionRef} className="section-box black">
      <div className="section-pad relative overflow-hidden">
        {/* Background radial */}
        <motion.div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            translateX: "-50%",
            width: "100%",
            height: "100%",
            background: "radial-gradient(circle at top, rgba(16,185,129,0.10), transparent 70%)",
            pointerEvents: "none",
          }}
          animate={reduced ? undefined : { opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />

        <AmbientParticles reduced={reduced} />

        <div className="relative" style={{ zIndex: 1 }}>
          {/* Header */}
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-16 space-y-4"
          >
            <motion.span
              className="tag px-4 py-1.5 rounded-full inline-block relative overflow-hidden"
              style={{ color: "#ffffff", background: "var(--gg)" }}
              initial={{ scale: 0.85, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: "backOut" }}
            >
              Simple Process
              {!reduced && (
                <motion.span
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: "linear-gradient(110deg, transparent 40%, rgba(255,255,255,0.35) 50%, transparent 60%)" }}
                  initial={{ x: "-120%" }}
                  animate={{ x: "120%" }}
                  transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 2.5, ease: "easeInOut" }}
                />
              )}
            </motion.span>
            <h2 className="font-extrabold tracking-tight mt-4" style={{ fontSize: "clamp(28px,4vw,48px)", color: "#ffffff" }}>
              Live in <GradientText animate={false} colors={["#2563EB", "#10B981"]}>5 Steps</GradientText>
            </h2>
            <p style={{ color: "#94a3b8", fontSize: 16, maxWidth: 440, margin: "0 auto" }}>
              From idea to deployed voice agent in under 5 minutes — no code required.
            </p>
          </motion.div>

          {/* Horizontal step cards */}
          <div className="flex flex-col md:flex-row gap-5 max-w-6xl mx-auto">
            {STEPS.map((step, i) => (
              <TimelineStep key={i} step={step} index={i} active={i === activeIndex} />
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center mt-14"
          >
            <motion.div
              animate={
                reduced
                  ? undefined
                  : {
                      boxShadow: [
                        "0 4px 14px rgba(16,185,129,0.25)",
                        "0 4px 26px rgba(16,185,129,0.45)",
                        "0 4px 14px rgba(16,185,129,0.25)",
                      ],
                    }
              }
              transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
              className="inline-block rounded-[14px]"
            >
              <MagBtn
                onClick={() => openAuth("register")}
                className="btn-responsive-lg font-bold text-white flex items-center gap-2 mx-auto"
                style={{ background: "var(--gg)", borderRadius: 14, padding: "14px 24px" }}
              >
                Build Your First Agent Free
                <motion.svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </motion.svg>
              </MagBtn>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}