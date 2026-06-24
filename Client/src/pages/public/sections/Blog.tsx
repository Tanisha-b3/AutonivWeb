import { Link } from "react-router-dom";
import { Reveal } from "./utils";

const posts = [
  { tag: "Product", date: "June 18, 2026", title: "Autoniv 2.0: Real-time Voice Cloning & Calendar Sync", desc: "Introducing state-of-the-art voice cloning latency improvements and direct native integrations with Google Calendar and Outlook.", readTime: "4 min read", emoji: "🖥️" },
  { tag: "Industry", date: "June 10, 2026", title: "How AI Voice Agents Are Redefining Customer Service in 2026", desc: "Explore the state of voice conversational interfaces — latency benchmarks, accuracy improvements, and multi-lingual configurations.", readTime: "6 min read", emoji: "🎙️" },
  { tag: "Security", date: "May 28, 2026", title: "Autoniv Achieves SOC 2 Type II Security Certification", desc: "Security is at the core of our platform. Learn how we completed the SOC 2 Type II audit for enterprise-grade data protection.", readTime: "3 min read", emoji: "🔒" },
];

export function Blog() {
  return (
    <section id="news" className="section-box white">
      <div className="section-pad relative overflow-hidden">
        <Reveal className="text-center mb-12 space-y-4">
          <span className="tag px-4 py-1.5 rounded-full inline-block" style={{ color: "#2563EB", background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.3)" }}>News</span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold" style={{ color: "#0a0a0a" }}>Latest News <span className="gradient-text">& Updates</span></h2>
          <p className="text-sm sm:text-base max-w-2xl mx-auto" style={{ color: "#475569" }}>Tips, guides, and news from the Autoniv team</p>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {posts.map((post, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div className="rounded-2xl overflow-hidden transition-all duration-300 group cursor-pointer flex flex-col h-full"
                style={{ background: '#ffffff', border: '1px solid rgba(37,99,235,0.08)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 12px 40px rgba(37,99,235,0.08)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.03)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <div className="h-40 w-full flex items-center justify-center text-4xl" style={{ background: `linear-gradient(135deg, rgba(37,99,235,${0.06 + i * 0.02}), rgba(16,185,129,${0.04 + i * 0.02}))` }}>
                  {post.emoji}
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ color: '#2563EB', background: 'rgba(37,99,235,0.08)' }}>{post.tag}</span>
                    <span className="text-xs" style={{ color: '#94a3b8' }}>{post.date}</span>
                  </div>
                  <h3 className="text-base font-bold mb-2 leading-snug" style={{ color: '#0a0a0a' }}>{post.title}</h3>
                  <p className="text-xs leading-relaxed mb-4" style={{ color: '#475569' }}>{post.desc}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-xs" style={{ color: '#94a3b8' }}>{post.readTime}</span>
                    <Link to="/news" className="flex items-center gap-1.5 text-xs font-semibold transition-all" style={{ color: '#10B981', textDecoration: 'none' }}>
                      Read More
                      <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link to="/news" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all"
            style={{ border: '1px solid rgba(37,99,235,0.2)', color: '#2563EB', background: 'transparent', textDecoration: 'none' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(37,99,235,0.06)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
            View All News
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
