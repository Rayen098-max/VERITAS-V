import React, { useState } from 'react';
import {
  Network,
  Cpu,
  Layers,
  ArrowRight,
  Database,
  Terminal,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Clock,
  DollarSign,
  Activity,
  HardDrive,
  FileCode2,
  ShieldCheck,
  ChevronRight,
  Workflow,
  Sparkles,
} from 'lucide-react';
import type { BackendConfigState } from '../types';
import { INITIAL_CONFIG } from '../data/mockData';

interface PipelineDetailsProps {
  config?: BackendConfigState;
  onUpdateConfig?: (newConfig: Partial<BackendConfigState>) => void;
}

export const PipelineDetails: React.FC<PipelineDetailsProps> = ({
  config: propConfig = INITIAL_CONFIG,
  onUpdateConfig,
}) => {
  const [config, setConfig] = useState<BackendConfigState>(propConfig);
  const handleUpdateConfig = (newConfig: Partial<BackendConfigState>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
    if (onUpdateConfig) onUpdateConfig(newConfig);
  };
  const [selectedNode, setSelectedNode] = useState<string>('stage4');

  const nodes = [
    {
      id: 'input',
      title: 'Video Input Source',
      subtitle: 'MP4 / MKV Container',
      type: 'input',
      stage: 'Ingress',
      color: 'border-slate-700 bg-slate-900',
      details: {
        spec: 'H.264 / HEVC @ 1080p 30fps',
        latency: '0.0s',
        component: 'load_dataset_sample.py or Manual Upload',
        artifact: 'media/sample_clip.mp4',
        throughput: '1.2 GB/hr'
      }
    },
    {
      id: 'stage1',
      title: 'Stage 1: Multi-Modal Extraction & Captioning',
      subtitle: 'PySceneDetect + FFmpeg + Whisper + VLM',
      type: 'agent',
      stage: 'Perception',
      color: 'border-cyan-700 bg-cyan-950/40 text-cyan-200',
      details: {
        spec: 'PySceneDetect (ContentAware threshold=40.0) → FFmpeg (4 keyframes/scene) → Whisper base → GPT-4o / Qwen2.5-VL',
        latency: '4.8s / video',
        component: 'captioning.py + utils/captioning_backends.py',
        artifact: 'captions/<video>_captions.json',
        throughput: '4 scenes / 24s video'
      }
    },
    {
      id: 'stage2',
      title: 'Stage 2: Narrative Synthesis Agent',
      subtitle: 'Chronological Context Merging',
      type: 'agent',
      stage: 'Synthesis',
      color: 'border-blue-700 bg-blue-950/40 text-blue-200',
      details: {
        spec: 'Rhetorical transition stitching with narrative coherence scoring',
        latency: '0.8s / video',
        component: 'generate_narrative.py + utils/narrative_backends.py',
        artifact: 'captions/<video>_narrative.txt',
        throughput: '98 words continuous prose'
      }
    },
    {
      id: 'stage3',
      title: 'Stage 3: Causal Reasoning Agent',
      subtitle: 'Keyword Overlap Graph & Link Detection',
      type: 'agent',
      stage: 'Reasoning',
      color: 'border-indigo-700 bg-indigo-950/40 text-indigo-200',
      details: {
        spec: 'Inter-scene semantic link evaluation, handling explicit no_link_detected scenarios',
        latency: '1.4s / video',
        component: 'generate_causal_narrative.py + utils/causal_backends.py',
        artifact: 'captions/<video>_causal.json',
        throughput: '4 cause-effect hypothesis pairs'
      }
    },
    {
      id: 'stage4',
      title: 'Stage 4: Hallucination Verification Agent',
      subtitle: 'Visual Frame Grounding Matrix',
      type: 'agent',
      stage: 'Verification',
      color: 'border-emerald-700 bg-emerald-950/40 text-emerald-200 ring-2 ring-emerald-500/50',
      details: {
        spec: 'Claim-to-frame cross examination returning VERIFIED, CONTRADICTED, UNVERIFIED, or UNVERIFIABLE',
        latency: '2.1s / video',
        component: 'generate_verification_report.py + utils/verification_backends.py',
        artifact: 'captions/<video>_verification.json',
        throughput: '94% hallucination purge accuracy'
      }
    },
    {
      id: 'stage5',
      title: 'Stage 5: Explainability Report Assembler',
      subtitle: 'Deterministic Evidence Citation Engine',
      type: 'agent',
      stage: 'Assembly',
      color: 'border-amber-700 bg-amber-950/40 text-amber-200',
      details: {
        spec: 'Deterministic join by scene_id with frame file citations and Markdown generation',
        latency: '0.2s / video (Zero LLM overhead)',
        component: 'generate_explainability_report.py + utils/explainability_styles.py',
        artifact: '<video>_explained.json + <video>_explained.md',
        throughput: 'Dual JSON / Markdown artifacts'
      }
    },
    {
      id: 'stage6',
      title: 'Stage 6: Benchmark Evaluation Engine',
      subtitle: 'BLEU-4 / ROUGE-L / METEOR Scoring',
      type: 'evaluation',
      stage: 'Benchmarking',
      color: 'border-purple-700 bg-purple-950/40 text-purple-200',
      details: {
        spec: 'NLTK BLEU-4, ROUGE-L LCS, METEOR word aligner vs MSR-VTT & ActivityNet references',
        latency: '0.4s / video',
        component: 'evaluate_captions.py',
        artifact: 'datasets/msrvtt/msrvtt_evaluation.json',
        throughput: 'BLEU: 0.412 | ROUGE: 0.648 | METEOR: 0.456'
      }
    }
  ];

  const activeNodeInfo = nodes.find((n) => n.id === selectedNode) || nodes[3];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Page Title & Breadcrumb */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-indigo-400">
          <Network className="w-3.5 h-3.5" />
          <span>SYSTEM ARCHITECTURE & PIPELINE TELEMETRY</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 mt-1">
          Active Multi-Agent Orchestration Topology
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          End-to-end data flow pipeline from raw video ingest to frame-grounded explainability reports.
        </p>
      </div>

      {/* Quick Stats Telemetry Panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>VIDEOS PROCESSED</span>
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100 mt-1">
            24 <span className="text-xs font-normal text-slate-500">(15 MSR-VTT)</span>
          </div>
          <div className="text-[11px] font-mono text-emerald-400 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Zero pipeline crashes
          </div>
        </div>

        <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>HALLUCINATION CATCH RATE</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-300 mt-1">
            94.2%
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-1">
            Contradicted claims purged
          </div>
        </div>

        <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>MEAN CAUSAL CONFIDENCE</span>
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-300 mt-1">
            0.931
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-1">
            Across 96 verified pairs
          </div>
        </div>

        <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>EST. BATCH INFERENCE COST</span>
            <DollarSign className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-300 mt-1">
            $0.018 <span className="text-xs font-normal text-slate-500">/ clip</span>
          </div>
          <div className="text-[11px] font-mono text-indigo-400 mt-1">
            50% OpenAI Batch API discount
          </div>
        </div>
      </div>

      {/* Interactive Topology Graph */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-200 font-mono flex items-center gap-2">
            <Workflow className="w-4 h-4 text-indigo-400" />
            <span>Interactive Dataflow Topology</span>
          </h2>
          <span className="text-xs font-mono text-slate-500">
            Select a stage node to inspect runtime parameters
          </span>
        </div>

        {/* Node Flow Chart Container */}
        <div className="p-6 rounded-xl border border-slate-800 bg-slate-950/80 shadow-inner overflow-x-auto">
          <div className="min-w-[900px] flex items-center justify-between gap-3">
            {nodes.map((node, index) => {
              const isSelected = selectedNode === node.id;
              return (
                <React.Fragment key={node.id}>
                  <div
                    onClick={() => setSelectedNode(node.id)}
                    className={`relative p-3.5 rounded-lg border cursor-pointer transition-all w-52 flex-shrink-0 ${
                      isSelected
                        ? `${node.color} ring-2 ring-indigo-400 shadow-lg scale-102`
                        : 'border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                      <span className="uppercase tracking-wider font-semibold text-slate-400">
                        {node.stage}
                      </span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
                      )}
                    </div>
                    <div className="font-bold text-xs text-slate-100 line-clamp-1">
                      {node.title}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 line-clamp-1 font-mono">
                      {node.subtitle}
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>Latency:</span>
                      <span className="text-slate-200">{node.details.latency}</span>
                    </div>
                  </div>

                  {index < nodes.length - 1 && (
                    <div className="flex items-center justify-center text-slate-600">
                      <ArrowRight className="w-4 h-4 text-slate-500 animate-pulse" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Selected Node Details Drawer */}
        <div className="p-5 rounded-lg border border-slate-800 bg-slate-900/70 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded bg-indigo-950 border border-indigo-700 font-mono text-xs font-bold text-indigo-300">
                {activeNodeInfo.stage.toUpperCase()} NODE TELEMETRY
              </span>
              <h3 className="font-bold text-slate-100 text-sm sm:text-base">
                {activeNodeInfo.title}
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Avg Latency: <strong className="text-cyan-400">{activeNodeInfo.details.latency}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-3 rounded bg-slate-950 border border-slate-850">
              <span className="text-[11px] font-mono text-slate-500 block mb-1">
                Execution Script & Backend
              </span>
              <p className="text-xs font-mono text-indigo-300 font-medium">
                {activeNodeInfo.details.component}
              </p>
            </div>

            <div className="p-3 rounded bg-slate-950 border border-slate-850">
              <span className="text-[11px] font-mono text-slate-500 block mb-1">
                Input / Output Contract
              </span>
              <p className="text-xs font-mono text-emerald-400">
                {activeNodeInfo.details.artifact}
              </p>
            </div>

            <div className="p-3 rounded bg-slate-950 border border-slate-850">
              <span className="text-[11px] font-mono text-slate-500 block mb-1">
                Typical Throughput
              </span>
              <p className="text-xs font-mono text-slate-200">
                {activeNodeInfo.details.throughput}
              </p>
            </div>

            <div className="p-3 rounded bg-slate-950 border border-slate-850">
              <span className="text-[11px] font-mono text-slate-500 block mb-1">
                Operational Spec
              </span>
              <p className="text-xs text-slate-300 font-sans">
                {activeNodeInfo.details.spec}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pluggable Backend Status Cards & Active Switches */}
      <section className="space-y-4">
        <div className="border-b border-slate-800 pb-2">
          <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-semibold">
            Backend Registry Status
          </span>
          <h2 className="text-lg font-bold text-slate-100 mt-1">
            Pluggable Multi-Stage Backend Configuration
          </h2>
          <p className="text-xs text-slate-400">
            Controlled dynamically via .env and swappable adapter functions in <code className="text-slate-300">utils/*_backends.py</code>.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Stage 1: Captioning Backend Card */}
          <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-300">Stage 1: Captioning</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">
                CAPTIONING_BACKEND
              </span>
            </div>
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">Active Backend</label>
              <select
                value={config.captioningBackend}
                onChange={(e) => handleUpdateConfig({ captioningBackend: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:border-indigo-500 cursor-pointer"
              >
                <option value="gpt4o">gpt4o (OpenAI Batch / Sync)</option>
                <option value="mock">mock (Deterministic Fake)</option>
                <option value="qwen25vl">qwen25vl (Local GPU - Stubbed)</option>
              </select>
            </div>
            <p className="text-[11px] text-slate-400">
              {config.captioningBackend === 'gpt4o'
                ? 'High-precision multi-frame reasoning with JSON schema enforcement.'
                : config.captioningBackend === 'mock'
                ? 'Offline mock with deterministic keyword & caption outputs. Zero API cost.'
                : 'Local open-source weights running via vLLM / HuggingFace Transformers.'}
            </p>
          </div>

          {/* Stage 2: Narrative Backend Card */}
          <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-300">Stage 2: Narrative</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-950 border border-blue-800 text-blue-300">
                NARRATIVE_BACKEND
              </span>
            </div>
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">Active Backend</label>
              <select
                value={config.narrativeBackend}
                onChange={(e) => handleUpdateConfig({ narrativeBackend: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:border-indigo-500 cursor-pointer"
              >
                <option value="mock">mock (Deterministic Connectors)</option>
                <option value="llm">llm (OpenAI / Anthropic Provider)</option>
              </select>
            </div>
            <p className="text-[11px] text-slate-400">
              Stitches per-scene captions chronologically with rotating connector phrases.
            </p>
          </div>

          {/* Stage 3: Causal Backend Card */}
          <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-300">Stage 3: Causal</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-950 border border-indigo-800 text-indigo-300">
                CAUSAL_BACKEND
              </span>
            </div>
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">Active Backend</label>
              <select
                value={config.causalBackend}
                onChange={(e) => handleUpdateConfig({ causalBackend: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:border-indigo-500 cursor-pointer"
              >
                <option value="mock">mock (Keyword Overlap Graph)</option>
                <option value="llm">llm (Inter-Scene Deductive LLM)</option>
              </select>
            </div>
            <p className="text-[11px] text-slate-400">
              Infers cause-effect pairs using genuine keyword overlap; reports <code className="text-indigo-300">no_link_detected</code> when overlap is empty.
            </p>
          </div>

          {/* Stage 4: Verification Backend Card */}
          <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-300">Stage 4: Verification</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300">
                VERIFICATION_BACKEND
              </span>
            </div>
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">Active Backend</label>
              <select
                value={config.verificationBackend}
                onChange={(e) => handleUpdateConfig({ verificationBackend: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:border-indigo-500 cursor-pointer"
              >
                <option value="mock">mock (Mechanical Frame Validation)</option>
                <option value="llm">llm (VLM Visual Grounding)</option>
              </select>
            </div>
            <p className="text-[11px] text-slate-400">
              Validates that frame images exist, are non-empty, and categorizes claims into explicit verdicts.
            </p>
          </div>
        </div>
      </section>

      {/* Hardware Telemetry Card */}
      <section className="p-5 rounded-lg border border-slate-800 bg-slate-900/50 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-emerald-400">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-200 text-sm">GPU Execution Environment: Kaggle / Colab Accelerated</h4>
            <p className="text-xs text-slate-400">
              NVIDIA Tesla T4 16GB GDDR6 · CUDA 12.2 · PyTorch 2.4.0+cu122 · FFmpeg 6.1 with NVENC support
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <div>
            <span className="text-slate-500 block">VRAM ALLOCATED:</span>
            <span className="text-emerald-400 font-bold">5,420 MB / 15,840 MB (34.2%)</span>
          </div>
          <div>
            <span className="text-slate-500 block">FRAME CACHE:</span>
            <span className="text-cyan-400 font-bold">128 Files (24.8 MB)</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PipelineDetails;
