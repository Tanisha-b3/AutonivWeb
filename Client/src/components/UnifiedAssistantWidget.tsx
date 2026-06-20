import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import VapiModule from '@vapi-ai/web';
import { publicLeadService, publicDemoService } from '../services/api';

const Vapi = (typeof VapiModule === 'function' ? VapiModule : (VapiModule as any).default) as new (key: string) => any;

/* ─── Vapi singleton ─────────────────────────────────────────── */
let vapiInstance: any | null = null;
function getVapi(): any | null {
  const key = import.meta.env.VITE_VAPI_API_KEY as string | undefined;
  if (!key) return null;
  if (!vapiInstance) vapiInstance = new Vapi(key);
  return vapiInstance;
}

const T = {
  green: 'var(--primary)',
  greenDim: 'var(--primary-soft)',
  greenDark: 'var(--primary-dark)',
  greenLight: '#00A3FF',
  slate: 'var(--text-muted)',
  surface: 'rgba(255,255,255,0.04)',
  border: 'var(--border)',
  borderHover: 'rgba(37,99,235,0.35)',
};

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  action?: { path: string; label: string } | null;
}

type LeadStep = 'idle' | 'ask_name' | 'ask_phone' | 'ask_email' | 'ask_purpose' | 'submitting' | 'done';

interface LeadInfo {
  name: string;
  phone: string;
  email: string;
  purpose: string;
}

const KB = {
  platform: {
    name: 'Autoniv',
    tagline: 'AI Voice Agent Platform',
    description: 'A professional multi-tenant SaaS platform for managing AI voice agents powered by Vapi. Deploy intelligent voice assistants in 20+ languages with 100+ realistic voices.',
    stats: { businesses: '10,000+', accuracy: '99.8%', integrations: '50+', languages: '20+', voices: '100+' },
  },
  features: [
    { title: 'AI Voice Agents', desc: 'Deploy intelligent voice assistants with natural, human-like conversation.', metric: '3× faster response' },
    { title: 'Global Language Support', desc: '20+ languages including English, Hindi, Arabic, Spanish, French, German.', metric: '20+ languages' },
    { title: 'Premium Voice Selection', desc: '100+ realistic voices across different ages, genders, and accents.', metric: '100+ voices' },
    { title: 'Smart Analytics', desc: 'Track call performance, lead conversion, and agent effectiveness.', metric: '99.8% accuracy' },
    { title: 'CRM Integration', desc: 'Seamlessly sync leads and call data with Salesforce, HubSpot, and 50+ tools.', metric: '50+ integrations' },
    { title: 'Enterprise Security', desc: 'Bank-grade encryption, SOC 2 certified compliance.', metric: 'SOC 2 certified' },
  ],
  plans: [
    { name: 'Pilot', price: 4999, calls: 30, features: ['1 AI Voice Assistant', '30 calls/month', 'Lead capture & logging'] },
    { name: 'Foundation', price: 14999, calls: 120, features: ['1 AI Voice Assistant', '120 calls/month', 'Basic analytics'] },
    { name: 'Scale', price: 29999, calls: 400, features: ['Up to 3 AI Workflows', '400 calls/month', 'CRM integration'], badge: 'Most Popular' },
    { name: 'Dominate', price: 74999, calls: 1200, features: ['Unlimited Workflows', '1,200 calls/month', 'Dedicated account manager'] },
  ],
};

/* ─────────────────────────────────────────────────────────────────── */
/*  Helper: detect if user is asking a question mid-form              */
/* ─────────────────────────────────────────────────────────────────── */
function isOffTopicQuestion(input: string): boolean {
  const q = input.toLowerCase().trim();
  return (
    /feature|pric|plan|cost|pilot|foundation|scale|dominate|agent|receptionist|appointment|faq|demo|integrat|use case|healthcare|real estate|finance|ecommerce|language|voice|analytic|security|what|how|tell me|show|compare|help|who are you|commands/.test(q)
  );
}

function getReprompt(step: LeadStep): string {
  switch (step) {
    case 'ask_name': return "Now, back to your details — **what's your name?**";
    case 'ask_phone': return "Back to your details — **what's your phone number?**";
    case 'ask_email': return "Back to your details — **what's your email address?**";
    case 'ask_purpose': return "Almost there — **what are you looking for?**\n\n- Book a demo\n- Pricing inquiry\n- General question\n- Other";
    default: return '';
  }
}

/* ─────────────────────────────────────────────────────────────────── */
/*  Markdown Renderer                                                  */
/* ─────────────────────────────────────────────────────────────────── */
function renderInline(text: string): React.ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i} style={{ color: T.green, fontWeight: 600 }}>{part.slice(2, -2)}</strong>
      : <span key={i}>{part}</span>
  );
}

