'use client';

import { useState, useEffect, useRef } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Particle {
  id: number;
  left: number;
  top: number;
  dx: number;
  duration: number;
  delay: number;
  color: 'cyan' | 'purple';
  opacity: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const COLORS = {
  bg: '#040B18',
  blue: '#0077FF',
  cyan: '#00D4FF',
  emerald: '#00E5A0',
  purple: '#6C63FF',
  white: '#FFFFFF',
  secondary: '#94A3B8',
  muted: '#334155',
  dim: '#1e293b',
} as const;

const STATUS_ITEMS = [
  'Secure Connection Established',
  'AI Models Loading',
  'Preparing Workspace',
] as const;

const PROGRESS_STEPS: [number, number][] = [
  [35, 0],
  [62, 1200],
  [78, 2800],
  [87, 4000],
];

const PARTICLE_SEED: Array<{
  l: number; t: number; dx: number; dur: number; col: 'cyan' | 'purple';
}> = [
  { l: 8,  t: 82, dx: 12,  dur: 7,  col: 'cyan'   },
  { l: 22, t: 68, dx: -18, dur: 9,  col: 'purple'  },
  { l: 40, t: 90, dx: 22,  dur: 8,  col: 'cyan'    },
  { l: 58, t: 75, dx: -10, dur: 11, col: 'cyan'    },
  { l: 74, t: 88, dx: 14,  dur: 6,  col: 'purple'  },
  { l: 88, t: 58, dx: -22, dur: 10, col: 'cyan'    },
  { l: 15, t: 44, dx: 20,  dur: 8,  col: 'purple'  },
  { l: 63, t: 52, dx: -14, dur: 7,  col: 'cyan'    },
  { l: 82, t: 36, dx: 6,   dur: 12, col: 'purple'  },
  { l: 33, t: 60, dx: -8,  dur: 9,  col: 'cyan'    },
  { l: 50, t: 30, dx: 18,  dur: 8,  col: 'purple'  },
  { l: 94, t: 72, dx: -16, dur: 11, col: 'cyan'    },
];

// ─── Hooks ───────────────────────────────────────────────────────────────────

function useAnimatedProgress(
  steps: [number, number][],
  onUpdate: (val: number) => void
) {
  const currentRef = useRef(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    steps.forEach(([target, delay]) => {
      const t = setTimeout(() => {
        const start = currentRef.current;
        const startTime = performance.now();
        const duration = 800;

        function step(now: number) {
          const elapsed = Math.min((now - startTime) / duration, 1);
          const eased = 1 - Math.pow(1 - elapsed, 3);
          const val = Math.round(start + (target - start) * eased);
          onUpdate(val);
          if (elapsed < 1) requestAnimationFrame(step);
          else currentRef.current = target;
        }

        requestAnimationFrame(step);
      }, delay);

      timers.push(t);
    });

    return () => timers.forEach(clearTimeout);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}

function useDots() {
  const [dots, setDots] = useState('');
  useEffect(() => {
    const id = setInterval(
      () => setDots(d => (d.length >= 3 ? '' : d + '.')),
      400
    );
    return () => clearInterval(id);
  }, []);
  return dots;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function AuroraBlob({
  style,
  animDelay,
}: {
  style: React.CSSProperties;
  animDelay: string;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        borderRadius: '50%',
        filter: 'blur(80px)',
        pointerEvents: 'none',
        animation: `autoniv-aurora 12s ease-in-out infinite`,
        animationDelay: animDelay,
        ...style,
      }}
    />
  );
}

function ParticleLayer({ particles }: { particles: Particle[] }) {
  return (
    <>
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            width: 2,
            height: 2,
            borderRadius: '50%',
            background:
              p.color === 'cyan'
                ? `rgba(0,212,255,${p.opacity})`
                : `rgba(108,99,255,${p.opacity})`,
            left: `${p.left}%`,
            top: `${p.top}%`,
            pointerEvents: 'none',
            animation: `autoniv-particle ${p.duration}s linear infinite`,
            animationDelay: `${p.delay}s`,
            ['--dx' as string]: `${p.dx}px`,
          }}
        />
      ))}
    </>
  );
}

function LogoSection() {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Halo */}
      <div
        style={{
          position: 'absolute',
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(0,119,255,0.2) 0%, rgba(0,212,255,0.07) 50%, transparent 70%)`,
          filter: 'blur(16px)',
          animation: 'autoniv-halo 3s ease-in-out infinite',
        }}
      />
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
        }}
      >
        <span
          style={{
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: '-0.5px',
            color: COLORS.white,
            fontFamily: "'Inter', system-ui, sans-serif",
          }}
        >
          auto
          <span
            style={{
              background: `linear-gradient(135deg, ${COLORS.cyan}, ${COLORS.blue})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            niv
          </span>
        </span>
        <span
          style={{
            fontSize: 10,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            letterSpacing: '0.25em',
            color: 'rgba(0,212,255,0.45)',
            textTransform: 'uppercase' as const,
          }}
        >
          Voice AI Platform
        </span>
      </div>
    </div>
  );
}

