import { useState, useCallback } from "react";
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
    <Reveal delay={index * 0.08}>
      <TiltCard
        className="group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 h-full"
        style={{
          background: isActive
            ? "linear-gradient(135deg, rgba(37,99,235,0.06), rgba(16,185,129,0.06))"
            : "rgba(255,255,255,0.8)",
          backdropFilter: "blur(16px)",
          border: isActive
            ? "1.5px solid rgba(16,185,129,0.35)"
            : "1px solid rgba(37,99,235,0.10)",
          boxShadow: isActive
            ? "0 24px 64px rgba(16,185,129,0.12), 0 0 0 1px rgba(16,185,129,0.08)"
            : "0 8px 32px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.02)",
        }}
      >
        {/* Top gradient bar */}
        {isActive && (
          <div
            className="absolute top-0 left-0 right-0 h-[3px]"
            style={{ background: "linear-gradient(90deg, #2563EB, #10B981, #34D399)" }}
          />
        )}

        {/* Hover glow */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
          style={{ background: "radial-gradient(ellipse at 30% 20%, rgba(37,99,235,0.06), transparent 60%)" }}
        />

        <div className="relative p-6 sm:p-7 z-10 flex flex-col h-full" onClick={onClick} onKeyDown={(e) => e.key === "Enter" && onClick()} role="button" tabIndex={0} aria-pressed={isActive} aria-label={`Select ${uc.title} use case`}>
          {/* Icon + Badge row */}
          <div className="flex items-start justify-between mb-5">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all duration-300 group-hover:scale-110"
              style={{
                background: isActive
                  ? "linear-gradient(135deg, rgba(37,99,235,0.12), rgba(16,185,129,0.12))"
                  : "rgba(37,99,235,0.06)",
                border: isActive
                  ? "1px solid rgba(16,185,129,0.25)"
                  : "1px solid rgba(37,99,235,0.08)",
                boxShadow: isActive ? "0 4px 16px rgba(16,185,129,0.15)" : "none",
              }}
            >
              {uc.icon}
            </div>

            <span
              className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase"
              style={{
                background: isActive
                  ? "linear-gradient(135deg, rgba(16,185,129,0.12), rgba(37,99,235,0.08))"
                  : "rgba(37,99,235,0.05)",
                color: isActive ? "#10B981" : "#2563EB",
                border: isActive
                  ? "1px solid rgba(16,185,129,0.2)"
                  : "1px solid rgba(37,99,235,0.08)",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {uc.title}
            </span>
          </div>

          {/* Title */}
          <h3
            className="text-lg font-bold mb-2 transition-all duration-300"
            style={{
              color: isActive ? "#0a0a0a" : "#0a0a0a",
              background: isActive ? "linear-gradient(135deg, #2563EB, #10B981)" : "none",
              WebkitBackgroundClip: isActive ? "text" : "unset",
              WebkitTextFillColor: isActive ? "transparent" : "#0a0a0a",
            }}
          >
            {uc.title}
          </h3>

          {/* Description */}
          <p className="text-sm leading-relaxed mb-5 flex-1" style={{ color: "#475569" }}>
            {variant.desc}
          </p>

          {/* Stat pill */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full w-fit transition-all duration-300"
            style={{
              background: isActive
                ? "linear-gradient(135deg, rgba(16,185,129,0.08), rgba(37,99,235,0.06))"
                : "rgba(37,99,235,0.04)",
              border: isActive
                ? "1px solid rgba(16,185,129,0.2)"
                : "1px solid rgba(37,99,235,0.06)",
            }}
          >
            <svg
              className={`w-3.5 h-3.5 ${isActive ? "animate-pulse" : ""}`}
              fill="none"
              stroke={isActive ? "#10B981" : "#2563EB"}
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span
              className="text-xs font-bold"
              style={{ color: isActive ? "#10B981" : "#2563EB" }}
            >
              {variant.stat}
            </span>
          </div>
        </div>

        {/* Bottom gradient bar */}
        {isActive && (
          <div className="h-[2px]" style={{ background: "linear-gradient(90deg, #2563EB, #10B981)" }} />
        )}
      </TiltCard>
    </Reveal>
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
              className="relative flex items-center gap-2.5 px-7 py-3 rounded-xl text-sm font-semibold transition-all duration-300 z-10"
              style={{
                border: "none",
                background: isActive ? "linear-gradient(135deg, #2563EB, #10B981)" : "transparent",
                color: isActive ? "#ffffff" : "#475569",
                cursor: "pointer",
                boxShadow: isActive ? "0 4px 16px rgba(16,185,129,0.25)" : "none",
              }}
            >
              <Icon className="w-4 h-4" />
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
    <div className="p-8 md:p-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-6 rounded-full" style={{ background: accentColor }} />
        <p className="text-xs font-bold tracking-widest uppercase" style={{ color: accentColor }}>
          Key Performance Metrics
        </p>
      </div>

      <div className="grid gap-3">
        {outcomes.map((item, j) => (
          <div
            key={j}
            className="group relative overflow-hidden rounded-xl p-4 transition-all duration-300 hover:translate-x-1"
            style={{
              background: "rgba(255,255,255,0.8)",
              border: "1px solid rgba(37,99,235,0.06)",
              backdropFilter: "blur(8px)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
            }}
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: `linear-gradient(135deg, ${accentColor}06, transparent)` }}
            />
            <div className="relative flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color: "#475569" }}>
                {item.label}
              </span>
              <span className="text-xl font-extrabold font-mono" style={{ color: "#0a0a0a" }}>
                {item.value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function FeaturesPanel({ features, cta, accentColor, onRegister, onContactSales }: {
  features: string[];
  cta: string;
  accentColor: string;
  onRegister: () => void;
  onContactSales: () => void;
}) {
  return (
    <div className="p-8 md:p-10" style={{ borderTop: "1px solid rgba(37,99,235,0.06)" }}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-6 rounded-full" style={{ background: accentColor }} />
        <p className="text-xs font-bold tracking-widest uppercase" style={{ color: accentColor }}>
          Capabilities
        </p>
      </div>

      <div className="grid gap-2.5">
        {features.map((feat, j) => (
          <div
            key={j}
            className="flex items-start gap-3.5 p-3 rounded-xl transition-all duration-200 hover:bg-white/60"
          >
            <div
              className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
              style={{
                background: `linear-gradient(135deg, ${accentColor}18, ${accentColor}10)`,
                border: `1px solid ${accentColor}25`,
              }}
            >
              <svg width="10" height="10" fill="none" stroke={accentColor} strokeWidth="3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-sm leading-relaxed" style={{ color: "#475569" }}>
              {feat}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 flex flex-col sm:flex-row gap-3" style={{ borderTop: "1px solid rgba(37,99,235,0.06)" }}>
        <button
          onClick={onRegister}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-white transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
          style={{
            background: "linear-gradient(135deg, #2563EB, #10B981)",
            boxShadow: "0 4px 20px rgba(16,185,129,0.3)",
            border: "none",
            cursor: "pointer",
          }}
        >
          {cta}
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </button>

        <button
          onClick={onContactSales}
          className="flex-1 px-6 py-3.5 rounded-xl font-semibold transition-all duration-300 hover:bg-white/80 hover:-translate-y-0.5"
          style={{
            background: "rgba(255,255,255,0.6)",
            border: "1px solid rgba(37,99,235,0.1)",
            color: "#475569",
            cursor: "pointer",
            backdropFilter: "blur(8px)",
          }}
        >
          Contact Sales
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function IntegrationRow({ items, direction = "normal" }: { items: IntegrationItem[]; direction?: "normal" | "reverse" }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl"
      style={{
        background: direction === "normal"
          ? "linear-gradient(135deg, rgba(37,99,235,0.03), rgba(37,99,235,0.01))"
          : "linear-gradient(135deg, rgba(16,185,129,0.03), rgba(16,185,129,0.01))",
        border: "1px solid rgba(37,99,235,0.06)",
      }}
    >
      <div className="absolute inset-y-0 left-0 w-28 z-10 pointer-events-none" style={{ background: "linear-gradient(90deg, #f8fafc, transparent)" }} />
      <div className="absolute inset-y-0 right-0 w-28 z-10 pointer-events-none" style={{ background: "linear-gradient(270deg, #f8fafc, transparent)" }} />

      <div
        className={`flex gap-3 py-4 px-3 ${direction === "normal" ? "animate-marquee-left" : "animate-marquee-right"}`}
        style={{ width: "max-content" }}
      >
        {[...items, ...items, ...items].map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl flex-shrink-0 transition-all duration-200 hover:scale-[1.03] hover:shadow-md"
            style={{
              background: "rgba(255,255,255,0.9)",
              border: "1px solid rgba(37,99,235,0.06)",
              boxShadow: "0 1px 4px rgba(0,0,0,0.02)",
              backdropFilter: "blur(8px)",
            }}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-sm font-medium whitespace-nowrap" style={{ color: "#475569" }}>
              {item.name}
            </span>
          </div>
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

        {/* Decorative orbs */}
        <div className="absolute top-10 right-[10%] w-[500px] h-[500px] rounded-full opacity-[0.04] pointer-events-none"
          style={{ background: "radial-gradient(circle, #2563EB, transparent 70%)" }}
        />
        <div className="absolute bottom-10 left-[5%] w-[400px] h-[400px] rounded-full opacity-[0.04] pointer-events-none"
          style={{ background: "radial-gradient(circle, #10B981, transparent 70%)" }}
        />

        <div className="relative" style={{ zIndex: 1 }}>
          {/* ── Header ── */}
          <Reveal className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="tag px-4 py-1.5 rounded-full inline-block text-xs font-bold tracking-wider uppercase"
              style={{ color: "#ffffff", background: "var(--gg)" }}
            >
              Industry Solutions
            </span>

            <h2
              className="font-extrabold tracking-tight mt-4"
              style={{ fontSize: "clamp(28px, 5vw, 48px)", color: "#0a0a0a" }}
            >
              Built for{" "}
              <span className="relative inline-block">
                <span className="gradient-text">every industry</span>
                <span className="absolute -bottom-1 left-0 right-0 h-1 rounded-full"
                  style={{ background: "linear-gradient(90deg, #2563EB, #10B981)" }}
                />
              </span>
            </h2>

            <p style={{ color: "#475569", fontSize: 16, maxWidth: 520, margin: "0 auto" }}>
              Plug into the tools your team already uses — connects with your existing
              CRM, telephony, and automation tools instantly.
            </p>
          </Reveal>

          {/* ── Use case cards ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
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
          <Reveal>
            <div
              className="relative rounded-3xl overflow-hidden mb-20"
              style={{
                background: "linear-gradient(135deg, rgba(37,99,235,0.03), rgba(16,185,129,0.02))",
                border: "1px solid rgba(37,99,235,0.10)",
                boxShadow: "0 24px 64px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.02)",
              }}
            >
              <ModeToggle mode={mode} onModeChange={setMode} />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0" key={`${activeUseCase}-${mode}`}>
                <div className={`${mode === "chat" ? "" : "lg:order-2"}`}>
                  <OutcomesPanel outcomes={variant.outcomes} accentColor={accentColor} />
                </div>
                <div className={`${mode === "chat" ? "" : "lg:order-1"}`}
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
            </div>
          </Reveal>

          {/* ── Integrations ── */}
          <Reveal className="text-center mb-12 space-y-3">
            <span className="tag px-4 py-1.5 rounded-full inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider"
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
                <div
                  key={i}
                  className="group relative rounded-2xl p-6 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden"
                  style={{
                    background: "rgba(255,255,255,0.8)",
                    border: "1px solid rgba(37,99,235,0.06)",
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{ background: "radial-gradient(circle at 50% 50%, rgba(37,99,235,0.04), transparent 70%)" }}
                  />
                  <dt className="relative text-xs font-medium uppercase tracking-wider" style={{ color: "#94A3B8" }}>
                    {l}
                  </dt>
                  <dd className="relative text-3xl sm:text-4xl font-extrabold mt-2 gradient-text">
                    {n}
                  </dd>
                </div>
              ))}
            </div>
          </Reveal>

          {/* CTA Banner */}
          <Reveal>
            <div
              className="mt-10 relative rounded-3xl p-8 sm:p-10 overflow-hidden group"
              style={{
                background: "linear-gradient(135deg, rgba(37,99,235,0.05), rgba(16,185,129,0.05))",
                border: "1px solid rgba(37,99,235,0.10)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.03)",
              }}
            >
              {/* Decorative orb */}
              <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-[0.08] pointer-events-none transition-transform duration-700 group-hover:scale-110"
                style={{ background: "radial-gradient(circle, #10B981, transparent 70%)" }}
              />
              <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full opacity-[0.06] pointer-events-none"
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
                <button
                  onClick={scrollToContact}
                  className="px-7 py-3.5 rounded-xl text-sm font-bold text-white whitespace-nowrap transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                  style={{
                    background: "var(--gg)",
                    boxShadow: "0 4px 20px rgba(16,185,129,0.25)",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Contact Support →
                </button>
              </div>
            </div>
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
      `}</style>
    </section>
  );
}
