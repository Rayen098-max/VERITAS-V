import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Sparkles,
  GitBranch,
  SearchCheck,
  FileSpreadsheet,
  Layers,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Cpu,
  Eye,
  FileCheck2,
  Activity,
  Video,
  Award,
  BookOpen,
  Camera,
  Server,
  Zap,
} from 'lucide-react';

export const About: React.FC<{ onNavigateToPipeline?: () => void }> = ({
  onNavigateToPipeline,
}) => {
  const navigate = useNavigate();
  const handleNavigate = () => {
    if (onNavigateToPipeline) onNavigateToPipeline();
    else navigate('/pipeline');
  };
  const [activeStage, setActiveStage] = useState<number>(1);

  const pipelineStages = [
    {
      stage: 1,
      title: 'Scene Detection & Per-Scene Captioning',
      script: 'captioning.py',
      agent: 'Perception Agent',
      desc: 'Segments the input video into semantic scenes using PySceneDetect content detection, extracts keyframes with FFmpeg, transcribes speech with OpenAI Whisper, and generates dense captions with keywords via swappable VLM backends.',
      tools: ['PySceneDetect (threshold=40.0)', 'FFmpeg Keyframe Extractor', 'Whisper ASR (tiny-large)', 'GPT-4o / Qwen2.5-VL / Mock'],
      inputs: 'Raw MP4/MKV video stream',
      outputs: '<video>_captions.json with timestamps, frames, transcripts & keywords'
    },
    {
      stage: 2,
      title: 'Narrative Synthesis',
      script: 'generate_narrative.py',
      agent: 'Narrative Synthesis Agent',
      desc: 'Reads per-scene captions and synthesizes them chronologically into a single, cohesive paragraph describing the video as a unified story rather than isolated snippets.',
      tools: ['Rhetorical Transition Sequencer', 'Temporal Flow Formatter', 'Mock / LLM Backend'],
      inputs: '<video>_captions.json',
      outputs: '<video>_narrative.txt unified continuous prose'
    },
    {
      stage: 3,
      title: 'Causal Reasoning & Dependency Graph',
      script: 'generate_causal_narrative.py',
      agent: 'Causal Reasoning Agent',
      desc: 'Analyzes adjacent scenes to determine physical and behavioral cause-and-effect chains (e.g., "beaker shattered because researcher lost grip"). Computes keyword overlap and explicitly flags disconnected scenes with no_link_detected.',
      tools: ['Semantic Overlap Graph', 'Causal Pairwise Evaluator', 'Confidence Scorer'],
      inputs: '<video>_captions.json',
      outputs: '<video>_causal.json & <video>_causal_narrative.txt'
    },
    {
      stage: 4,
      title: 'Hallucination Verification',
      script: 'generate_verification_report.py',
      agent: 'Hallucination Verification Agent',
      desc: 'Cross-references every causal claim against the extracted visual frames. Categorizes each claim into VERIFIED, CONTRADICTED, UNVERIFIED, or UNVERIFIABLE, eliminating ungrounded AI hallucinations.',
      tools: ['Visual Grounding Validator', 'Frame Image Consistency Check', 'Heuristic / VLM Adapter'],
      inputs: '<video>_causal.json + Extracted Frame Directory',
      outputs: '<video>_verification.json with verdicts, confidence & reasoning'
    },
    {
      stage: 5,
      title: 'Explainability Audit Assembly',
      script: 'generate_explainability_report.py',
      agent: 'Deterministic Assembler',
      desc: 'Assembles the definitive evidence-backed report. Every claim is mapped to exact frame files and timestamp spans. Contradicted claims are excluded from the final narrative while preserved in the audit trail.',
      tools: ['Deterministic Schema Combiner', 'Frame Citation Indexer', 'Markdown / JSON Formatter'],
      inputs: 'Captions + Causal + Verification JSONs',
      outputs: '<video>_explained.json and human-readable <video>_explained.md'
    },
    {
      stage: 6,
      title: 'Benchmark Evaluation Engine',
      script: 'evaluate_captions.py',
      agent: 'Benchmarking Suite',
      desc: 'Computes academic NLP metrics (BLEU-4, ROUGE-L, METEOR) comparing synthesized video narratives against human reference annotations from MSR-VTT and ActivityNet Captions.',
      tools: ['NLTK BLEU-4 Calculator', 'ROUGE-L Longest Common Subsequence', 'METEOR Alignment Scorer'],
      inputs: 'Synthesized narrative vs datasets/*/ground_truth.json',
      outputs: 'msrvtt_evaluation.json and comparative metric charts'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
      {/* Hero Section */}
      <section className="relative rounded-xl border border-slate-800 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 p-6 md:p-10 shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <ShieldAlert className="w-96 h-96 text-indigo-400" />
        </div>

        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 text-xs font-mono">
            <Award className="w-3.5 h-3.5 text-indigo-400" />
            <span>Computer Engineering Final Year Major Project (BE Thesis)</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white font-sans">
            VERITAS
          </h1>

          <p className="text-lg md:text-xl font-medium text-indigo-200/90 font-sans leading-relaxed">
            Explainable Agentic Vision-Language Framework for Causal Video Understanding with Hallucination Verification
          </p>

          <p className="text-slate-400 text-sm md:text-base leading-relaxed">
            Standard Vision-Language Models describe <span className="text-slate-200 font-semibold">what</span> appears in individual video snapshots, but fail to explain <span className="text-indigo-300 font-semibold">why</span> events unfold. Furthermore, traditional models routinely generate superficial descriptions and ungrounded hallucinations. VERITAS solves this through a 6-stage multi-agent pipeline that extracts causal relationships, verifies claims against raw video keyframes, and produces forensic, evidence-backed audit reports.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={handleNavigate}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-semibold shadow-lg shadow-indigo-900/30 transition-all cursor-pointer"
            >
              <span>Launch Live Pipeline</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-mono text-xs">
              <Server className="w-3.5 h-3.5 text-emerald-400" />
              <span>Pluggable: Mock · Qwen2.5-VL · GPT-4o Batch</span>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement vs VERITAS Solution Matrix */}
      <section className="space-y-4">
        <div className="border-b border-slate-800 pb-2">
          <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-semibold">
            Research Context & Core Motivation
          </span>
          <h2 className="text-xl md:text-2xl font-bold text-slate-100 mt-1">
            Bridging the Gap Between Surface Captioning and Causal Explainability
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Traditional VLM Limitations */}
          <div className="rounded-lg border border-rose-900/40 bg-rose-950/10 p-5 space-y-3">
            <div className="flex items-center gap-2.5 text-rose-400 font-mono text-sm font-bold">
              <XCircle className="w-4 h-4 text-rose-400" />
              <span>Conventional Vision-Language Models (VLMs)</span>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-mono font-bold">•</span>
                <span>
                  <strong className="text-slate-200">Disconnected Snapshot Descriptions:</strong> Generates isolated captions per frame without chronological continuity or inter-scene narrative flow.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-mono font-bold">•</span>
                <span>
                  <strong className="text-slate-200">Lack of Causal Attribution:</strong> Fails to explain reasons behind state transitions (e.g., stating a glass is broken without linking it to the antecedent drop).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-mono font-bold">•</span>
                <span>
                  <strong className="text-slate-200">Visual Hallucinations:</strong> Fabricates objects, speculative actions, or non-existent actors with zero empirical grounding.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-mono font-bold">•</span>
                <span>
                  <strong className="text-slate-200">Unverifiable Black-Box Outputs:</strong> Produces unstructured prose lacking specific timestamp spans, keyframe checksums, or frame citations.
                </span>
              </li>
            </ul>
          </div>

          {/* VERITAS Framework Solutions */}
          <div className="rounded-lg border border-emerald-900/40 bg-emerald-950/10 p-5 space-y-3">
            <div className="flex items-center gap-2.5 text-emerald-400 font-mono text-sm font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>The VERITAS Agentic Architecture</span>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-mono font-bold">•</span>
                <span>
                  <strong className="text-slate-200">Automated Multi-Modal Scene Extraction:</strong> Combines PySceneDetect, FFmpeg keyframes, and Whisper audio transcripts into structured scene units.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-mono font-bold">•</span>
                <span>
                  <strong className="text-slate-200">Causal Dependency Reasoning:</strong> Constructs an explicit cause-and-effect semantic graph with confidence scoring and link validation.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-mono font-bold">•</span>
                <span>
                  <strong className="text-slate-200">Frame-Level Hallucination Verification:</strong> Rigorously validates claims against raw image evidence, categorizing claims into explicit verdicts.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-mono font-bold">•</span>
                <span>
                  <strong className="text-slate-200">Auditable Evidence Reports:</strong> Deterministically generates dual-format outputs (.json & .md) citing exact frame filenames and timestamps.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Interactive 6-Stage Pipeline Roadmap */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-semibold">
              System Blueprint
            </span>
            <h2 className="text-xl md:text-2xl font-bold text-slate-100 mt-1">
              6-Stage Multi-Agent Architecture
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Click any stage to inspect agent responsibilities
          </span>
        </div>

        {/* Stepper Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
          {pipelineStages.map((s) => {
            const isSelected = activeStage === s.stage;
            return (
              <button
                key={s.stage}
                onClick={() => setActiveStage(s.stage)}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-950/70 border-indigo-500 text-indigo-200 ring-1 ring-indigo-500/50'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-850 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="font-bold text-indigo-400">Stage {s.stage}</span>
                  <span className="text-[10px] text-slate-500">{s.script.replace('.py', '')}</span>
                </div>
                <div className="mt-1 text-xs font-medium text-slate-200 line-clamp-1">
                  {s.title}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Stage Detail Card */}
        {(() => {
          const stage = pipelineStages.find((s) => s.stage === activeStage) || pipelineStages[0];
          return (
            <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded bg-indigo-950 border border-indigo-700 font-mono text-sm font-bold text-indigo-300">
                    STAGE {stage.stage}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-slate-100">{stage.title}</h3>
                    <p className="text-xs font-mono text-cyan-400">
                      Script: <span className="underline">{stage.script}</span> | Responsible Agent: <span className="text-slate-300">{stage.agent}</span>
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed">
                {stage.desc}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-3 rounded bg-slate-950 border border-slate-800">
                  <span className="text-[11px] font-mono uppercase text-slate-500 block mb-1">
                    Underlying Engines & Tools
                  </span>
                  <ul className="text-xs font-mono text-indigo-300 space-y-1">
                    {stage.tools.map((t, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 rounded bg-slate-950 border border-slate-800">
                  <span className="text-[11px] font-mono uppercase text-slate-500 block mb-1">
                    Input Artifacts
                  </span>
                  <p className="text-xs font-mono text-slate-300">
                    {stage.inputs}
                  </p>
                </div>

                <div className="p-3 rounded bg-slate-950 border border-slate-800">
                  <span className="text-[11px] font-mono uppercase text-slate-500 block mb-1">
                    Output Deliverables
                  </span>
                  <p className="text-xs font-mono text-emerald-400">
                    {stage.outputs}
                  </p>
                </div>
              </div>
            </div>
          );
        })()}
      </section>

      {/* Novel Features Matrix */}
      <section className="space-y-4">
        <div className="border-b border-slate-800 pb-2">
          <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-semibold">
            Technical Innovations
          </span>
          <h2 className="text-xl md:text-2xl font-bold text-slate-100 mt-1">
            VERITAS Feature Matrix
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-lg border border-slate-800 bg-slate-900/50 space-y-2">
            <div className="w-8 h-8 rounded bg-cyan-950/80 border border-cyan-700/60 flex items-center justify-center text-cyan-400">
              <Cpu className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-slate-200">Pluggable Multi-Backend Registry</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every stage utilizes a function-registry adapter pattern. Switch seamlessly between keyless local testing (<code className="text-cyan-300">mock</code>), local GPU inference (<code className="text-cyan-300">qwen25vl</code>), or production OpenAI models (<code className="text-cyan-300">gpt4o</code>) strictly via environment variables.
            </p>
          </div>

          <div className="p-5 rounded-lg border border-slate-800 bg-slate-900/50 space-y-2">
            <div className="w-8 h-8 rounded bg-emerald-950/80 border border-emerald-700/60 flex items-center justify-center text-emerald-400">
              <SearchCheck className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-slate-200">Frame-Indexed Evidence Auditing</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Eliminates unsubstantiated claims by tying every assertion to concrete visual keyframe filenames (<code className="text-emerald-300">frame_008.jpg</code> to <code className="text-emerald-300">frame_011.jpg</code>) and timestamp ranges, enabling human-in-the-loop forensic inspection.
            </p>
          </div>

          <div className="p-5 rounded-lg border border-slate-800 bg-slate-900/50 space-y-2">
            <div className="w-8 h-8 rounded bg-amber-950/80 border border-amber-700/60 flex items-center justify-center text-amber-400">
              <BarChartIcon className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-slate-200">Rigorous Multi-Metric Benchmarking</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Integrated benchmark suite evaluating BLEU-4, ROUGE-L, and METEOR against official academic datasets including MSR-VTT (1,000 video test split) and ActivityNet Captions.
            </p>
          </div>
        </div>
      </section>

      {/* Target Real-World Applications */}
      <section className="space-y-4">
        <div className="border-b border-slate-800 pb-2">
          <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-semibold">
            Deployment Scenarios
          </span>
          <h2 className="text-xl md:text-2xl font-bold text-slate-100 mt-1">
            Target Industrial & Scientific Applications
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
            <div className="font-mono text-xs text-indigo-400 font-bold mb-1">01 / SURVEILLANCE</div>
            <h4 className="font-semibold text-slate-200 text-sm">Industrial Safety & Auditing</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Verifying protocol compliance in manufacturing, chemical laboratories, and cleanroom environments with verifiable evidence trails.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
            <div className="font-mono text-xs text-indigo-400 font-bold mb-1">02 / PUBLIC SAFETY</div>
            <h4 className="font-semibold text-slate-200 text-sm">Traffic Incident Forensic Reconstruction</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Determining precise causality in multi-vehicle collisions, red-light violations, and pedestrian near-miss events for legal insurance reports.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
            <div className="font-mono text-xs text-indigo-400 font-bold mb-1">03 / SECURITY</div>
            <h4 className="font-semibold text-slate-200 text-sm">Automated CCTV Forensic Search</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Filtering thousands of hours of surveillance footage to identify not just who was present, but what chain of actions triggered a security breach.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
            <div className="font-mono text-xs text-indigo-400 font-bold mb-1">04 / ACCESSIBILITY</div>
            <h4 className="font-semibold text-slate-200 text-sm">Rich Contextual Video Narratives</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Generating faithful, hallucination-free auditory descriptions for visually impaired audiences that explain the true story rather than disparate objects.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

function BarChartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  );
}

export default About;
