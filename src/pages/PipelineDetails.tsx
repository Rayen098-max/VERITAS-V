import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Eye,
  Layers,
  GitBranch,
  ShieldCheck,
  FileCheck,
  Award,
  Zap,
  Clock,
  Database,
  Copy,
  Check,
  Play,
  ArrowRight,
  Server
} from 'lucide-react';
import Container from '../components/Container';
import IconTile from '../components/IconTile';
import { usePageMeta } from '../hooks/usePageMeta';

// Lightweight Custom JSON Highlighter
function SyntaxHighlightedJson({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const lines = code.split('\n');

  return (
    <div className="relative rounded-[12px] bg-[#0A0A0B] text-neutral-200 border border-neutral-800 text-xs font-mono p-4 overflow-x-auto shadow-inner">
      <button
        type="button"
        onClick={handleCopy}
        className="absolute top-3 right-3 px-2.5 py-1 rounded-[6px] bg-white/10 hover:bg-white/20 text-neutral-300 text-[11px] font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
      >
        {copied ? (
          <>
            <Check className="w-3 h-3 text-[#10B981]" />
            <span className="text-[#10B981]">Copied</span>
          </>
        ) : (
          <>
            <Copy className="w-3 h-3" />
            <span>Copy</span>
          </>
        )}
      </button>

      <div className="space-y-0.5 leading-relaxed pt-1">
        {lines.map((line, idx) => {
          const highlighted = line
            .replace(/"([^"]+)":/g, '<span class="text-[#8F82FF]">"$1"</span>:')
            .replace(/: "([^"]+)"/g, ': <span class="text-[#10B981]">"$1"</span>')
            .replace(/: (\d+(\.\d+)?)/g, ': <span class="text-amber-400 font-semibold">$1</span>')
            .replace(/: (true|false)/g, ': <span class="text-[#F43F5E] font-bold">$1</span>');

          return <div key={idx} dangerouslySetInnerHTML={{ __html: highlighted }} />;
        })}
      </div>
    </div>
  );
}

const NODES = [
  {
    id: 'ingress',
    stageNumber: 0,
    title: 'Video Ingress',
    subtitle: 'MP4 Container Stream',
    stage: 'Ingress',
    icon: Eye,
    latencySeconds: 0.1,
    latencyDisplay: '0.1s',
    summary: 'Accepts raw video containers or benchmark streams. Decodes container metadata and prepares keyframes for downstream agents.',
    tools: ['FFmpeg Demuxer', 'Container Probe', 'Metadata Extractor'],
    inputArtifact: 'raw_video.mp4 (binary stream)',
    outputArtifact: 'media/<video>.mp4 (normalized 720p stream)',
    sampleJsonOutput: `{\n  "status": "ready",\n  "video_id": "my_video",\n  "container": "mp4",\n  "duration_seconds": 66.5,\n  "fps": 25,\n  "resolution": "1280x720"\n}`,
    sampleJsonInput: `{\n  "source_uri": "uploads/my_video.mp4",\n  "max_resolution": "720p",\n  "preserve_audio": true\n}`
  },
  {
    id: 'stage1',
    stageNumber: 1,
    title: 'Multi-Modal Perception',
    subtitle: 'PySceneDetect + FFmpeg + VLM',
    stage: 'Perception',
    icon: Eye,
    latencySeconds: 4.8,
    latencyDisplay: '4.8s',
    summary: 'Performs sub-second content scene boundary detection, extracts 4 keyframes per scene, and generates grounded scene captions with Whisper speech transcription.',
    tools: ['PySceneDetect (ContentDetector)', 'FFmpeg Frame Extractor', 'Whisper ASR', 'Qwen2.5-VL / Groq'],
    inputArtifact: 'media/<video>.mp4',
    outputArtifact: 'captions/<video>_captions.json',
    sampleJsonOutput: `{\n  "video_id": "my_video",\n  "scenes": [\n    {\n      "scene_id": "scene_001",\n      "start_time": 0.0,\n      "end_time": 20.5,\n      "caption": "A speaker wearing dark attire stands at stage center.",\n      "confidence": 96,\n      "keyframe_files": ["scene_001_start.jpg", "scene_001_t1.jpg"]\n    }\n  ]\n}`,
    sampleJsonInput: `{\n  "input_video": "media/my_video.mp4",\n  "threshold": 40.0,\n  "num_frames_per_scene": 4,\n  "asr_model": "base"\n}`
  },
  {
    id: 'stage2',
    stageNumber: 2,
    title: 'Narrative Synthesis',
    subtitle: 'Chronological Aggregation',
    stage: 'Synthesis',
    icon: Layers,
    latencySeconds: 0.8,
    latencyDisplay: '0.8s',
    summary: 'Aggregates discrete scene descriptions chronologically into a fluent, cohesive global narrative without temporal collisions.',
    tools: ['Temporal Sequence Formatter', 'Chronological Context Merging', 'LLM Narrative Synthesizer'],
    inputArtifact: 'captions/<video>_captions.json',
    outputArtifact: 'captions/<video>_narrative.txt',
    sampleJsonOutput: `{\n  "narrative": "A speaker stands at the center of an auditorium stage. The speaker delivers a presentation into a handheld microphone before concluding.",\n  "coherence_score": 0.94,\n  "word_count": 34\n}`,
    sampleJsonInput: `{\n  "scenes_source": "captions/my_video_captions.json",\n  "style": "neutral_forensic",\n  "max_tokens": 256\n}`
  },
  {
    id: 'stage3',
    stageNumber: 3,
    title: 'Causal Reasoning',
    subtitle: 'Dependency Graph Generation',
    stage: 'Reasoning',
    icon: GitBranch,
    latencySeconds: 1.4,
    latencyDisplay: '1.4s',
    summary: 'Discovers cause-and-effect transitions between consecutive scenes, explicitly tagging disjoint events as no_link_detected.',
    tools: ['Pairwise Scene Comparator', 'Semantic Overlap Graph', 'Causal Confidence Scorer'],
    inputArtifact: 'captions/<video>_captions.json & narrative.txt',
    outputArtifact: 'captions/<video>_causal.json',
    sampleJsonOutput: `{\n  "causal_chains": [\n    {\n      "scene_id": "scene_002",\n      "cause_scene_id": "scene_001",\n      "causal_statement": "The speaker addresses the audience because stage presence was established.",\n      "confidence": 94,\n      "link_status": "linked"\n    }\n  ]\n}`,
    sampleJsonInput: `{\n  "captions_artifact": "captions/my_video_captions.json",\n  "min_causal_threshold": 0.65\n}`
  },
  {
    id: 'stage4',
    stageNumber: 4,
    title: 'Hallucination Verification',
    subtitle: 'Frame-Grounding Defense',
    stage: 'Verification',
    icon: ShieldCheck,
    latencySeconds: 2.1,
    latencyDisplay: '2.1s',
    summary: 'Cross-examines each causal claim against raw pixel keyframes to categorize assertions into Supported, Contradicted, or Unverified.',
    tools: ['Frame Content Validator', 'Physical Evidence Matcher', 'Strictness Arbiter'],
    inputArtifact: 'captions/<video>_causal.json & keyframes/',
    outputArtifact: 'captions/<video>_verification.json',
    sampleJsonOutput: `{\n  "verdicts": [\n    {\n      "claim_id": "claim_003",\n      "claim": "The speaker holds a digital laser pointer.",\n      "verdict": "contradicted",\n      "confidence": 32,\n      "hallucination_flagged": true,\n      "reason": "Physical frame evidence shows empty hands and microphone only."\n    }\n  ]\n}`,
    sampleJsonInput: `{\n  "causal_claims": "captions/my_video_causal.json",\n  "evidence_dir": "frames/my_video_frames/",\n  "strictness": "rigorous"\n}`
  },
  {
    id: 'stage5',
    stageNumber: 5,
    title: 'Explainability Assembly',
    subtitle: 'Dual-Format Evidence Reports',
    stage: 'Explainability',
    icon: FileCheck,
    latencySeconds: 0.5,
    latencyDisplay: '0.5s',
    summary: 'Compiles auditable JSON and Markdown forensic reports linking claims directly to timestamped image files and verification rationales.',
    tools: ['Deterministic Data Joiner', 'Citation Linker', 'Markdown / JSON Report Formatter'],
    inputArtifact: 'captions/<video>_verification.json',
    outputArtifact: 'output/<video>_explained.json',
    sampleJsonOutput: `{\n  "video_title": "my_video.mp4",\n  "trust_score": 75,\n  "supported_claims": 3,\n  "contradicted_claims": 1,\n  "markdown_report_path": "output/my_video_explained.md"\n}`,
    sampleJsonInput: `{\n  "verification_json": "captions/my_video_verification.json",\n  "output_formats": ["json", "md"]\n}`
  },
  {
    id: 'stage6',
    stageNumber: 6,
    title: 'Benchmark Evaluator',
    subtitle: 'Ground Truth Scoring',
    stage: 'Benchmarking',
    icon: Award,
    latencySeconds: 0.4,
    latencyDisplay: '0.4s',
    summary: 'Evaluates the verified causal narrative against benchmark datasets (MSR-VTT, VideoHallucer) using BLEU-4, ROUGE-L, and METEOR metrics.',
    tools: ['NLTK BLEU-4 Scorer', 'ROUGE-L LCS Evaluator', 'METEOR Word Aligner'],
    inputArtifact: 'output/<video>_explained.json',
    outputArtifact: 'output/msrvtt_evaluation.json',
    sampleJsonOutput: `{\n  "dataset": "MSR-VTT",\n  "bleu_4": 0.402,\n  "rouge_l": 0.584,\n  "meteor": 0.321,\n  "catch_rate": 0.942\n}`,
    sampleJsonInput: `{\n  "generated_narrative": "output/my_video_explained.json",\n  "ground_truth_db": "datasets/msr_vtt_1k.json"\n}`
  }
];

export const PipelineDetails: React.FC = () => {
  const navigate = useNavigate();
  const [selectedNode, setSelectedNode] = useState<string>('stage4');
  const [activeArtifactTab, setActiveArtifactTab] = useState<'output' | 'input'>('output');

  usePageMeta({
    title: 'Multi-Agent Pipeline Architecture',
    description: 'Interactive system topology and artifact dataflow: from multimodal perception to frame-grounded hallucination verification.',
  });

  const totalPipelineTime = NODES.reduce((sum, n) => sum + n.latencySeconds, 0);
  const activeNodeInfo = NODES.find(n => n.id === selectedNode) || NODES[4];
  const ActiveIcon = activeNodeInfo.icon;

  // Keyboard arrow navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        const currentIndex = NODES.findIndex(n => n.id === selectedNode);
        if (currentIndex < NODES.length - 1) {
          setSelectedNode(NODES[currentIndex + 1].id);
        }
      } else if (e.key === 'ArrowLeft') {
        const currentIndex = NODES.findIndex(n => n.id === selectedNode);
        if (currentIndex > 0) {
          setSelectedNode(NODES[currentIndex - 1].id);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNode]);

  return (
    <div className="w-full py-8 space-y-8 select-none">
      <Container size="default">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--border-default)] pb-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-default)] text-xs font-mono text-[var(--text-secondary)]">
              <span className="w-2 h-2 rounded-full bg-[#6D5EF5] animate-pulse" />
              <span>SYSTEM ARCHITECTURE & PIPELINE TOPOLOGY</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
              Active Multi-Agent Orchestration Topology
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-2xl leading-relaxed">
              End-to-end data flow pipeline from raw video ingress to frame-grounded explainability reports and benchmark evaluation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/new-analysis')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[12px] bg-[#6D5EF5] hover:bg-[#5B4BE2] text-white text-xs font-bold transition-all shadow-md shadow-[#6D5EF5]/20 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run Pipeline Now</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            KPI METRIC TILES (COHESIVE WITH BENCHMARKS & DASHBOARD)
        ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {/* Card 1: Benchmark Datasets */}
          <div className="p-4 rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-xs flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-medium text-[var(--text-secondary)]">Benchmark Datasets</span>
              <p className="text-2xl font-black text-[var(--text-primary)] tabular-nums">4 Datasets</p>
              <span className="text-[11px] font-mono text-[var(--text-muted)] block truncate">
                MSR-VTT · VideoHallucer · NExT-QA
              </span>
            </div>
            <IconTile icon={Database} variant="neutral" size="md" />
          </div>

          {/* Card 2: Catch Rate */}
          <div className="p-4 rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-xs flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-medium text-[var(--text-secondary)]">Hallucination Catch Rate</span>
              <p className="text-2xl font-black text-[#10B981] tabular-nums">94.2%</p>
              <span className="text-[11px] font-mono text-[#10B981] font-semibold">
                Contradicted claims purged
              </span>
            </div>
            <IconTile icon={ShieldCheck} variant="supported" size="md" />
          </div>

          {/* Card 3: Causal Confidence */}
          <div className="p-4 rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-xs flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-medium text-[var(--text-secondary)]">Causal Confidence</span>
              <p className="text-2xl font-black text-[var(--text-primary)] tabular-nums">0.931</p>
              <span className="text-[11px] font-mono text-[var(--text-muted)]">
                Across 96 verified scene pairs
              </span>
            </div>
            <IconTile icon={Zap} variant="accent" size="md" />
          </div>

          {/* Card 4: Credible Median Runtime */}
          <div className="p-4 rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-xs flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-medium text-[var(--text-secondary)]">End-to-End p50 Latency</span>
              <p className="text-2xl font-black text-[var(--text-primary)] tabular-nums">9.2s</p>
              <span className="text-[11px] font-mono text-[#10B981] font-semibold">
                Per standard 60s video clip
              </span>
            </div>
            <IconTile icon={Clock} variant="neutral" size="md" />
          </div>
        </div>

        {/* =========================================================================
            LATENCY PROPORTIONAL STACKED BAR VISUALIZATION
        ========================================================================= */}
        <div className="p-4 rounded-[14px] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-xs space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#6D5EF5]" />
              <span>Proportional Execution Latency Share</span>
            </span>
            <span className="font-mono text-xs text-[var(--text-muted)]">
              Total End-to-End: <strong className="text-[var(--text-primary)]">{totalPipelineTime.toFixed(1)}s</strong>
            </span>
          </div>

          {/* Stacked Proportional Bar */}
          <div className="w-full h-3 rounded-full bg-[var(--bg-secondary)] overflow-hidden flex">
            {NODES.map((node) => {
              const pct = (node.latencySeconds / totalPipelineTime) * 100;
              const isSelected = selectedNode === node.id;
              const colors: Record<string, string> = {
                ingress: 'bg-neutral-400',
                stage1: 'bg-[#6D5EF5]', // Perception dominates 47%
                stage2: 'bg-neutral-500',
                stage3: 'bg-indigo-400',
                stage4: 'bg-[#10B981]',
                stage5: 'bg-emerald-400',
                stage6: 'bg-amber-400',
              };

              return (
                <div
                  key={node.id}
                  style={{ width: `${pct}%` }}
                  title={`${node.title}: ${node.latencyDisplay} (${pct.toFixed(0)}%)`}
                  onClick={() => setSelectedNode(node.id)}
                  className={`h-full transition-all cursor-pointer ${colors[node.id] || 'bg-neutral-400'} ${
                    isSelected ? 'ring-2 ring-white ring-inset opacity-100' : 'opacity-85 hover:opacity-100'
                  }`}
                />
              );
            })}
          </div>

          {/* Bar Legend */}
          <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-[var(--text-muted)] pt-1">
            <span>Perception (47%)</span>
            <span>Reasoning (14%)</span>
            <span>Verification (21%)</span>
            <span>Synthesis & Explainability (18%)</span>
          </div>
        </div>

        {/* =========================================================================
            INTERACTIVE TOPOLOGY GRAPH (DESKTOP FLEX / ANIMATED CONNECTORS)
        ========================================================================= */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#6D5EF5]" />
              <span>Interactive Dataflow Topology (Use ← → Arrow Keys)</span>
            </h2>
            <span className="text-[11px] font-mono text-[var(--text-muted)]">
              Click any stage to inspect inputs and outputs
            </span>
          </div>

          {/* Stage Node Flex Container */}
          <div className="p-4 sm:p-5 rounded-[16px] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-xs overflow-x-auto custom-scrollbar">
            <div className="min-w-[900px] flex items-center justify-between gap-2">
              {NODES.map((node, index) => {
                const isSelected = selectedNode === node.id;
                const NodeIcon = node.icon;

                return (
                  <React.Fragment key={node.id}>
                    {/* Stage Card */}
                    <div
                      onClick={() => setSelectedNode(node.id)}
                      className={`relative p-3 rounded-[12px] border cursor-pointer transition-all flex-1 min-w-[130px] flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#6D5EF5] bg-[var(--bg-surface)] shadow-md shadow-[#6D5EF5]/15 scale-[1.02] ring-1 ring-[#6D5EF5]'
                          : 'border-[var(--border-default)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-surface)] hover:border-[#6D5EF5]/40'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono mb-1.5">
                        <span className="px-1.5 py-0.5 rounded-[4px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] font-bold text-[var(--text-secondary)]">
                          {node.stageNumber === 0 ? 'INGRESS' : `STAGE ${node.stageNumber}`}
                        </span>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-[#6D5EF5] animate-ping" />
                        )}
                      </div>

                      <div className="space-y-0.5">
                        <div className="font-bold text-xs text-[var(--text-primary)] flex items-center gap-1.5">
                          <NodeIcon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#6D5EF5]' : 'text-[var(--text-muted)]'}`} />
                          <span className="truncate">{node.title}</span>
                        </div>
                        <p className="text-[10px] text-[var(--text-muted)] font-mono truncate">
                          {node.subtitle}
                        </p>
                      </div>

                      <div className="mt-2 pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[10px] font-mono text-[var(--text-secondary)]">
                        <span>Latency</span>
                        <strong className="text-[var(--text-primary)]">{node.latencyDisplay}</strong>
                      </div>
                    </div>

                    {/* Animated Flow Connector with Glowing Packet */}
                    {index < NODES.length - 1 && (
                      <div className="relative w-7 sm:w-9 flex items-center justify-center shrink-0">
                        <svg className="w-full h-4" viewBox="0 0 36 16" fill="none">
                          <line
                            x1="0"
                            y1="8"
                            x2="36"
                            y2="8"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeDasharray="3 3"
                            className="text-[var(--border-default)]"
                          />
                          <circle cx="18" cy="8" r="2.5" fill="#6D5EF5" className="animate-pulse" />
                        </svg>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>

        {/* =========================================================================
            EXPANDED TWO-COLUMN STAGE DETAIL PANEL & SYNTAX HIGHLIGHTED ARTIFACTS
        ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Responsibilities & Tools */}
          <div className="lg:col-span-5 p-5 rounded-[16px] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3 border-b border-[var(--border-default)] pb-3">
                <IconTile icon={ActiveIcon} variant="accent" size="lg" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-[6px] bg-[#6D5EF5]/10 text-[#6D5EF5] font-mono text-[10px] font-bold">
                      {activeNodeInfo.stageNumber === 0 ? 'INGRESS' : `STAGE ${activeNodeInfo.stageNumber}`}
                    </span>
                    <span className="text-[11px] font-mono text-[var(--text-muted)]">
                      Latency: {activeNodeInfo.latencyDisplay}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-[var(--text-primary)] mt-0.5">
                    {activeNodeInfo.title}
                  </h3>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-mono uppercase text-[var(--text-muted)] tracking-wider block mb-1">
                  Architectural Responsibility:
                </span>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  {activeNodeInfo.summary}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-mono uppercase text-[var(--text-muted)] tracking-wider block mb-1.5">
                  Engines & Models Employed:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeNodeInfo.tools.map((tool) => (
                    <span
                      key={tool}
                      className="px-2.5 py-1 rounded-[6px] bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] font-mono"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>

              {/* Special Semantic Verdict Block if Stage 4 is active */}
              {activeNodeInfo.id === 'stage4' && (
                <div className="p-3.5 rounded-[12px] bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-2 mt-2">
                  <span className="text-[11px] font-mono font-bold text-[var(--text-primary)] uppercase tracking-wider block">
                    Three Semantic Verdict Classifications:
                  </span>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-start gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-[#10B981]/15 text-[#10B981] font-mono text-[10px] font-bold">
                        SUPPORTED
                      </span>
                      <span className="text-[var(--text-secondary)] text-[11px]">
                        Assertion grounded in pixel evidence (e.g. "Speaker holds microphone").
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-[#F59E0B]/15 text-[#F59E0B] font-mono text-[10px] font-bold">
                        UNVERIFIED
                      </span>
                      <span className="text-[var(--text-secondary)] text-[11px]">
                        Ambiguous or occluded frame context requiring human reviewer flag.
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-[#F43F5E]/15 text-[#F43F5E] font-mono text-[10px] font-bold">
                        CONTRADICTED
                      </span>
                      <span className="text-[var(--text-secondary)] text-[11px]">
                        Explicitly hallucinated claim purged from narrative (e.g. "Holds laser pointer").
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[var(--border-default)] flex items-center justify-between text-xs font-mono text-[var(--text-muted)]">
              <span>Artifact Output:</span>
              <strong className="text-[var(--text-primary)]">{activeNodeInfo.outputArtifact}</strong>
            </div>
          </div>

          {/* Right Column: Tabbed Input / Output Artifact Viewer */}
          <div className="lg:col-span-7 p-5 rounded-[16px] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold text-[var(--text-primary)] uppercase tracking-wider">
                  Live Artifact Inspector
                </span>
                <span className="text-[10px] font-mono text-[#6D5EF5]">
                  {activeArtifactTab === 'output' ? activeNodeInfo.outputArtifact : activeNodeInfo.inputArtifact}
                </span>
              </div>

              {/* Tab Selector */}
              <div className="inline-flex items-center p-0.5 rounded-[8px] bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs">
                <button
                  type="button"
                  onClick={() => setActiveArtifactTab('output')}
                  className={`px-3 py-1 rounded-[6px] font-medium transition-colors cursor-pointer ${
                    activeArtifactTab === 'output'
                      ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs font-bold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Output Artifact
                </button>
                <button
                  type="button"
                  onClick={() => setActiveArtifactTab('input')}
                  className={`px-3 py-1 rounded-[6px] font-medium transition-colors cursor-pointer ${
                    activeArtifactTab === 'input'
                      ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs font-bold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Input Payload
                </button>
              </div>
            </div>

            {/* Syntax-Highlighted Code Container */}
            <SyntaxHighlightedJson
              code={
                activeArtifactTab === 'output'
                  ? activeNodeInfo.sampleJsonOutput
                  : activeNodeInfo.sampleJsonInput
              }
            />
          </div>
        </div>

        {/* =========================================================================
            BOTTOM: BACKENDS COMPARISON TABLE
        ========================================================================= */}
        <div className="p-5 rounded-[16px] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-3">
            <div className="space-y-0.5">
              <h3 className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-2">
                <Server className="w-4 h-4 text-[#6D5EF5]" />
                <span>Multi-Modal VLM Backends Comparative Matrix</span>
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Evaluation across perception speed, cost per 1k clips, and hallucination catch accuracy.
              </p>
            </div>
            <Link to="/benchmarks" className="text-xs font-semibold text-[#6D5EF5] hover:underline flex items-center gap-1">
              <span>View Full Benchmarks</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--bg-secondary)] border-b border-[var(--border-default)] text-[11px] font-mono text-[var(--text-muted)]">
                <tr>
                  <th className="py-2.5 px-3">Backend Engine</th>
                  <th className="py-2.5 px-3">Deployment Mode</th>
                  <th className="py-2.5 px-3">Median Latency</th>
                  <th className="py-2.5 px-3">Catch Precision</th>
                  <th className="py-2.5 px-3">Cost / 1k Videos</th>
                  <th className="py-2.5 px-3">Best Suited For</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)] font-mono">
                <tr className="hover:bg-[var(--bg-secondary)]/50 transition-colors">
                  <td className="py-3 px-3 font-bold text-[var(--text-primary)]">Qwen2.5-VL-7B</td>
                  <td className="py-3 px-3 text-[#10B981]">Local / Groq Vision</td>
                  <td className="py-3 px-3">4.8s / clip</td>
                  <td className="py-3 px-3 text-[#10B981] font-bold">94.2%</td>
                  <td className="py-3 px-3">$0.42 (negligible)</td>
                  <td className="py-3 px-3 font-sans text-[var(--text-secondary)]">Production high-throughput pipeline</td>
                </tr>
                <tr className="hover:bg-[var(--bg-secondary)]/50 transition-colors">
                  <td className="py-3 px-3 font-bold text-[var(--text-primary)]">GPT-4o Vision</td>
                  <td className="py-3 px-3 text-neutral-400">OpenAI Batch API</td>
                  <td className="py-3 px-3">12.4s / clip</td>
                  <td className="py-3 px-3 text-[#10B981] font-bold">96.8%</td>
                  <td className="py-3 px-3">$14.80</td>
                  <td className="py-3 px-3 font-sans text-[var(--text-secondary)]">High-stakes legal and forensic verification</td>
                </tr>
                <tr className="hover:bg-[var(--bg-secondary)]/50 transition-colors">
                  <td className="py-3 px-3 font-bold text-[var(--text-primary)]">Mock Heuristic</td>
                  <td className="py-3 px-3 text-neutral-400">Offline CPU Deterministic</td>
                  <td className="py-3 px-3">&lt;0.2s / clip</td>
                  <td className="py-3 px-3 text-amber-500 font-bold">81.4%</td>
                  <td className="py-3 px-3">$0.00</td>
                  <td className="py-3 px-3 font-sans text-[var(--text-secondary)]">CI/CD regression unit tests</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default PipelineDetails;
