import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView, animate } from "framer-motion";
import { useCases, integrationsRow1, integrationsRow2 } from "./data";
import { Reveal, TiltCard } from "./utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type AuthMode = "login" | "register";
type DisplayMode = "chat" | "voice";

interface OutcomeItem {
  label: string;
  value: string;
}

interface ModeVariant {
  desc: string;
  stat: string;
  outcomes: OutcomeItem[];
  features: string[];
  cta: string;
}

interface UseCase {
  icon: string;
  title: string;
  chat: ModeVariant;
  voice: ModeVariant;
}

interface IntegrationItem {
  icon: string;
  name: string;
}

interface IndustryProps {
  activeUseCase: number;
  setActiveUseCase: (i: number) => void;
  openAuth: (m: AuthMode) => void;
}

// ─── Motion presets ───────────────────────────────────────────────────────────

const EASE = [0.16, 1, 0.3, 1] as const;

const cardVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.96 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.08, duration: 0.6, ease: EASE },
  }),
};

const panelContentVariants = {
  enter: { opacity: 0, y: 14 },
  center: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE, staggerChildren: 0.04 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.25, ease: EASE } },
};

const rowItem = {
  enter: { opacity: 0, x: -8 },
  center: { opacity: 1, x: 0, transition: { duration: 0.35, ease: EASE } },
};

// ─── Animated counter for stats ──────────────────────────────────────────────

