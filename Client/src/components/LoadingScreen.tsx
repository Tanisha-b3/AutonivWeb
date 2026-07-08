import { useEffect, useState } from 'react';

const STATUS_MESSAGES = [
  'Warming up your workspace',
  'Syncing your agents',
  'Loading your dashboard',
  'Almost there',
];

export default function AutonivLoadingScreen() {
  const particles = [0, 1, 2, 3, 4, 5];
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setMsgIndex((i) => (i + 1) % STATUS_MESSAGES.length);
    }, 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          'radial-gradient(1200px 600px at 50% -10%, #1e1b4b 0%, #0f172a 45%, #020617 100%)',
        overflow: 'hidden',
      }}
    >
      {/* Fine grid texture */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(99,102,241,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.05) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
          maskImage: 'radial-gradient(circle at 50% 42%, black 0%, transparent 62%)',
          WebkitMaskImage: 'radial-gradient(circle at 50% 42%, black 0%, transparent 62%)',
        }}
      />

      {/* Drifting aurora blobs */}
      <div
        style={{
          position: 'absolute',
          top: '18%',
          left: '22%',
          width: 360,
          height: 360,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.20), transparent 70%)',
          filter: 'blur(40px)',
          animation: 'auto-drift-a 9s ease-in-out infinite',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '16%',
          right: '20%',
          width: 320,
          height: 320,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(34,197,94,0.16), transparent 70%)',
          filter: 'blur(40px)',
          animation: 'auto-drift-b 11s ease-in-out infinite',
        }}
      />

      {/* Glass card */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 30,
          padding: '52px 60px',
          borderRadius: 28,
          background: 'rgba(15,23,42,0.55)',
          border: '1px solid rgba(148,163,184,0.14)',
          boxShadow:
            '0 30px 80px -20px rgba(2,6,23,0.8), inset 0 1px 0 rgba(255,255,255,0.05)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        {/* Ambient glow behind the mark */}
        <div
          style={{
            position: 'absolute',
            top: 10,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(99,102,241,0.22) 0%, rgba(139,92,246,0.12) 40%, transparent 70%)',
            filter: 'blur(20px)',
            animation: 'auto-glow 3.2s ease-in-out infinite',
          }}
        />

        {/* Brand mark: conic sweep + gradient ring + particles */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 150,
            height: 150,
          }}
        >
          {/* Conic sweep */}
          <div
            style={{
              position: 'absolute',
              width: 150,
              height: 150,
              borderRadius: '50%',
              background:
                'conic-gradient(from 0deg, transparent 0deg, rgba(139,92,246,0.35) 60deg, transparent 130deg)',
              animation: 'auto-spin 2.4s linear infinite',
              maskImage: 'radial-gradient(circle, transparent 60%, black 62%, black 100%)',
              WebkitMaskImage:
                'radial-gradient(circle, transparent 60%, black 62%, black 100%)',
            }}
          />

          {/* Orbiting particles */}
          {particles.map((i) => (
            <span
              key={i}
              style={{
                position: 'absolute',
                width: 150,
                height: 150,
                animation: `auto-orbit 3.4s linear infinite`,
                animationDelay: `${(-3.4 / particles.length) * i}s`,
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: -2,
                  left: '50%',
                  width: 5,
                  height: 5,
                  marginLeft: -2.5,
                  borderRadius: '50%',
                  background: i % 2 === 0 ? '#8b5cf6' : '#22c55e',
                  boxShadow: `0 0 8px ${i % 2 === 0 ? '#8b5cf6' : '#22c55e'}`,
                  opacity: 0.85,
                }}
              />
            </span>
          ))}

          {/* Dual gradient ring */}
          <svg
            width="150"
            height="150"
            viewBox="0 0 150 150"
            style={{ position: 'absolute', animation: 'auto-spin 1.15s linear infinite' }}
          >
            <defs>
              <linearGradient id="auto-ring" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>
            </defs>
            <circle
              cx="75"
              cy="75"
              r="68"
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="3"
            />
            <circle
              cx="75"
              cy="75"
              r="68"
              fill="none"
              stroke="url(#auto-ring)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="170 427"
            />
          </svg>

          <img
            src="/logo-autoniv.png"
            alt="Autoniv"
            style={{
              height: 72,
              width: 'auto',
              objectFit: 'contain',
              animation: 'auto-pulse 2s ease-in-out infinite',
            }}
          />
        </div>

        {/* Cycling status + shimmer bar */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <span
            key={msgIndex}
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 14,
              fontWeight: 500,
              letterSpacing: '0.02em',
              color: 'rgba(226,232,240,0.85)',
              minHeight: 20,
              animation: 'auto-fade 0.5s ease',
            }}
          >
            {STATUS_MESSAGES[msgIndex]}
            <span style={{ display: 'inline-flex', width: 18, justifyContent: 'flex-start' }}>
              <span style={{ animation: 'auto-dot 1.4s infinite', animationDelay: '0s' }}>.</span>
              <span style={{ animation: 'auto-dot 1.4s infinite', animationDelay: '0.2s' }}>.</span>
              <span style={{ animation: 'auto-dot 1.4s infinite', animationDelay: '0.4s' }}>.</span>
            </span>
          </span>
          <div
            style={{
              width: 200,
              height: 3,
              borderRadius: 999,
              background: 'rgba(255,255,255,0.08)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: '40%',
                height: '100%',
                borderRadius: 999,
                background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #22c55e)',
                animation: 'auto-slide 1.4s ease-in-out infinite',
              }}
            />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes auto-spin { to { transform: rotate(360deg); } }
        @keyframes auto-orbit { to { transform: rotate(360deg); } }
        @keyframes auto-pulse {
          0%, 100% { transform: scale(1); opacity: 0.92; }
          50% { transform: scale(1.06); opacity: 1; }
        }
        @keyframes auto-glow {
          0%, 100% { opacity: 0.6; transform: scale(0.96); }
          50% { opacity: 1; transform: scale(1.04); }
        }
        @keyframes auto-slide {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(370%); }
        }
        @keyframes auto-dot {
          0%, 60%, 100% { opacity: 0.2; }
          30% { opacity: 1; }
        }
        @keyframes auto-fade {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes auto-drift-a {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(30px, -24px); }
        }
        @keyframes auto-drift-b {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-28px, 22px); }
        }
        @media (prefers-reduced-motion: reduce) {
          svg, img, span, div { animation-duration: 0.001ms !important; animation-iteration-count: 1 !important; }
        }
      `}</style>
    </div>
  );
}