function SpinnerRing() {
  const WAVE_HEIGHTS = [8, 14, 20, 14, 8];

  return (
    <div style={{ position: 'relative', width: 72, height: 72, flexShrink: 0 }}>
      {/* Glow */}
      <div
        style={{
          position: 'absolute',
          inset: 8,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(0,212,255,0.09) 0%, transparent 70%)`,
          filter: 'blur(4px)',
          animation: 'autoniv-halo 2s ease-in-out infinite',
        }}
      />

      {/* SVG ring */}
      <svg
        viewBox="0 0 72 72"
        width={72}
        height={72}
        style={{ animation: 'autoniv-spin 1.6s linear infinite' }}
      >
        <defs>
          <linearGradient id="autoniv-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor={COLORS.blue}    />
            <stop offset="45%"  stopColor={COLORS.cyan}    />
            <stop offset="100%" stopColor={COLORS.emerald} />
          </linearGradient>
          <filter id="autoniv-ring-glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Track */}
        <circle
          cx={36} cy={36} r={28}
          fill="none"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth={4}
        />
        {/* Arc */}
        <circle
          cx={36} cy={36} r={28}
          fill="none"
          stroke="url(#autoniv-ring-grad)"
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray="90 86"
          filter="url(#autoniv-ring-glow)"
        />
      </svg>

      {/* Waveform */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        {WAVE_HEIGHTS.map((h, i) => (
          <div
            key={i}
            style={{
              width: 3,
              height: h,
              borderRadius: 2,
              background: `linear-gradient(180deg, ${COLORS.cyan}, ${COLORS.blue})`,
              animation: `autoniv-wave 1s ease-in-out infinite`,
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function ProgressBar({
  progress,
}: {
  progress: number;
}) {
  return (
    <div style={{ width: '100%' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}
      >
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            color: COLORS.muted,
            letterSpacing: '0.1em',
            textTransform: 'uppercase' as const,
          }}
        >
          System Boot
        </span>
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            color: COLORS.cyan,
            letterSpacing: '0.05em',
          }}
        >
          {progress}%
        </span>
      </div>

      <div
        style={{
          width: '100%',
          height: 6,
          borderRadius: 999,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.05)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            borderRadius: 999,
            background: `linear-gradient(90deg, ${COLORS.blue} 0%, ${COLORS.cyan} 50%, ${COLORS.emerald} 100%)`,
            boxShadow: `0 0 12px rgba(0,212,255,0.45)`,
            position: 'relative',
            overflow: 'hidden',
            transition: 'width 0.3s ease',
          }}
        >
          {/* Shimmer */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.28) 50%, transparent 100%)',
              animation: 'autoniv-shimmer 2s linear infinite',
            }}
          />
        </div>
      </div>
    </div>
  );
}

function StatusItem({
  label,
  delayMs,
}: {
  label: string;
  delayMs: number;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delayMs);
    return () => clearTimeout(t);
  }, [delayMs]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(-8px)',
        transition: 'opacity 0.45s ease, transform 0.45s ease',
      }}
    >
      {/* Icon circle */}
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.03)',
          border: `1px solid rgba(0,229,160,0.22)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          position: 'relative',
        }}
      >
        {/* Subtle outer glow */}
        <div
          style={{
            position: 'absolute',
            inset: -4,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(0,229,160,0.07) 0%, transparent 70%)`,
            pointerEvents: 'none',
          }}
        />
        {/* Checkmark */}
        <div
          style={{
            width: 9,
            height: 6,
            borderLeft: `1.5px solid ${COLORS.emerald}`,
            borderBottom: `1.5px solid ${COLORS.emerald}`,
            transform: 'rotate(-45deg) translate(0.5px, -0.5px)',
          }}
        />
      </div>

      <span
        style={{
          fontSize: 12,
          color: COLORS.secondary,
          fontFamily: "'Inter', system-ui, sans-serif",
        }}
      >
        {label}
      </span>
    </div>
  );
}

// ─── Keyframes (injected once) ────────────────────────────────────────────────

const KEYFRAMES = `
  @keyframes autoniv-aurora {
    0%,100% { transform: translate(0,0) scale(1); }
    33%      { transform: translate(28px,-18px) scale(1.05); }
    66%      { transform: translate(-18px,14px) scale(0.97); }
  }
  @keyframes autoniv-float {
    0%,100% { transform: translateY(0); }
    50%      { transform: translateY(-6px); }
  }
  @keyframes autoniv-halo {
    0%,100% { opacity: 0.6; transform: scale(1); }
    50%      { opacity: 1;   transform: scale(1.08); }
  }
  @keyframes autoniv-spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes autoniv-wave {
    0%,100% { transform: scaleY(0.4); }
    50%      { transform: scaleY(1); }
  }
  @keyframes autoniv-shimmer {
    from { transform: translateX(-200%); }
    to   { transform: translateX(200%); }
  }
  @keyframes autoniv-particle {
    0%   { transform: translateY(0) translateX(0); opacity: 0; }
    10%  { opacity: 1; }
    90%  { opacity: 0.3; }
    100% { transform: translateY(-280px) translateX(var(--dx,20px)); opacity: 0; }
  }
  @media (prefers-reduced-motion: reduce) {
    *[style*="animation"] { animation: none !important; }
  }
`;

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AutonivLoadingScreen() {
  const [progress, setProgress] = useState(0);
  const dots = useDots();

  useAnimatedProgress(PROGRESS_STEPS, setProgress);

  // Build stable particle list (no random on each render)
  const particles: Particle[] = PARTICLE_SEED.map((p, i) => ({
    id: i,
    left: p.l,
    top: p.t,
    dx: p.dx,
    duration: p.dur,
    delay: -(p.dur * ((i * 0.618) % 1)), // golden-ratio phase spread
    color: p.col,
    opacity: 0.25 + (i % 3) * 0.12,
  }));

  return (
    <>
      <style>{KEYFRAMES}</style>

      <div
        role="status"
        aria-label="Autoniv is initializing"
        style={{
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: COLORS.bg,
          position: 'relative',
          overflow: 'hidden',
          fontFamily: "'Inter', system-ui, sans-serif",
          padding: '24px 16px',
        }}
      >
        {/* Grid overlay */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(0,119,255,0.025) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,119,255,0.025) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            pointerEvents: 'none',
          }}
        />

        {/* Aurora blobs */}
        <AuroraBlob
          style={{
            width: 500, height: 500,
            background: `radial-gradient(circle, rgba(0,119,255,0.13) 0%, transparent 70%)`,
            top: -120, left: -100,
          }}
          animDelay="0s"
        />
        <AuroraBlob
          style={{
            width: 380, height: 380,
            background: `radial-gradient(circle, rgba(0,212,255,0.10) 0%, transparent 70%)`,
            top: 40, right: -100,
          }}
          animDelay="-4s"
        />
        <AuroraBlob
          style={{
            width: 340, height: 340,
            background: `radial-gradient(circle, rgba(108,99,255,0.09) 0%, transparent 70%)`,
            bottom: -80, left: '30%',
          }}
          animDelay="-8s"
        />
        <AuroraBlob
          style={{
            width: 260, height: 260,
            background: `radial-gradient(circle, rgba(0,229,160,0.06) 0%, transparent 70%)`,
            bottom: 40, right: '8%',
          }}
          animDelay="-2s"
        />

        {/* Particles */}
        <ParticleLayer particles={particles} />

        {/* ── Glass card ── */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            width: '100%',
            maxWidth: 440,
            padding: '44px 40px 36px',
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 32,
            boxShadow: `
              0 0 0 1px rgba(0,119,255,0.08),
              0 8px 32px rgba(0,0,0,0.4),
              0 32px 80px rgba(0,0,0,0.3),
              inset 0 1px 0 rgba(255,255,255,0.06)
            `,
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 28,
            animation: 'autoniv-float 6s ease-in-out infinite',
          }}
        >
          <LogoSection />

          <SpinnerRing />

          {/* Headings */}
          <div style={{ textAlign: 'center' }}>
            <h1
              style={{
                fontSize: 20,
                fontWeight: 600,
                color: COLORS.white,
                letterSpacing: '-0.3px',
                lineHeight: 1.2,
                margin: 0,
              }}
            >
              Initializing AI Engine
            </h1>
            <p
              style={{
                fontSize: 13,
                color: '#64748B',
                marginTop: 6,
                lineHeight: 1.5,
              }}
            >
              Preparing your intelligent workspace{dots}
            </p>
          </div>

          <ProgressBar progress={progress} />

          {/* Divider */}
          <div
            style={{
              width: '100%',
              height: 1,
              background:
                'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)',
            }}
          />

          {/* Status items */}
          <div
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            {STATUS_ITEMS.map((label, i) => (
              <StatusItem
                key={label}
                label={label}
                delayMs={[400, 1000, 1800][i]}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          aria-hidden
          style={{
            position: 'relative',
            zIndex: 10,
            marginTop: 28,
            textAlign: 'center',
          }}
        >
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9,
              letterSpacing: '0.2em',
              color: 'rgba(255,255,255,0.07)',
              textTransform: 'uppercase' as const,
            }}
          >
            Intelligent Automation.&nbsp;&nbsp;Limitless Possibilities.
          </span>
        </div>
      </div>
    </>
  );
}