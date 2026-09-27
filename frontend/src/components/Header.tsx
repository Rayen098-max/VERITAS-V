import React from 'react';
import { Cpu, Database, Eye, Terminal, Activity, ShieldCheck } from 'lucide-react';
import { BackendConfigState } from '../types';

interface HeaderProps {
  config: BackendConfigState;
  onUpdateBackend?: (backend: BackendConfigState['captioningBackend']) => void;
  activeDataset?: string;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  onUpdateBackend,
  activeDataset = 'MSR-VTT / ActivityNet',
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/95 backdrop-blur-md px-4 py-2.5 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Branding & Attribution */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-950/80 border border-indigo-700/60 text-indigo-400 font-mono font-bold text-lg shadow-inner">
            <Eye className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight font-mono text-slate-100">
                VERITAS
              </span>
              <span className="text-xs px-2 py-0.5 rounded font-mono bg-indigo-950/70 border border-indigo-800/80 text-indigo-300 font-medium">
                v1.4-AGENTIC
              </span>
              <span className="hidden sm:inline-block text-[11px] font-mono text-slate-400 border-l border-slate-800 pl-2">
                BE Major Project (Computer Engineering)
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans tracking-wide">
              Explainable Agentic Vision-Language Framework for Causal Video Understanding with Hallucination Verification
            </p>
          </div>
        </div>

        {/* System Status Readout & Telemetry */}
        <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto justify-end">
          {/* Backend Mode Readout */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-xs">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400 text-[11px]">Backend:</span>
            <select
              value={config.captioningBackend}
              onChange={(e) => onUpdateBackend?.(e.target.value as any)}
              className="bg-transparent font-mono text-cyan-300 text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="gpt4o" className="bg-slate-900 text-slate-200">GPT-4o (Vision Batch)</option>
              <option value="mock" className="bg-slate-900 text-slate-200">Mock (Deterministic)</option>
              <option value="qwen25vl" className="bg-slate-900 text-slate-200">Qwen2.5-VL (Local VLM)</option>
            </select>
          </div>

          {/* GPU Status */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-xs">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400 text-[11px]">GPU:</span>
            <span className="font-mono text-emerald-300 text-xs font-semibold" title="NVIDIA Tesla T4 16GB (Kaggle Environment)">
              NVIDIA T4 (5.4/16 GB)
            </span>
          </div>

          {/* Active Dataset */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-xs">
            <Database className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400 text-[11px]">Dataset:</span>
            <span className="font-mono text-amber-300 text-xs font-semibold">
              {activeDataset}
            </span>
          </div>

          {/* Pipeline Liveliness Pill */}
          <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded bg-indigo-950/40 border border-indigo-800/40 text-[11px] font-mono text-indigo-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>PIPELINE READY</span>
          </div>
        </div>
      </div>
    </header>
  );
};
