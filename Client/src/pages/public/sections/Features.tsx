import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { features } from "./data";
import { CountUp, GradientText } from "./anim";
import { EASE_OUT } from "./motionConstants";

const cardAnimations = [
  // Card 1: Slide from left
  { hidden: { opacity: 0, x: -60, rotateY: -15 }, visible: { opacity: 1, x: 0, rotateY: 0 } },
  // Card 2: Fade up with scale
  { hidden: { opacity: 0, y: 40, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1 } },
  // Card 3: Scale with bounce
  { hidden: { opacity: 0, scale: 0.7 }, visible: { opacity: 1, scale: 1 } },
  // Card 4: Rotate in 3D
  { hidden: { opacity: 0, rotateX: -40, rotateY: 20, scale: 0.85 }, visible: { opacity: 1, rotateX: 0, rotateY: 0, scale: 1 } },
  // Card 5: Rise with glow
  { hidden: { opacity: 0, y: 60, boxShadow: "0 0 0 rgba(0,0,0,0)" }, visible: { opacity: 1, y: 0, boxShadow: "0 20px 40px rgba(0,0,0,0.08)" } },
  // Card 6: Fade up (safe for mobile)
  { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } },
];

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduced = useReducedMotion() ?? false;
  const anim = cardAnimations[index % cardAnimations.length];

  return (
    <motion.div
      ref={ref}
      initial={reduced ? { opacity: 0 } : anim.hidden}
      animate={inView ? anim.visible : {}}
      transition={{
        duration: 0.8,
        delay: index * 0.1,
        ease: EASE_OUT,
      }}
      style={{ perspective: 1000 }}
    >
      <div
        className="group relative p-7 rounded-2xl overflow-hidden h-full cursor-default transition-all duration-500"
        style={{
          background: "#f8fafc",
          border: "1px solid rgba(37, 99, 235, 0.14)",
          boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.04)",
          transformStyle: "preserve-3d",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget;
          el.style.transform = "perspective(900px) rotateX(2deg) rotateY(-2deg) translateZ(8px)";
          el.style.boxShadow = `0 20px 50px -10px ${feature.color}20, 0 0 0 1px ${feature.color}30`;
          el.style.borderColor = `${feature.color}40`;
          el.style.background = "#ffffff";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget;
          el.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0px)";
          el.style.boxShadow = "0 10px 30px -10px rgba(0, 0, 0, 0.04)";
          el.style.borderColor = "rgba(37, 99, 235, 0.14)";
          el.style.background = "#f8fafc";
        }}
      >
        {/* Hover radial wash */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-2xl"
          style={{ background: `radial-gradient(ellipse at 30% 30%,${feature.color}14,transparent 60%)` }}
        />

        {/* Animated border glow */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-2xl"
          style={{ boxShadow: `inset 0 0 0 1px ${feature.color}59, 0 0 30px -4px ${feature.color}40` }}
        />

        {/* Icon with rotation entrance */}
        <motion.div
          initial={reduced ? { opacity: 0 } : { opacity: 0, rotate: -180, scale: 0.3 }}
          animate={inView ? { opacity: 1, rotate: 0, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-12 h-12 rounded-xl flex items-center justify-center mb-5 text-2xl"
          style={{ background: `${feature.color}14`, border: `1px solid ${feature.color}26` }}
        >
          <span className="group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500 inline-block">{feature.icon}</span>
        </motion.div>

        <h3 className="text-base font-bold mb-2" style={{ color: "#0a0a0a" }}>{feature.title}</h3>
        <p className="text-sm leading-relaxed mb-5" style={{ color: "#475569" }}>{feature.desc}</p>

        {/* Metric with animated border */}
        <div
          className="flex items-baseline gap-2 pt-4 relative"
          style={{ borderTop: "1px solid rgba(37, 99, 235, 0.14)" }}
        >
          {/* Animated underline on hover */}
          <div
            className="absolute top-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-700"
            style={{ background: `linear-gradient(90deg, ${feature.color}, transparent)` }}
          />
          <CountUp value={feature.metric} className="text-2xl font-extrabold" style={{ color: feature.color }} />
          <span className="tag text-[10px]" style={{ color: "#2563EB" }}>{feature.metricLabel}</span>
        </div>
      </div>
    </motion.div>
  );
}

export function Features() {
  const reduced = useReducedMotion() ?? false;

  return (
    <section id="features" className="section-box white">
      <div className="section-pad relative overflow-hidden">
        {/* Ambient gradients */}
        <div style={{ position: "absolute", bottom: 0, right: "10%", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(37,99,235,0.05), transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "10%", left: "5%", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(16,185,129,0.04), transparent 70%)", pointerEvents: "none" }} />

        <div className="relative" style={{ zIndex: 1 }}>
          {/* Header with stagger */}
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-16 space-y-4"
          >
            <span className="tag px-4 py-1.5 rounded-full inline-block" style={{ color: "#ffffff", background: "var(--gg)" }}>
              Platform Capabilities
            </span>
            <h2 className="font-extrabold tracking-tight mt-4" style={{ fontSize: "clamp(28px,4vw,48px)", color: "#0a0a0a" }}>
              Everything You Need{" "}
              <GradientText animate={false} colors={["#2563EB", "#10B981"]}>
                to Scale
              </GradientText>
            </h2>
            <p style={{ color: "#475569", fontSize: 16, maxWidth: 520, margin: "0 auto" }}>
              Powerful AI infrastructure designed to capture more leads and serve customers around the clock.
            </p>
          </motion.div>

          {/* Feature cards with unique animations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <FeatureCard key={i} feature={f} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
