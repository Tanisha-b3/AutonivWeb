import { useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from './Footer';
import ScrollToTop from '../../components/ScrollToTop';
import { Nav } from './CaseStudies';
import { USPSlider } from './sections/USPSlider';

const LOGO_SRC = '/autoniv.webp';

/* ─── USP Slider ─── */


/* ─── Nav ─── */


/* ─── FAQ Item ─── */
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        background: '#fff',
        border: `1.5px solid ${open ? 'rgba(37,99,235,0.25)' : 'rgba(0,0,0,0.07)'}`,
        boxShadow: open ? '0 4px 24px rgba(37,99,235,0.08)' : '0 1px 4px rgba(0,0,0,0.04)',
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left cursor-pointer"
        style={{ background: 'none', border: 'none' }}
      >
        <span className="text-sm sm:text-base font-semibold" style={{ color: '#0f172a' }}>{question}</span>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: open ? 'linear-gradient(135deg,#2563EB,#10B981)' : 'rgba(0,0,0,0.05)',
            transition: 'all 0.3s',
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}
          >
            <path d="M2 4.5L6 8.5L10 4.5" stroke={open ? '#fff' : '#64748b'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </button>
      {open && (
        <div className="px-6 pb-5" style={{ borderTop: '1px solid rgba(37,99,235,0.07)' }}>
          <p className="text-sm leading-relaxed pt-4" style={{ color: '#64748b' }}>
            {answer}
          </p>
        </div>
      )}
    </div>
  );
}

/* ─── Stats Card ─── */
function StatCard({ value, label, description }: { value: string; label: string; description: string }) {
  return (
    <div
      className="p-6 rounded-2xl text-center transition-all duration-300 hover:-translate-y-1"
      style={{
        background: '#fff',
        border: '1px solid rgba(0,0,0,0.07)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
      }}
    >
      <div
        className="text-4xl sm:text-5xl font-black mb-2 tracking-tight"
        style={{
          background: 'linear-gradient(135deg,#2563EB,#10B981)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        {value}
      </div>
      <div className="text-sm font-bold mb-0.5" style={{ color: '#0f172a' }}>{label}</div>
      <div className="text-xs" style={{ color: '#94a3b8' }}>{description}</div>
    </div>
  );
}

/* ─── Value Card ─── */
function ValueCard({ icon, title, description, accent }: { icon: string; title: string; description: string; accent: string }) {
  return (
    <div
      className="p-7 rounded-2xl transition-all duration-300 group hover:-translate-y-1 relative overflow-hidden"
      style={{
        background: '#fff',
        border: '1px solid rgba(0,0,0,0.07)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: `${accent}14`,
          border: `1px solid ${accent}28`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 20,
          marginBottom: 16,
        }}
      >
        {icon}
      </div>
      <h3 className="text-base font-bold mb-2" style={{ color: '#0f172a' }}>{title}</h3>
      <p className="text-sm leading-relaxed" style={{ color: '#64748b' }}>{description}</p>
    </div>
  );
}

/* ─── Step ─── */
function Step({ number, title, description, last }: { number: string; title: string; description: string; last?: boolean }) {
  return (
    <div className="flex gap-5">
      <div className="flex flex-col items-center">
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: 'linear-gradient(135deg,#2563EB,#10B981)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 13,
            fontWeight: 700,
            color: '#fff',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
          }}
        >
          {number}
        </div>
        {!last && (
          <div style={{ width: 1, flex: 1, background: 'linear-gradient(to bottom,rgba(37,99,235,0.20),transparent)', minHeight: 40, marginTop: 6 }} />
        )}
      </div>
      <div style={{ paddingBottom: last ? 0 : 32 }}>
        <h3 className="text-base font-bold mb-1.5" style={{ color: '#0f172a' }}>{title}</h3>
        <p className="text-sm leading-relaxed" style={{ color: '#64748b' }}>{description}</p>
      </div>
    </div>
  );
}

/* ─── Section Label ─── */
function SectionLabel({ text }: { text: string }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
      <div style={{ width: 16, height: 1, background: 'linear-gradient(90deg,#2563EB,#10B981)' }} />
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', color: '#2563EB', textTransform: 'uppercase' }}>{text}</span>
    </div>
  );
}

