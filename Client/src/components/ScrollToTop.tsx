import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const { pathname } = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 left-6 z-50 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
      style={{
        background: 'rgba(16,185,129,0.9)',
        boxShadow: '0 4px 20px rgba(16,185,129,0.35)',
        border: 'none',
        cursor: 'pointer',
      }}
      aria-label="Scroll to top"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="18 15 12 9 6 15" />
      </svg>
    </button>
  );
}
