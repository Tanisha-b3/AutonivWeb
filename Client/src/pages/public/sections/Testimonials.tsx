import { useRef, useState, useEffect } from "react";
import { motion, useInView, useReducedMotion, AnimatePresence } from "framer-motion";
import { testimonials } from "./data";
import { GradientText } from "./anim";

function StarRating() {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, k) => (
        <svg key={k} className="w-3.5 h-3.5" viewBox="0 0 20 20">
          <defs>
            <linearGradient id={`star-g-${k}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
          <path
            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
            fill={`url(#star-g-${k})`}
          />
        </svg>
      ))}
    </div>
  );
}

export function Testimonials() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion() ?? false;

  // Auto-rotate
  useEffect(() => {
    if (reduced) return;
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [reduced]);

  return (
    <section ref={ref} className="section-box black" style={{ background: "#050d1a" }}>
      {/* Ambient blobs */}
      <div className="pointer-events-none absolute top-0 left-1/4 w-[600px] h-[400px] rounded-full"
        style={{ background: "radial-gradient(ellipse, rgba(37,99,235,0.06) 0%, transparent 70%)" }}
      />
      <div className="pointer-events-none absolute bottom-0 right-1/4 w-[500px] h-[350px] rounded-full"
        style={{ background: "radial-gradient(ellipse, rgba(16,185,129,0.05) 0%, transparent 70%)" }}
      />

      {/* Subtle grid */}
      <div className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse 80% 50% at 50% 0%, black 40%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 50% at 50% 0%, black 40%, transparent 100%)",
        }}
      />

      <div className="relative z-10 py-20 sm:py-28 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-14"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold tracking-[0.18em] uppercase mb-6"
              style={{ color: "#ffffff", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}
            >
              <svg width="6" height="6" viewBox="0 0 6 6" className="animate-pulse">
                <circle cx="3" cy="3" r="3" fill="#10B981" />
              </svg>
              TESTIMONIALS
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
              Trusted by{" "}
              <GradientText animate={false} colors={["#60a5fa", "#34d399"]}>
                Industry Leaders
              </GradientText>
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-md mx-auto">
              See how businesses are transforming their customer experience with Autoniv
            </p>
          </motion.div>

          {/* 3D Card Stack - Active card */}
          <div className="relative max-w-3xl mx-auto mb-12" style={{ perspective: 1200 }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={reduced ? { opacity: 0 } : { opacity: 0, rotateY: -15, scale: 0.9, z: -100 }}
                animate={{ opacity: 1, rotateY: 0, scale: 1, z: 0 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, rotateY: 15, scale: 0.9, z: -100 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative p-5 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl"
                style={{
                  background: "linear-gradient(145deg, rgba(15,23,42,0.95), rgba(15,23,42,0.85))",
                  border: "1px solid rgba(255,255,255,0.1)",
                  boxShadow: "0 32px 80px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05)",
                  transformStyle: "preserve-3d",
                }}
              >
                {/* Ambient glow */}
                <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full pointer-events-none"
                  style={{ background: `radial-gradient(circle, ${testimonials[active].avatar}15, transparent 70%)` }}
                />

                {/* Quote icon */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-4xl sm:text-6xl lg:text-7xl font-serif leading-none select-none pointer-events-none mb-3 sm:mb-4"
                  style={{ color: `${testimonials[active].avatar}20` }}
                >
                  &ldquo;
                </motion.div>

                {/* Stars */}
                <div className="mb-3 sm:mb-5">
                  <StarRating />
                </div>

                {/* Quote */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-base sm:text-lg lg:text-xl leading-relaxed mb-6 sm:mb-8 text-white/80"
                >
                  &ldquo;{testimonials[active].quote}&rdquo;
                </motion.p>

                {/* Author */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pt-5 sm:pt-6 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="relative flex-shrink-0">
                      <div className="absolute -inset-1 rounded-full opacity-50"
                        style={{ background: `linear-gradient(135deg, ${testimonials[active].avatar}, ${testimonials[active].avatar}80)` }}
                      />
                      <img
                        src={testimonials[active].photo}
                        alt={testimonials[active].name}
                        className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                        style={{ border: `2px solid ${testimonials[active].avatar}` }}
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm sm:text-base font-bold text-white truncate">{testimonials[active].name}</div>
                      <div className="text-[10px] sm:text-xs text-slate-400 truncate">{testimonials[active].role}</div>
                    </div>
                  </div>
                  <span className="self-start sm:self-auto px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold flex-shrink-0"
                    style={{
                      color: "#10B981",
                      background: "rgba(16,185,129,0.1)",
                      border: "1px solid rgba(16,185,129,0.2)",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {testimonials[active].metric}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation dots */}
          <div className="flex items-center justify-center gap-3">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className="transition-all duration-300 cursor-pointer"
                style={{
                  width: active === i ? 32 : 8,
                  height: 8,
                  borderRadius: 99,
                  background: active === i
                    ? "linear-gradient(90deg, #2563EB, #10B981)"
                    : "rgba(255,255,255,0.15)",
                  border: "none",
                }}
              />
            ))}
          </div>

          {/* Stats bar */}
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="grid grid-cols-3 gap-4 sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-8 lg:gap-16 mt-10 sm:mt-14"
          >
            {[
              { n: "4.9/5", l: "Avg Rating", icon: "⭐" },
              { n: "2,500+", l: "Happy Clients", icon: "👥" },
              { n: "98%", l: "Satisfaction", icon: "🎯" },
            ].map((s, i) => (
              <div key={i} className="group flex flex-col items-center text-center cursor-default">
                <span className="text-xl sm:text-2xl mb-1 group-hover:scale-110 transition-transform duration-300">{s.icon}</span>
                <div className="text-base sm:text-xl lg:text-2xl font-extrabold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">{s.n}</div>
                <div className="text-[9px] sm:text-[11px] text-slate-500 font-medium tracking-wide">{s.l}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
