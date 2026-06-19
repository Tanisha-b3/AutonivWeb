import { Link } from 'react-router-dom';

const TEAM = [
  { name: 'Founder & CEO', initials: 'AI', role: 'Building the future of voice AI' },
];

const VALUES = [
  { icon: '🎯', title: 'Customer First', desc: 'Every feature we build starts with the question: will this make our customers more successful?' },
  { icon: '🚀', title: 'Move Fast', desc: 'We ship weekly, iterate daily, and never let perfection get in the way of progress.' },
  { icon: '🤝', title: 'Trust & Transparency', desc: 'We earn trust through honest communication, reliable service, and clear pricing.' },
  { icon: '🌍', title: 'Global Mindset', desc: 'We serve businesses worldwide and design for every language, culture, and market.' },
];

const MILESTONES = [
  { year: '2024', event: 'Autoniv founded with a vision to democratize AI voice technology.' },
  { year: '2025', event: 'Launched support for 20+ languages and 100+ voices.' },
  { year: '2026', event: 'Serving businesses across 50+ countries with enterprise-grade AI agents.' },
];

export function AboutUs() {
  return (
    <div className="min-h-screen" style={{ background: '#050d1a' }}>
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-16">

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <h1 style={{ color: '#e8f8ff', fontSize: 36, fontWeight: 700, marginBottom: 16 }}>About Autoniv</h1>
          <p style={{ color: 'rgba(148,175,210,0.7)', fontSize: 16, lineHeight: 1.7, maxWidth: 600, margin: '0 auto' }}>
            We're on a mission to make AI voice technology accessible to every business.
            No code. No complexity. Just powerful agents that work.
          </p>
        </div>

        {/* Mission */}
        <section style={{ marginBottom: 64 }}>
          <h2 style={{ color: '#0077ff', fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Our Mission</h2>
          <p style={{ color: 'rgba(148,175,210,0.8)', fontSize: 15, lineHeight: 1.8, marginBottom: 16 }}>
            Every business deserves access to intelligent voice assistants. Autoniv eliminates the technical barriers
            so you can deploy AI agents that handle calls, qualify leads, and delight customers — without writing a single line of code.
          </p>
          <p style={{ color: 'rgba(148,175,210,0.65)', fontSize: 14.5, lineHeight: 1.7 }}>
            We believe the future of business communication is conversational, intelligent, and available 24/7.
            Autoniv makes that future available today.
          </p>
        </section>

        {/* Values */}
        <section style={{ marginBottom: 64 }}>
          <h2 style={{ color: '#0077ff', fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 20 }}>Our Values</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {VALUES.map(v => (
              <div key={v.title} style={{
                padding: 24,
                borderRadius: 14,
                border: '1px solid rgba(0,119,255,0.12)',
                background: 'rgba(6,18,36,0.5)',
              }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{v.icon}</div>
                <h3 style={{ color: '#e8f8ff', fontSize: 15, fontWeight: 600, marginBottom: 8 }}>{v.title}</h3>
                <p style={{ color: 'rgba(148,175,210,0.65)', fontSize: 13.5, lineHeight: 1.6, margin: 0 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section style={{ marginBottom: 64 }}>
          <h2 style={{ color: '#0077ff', fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 20 }}>Our Journey</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {MILESTONES.map(m => (
              <div key={m.year} style={{
                display: 'flex',
                gap: 16,
                padding: 20,
                borderRadius: 12,
                border: '1px solid rgba(0,119,255,0.1)',
                background: 'rgba(6,18,36,0.4)',
              }}>
                <span style={{ color: '#00e5a0', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>{m.year}</span>
                <p style={{ color: 'rgba(148,175,210,0.75)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>{m.event}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section style={{ marginBottom: 64 }}>
          <h2 style={{ color: '#0077ff', fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 20 }}>Team</h2>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {TEAM.map(t => (
              <div key={t.name} style={{
                padding: 24,
                borderRadius: 14,
                border: '1px solid rgba(0,119,255,0.12)',
                background: 'rgba(6,18,36,0.5)',
                flex: '1 1 200px',
                textAlign: 'center',
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0077ff, #00c8b4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 12px', color: '#fff', fontSize: 18, fontWeight: 700,
                }}>{t.initials}</div>
                <h3 style={{ color: '#e8f8ff', fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{t.name}</h3>
                <p style={{ color: 'rgba(148,175,210,0.6)', fontSize: 13, margin: 0 }}>{t.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div style={{
          textAlign: 'center', padding: 40, borderRadius: 16,
          border: '1px solid rgba(0,119,255,0.15)', background: 'rgba(0,119,255,0.04)',
        }}>
          <h3 style={{ color: '#e8f8ff', fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Join Us</h3>
          <p style={{ color: 'rgba(148,175,210,0.65)', fontSize: 14, marginBottom: 20 }}>
            We're building the future of voice AI. Come be part of it.
          </p>
          <Link to="/careers" style={{
            display: 'inline-block', padding: '10px 24px', borderRadius: 10,
            background: 'linear-gradient(135deg, #0077ff, #00c8b4)',
            color: '#fff', fontSize: 14, fontWeight: 600, textDecoration: 'none',
          }}>View Open Roles</Link>
        </div>

      </div>
    </div>
  );
}

export default AboutUs;
