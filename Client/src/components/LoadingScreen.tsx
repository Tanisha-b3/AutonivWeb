const BARS = [0, 1, 2, 3, 4, 5, 6, 7, 8];

export default function AutonivLoadingScreen() {
  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 44,
        background:
          'radial-gradient(900px 500px at 50% 30%, #131a2e 0%, #0b1120 55%, #060912 100%)',
        overflow: 'hidden',
      }}
    >
      {/* Soft single accent glow, low and centered */}
      <div
        style={{
          position: 'absolute',
          bottom: '30%',
          width: 520,
          height: 260,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(99,102,241,0.16) 0%, rgba(139,92,246,0.08) 45%, transparent 72%)',
          filter: 'blur(30px)',
          animation: 'auto-breathe 4s ease-in-out infinite',
        }}
      />

      {/* Logo */}
      <img
        src="/logo-autoniv.png"
        alt="Autoniv"
        style={{
          position: 'relative',
          height: 120,
          width: 'auto',
          objectFit: 'contain',
          animation: 'auto-rise 0.7s cubic-bezier(0.22,1,0.36,1)',
        }}
      />

      {/* Voice equalizer — the product motif */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          height: 48,
        }}
      >
        {BARS.map((i) => {
          // Symmetric height falloff from the center bar
          const distance = Math.abs(i - (BARS.length - 1) / 2);
          const peak = 44 - distance * 5;
          return (
            <span
              key={i}
              style={{
                display: 'block',
                width: 5,
                height: peak,
                borderRadius: 999,
                background: 'linear-gradient(180deg, #818cf8 0%, #8b5cf6 55%, #22c55e 100%)',
                transformOrigin: 'center',
                animation: 'auto-eq 1.1s ease-in-out infinite',
                animationDelay: `${i * 0.09}s`,
                boxShadow: '0 0 12px rgba(139,92,246,0.35)',
              }}
            />
          );
        })}
      </div>

      {/* Label */}
      <span
        style={{
          position: 'relative',
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: 12.5,
          fontWeight: 500,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: 'rgba(148,163,184,0.75)',
          animation: 'auto-fade 0.9s ease',
        }}
      >
        Preparing your workspace
      </span>

      <style>{`
        @keyframes auto-eq {
          0%, 100% { transform: scaleY(0.35); opacity: 0.7; }
          50%      { transform: scaleY(1);    opacity: 1; }
        }
        @keyframes auto-breathe {
          0%, 100% { opacity: 0.6; transform: scale(0.95); }
          50%      { opacity: 1;   transform: scale(1.05); }
        }
        @keyframes auto-rise {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes auto-fade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          img, span, div { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
