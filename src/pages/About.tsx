import { 
  Info, 
  Lightbulb, 
  Flame
} from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      
      {/* Title */}
      <div className="p-8 rounded-2xl glass-panel relative overflow-hidden border border-slate-800 bg-[#0d1321]/30">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <Info className="w-3.5 h-3.5" /> Project Overview
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-100 leading-tight">
            Explainable Agentic Vision-Language Framework for Causal Video Understanding with Hallucination Verification
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Academic Project • Bachelor of Computer Engineering (B.E.)
          </p>
        </div>
      </div>

      {/* Grid: Problem and Solution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Problem Card */}
        <div className="p-6 rounded-xl border border-slate-850 bg-slate-900/10 space-y-3.5">
          <div className="flex items-center gap-2 text-rose-450">
            <Flame className="w-5 h-5 text-rose-500" />
            <h3 className="text-sm font-bold text-slate-200">The Problem</h3>
          </div>
          <p className="text-xs text-slate-450 leading-relaxed font-light text-justify">
            Current Vision-Language Models (VLMs) excel at describing generic static frames, but they struggle significantly with temporal causal reasoning. When generating explanations for sequence-based actions, they frequently exhibit **visual hallucinations**—generating claims that are physically contradicted by the video pixels—and fail to provide verifiable evidence links for the claims they output.
          </p>
        </div>

        {/* Solution Card */}
        <div className="p-6 rounded-xl border border-indigo-500/15 bg-indigo-500/5 space-y-3.5">
          <div className="flex items-center gap-2 text-indigo-400">
            <Lightbulb className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-indigo-300">Our Solution</h3>
          </div>
          <p className="text-xs text-indigo-300/80 leading-relaxed font-light text-justify">
            We propose a multi-stage **agentic framework** that isolates description, deduction, and factual verification into individual steps:
          </p>
          <ul className="text-[11px] text-indigo-300/70 space-y-1.5 pl-4 list-disc font-light">
            <li>Scene detection and frame-level captioning (Qwen2.5-VL)</li>
            <li>Synthesis into a global prose narrative</li>
            <li>Causal logic deduction between consecutive scenes</li>
            <li>Double-loop hallucination checking against raw video frames</li>
            <li>Explainable report compiler referencing frame coordinates & timestamps</li>
          </ul>
        </div>

      </div>

      {/* Visual core schema diagram */}
      <div className="p-6 rounded-2xl border border-slate-850 bg-slate-900/10 space-y-6">
        <h3 className="text-xs font-bold text-slate-200 text-center">Core Methodological Schema</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Box 1 */}
          <div className="p-4 rounded-xl border border-slate-850 bg-slate-950/40 text-center space-y-2">
            <span className="text-[10px] font-bold text-slate-500 font-mono">1. UNDERSTAND</span>
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto text-xs font-bold">U</div>
            <p className="text-[10px] text-slate-400">Extracts frame segments, transcribes audio tracks, and generates initial captions.</p>
          </div>

          {/* Box 2 */}
          <div className="p-4 rounded-xl border border-slate-850 bg-slate-950/40 text-center space-y-2">
            <span className="text-[10px] font-bold text-slate-500 font-mono">2. REASON</span>
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto text-xs font-bold">R</div>
            <p className="text-[10px] text-slate-400">Infers logical cause-and-effect links between scene events.</p>
          </div>

          {/* Box 3 */}
          <div className="p-4 rounded-xl border border-slate-850 bg-slate-950/40 text-center space-y-2">
            <span className="text-[10px] font-bold text-slate-500 font-mono">3. VERIFY</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-xs font-bold">V</div>
            <p className="text-[10px] text-slate-400">Audits LLM causal claims directly against extracted image frame pixels.</p>
          </div>

          {/* Box 4 */}
          <div className="p-4 rounded-xl border border-slate-850 bg-slate-950/40 text-center space-y-2">
            <span className="text-[10px] font-bold text-slate-500 font-mono">4. EXPLAIN</span>
            <div className="w-9 h-9 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center mx-auto text-xs font-bold">E</div>
            <p className="text-[10px] text-slate-400">Links final verified statements to frame directories and exact timestamps.</p>
          </div>
        </div>
      </div>

      {/* Tech stack section */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-200 border-b border-slate-850 pb-2">Academic Core Technologies</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 font-mono text-[10px]">
          
          <div className="p-3 rounded-lg border border-slate-850 bg-slate-900/5 flex items-center justify-between">
            <span className="text-slate-500">Vision model</span>
            <span className="text-indigo-400 font-bold">Qwen2.5-VL</span>
          </div>

          <div className="p-3 rounded-lg border border-slate-850 bg-slate-900/5 flex items-center justify-between">
            <span className="text-slate-500">Dialogue model</span>
            <span className="text-blue-400 font-bold">OpenAI Whisper</span>
          </div>

          <div className="p-3 rounded-lg border border-slate-850 bg-slate-900/5 flex items-center justify-between">
            <span className="text-slate-500">Causal orchestrator</span>
            <span className="text-violet-400 font-bold">LangChain Agents</span>
          </div>

          <div className="p-3 rounded-lg border border-slate-850 bg-slate-900/5 flex items-center justify-between">
            <span className="text-slate-500">Verification Auditor</span>
            <span className="text-emerald-400 font-bold">CLIP / GPT-4o Vision</span>
          </div>

          <div className="p-3 rounded-lg border border-slate-850 bg-slate-900/5 flex items-center justify-between">
            <span className="text-slate-500">Frontend Stack</span>
            <span className="text-slate-300 font-bold">Vite + React + TS</span>
          </div>

          <div className="p-3 rounded-lg border border-slate-850 bg-slate-900/5 flex items-center justify-between">
            <span className="text-slate-500">CSS framework</span>
            <span className="text-indigo-300 font-bold">Tailwind CSS v4</span>
          </div>

        </div>
      </div>

    </div>
  );
}
