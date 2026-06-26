import { useState, useCallback,  useRef } from "react";
import { useCases, integrationsRow1, integrationsRow2 } from "./data";
import { motion, AnimatePresence, useInView } from "framer-motion";

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

// ─── Style constants ──────────────────────────────────────────────────────────

const BRAND_BLUE = "#2563EB";
const BRAND_GREEN = "#10B981";
const TEXT_DARK = "#0a0a0a";
const TEXT_MID = "#475569";
const TEXT_LIGHT = "#94A3B8";
const GRADIENT_LINEAR = "linear-gradient(135deg,#2563EB,#10B981)";

// ─── Enhanced Sub-components ─────────────────────────────────────────────────

interface UseCaseCardProps {
  uc: UseCase;
  index: number;
  isActive: boolean;
  mode: DisplayMode;
  onClick: () => void;
}

function UseCaseCard({ uc, index, isActive, mode, onClick }: UseCaseCardProps) {
  const variant = uc[mode];
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className="relative"
    >
      <div
        role="button"
        tabIndex={0}
        aria-pressed={isActive}
        aria-label={`Select ${uc.title} use case`}
        onClick={onClick}
        onKeyDown={(e) => e.key === "Enter" && onClick()}
        className="relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300"
        style={{
          background: isActive 
            ? "linear-gradient(135deg, rgba(37,99,235,0.08), rgba(16,185,129,0.08))"
            : "rgba(255,255,255,0.6)",
          backdropFilter: isActive ? "blur(10px)" : "blur(0px)",
          border: isActive 
            ? "2px solid rgba(16,185,129,0.3)"
            : "1px solid rgba(37,99,235,0.08)",
          boxShadow: isActive
            ? "0 20px 60px rgba(16,185,129,0.12), 0 0 0 1px rgba(16,185,129,0.1)"
            : "0 2px 12px rgba(0,0,0,0.04)",
          transform: isActive ? "scale(1.02)" : "scale(1)",
        }}
      >
        {isActive && (
          <>
            <motion.div
              layoutId="activeGlow"
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "radial-gradient(circle at 30% 20%, rgba(16,185,129,0.15), transparent 70%)",
              }}
            />
            <div
              className="absolute top-0 left-0 right-0"
              style={{ height: 3, background: GRADIENT_LINEAR }}
            />
          </>
        )}

        <div className="p-6 sm:p-7 relative z-10">
          <div className="flex items-start justify-between mb-5">
            <motion.div
              whileHover={{ rotate: [0, -5, 5, 0], scale: 1.1 }}
              transition={{ duration: 0.4 }}
              className="relative"
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: isActive
                  ? "linear-gradient(135deg, rgba(37,99,235,0.15), rgba(16,185,129,0.15))"
                  : "rgba(37,99,235,0.06)",
                border: isActive
                  ? "1px solid rgba(16,185,129,0.2)"
                  : "1px solid rgba(37,99,235,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 26,
                transition: "all 0.3s",
              }}
            >
              {uc.icon}
              {isActive && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
                  style={{ background: BRAND_GREEN }}
                />
              )}
            </motion.div>

            <motion.span
              initial={false}
              animate={isActive ? { scale: 1.05 } : { scale: 1 }}
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: "5px 14px",
                borderRadius: 99,
                background: isActive 
                  ? "linear-gradient(135deg, rgba(37,99,235,0.12), rgba(16,185,129,0.12))"
                  : "rgba(37,99,235,0.06)",
                color: isActive ? BRAND_GREEN : BRAND_BLUE,
                border: isActive
                  ? "1px solid rgba(16,185,129,0.2)"
                  : "1px solid rgba(37,99,235,0.08)",
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: "0.08em",
              }}
            >
              {uc.title}
            </motion.span>
          </div>

          <h3 
            className="text-lg font-bold mb-2"
            style={{ 
              color: TEXT_DARK,
              background: isActive ? GRADIENT_LINEAR : "none",
              WebkitBackgroundClip: isActive ? "text" : "none",
              WebkitTextFillColor: isActive ? "transparent" : TEXT_DARK,
            }}
          >
            {uc.title}
          </h3>
          
          <p className="text-sm leading-relaxed mb-5" style={{ color: TEXT_MID }}>
            {variant.desc}
          </p>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
            style={{
              background: isActive
                ? "linear-gradient(135deg, rgba(37,99,235,0.1), rgba(16,185,129,0.1))"
                : "rgba(37,99,235,0.04)",
              border: isActive
                ? "1px solid rgba(16,185,129,0.2)"
                : "1px solid rgba(37,99,235,0.06)",
            }}
          >
            <motion.svg
              animate={isActive ? { x: [0, 4, 0] } : {}}
              transition={{ repeat: Infinity, duration: 1.5 }}
              width="14"
              height="14"
              fill="none"
              stroke={isActive ? BRAND_GREEN : BRAND_BLUE}
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </motion.svg>
            <span 
              className="text-xs font-bold"
              style={{ color: isActive ? BRAND_GREEN : BRAND_BLUE }}
            >
              {variant.stat}
            </span>
          </motion.div>
        </div>

        {isActive && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="h-1"
            style={{ 
              background: GRADIENT_LINEAR,
              transformOrigin: "left",
            }}
          />
        )}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

