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
  Database
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
    <div className="flex h-screen w-screen overflow-hidden bg-[#0b0f19] text-[#f3f4f6]">
      {/* Persistent Sidebar */}
      <aside className="w-64 flex flex-col border-r border-slate-800 bg-[#0d1321] flex-shrink-0">
        
        {/* Sidebar Header */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/30">
              <Cpu className="w-5 h-5 text-indigo-400" />
            </div>
            <span className="font-bold text-sm tracking-wide text-indigo-200">VISION-CAUSAL</span>
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
                  ? 'bg-indigo-500/10 text-indigo-300 border-l-2 border-indigo-500 pl-3.5'
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
                  ? 'bg-indigo-500/10 text-indigo-300 border-l-2 border-indigo-500 pl-3.5'
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
                  ? 'bg-indigo-500/10 text-indigo-300 border-l-2 border-indigo-500 pl-3.5'
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
                  ? 'bg-indigo-500/10 text-indigo-300 border-l-2 border-indigo-500 pl-3.5'
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
              }`
            }
          >
            <GitFork className="w-4 h-4" />
            Pipeline Details
          </NavLink>

          <NavLink
            to="/about"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-500/10 text-indigo-300 border-l-2 border-indigo-500 pl-3.5'
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
              }`
            }
          >
            <Info className="w-4 h-4" />
            About Project
          </NavLink>
        </nav>

        {/* Sidebar Footer Status Indicator */}
        <div className="p-4 border-t border-slate-800 bg-[#0a0e19]">
          <div className="text-[11px] text-slate-500 uppercase tracking-wider mb-2 font-bold">
            System Status
          </div>
          <div className="flex items-center justify-between">
            {getStatusBadge()}
            
            {/* Interactive Demo/API switch for presentation fallback */}
            <button
              onClick={() => setIsDemoMode(!isDemoMode)}
              className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors"
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
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#0b0f19] custom-scrollbar">
        {/* Header Bar */}
        <header className="h-16 border-b border-slate-800/80 px-8 flex items-center justify-between flex-shrink-0 bg-[#0d1321]/50 backdrop-blur-md sticky top-0 z-40">
          <div>
            <h2 className="text-sm font-bold text-slate-300">
              {location.pathname === '/' && 'System Dashboard'}
              {location.pathname === '/new-analysis' && 'New Video Analysis'}
              {location.pathname.startsWith('/results') && 'Analysis Results'}
              {location.pathname === '/history' && 'Analysis History'}
              {location.pathname === '/pipeline' && 'Framework Architecture'}
              {location.pathname === '/about' && 'About Framework'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs text-slate-400 flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800/50 border border-slate-700/50">
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
  );
}