/* ─── Main Export ─── */
export function AboutUS() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const faqs = [
    { q: 'What exactly does Autoniv do?', a: 'Autoniv deploys AI voice agents that handle your business phone calls 24/7 — answering inbound calls, running outbound campaigns, qualifying leads, booking appointments, and following up with customers, all without adding headcount.' },
    { q: 'Is this just another IVR or phone bot?', a: "No. Traditional IVRs make callers press buttons and navigate menus. Autoniv's AI voice agents hold natural two-way conversations, handle unexpected questions, and respond intelligently — the way a trained human rep would." },
    { q: 'How fast can we go live?', a: "Most clients go live in under 24 hours. We handle the full setup — voice design, agent configuration, and CRM integration — so there's no months-long implementation or complex tech work on your end." },
    { q: "Will our customers know they're talking to AI?", a: "Autoniv's voice agents are designed to sound natural and conversational. When a caller needs or requests a human, the AI transfers the call seamlessly with full context — so no one ever has to repeat themselves." },
    { q: "What happens when the AI doesn't know the answer?", a: "The agent transfers the call to a live team member, passing along everything discussed so the conversation continues smoothly. No dropped calls, no frustrated customers starting over." },
    { q: 'Which tools does Autoniv integrate with?', a: 'Autoniv connects to your CRM, calendar, and phone system during setup. Leads are logged automatically, appointments are booked in real time, and zero manual data entry is required.' },
    { q: 'What kinds of businesses is Autoniv built for?', a: 'Autoniv serves healthcare, real estate, finance, insurance, startups, enterprises, service businesses, agencies, and small businesses. Each AI voice agent is configured for the specific language and needs of your industry.' },
    { q: 'How much does Autoniv cost compared to a call center?', a: 'Clients typically reduce their cost per call interaction by up to 70% compared to a traditional call center — eliminating staffing, training, overtime, and inconsistency costs. For a quote tailored to your call volume, book a free strategy call.' },
    { q: 'Can I track what my AI agent says on calls?', a: 'Yes. Every call is transcribed and searchable in a real-time dashboard. You can review exactly what your AI agent said, spot trends, and continuously improve performance with real data.' },
    { q: 'How do I get started?', a: "Book a free 30-minute strategy call with the Autoniv team. We'll map your call flows, show you where you're losing revenue, and walk you through what your custom AI voice agent would look like — no credit card, no obligation." },
  ];

  return (
    <div
      className="min-h-screen"
      style={{
        background: '#f8fafc',
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        color: '#0f172a',
      }}
    >
      <USPSlider />
      <Nav mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

      <div style={{ paddingTop: 130 }}>

        {/* ── Hero ── */}
        <div
          style={{
            background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
            padding: '72px 24px 80px',
          }}
        >
          <div className="max-w-4xl mx-auto text-center">
            <SectionLabel text="About Autoniv" />
            <h1
              style={{
                fontSize: 'clamp(32px,5vw,60px)',
                fontWeight: 900,
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
                color: '#0f172a',
                margin: '0 0 20px',
              }}
            >
              We give your business a voice{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg,#2563EB 0%,#10B981 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  display: 'inline-block',
                }}
              >
                that never sleeps.
              </span>
            </h1>
            <p style={{ fontSize: 17, color: '#64748b', lineHeight: 1.7, maxWidth: 560, margin: '0 auto 36px' }}>
              Autoniv deploys intelligent AI voice agents that handle your calls, qualify leads, book appointments, and delight customers — 24/7, without adding headcount.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Link
                to="/register"
                className="px-8 py-3.5 rounded-full text-sm font-bold text-white no-underline inline-block text-center transition-all duration-200"
                style={{
                  background: 'linear-gradient(135deg,#2563EB,#10B981)',
                  boxShadow: '0 4px 20px rgba(16,185,129,0.28)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(16,185,129,0.38)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(16,185,129,0.28)'; }}
              >
                Start Automating Calls →
              </Link>
              <Link
                to="/demo"
                className="px-8 py-3.5 rounded-full text-sm font-bold no-underline inline-block text-center transition-all duration-200"
                style={{ background: '#fff', border: '1.5px solid rgba(0,0,0,0.10)', color: '#475569' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(37,99,235,0.30)'; e.currentTarget.style.color = '#2563EB'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.10)'; e.currentTarget.style.color = '#475569'; }}
              >
                See How It Works
              </Link>
            </div>
          </div>
        </div>

        {/* ── Stats ── */}
        <div style={{ padding: '64px 24px', background: '#f8fafc' }}>
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard value="10×" label="Faster Call Response" description="vs human teams" />
              <StatCard value="24/7" label="Always Available" description="without overtime costs" />
              <StatCard value="70%" label="Cost Reduction" description="per call interaction" />
              <StatCard value="&lt;48h" label="Deployment Time" description="average time to go live" />
            </div>
          </div>
        </div>

        {/* ── Mission ── */}
        <div style={{ padding: '0 24px 64px', background: '#f8fafc' }}>
          <div className="max-w-6xl mx-auto">
            <div
              className="rounded-3xl overflow-hidden"
              style={{
                background: '#fff',
                border: '1px solid rgba(0,0,0,0.07)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.05)',
              }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div style={{ padding: '52px 48px' }}>
                  <SectionLabel text="Our Mission" />
                  <h2 style={{ fontSize: 'clamp(22px,3vw,34px)', fontWeight: 800, letterSpacing: '-0.025em', color: '#0f172a', margin: '0 0 18px', lineHeight: 1.2 }}>
                    Automation that<br />
                    <span style={{ background: 'linear-gradient(135deg,#2563EB,#10B981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>actually sounds human</span>
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.75, margin: 0 }}>
                      Every missed call is a missed opportunity. Every hold queue erodes trust. Every understaffed customer service moment costs you a customer you worked hard to earn.
                    </p>
                    <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.75, margin: 0 }}>
                      At Autoniv, we're on a mission to eliminate those moments forever — for businesses of every size, in every industry. We believe the future of business communication isn't more people answering phones. It's smarter AI voice agents that sound natural, respond instantly, and never have a bad day.
                    </p>
                  </div>
                </div>
                {/* Quote panel */}
                <div
                  style={{
                    padding: '52px 48px',
                    background: 'linear-gradient(135deg,rgba(37,99,235,0.04),rgba(16,185,129,0.04))',
                    borderLeft: '1px solid rgba(0,0,0,0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <div
                    style={{
                      fontSize: 72,
                      lineHeight: 1,
                      color: 'rgba(37,99,235,0.12)',
                      fontFamily: 'Georgia, serif',
                      marginBottom: 8,
                    }}
                  >
                    "
                  </div>
                  <p style={{ fontSize: 17, color: '#0f172a', lineHeight: 1.7, fontStyle: 'italic', fontWeight: 500, margin: '0 0 28px' }}>
                    Your business doesn't sleep. Your phone system shouldn't either. We built Autoniv so every call gets the best possible answer — every single time.
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg,#2563EB,#10B981)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 13,
                        fontWeight: 800,
                        color: '#fff',
                        flexShrink: 0,
                      }}
                    >
                      RY
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Rajnesh Yadav</div>
                      <div style={{ fontSize: 12, color: '#94a3b8' }}>Founder & CEO, Autoniv</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Founder pillars ── */}
        <div style={{ padding: '0 24px 64px', background: '#f8fafc' }}>
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: '🎯', label: 'Industry Focus', value: 'AI Voice Automation & Conversational AI' },
              { icon: '🏢', label: 'Sectors Served', value: 'Healthcare, Real Estate, Finance, Agencies, SMBs' },
              { icon: '⚡', label: 'Core Belief', value: 'Every business deserves enterprise-grade AI' },
              { icon: '🌏', label: 'Vision', value: 'Voice automation for every business, no tech degree required' },
            ].map((item, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl text-center"
                style={{
                  background: '#fff',
                  border: '1px solid rgba(0,0,0,0.07)',
                  boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 8 }}>{item.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#0f172a', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.label}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── The Story ── */}
        <div style={{ padding: '0 24px 64px', background: '#f8fafc' }}>
          <div className="max-w-6xl mx-auto">
            <div
              className="rounded-3xl p-10 sm:p-14"
              style={{
                background: '#fff',
                border: '1px solid rgba(0,0,0,0.07)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.05)',
              }}
            >
              <SectionLabel text="Our Story" />
              <h2 style={{ fontSize: 'clamp(22px,3vw,34px)', fontWeight: 800, letterSpacing: '-0.025em', color: '#0f172a', margin: '0 0 6px', lineHeight: 1.2 }}>
                Built by someone who watched businesses{' '}
                <span style={{ background: 'linear-gradient(135deg,#2563EB,#10B981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  bleed revenue
                </span>{' '}
                through missed calls.
              </h2>
              <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 28 }}>— Rajnesh Yadav, Founder</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 720 }}>
                {[
                  "Rajnesh Yadav didn't build Autoniv in a vacuum. He watched — up close — how small businesses, real estate agencies, healthcare providers, and growing startups were losing thousands of dollars every week to a completely solvable problem: unanswered and poorly handled phone calls.",
                  "The receptionists were overwhelmed. The call centers were expensive and inconsistent. The chatbots were cold and frustrating. And the customers? They were hanging up and calling competitors.",
                  "Rajnesh believed there was a better way. A way that combined the warmth of a human conversation with the precision and availability of AI. So he built Autoniv — an AI voice automation platform designed not for the Fortune 500, but for the businesses that needed it most.",
                  "Today, Autoniv's AI voice agents handle inbound calls, conduct outbound campaigns, qualify leads in real time, book appointments automatically, and follow up with prospects — all in a voice that sounds natural enough that callers don't realize they're talking to AI. That's not a bug. That's the point.",
                ].map((text, i) => (
                  <p key={i} style={{ fontSize: 14, color: '#64748b', lineHeight: 1.8, margin: 0 }}>{text}</p>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Core Values ── */}
        <div style={{ padding: '0 24px 64px', background: '#f8fafc' }}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <SectionLabel text="Core Values" />
              <h2 style={{ fontSize: 'clamp(22px,3vw,34px)', fontWeight: 800, letterSpacing: '-0.025em', color: '#0f172a', margin: '0 0 10px' }}>
                What drives every decision we make
              </h2>
              <p style={{ fontSize: 14, color: '#94a3b8', maxWidth: 440, margin: '0 auto' }}>
                Four principles we've held since day one — and still won't compromise on.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ValueCard icon="⚡" title="Speed of Impact" description="We don't believe in 90-day onboarding timelines. Our clients go live in under 48 hours. Because every day without automation is a day of revenue lost." accent="#2563EB" />
              <ValueCard icon="🎯" title="Results Over Features" description="We don't sell you a feature list. We sell you outcomes — more leads qualified, more appointments booked, lower call abandonment, higher customer satisfaction." accent="#10B981" />
              <ValueCard icon="🤝" title="Human-First AI" description="Our AI sounds natural because we obsess over conversational design. Every voice agent is built to leave callers feeling heard, helped, and respected." accent="#6366f1" />
              <ValueCard icon="🔓" title="Radical Accessibility" description="Enterprise-grade AI voice technology shouldn't require an enterprise budget. A 5-person startup can deploy the same power as a 500-person call center." accent="#f59e0b" />
            </div>
          </div>
        </div>

        {/* ── How It Works ── */}
        <div
          style={{
            padding: '64px 24px',
            background: '#fff',
            borderTop: '1px solid rgba(0,0,0,0.06)',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
          }}
        >
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              <div>
                <SectionLabel text="How It Works" />
                <h2 style={{ fontSize: 'clamp(22px,3vw,34px)', fontWeight: 800, letterSpacing: '-0.025em', color: '#0f172a', margin: '0 0 10px', lineHeight: 1.2 }}>
                  From silent phone to{' '}
                  <span style={{ background: 'linear-gradient(135deg,#2563EB,#10B981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    revenue machine
                  </span>
                  {' '}— in 4 steps.
                </h2>
                <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7, margin: '0 0 36px' }}>
                  No long implementations. No complex tech. Just a working AI voice agent in under 48 hours.
                </p>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-white no-underline transition-all duration-200"
                  style={{ background: 'linear-gradient(135deg,#2563EB,#10B981)', boxShadow: '0 4px 16px rgba(16,185,129,0.25)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  Get started today →
                </Link>
              </div>
              <div>
                <Step number="01" title="Discovery & Voice Design" description="We map your call flows, define personas, and design conversation scripts tailored to your industry, tone, and customer journey." />
                <Step number="02" title="AI Agent Configuration" description="Your custom AI voice agent is trained on your business logic — products, pricing, FAQs, objections, and escalation protocols." />
                <Step number="03" title="Integration & Deployment" description="We connect your AI agent to your CRM, calendar, phone system, and data sources. Go live in under 48 hours." />
                <Step number="04" title="Monitor, Optimize, Scale" description="Track every call in a real-time dashboard. We continuously optimize performance and scale capacity as your business grows." last />
              </div>
            </div>
          </div>
        </div>

        {/* ── FAQ ── */}
        <div style={{ padding: '64px 24px', background: '#f8fafc' }}>
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <SectionLabel text="FAQ" />
              <h2 style={{ fontSize: 'clamp(22px,3vw,34px)', fontWeight: 800, letterSpacing: '-0.025em', color: '#0f172a', margin: '0 0 10px' }}>
                Everything you need to know
              </h2>
              <p style={{ fontSize: 14, color: '#94a3b8' }}>
                Got questions? We've got answers. Here's what businesses ask us most.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {faqs.map((faq) => (
                <FAQItem key={faq.q} question={faq.q} answer={faq.a} />
              ))}
            </div>
            <div
              className="mt-8 p-7 rounded-2xl text-center"
              style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)' }}
            >
              <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 14px' }}>
                Still have questions? We're here to help.
              </p>
              <Link
                to="/contact"
                className="inline-block px-6 py-2.5 rounded-full text-sm font-bold text-white no-underline transition-all duration-200"
                style={{ background: 'linear-gradient(135deg,#2563EB,#10B981)', boxShadow: '0 4px 16px rgba(16,185,129,0.22)' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                Contact Our Team →
              </Link>
            </div>
          </div>
        </div>

        {/* ── CTA ── */}
        <div style={{ padding: '0 24px 80px', background: '#f8fafc' }}>
          <div className="max-w-6xl mx-auto">
            <div
              className="rounded-3xl p-12 sm:p-16 text-center relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg,#eff6ff 0%,#f0fdf9 100%)',
                border: '1.5px solid rgba(37,99,235,0.12)',
                boxShadow: '0 8px 40px rgba(37,99,235,0.08)',
              }}
            >
              {/* decorative circles */}
              <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.10), transparent 70%)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: -60, left: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.08), transparent 70%)', pointerEvents: 'none' }} />
              <div className="relative z-10">
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '6px 16px',
                    borderRadius: 99,
                    background: 'rgba(37,99,235,0.08)',
                    border: '1px solid rgba(37,99,235,0.16)',
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#2563EB',
                    letterSpacing: '0.08em',
                    marginBottom: 20,
                  }}
                >
                  ✦ &nbsp;FREE STRATEGY CALL
                </div>
                <h2 style={{ fontSize: 'clamp(24px,4vw,44px)', fontWeight: 900, letterSpacing: '-0.03em', color: '#0f172a', margin: '0 0 16px', lineHeight: 1.15 }}>
                  Your competitors are already automating.
                  <br />
                  <span style={{ background: 'linear-gradient(135deg,#2563EB,#10B981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    Are you?
                  </span>
                </h2>
                <p style={{ fontSize: 15, color: '#64748b', maxWidth: 480, margin: '0 auto 32px', lineHeight: 1.7 }}>
                  Book a free 30-minute strategy call. We'll map your call flows, identify your biggest leaks, and show you exactly what your custom AI voice agent would look like — no obligation.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-3">
                  <Link
                    to="/register"
                    className="px-8 py-4 rounded-full text-sm font-bold text-white no-underline inline-block text-center transition-all duration-200"
                    style={{ background: 'linear-gradient(135deg,#2563EB,#10B981)', boxShadow: '0 4px 20px rgba(16,185,129,0.30)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(16,185,129,0.40)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(16,185,129,0.30)'; }}
                  >
                    Book My Free Strategy Call →
                  </Link>
                  <Link
                    to="/demo"
                    className="px-8 py-4 rounded-full text-sm font-bold no-underline inline-block text-center transition-all duration-200"
                    style={{ background: '#fff', border: '1.5px solid rgba(0,0,0,0.10)', color: '#475569' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(37,99,235,0.30)'; e.currentTarget.style.color = '#2563EB'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.10)'; e.currentTarget.style.color = '#475569'; }}
                  >
                    See a Live Demo
                  </Link>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-6 mt-6 text-xs" style={{ color: '#94a3b8' }}>
                  <span>🔒 No credit card required</span>
                  <span>↩ Cancel anytime</span>
                  <span>⚡ Go live in &lt;48 hours</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer strip ── */}
        <div
          style={{
            padding: '28px 24px',
            background: '#fff',
            borderTop: '1px solid rgba(0,0,0,0.07)',
          }}
        >
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-5">
            <div className="flex items-center gap-2">
              <img src={LOGO_SRC} alt="Autoniv" className="h-10 w-auto object-contain" />
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs" style={{ color: '#94a3b8' }}>
              {['Home', 'Solutions', 'Pricing', 'Blog', 'Contact', 'Privacy'].map((label) => (
                <Link
                  key={label}
                  to={`/${label.toLowerCase()}`}
                  className="transition-colors"
                  style={{ color: '#94a3b8', textDecoration: 'none' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#0f172a'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; }}
                >
                  {label}
                </Link>
              ))}
            </div>
            <div className="text-xs" style={{ color: '#cbd5e1' }}>
              © 2025 Autoniv · Founded by Rajnesh Yadav
            </div>
          </div>
        </div>

      </div>

      <ScrollToTop />
      <Footer />
    </div>
  );
}

export default AboutUS;