interface ModeToggleProps {
  mode: DisplayMode;
  onModeChange: (m: DisplayMode) => void;
}

function ModeToggle({ mode, onModeChange }: ModeToggleProps) {
  return (
    <div 
      className="relative flex p-1 rounded-2xl"
      style={{ 
        background: "rgba(37,99,235,0.04)",
        border: "1px solid rgba(37,99,235,0.06)",
      }}
    >
      {(["chat", "voice"] as DisplayMode[]).map((m) => {
        const isActive = mode === m;
        const Icon = m === "chat" ? ChatIcon : VoiceIcon;

        return (
          <motion.button
            key={m}
            role="tab"
            aria-selected={isActive}
            onClick={() => onModeChange(m)}
            className="relative flex-1 px-6 py-3 rounded-xl text-sm font-semibold transition-all z-10"
            style={{
              border: "none",
              background: "transparent",
              color: isActive ? "#ffffff" : TEXT_MID,
              cursor: "pointer",
            }}
          >
            {isActive && (
              <motion.div
                layoutId="activeModeBg"
                className="absolute inset-0 rounded-xl"
                style={{ background: GRADIENT_LINEAR }}
                transition={{ type: "spring", duration: 0.5 }}
              />
            )}
            <span className="relative flex items-center justify-center gap-2.5">
              <Icon className="w-4 h-4" />
              {m === "chat" ? "Chat Interface" : "Voice Agent"}
            </span>
          </motion.button>
        );
      })}
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

interface OutcomesPanelProps {
  outcomes: OutcomeItem[];
  accentColor: string;
}

function OutcomesPanel({ outcomes, accentColor }: OutcomesPanelProps) {
  return (
    <div className="p-8 md:p-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-0.5 h-6 rounded-full" style={{ background: accentColor }} />
        <p className="text-xs font-bold tracking-widest uppercase" style={{ color: accentColor }}>
          Key Performance Metrics
        </p>
      </div>
      
      <div className="grid gap-3">
        {outcomes.map((item, j) => (
          <motion.div
            key={j}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: j * 0.05 }}
            whileHover={{ scale: 1.02, x: 4 }}
            className="group relative overflow-hidden rounded-xl p-4"
            style={{
              background: "rgba(255,255,255,0.7)",
              border: "1px solid rgba(37,99,235,0.06)",
              backdropFilter: "blur(10px)",
            }}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
              style={{ background: `linear-gradient(135deg, ${accentColor}08, transparent)` }} 
            />
            <div className="relative flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color: TEXT_MID }}>
                {item.label}
              </span>
              <span 
                className="text-xl font-bold font-mono"
                style={{ color: TEXT_DARK }}
              >
                {item.value}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

interface FeaturesPanelProps {
  features: string[];
  cta: string;
  accentColor: string;
  onRegister: () => void;
  onContactSales: () => void;
}

function FeaturesPanel({ features, cta, accentColor, onRegister, onContactSales }: FeaturesPanelProps) {
  return (
    <div className="p-8 md:p-10" style={{ borderTop: "1px solid rgba(37,99,235,0.06)" }}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-0.5 h-6 rounded-full" style={{ background: accentColor }} />
        <p className="text-xs font-bold tracking-widest uppercase" style={{ color: accentColor }}>
          Capabilities
        </p>
      </div>

      <div className="grid gap-3">
        {features.map((feat, j) => (
          <motion.div
            key={j}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: j * 0.05 }}
            className="flex items-start gap-4 p-3 rounded-xl transition-all"
            style={{
              background: "rgba(255,255,255,0.5)",
              border: "1px solid rgba(37,99,235,0.04)",
            }}
          >
            <div 
              className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
              style={{
                background: `linear-gradient(135deg, ${accentColor}15, ${accentColor}10)`,
                border: `1px solid ${accentColor}20`,
              }}
            >
              <svg width="12" height="12" fill="none" stroke={accentColor} strokeWidth="3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-sm leading-relaxed" style={{ color: TEXT_MID }}>
              {feat}
            </span>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 pt-6 flex flex-col sm:flex-row gap-3" style={{ borderTop: "1px solid rgba(37,99,235,0.06)" }}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onRegister}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-shadow"
          style={{
            background: GRADIENT_LINEAR,
            boxShadow: "0 4px 20px rgba(16,185,129,0.3)",
            border: "none",
            cursor: "pointer",
          }}
        >
          {cta}
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onContactSales}
          className="flex-1 px-6 py-3 rounded-xl font-semibold transition-all"
          style={{
            background: "rgba(255,255,255,0.6)",
            border: "1px solid rgba(37,99,235,0.1)",
            color: TEXT_MID,
            cursor: "pointer",
            backdropFilter: "blur(10px)",
          }}
        >
          Contact Sales
        </motion.button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

interface IntegrationRowProps {
  items: IntegrationItem[];
  direction?: "normal" | "reverse";
}

function IntegrationRow({ items, direction = "normal" }: IntegrationRowProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className="relative overflow-hidden rounded-2xl"
      style={{
        background: direction === "normal" 
          ? "linear-gradient(135deg, rgba(37,99,235,0.03), rgba(37,99,235,0.01))"
          : "linear-gradient(135deg, rgba(16,185,129,0.03), rgba(16,185,129,0.01))",
        border: "1px solid rgba(37,99,235,0.06)",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute inset-y-0 left-0 w-24 z-10 pointer-events-none" style={{ background: "linear-gradient(90deg, #ffffff, transparent)" }} />
      <div className="absolute inset-y-0 right-0 w-24 z-10 pointer-events-none" style={{ background: "linear-gradient(270deg, #ffffff, transparent)" }} />
      
      <motion.div
        className="flex gap-4 py-5 px-2"
        style={{ width: "max-content" }}
        animate={{
          x: direction === "normal" 
            ? (isHovered ? "-50%" : "0%")
            : (isHovered ? "0%" : "-50%"),
        }}
        transition={{ duration: 20, ease: "linear" }}
      >
        {[...items, ...items, ...items].map((item, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.1, rotate: [-2, 2, 0] }}
            className="flex items-center gap-3 px-6 py-3 rounded-xl flex-shrink-0 transition-all"
            style={{
              background: "rgba(255,255,255,0.8)",
              border: "1px solid rgba(37,99,235,0.06)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
              backdropFilter: "blur(10px)",
            }}
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="text-sm font-medium" style={{ color: TEXT_MID }}>
              {item.name}
            </span>
          </motion.div>
        ))}
      </motion.div>
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
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const uc = useCases[activeUseCase] as UseCase;
  const variant = uc[mode];
  const accentColor = mode === "chat" ? BRAND_BLUE : BRAND_GREEN;

  const scrollToContact = useCallback(() => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleRegister = useCallback(() => openAuth("register"), [openAuth]);

  return (
    <section ref={sectionRef} className="relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-[0.03]"
          style={{ background: "radial-gradient(circle, #2563EB, transparent 70%)" }} 
        />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-[0.03]"
          style={{ background: "radial-gradient(circle, #10B981, transparent 70%)" }} 
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ delay: 0.2 }}
            className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase"
            style={{ color: "#ffffff", background: "var(--gg)" }}
          >
            ✦ Industry Solutions
          </motion.span>
          
          <h2 className="mt-6 font-extrabold leading-tight tracking-tight"
            style={{ fontSize: "clamp(32px, 5vw, 52px)" }}
          >
            Built for{" "}
            <span className="relative">
              <span className="gradient-text">every industry</span>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="absolute -bottom-2 left-0 right-0 h-1.5 rounded-full"
                style={{ background: GRADIENT_LINEAR, transformOrigin: "left" }}
              />
            </span>
          </h2>
          
          <p className="mt-4 text-base sm:text-lg" style={{ color: TEXT_MID }}>
            Plug into the tools your team already uses — connects with your existing 
            CRM, telephony, and automation tools instantly.
          </p>
        </motion.div>

        {/* ── Use case cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {(useCases as UseCase[]).map((uc, i) => (
            <UseCaseCard
              key={i}
              uc={uc}
              index={i}
              isActive={activeUseCase === i}
              mode={mode}
              onClick={() => setActiveUseCase(i)}
            />
          ))}
        </div>

        {/* ── Detail panel ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeUseCase}-${mode}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="relative rounded-3xl overflow-hidden mb-16"
            style={{
              background: "linear-gradient(135deg, rgba(37,99,235,0.04), rgba(16,185,129,0.02))",
              border: "1px solid rgba(16,185,129,0.08)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.04)",
            }}
          >
            <ModeToggle mode={mode} onModeChange={setMode} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              <OutcomesPanel outcomes={variant.outcomes} accentColor={accentColor} />
              <FeaturesPanel
                features={variant.features}
                cta={variant.cta}
                accentColor={accentColor}
                onRegister={handleRegister}
                onContactSales={scrollToContact}
              />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ── Integrations ── */}
        <div className="mt-20">
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full mb-4"
              style={{ background: "rgba(37,99,235,0.04)", border: "1px solid rgba(37,99,235,0.06)" }}
            >
              <span className="text-xl">🔌</span>
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: TEXT_MID }}>
                Seamless Integrations
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold" style={{ color: TEXT_DARK }}>
              Connect your favorite tools
            </h3>
            <p className="text-sm mt-2" style={{ color: TEXT_MID }}>
              Native integrations with the platforms you already use
            </p>
          </motion.div>

          <div className="space-y-4">
            <IntegrationRow
              items={integrationsRow1 as IntegrationItem[]}
              direction="normal"
            />
            <IntegrationRow
              items={integrationsRow2 as IntegrationItem[]}
              direction="reverse"
            />
          </div>

          {/* Stats */}
          <motion.dl
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.8 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10"
          >
            {INTEGRATION_STATS.map(({ n, l }, i) => (
              <div
                key={i}
                className="relative rounded-2xl p-6 text-center transition-all hover:shadow-lg"
                style={{
                  background: "rgba(255,255,255,0.6)",
                  border: "1px solid rgba(37,99,235,0.06)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <dt className="text-xs font-medium uppercase tracking-wider" style={{ color: TEXT_LIGHT }}>
                  {l}
                </dt>
                <motion.dd
                  initial={{ scale: 0.8 }}
                  animate={isInView ? { scale: 1 } : { scale: 0.8 }}
                  transition={{ delay: 1 + i * 0.1, type: "spring" }}
                  className="text-3xl sm:text-4xl font-bold mt-2 gradient-text"
                >
                  {n}
                </motion.dd>
              </div>
            ))}
          </motion.dl>

          {/* CTA Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 1 }}
            className="mt-8 relative rounded-3xl p-6 sm:p-8 overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(37,99,235,0.05), rgba(16,185,129,0.05))",
              border: "1px solid rgba(37,99,235,0.08)",
            }}
          >
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
              style={{ background: "radial-gradient(circle, #10B981, transparent 70%)" }}
            />
            <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-lg font-bold" style={{ color: TEXT_DARK }}>
                  Need a custom integration?
                </h4>
                <p className="text-sm mt-1" style={{ color: TEXT_MID }}>
                  Our API supports webhooks, real-time events, and everything in between.
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={scrollToContact}
                className="px-6 py-3 rounded-xl text-sm font-bold text-white whitespace-nowrap"
                style={{
                  background: "var(--gg)",
                  boxShadow: "0 4px 20px rgba(16,185,129,0.25)",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Contact Support →
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        .gradient-text {
          background: linear-gradient(135deg, #2563EB, #10B981);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </section>
  );
}