import { 
  GitFork, 
  ArrowDown, 
  FileVideo, 
  Scissors, 
  MessageSquare, 
  BookOpen, 
  BrainCircuit, 
  ShieldCheck, 
  FileText, 
  Code 
} from 'lucide-react';

interface AgentProfile {
  name: string;
  backendScript: string;
  purpose: string;
  input: string;
  output: string;
  icon: React.ReactNode;
  details: string;
}

export default function PipelineDetails() {
  const agents: AgentProfile[] = [
    {
      name: 'Video Segmentation Segmenter',
      backendScript: 'load_dataset_sample.py',
      purpose: 'Downloads sample clips from benchmarks, performs scene division, and extracts frames at uniform rates.',
      input: 'Benchmarked video ID or local file path',
      output: 'Segmented video directories and JPG frames',
      icon: <Scissors className="w-5 h-5 text-indigo-400" />,
      details: 'This preparatory script is responsible for downloading raw samples (e.g. MSR-VTT) and organizing frames under target structures for downstream visual modules.'
    },
    {
      name: 'Captioning & Dialogue Agent',
      backendScript: 'captioning.py / generate_captions.py',
      purpose: 'Generates descriptive natural language captions for each segmented scene using visual models.',
      input: 'Extract raw video frames and audio tracks',
      output: 'Scene-by-scene captions and speech transcripts',
      icon: <MessageSquare className="w-5 h-5 text-blue-400" />,
      details: 'Integrates state-of-the-art vision models (e.g., Qwen2.5-VL) to extract high-fidelity semantic descriptions of visual actions and transcribes dialogue.'
    },
    {
      name: 'Narrative Generation Agent',
      backendScript: 'generate_narrative.py',
      purpose: 'Aggregates individual scene captions and dialogue transcripts into a single fluid paragraph.',
      input: 'JSON captions catalog from scene detector',
      output: 'Combined global prose narrative',
      icon: <BookOpen className="w-5 h-5 text-sky-400" />,
      details: 'Resolves temporal gaps and overlaps across consecutive scenes to form a readable summary report of the entire video sequence.'
    },
    {
      name: 'Causal Reasoning Agent',
      backendScript: 'generate_causal_narrative.py',
      purpose: 'Evaluates logical correlations between consecutive scenes and establishes cause-effect links.',
      input: 'Global narrative text and scene keywords',
      output: 'JSON causal link nodes and causal narrative text',
      icon: <BrainCircuit className="w-5 h-5 text-violet-400" />,
      details: 'Triggers reasoning backends to map preceding event triggers (causes) to subsequent occurrences (effects), filtering coincidences from valid causal claims.'
    },
    {
      name: 'Hallucination Verification Agent',
      backendScript: 'generate_verification_report.py',
      purpose: 'Audits VLM causal claims directly against frame pixel contents to detect hallucinated statements.',
      input: 'Causal links JSON and scene frame files',
      output: 'Verification verdict report (Supported / Unsupported / Uncertain)',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
      details: 'Checks details like object colors, positions, or actors against actual visual frames to verify whether VLM descriptions match ground truth visual evidence.'
    },
    {
      name: 'Explainability & Evidence Module',
      backendScript: 'generate_explainability_report.py',
      purpose: 'Assembles the final evidence-grounded report linking verified claims to exact timestamps and frames.',
      input: 'Verification outputs, causal nodes, and scene data',
      output: 'Annotated explainability Markdown report and JSON',
      icon: <FileText className="w-5 h-5 text-amber-400" />,
      details: 'Compiles all agent records into an explainable narrative. Unsupported elements are flagged, and supporting frames are dynamically linked for manual verification.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Intro */}
      <div className="space-y-2 text-left">
        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
          <GitFork className="w-3.5 h-3.5" /> Pipeline Architecture
        </div>
        <h1 className="text-xl font-bold text-slate-100">Multi-Agent Vision-Language Framework</h1>
        <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
          The diagram below outlines the sequential coordination of specialized AI agents. This structure isolates description generation, logical causal deduction, and physical grounding into individual components to ensure explainability.
        </p>
      </div>

      {/* Schematic Flow Diagram */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 bg-[#0d1321]/30 flex flex-col items-center py-8">
        <h3 className="text-xs font-bold text-slate-350 uppercase tracking-widest mb-6 font-mono">Framework Execution Flow</h3>
        
        <div className="flex flex-col items-center gap-2.5 text-xs text-center w-full max-w-md">
          {/* Node: Input */}
          <div className="w-full p-3 rounded-lg bg-slate-900 border border-slate-850 flex items-center justify-between font-mono">
            <span className="text-[10px] text-slate-500">INPUT</span>
            <span className="font-semibold text-slate-200 flex items-center gap-1.5"><FileVideo className="w-3.5 h-3.5 text-indigo-400" /> RAW VIDEO SEGMENT</span>
          </div>

          <ArrowDown className="w-4 h-4 text-slate-750" />

          {/* Node: Segments */}
          <div className="w-full p-3 rounded-lg bg-[#0d1321] border border-slate-800 flex items-center justify-between font-semibold">
            <span className="text-[9px] font-mono text-indigo-400">STAGE 1</span>
            <span className="text-slate-200">Video Frame Extraction</span>
            <span className="text-[9px] font-mono text-slate-500">load_dataset_sample.py</span>
          </div>

          <ArrowDown className="w-4 h-4 text-slate-750" />

          {/* Node: Caption */}
          <div className="w-full p-3 rounded-lg bg-[#0d1321] border border-indigo-500/20 bg-indigo-500/5 flex items-center justify-between font-semibold">
            <span className="text-[9px] font-mono text-blue-400">STAGE 2 (VLM)</span>
            <span className="text-slate-200">Scene Captioning Agent</span>
            <span className="text-[9px] font-mono text-slate-500">captioning.py</span>
          </div>

          <ArrowDown className="w-4 h-4 text-slate-750" />

          {/* Node: Narrative */}
          <div className="w-full p-3 rounded-lg bg-[#0d1321] border border-slate-800 flex items-center justify-between font-semibold">
            <span className="text-[9px] font-mono text-sky-400">STAGE 3</span>
            <span className="text-slate-200">Narrative Generator</span>
            <span className="text-[9px] font-mono text-slate-500">generate_narrative.py</span>
          </div>

          <ArrowDown className="w-4 h-4 text-slate-750" />

          {/* Node: Causal */}
          <div className="w-full p-3 rounded-lg bg-[#0d1321] border border-indigo-500/20 bg-indigo-500/5 flex items-center justify-between font-semibold">
            <span className="text-[9px] font-mono text-violet-400">STAGE 4 (LLM)</span>
            <span className="text-slate-200">Causal Reasoning Agent</span>
            <span className="text-[9px] font-mono text-slate-500">generate_causal_narrative.py</span>
          </div>

          <ArrowDown className="w-4 h-4 text-slate-750" />

          {/* Node: Verification */}
          <div className="w-full p-3 rounded-lg bg-[#0d1321] border border-indigo-500/20 bg-indigo-500/5 flex items-center justify-between font-semibold">
            <span className="text-[9px] font-mono text-emerald-400">STAGE 5 (VISION-LLM)</span>
            <span className="text-slate-200">Hallucination Verification</span>
            <span className="text-[9px] font-mono text-slate-500">generate_verification_report.py</span>
          </div>

          <ArrowDown className="w-4 h-4 text-slate-750" />

          {/* Node: Explain */}
          <div className="w-full p-3 rounded-lg bg-[#0d1321] border border-slate-800 flex items-center justify-between font-semibold">
            <span className="text-[9px] font-mono text-amber-400">STAGE 6</span>
            <span className="text-slate-200">Explainability Compiler</span>
            <span className="text-[9px] font-mono text-slate-500">generate_explainability_report.py</span>
          </div>

          <ArrowDown className="w-4 h-4 text-slate-750" />

          {/* Node: Output */}
          <div className="w-full p-3 rounded-lg bg-slate-900 border border-slate-850 flex items-center justify-between font-mono">
            <span className="text-[10px] text-slate-550">OUTPUT</span>
            <span className="font-semibold text-emerald-450 flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> GROUNDED EXPLAINABLE REPORT</span>
          </div>
        </div>
      </div>

      {/* Agents Profiles grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2">Module Specifications</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {agents.map((agent, index) => (
            <div 
              key={index}
              className="p-5 rounded-xl border border-slate-850 bg-slate-900/10 flex flex-col justify-between space-y-4 hover:border-slate-800 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded bg-slate-950 border border-slate-850">
                    {agent.icon}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">{agent.name}</h4>
                    <span className="text-[9px] font-mono text-slate-500 flex items-center gap-1">
                      <Code className="w-3 h-3" /> Script: {agent.backendScript}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-normal font-light">
                  {agent.purpose}
                </p>
                <p className="text-[10px] text-slate-500 leading-normal bg-slate-950/20 p-2.5 rounded border border-slate-850/40">
                  {agent.details}
                </p>
              </div>

              {/* Data IO mappings */}
              <div className="pt-3 border-t border-slate-850/40 space-y-1.5 text-[9px] font-mono text-slate-500">
                <div className="flex items-start justify-between">
                  <span>INPUT:</span>
                  <span className="text-slate-400 font-semibold max-w-[180px] text-right line-clamp-1">{agent.input}</span>
                </div>
                <div className="flex items-start justify-between">
                  <span>OUTPUT:</span>
                  <span className="text-slate-400 font-semibold max-w-[180px] text-right line-clamp-1">{agent.output}</span>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
