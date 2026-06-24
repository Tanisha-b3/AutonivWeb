export const features = [
  { icon: "🎙️", title: "AI Voice Agents", desc: "Deploy intelligent voice assistants with 20+ languages and 100+ realistic voices for natural, human-like conversation.", metric: "3×", metricLabel: "faster response", color: "#2563EB" },
  { icon: "🌍", title: "Global Language Support", desc: "Serve customers worldwide with AI agents that speak 20+ languages including English, Hindi, Arabic, and more.", metric: "20+", metricLabel: "languages", color: "#10B981" },
  { icon: "🎧", title: "Premium Voice Selection", desc: "Choose from 100+ realistic voices across different ages, genders, and accents to match your brand perfectly.", metric: "100+", metricLabel: "voices", color: "#10B981" },
  { icon: "📊", title: "Smart Analytics", desc: "Track call performance, lead conversion, and agent effectiveness with real-time dashboards.", metric: "99.8%", metricLabel: "accuracy rate", color: "#2563EB" },
  { icon: "🔗", title: "CRM Integration", desc: "Seamlessly sync leads and call data with your existing CRM and business tools.", metric: "50+", metricLabel: "integrations", color: "#10B981" },
  { icon: "🛡️", title: "Enterprise Security", desc: "Bank-grade encryption and compliance for your business communication needs.", metric: "SOC 2", metricLabel: "certified", color: "#10B981" },
];

export const WAVE_HEIGHTS = Array.from({ length: 38 }, (_, i) => {
  return 14 + Math.sin(i * 0.7) * 18 + Math.cos(i * 1.3) * 10 + Math.sin(i * 2.1) * 6;
});

export const STEPS = [
  { n: "01", title: "Describe", desc: "Tell us what your agent should do in plain text — no code, no prompts, no config files.", icon: "✍️" },
  { n: "02", title: "Configure", desc: "Pick a voice, language, and persona. Fine-tune with drag-and-drop or just keep chatting with the editor.", icon: "🎛️" },
  { n: "03", title: "Test", desc: "Simulate real calls, edge cases, and stress scenarios before going live. Catch issues early.", icon: "🧪" },
  { n: "04", title: "Deploy", desc: "Go live on your phone number, website widget, or API in one click.", icon: "🚀" },
  { n: "05", title: "Observe", desc: "Live dashboards, call transcripts, sentiment scores, and conversion tracking — all in one place.", icon: "📊" },
];

export const COMPARISON = [
  { capability: "Pricing model", autoniv: "Flat subscription", intercom: "Seat + per-resolution", zendesk: "Per agent/seat", tidio: "3 separate quotas", freshchat: "Per seat/mo", botpenguin: "Flat" },
  { capability: "Entry price", autoniv: "$49/mo all-in", intercom: "$29/seat + $0.99/res", zendesk: "$55/agent/mo", tidio: "$29 + Lyro add-on", freshchat: "$19/seat/mo", botpenguin: "$29/mo" },
  { capability: "Real cost @ 1K conv/mo", autoniv: "$49", intercom: "~$1,075+", zendesk: "~$825+", tidio: "~$108–150", freshchat: "~$57–100", botpenguin: "~$59–89" },
  { capability: "Annual cost (Growth)", autoniv: "$1,788/yr", intercom: "$30k–$80k+/yr", zendesk: "$9,900+/yr", tidio: "$708+/yr", freshchat: "$684+/yr", botpenguin: "$708/yr" },
  { capability: "Hidden fees", autoniv: "None — ever", intercom: "$0.99/resolution", zendesk: "$1.50/AI resolution", tidio: "Lyro + Flows + base", freshchat: "Freddy AI extra", botpenguin: "None" },
  { capability: "Free ongoing plan", autoniv: "✓ 100 conv/mo", intercom: "✗ None", zendesk: "✗ None", tidio: "50 total (one-time)", freshchat: "✓ 10 agents", botpenguin: "✓ Yes" },
  { capability: "No seat limit", autoniv: "✓ Always", intercom: "✗ Per seat", zendesk: "✗ Per agent", tidio: "Cap at 10 agents", freshchat: "✗ Per seat", botpenguin: "✓ Yes" },
  { capability: "WhatsApp-native", autoniv: "✓ From Starter", intercom: "Add-on only", zendesk: "Add-on only", tidio: "Add-on only", freshchat: "✓ Yes", botpenguin: "✓ Yes" },
  { capability: "India / INR pricing", autoniv: "✓ Native", intercom: "✗ USD only", zendesk: "✗ USD only", tidio: "✗ USD only", freshchat: "Partial", botpenguin: "✓ Yes" },
  { capability: "DPDP Act 2023", autoniv: "✓ Compliant", intercom: "✗ No", zendesk: "✗ No", tidio: "✗ No", freshchat: "Partial", botpenguin: "Partial" },
  { capability: "14-day free trial", autoniv: "✓ Yes", intercom: "✓ Yes", zendesk: "✓ Yes", tidio: "✓ Yes", freshchat: "✓ Yes", botpenguin: "7 days only" },
  { capability: "Self-serve signup", autoniv: "✓ Instant", intercom: "✓ Yes", zendesk: "✓ Yes", tidio: "✓ Yes", freshchat: "✓ Yes", botpenguin: "✓ Yes" },
  { capability: "Verdict", autoniv: "Best value", intercom: "Very expensive", zendesk: "Enterprise only", tidio: "Confusing billing", freshchat: "Seat-limited", botpenguin: "Narrow features" },
];

