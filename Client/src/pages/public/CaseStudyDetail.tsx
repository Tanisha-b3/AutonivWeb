import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { STUDIES } from './caseStudiesData';
import Footer from './Footer';
import ScrollToTop from '../../components/ScrollToTop';
import { PublicNavbar } from '../../components/PublicNavbar';
import { USPSlider } from './sections/USPSlider';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── FAQ Item ─── */
function FAQItem({ question, answer, accentColor }: { question: string; answer: string; accentColor: string }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      layout
      className="rounded-2xl overflow-hidden transition-all duration-300 border"
      style={{
        background: open ? 'rgba(30, 41, 59, 0.4)' : 'rgba(15, 23, 42, 0.2)',
        borderColor: open ? accentColor : 'rgba(255, 255, 255, 0.06)',
        boxShadow: open ? `0 4px 30px -10px ${accentColor}25` : 'none',
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left cursor-pointer transition-colors duration-200"
        style={{ background: 'transparent', border: 'none', color: '#f8fafc' }}
      >
        <span className="text-sm sm:text-base font-bold text-slate-100 hover:text-white transition-colors">{question}</span>
        <span
          className="text-xl flex-shrink-0 transition-transform duration-300 font-bold"
          style={{
            transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
            color: open ? accentColor : '#64748b',
          }}
        >
          +
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="px-6 pb-5 pt-1 border-t border-slate-800/40"
          >
            <p className="text-xs sm:text-sm leading-relaxed text-slate-400">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function CaseStudyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const goBack = () => navigate(-1);
  const studyIndex = parseInt(id || '0');
  const study = STUDIES[studyIndex];

  if (!study || !study.story) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030712]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Case Study Not Found</h1>
          <button onClick={goBack} className="text-blue-500 font-semibold hover:underline cursor-pointer" style={{ background: 'none', border: 'none' }}>← Back to Case Studies</button>
        </div>
      </div>
    );
  }

  const { story } = study;
  const accentColor = study.badgeColor;

  return (
    <div 
      className="min-h-screen relative overflow-hidden bg-[#030712]"
      style={{
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        color: '#f8fafc',
      }}
    >
      {/* Background Mesh Overlays */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div 
          className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full blur-[140px]" 
          style={{ background: `radial-gradient(circle, ${accentColor}18 0%, transparent 70%)` }}
        />
        <div 
          className="absolute bottom-[20%] right-[-10%] w-[50vw] h-[50vw] rounded-full blur-[140px]" 
          style={{ background: `radial-gradient(circle, ${accentColor}10 0%, transparent 70%)` }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <USPSlider />
      <PublicNavbar />

      <div className="relative z-10" style={{ paddingTop: 130, paddingBottom: 80 }}>
        {/* Hero Section */}
        <div className="border-b border-slate-800/60 pb-12 mb-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            {/* Back Button */}
            <motion.button 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              onClick={goBack} 
              className="inline-flex items-center gap-2 text-sm font-semibold mb-8 transition-colors hover:text-white cursor-pointer text-slate-400"
              style={{ background: 'none', border: 'none' }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back to Case Studies
            </motion.button>

            {/* Header Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8">
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex items-center gap-3 mb-4"
                >
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ 
                      background: `${accentColor}1c`, 
                      border: `1.5px solid ${accentColor}35` 
                    }}
                  >
                    {study.icon}
                  </div>
                  <div>
                    <div className="text-sm font-extrabold uppercase tracking-widest" style={{ color: accentColor }}>{study.category}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{study.subcategory}</div>
                  </div>
                </motion.div>

                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-5 leading-tight tracking-tight"
                >
                  Voice AI for{' '}
                  <span style={{ color: accentColor }}>
                    {study.category === 'Healthcare' ? 'Appointment-Based Businesses' : study.category === 'Real Estate' ? 'Smart Real Estate Sales' : study.category === 'E-Commerce' ? 'E-commerce Revenue Recovery' : 'Repetitive Customer Calls'}
                  </span>
                </motion.h1>

                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-base sm:text-lg leading-relaxed text-slate-300 max-w-3xl"
                >
                  How Autoniv's AI Voice Agents helps{' '}
                  {study.category === 'Healthcare' ? 'service businesses turn every enquiry into a confirmed booking' : study.category === 'Real Estate' ? 'real estate teams qualify leads faster and convert more site visits' : study.category === 'E-Commerce' ? 'D2C brands recover abandoned carts and verify COD orders' : 'businesses improve customer response and free their teams'}
                </motion.p>
              </div>

              {/* Top Stats Cards */}
              <div className="lg:col-span-4 grid grid-cols-1 gap-4">
                {study.results.map((r, i) => (
                  <motion.div
                    key={r.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                    className="p-5 rounded-2xl border bg-slate-900/30 backdrop-blur-md flex items-center justify-between group"
                    style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = `${r.color}25`;
                      e.currentTarget.style.boxShadow = `0 10px 30px -15px ${r.color}25`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div>
                      <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase font-mono">{r.label}</div>
                      <div className="text-2xl font-black mt-1 font-mono tracking-tight" style={{ color: r.color }}>{r.value}</div>
                    </div>
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-transform duration-300 group-hover:scale-110"
                      style={{ background: `${r.color}10`, border: `1px solid ${r.color}20` }}
                    >
                      📈
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left Main Column */}
            <div className="lg:col-span-8 space-y-12">
              
              {/* Challenge Section */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-xl">⚠️</span>
                  <h2 className="text-2xl font-black text-white">{story.challenge.title}</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {story.challenge.points.map((point, i) => (
                    <div 
                      key={i} 
                      className="p-5 rounded-2xl border bg-slate-900/20 hover:bg-slate-900/40 transition-all duration-300 hover:-translate-y-1"
                      style={{ borderColor: 'rgba(255, 255, 255, 0.04)' }}
                    >
                      <div className="flex items-center gap-2.5 mb-3">
                        <span 
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-slate-300"
                          style={{ background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                        >
                          {i + 1}
                        </span>
                        <h3 className="font-bold text-slate-100 text-sm">{point.title}</h3>
                      </div>
                      <p className="text-xs leading-relaxed text-slate-400">{point.desc}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Solution / Journey Map Section */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">⚙️</span>
                  <h2 className="text-2xl font-black text-white">{story.solution.title}</h2>
                </div>
                <p className="text-sm text-slate-400 mb-8 max-w-2xl leading-relaxed">{story.solution.description}</p>
                
                {/* Onboarding Timeline / Flow */}
                <div className="relative pl-6 sm:pl-8 border-l-2 border-dashed border-slate-800/80 space-y-6">
                  {story.solution.steps.map((step, i) => (
                    <motion.div 
                      key={i} 
                      className="relative group cursor-default"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.08 }}
                    >
                      {/* Circle indicator */}
                      <div 
                        className="absolute left-0 -translate-x-[33px] sm:-translate-x-[41px] top-1.5 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white transition-all duration-300 group-hover:scale-115"
                        style={{ 
                          background: `linear-gradient(135deg, ${accentColor}, #10B981)`,
                          boxShadow: `0 0 12px ${accentColor}40`
                        }}
                      >
                        {i + 1}
                      </div>

                      <div className="p-4 rounded-xl border bg-slate-900/10 hover:bg-slate-900/30 hover:border-slate-800/80 transition-all duration-300" style={{ borderColor: 'rgba(255, 255, 255, 0.03)' }}>
                        <span className="text-xs sm:text-sm font-semibold text-slate-300 leading-relaxed group-hover:text-slate-100 transition-colors">{step}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Comparison Impact Table Section */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-xl">📈</span>
                  <h2 className="text-2xl font-black text-white">{story.impact.title}</h2>
                </div>
                <div 
                  className="rounded-2xl border overflow-hidden overflow-x-auto bg-slate-950/30 backdrop-blur-md"
                  style={{ borderColor: 'rgba(255,255,255,0.04)' }}
                >
                  <table className="w-full text-left min-w-[480px]">
                    <thead>
                      <tr className="border-b border-slate-800/60 bg-slate-900/20">
                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">Operational Metric</th>
                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Before Autoniv</th>
                        <th className="p-4 text-xs font-bold uppercase tracking-wider" style={{ color: accentColor }}>After Autoniv</th>
                      </tr>
                    </thead>
                    <tbody>
                      {story.impact.metrics.map((m, i) => (
                        <tr 
                          key={i} 
                          className="hover:bg-slate-900/20 transition-colors border-b last:border-0"
                          style={{ borderColor: 'rgba(255,255,255,0.03)' }}
                        >
                          <td className="p-4 text-xs sm:text-sm font-medium text-slate-300">{m.metric}</td>
                          <td className="p-4 text-xs sm:text-sm text-slate-500 font-mono flex items-center gap-1.5">
                            <span className="text-red-500/80">✖</span> {m.before}
                          </td>
                          <td className="p-4 text-xs sm:text-sm font-black font-mono" style={{ color: accentColor }}>
                            <span className="mr-1.5" style={{ color: accentColor }}>✔</span> {m.after}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>

              {/* FAQs Accordion */}
              {story.faqs && story.faqs.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="pt-4"
                >
                  <h2 className="text-2xl font-black text-white mb-6">Case Study FAQs</h2>
                  <div className="space-y-4">
                    {story.faqs.map((faq, i) => (
                      <FAQItem key={i} question={faq.q} answer={faq.a} accentColor={accentColor} />
                    ))}
                  </div>
                </motion.div>
              )}

            </div>

            {/* Right Sidebar Column */}
            <div className="lg:col-span-4 space-y-8">
              
              {/* Quote Block Redesigned */}
              {story.quote && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="p-6 rounded-3xl border relative overflow-hidden bg-slate-900/20 backdrop-blur-md"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}
                >
                  {/* Decorative quote marks */}
                  <div className="absolute top-0 right-4 text-[120px] font-serif leading-none select-none pointer-events-none opacity-5 font-black" style={{ color: accentColor }}>
                    ”
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex gap-1.5 mb-4">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <span key={s} className="text-sm" style={{ color: accentColor }}>★</span>
                      ))}
                    </div>

                    <p className="text-sm italic leading-relaxed text-slate-300 mb-6 font-medium">
                      "{story.quote.text}"
                    </p>
                    
                    <div className="flex items-center gap-3 pt-4 border-t border-slate-800/60">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm"
                        style={{ background: `linear-gradient(135deg, ${accentColor}, #10B981)` }}
                      >
                        {story.quote.author.charAt(0)}
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-slate-100">{story.quote.author.split(',')[0]}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{story.quote.author.split(',').slice(1).join(',')}</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Side CTA Block */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="p-6 sm:p-8 rounded-3xl border relative overflow-hidden text-center"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(37,99,235,0.08) 0%, rgba(16,185,129,0.08) 100%)',
                  borderColor: 'rgba(37,99,235,0.15)'
                }}
              >
                <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-[40px] opacity-20 pointer-events-none" style={{ background: accentColor }} />
                
                <h3 className="text-lg font-bold text-white mb-2">Ready to get similar results?</h3>
                <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                  See how Autoniv can transform your {study.category.toLowerCase()} operations with custom workflows.
                </p>

                <div className="flex flex-col gap-3">
                  <Link 
                    to="/register" 
                    className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-bold text-white no-underline transition-all hover:-translate-y-0.5 text-xs"
                    style={{
                      background: 'linear-gradient(135deg,#2563EB,#10B981)',
                      boxShadow: '0 4px 16px rgba(16,185,129,0.25)',
                    }}
                  >
                    Get Started Free
                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </Link>
                  <Link 
                    to="/demo" 
                    className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-semibold no-underline transition-all hover:bg-white/10 text-xs border text-slate-300 border-slate-700 bg-transparent"
                  >
                    See a Live Demo →
                  </Link>
                </div>
              </motion.div>

            </div>
          </div>
        </div>
      </div>

      <ScrollToTop />
      <Footer />
    </div>
  );
}