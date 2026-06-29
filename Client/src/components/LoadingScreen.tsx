export default function AutonivLoadingScreen() {
  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000000',
        gap: 28,
      }}
    >
      <img
        src="/logo-autoniv.png"
        alt="Autoniv"
        style={{ height: 100, width: 'auto', objectFit: 'contain' }}
      />

      <div
        style={{
          width: 36,
          height: 36,
          border: '3px solid rgba(255,255,255,0.1)',
          borderTopColor: '#10B981',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }}
      />

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
