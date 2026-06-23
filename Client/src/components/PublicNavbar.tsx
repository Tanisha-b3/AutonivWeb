import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { Link, useLocation } from 'react-router-dom';

const AuthDialog = lazy(() =>
  import('../pages/public/AuthDialog').then((m) => ({ default: m.AuthDialog }))
);

const LOGO_SRC = '/autoniv.webp';

// Magnetic Button component
function MagBtn({
  children,
  className,
  to,
  onClick,
  style,
}: {
  children: React.ReactNode;
  className: string;
  to?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.35}px,${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = 'none';
  };
  const inner = to ? (
    <Link to={to} className={className} style={style}>
      {children}
    </Link>
  ) : (
    <button onClick={onClick} className={className} style={style}>
      {children}
    </button>
  );
  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        transition: 'transform .28s cubic-bezier(.23,1,.32,1)',
        display: 'inline-block',
      }}
    >
      {inner}
    </div>
  );
}

export function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authDialog, setAuthDialog] = useState<'login' | 'register' | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const navRef = useRef<HTMLElement>(null);
  const location = useLocation();

  const openAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setAuthDialog(mode);
  };
  const closeAuth = () => setAuthDialog(null);

  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', f, { passive: true });
    return () => window.removeEventListener('scroll', f);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const c = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node))
        setMobileMenuOpen(false);
    };
    document.addEventListener('mousedown', c);
    return () => document.removeEventListener('mousedown', c);
  }, [mobileMenuOpen]);

  // Close mobile menu on path changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navItems = [
    { label: 'Features', href: '#features', isHash: true },
    { label: 'How It Works', href: '#how-it-works', isHash: true },
    { label: 'Agents', href: '/agents' },
    { label: 'Case Studies', href: '/case-studies' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'News', href: '/news' },
    { label: 'Add-Ons', href: '#addons', isHash: true },
    { label: 'Contact', href: '#contact', isHash: true },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, item: typeof navItems[0]) => {
    if (item.isHash) {
      if (location.pathname === '/') {
        e.preventDefault();
        const el = document.getElementById(item.href.replace('#', ''));
        if (el) {
          const y = el.getBoundingClientRect().top + window.scrollY - 72;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }
    }
  };

  return (
    <>
      <nav
        ref={navRef}
        className={`mt-9 fixed top-0 inset-x-0 z-50 transition-all duration-300 nav-glass${scrolled ? ' scrolled' : ''}`}
      >
        <div className="max-w-7xl mx-auto px-2 sm:px-4 h-[68px] flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src={LOGO_SRC} alt="Autoniv" className="logo-img animate-fade-in-up" />
          </Link>
          <div className="hidden lg:flex items-center gap-5 xl:gap-7">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.isHash ? `/${item.href}` : item.href}
                onClick={(e) => handleNavClick(e, item)}
                className="text-sm font-semibold transition-colors relative py-1"
                style={{
                  color: (!item.isHash && location.pathname === item.href) ? '#2563EB' : '#475569',
                }}
                onMouseEnter={(e) => {
                  if (item.isHash || location.pathname !== item.href) {
                    e.currentTarget.style.color = '#0a0a0a';
                  }
                }}
                onMouseLeave={(e) => {
                  if (item.isHash || location.pathname !== item.href) {
                    e.currentTarget.style.color = '#475569';
                  }
                }}
              >
                {item.label}
                {!item.isHash && location.pathname === item.href && (
                  <span
                    className="absolute -bottom-[20px] left-0 right-0 h-[2px]"
                    style={{
                      background: 'linear-gradient(90deg, #2563EB, #10B981)',
                    }}
                  />
                )}
              </Link>
            ))}
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => openAuth('login')}
              className="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
              style={{ color: '#475569', cursor: 'pointer' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#0a0a0a';
                e.currentTarget.style.background = 'rgba(37,99,235,.07)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#475569';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              Sign In
            </button>
            <MagBtn
              onClick={() => openAuth('register')}
              className="btn-responsive font-bold text-white cursor-pointer"
              style={{
                background: 'var(--gg)',
                boxShadow: '0 4px 14px rgba(16,185,129,0.25)',
                borderRadius: 9999,
                padding: '10px 18px',
                border: 'none',
              }}
            >
              Get Started Free
            </MagBtn>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2"
            style={{
              color: '#475569',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
        {mobileMenuOpen && (
          <div
            className="lg:hidden px-5 py-4 space-y-1"
            style={{
              background: 'rgba(255,255,255,.98)',
              backdropFilter: 'blur(20px)',
              borderTop: '1px solid rgba(37,99,235,.10)',
            }}
          >
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.isHash ? `/${item.href}` : item.href}
                onClick={(e) => {
                  handleNavClick(e, item);
                  setMobileMenuOpen(false);
                }}
                className="block px-4 py-3 text-sm font-semibold rounded-xl"
                style={{
                  color: (!item.isHash && location.pathname === item.href) ? '#2563EB' : '#475569',
                  background: (!item.isHash && location.pathname === item.href) ? 'rgba(37,99,235,.07)' : 'transparent',
                }}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-2 space-y-2">
              <button
                onClick={() => {
                  openAuth('login');
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-3 text-sm font-semibold rounded-xl"
                style={{
                  color: '#475569',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  openAuth('register');
                  setMobileMenuOpen(false);
                }}
                className="btn-responsive block w-full text-center font-bold text-white"
                style={{
                  background: 'var(--gg)',
                  boxShadow: '0 4px 14px rgba(16,185,129,0.25)',
                  borderRadius: 12,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Get Started Free
              </button>
            </div>
          </div>
        )}
      </nav>

      <Suspense fallback={null}>
        <AuthDialog
          isOpen={authDialog !== null}
          mode={authMode}
          onClose={closeAuth}
          onSwitch={(m) => {
            setAuthMode(m === 'forgot_password' || m === 'reset_password' ? 'login' : m);
            setAuthDialog(m === 'forgot_password' || m === 'reset_password' ? 'login' : m);
          }}
        />
      </Suspense>
    </>
  );
}

export default PublicNavbar;
