import {
  createRootRouteWithContext,
  Link,
  Outlet,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner"
import { type QueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef, useCallback } from "react";
import { Menu, X, User } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
// import { TanStackRouterDevtools } from '@tanstack/router-devtools'

interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: Root,
});

// ─── Custom Cursor Component ───
function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const cursor = cursorRef.current;
    const trail = trailRef.current;
    if (!cursor || !trail) return;

    let mouseX = 0;
    let mouseY = 0;
    let trailX = 0;
    let trailY = 0;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.left = `${mouseX}px`;
      cursor.style.top = `${mouseY}px`;
    };

    // Smooth trail follow
    const animateTrail = () => {
      trailX += (mouseX - trailX) * 0.15;
      trailY += (mouseY - trailY) * 0.15;
      trail.style.left = `${trailX}px`;
      trail.style.top = `${trailY}px`;
      requestAnimationFrame(animateTrail);
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a, button, input, textarea, select, [role="button"], label')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseover", onMouseOver);
    animateTrail();

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseover", onMouseOver);
    };
  }, []);

  return (
    <>
      <div ref={cursorRef} className={`custom-cursor ${isHovering ? "hovering" : ""}`} />
      <div ref={trailRef} className="custom-cursor-trail" />
    </>
  );
}

// ─── Mouse-follow Glow Component ───
function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const glow = glowRef.current;
    if (!glow) return;

    let x = 0, y = 0, glowX = 0, glowY = 0;

    const onMouseMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
    };

    const animate = () => {
      glowX += (x - glowX) * 0.05;
      glowY += (y - glowY) * 0.05;
      glow.style.left = `${glowX}px`;
      glow.style.top = `${glowY}px`;
      requestAnimationFrame(animate);
    };

    document.addEventListener("mousemove", onMouseMove);
    animate();

    return () => document.removeEventListener("mousemove", onMouseMove);
  }, []);

  return <div ref={glowRef} className="cursor-glow" />;
}

function NavBar() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const NavLinks = ({ isMobile = false }: { isMobile?: boolean }) => (
    <>
      {isAuthenticated && (
        <>
          <Link to="/dashboard" className="[&.active]:text-[hsl(270,80%,65%)] text-sm hover:text-[hsl(270,80%,65%)] transition-colors py-2">
            Dashboard
          </Link>
          <Link to="/lesson-plan" className="[&.active]:text-[hsl(270,80%,65%)] text-sm hover:text-[hsl(270,80%,65%)] transition-colors py-2">
            Lesson Plan
          </Link>
          <Link to="/mdx" className="[&.active]:text-[hsl(270,80%,65%)] text-sm hover:text-[hsl(270,80%,65%)] transition-colors py-2">
            MDX Editor
          </Link>
          <Link to="/public-lessons" className="[&.active]:text-[hsl(270,80%,65%)] text-sm hover:text-[hsl(270,80%,65%)] transition-colors py-2">
            Public Lessons
          </Link>
          {!isMobile && <span className="hidden md:block w-px h-5 bg-border mx-1" />}
          {isMobile && <hr className="border-border my-2" />}
        </>
      )}

      <Link to="/mdxPublic" className="[&.active]:text-[hsl(270,80%,65%)] text-sm hover:text-[hsl(270,80%,65%)] transition-colors py-2">
        MDX Public
      </Link>
      <Link to="/about" className="[&.active]:text-[hsl(270,80%,65%)] text-sm hover:text-[hsl(270,80%,65%)] transition-colors py-2">
        About
      </Link>
    </>
  );

  const AuthButtons = () => (
    <>
      {isLoading ? (
        <Button size="sm" variant="ghost" disabled className="text-xs opacity-70">
          <span className="animate-pulse">Authenticating...</span>
        </Button>
      ) : isAuthenticated ? (
        <div className="flex items-center gap-2">
          {user?.given_name && (
            <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{user.given_name}</span>
            </div>
          )}
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-8 px-3 border-border/60 hover:border-[hsl(270,80%,65%)] hover:text-[hsl(270,80%,65%)] transition-all"
            onClick={(e) => {
              e.preventDefault();
              logout();
            }}
          >
            Logout
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Button asChild size="sm" variant="outline" className="text-xs h-8 px-3 border-border/60 hover:border-[hsl(270,80%,65%)]">
            <a href="/api/login">Login</a>
          </Button>
          <Button asChild size="sm" className="text-xs h-8 px-3 bg-[hsl(270,80%,65%)] hover:bg-[hsl(270,80%,60%)] text-white">
            <a href="/api/register">Signup</a>
          </Button>
        </div>
      )}
    </>
  );

  return (
    <nav className="nav-glass sticky top-0 z-50 px-4 py-3 w-full">
      <div className="flex justify-between items-center w-full max-w-7xl mx-auto">
        <Link to="/" className="text-xl font-bold gradient-text z-10 flex-shrink-0">
          Topical
        </Link>

        <div className="hidden md:flex md:items-center md:gap-6">
          <NavLinks isMobile={false} />
          <div className="ml-2">
            <AuthButtons />
          </div>
        </div>

        <button
          className="md:hidden z-10 p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-background z-50 md:hidden overflow-y-auto">
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center p-4 border-b border-border/40">
                <Link
                  to="/"
                  className="text-xl font-bold gradient-text"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Topical
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="Close menu"
                  className="p-1"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex flex-col gap-4 p-6 text-base">
                <NavLinks isMobile={true} />
                <div className="mt-4">
                  <AuthButtons />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

function Root() {
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background effects */}
      <div className="grid-bg" />
      <CursorGlow />
      <CustomCursor />

      {/* Content */}
      <NavBar />
      <main className="flex-1 px-4 py-6 w-full mx-auto relative z-10">
        <Outlet />
      </main>
      <Toaster />
      {/* <TanStackRouterDevtools /> */}
    </div>
  );
}
