import { FAQItem } from "./FAQItem";
const faqs = [
  {
    q: "What exactly does Autoniv do?",
    a: "Autoniv deploys AI voice agents that handle your business phone calls 24/7. Our AI agents answer inbound calls, make outbound calls, qualify leads, book appointments, follow up with customers, and automate repetitive conversations—without increasing your team size.",
  },
  {
    q: "Is this just another IVR or phone bot?",
    a: "No. Unlike traditional IVR systems that rely on menus and button presses, Autoniv's AI voice agents hold natural, human-like conversations. They understand context, answer unexpected questions, and respond intelligently just like a trained customer service representative.",
  },
  {
    q: "How fast can we go live?",
    a: "Most businesses are live within 24 hours. Our team handles voice setup, agent configuration, workflow customization, and CRM integration, allowing you to start using your AI voice agent quickly without complex implementation.",
  },
  {
    q: "Will our customers know they're talking to AI?",
    a: "Our AI voice agents are designed to sound natural, professional, and conversational. If a customer requests a human or the conversation requires human assistance, the AI transfers the call seamlessly while sharing the full conversation context.",
  },
  {
    q: "What happens if the AI doesn't know the answer?",
    a: "When the AI encounters a question outside its knowledge or requires human intervention, it immediately transfers the call to your team. The agent passes along the conversation history so your staff can continue without asking customers to repeat themselves.",
  },
  {
    q: "Which tools does Autoniv integrate with?",
    a: "Autoniv integrates with leading CRMs, calendars, and business phone systems. Leads are automatically captured, appointments are scheduled in real time, customer information is synced instantly, and manual data entry is eliminated.",
  },
  {
    q: "What types of businesses use Autoniv?",
    a: "Autoniv serves healthcare providers, real estate agencies, financial services, insurance companies, startups, enterprises, service businesses, agencies, and SMBs. Every AI voice agent is customized to match your industry's workflows and customer conversations.",
  },
  {
    q: "How much can Autoniv reduce call center costs?",
    a: "Businesses typically reduce call-handling costs by up to 70% compared to traditional call centers by eliminating staffing overhead, repetitive manual work, training costs, and inconsistent customer experiences. Contact us for a custom quote based on your call volume.",
  },
  {
    q: "Can I monitor what my AI agent says?",
    a: "Yes. Every call is automatically recorded, transcribed, and available in your real-time dashboard. You can review conversations, monitor performance, identify trends, and continuously improve your AI agent using detailed analytics.",
  },
  {
    q: "How do I get started?",
    a: "Book a free 30-minute strategy call with the Autoniv team. We'll understand your business, map your call workflows, identify automation opportunities, and demonstrate how a customized AI voice agent can improve your customer experience—no obligation and no credit card required.",
  },
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
