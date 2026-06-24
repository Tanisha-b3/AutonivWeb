import { FAQItem } from "./FAQItem";

const faqs = [
  { q: "What is Autoniv?", a: "Autoniv is an AI-powered voice agent platform that handles business calls 24/7 in 20+ languages. Our AI agents answer calls, qualify leads, book appointments, and integrate with your existing CRM — no human intervention needed." },
  { q: "How long does setup take?", a: "Most businesses are live within 48 hours. Simply describe what your agent should do, pick a voice and language, test it with our simulation tool, and deploy to your phone number or website widget in one click." },
  { q: "Does it work with my existing phone number?", a: "Yes. Autoniv integrates with your current phone system via SIP trunking. You can forward calls to our AI agent or use a dedicated number — your choice. No hardware changes required." },
  { q: "What languages are supported?", a: "We support 20+ languages including English, Hindi, Spanish, French, Arabic, Mandarin, and more. Each agent can handle multiple languages and switch mid-conversation based on the caller's preference." },
  { q: "How much does it cost?", a: "Plans start at ₹4,999/month for small businesses (500 minutes, 1 agent). Pro plans at ₹12,999/month include 3 agents, 1,500 minutes, CRM integrations, and premium voices. Enterprise pricing is custom." },
  { q: "Can I try before I buy?", a: "Yes! You can test our AI agents with a free demo. Sign up, configure your agent, and run simulated calls before going live. No credit card required for the trial." },
  { q: "What integrations do you support?", a: "We integrate with 50+ tools including HubSpot, Salesforce, Google Calendar, Outlook, Zapier, Make, n8n, WhatsApp, and more. Our API also allows custom integrations for enterprise needs." },
  { q: "Is my data secure?", a: "Absolutely. We use bank-grade encryption, SOC 2 certified infrastructure, and GDPR-compliant data handling. All call data is encrypted at rest and in transit. Enterprise plans include dedicated instances." },
];

export function FAQ() {
  return (
    <section id="faq" className="section-box tint">
      <div className="section-pad relative overflow-hidden">
        <div className="text-center mb-10 sm:mb-14">
          <span className="tag px-4 py-1.5 rounded-full inline-block" style={{ color: "#2563EB", background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.3)" }}>FAQ</span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mt-4" style={{ color: "#0a0a0a" }}>
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
          <p className="text-sm sm:text-base max-w-lg mx-auto mt-3" style={{ color: "#475569" }}>
            Everything you need to know about Autoniv
          </p>
        </div>
        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, i) => <FAQItem key={i} question={faq.q} answer={faq.a} />)}
        </div>
      </div>
    </section>
  );
}
