import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

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
  const drawerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

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
      // Drawer + the toggle button itself live outside navRef's dropdown flow now,
      // so check the drawer ref directly and ignore clicks on the toggle button.
      const target = e.target as Node;
      if (drawerRef.current && drawerRef.current.contains(target)) return;
      if (navRef.current && navRef.current.contains(target)) return;
      setMobileMenuOpen(false);
    };
    document.addEventListener('mousedown', c);
    return () => document.removeEventListener('mousedown', c);
  }, [mobileMenuOpen]);

  // Close mobile menu on path changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll while the drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [mobileMenuOpen]);

  // Close on Escape
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mobileMenuOpen]);

  const navItems = [
    { label: 'Features', href: '#features', isHash: true },
    { label: 'How It Works', href: '#how-it-works', isHash: true },
    { label: 'Agents', href: '/agents' },
    { label: 'Case Studies', href: '/case-studies' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'News', href: '/news' },
    { label: 'Add-Ons', href: '#addons', isHash: true },
    { label: 'Contact', href: '#contact', isHash: true },
    {label:"About", href:"/about"}
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, item: typeof navItems[0]) => {
    if (item.isHash) {
      e.preventDefault();
      const targetId = item.href.replace('#', '');
      if (location.pathname === '/') {
        const el = document.getElementById(targetId);
        if (el) {
          const y = el.getBoundingClientRect().top + window.scrollY - 72;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      } else {
        navigate('/');
        setTimeout(() => {
          const el = document.getElementById(targetId);
          if (el) {
            const y = el.getBoundingClientRect().top + window.scrollY - 72;
            window.scrollTo({ top: y, behavior: 'smooth' });
          }
        }, 150);
      }
    }
  };

  return (
    <>
      <nav
        ref={navRef}
        className={` fixed top-[36px] inset-x-0 z-50 transition-all duration-300${scrolled ? ' shadow-md' : ''}`}
        style={{
          marginTop: 0,
          background: scrolled ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(37,99,235,0.12)',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-6 h-[64px] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img src={LOGO_SRC} alt="Autoniv" className="-ml-8 sm:-ml-6 h-40 sm:h-40 md:h-30 w-auto" />
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
              className="px-5 py-2 text-sm font-semibold rounded-lg transition-all"
              style={{
                color: '#475569',
                cursor: 'pointer',
                border: '1px solid rgba(37,99,235,0.15)',
                background: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#2563EB';
                e.currentTarget.style.borderColor = 'rgba(37,99,235,0.35)';
                e.currentTarget.style.background = 'rgba(37,99,235,0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#475569';
                e.currentTarget.style.borderColor = 'rgba(37,99,235,0.15)';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              Sign In
            </button>
            <MagBtn
              onClick={() => openAuth('register')}
              className="font-bold text-white cursor-pointer"
              style={{
                background: 'var(--gg)',
                boxShadow: '0 4px 14px rgba(16,185,129,0.25)',
                borderRadius: 10,
                padding: '10px 20px',
                border: 'none',
                fontSize: '14px',
              }}
            >
              Get Started Free
            </MagBtn>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
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
      </nav>

      {/* Backdrop overlay for the slide-in drawer */}
      <div
        onClick={() => setMobileMenuOpen(false)}
        className="lg:hidden fixed inset-0 z-[55] transition-opacity duration-300"
        style={{
          background: 'rgba(15,23,42,0.45)',
          opacity: mobileMenuOpen ? 1 : 0,
          pointerEvents: mobileMenuOpen ? 'auto' : 'none',
        }}
        aria-hidden={!mobileMenuOpen}
      />

      {/* Slide-in side drawer */}
      <div
        ref={drawerRef}
        className="lg:hidden mt-9 fixed top-0 right-0 h-full z-[100] flex flex-col"
        style={{
          width: 'min(82vw, 340px)',
          background: 'rgba(255,255,255,0.98)',
          backdropFilter: 'blur(24px)',
          borderLeft: '1px solid rgba(37,99,235,0.12)',
          boxShadow: mobileMenuOpen ? '-12px 0 32px rgba(0,0,0,0.12)' : 'none',
          transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform .32s cubic-bezier(.23,1,.32,1)',
        }}
        role="dialog"
        aria-modal="true"
        aria-hidden={!mobileMenuOpen}
      >
        <div className="flex items-center justify-between px-5 h-[64px]" style={{ borderBottom: '1px solid rgba(37,99,235,0.10)' }}>
          <Link
            to="/"
            className="flex items-center gap-2"
            onClick={() => {
              setMobileMenuOpen(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <img src={LOGO_SRC} alt="Autoniv" className="h-30 w-auto" />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
            className="p-2 rounded-lg"
            style={{ color: '#475569', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1">
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
        </div>

        <div className="px-5 py-5 mb-10 space-y-2" style={{ borderTop: '1px solid rgba(37,99,235,0.10)' }}>
          <button
            onClick={() => {
              openAuth('login');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left px-4 py-3 text-sm font-semibold rounded-xl"
            style={{
              color: '#475569',
              background: 'none',
              border: '1px solid rgba(37,99,235,0.15)',
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
            className="block w-full text-center font-bold text-white px-4 py-3 rounded-xl"
            style={{
              background: 'var(--gg)',
              boxShadow: '0 4px 14px rgba(16,185,129,0.25)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Get Started Free
          </button>
        </div>
      </div>

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