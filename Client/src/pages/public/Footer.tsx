// import AIAssistantChat from '../../components/AIAssistantChat';
import { Link } from 'react-router-dom';
import UnifiedAssistantWidget from '../../components/UnifiedAssistantWidget';

const LOGO_SRC = '/logo-autoniv.png';

const SOCIAL_LINKS = [
  {
    label: 'X (Twitter)',
    href: '#',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.843L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: '#',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href: '#',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
];

const NAV_COLS = [
  {
    heading: 'Product',
    links: [
      { href: '#features', label: 'Features', scroll: true },
      { href: '#contact', label: 'Contact Us', scroll: true },
      { href: '#addons', label: 'Add-Ons', scroll: true },
      { href: '#', label: 'API Docs' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { href: '/about', label: 'About Us' },
      { href: '/careers', label: 'Careers' },
      { href: '/blog', label: 'Blog' },
      { href: '/press', label: 'Press' },
    ],
  },
  {
    heading: 'Support',
    links: [
      { href: '/help', label: 'Help Center' },
      { href: '#contact', label: 'Contact', scroll: true },
      { href: '/privacy', label: 'Privacy Policy' },
      { href: '/terms', label: 'Terms of Service' },
    ],
  },
];

function scrollToSection(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
  e.preventDefault();
  const id = href.replace('#', '');
  const el = document.getElementById(id);
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY - 72;
  window.scrollTo({ top: y, behavior: 'smooth' });
}

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid rgba(0,119,255,0.10)',
        background: 'rgba(4,8,18,0.98)',
      }}
    >
      {/* Main footer body */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-14 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">

          {/* Brand column — spans 2 cols on lg, spans all cols on mobile/tablet stack */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-2">
            <Link to="/" className="inline-block -mb-8 -mx-6 sm:-mx-4 -mt-10 sm:mt-0">
              <img src={LOGO_SRC} alt="Autoniv" style={{ height: 120 }} />
            </Link>
            <p
              style={{
                color: 'rgba(148,175,210,0.75)',
                fontSize: 13.5,
                lineHeight: 1.7,
                maxWidth: 260,
                marginBottom: 20,
              }}
            >
              AI voice agents that handle your calls, capture every lead, and
              scale your business 24/7.
            </p>

            {/* Social icons */}
            <div style={{ display: 'flex', gap: 8 }}>
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(0,119,255,0.07)',
                    border: '1px solid rgba(0,119,255,0.14)',
                    color: 'rgba(148,175,210,0.7)',
                    transition: 'all 0.2s',
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(0,119,255,0.16)';
                    e.currentTarget.style.borderColor = 'rgba(0,119,255,0.35)';
                    e.currentTarget.style.color = '#4da6ff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(0,119,255,0.07)';
                    e.currentTarget.style.borderColor = 'rgba(0,119,255,0.14)';
                    e.currentTarget.style.color = 'rgba(148,175,210,0.7)';
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {NAV_COLS.map((col) => (
            <div key={col.heading}>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'rgba(0,119,255,0.7)',
                  marginBottom: 16,
                }}
              >
                {col.heading}
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {col.links.map(({ href, label, scroll }) => (
                  <li key={label} style={{ marginBottom: 10 }}>
                    {href.startsWith('/') ? (
                      <Link
                        to={href}
                        style={{
                          fontSize: 13.5,
                          color: 'rgba(148,175,210,0.65)',
                          textDecoration: 'none',
                          transition: 'color 0.18s',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'rgba(148,175,210,1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'rgba(148,175,210,0.65)';
                        }}
                      >
                        {label}
                      </Link>
                    ) : (
                      <a
                        href={href}
                        onClick={
                          scroll
                            ? (e) => scrollToSection(e as React.MouseEvent<HTMLAnchorElement>, href)
                            : undefined
                        }
                        style={{
                          fontSize: 13.5,
                          color: 'rgba(148,175,210,0.65)',
                          textDecoration: 'none',
                          transition: 'color 0.18s',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'rgba(148,175,210,1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'rgba(148,175,210,0.65)';
                        }}
                      >
                        {label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Trust badges row */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            marginBottom: 24,
            paddingBottom: 24,
            borderBottom: '1px solid rgba(0,119,255,0.08)',
          }}
        >
          {[
            { icon: '🔒', text: 'SOC 2 Certified' },
            { icon: '🌐', text: '20+ Languages' },
            { icon: '⚡', text: '99.9% Uptime' },
            { icon: '🔗', text: '50+ Integrations' },
          ].map(({ icon, text }) => (
            <span
              key={text}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 12px',
                borderRadius: 20,
                background: 'rgba(0,119,255,0.06)',
                border: '1px solid rgba(0,119,255,0.12)',
                fontSize: 11.5,
                color: 'rgba(148,175,210,0.7)',
                letterSpacing: '0.01em',
              }}
            >
              <span style={{ fontSize: 12 }}>{icon}</span>
              {text}
            </span>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
          }}
        >
          <p
            style={{
              fontSize: 11.5,
              color: 'rgba(148,175,210,0.38)',
              letterSpacing: '0.04em',
              margin: 0,
            }}
          >
            © 2026 Autoniv. All rights reserved.
          </p>
          <p
            style={{
              fontSize: 11.5,
              color: 'rgba(148,175,210,0.38)',
              letterSpacing: '0.04em',
              margin: 0,
            }}
          >
            Built with AI · Powered by Vapi
          </p>
        </div>
      </div>

      {/* Floating chat widget lives here, outside the max-w container */}
      <UnifiedAssistantWidget />
    </footer>
  );
}