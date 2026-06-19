const BLOG_POSTS = [
  {
    title: 'What Are AI Voice Agents and How Do They Work?',
    excerpt: 'A complete guide to understanding AI voice agents, their technology, and how they can transform your business communication.',
    category: 'Product',
    date: 'June 2026',
    readTime: '5 min read',
  },
  {
    title: '10 Ways AI Voice Agents Can Boost Your Sales',
    excerpt: 'Discover how businesses are using AI-powered calling to increase lead conversion rates by 3x.',
    category: 'Use Cases',
    date: 'June 2026',
    readTime: '7 min read',
  },
  {
    title: 'The Future of Customer Support: AI vs Human Agents',
    excerpt: 'Why the best approach combines AI efficiency with human empathy for exceptional customer experiences.',
    category: 'Industry',
    date: 'May 2026',
    readTime: '6 min read',
  },
  {
    title: 'How to Set Up Your First AI Voice Agent in 5 Minutes',
    excerpt: 'Step-by-step tutorial to deploy your first AI agent on Autoniv — no coding required.',
    category: 'Tutorial',
    date: 'May 2026',
    readTime: '4 min read',
  },
];

export function Blog() {
  return (
    <div className="min-h-screen" style={{ background: '#050d1a' }}>
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-16">

        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <h1 style={{ color: '#e8f8ff', fontSize: 36, fontWeight: 700, marginBottom: 16 }}>Blog</h1>
          <p style={{ color: 'rgba(148,175,210,0.65)', fontSize: 15 }}>
            Insights, tutorials, and updates from the Autoniv team.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {BLOG_POSTS.map(post => (
            <article key={post.title} style={{
              padding: 28, borderRadius: 14,
              border: '1px solid rgba(0,119,255,0.12)',
              background: 'rgba(6,18,36,0.5)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,119,255,0.3)'; e.currentTarget.style.background = 'rgba(0,119,255,0.04)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,119,255,0.12)'; e.currentTarget.style.background = 'rgba(6,18,36,0.5)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{
                  padding: '3px 10px', borderRadius: 6,
                  background: 'rgba(0,119,255,0.1)', color: '#0077ff',
                  fontSize: 11.5, fontWeight: 600,
                }}>{post.category}</span>
                <span style={{ color: 'rgba(148,175,210,0.45)', fontSize: 12 }}>{post.date}</span>
                <span style={{ color: 'rgba(148,175,210,0.45)', fontSize: 12 }}>·</span>
                <span style={{ color: 'rgba(148,175,210,0.45)', fontSize: 12 }}>{post.readTime}</span>
              </div>
              <h2 style={{ color: '#e8f8ff', fontSize: 17, fontWeight: 600, marginBottom: 8, lineHeight: 1.4 }}>{post.title}</h2>
              <p style={{ color: 'rgba(148,175,210,0.65)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>{post.excerpt}</p>
            </article>
          ))}
        </div>

        {/* Coming Soon */}
        <div style={{
          textAlign: 'center', marginTop: 48, padding: 40, borderRadius: 16,
          border: '1px dashed rgba(0,119,255,0.2)', background: 'rgba(0,119,255,0.02)',
        }}>
          <p style={{ color: 'rgba(148,175,210,0.5)', fontSize: 14 }}>
            More articles coming soon. Stay tuned for tutorials, product updates, and industry insights.
          </p>
        </div>

      </div>
    </div>
  );
}

export default Blog;
