import { createFileRoute } from '@tanstack/react-router';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  Share2,
  Code,
  Search,
  Layers,
  FileText,
  Globe,
  ArrowRight,
  ChevronRight,
  BookOpen,
  PenLine,
  Sparkles,
  Save,
  Lightbulb
} from 'lucide-react';

export const Route = createFileRoute('/')({
  beforeLoad: () => ({}),
  component: Home,
});

function Home() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-[hsl(270,80%,65%)] mb-4" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen w-full">
      {/* Hero Section */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="flex flex-col space-y-8 animate-fade-in">
              <div>
                <div className="inline-flex items-center px-3 py-1 rounded-full border border-[hsl(270,80%,65%)]/30 bg-[hsl(270,80%,65%)]/5 text-xs text-[hsl(270,80%,65%)] mb-6">
                  <Sparkles className="h-3 w-3 mr-1.5" />
                  AI-Powered Lesson Planning
                </div>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 gradient-text leading-tight">
                  Topical
                </h1>
                <p className="text-2xl font-medium mb-4 text-foreground/90">
                  Create, Organize, and Share Knowledge
                </p>
                <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
                  An intelligent platform for building structured lesson plans with rich MDX content — powered by AI and real-time web crawling.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-delay-1">
                {isAuthenticated ? (
                  <>
                    <Button asChild size="lg" className="text-base px-8 bg-[hsl(270,80%,65%)] hover:bg-[hsl(270,80%,60%)] text-white shadow-lg shadow-[hsl(270,80%,65%)]/20">
                      <a href="/dashboard">Go to Dashboard</a>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="text-base border-border/60 hover:border-[hsl(270,80%,65%)]">
                      <a href="/lesson-plan">Create Lesson Plan</a>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild size="lg" className="text-base px-8 bg-[hsl(270,80%,65%)] hover:bg-[hsl(270,80%,60%)] text-white shadow-lg shadow-[hsl(270,80%,65%)]/20">
                      <a href="/api/register">Get Started</a>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="text-base border-border/60 hover:border-[hsl(270,80%,65%)]">
                      <a href="/api/login">Sign In</a>
                    </Button>
                  </>
                )}
              </div>

              <div className="flex flex-wrap gap-3 mt-1 animate-fade-in-delay-2">
                {["AI-powered generation", "Real-time web crawling", "Community sharing", "Free to use"].map((label) => (
                  <div key={label} className="inline-flex items-center px-3 py-1.5 rounded-full border border-border/50 bg-card/50 text-xs text-muted-foreground">
                    <div className="h-1.5 w-1.5 rounded-full bg-[hsl(270,80%,65%)] mr-2" />
                    {label}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative hidden lg:block animate-fade-in-delay-3">
              <div className="absolute -inset-1 bg-gradient-to-r from-[hsl(270,80%,65%)] to-[hsl(220,90%,70%)] rounded-xl blur-xl opacity-15"></div>
              <div className="relative glass-card overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center space-x-2">
                      <div className="h-3 w-3 rounded-full bg-red-500/80"></div>
                      <div className="h-3 w-3 rounded-full bg-yellow-500/80"></div>
                      <div className="h-3 w-3 rounded-full bg-green-500/80"></div>
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">Topical Editor</div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-7 bg-[hsl(270,80%,65%)]/10 rounded w-3/4"></div>
                    <div className="h-4 bg-muted/30 rounded w-full"></div>
                    <div className="h-4 bg-muted/30 rounded w-5/6"></div>
                    <div className="h-4 bg-muted/30 rounded w-4/5"></div>
                    <div className="h-24 bg-muted/15 rounded w-full border border-border/30 p-3 mt-2">
                      <div className="h-3 bg-[hsl(270,80%,65%)]/15 rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-[hsl(270,80%,65%)]/15 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-[hsl(270,80%,65%)]/10 rounded w-2/3"></div>
                    </div>
                    <div className="h-4 bg-muted/30 rounded w-5/6"></div>
                    <div className="h-4 bg-muted/30 rounded w-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to create, organize, and share knowledge effectively
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Layers, title: "Hierarchical Lesson Plans", desc: "Create structured lesson plans with topics and subtopics organized in a clear hierarchy" },
              { icon: FileText, title: "Rich MDX Content", desc: "Beautiful content with Markdown, JSX, code blocks, and more using the built-in MDX editor" },
              { icon: Code, title: "Smart Web Crawling", desc: "Generate up-to-date content by intelligently crawling and processing relevant web sources" },
              { icon: Search, title: "Content Refinement", desc: "Refine your content with AI-powered suggestions and improvements" },
              { icon: Share2, title: "Share Your Knowledge", desc: "Publish your lesson plans to share with the community or keep them private" },
              { icon: Globe, title: "Community Learning", desc: "Browse and learn from lesson plans shared by other community members" },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="glass-card p-6 group">
                <div className="h-12 w-12 rounded-lg bg-[hsl(270,80%,65%)]/10 flex items-center justify-center mb-4 group-hover:bg-[hsl(270,80%,65%)]/20 transition-colors">
                  <Icon className="h-6 w-6 text-[hsl(270,80%,65%)]" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Create comprehensive lesson plans in just a few steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Create a Topic Hierarchy", desc: "Search for a main topic and build a structured hierarchy of subtopics" },
              { step: "2", title: "Generate MDX Content", desc: "Use web crawling, URLs, or LLM-only modes to generate rich content for each topic" },
              { step: "3", title: "Save and Share", desc: "Save your lesson plan and optionally publish it for others to learn from" },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-full border border-[hsl(270,80%,65%)]/30 bg-[hsl(270,80%,65%)]/5 flex items-center justify-center mb-6 relative animate-float" style={{ animationDelay: `${parseInt(step) * 0.5}s` }}>
                  <span className="text-2xl font-bold text-[hsl(270,80%,65%)]">{step}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{title}</h3>
                <p className="text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Use Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How to Use Topical</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A step-by-step guide to get the most out of the platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: BookOpen, title: "1. Create a New Lesson Plan", desc: "After signing in, navigate to the Lesson Plan page from your dashboard or navigation menu." },
              { icon: Search, title: "2. Search for a Topic", desc: "Use the search bar to find a main topic. The system generates a structured hierarchy of subtopics you can customize." },
              { icon: Sparkles, title: "3. Generate Content with AI", desc: "Select a topic and choose from web crawling, URL-based, or LLM-only content generation methods." },
              { icon: PenLine, title: "4. Edit and Refine", desc: "Use the MDX editor with code, preview, or split view modes. Select text and refine specific sections." },
              { icon: Save, title: "5. Save Your Lesson Plan", desc: "Save content per topic, then save the entire lesson plan when ready." },
              { icon: Share2, title: "6. Share Your Knowledge", desc: "Toggle the Public option to share your lesson plan with the community." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="glass-card p-6">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-[hsl(270,80%,65%)]/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-5 w-5 text-[hsl(270,80%,65%)]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 glass-card p-6">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-[hsl(270,80%,65%)]/10 flex items-center justify-center flex-shrink-0">
                <Lightbulb className="h-5 w-5 text-[hsl(270,80%,65%)]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Pro Tips</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div>
                    <h4 className="font-medium mb-1 text-sm">Content Generation</h4>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      The system combines real-time web crawling with LLM capabilities for up-to-date, accurate information. For current content, use web crawling or URL-based methods.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1 text-sm">Collaborative Learning</h4>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      Browse public lessons for inspiration. Use the "View Combined" option to see all topics in a single document.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="glass-card p-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 gradient-text">
              {isAuthenticated
                ? "Continue Your Learning Journey"
                : "Ready to Create Your First Lesson Plan?"}
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              {isAuthenticated
                ? "Create new lesson plans or explore content shared by the community."
                : "Join Topical today and start creating structured, high-quality lesson plans with AI."}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <>
                  <Button asChild size="lg" className="text-base px-8 bg-[hsl(270,80%,65%)] hover:bg-[hsl(270,80%,60%)] text-white">
                    <a href="/lesson-plan">
                      Create New Lesson Plan
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </a>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="text-base border-border/60 hover:border-[hsl(270,80%,65%)]">
                    <a href="/public-lessons">
                      Browse Public Lessons
                      <ChevronRight className="ml-1 h-5 w-5" />
                    </a>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild size="lg" className="text-base px-8 bg-[hsl(270,80%,65%)] hover:bg-[hsl(270,80%,60%)] text-white">
                    <a href="/api/register">
                      Get Started Free
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </a>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="text-base border-border/60 hover:border-[hsl(270,80%,65%)]">
                    <a href="/mdxPublic">
                      Explore Public Content
                      <ChevronRight className="ml-1 h-5 w-5" />
                    </a>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border/30">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-lg font-bold gradient-text">Topical</p>
              <p className="text-xs text-muted-foreground">Create, organize, and share knowledge</p>
            </div>
            <div className="flex gap-6 items-center">
              <a href="/about" className="text-xs text-muted-foreground hover:text-[hsl(270,80%,65%)] transition-colors">About</a>
              <a href="/mdxPublic" className="text-xs text-muted-foreground hover:text-[hsl(270,80%,65%)] transition-colors">Public Content</a>
              <div className="text-xs text-muted-foreground">© {new Date().getFullYear()} Topical</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
