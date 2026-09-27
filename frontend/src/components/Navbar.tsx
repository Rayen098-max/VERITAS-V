import React from 'react';
import {
  BookOpen,
  Network,
  PlayCircle,
  FileCheck2,
  BarChart3,
  Sliders,
} from 'lucide-react';

export type ActivePage =
  | 'about'
  | 'architecture'
  | 'analysis'
  | 'results'
  | 'benchmark'
  | 'config';

interface NavbarProps {
  activePage: ActivePage;
  onSelectPage: (page: ActivePage) => void;
  resultsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activePage,
  onSelectPage,
  resultsCount = 3,
}) => {
  const navItems: { id: ActivePage; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'about',
      label: 'About VERITAS',
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      id: 'architecture',
      label: 'System Architecture',
      icon: <Network className="w-4 h-4" />,
    },
    {
      id: 'analysis',
      label: 'New Analysis',
      icon: <PlayCircle className="w-4 h-4" />,
      badge: 'LIVE TERMINAL',
    },
    {
      id: 'results',
      label: 'Analysis Results',
      icon: <FileCheck2 className="w-4 h-4" />,
      badge: '7 TABS',
    },
    {
      id: 'benchmark',
      label: 'Benchmark Evaluation',
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: 'config',
      label: 'Config & JSON Inspector',
      icon: <Sliders className="w-4 h-4" />,
    },
  ];

  return (
    <nav className="w-full bg-slate-900/90 border-b border-slate-800 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto no-scrollbar py-1">
        <div className="flex items-center space-x-1 sm:space-x-2">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectPage(item.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-slate-800 text-indigo-300 border-b-2 border-indigo-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                      isActive
                        ? 'bg-indigo-950 text-indigo-300 border border-indigo-700/50'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
