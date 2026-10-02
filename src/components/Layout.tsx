import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Video, 
  History, 
  GitFork, 
  Info, 
  Cpu, 
  Radio, 
  Database,
  BarChart3,
  Sliders,
  Sparkles
} from 'lucide-react';
import { USE_MOCK_DATA } from '../services/api';
import { analysisService } from '../services/analysisService';

export default function Layout() {
  const location = useLocation();
  const [status, setStatus] = useState<'connected' | 'processing' | 'demo' | 'error'>('demo');
  const [isDemoMode, setIsDemoMode] = useState(USE_MOCK_DATA);

  // Monitor processing pipelines to update sidebar status
  useEffect(() => {
    const checkPipelines = async () => {
      try {
        const history = await analysisService.getHistory();
        const processing = history.some(a => a.status === 'processing');
        
        if (processing) {
          setStatus('processing');
        } else if (isDemoMode) {
          setStatus('demo');
        } else {
          // Check backend connection in real mode
          try {
            const res = await fetch('http://127.0.0.1:8000/api/health', { signal: AbortSignal.timeout(1000) });
            if (res.ok) {
              setStatus('connected');
            } else {
              setStatus('error');
            }
          } catch {
            setStatus('error');
          }
        }
      } catch {
        setStatus('error');
      }
    };

    checkPipelines();
    const interval = setInterval(checkPipelines, 3000);
    return () => clearInterval(interval);
  }, [isDemoMode]);

  const getStatusBadge = () => {
    switch (status) {
      case 'connected':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
            <span className="w-2 h-2 rounded-full pulse-green"></span>
            Connected
          </div>
        );
      case 'processing':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-medium">
            <span className="w-2 h-2 rounded-full pulse-blue"></span>
            Agent pipeline active
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
            <span className="w-2 h-2 rounded-full pulse-red"></span>
            Backend offline
          </div>
        );
      case 'demo':
      default:
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full pulse-yellow"></span>
            Demo Mode (Mock)
          </div>
        );
    }
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden text-[#f3f4f6]">
      {/* Live Optical Illusion Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none select-none"
        src="/hypnotic1.mp4"
      />

      {/* Subtle Glassmorphic Dark Overlay Scrim */}
      <div className="fixed inset-0 bg-[#070b14]/75 backdrop-blur-[2.5px] z-0 pointer-events-none" />

      {/* Main App Layout Grid */}
      <div className="flex h-full w-full relative z-10">
        {/* Persistent Glassmorphism Sidebar */}
        <aside className="w-64 flex flex-col border-r border-slate-800/70 bg-[#0d1321]/75 backdrop-blur-xl flex-shrink-0">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-slate-800/70">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-2 rounded-lg bg-indigo-500/15 border border-indigo-500/30 shadow-lg shadow-indigo-500/10">
                <Cpu className="w-5 h-5 text-indigo-400" />
              </div>
              <span className="font-bold text-sm tracking-wide text-indigo-200">VERITAS-V</span>
            </div>
            <h1 className="font-bold text-sm text-slate-100 leading-tight">
              Agentic Vision-Language Framework
            </h1>
            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-semibold">
              Causal Video Understanding
            </p>
          </div>

          {/* Sidebar Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-500/20 text-indigo-300 border-l-2 border-indigo-400 pl-3.5 shadow-md shadow-indigo-500/5'
                    : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                }`
              }
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </NavLink>

            <NavLink
              to="/new-analysis"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-500/20 text-indigo-300 border-l-2 border-indigo-400 pl-3.5 shadow-md shadow-indigo-500/5'
                    : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                }`
              }
            >
              <Video className="w-4 h-4" />
              New Analysis
            </NavLink>

            <NavLink
              to="/history"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-500/20 text-indigo-300 border-l-2 border-indigo-400 pl-3.5 shadow-md shadow-indigo-500/5'
                    : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                }`
              }
            >
              <History className="w-4 h-4" />
              Analysis History
            </NavLink>

            <NavLink
              to="/pipeline"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-500/20 text-indigo-300 border-l-2 border-indigo-400 pl-3.5 shadow-md shadow-indigo-500/5'
                    : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                }`
              }
            >
              <GitFork className="w-4 h-4" />
              Pipeline Details
            </NavLink>

            <NavLink
              to="/benchmarks"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-500/20 text-indigo-300 border-l-2 border-indigo-400 pl-3.5 shadow-md shadow-indigo-500/5'
                    : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                }`
              }
            >
              <BarChart3 className="w-4 h-4" />
              Benchmarks (MSR-VTT)
            </NavLink>

            <NavLink
              to="/config"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-500/20 text-indigo-300 border-l-2 border-indigo-400 pl-3.5 shadow-md shadow-indigo-500/5'
                    : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                }`
              }
            >
              <Sliders className="w-4 h-4" />
              Config Inspector
            </NavLink>

            <NavLink
              to="/about"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-500/20 text-indigo-300 border-l-2 border-indigo-400 pl-3.5 shadow-md shadow-indigo-500/5'
                    : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                }`
              }
            >
              <Info className="w-4 h-4" />
              About Project
            </NavLink>
          </nav>

          {/* Sidebar Footer Status Indicator */}
          <div className="p-4 border-t border-slate-800/70 bg-[#0a0e19]/80 backdrop-blur-md">
            <div className="text-[11px] text-slate-500 uppercase tracking-wider mb-2 font-bold">
              System Status
            </div>
            <div className="flex items-center justify-between">
              {getStatusBadge()}
              
              {/* Interactive Demo/API switch for presentation fallback */}
              <button
                onClick={() => setIsDemoMode(!isDemoMode)}
                className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                title="Toggle API / Demo Mode"
              >
                <Database className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="text-[9px] text-slate-500 mt-2 font-mono text-center">
              BE Project Viva Demo • v1.0.0
            </div>
          </div>
        </aside>

        {/* Main Workspace */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-transparent custom-scrollbar">
          {/* Header Bar */}
          <header className="h-16 border-b border-slate-800/70 px-8 flex items-center justify-between flex-shrink-0 bg-[#0d1321]/65 backdrop-blur-xl sticky top-0 z-40">
            <div>
              <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                {location.pathname === '/' && 'System Dashboard'}
                {location.pathname === '/new-analysis' && 'New Video Analysis'}
                {location.pathname.startsWith('/results') && 'Analysis Results'}
                {location.pathname === '/history' && 'Analysis History'}
                {location.pathname === '/pipeline' && 'Framework Architecture'}
                {location.pathname === '/benchmarks' && 'Quantitative Benchmark Engine'}
                {location.pathname === '/config' && 'Runtime Schemas & Environment Validator'}
                {location.pathname === '/about' && 'About Framework'}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-[11px] text-indigo-300 font-mono">
                <Sparkles className="w-3 h-3 text-indigo-400 animate-spin" />
                <span>Optical Illusion BG Live</span>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800/60 border border-slate-700/60">
                <Radio className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                <span>Status: {status.toUpperCase()}</span>
              </div>
            </div>
          </header>

          {/* Content Outlet */}
          <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
