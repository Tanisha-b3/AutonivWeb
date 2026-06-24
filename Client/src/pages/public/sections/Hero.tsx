import { MicrophoneIcon, PhoneIcon, SpeakerWaveIcon, Squares2X2Icon } from "@heroicons/react/24/outline";
import { WAVE_HEIGHTS } from "./data";

export function Hero({ openAuth }: { openAuth: (m: "login" | "register") => void }) {
  return (
    <section className="section-box tint">
            <div
              className="section-pad relative overflow-hidden"
              style={{ paddingTop: 40, paddingBottom: 40 }}
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(37,99,235,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(37,99,235,0.05) 1px,transparent 1px)",
                  backgroundSize: "48px 48px",
                  maskImage:
                    "radial-gradient(ellipse 80% 50% at 50% 100%,black,transparent)",
                  WebkitMaskImage:
                    "radial-gradient(ellipse 80% 50% at 50% 100%,black,transparent)",
                }}
              />

              <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center w-full">
                {/* Text Content - First on mobile (order-1), Left on desktop (lg:order-1) */}
                <div className="lg:col-span-7 flex flex-col justify-center text-left space-y-4 lg:space-y-6 z-10 order-1 lg:order-1">
                  <div className="animate-fade-up delay-100">
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full tag text-xs sm:text-sm"
                      style={{
                        color: "#2563EB",
                        background: "rgba(37,99,235,0.08)",
                        border: "1px solid rgba(37,99,235,0.3)",
                      }}
                    >
                      ✦ AI Voice • Chat Solutions
                    </span>
                  </div>

                  <div className="animate-fade-up delay-200">
                    <h1
                      className="font-extrabold leading-[1.08] tracking-tight"
                      style={{
                        fontSize: "clamp(32px,8vw,66px)",
                        color: "#0a0a0a",
                      }}
                    >
                      Your Business Never Stops. <br />
                     <span
                        style={{
                          background:
                            "linear-gradient(135deg,#2563EB 0%,#2563EB 35%,#10B981 75%,#34D399 100%)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                        }}
                      >
                        Neither Does Your AI Team.
                      </span>
                    </h1>
                  </div>

                  <p className="animate-fade-up delay-300 text-[#475569] text-sm sm:text-base lg:text-lg leading-relaxed max-w-[560px] m-0">
                    Deploy AI Voice Agents and AI Chatbots that handle calls,
                    chats, and more – 24/7. Qualify leads, book appointments,
                    answer questions and delight customers automatically.
                  </p>

                  {/* Buttons - Mobile Optimized */}
                  <div className="mt-4 hero-cta-row flex flex-col gap-4 w-full" style={{ opacity: 1, overflow: "visible" }}>

  {/* Row 1: Buttons */}
  <div className="hero-btn-row flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full" style={{ overflow: "visible" }}>
   <button
      onClick={() => openAuth("register")}
      className="font-bold flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-white"
      style={{
        background: "var(--gg)",
        boxShadow: "0 4px 14px rgba(16,185,129,0.25)",
        minHeight: "48px",
        fontSize: "15px",
      }}
    >
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M13 2L3 14h6l-1 8 10-12h-6l1-8z" />
      </svg>
      Book a Free Demo
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
      </svg>
    </button>

    <button
      onClick={() => openAuth("register")}
      className="font-bold flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl"
      style={{
        background: "#ffffff",
        color: "#0a0a0a",
        border: "1px solid rgba(10,10,10,0.15)",
        minHeight: "48px",
        fontSize: "15px",
      }}
    >
      <span
        className="flex items-center justify-center rounded-full shrink-0"
        style={{ width: "22px", height: "22px", background: "#2563EB" }}
      >
        <svg className="w-3 h-3" fill="white" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
      Watch Live Demo
      
    </button>
  </div>

  {/* Row 2: Avatars + rating */}
  <div className="flex items-center gap-3 flex-wrap w-full">
    <div className="flex -space-x-2 shrink-0">
      {[
        { img: "https://i.pravatar.cc/80?img=11", alt: "Sarah C." },
        { img: "https://i.pravatar.cc/80?img=32", alt: "Michael J." },
        { img: "https://i.pravatar.cc/80?img=47", alt: "Emma R." },
        { img: "https://i.pravatar.cc/80?img=56", alt: "Alex K." },
      ].map((av, i) => (
        <div
          key={i}
          className="w-8 h-8 rounded-full border-2 border-white shadow-sm overflow-hidden"
          style={{ zIndex: 5 - i }}
        >
          <img
            src={av.img}
            alt={av.alt}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      ))}
    </div>
    <div className="flex flex-col gap-0.5 min-w-0">
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, k) => (
          <svg key={k} className="w-4 h-4 shrink-0" style={{ fill: "#f59e0b" }} viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <p className="text-xs text-[#475569] m-0">
        Trusted by{" "}
        <span className="font-semibold text-[var(--text)]">100+</span>{" "}
        businesses
      </p>
    </div>
  </div>
</div>
                </div>

                <div className="mt-4 lg:col-span-5 flex justify-center items-center relative min-h-[380px] sm:min-h-[450px] lg:min-h-[580px] z-10 w-full order-2 lg:order-2 pt-4 lg:pt-0">
                  <div className="absolute top-[20%] left-[20%] w-[320px] h-[320px] rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.16)_0%,transparent_70%)] filter blur-3xl pointer-events-none" />
                  <div className="absolute bottom-[20%] right-[10%] w-[260px] h-[260px] rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.12)_0%,transparent_70%)] filter blur-3xl pointer-events-none" />

                  {/* Phone Mockup - Smaller on mobile */}
                 <div
      className="w-[150px] h-[310px] sm:w-[200px] sm:h-[410px] lg:w-[245px] lg:h-[490px] bg-[#0a0a0a] rounded-[28px] sm:rounded-[36px] lg:rounded-[42px] border-[4px] sm:border-[6px] lg:border-[7px] border-[#1a1a1a] shadow-2xl relative flex flex-col items-center p-2 sm:p-3 select-none"
      style={{
        transform: "perspective(1000px) rotateY(-18deg) rotateX(6deg) rotate(6deg)",
        transformStyle: "flat",
        overflow: "hidden",
      }}
    >
      {/* Notch */}
      <div className="w-20 sm:w-24 h-3 sm:h-4 bg-black rounded-full absolute top-2 sm:top-2.5 z-30" />
      {/* Screen bg */}
      <div className="absolute inset-0 rounded-[28px] sm:rounded-[36px] lg:rounded-[42px] overflow-hidden bg-gradient-to-b from-[#0f0f0f] via-[#0a0a0a] to-[#030303] z-0" />

      <div className="relative z-10 w-full h-full flex flex-col items-center justify-between py-4 sm:py-6">
        {/* Header */}
        <div className="text-center mt-2 sm:mt-3">
          <p className="text-[8px] sm:text-xs text-white/40 font-medium tracking-wide uppercase m-0">
            AI Voice Agent
          </p>
          <p className="text-[8px] sm:text-[10px] text-white/30 font-mono mt-0.5 m-0">
            00:24
          </p>
        </div>

        {/* Orb + Waves */}
        <div
          className="relative flex items-center justify-center"
          style={{ width: "160px", height: "100px" }}
        >
          {/* Rings */}
          <div className="absolute rounded-full border border-cyan-400/20 z-0" style={{ width: "90px", height: "90px" }} />
          <div className="absolute rounded-full border border-cyan-400/10 z-0" style={{ width: "120px", height: "120px" }} />
          <div className="absolute rounded-full border border-cyan-400/[0.06] z-0" style={{ width: "155px", height: "155px" }} />

          {/* BG wave bars — behind orb, z-10 */}
          <div className="absolute inset-0 flex items-center justify-center gap-[2px] z-10 pointer-events-none">
            {WAVE_HEIGHTS.map((baseH, i) => {
              const center = (WAVE_HEIGHTS.length - 1) / 2;
              const dist = Math.abs(i - center);
              const envelope = Math.max(0.15, 1 - (dist / center) * 0.7);
              const h = Math.max(4, baseH * envelope * 0.45);
              return (
                <div
                  key={i}
                  className="rounded-full flex-shrink-0"
                  style={{
                    width: "2px",
                    height: `${h}px`,
                    background: "rgba(34,211,238,0.12)",
                    animation: "bgWaveBounce 1.2s ease-in-out infinite",
                    animationDelay: `${i * 0.045}s`,
                    transformOrigin: "center",
                  }}
                />
              );
            })}
          </div>

          {/* Orb — z-20 */}
          <div
            className="relative z-20 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              width: "64px",
              height: "64px",
              background: "radial-gradient(circle at 35% 35%, #22d3ee, #0ea5e9, #1d4ed8)",
              animation: "orbPulseGlow 3s ease-in-out infinite",
            }}
          >
            <div
              className="absolute rounded-full flex items-center justify-center"
              style={{
                inset: "4px",
                background: "radial-gradient(circle at 35% 35%, #0e7490, #0c4a6e)",
                boxShadow: "inset 0 0 20px rgba(0,0,0,0.5)",
              }}
            >
              <svg width="22" height="22" fill="none" stroke="#22d3ee" strokeWidth="2" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"
                />
              </svg>
            </div>
          </div>

          {/* FG wave bars — in front of orb, z-30, center hidden */}
          <div className="absolute inset-0 flex items-center justify-center gap-[2px] z-30 pointer-events-none">
            {WAVE_HEIGHTS.map((baseH, i) => {
              const center = (WAVE_HEIGHTS.length - 1) / 2;
              const dist = Math.abs(i - center);
              const envelope = Math.max(0.15, 1 - (dist / center) * 0.7);
              // Full height — no * 0.5 reduction, taller bars
              const h = Math.max(5, baseH * envelope);

              if (dist < 7) {
                return (
                  <div
                    key={i}
                    className="flex-shrink-0"
                    style={{ width: "2px", height: `${h}px`, opacity: 0 }}
                  />
                );
              }
              return (
                <div
                  key={i}
                  className="rounded-full flex-shrink-0"
                  style={{
                    width: "2px",
                    height: `${h}px`,
                    background:
                      i % 3 === 0
                        ? "linear-gradient(180deg,#67e8f9,#0891b2)"
                        : i % 3 === 1
                        ? "linear-gradient(180deg,#34d399,#059669)"
                        : "linear-gradient(180deg,#22d3ee,#0e7490)",
                    opacity: 0.65,
                    animation: "waveBounce 1s ease-in-out infinite",
                    animationDelay: `${i * 0.045}s`,
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Controls */}
        <div className="w-full px-2 sm:px-4 space-y-2 sm:space-y-4">
          <div className="grid grid-cols-3 gap-y-2 sm:gap-y-3 text-center">
            {[
              { icon: MicrophoneIcon, label: "Mute" },
              { icon: Squares2X2Icon, label: "Keypad" },
              { icon: SpeakerWaveIcon, label: "Speaker" },
            ].map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <div key={idx} className="flex flex-col items-center">
                  <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-[#141414] border border-slate-700/30 flex items-center justify-center text-white/40">
                    <IconComponent className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5" />
                  </div>
                  <span className="text-[7px] sm:text-[9px] text-white/30 mt-0.5 sm:mt-1">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex justify-center">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/20 cursor-pointer hover:bg-red-600 transition-colors">
              <PhoneIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white transform rotate-[135deg]" />
            </div>
          </div>
        </div>
      </div>
    </div>

                  {/* Floating Cards - Smaller on mobile */}

                  {/* Card 1: Incoming Call - Top Right */}
                  <div className="absolute top-[10%] right-[0%] sm:top-[4%] sm:-right-[8%] z-20 pointer-events-auto w-[100px] sm:w-[185px]">
                    <div className="animate-float-1 bg-[var(--surface)] backdrop-blur-md rounded-lg sm:rounded-2xl p-1.5 sm:p-3.5 shadow-[0_8px_28px_rgba(37,99,235,0.10)] border border-[rgba(37,99,235,0.2)]">
                      <div className="flex justify-between items-center">
                        <span className="text-[6px] sm:text-[10px] font-semibold text-[#2563EB] tracking-wide uppercase">
                          Incoming Call
                        </span>
                        <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-blue-500 animate-pulse" />
                      </div>
                      <div className="mt-0.5 sm:mt-1">
                        <div
                          className="text-[8px] sm:text-xs font-bold text-[var(--text)] m-0 truncate"
                          style={{ color: "#0a0a0a" }}
                        >
                          +1 (415) 555-0178
                        </div>
                        <p className="text-[6px] sm:text-[9px] text-[var(--muted)] m-0 mt-0.5">
                          Sales Inquiry
                        </p>
                      </div>
                      <div className="flex gap-0.5 sm:gap-2 justify-end mt-0.5 sm:mt-1">
                        <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-red-100 flex items-center justify-center cursor-pointer hover:bg-red-200 transition-colors">
                          <span className="text-[5px] sm:text-[9px]">❌</span>
                        </div>
                        <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-green-100 flex items-center justify-center cursor-pointer hover:bg-green-200 transition-colors">
                          <span className="text-[5px] sm:text-[9px]">📞</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Appointment Booked - Bottom Right */}
                  <div className="absolute bottom-[2%] right-[4%] sm:bottom-[16%] sm:-right-[2%] z-20 pointer-events-auto w-[95px] sm:w-[180px]">
                    <div className="animate-float-2 bg-[var(--surface)] backdrop-blur-md rounded-lg sm:rounded-2xl p-1.5 sm:p-3.5 shadow-[0_8px_28px_rgba(37,99,235,0.10)] border border-[rgba(37,99,235,0.2)] flex items-center gap-1.5 sm:gap-3">
                      <div className="w-5 h-5 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-[rgba(37,99,235,0.08)] border border-[rgba(37,99,235,0.2)] flex items-center justify-center text-xs sm:text-lg flex-shrink-0">
                        📅
                      </div>
                      <div className="min-w-0">
                        <div
                          className="text-[7px] sm:text-[11px] font-bold text-[var(--text)] leading-tight m-0 truncate"
                          style={{ color: "#0a0a0a" }}
                        >
                          Appointment Booked
                        </div>
                        <p className="text-[5px] sm:text-[9px] text-[var(--muted)] mt-0.5 m-0">
                          May 24, 2025
                        </p>
                        <p className="text-[5px] sm:text-[9px] text-[#2563EB] font-medium m-0">
                          10:00 AM
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: AI Assistant - Top Left */}
                  <div className="absolute top-[10%] left-[4%] sm:top-[4%] sm:-left-[4%] z-20 pointer-events-auto w-[100px] sm:w-[195px]">
                    <div className="animate-float-3 bg-[var(--surface)] backdrop-blur-md rounded-lg sm:rounded-2xl p-1.5 sm:p-3 shadow-[0_8px_28px_rgba(37,99,235,0.10)] border border-[rgba(37,99,235,0.2)]">
                      <div className="flex items-center gap-1 sm:gap-1.5">
                        <span className="text-[6px] sm:text-[9px] text-[var(--muted)]">
                          🤖 AI Assistant
                        </span>
                      </div>
                      <div className="space-y-0.5 sm:space-y-1.5 mt-0.5 sm:mt-1">
                        <div className="bg-[rgba(37,99,235,0.06)] border border-[rgba(37,99,235,0.12)] text-[var(--text-secondary)] p-1 sm:p-2 rounded-lg sm:rounded-xl rounded-tl-sm text-[6px] sm:text-[10px] leading-relaxed max-w-[90%]">
                          How can I help you today?
                        </div>
                        <div className="flex justify-end">
                          <div
                            className="text-white p-1 sm:p-2 rounded-lg sm:rounded-xl rounded-tr-sm text-[6px] sm:text-[10px] leading-relaxed max-w-[90%]"
                            style={{
                              background:
                                "linear-gradient(135deg,#2563EB,#10B981)",
                            }}
                          >
                            I need help with my order.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 4: Leads Captured - Bottom Left */}
                  <div className="absolute bottom-[2%] left-[4%] sm:bottom-[8%] sm:-left-[4%] z-20 pointer-events-auto w-[100px] sm:w-[185px]">
                    <div className="animate-float-4 bg-[var(--surface)] backdrop-blur-md rounded-lg sm:rounded-2xl p-1.5 sm:p-3.5 shadow-[0_8px_28px_rgba(37,99,235,0.10)] border border-[rgba(37,99,235,0.2)]">
                      <div>
                        <p className="text-[5px] sm:text-[9px] font-semibold text-[var(--muted)] uppercase tracking-wider m-0">
                          Leads Captured
                        </p>
                        <div className="flex items-baseline gap-0.5 sm:gap-1.5 mt-0.5">
                          <span className="text-sm sm:text-lg font-bold text-[var(--text)]">
                            2,847
                          </span>
                          <span className="text-[5px] sm:text-[9px] font-semibold text-[var(--primary)]">
                            +32.6%
                          </span>
                        </div>
                      </div>
                      <div className="h-5 sm:h-10 w-full mt-0.5 sm:mt-1">
                        <svg
                          className="w-full h-full"
                          viewBox="0 0 100 30"
                          preserveAspectRatio="none"
                        >
                          <defs>
                            <linearGradient
                              id="chart-glow"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor="#2563EB"
                                stopOpacity="0.2"
                              />
                              <stop
                                offset="100%"
                                stopColor="#2563EB"
                                stopOpacity="0.0"
                              />
                            </linearGradient>
                          </defs>
                          <path
                            d="M0,25 Q15,22 30,12 T60,18 T90,5 L100,5 L100,30 L0,30 Z"
                            fill="url(#chart-glow)"
                          />
                          <path
                            d="M0,25 Q15,22 30,12 T60,18 T90,5 L100,5"
                            fill="none"
                            stroke="#2563EB"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                          <circle cx="100" cy="5" r="2.5" fill="#2563EB" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Logo marquee inside hero box */}
              <div
                style={{
                  marginTop: 40,
                  paddingTop: 24,
                  borderTop: "1px solid rgba(37,99,235,0.12)",
                }}
              >
                <p
                  className="text-center tag mb-4 sm:mb-6 m-0 text-[10px] sm:text-xs"
                  style={{ color: "#475569", letterSpacing: "0.18em", fontWeight: 500 }}
                >
                  Trusted by leading companies
                </p>
                <div className="relative w-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 w-8 sm:w-16 z-10 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(90deg, #F5F7FA, transparent)",
                    }}
                  />
                  <div
                    className="absolute inset-y-0 right-0 w-8 sm:w-16 z-10 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(270deg, #F5F7FA, transparent)",
                    }}
                  />
                  <div className="flex gap-8 sm:gap-16 items-center animate-marquee opacity-90">
                    {[...Array(2)].flatMap((_, dup) =>
                      [
                        { n: "HealthFirst", c: "#0EA5E9", icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" },
                        { n: "BrightHome", c: "#10B981", icon: "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" },
                        { n: "FastTrack", c: "#F59E0B", icon: "M13 2L3 14h6l-1 8 10-12h-6l1-8z" },
                        { n: "CloudBase", c: "#6366F1", icon: "M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" },
                        { n: "NovaTech", c: "#EC4899", icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" },
                        { n: "ZenithAI", c: "#8B5CF6", icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" },
                      ].map((c, i) => (
                        <div
                          key={`${dup}-${i}`}
                          className="flex items-center gap-2 sm:gap-3 whitespace-nowrap"
                        >
                          <svg className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" viewBox="0 0 24 24" fill={c.c} style={{ opacity: 0.7 }}>
                            <path d={c.icon} />
                          </svg>
                          <span
                            className="text-xs sm:text-sm font-semibold tracking-tight"
                            style={{ color: "#030B2E" }}
                          >
                            {c.n}
                          </span>
                        </div>
                      )),
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
  );
}