function AnimatedStat({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const [display, setDisplay] = useState(value.match(/^\D*0/) ? value : value);

  useEffect(() => {
    if (!inView) return;
    const numMatch = value.match(/[\d.]+/);
    if (!numMatch) {
      setDisplay(value);
      return;
    }
    const target = parseFloat(numMatch[0]);
    const prefix = value.slice(0, numMatch.index);
    const suffix = value.slice((numMatch.index ?? 0) + numMatch[0].length);
    const controls = animate(0, target, {
      duration: 1.1,
      ease: EASE,
      onUpdate: (v) => {
        const formatted = Number.isInteger(target) ? Math.round(v).toString() : v.toFixed(1);
        setDisplay(`${prefix}${formatted}${suffix}`);
      },
    });
    return () => controls.stop();
  }, [inView, value]);

  return <span ref={ref}>{display}</span>;
}

// ─── Sub-components ─────────────────────────────────────────────────────────

interface UseCaseCardProps {
  uc: UseCase;
  index: number;
  isActive: boolean;
  mode: DisplayMode;
  onClick: () => void;
}

function UseCaseCard({ uc, index, isActive, mode, onClick }: UseCaseCardProps) {
  const variant = uc[mode];

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-10%" }}
      whileHover={{ y: -6, transition: { duration: 0.25, ease: EASE } }}
      whileTap={{ scale: 0.98 }}
      className="h-full"
    >
      <TiltCard
        className="group relative rounded-2xl overflow-hidden cursor-pointer h-full"
        style={{
          background: isActive
            ? "linear-gradient(135deg, rgba(37,99,235,0.06), rgba(16,185,129,0.06))"
            : "rgba(255,255,255,0.8)",
          backdropFilter: "blur(16px)",
          border: isActive
            ? "1.5px solid rgba(16,185,129,0.35)"
            : "1px solid rgba(37,99,235,0.10)",
          boxShadow: isActive
            ? "0 24px 64px rgba(16,185,129,0.16), 0 0 0 1px rgba(16,185,129,0.08)"
            : "0 8px 32px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.02)",
          transition: "background 0.4s ease, border 0.4s ease, box-shadow 0.4s ease",
        }}
      >
        {/* Active outline that morphs between cards */}
        {isActive && (
          <motion.div
            layoutId="activeUseCaseGlow"
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="absolute top-0 left-0 right-0 h-[3px]"
            style={{ background: "linear-gradient(90deg, #2563EB, #10B981, #34D399)" }}
          />
        )}

        {/* Hover glow */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
          style={{ background: "radial-gradient(ellipse at 30% 20%, rgba(37,99,235,0.08), transparent 60%)" }}
        />

        {/* Sheen sweep on hover */}
        <motion.div
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100"
          style={{
            background: "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.5) 50%, transparent 70%)",
            mixBlendMode: "overlay",
          }}
          initial={{ x: "-120%" }}
          whileHover={{ x: "120%" }}
          transition={{ duration: 0.9, ease: EASE }}
        />

        <div
          className="relative p-6 sm:p-7 z-10 flex flex-col h-full"
          onClick={onClick}
          onKeyDown={(e) => e.key === "Enter" && onClick()}
          role="button"
          tabIndex={0}
          aria-pressed={isActive}
          aria-label={`Select ${uc.title} use case`}
        >
          <div className="flex items-start justify-between mb-5">
            <motion.div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
              animate={isActive ? { rotate: [0, -6, 6, 0] } : { rotate: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
              whileHover={{ scale: 1.12, rotate: 8 }}
              style={{
                background: isActive
                  ? "linear-gradient(135deg, rgba(37,99,235,0.12), rgba(16,185,129,0.12))"
                  : "rgba(37,99,235,0.06)",
                border: isActive ? "1px solid rgba(16,185,129,0.25)" : "1px solid rgba(37,99,235,0.08)",
                boxShadow: isActive ? "0 4px 16px rgba(16,185,129,0.18)" : "none",
              }}
            >
              {uc.icon}
            </motion.div>

            <span
              className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase transition-colors duration-300"
              style={{
                background: isActive
                  ? "linear-gradient(135deg, rgba(16,185,129,0.12), rgba(37,99,235,0.08))"
                  : "rgba(37,99,235,0.05)",
                color: isActive ? "#10B981" : "#2563EB",
                border: isActive ? "1px solid rgba(16,185,129,0.2)" : "1px solid rgba(37,99,235,0.08)",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {uc.title}
            </span>
          </div>

          <h3
            className="text-lg font-bold mb-2 transition-all duration-300"
            style={{
              background: isActive ? "linear-gradient(135deg, #2563EB, #10B981)" : "none",
              WebkitBackgroundClip: isActive ? "text" : "unset",
              WebkitTextFillColor: isActive ? "transparent" : "#0a0a0a",
            }}
          >
            {uc.title}
          </h3>

          <p className="text-sm leading-relaxed mb-5 flex-1" style={{ color: "#475569" }}>
            {variant.desc}
          </p>

          <motion.div
            layout
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full w-fit"
            style={{
              background: isActive
                ? "linear-gradient(135deg, rgba(16,185,129,0.08), rgba(37,99,235,0.06))"
                : "rgba(37,99,235,0.04)",
              border: isActive ? "1px solid rgba(16,185,129,0.2)" : "1px solid rgba(37,99,235,0.06)",
            }}
          >
            <motion.svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke={isActive ? "#10B981" : "#2563EB"}
              strokeWidth="2.5"
              viewBox="0 0 24 24"
              animate={isActive ? { scale: [1, 1.25, 1] } : { scale: 1 }}
              transition={{ duration: 1.6, repeat: isActive ? Infinity : 0, ease: "easeInOut" }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </motion.svg>
            <span className="text-xs font-bold" style={{ color: isActive ? "#10B981" : "#2563EB" }}>
              {variant.stat}
            </span>
          </motion.div>
        </div>

        {isActive && (
          <motion.div
            layoutId="activeUseCaseGlowBottom"
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="h-[2px]"
            style={{ background: "linear-gradient(90deg, #2563EB, #10B981)" }}
          />
        )}
      </TiltCard>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function ModeToggle({ mode, onModeChange }: { mode: DisplayMode; onModeChange: (m: DisplayMode) => void }) {
  return (
    <div className="flex justify-center pt-8 pb-2 px-8">
      <div
        className="relative flex p-1 rounded-2xl"
        style={{
          background: "rgba(37,99,235,0.04)",
          border: "1px solid rgba(37,99,235,0.08)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
        }}
      >
        {(["chat", "voice"] as DisplayMode[]).map((m) => {
          const isActive = mode === m;
          const Icon = m === "chat" ? ChatIcon : VoiceIcon;

          return (
            <button
              key={m}
              role="tab"
              aria-selected={isActive}
              onClick={() => onModeChange(m)}
              className="relative flex items-center gap-2.5 px-7 py-3 rounded-xl text-sm font-semibold z-10"
              style={{ border: "none", background: "transparent", color: isActive ? "#ffffff" : "#475569", cursor: "pointer" }}
            >
              {isActive && (
                <motion.div
                  layoutId="modeTogglePill"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  className="absolute inset-0 rounded-xl -z-10"
                  style={{ background: "linear-gradient(135deg, #2563EB, #10B981)", boxShadow: "0 4px 16px rgba(16,185,129,0.25)" }}
                />
              )}
              <motion.span
                animate={isActive ? { rotate: [0, -10, 10, 0] } : { rotate: 0 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="inline-flex"
              >
                <Icon className="w-4 h-4" />
              </motion.span>
              {m === "chat" ? "Chat Interface" : "Voice Agent"}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const ChatIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const VoiceIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────

function OutcomesPanel({ outcomes, accentColor }: { outcomes: OutcomeItem[]; accentColor: string }) {
  return (
    <motion.div variants={panelContentVariants} initial="enter" animate="center" exit="exit" className="p-8 md:p-10">
      <div className="flex items-center gap-3 mb-6">
        <motion.div layout className="w-1 h-6 rounded-full" style={{ background: accentColor }} />
        <p className="text-xs font-bold tracking-widest uppercase" style={{ color: accentColor }}>
          Key Performance Metrics
        </p>
      </div>

      <div className="grid gap-3">
        {outcomes.map((item, j) => (
          <motion.div
            key={j}
            variants={rowItem}
            whileHover={{ x: 6, transition: { duration: 0.2, ease: EASE } }}
            className="group relative overflow-hidden rounded-xl p-4"
            style={{
              background: "rgba(255,255,255,0.8)",
              border: "1px solid rgba(37,99,235,0.06)",
              backdropFilter: "blur(8px)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
            }}
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: `linear-gradient(135deg, ${accentColor}10, transparent)` }}
            />
            <div className="relative flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color: "#475569" }}>
                {item.label}
              </span>
              <span className="text-xl font-extrabold font-mono" style={{ color: "#0a0a0a" }}>
                <AnimatedStat value={item.value} />
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function FeaturesPanel({
  features,
  cta,
  accentColor,
  onRegister,
  onContactSales,
}: {
  features: string[];
  cta: string;
  accentColor: string;
  onRegister: () => void;
  onContactSales: () => void;
}) {
  return (
    <motion.div
      variants={panelContentVariants}
      initial="enter"
      animate="center"
      exit="exit"
      className="p-8 md:p-10"
      style={{ borderTop: "1px solid rgba(37,99,235,0.06)" }}
    >
      <div className="flex items-center gap-3 mb-6">
        <motion.div layout className="w-1 h-6 rounded-full" style={{ background: accentColor }} />
        <p className="text-xs font-bold tracking-widest uppercase" style={{ color: accentColor }}>
          Capabilities
        </p>
      </div>

      <div className="grid gap-2.5">
        {features.map((feat, j) => (
          <motion.div
            key={j}
            variants={rowItem}
            whileHover={{ x: 4 }}
            className="flex items-start gap-3.5 p-3 rounded-xl transition-colors duration-200 hover:bg-white/60"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: j * 0.05 + 0.15, type: "spring", stiffness: 400, damping: 20 }}
              className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
              style={{ background: `linear-gradient(135deg, ${accentColor}18, ${accentColor}10)`, border: `1px solid ${accentColor}25` }}
            >
              <svg width="10" height="10" fill="none" stroke={accentColor} strokeWidth="3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
            <span className="text-sm leading-relaxed" style={{ color: "#475569" }}>
              {feat}
            </span>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 pt-6 flex flex-col sm:flex-row gap-3" style={{ borderTop: "1px solid rgba(37,99,235,0.06)" }}>
        <motion.button
          onClick={onRegister}
          whileHover={{ y: -2, boxShadow: "0 8px 28px rgba(16,185,129,0.4)" }}
          whileTap={{ scale: 0.97 }}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-white"
          style={{ background: "linear-gradient(135deg, #2563EB, #10B981)", boxShadow: "0 4px 20px rgba(16,185,129,0.3)", border: "none", cursor: "pointer" }}
        >
          {cta}
          <motion.svg
            width="15"
            height="15"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </motion.svg>
        </motion.button>

        <motion.button
          onClick={onContactSales}
          whileHover={{ y: -2, background: "rgba(255,255,255,0.9)" }}
          whileTap={{ scale: 0.97 }}
          className="flex-1 px-6 py-3.5 rounded-xl font-semibold"
          style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(37,99,235,0.1)", color: "#475569", cursor: "pointer", backdropFilter: "blur(8px)" }}
        >
          Contact Sales
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function IntegrationRow({ items, direction = "normal" }: { items: IntegrationItem[]; direction?: "normal" | "reverse" }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl"
      style={{
        background:
          direction === "normal"
            ? "linear-gradient(135deg, rgba(37,99,235,0.03), rgba(37,99,235,0.01))"
            : "linear-gradient(135deg, rgba(16,185,129,0.03), rgba(16,185,129,0.01))",
        border: "1px solid rgba(37,99,235,0.06)",
      }}
    >
      <div className="absolute inset-y-0 left-0 w-28 z-10 pointer-events-none" style={{ background: "linear-gradient(90deg, #f8fafc, transparent)" }} />
      <div className="absolute inset-y-0 right-0 w-28 z-10 pointer-events-none" style={{ background: "linear-gradient(270deg, #f8fafc, transparent)" }} />

      <div className={`flex gap-3 py-4 px-3 ${direction === "normal" ? "animate-marquee-left" : "animate-marquee-right"}`} style={{ width: "max-content" }}>
        {[...items, ...items, ...items].map((item, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.06, y: -2, boxShadow: "0 8px 20px rgba(37,99,235,0.12)" }}
            transition={{ duration: 0.2, ease: EASE }}
            className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl flex-shrink-0"
            style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(37,99,235,0.06)", boxShadow: "0 1px 4px rgba(0,0,0,0.02)", backdropFilter: "blur(8px)" }}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-sm font-medium whitespace-nowrap" style={{ color: "#475569" }}>
              {item.name}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const INTEGRATION_STATS = [
  { n: "40+", l: "Pre-built integrations" },
  { n: "∞", l: "Custom API possibilities" },
  { n: "5 min", l: "Average setup time" },
] as const;

export function Industry({ activeUseCase, setActiveUseCase, openAuth }: IndustryProps) {
  const [mode, setMode] = useState<DisplayMode>("chat");

  const uc = useCases[activeUseCase] as UseCase;
  const variant = uc[mode];
  const accentColor = mode === "chat" ? "#2563EB" : "#10B981";

  const scrollToContact = useCallback(() => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleRegister = useCallback(() => openAuth("register"), [openAuth]);

  return (
    <section id="industry" className="section-box white">
      <div className="section-pad relative overflow-hidden">
        {/* Background grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(37,99,235,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(37,99,235,0.04) 1px,transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(ellipse 70% 50% at 50% 50%,black,transparent)",
            WebkitMaskImage: "radial-gradient(ellipse 70% 50% at 50% 50%,black,transparent)",
          }}
        />

        {/* Decorative orbs — slow ambient drift */}
        <motion.div
          className="absolute top-10 right-[10%] w-[500px] h-[500px] rounded-full opacity-[0.05] pointer-events-none"
          style={{ background: "radial-gradient(circle, #2563EB, transparent 70%)" }}
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-10 left-[5%] w-[400px] h-[400px] rounded-full opacity-[0.05] pointer-events-none"
          style={{ background: "radial-gradient(circle, #10B981, transparent 70%)" }}
          animate={{ x: [0, -24, 0], y: [0, 18, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative" style={{ zIndex: 1 }}>
          {/* ── Header ── */}
          <Reveal className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <motion.span
              initial={{ opacity: 0, y: -8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="tag px-4 py-1.5 rounded-full inline-block text-xs font-bold tracking-wider uppercase"
              style={{ color: "#ffffff", background: "var(--gg)" }}
            >
              Industry Solutions
            </motion.span>

            <h2 className="font-extrabold tracking-tight mt-4" style={{ fontSize: "clamp(28px, 5vw, 48px)", color: "#0a0a0a" }}>
              Built for{" "}
              <span className="relative inline-block">
                <span className="gradient-text">every industry</span>
                <motion.span
                  className="absolute -bottom-1 left-0 h-1 rounded-full"
                  style={{ background: "linear-gradient(90deg, #2563EB, #10B981)" }}
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
                />
              </span>
            </h2>

            <p style={{ color: "#475569", fontSize: 16, maxWidth: 520, margin: "0 auto" }}>
              Plug into the tools your team already uses — connects with your existing CRM, telephony, and
              automation tools instantly.
            </p>
          </Reveal>

          {/* ── Use case cards ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
            {(useCases as UseCase[]).map((uc, i) => (
              <UseCaseCard key={i} uc={uc} index={i} isActive={activeUseCase === i} mode={mode} onClick={() => setActiveUseCase(i)} />
            ))}
          </div>

          {/* ── Detail panel ── */}
          <Reveal>
            <motion.div
              layout
              className="relative rounded-3xl overflow-hidden mb-20"
              style={{
                background: "linear-gradient(135deg, rgba(37,99,235,0.03), rgba(16,185,129,0.02))",
                border: "1px solid rgba(37,99,235,0.10)",
                boxShadow: "0 24px 64px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.02)",
              }}
            >
              <ModeToggle mode={mode} onModeChange={setMode} />

              <AnimatePresence mode="wait">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0" key={`${activeUseCase}-${mode}`}>
                  <div className={`${mode === "chat" ? "" : "lg:order-2"}`}>
                    <OutcomesPanel outcomes={variant.outcomes} accentColor={accentColor} />
                  </div>
                  <div
                    className={`${mode === "chat" ? "" : "lg:order-1"}`}
                    style={{ borderLeft: mode === "voice" ? "1px solid rgba(37,99,235,0.06)" : "none" }}
                  >
                    <FeaturesPanel
                      features={variant.features}
                      cta={variant.cta}
                      accentColor={accentColor}
                      onRegister={handleRegister}
                      onContactSales={scrollToContact}
                    />
                  </div>
                </div>
              </AnimatePresence>
            </motion.div>
          </Reveal>

          {/* ── Integrations ── */}
          <Reveal className="text-center mb-12 space-y-3">
            <span
              className="tag px-4 py-1.5 rounded-full inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider"
              style={{ color: "#475569", background: "rgba(37,99,235,0.04)", border: "1px solid rgba(37,99,235,0.08)" }}
            >
              <span className="text-base">🔌</span>
              Seamless Integrations
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold" style={{ color: "#0a0a0a" }}>
              Connect your favorite tools
            </h3>
            <p className="text-sm" style={{ color: "#475569", maxWidth: 400, margin: "0 auto" }}>
              Native integrations with the platforms you already use
            </p>
          </Reveal>

          <Reveal>
            <div className="space-y-3">
              <IntegrationRow items={integrationsRow1 as IntegrationItem[]} direction="normal" />
              <IntegrationRow items={integrationsRow2 as IntegrationItem[]} direction="reverse" />
            </div>
          </Reveal>

          {/* Stats */}
          <Reveal>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10">
              {INTEGRATION_STATS.map(({ n, l }, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5, ease: EASE }}
                  whileHover={{ y: -4, boxShadow: "0 16px 36px rgba(37,99,235,0.1)" }}
                  className="group relative rounded-2xl p-6 text-center overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.8)", border: "1px solid rgba(37,99,235,0.06)", backdropFilter: "blur(12px)" }}
                >
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{ background: "radial-gradient(circle at 50% 50%, rgba(37,99,235,0.05), transparent 70%)" }}
                  />
                  <dt className="relative text-xs font-medium uppercase tracking-wider" style={{ color: "#94A3B8" }}>
                    {l}
                  </dt>
                  <dd className="relative text-3xl sm:text-4xl font-extrabold mt-2 gradient-text">
                    <AnimatedStat value={n} />
                  </dd>
                </motion.div>
              ))}
            </div>
          </Reveal>

          {/* CTA Banner */}
          <Reveal>
            <motion.div
              whileHover="hover"
              className="mt-10 relative rounded-3xl p-8 sm:p-10 overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(37,99,235,0.05), rgba(16,185,129,0.05))",
                border: "1px solid rgba(37,99,235,0.10)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.03)",
              }}
            >
              <motion.div
                variants={{ hover: { scale: 1.15 } }}
                transition={{ duration: 0.6, ease: EASE }}
                className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-[0.09] pointer-events-none"
                style={{ background: "radial-gradient(circle, #10B981, transparent 70%)" }}
              />
              <div
                className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full opacity-[0.06] pointer-events-none"
                style={{ background: "radial-gradient(circle, #2563EB, transparent 70%)" }}
              />

              <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="text-center sm:text-left">
                  <h4 className="text-lg font-bold" style={{ color: "#0a0a0a" }}>
                    Need a custom integration?
                  </h4>
                  <p className="text-sm mt-1" style={{ color: "#475569" }}>
                    Our API supports webhooks, real-time events, and everything in between.
                  </p>
                </div>
                <motion.button
                  onClick={scrollToContact}
                  whileHover={{ y: -2, boxShadow: "0 8px 28px rgba(16,185,129,0.35)" }}
                  whileTap={{ scale: 0.97 }}
                  className="px-7 py-3.5 rounded-xl text-sm font-bold text-white whitespace-nowrap"
                  style={{ background: "var(--gg)", boxShadow: "0 4px 20px rgba(16,185,129,0.25)", border: "none", cursor: "pointer" }}
                >
                  Contact Support →
                </motion.button>
              </div>
            </motion.div>
          </Reveal>
        </div>
      </div>

      <style>{`
        .gradient-text {
          background: linear-gradient(135deg, #2563EB, #10B981);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        @keyframes marquee-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        @keyframes marquee-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }

        .animate-marquee-left {
          animation: marquee-left 25s linear infinite;
        }

        .animate-marquee-right {
          animation: marquee-right 25s linear infinite;
        }

        .animate-marquee-left:hover,
        .animate-marquee-right:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}