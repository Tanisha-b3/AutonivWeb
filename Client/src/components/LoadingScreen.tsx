import { useState, useEffect } from 'react';

const LOGO_SRC = '/logo-autoniv.png';

export default function LoadingScreen() {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-6"
      style={{ background: '#050d1a' }}
    >
      {/* Aurora glow */}
      <div
        style={{
          position: 'absolute',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,119,255,0.08) 0%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />

      {/* Logo */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <img
          src={LOGO_SRC}
          alt="Autoniv"
          style={{
            height: 64,
            width: 'auto',
            objectFit: 'contain',
            animation: 'loaderLogoFloat 3s ease-in-out infinite',
          }}
        />
      </div>

      {/* Spinner ring */}
      <div style={{ position: 'relative', width: 36, height: 36, zIndex: 1 }}>
        <svg
          viewBox="0 0 36 36"
          style={{ width: 36, height: 36, animation: 'loaderSpin 1s linear infinite' }}
        >
          <circle
            cx="18" cy="18" r="15"
            fill="none"
            stroke="rgba(0,119,255,0.12)"
            strokeWidth="3"
          />
          <circle
            cx="18" cy="18" r="15"
            fill="none"
            stroke="url(#loaderGrad)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="70 30"
          />
          <defs>
            <linearGradient id="loaderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00e5a0" />
              <stop offset="50%" stopColor="#00c8b4" />
              <stop offset="100%" stopColor="#0077ff" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Loading text */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 12,
          color: '#1e3a5f',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
        }}
      >
        Loading{dots}
      </div>

      {/* Inline keyframes */}
      <style>{`
        @keyframes loaderSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes loaderLogoFloat {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(-6px); opacity: 0.85; }
        }
      `}</style>
    </div>
  );
}
