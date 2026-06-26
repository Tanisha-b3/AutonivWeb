import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const AuthDialog = lazy(() =>
  import('../pages/public/AuthDialog').then((m) => ({ default: m.AuthDialog }))
);

const LOGO_SRC = '/autoniv.webp';

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
      style={{ transition: 'transform .28s cubic-bezier(.23,1,.32,1)', display: 'inline-block' }}
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

  const navItems = [
     { label: 'How It Works', href: '#how-it-works', isHash: true },
    { label: 'Features', href: '#features', isHash: true },
    { label: 'Services', href: '/services' },
    { label: 'Case Studies', href: '/case-studies' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'News', href: '/news' },
    // { label: 'Add-Ons', href: '#addons', isHash: true },
    { label: 'Contact', href: '#contact', isHash: true },
    { label: 'AboutUs', href: '/about' },
  ];

  const [selectedLabel, setSelectedLabel] = useState<string | null>(() => {
    const match = navItems.find((i) => !i.isHash && i.href === location.pathname);
    return match ? match.label : null;
  });

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
      const target = e.target as Node;
      if (drawerRef.current?.contains(target)) return;
      if (navRef.current?.contains(target)) return;
      setMobileMenuOpen(false);
    };
    document.addEventListener('mousedown', c);
    return () => document.removeEventListener('mousedown', c);
  }, [mobileMenuOpen]);

  useEffect(() => {
    setMobileMenuOpen(false);
    if (!location.hash) {
      const match = navItems.find((i) => !i.isHash && i.href === location.pathname);
      if (match) setSelectedLabel(match.label);
      else if (location.pathname === '/') setSelectedLabel(null);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (mobileMenuOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mobileMenuOpen]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, item: typeof navItems[0]) => {
    setSelectedLabel(item.label);
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
        const retry = (count: number) => {
          const el = document.getElementById(targetId);
          if (el) {
            const y = el.getBoundingClientRect().top + window.scrollY - 72;
            window.scrollTo({ top: y, behavior: 'smooth' });
          } else if (count < 30) {
            setTimeout(() => retry(count + 1), 100);
          }
        };
        setTimeout(() => retry(0), 100);
      }
    }
  };

  return (
    <>
      {/* Top announcement bar placeholder offset */}
      <nav
        ref={navRef}
        className="fixed top-9 inset-x-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(37,99,235,0.12)',
          boxShadow: scrolled ? '0 2px 16px rgba(0,0,0,0.08)' : 'none',
        }}
      >
        <div className=" max-w-7xl mx-auto px-4 sm:px-0 lg:px-0 h-14 sm:h-16 flex items-center justify-between gap-3">

          {/* Logo */}
          <Link
            to="/"
            className="flex-shrink-0 flex items-center"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Autoniv home"
          >
            <img
              src={LOGO_SRC}
              alt="Autoniv"
              className="-ml-6 h-40 sm:h-40 md:h-40 w-auto object-contain"
            />
          </Link>

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center gap-1  flex-1 justify-center">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.isHash ? `/${item.href}` : item.href}
                onClick={(e) => handleNavClick(e, item)}
                className="relative px-2 xl:px-3 py-1 text-xs xl:text-sm font-semibold transition-colors duration-150 whitespace-nowrap rounded"
                style={{ color: '#475569' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#0a0a0a'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#475569'; }}
              >
                {item.label}
                {selectedLabel === item.label && (
                  <span
                    className="absolute -bottom-[18px] left-0 right-0 h-[2px] rounded-full"
                    style={{ background: 'linear-gradient(90deg, #2563EB, #10B981)' }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Desktop CTA buttons */}
          <div className=" hidden sm:flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => openAuth('login')}
              className="min-h-[44px] px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-150 whitespace-nowrap"
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
              className="font-bold text-white cursor-pointer whitespace-nowrap"
              style={{
                background: 'var(--gg)',
                boxShadow: '0 4px 14px rgba(16,185,129,0.25)',
                borderRadius: 10,
                padding: '10px 16px',
                border: 'none',
                fontSize: '13px',
                minHeight: '44px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              Get Started Free
            </MagBtn>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden flex items-center justify-center w-11 h-11 rounded-lg flex-shrink-0"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            style={{
              color: '#475569',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Backdrop */}
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

      {/* Slide-in drawer */}
      <div
        ref={drawerRef}
        className="mt-9.5 lg:hidden fixed top-0 right-0 h-full z-[100] flex flex-col"
        style={{
          width: 'min(85vw, 320px)',
          background: 'rgba(255,255,255,0.99)',
          backdropFilter: 'blur(24px)',
          borderLeft: '1px solid rgba(37,99,235,0.12)',
          boxShadow: mobileMenuOpen ? '-12px 0 40px rgba(0,0,0,0.14)' : 'none',
          transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform .32s cubic-bezier(.23,1,.32,1)',
          willChange: 'transform',
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        aria-hidden={!mobileMenuOpen}
      >
        {/* Drawer header */}
        <div
          className="flex items-center justify-between px-4 h-14 sm:h-16 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(37,99,235,0.10)' }}
        >
          <Link
            to="/"
            className="-ml-8 flex items-center"
            onClick={() => {
              setMobileMenuOpen(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            aria-label="Autoniv home"
          >
            <img src={LOGO_SRC} alt="Autoniv" className="h-30 sm:h-30 w-auto object-contain" />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
            className="flex items-center justify-center w-11 h-11 rounded-lg"
            style={{ color: '#475569', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Drawer nav items */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5" aria-label="Mobile navigation">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.isHash ? `/${item.href}` : item.href}
              onClick={(e) => {
                handleNavClick(e, item);
                setMobileMenuOpen(false);
              }}
              className="flex items-center min-h-[48px] px-4 py-3 text-sm font-semibold rounded-xl transition-colors duration-150"
              style={{
                color: selectedLabel === item.label ? '#2563EB' : '#475569',
                background: selectedLabel === item.label ? 'rgba(37,99,235,0.06)' : 'transparent',
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Drawer footer CTAs */}
        <div
          className="mb-10 px-4 py-4 space-y-2 flex-shrink-0"
          style={{ borderTop: '1px solid rgba(37,99,235,0.10)' }}
        >
          <button
            onClick={() => {
              openAuth('login');
              setMobileMenuOpen(false);
            }}
            className="flex items-center justify-center w-full min-h-[48px] px-4 py-3 text-sm font-semibold rounded-xl transition-colors duration-150"
            style={{
              color: '#475569',
              background: 'none',
              border: '1px solid rgba(37,99,235,0.18)',
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
            className="flex items-center justify-center w-full min-h-[48px] px-4 py-3 text-sm font-bold text-white rounded-xl transition-opacity duration-150 hover:opacity-90"
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