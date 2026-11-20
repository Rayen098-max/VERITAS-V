import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Menu, X, ShieldCheck } from 'lucide-react';
import Footer from './Footer';

export default function Layout() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const stored = localStorage.getItem('veritas_theme');
      if (stored === 'light' || stored === 'dark') return stored;
    } catch {
      // ignore
    }
    // Default to dark as requested for cinematic studio look
    return 'dark';
  });

  // Apply theme to document element
  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('veritas_theme', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  // Track window scroll for nav transformation
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'New Analysis', path: '/new-analysis' },
    { name: 'Pipeline', path: '/pipeline' },
    { name: 'Benchmarks', path: '/benchmarks' },
    { name: 'About', path: '/about' },
  ];

  return (
    <div className="relative min-h-screen w-full bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col font-sans transition-colors duration-200">
      {/* Floating Top Navigation Bar */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 pointer-events-none px-4 sm:px-6 ${
          scrolled
            ? 'pt-2 pb-2.5 bg-[var(--bg-primary)]/85 backdrop-blur-md border-b border-[var(--border-subtle)]/40 shadow-xs'
            : 'pt-3'
        }`}
      >
        <nav
          className={`max-w-5xl mx-auto rounded-[20px] pointer-events-auto border transition-all duration-300 px-4 sm:px-5 flex items-center justify-between ${
            scrolled
              ? 'py-2.5 bg-[var(--nav-bg)] backdrop-blur-xl border-[var(--border-default)] shadow-[0_8px_30px_rgba(0,0,0,0.12)]'
              : 'py-3.5 bg-[var(--nav-bg)] backdrop-blur-md border-[var(--border-default)] shadow-[0_2px_12px_rgba(0,0,0,0.04)]'
          }`}
        >
          {/* Logo & Brand */}
          <NavLink to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-[var(--border-default)] bg-black flex items-center justify-center shadow-xs transition-transform duration-200 group-hover:scale-105">
              <img
                src="/logo.webp"
                alt="VERITAS-V Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-[var(--text-primary)] flex items-center gap-1.5">
                VERITAS-V
                <span className="w-1.5 h-1.5 rounded-full bg-[#6D5EF5] animate-pulse" />
              </span>
            </div>
          </NavLink>

          {/* Centered Navigation Links with Sliding Active Pill */}
          <div className="hidden md:flex items-center gap-1 p-1 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
            {navLinks.map((link) => {
              const isActive =
                link.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(link.path);

              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className="relative px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors select-none"
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavPill"
                      className="absolute inset-0 rounded-full bg-[var(--text-primary)] shadow-xs"
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    />
                  )}
                  <span
                    className={`relative z-10 ${
                      isActive
                        ? 'text-[var(--bg-primary)] font-semibold'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {link.name}
                  </span>
                </NavLink>
              );
            })}
          </div>

          {/* Right Controls: Theme Toggle & Mobile Hamburger */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors border border-transparent hover:border-[var(--border-default)] cursor-pointer"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(prev => !prev)}
              aria-label="Toggle navigation menu"
              className="md:hidden w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] border border-[var(--border-default)] cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </nav>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="md:hidden mt-2 max-w-5xl mx-auto rounded-[16px] bg-[var(--nav-bg)] backdrop-blur-2xl border border-[var(--border-default)] shadow-xl p-3 pointer-events-auto"
            >
              <div className="flex flex-col gap-1">
                {navLinks.map((link) => {
                  const isActive =
                    link.path === '/'
                      ? location.pathname === '/'
                      : location.pathname.startsWith(link.path);

                  return (
                    <NavLink
                      key={link.path}
                      to={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`px-4 py-2.5 rounded-[10px] text-xs font-medium flex items-center justify-between transition-colors ${
                        isActive
                          ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] font-semibold'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
                      }`}
                    >
                      <span>{link.name}</span>
                      {isActive && <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />}
                    </NavLink>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Page Content - Offset 96px/112px so content never clips under the floating navbar */}
      <main className="flex-1 relative z-10 w-full pt-24 sm:pt-28 flex flex-col">
        <Outlet />
      </main>

      {/* Global Studio Footer on Every Page */}
      <Footer />
    </div>
  );
}