export const ADDONS = [
  { id: "whatsapp-channel", icon: "💬", title: "WhatsApp Channel", price: "₹2,499/mo", category: "recurring", description: "Native WhatsApp Business API with template support." },
  { id: "ai-voice", icon: "📞", title: "AI Voice (Hindi/EN)", price: "₹3,999/mo", category: "recurring", description: "Voice AI for inbound/outbound calls in Hindi & Indian English." },
  { id: "advanced-analytics", icon: "📊", title: "Advanced Analytics", price: "₹1,499/mo", category: "recurring", description: "Funnel analysis, CSAT scores, and conversation heatmaps." },
  { id: "priority-support", icon: "🎧", title: "Priority Support", price: "₹4,999/mo", category: "recurring", description: "Dedicated Slack channel, 2-hour SLA, and onboarding specialist." },
];

export const testimonials = [
  { name: "Sarah Chen", role: "CEO, HealthFirst Clinic", quote: "Autoniv transformed our patient intake. We handle 3× more calls with the same staff.", initials: "SC", metric: "+40% leads" },
  { name: "Marcus Johnson", role: "Director, BrightHome Services", quote: "The AI receptionist never sleeps. Our leads increased by 40% in the first month alone.", initials: "MJ", metric: "3× capacity" },
  { name: "Emily Rodriguez", role: "VP Operations, FastTrack Auto", quote: "Setup was instant. The AI sounds so natural, customers don't know it's not human.", initials: "ER", metric: "2min setup" },
];

export const useCases = [
  { title: "Healthcare", desc: "Automate patient scheduling, prescription reminders, and follow-up calls.", icon: "🏥", stat: "60% fewer no-shows" },
  { title: "Real Estate", desc: "Qualify leads, schedule viewings, and follow up on listings 24/7.", icon: "🏠", stat: "3× more qualified leads" },
  { title: "Financial Services", desc: "Handle loan inquiries, payment reminders, and account support calls.", icon: "🏦", stat: "50% cost reduction" },
];

export const integrationsRow1 = [
  { name: "Azure", icon: "☁️" }, { name: "Gemini", icon: "💎" }, { name: "Anthropic", icon: "🧠" }, { name: "Groq", icon: "⚡" },
  { name: "Cartesia", icon: "🎙️" }, { name: "Make", icon: "🔄" }, { name: "n8n", icon: "🔗" }, { name: "Google Calendar", icon: "📅" },
];

export const integrationsRow2 = [
  { name: "WhatsApp", icon: "💬" }, { name: "Discord", icon: "💜" }, { name: "Instagram", icon: "📸" }, { name: "Facebook", icon: "👤" },
  { name: "Telegram", icon: "✈️" }, { name: "Google Docs", icon: "📄" }, { name: "Microsoft", icon: "🪟" }, { name: "Twilio", icon: "📞" },
];

export const CONVERSATION = [
  { role: "user", text: "Hi, I'd like to book an appointment", delay: 800 },
  { role: "agent", text: "Of course! What day works best for you?", delay: 2400 },
  { role: "user", text: "Next Tuesday around 2 PM if possible", delay: 4200 },
  { role: "agent", text: "Tuesday 2 PM is available — shall I confirm?", delay: 5900 },
  { role: "user", text: "Yes please!", delay: 7600 },
  { role: "agent", text: "Done! You're booked. See you Tuesday ✓", delay: 9100 },
];

export const PARTICLE_FIELD = Array.from({ length: 90 }).map((_, i) => {
  const seed = (i * 9301 + 49297) % 233280;
  const rand = seed / 233280;
  const x = (i / 90) * 100;
  const distFromCenter = Math.abs(x - 50) / 50;
  const density = Math.max(0.15, 1 - distFromCenter * 0.7);
  return { x, y: (rand - 0.5) * 1.3, size: 1 + rand * 1.5, opacity: density * (0.3 + rand * 0.5), delay: rand * 3.5 };
});
