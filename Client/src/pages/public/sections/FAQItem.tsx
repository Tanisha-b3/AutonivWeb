import { useState } from 'react';

export function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl overflow-hidden transition-all duration-300"
      style={{ background: '#ffffff', border: open ? '1px solid rgba(37,99,235,0.2)' : '1px solid rgba(37,99,235,0.08)', boxShadow: open ? '0 8px 30px rgba(37,99,235,0.06)' : '0 2px 10px rgba(0,0,0,0.02)' }}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-4 text-left"
        style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
        <span className="text-sm sm:text-base font-semibold pr-4" style={{ color: '#0a0a0a' }}>{question}</span>
        <svg className="w-5 h-5 shrink-0 transition-transform duration-300"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', color: '#2563EB' }}
          fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: open ? '200px' : '0', opacity: open ? 1 : 0 }}>
        <p className="px-5 pb-4 text-sm leading-relaxed" style={{ color: '#475569' }}>{answer}</p>
      </div>
    </div>
  );
}
