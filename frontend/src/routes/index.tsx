import { createFileRoute, Link } from '@tanstack/react-router';
import { useAuth } from '@/lib/auth-context';
import { ArrowRight, Globe, PenLine, Layers, Zap, BookOpen, Brain } from 'lucide-react';

export const Route = createFileRoute('/')({
  beforeLoad: () => ({}),
  component: Home,
});

function Home() {
  const { isAuthenticated, registerUrl, registerAction } = useAuth();

  return (
    <div className="flex flex-col min-h-screen w-full overflow-x-hidden">

      {/* ── Hero ── */}
      <section className="relative flex flex-col items-center justify-center min-h-[90vh] px-4 text-center overflow-hidden">

        <div className="relative z-10 flex flex-col items-center space-y-7 max-w-4xl mx-auto">
          {/* Title */}
          <h1 className="animate-fade-in font-brand leading-none"
            style={{
              fontSize: 'clamp(5rem, 16vw, 11rem)',
              background: 'linear-gradient(140deg, #e2e8f0 0%, #94a3b8 40%, #cbd5e1 70%, #e2e8f0 100%)',
              backgroundSize: '300% 300%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'titleShimmer 10s ease-in-out infinite',
            }}>
            Topical
          </h1>

          {/* Tagline */}
          <p className="animate-fade-in-delay-1 text-xl md:text-2xl font-light text-white/60 max-w-2xl leading-relaxed tracking-wide">
            Where the{' '}
            <span className="text-white/90 font-medium">human brain</span>
            {' '}works with{' '}
            <span className="text-white/90 font-medium">artificial intelligence</span>
          </p>

          <p className="animate-fade-in-delay-2 text-base text-white/30 max-w-xl leading-relaxed">
            Create beautifully structured documents — lesson plans, research papers, technical docs — powered by AI that writes, and you who refines.
          </p>

          {/* CTA */}
          <div className="animate-fade-in-delay-2 flex flex-col sm:flex-row items-center gap-4 pt-2">
            <a
              href={isAuthenticated ? '/projects' : registerUrl}
              onClick={isAuthenticated ? undefined : registerAction}
              className="cta-btn group"
              id="cta-hero-start"
            >
              <span>{isAuthenticated ? 'Go to Projects' : 'Start for free'}</span>
              <span className="cta-arrow cta-arrow-animated">
                <ArrowRight className="h-5 w-5" />
              </span>
            </a>
            <Link to="/community"
              className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium text-white/35 hover:text-white/60 transition-colors duration-300"
              style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
              <Globe className="h-4 w-4" />
              Explore community
            </Link>
          </div>

          {/* Scroll indicator */}
          <div className="animate-fade-in-delay-3 flex flex-col items-center gap-2 pt-6 opacity-25">
            <div className="w-px h-12 bg-gradient-to-b from-transparent via-white/40 to-transparent" />
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-semibold text-white/80 mb-3 tracking-tight">Built for deep knowledge work</h2>
            <p className="text-white/25 text-base">Everything you need to go from idea to publishable document.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: Brain,
                title: 'Human + AI collaboration',
                desc: 'AI generates structured content from across the web. You guide, edit, and refine with full creative control.',
              },
              {
                icon: Zap,
                title: 'Instant generation',
                desc: 'Search a topic → get a full content hierarchy → generate individual sections in seconds.',
              },
              {
                icon: Layers,
                title: 'MDX & LaTeX support',
                desc: 'Write interactive MDX documents or professional LaTeX for academia, engineering, and science.',
              },
              {
                icon: PenLine,
                title: 'AI refinement',
                desc: 'Select any passage and ask the AI to improve, expand, simplify, or rewrite it inline.',
              },
              {
                icon: Globe,
                title: 'Publish & share',
                desc: 'Make any project public so others can read and learn. Build your knowledge portfolio.',
              },
              {
                icon: BookOpen,
                title: 'Community library',
                desc: 'Browse published lesson plans, research summaries, and technical docs from others.',
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="feature-card group">
                <div className="h-9 w-9 rounded-xl flex items-center justify-center mb-4 feature-icon-wrap">
                  <Icon className="h-4 w-4 feature-icon" />
                </div>
                <h3 className="text-sm font-semibold text-white/75 mb-2">{title}</h3>
                <p className="text-white/30 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-10 px-4 mt-auto" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="font-brand text-lg" style={{ background: 'linear-gradient(135deg,#94a3b8,#cbd5e1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Topical</span>
              <span className="text-white/10 text-xs">·</span>
              <span className="text-xs text-white/15">Where humans and AI create together</span>
            </div>
            <div className="flex gap-6 items-center">
              <Link to="/community" className="text-xs text-white/20 hover:text-white/45 transition-colors">Community</Link>
              <Link to="/profile" className="text-xs text-white/20 hover:text-white/45 transition-colors">Profile</Link>
              <div className="text-xs text-white/10">© {new Date().getFullYear()} Topical</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