function renderMarkdown(text: string): React.ReactNode {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === '') {
      elements.push(<div key={`sp-${i}`} style={{ height: 6 }} />);
      i++;
      continue;
    }

    if (line.includes('|') && lines[i + 1]?.includes('---')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].includes('|')) {
        tableLines.push(lines[i]);
        i++;
      }
      const rows = tableLines.filter(l => !l.match(/^\|[\s\-|]+\|$/));
      elements.push(
        <div key={`tbl-${i}`} style={{ overflowX: 'auto', marginBottom: 4 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
            <thead>
              <tr>
                {rows[0].split('|').filter((_, ci) => ci > 0 && ci < rows[0].split('|').length - 1).map((cell, ci) => (
                  <th key={ci} style={{ padding: '5px 8px', textAlign: 'left', color: T.green, borderBottom: '1px solid rgba(16,185,129,0.2)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {cell.trim()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.slice(1).map((row, ri) => (
                <tr key={ri} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  {row.split('|').filter((_, ci) => ci > 0 && ci < row.split('|').length - 1).map((cell, ci) => (
                    <td key={ci} style={{ padding: '5px 8px', color: 'rgba(226,232,240,0.85)', fontSize: 11 }}>
                      {renderInline(cell.trim())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    if (/^[-*]\s/.test(line.trim())) {
      const bulletItems: string[] = [];
      while (i < lines.length && /^[-*]\s/.test(lines[i].trim())) {
        bulletItems.push(lines[i].trim().replace(/^[-*]\s/, ''));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} style={{ margin: '4px 0', paddingLeft: 0, listStyle: 'none' }}>
          {bulletItems.map((item, bi) => (
            <li key={bi} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 3, color: 'rgba(226,232,240,0.85)', fontSize: 11, lineHeight: 1.5 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: T.green, flexShrink: 0, marginTop: 5, opacity: 0.7 }} />
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    if (/^\d+\.\s/.test(line.trim())) {
      const numItems: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        numItems.push(lines[i].trim().replace(/^\d+\.\s/, ''));
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} style={{ margin: '4px 0', paddingLeft: 0, listStyle: 'none' }}>
          {numItems.map((item, ni) => (
            <li key={ni} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, marginBottom: 4, fontSize: 11, lineHeight: 1.5, color: 'rgba(226,232,240,0.85)' }}>
              <span style={{ minWidth: 18, height: 18, borderRadius: 4, background: 'rgba(16,185,129,0.18)', color: T.green, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                {ni + 1}
              </span>
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    if (/^#{1,3}\s/.test(line)) {
      const level = (line.match(/^(#{1,3})/)?.[1].length ?? 1);
      const headingText = line.replace(/^#{1,3}\s/, '');
      elements.push(
        <p key={`h-${i}`} style={{ margin: level === 1 ? '0 0 6px' : '4px 0 3px', fontSize: level === 1 ? 13 : 12, fontWeight: 700, color: '#fff', lineHeight: 1.4 }}>
          {renderInline(headingText)}
        </p>
      );
      i++;
      continue;
    }

    elements.push(
      <p key={`p-${i}`} style={{ margin: '0 0 3px', fontSize: 11.5, lineHeight: 1.6, color: 'rgba(226,232,240,0.9)' }}>
        {renderInline(line)}
      </p>
    );
    i++;
  }

  return <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>{elements}</div>;
}

/* ─────────────────────────────────────────────────────────────────── */
/*  Response Generator                                                 */
/* ─────────────────────────────────────────────────────────────────── */
function generateResponse(input: string): { text: string; triggerLead?: boolean } {
  const q = input.toLowerCase().trim();

  if (/^(hi|hello|hey|howdy|greetings|good (morning|evening|afternoon))/.test(q)) {
    return { text: "Hello! I'm the **Autoniv AI Assistant**. I can help you with:\n\n- **Features** — AI voice agents, analytics, integrations\n- **Pricing** — Plans starting at ₹4,999/mo\n- **Agents** — Receptionist, Appointment, FAQ types\n\nHow can I assist you?" };
  }

  if (/who are you|what are you|what can you do/.test(q)) {
    return { text: `I'm the **${KB.platform.name} AI Assistant** — built into the platform.\n\nI know everything about:\n\n- Features, pricing plans, and add-ons\n- Agent types (Receptionist, Appointment, FAQ)\n- Integrations and use cases\n\nAsk me anything!` };
  }

  if (/^help|commands/.test(q)) {
    return { text: "**Try asking:**\n\n- \"What features does Autoniv offer?\"\n- \"Show me pricing plans\"\n- \"Tell me about agent types\"\n- \"Book a demo\"\n- \"Contact sales\"" };
  }

  if (/feature|what do|capabilities|offer|provide/.test(q)) {
    const list = KB.features.map((f, i) => `${i + 1}. **${f.title}** — ${f.desc} *(${f.metric})*`).join('\n');
    return { text: `**Autoniv Features**\n\n${list}\n\nWant a personalized demo? Share your details and I'll connect you with our team!`, triggerLead: true };
  }

  if (/pric|plan|cost|subscription|how much|charge/.test(q)) {
    if (/compare|vs|which|best|recommend/.test(q)) {
      return { text: "**Plan Comparison**\n\n| Plan | Price | Calls |\n|------|-------|-------|\n| Pilot | ₹4,999/mo | 30 |\n| Foundation | ₹14,999/mo | 120 |\n| Scale ⭐ | ₹29,999/mo | 400 |\n| Dominate | ₹74,999/mo | 1,200 |\n\nInterested? Share your details and our team will help you choose the best plan!", triggerLead: true };
    }
    const plans = KB.plans.map(p => `**${p.name}** — ₹${p.price.toLocaleString()}/mo\n${p.features.slice(0, 2).map(f => `- ${f}`).join('\n')}`).join('\n\n');
    return { text: `**Autoniv Pricing**\n\n${plans}\n\nWant to get started? Share your details and we'll set you up!`, triggerLead: true };
  }

  if (/\bpilot\b/.test(q)) return { text: "**Pilot Plan** — ₹4,999/mo\n\n- 30 calls/month\n- 1 AI Voice Assistant\n- Lead capture & logging\n- WhatsApp delivery\n\nWant to try it? Share your details!", triggerLead: true };
  if (/\bfoundation\b/.test(q)) return { text: "**Foundation Plan** — ₹14,999/mo\n\n- 120 calls/month\n- 1 AI Voice Assistant\n- Basic analytics\n- Free demo call\n\nReady to start? Share your details!", triggerLead: true };
  if (/\bscale\b/.test(q)) return { text: "**Scale Plan** ⭐ — ₹29,999/mo\n\n- 400 calls/month\n- Up to 3 AI Workflows\n- CRM integration\n- Priority support\n\nMost popular! Share your details to get started!", triggerLead: true };
  if (/\bdominate\b/.test(q)) return { text: "**Dominate Plan** — ₹74,999/mo\n\n- 1,200 calls/month\n- Unlimited Workflows\n- Dedicated account manager\n- White-label option\n\nEnterprise ready? Share your details!", triggerLead: true };

  if (/agent|receptionist|appointment|faq|voice assistant|ai agent|bot/.test(q)) {
    if (/receptionist|front desk/.test(q)) return { text: "**Receptionist Agent**\n\n- Front desk & general inquiries\n- Greets callers warmly\n- Collects name, phone, and purpose\n- Available 24/7\n\n**Best For**: Healthcare, real estate, any business needing a virtual front desk.\n\nWant one? Share your details!", triggerLead: true };
    if (/appointment|booking|schedule/.test(q)) return { text: "**Appointment Booking Agent**\n\n- Scheduling & confirmations\n- Collects service type, preferred date/time\n- Sends confirmation messages\n\n**Best For**: Clinics, salons, consulting firms.\n\nReady to book? Share your details!", triggerLead: true };
    if (/faq|question|support/.test(q)) return { text: "**FAQ Support Agent**\n\n- Q&A & knowledge base\n- Answers common questions instantly\n- Escalates complex questions\n\n**Best For**: Customer support, e-commerce.\n\nWant this? Share your details!", triggerLead: true };
    return { text: "**Agent Types on Autoniv**\n\n- **Receptionist** — Front desk & inquiries\n- **Appointment Booking** — Scheduling\n- **FAQ Support** — Q&A\n\nWhich one interests you? I can connect you with our team!", triggerLead: true };
  }

  if (/demo|book|trial|test|try|start|signup|register|get started|contact|reach|speak|talk|call back|connect/.test(q)) {
    return { text: "Great choice! Let me connect you with our team.\n\nPlease share your details:\n\n**1. What's your name?**", triggerLead: true };
  }

  if (/integrat|connect|sync|crm|salesforce|hubspot|slack|zapier/.test(q)) {
    return { text: "**Supported Integrations (50+)**\n\n- Salesforce\n- HubSpot\n- Slack\n- Zapier\n- Stripe\n- Notion\n- Intercom\n- Zendesk\n\nAnd 42+ more via API.\n\nWant to integrate? Share your details!", triggerLead: true };
  }

  if (/use case|industry|healthcare|real estate|finance|ecommerce/.test(q)) {
    return { text: "**Industry Use Cases**\n\n- **Healthcare** — 60% fewer no-shows\n- **Real Estate** — 3× more qualified leads\n- **Finance** — 50% cost reduction\n- **E-Commerce** — 99% call coverage\n\nWhich industry are you in? Let me connect you!", triggerLead: true };
  }

  if (/thank|thanks|thx/.test(q)) return { text: "You're welcome! Anything else I can help with?" };
  if (/bye|goodbye|see you|later/.test(q)) return { text: "Goodbye! Come back anytime. Have a great day!" };

  return { text: `I'd be happy to help! I know everything about **${KB.platform.name}**.\n\n**Try asking:**\n- "What features does Autoniv offer?"\n- "Show me pricing plans"\n- "Book a demo"\n- "Contact sales"` };
}

/* ─── Waveform ───────────────────────────────────────────── */
function Waveform({ active, color = 'var(--primary)' }: { active: boolean; color?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2, height: 26, justifyContent: 'center' }}>
      {Array.from({ length: 18 }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 2.5,
            borderRadius: 99,
            background: color,
            height: active ? `${5 + Math.abs(Math.sin(i * 0.7)) * 18}px` : '3px',
            opacity: active ? 0.9 : 0.15,
            animation: active ? `waveBar ${0.5 + (i % 4) * 0.08}s ease-in-out ${i * 0.02}s infinite alternate` : 'none',
            transition: 'height .3s ease, opacity .3s ease',
          }}
        />
      ))}
    </div>
  );
}

/* ─── Voice Orb ──────────────────────────────────────────── */
function VoiceOrb({ speaking }: { speaking: 'user' | 'agent' | 'idle' }) {
  const isAgent = speaking === 'agent';
  const isUser = speaking === 'user';
  const isActive = speaking !== 'idle';
  const coreColor = isAgent ? 'var(--primary)' : isUser ? 'var(--secondary)' : 'var(--cyan-dark)';

  return (
    <div style={{ position: 'relative', width: 120, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Ripple rings */}
      {isActive && [0, 1, 2].map(i => (
        <div key={i} style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          border: '1.5px solid rgba(0,163,255,0.12)',
          animation: `ringPulse 2.2s ease-out ${i * 0.7}s infinite`,
          pointerEvents: 'none',
        }} />
      ))}

      {/* Outer glow */}
      <div style={{
        position: 'absolute', width: 90, height: 90, borderRadius: '50%',
        background: isActive ? 'rgba(0,163,255,0.14)' : 'rgba(0,163,255,0.04)',
        filter: 'blur(24px)', transition: 'background .6s ease',
      }} />

      {/* Border ring */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        border: '1px solid rgba(0,163,255,0.08)',
      }} />

      {/* Core sphere */}
      <div style={{
        position: 'relative', zIndex: 2, width: 60, height: 60, borderRadius: '50%',
        background: speaking === 'idle'
          ? 'radial-gradient(circle at 35% 35%, #0d1f36, #050d1a)'
          : isAgent
            ? 'radial-gradient(circle at 30% 30%, var(--primary) 0%, var(--primary-dark) 40%, var(--cyan-dark) 100%)'
            : 'radial-gradient(circle at 30% 30%, var(--secondary) 0%, var(--primary) 55%, var(--primary-dark) 100%)',
        border: `1.5px solid ${coreColor}30`,
        boxShadow: isActive
          ? `0 0 0 3px ${coreColor}10, 0 0 35px ${coreColor}25, inset 0 1.5px 0 rgba(255,255,255,.15)`
          : '0 0 20px rgba(0,163,255,.08), inset 0 1px 0 rgba(255,255,255,.04)',
        transition: 'all .5s cubic-bezier(.16,1,.3,1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={isActive ? '#fff' : 'var(--primary-dark)'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'stroke .4s ease' }}>
          <rect x="9" y="2" width="6" height="12" rx="3" />
          <path d="M5 10a7 7 0 0014 0" />
          <line x1="12" y1="19" x2="12" y2="22" />
          <line x1="9" y1="22" x2="15" y2="22" />
        </svg>
      </div>
    </div>
  );
}

/* ─── Connecting Dots ────────────────────────────────────── */
function ConnectingDots() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, height: 16, justifyContent: 'center' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 5, height: 5, borderRadius: '50%', background: 'var(--primary)',
          animation: 'connectBounce 1.2s ease-in-out infinite',
          animationDelay: `${i * 0.2}s`,
        }} />
      ))}
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────── */
type CallMode = 'idle' | 'connecting' | 'active' | 'ended' | 'error';
type TabName = 'chat' | 'call';

export default function UnifiedAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<TabName>('chat');

  /* ── Chat State ── */
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hi! I'm the **Autoniv AI Assistant**. I can help you with:\n\n- **Features** — AI voice agents, analytics\n- **Pricing** — Plans starting at ₹4,999/mo\n- **Book a Demo** — Get a personalized walkthrough\n\nHow can I assist you?`,
      timestamp: 0,
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [leadStep, setLeadStep] = useState<LeadStep>('idle');
  const [leadInfo, setLeadInfo] = useState<LeadInfo>({ name: '', phone: '', email: '', purpose: '' });
  const [leadError, setLeadError] = useState('');

  /* ── Call State ── */
  const [callMode, setCallMode] = useState<CallMode>('idle');
  const [callSeconds, setCallSeconds] = useState(0);
  const [speaking, setSpeaking] = useState<'user' | 'agent' | 'idle'>('idle');
  const [callErrorMsg, setCallErrorMsg] = useState('');

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const maxDurationRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (maxDurationRef.current) { clearTimeout(maxDurationRef.current); maxDurationRef.current = null; }
  }, []);

  const stopCall = useCallback(() => {
    const vapi = getVapi();
    if (vapi) {
      try {
        vapi.stop();
        if (typeof vapi.removeAllListeners === 'function') {
          vapi.removeAllListeners();
        }
      } catch { /* ignore */ }
    }
    clearTimers();
    setCallMode('ended');
    setSpeaking('idle');
  }, [clearTimers]);

  useEffect(() => () => { stopCall(); }, [stopCall]);

  // If widget is closed, terminate voice call to prevent leaks/charges
  useEffect(() => {
    if (!isOpen && (callMode === 'active' || callMode === 'connecting')) {
      stopCall();
    }
  }, [isOpen, callMode, stopCall]);

  const startCall = useCallback(async () => {
    if (callMode === 'active' || callMode === 'connecting') { stopCall(); return; }

    const vapi = getVapi();
    if (!vapi) {
      setCallErrorMsg('Voice calling is not available. Please try again later.');
      setCallMode('error');
      return;
    }

    setCallMode('connecting');
    setCallSeconds(0);
    setCallErrorMsg('');

    try {
      const { data } = await publicDemoService.getAgent();
      const agent = data.agent;

      const onSpeechStart = () => { setCallMode('active'); setSpeaking('agent'); };
      const onSpeechEnd = () => setSpeaking('idle');
      const onCallEnd = () => stopCall();
      const onError = (e: any) => {
        console.error('[LandingCall] VAPI error:', e);
        setCallErrorMsg('Call failed. Please try again.');
        stopCall();
      };

      vapi.on('speech-start', onSpeechStart);
      vapi.on('speech-end', onSpeechEnd);
      vapi.on('call-end', onCallEnd);
      vapi.on('error', onError);

      await vapi.start({
        name: agent.name,
        firstMessage: agent.firstMessage,
        model: {
          provider: 'openai',
          model: 'gpt-4',
          messages: [{ role: 'system', content: agent.prompt }],
        },
        voice: {
          provider: '11labs',
          voiceId: agent.voiceId,
        },
      });

      setCallMode('active');
      timerRef.current = setInterval(() => setCallSeconds(prev => prev + 1), 1000);
      maxDurationRef.current = setTimeout(() => stopCall(), 120_000);

    } catch (err) {
      console.error('[LandingCall] Failed to start:', err);
      setCallErrorMsg('Could not connect. Please try again.');
      setCallMode('error');
    }
  }, [callMode, stopCall]);

  /* ─── Decoupled Event System ─── */
  useEffect(() => {
    const handleOpenWidget = (e: Event) => {
      const customEvent = e as CustomEvent<{ tab?: TabName }>;
      setIsOpen(true);
      if (customEvent.detail?.tab) {
        setTab(customEvent.detail.tab);
      }
    };
    window.addEventListener('open-assistant-widget', handleOpenWidget);
    return () => window.removeEventListener('open-assistant-widget', handleOpenWidget);
  }, []);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const clearChat = useCallback(() => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: `Hi! I'm the **Autoniv AI Assistant**. I can help you with:\n\n- **Features** — AI voice agents, analytics\n- **Pricing** — Plans starting at ₹4,999/mo\n- **Book a Demo** — Get a personalized walkthrough\n\nHow can I assist you?`,
      timestamp: 0,
    }]);
    setLeadStep('idle');
    setLeadInfo({ name: '', phone: '', email: '', purpose: '' });
    setLeadError('');
  }, []);

  useEffect(() => {
    if (isOpen && tab === 'chat') {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping, tab]);

  const addMessage = (role: 'user' | 'assistant', content: string) => {
    setMessages(prev => [...prev, { id: `${role}-${Date.now()}-${Math.random()}`, role, content, timestamp: Date.now() }]);
  };

  /* ── Lead collection step processor ── */
  const processLeadStep = useCallback(async (userInput: string) => {
    setLeadError('');

    if (leadStep === 'ask_name') {
      if (userInput.length < 2) {
        setLeadError('Please enter a valid name (at least 2 characters).');
        return;
      }
      setLeadInfo(prev => ({ ...prev, name: userInput }));
      addMessage('assistant', `Thanks, **${userInput}**!\n\n**2. What's your phone number?**`);
      setLeadStep('ask_phone');
    }

    else if (leadStep === 'ask_phone') {
      const phoneClean = userInput.replace(/[\s\-()]/g, '');
      if (!/^\+?\d{7,15}$/.test(phoneClean)) {
        setLeadError('Please enter a valid phone number (7–15 digits).');
        return;
      }
      setLeadInfo(prev => ({ ...prev, phone: userInput }));
      addMessage('assistant', `Got it!\n\n**3. What's your email address?**`);
      setLeadStep('ask_email');
    }

    else if (leadStep === 'ask_email') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userInput)) {
        setLeadError('Please enter a valid email address.');
        return;
      }
      setLeadInfo(prev => ({ ...prev, email: userInput }));
      addMessage('assistant', `Got it!\n\n**4. What are you looking for?**\n\n- Book a demo\n- Pricing inquiry\n- General question\n- Other`);
      setLeadStep('ask_purpose');
    }

    else if (leadStep === 'ask_purpose') {
      const finalLead = { ...leadInfo, purpose: userInput };
      setLeadInfo(finalLead);
      setLeadStep('submitting');

      addMessage('assistant', 'Perfect! Submitting your details...');

      try {
        const res = await publicLeadService.submit({
          name: finalLead.name,
          phone: finalLead.phone,
          email: finalLead.email,
          purpose: finalLead.purpose,
        });

        addMessage('assistant', `✅ **${res.data.message}**\n\n**Your Details:**\n- Name: ${finalLead.name}\n- Phone: ${finalLead.phone}\n- Email: ${finalLead.email}\n- Purpose: ${finalLead.purpose}\n\nOur team will reach out within 24 hours. Is there anything else I can help with?`);
        setLeadStep('done');
      } catch {
        addMessage('assistant', 'Sorry, there was an error submitting your details. Please try again or contact us at **support@autoniv.com**.');
        setLeadStep('idle');
      }

      setLeadInfo({ name: '', phone: '', email: '', purpose: '' });
    }
  }, [leadStep, leadInfo]);

  /* ── Main send handler ── */
  const sendMessage = useCallback(() => {
    const text = input.trim();
    if (!text || isTyping) return;

    addMessage('user', text);
    setInput('');
    setIsTyping(true);

    const isInLeadFlow =
      leadStep !== 'idle' && leadStep !== 'done' && leadStep !== 'submitting';

    // ── Mid-form question: answer it, then re-prompt the current step ──
    if (isInLeadFlow && isOffTopicQuestion(text)) {
      setTimeout(() => {
        const result = generateResponse(text);
        addMessage('assistant', result.text);

        const reprompt = getReprompt(leadStep);
        if (reprompt) {
          setTimeout(() => {
            addMessage('assistant', reprompt);
          }, 500);
        }
        setIsTyping(false);
      }, 700 + Math.random() * 300);
      return;
    }

    // ── Normal lead flow step ──
    if (isInLeadFlow) {
      setTimeout(() => {
        processLeadStep(text);
        setIsTyping(false);
      }, 500 + Math.random() * 400);
      return;
    }

    // ── Normal conversation (not in lead flow) ──
    setTimeout(() => {
      const result = generateResponse(text);

      if (result.triggerLead && leadStep === 'idle') {
        addMessage('assistant', result.text);
        setTimeout(() => {
          addMessage('assistant', "**To get started, please share your details:**\n\n**1. What's your name?**");
          setLeadStep('ask_name');
          setIsTyping(false);
        }, 600);
        return;
      }

      addMessage('assistant', result.text);
      setIsTyping(false);
    }, 700 + Math.random() * 400);
  }, [input, isTyping, leadStep, processLeadStep]);

  /* ── Input placeholder by current step ── */
  const inputPlaceholder =
    leadStep === 'ask_name' ? 'Enter your name...' :
      leadStep === 'ask_phone' ? 'Enter your phone number...' :
        leadStep === 'ask_email' ? 'Enter your email...' :
          leadStep === 'ask_purpose' ? 'What are you looking for...' :
            'Ask about Autoniv, agents, pricing...';

  const isCallActive = callMode === 'active' || callMode === 'connecting';

  return (
    <div className="fixed bottom-6 right-6 z-50 ">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.94 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-20 right-0 w-[360px] rounded-2xl border overflow-hidden shadow-2xl flex flex-col"
            style={{
              height: '500px',
              background: '#080d17',
              borderColor: T.border,
              boxShadow: `0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px ${T.border}`,
            }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b shrink-0" style={{ borderColor: T.border }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(16,185,129,0.15)' }}>
                <svg className="w-3.5 h-3.5" fill="none" stroke={T.green} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-white">AI Companion</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${isCallActive ? 'bg-amber-400 animate-pulse' : 'bg-[var(--primary)] animate-pulse'}`} />
                  <span className="text-[10px]" style={{ color: T.slate }}>
                    {isCallActive ? 'live call active' : 'online'}
                  </span>
                </div>
              </div>
              {tab === 'chat' && (
                <button onClick={clearChat}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-[var(--surface)]"
                  style={{ color: T.slate }} title="Clear chat">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
              <button onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-[var(--surface)]"
                style={{ color: T.slate }}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Tab selector */}
            <div className="flex px-4 py-2 border-b gap-2 shrink-0 bg-white/[0.01]" style={{ borderColor: T.border }}>
              <button
                onClick={() => setTab('chat')}
                className="flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5"
                style={tab === 'chat'
                  ? { background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.2)', color: '#fff' }
                  : { border: '1px solid transparent', color: T.slate }
                }
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                AI Chat
              </button>
              <button
                onClick={() => setTab('call')}
                className="flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 relative"
                style={tab === 'call'
                  ? { background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.2)', color: '#fff' }
                  : { border: '1px solid transparent', color: T.slate }
                }
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                Voice Call
                {isCallActive && (
                  <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-[var(--primary)] animate-ping" />
                )}
              </button>
            </div>

            {/* Content pane */}
            <div className="flex-1 overflow-hidden flex flex-col min-h-0 relative">
              {tab === 'chat' ? (
                <>
                  {/* Quick chips under tabs */}
                  <div className="flex flex-wrap gap-1.5 px-3 pt-2 pb-1.5 border-b shrink-0" style={{ borderColor: 'rgba(255,255,255,0.02)' }}>
                    {['Features', 'Pricing', 'Book a Demo', 'Contact'].map(chip => (
                      <button key={chip} onClick={() => {
                        setInput(
                          chip === 'Features' ? 'What features does Autoniv offer?' :
                            chip === 'Pricing' ? 'Show me pricing plans' :
                              chip === 'Book a Demo' ? 'I want to book a demo' :
                                'Contact sales'
                        );
                      }}
                        className="px-2 py-0.5 text-[10px] font-medium rounded-full border transition-all hover:border-green-500/40"
                        style={{ background: T.surface, borderColor: T.border, color: T.slate }}>
                        {chip}
                      </button>
                    ))}
                  </div>

                  {/* Message body */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}>
                    {/* Call in progress banner */}
                    {isCallActive && (
                      <button
                        onClick={() => setTab('call')}
                        className="w-full py-2 px-3 mb-2 rounded-xl flex items-center justify-between text-[11px] font-medium transition-all"
                        style={{
                          background: 'rgba(16,185,129,0.08)',
                          border: '1px solid rgba(16,185,129,0.18)',
                          color: '#10b981',
                        }}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
                          <span>Voice call is active ({formatTime(callSeconds)})</span>
                        </div>
                        <span className="font-semibold text-[10px]">Return to Call →</span>
                      </button>
                    )}

                    {messages.map((msg) => (
                      <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        {msg.role === 'assistant' && (
                          <div className="w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center mt-0.5" style={{ background: 'rgba(16,185,129,0.15)' }}>
                            <svg className="w-3 h-3" fill="none" stroke={T.green} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                          </div>
                        )}
                        <div className="max-w-[82%]">
                          <div
                            className="px-3 py-2 rounded-xl text-xs"
                            style={msg.role === 'user'
                              ? { background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.25)', color: '#e2e8f0', fontSize: 11.5, lineHeight: 1.6 }
                              : { background: T.surface, border: `1px solid ${T.border}`, color: 'rgba(226,232,240,0.88)' }
                            }
                          >
                            {msg.role === 'user'
                              ? <span style={{ fontSize: 11.5, lineHeight: 1.6 }}>{msg.content}</span>
                              : renderMarkdown(msg.content)
                            }
                          </div>
                        </div>
                      </div>
                    ))}

                    {leadError && (
                      <div className="flex gap-2">
                        <div className="w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.1)' }}>
                          <svg className="w-3 h-3" fill="none" stroke="#f87171" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="px-3 py-2 rounded-xl text-xs"
                          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', fontSize: 11.5, lineHeight: 1.5 }}>
                          {leadError}
                        </div>
                      </div>
                    )}

                    {isTyping && (
                      <div className="flex gap-2">
                        <div className="w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.15)' }}>
                          <svg className="w-3 h-3" fill="none" stroke={T.green} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                        <div className="px-3 py-2.5 rounded-xl border flex items-center gap-1" style={{ background: T.surface, borderColor: T.border }}>
                          {[0, 0.15, 0.3].map((delay, i) => (
                            <motion.span key={i} className="w-1 h-1 rounded-full bg-[var(--surface)]0"
                              animate={{ y: [0, -4, 0] }} transition={{ duration: 0.7, repeat: Infinity, delay }} />
                          ))}
                        </div>
                      </div>
                    )}
                    <div ref={bottomRef} />
                  </div>

                  {/* Input bar */}
                  <div className="p-3 border-t shrink-0" style={{ borderColor: T.border }}>
                    {leadStep === 'submitting' ? (
                      <div className="text-center text-xs py-2" style={{ color: T.slate }}>
                        <svg className="animate-spin w-4 h-4 mx-auto mb-1 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Submitting your details...
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          value={input}
                          onChange={e => setInput(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && sendMessage()}
                          placeholder={inputPlaceholder}
                          disabled={isTyping}
                          className="flex-1 rounded-xl px-3 py-2 text-xs text-white outline-none transition-all disabled:opacity-40"
                          style={{ background: T.surface, border: `1px solid ${T.border}` }}
                          onFocus={e => (e.target.style.borderColor = 'rgba(16,185,129,0.4)')}
                          onBlur={e => (e.target.style.borderColor = T.border)}
                        />
                        <button
                          onClick={sendMessage}
                          disabled={!input.trim() || isTyping}
                          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40"
                          style={{ background: T.greenDim, border: `1px solid rgba(16,185,129,0.3)` }}>
                          <svg className="w-3.5 h-3.5" fill="none" stroke={T.green} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* Voice Call Interface */
                <div className="flex-1 flex flex-col items-center justify-between p-5 min-h-0">
                  {/* Status Indicator */}
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '5px 12px', borderRadius: 99,
                    background: callMode === 'active' ? 'rgba(16,185,129,0.06)' : callMode === 'connecting' ? 'rgba(255,228,132,0.06)' : 'rgba(16,185,129,0.04)',
                    border: `1px solid ${callMode === 'active' ? 'rgba(16,185,129,0.15)' : callMode === 'connecting' ? 'rgba(255,228,132,0.15)' : 'rgba(16,185,129,0.10)'}`,
                    transition: 'all .3s',
                  }}>
                    <span style={{
                      width: 5, height: 5, borderRadius: '50%',
                      background: callMode === 'active' ? '#10b981' : callMode === 'connecting' ? '#ffe484' : '#10b981',
                      animation: callMode !== 'idle' ? 'livePulse 2s ease infinite' : 'none',
                    }} />
                    <span style={{
                      fontSize: 10, fontFamily: "'JetBrains Mono', monospace",
                      color: callMode === 'active' ? '#10b981' : callMode === 'connecting' ? '#ffe484' : '#6b9ec8',
                      letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 500,
                    }}>
                      {callMode === 'idle' && 'Ready to call'}
                      {callMode === 'connecting' && 'Connecting'}
                      {callMode === 'active' && 'Live'}
                      {callMode === 'ended' && 'Call ended'}
                      {callMode === 'error' && 'Error'}
                    </span>
                  </div>

                  {/* Voice Orb Area */}
                  <div className="my-2 flex flex-col items-center">
                    <VoiceOrb speaking={speaking} />
                    <h4 style={{ fontSize: 14, fontWeight: 700, color: '#e8f8ff', marginTop: 12, marginBottom: 4 }}>
                      {callMode === 'idle' && 'Talk to Our AI Agent'}
                      {callMode === 'connecting' && 'Connecting...'}
                      {callMode === 'active' && 'In Live Call'}
                      {callMode === 'ended' && 'Call Complete'}
                      {callMode === 'error' && 'Connection Failed'}
                    </h4>
                    {callMode === 'idle' && (
                      <p style={{ fontSize: 11, color: '#6b9ec8', textAlign: 'center', margin: 0, maxWidth: 220, lineHeight: 1.4 }}>
                        Have a real conversation with our AI voice agent. Max duration is 2 mins.
                      </p>
                    )}
                    {callMode === 'active' && callSeconds > 0 && (
                      <div className="mt-1" style={{
                        display: 'inline-flex', alignItems: 'center',
                        padding: '2px 8px', borderRadius: 99,
                        background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.18)'
                      }}>
                        <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#10b981', fontWeight: 600 }}>
                          {formatTime(callSeconds)}
                        </span>
                      </div>
                    )}
                    {callErrorMsg && (
                      <p style={{ fontSize: 10, color: '#ff8a8a', margin: '4px 0 0', textAlign: 'center' }}>{callErrorMsg}</p>
                    )}
                  </div>

                  {/* Waveform / Connection indicators */}
                  <div className="w-full shrink-0 flex flex-col items-center gap-2">
                    {(callMode === 'active' || callMode === 'connecting') && (
                      <Waveform active={speaking !== 'idle'} color="#10b981" />
                    )}
                    {callMode === 'connecting' && <ConnectingDots />}
                  </div>

                  {/* Action buttons or stats */}
                  <div className="w-full shrink-0 flex flex-col gap-3 items-center">
                    {/* Call End post-stats */}
                    {callMode === 'ended' && (
                      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {[
                            { icon: '📞', label: 'Duration', value: formatTime(callSeconds) },
                            { icon: '🤖', label: 'Agent', value: 'AI Voice' },
                            { icon: '✨', label: 'Quality', value: 'Natural' },
                          ].map((stat, i) => (
                            <div key={i} style={{
                              flex: 1, textAlign: 'center', padding: '6px 4px', borderRadius: 10,
                              background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.10)',
                            }}>
                              <div style={{ fontSize: 14, marginBottom: 2 }}>{stat.icon}</div>
                              <div style={{ fontSize: 11, fontWeight: 700, color: '#10b981' }}>{stat.value}</div>
                              <div style={{ fontSize: 8, color: '#6b9ec8', fontFamily: "'JetBrains Mono', monospace", marginTop: 1 }}>{stat.label}</div>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => window.location.href = '/register'}
                          style={{
                            width: '100%', padding: '10px 16px', borderRadius: 10, cursor: 'pointer',
                            border: '1px solid rgba(16,185,129,0.25)',
                            background: 'rgba(16,185,129,0.06)',
                            color: '#10b981', fontSize: 12, fontWeight: 600,
                            transition: 'all .2s',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.12)'; e.currentTarget.style.borderColor = 'rgba(16,185,129,0.40)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.06)'; e.currentTarget.style.borderColor = 'rgba(16,185,129,0.25)'; }}
                        >
                          Create Your Own Agent
                          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                          </svg>
                        </button>
                      </div>
                    )}

                    {/* Standard call start / end button */}
                    <div style={{ width: '100%', display: 'flex', gap: 8 }}>
                      {callMode === 'idle' || callMode === 'ended' || callMode === 'error' ? (
                        <button
                          onClick={startCall}
                          style={{
                            width: '100%', padding: '11px 20px', borderRadius: 12,
                            border: 'none', cursor: 'pointer',
                            background: 'linear-gradient(135deg, #10b981, #059669, #047857)',
                            backgroundSize: '200% 200%',
                            animation: 'borderFlow 4s ease infinite',
                            color: '#fff', fontSize: 13, fontWeight: 700,
                            boxShadow: '0 0 0 1px rgba(255,255,255,.08) inset, 0 4px 0 rgba(0,20,50,.5), 0 0 30px rgba(16,185,129,.2)',
                            transition: 'all .2s cubic-bezier(.16,1,.3,1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.transform = 'translateY(-1.5px)';
                            e.currentTarget.style.boxShadow = '0 0 0 1px rgba(255,255,255,.10) inset, 0 6px 0 rgba(0,20,50,.4), 0 0 40px rgba(16,185,129,.35)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.transform = 'none';
                            e.currentTarget.style.boxShadow = '0 0 0 1px rgba(255,255,255,.08) inset, 0 4px 0 rgba(0,20,50,.5), 0 0 30px rgba(16,185,129,.2)';
                          }}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="9" y="2" width="6" height="12" rx="3" />
                            <path d="M5 10a7 7 0 0014 0" />
                            <line x1="12" y1="19" x2="12" y2="22" />
                            <line x1="9" y1="22" x2="15" y2="22" />
                          </svg>
                          Start Live Call
                        </button>
                      ) : (
                        <button
                          onClick={stopCall}
                          style={{
                            width: '100%', padding: '11px 20px', borderRadius: 12, cursor: 'pointer',
                            border: '1px solid rgba(255,87,87,0.25)',
                            background: 'rgba(255,87,87,0.08)',
                            color: '#ff5f57', fontSize: 13, fontWeight: 700,
                            transition: 'all .2s',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = 'rgba(255,87,87,0.14)';
                            e.currentTarget.style.borderColor = 'rgba(255,87,87,0.45)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = 'rgba(255,87,87,0.08)';
                            e.currentTarget.style.borderColor = 'rgba(255,87,87,0.25)';
                          }}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10.68 13.31a16 16 0 000 1.79l-1.42-1.42a14 14 0 010-1.79z" />
                            <path d="M13.36 10.06a16 16 0 000-1.79l1.42 1.42a14 14 0 010 1.79z" />
                            <line x1="2" y1="2" x2="22" y2="22" />
                          </svg>
                          End Call
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-11 h-11 rounded-full flex items-center justify-center shadow-lg"
        style={{
          background: T.greenDim,
          border: `1px solid rgba(16,185,129,0.4)`,
          boxShadow: `0 0 28px rgba(16,185,129,0.25)`,
        }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.svg key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}
              className="w-5 h-5" fill="none" stroke={T.green} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </motion.svg>
          ) : (
            <motion.svg key="chat" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              className="w-5 h-5" fill="none" stroke={T.green} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </motion.svg>
          )}
        </AnimatePresence>
        {!isOpen && <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[var(--primary)] border-2 border-[#060a12]" />}
      </motion.button>

      {/* Local keyframe styles self-contained inside the widget */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes connectBounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
          40% { transform: scale(1); opacity: 1; }
        }
        @keyframes waveBar {
          from { transform: scaleY(0.3); opacity: 0.4; }
          to { transform: scaleY(1); opacity: 1; }
        }
        @keyframes livePulse {
          0% { box-shadow: 0 0 0 0 rgba(16,185,129,0.3); }
          70% { box-shadow: 0 0 0 9px rgba(16,185,129,0); }
          100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }
        }
        @keyframes ringPulse {
          0% { transform: scale(1); opacity: 0.7; }
          100% { transform: scale(2.6); opacity: 0; }
        }
        @keyframes borderFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}