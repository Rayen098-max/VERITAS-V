import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Cpu,
  SearchCheck,
  BarChart3,
  Server,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import Container from '../components/Container';
import IconTile from '../components/IconTile';
import { usePageMeta } from '../hooks/usePageMeta';

export const About: React.FC<{ onNavigateToPipeline?: () => void }> = ({
  onNavigateToPipeline,
}) => {
  const navigate = useNavigate();
  const [activeStage, setActiveStage] = useState<number>(4);

  usePageMeta({
    title: 'Research Specification & Architecture',
    description: 'Academic design document: Explainable Agentic Vision-Language Framework for causal video understanding and hallucination verification.',
  });

  const handleNavigate = () => {
    if (onNavigateToPipeline) onNavigateToPipeline();
    else navigate('/pipeline');
  };

  const pipelineStages = [
    {
      stage: 1,
      title: 'Scene Extraction & Captioning',
      script: 'stage1_captioning.py',
      agent: 'Perception Agent',
      desc: 'Segments the input video into semantic scenes using PySceneDetect content detection, extracts keyframes with FFmpeg, transcribes speech with OpenAI Whisper, and generates dense captions with keywords via swappable VLM backends.',
      tools: ['PySceneDetect (threshold=40.0)', 'FFmpeg Keyframe Extractor', 'Whisper ASR', 'Qwen2.5-VL / Groq / GPT-4o'],
      inputs: 'Raw MP4/MKV video stream',
      outputs: 'captions/<video>_captions.json',
      sampleSnippet: `{"scenes": [{"scene_id": "scene_001", "caption": "Speaker takes the stage.", "frames": 4}]}`
    },
    {
      stage: 2,
      title: 'Narrative Synthesis',
      script: 'stage2_narrative.py',
      agent: 'Narrative Synthesis Agent',
      desc: 'Reads per-scene captions and synthesizes them chronologically into a single, cohesive paragraph describing the video as a unified story rather than isolated snippets.',
      tools: ['Rhetorical Transition Sequencer', 'Temporal Flow Formatter', 'Chronological Context Merging'],
      inputs: 'captions/<video>_captions.json',
      outputs: 'captions/<video>_narrative.txt',
      sampleSnippet: `"A speaker stands at the center of an auditorium stage. The speaker delivers a presentation..."`
    },
    {
      stage: 3,
      title: 'Causal Reasoning Graph',
      script: 'stage3_causal.py',
      agent: 'Causal Reasoning Agent',
      desc: 'Analyzes adjacent scenes to determine physical and behavioral cause-and-effect chains (e.g., "beaker shattered because researcher lost grip"). Computes keyword overlap and explicitly flags disconnected scenes with no_link_detected.',
      tools: ['Semantic Overlap Graph', 'Causal Pairwise Evaluator', 'Confidence Scorer'],
      inputs: 'captions/<video>_captions.json',
      outputs: 'captions/<video>_causal.json',
      sampleSnippet: `{"causal_chains": [{"cause": "scene_001", "effect": "scene_002", "confidence": 0.94}]}`
    },
    {
      stage: 4,
      title: 'Hallucination Verification',
      script: 'stage4_verification.py',
      agent: 'Hallucination Verification Agent',
      desc: 'Cross-examines each causal claim against raw frame images to flag ungrounded model output. Categorizes assertions into Supported, Contradicted, or Unverified.',
      tools: ['Claim Extractor', 'Frame Content Validator', 'Evidence Grounding Matrix'],
      inputs: 'captions/<video>_causal.json & keyframe images',
      outputs: 'captions/<video>_verification.json',
      sampleSnippet: `{"verdicts": [{"claim": "holds laser pointer", "verdict": "contradicted", "flagged": true}]}`
    },
    {
      stage: 5,
      title: 'Explainability Assembly',
      script: 'stage5_explainability.py',
      agent: 'Explainability Assembly Agent',
      desc: 'Deterministically joins captions, causal relations, and verification verdicts by scene_id into dual-format reports citing exact timestamps and physical keyframe files per claim.',
      tools: ['Deterministic Data Joiner', 'Citation Linker', 'Markdown / JSON Report Formatter'],
      inputs: '<video>_verification.json & <video>_captions.json',
      outputs: 'output/<video>_explained.json & .md',
      sampleSnippet: `{"report_id": "my_video", "trust_score": 75, "markdown_path": "output/my_video_explained.md"}`
    },
    {
      stage: 6,
      title: 'Benchmark Evaluation Engine',
      script: 'evaluate_captions.py',
      agent: 'Benchmarking Agent',
      desc: 'Evaluates the generated causal narrative against ground-truth references from benchmark datasets (MSR-VTT, ActivityNet Captions) using BLEU-4, ROUGE-L, and METEOR metrics.',
      tools: ['NLTK BLEU-4 Scorer', 'ROUGE-L LCS Evaluator', 'METEOR Word Aligner'],
      inputs: '<video>_narrative.txt & ground_truth.json',
      outputs: 'output/msrvtt_evaluation.json & .md',
      sampleSnippet: `{"dataset": "MSR-VTT", "bleu_4": 0.402, "rouge_l": 0.584, "meteor": 0.321}`
    }
  ];

  const currentStageInfo = pipelineStages.find((s) => s.stage === activeStage) || pipelineStages[3];

  const techStack = [
    { name: 'React 19', role: 'Concurrent UI Architecture', badge: 'Frontend' },
    { name: 'Vite 8', role: 'Rolldown Build Engine', badge: 'Bundler' },
    { name: 'Tailwind CSS v4', role: 'Dynamic Tokenized Styling', badge: 'Theme' },
    { name: 'Python 3.11', role: 'Core Pipeline Runtime', badge: 'Core' },
    { name: 'PySceneDetect', role: 'Sub-Second Cut Detection', badge: 'Perception' },
    { name: 'FFmpeg 8.1', role: 'Pixel Keyframe Extraction', badge: 'Perception' },
    { name: 'Whisper ASR', role: 'Speech Diarization', badge: 'Audio' },
    { name: 'Qwen2.5-VL / Groq', role: 'Vision-Language Inference', badge: 'VLM' },
  ];

  return (
    <div className="w-full py-8 space-y-12 select-none">
      <Container size="default">
        {/* =========================================================================
            SECTION 1: HERO OVERVIEW WITH BALANCED BASELINE
        ========================================================================= */}
        <section className="p-6 sm:p-8 rounded-[20px] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-xs space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-default)] text-xs font-mono text-[var(--text-secondary)]">
            <BookOpen className="w-3.5 h-3.5 text-[#6D5EF5]" />
            <span>RESEARCH SPECIFICATION & BLUEPRINT</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Explainable Agentic Vision-Language Framework
          </h1>

          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-3xl leading-relaxed">
            VERITAS-V transforms passive black-box video captioning into an audited causal reasoning chain with active frame-grounded hallucination defense. Built as an engineering final-year project at the frontier of multimodal safety.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleNavigate}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[12px] bg-[#6D5EF5] hover:bg-[#5B4BE2] text-white text-xs font-bold shadow-md shadow-[#6D5EF5]/20 transition-all cursor-pointer"
            >
              <span>Explore Pipeline Topology</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <Link
              to="/benchmarks"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[12px] bg-[var(--bg-secondary)] hover:bg-[var(--border-default)] text-[var(--text-primary)] border border-[var(--border-subtle)] text-xs font-bold transition-colors"
            >
              <BarChart3 className="w-3.5 h-3.5 text-[#10B981]" />
              <span>View Benchmarks</span>
            </Link>
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-[12px] bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-muted)] font-mono text-xs">
              <Server className="w-3.5 h-3.5 text-[#6D5EF5]" />
              <span>Multi-Agent · Frame Grounding · Zero Black-Box Output</span>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 2: CONVENTIONAL VLMS VS VERITAS (ELEVATED COMPARISON + VS BADGE)
        ========================================================================= */}
        <section className="space-y-4 pt-4">
          <div className="border-b border-[var(--border-default)] pb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-[#6D5EF5] font-semibold">
              Research Context & Motivation
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] mt-1">
              Bridging Surface Captioning and Causal Explainability
            </h2>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Left: Traditional VLM Limitations (Muted Gray with Rose Accents) */}
            <div className="rounded-[16px] border border-[var(--border-default)] bg-[var(--bg-secondary)]/60 p-6 space-y-4">
              <div className="flex items-center gap-2 text-[var(--text-primary)] font-mono text-xs font-bold">
                <XCircle className="w-4 h-4 text-[#F43F5E]" />
                <span>Conventional Vision-Language Models (VLMs)</span>
              </div>
              <ul className="space-y-3 text-xs text-[var(--text-secondary)] leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-[#F43F5E] font-bold">•</span>
                  <span>
                    <strong className="text-[var(--text-primary)]">Disconnected Snapshots:</strong> Generates isolated captions per frame without chronological continuity or inter-scene narrative flow.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F43F5E] font-bold">•</span>
                  <span>
                    <strong className="text-[var(--text-primary)]">Lack of Causal Attribution:</strong> Fails to explain reasons behind state transitions (e.g., stating a glass is broken without linking it to the antecedent drop).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F43F5E] font-bold">•</span>
                  <span>
                    <strong className="text-[#F43F5E]">Visual Hallucinations:</strong> Fabricates objects, speculative actions, or non-existent actors with zero empirical grounding.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F43F5E] font-bold">•</span>
                  <span>
                    <strong className="text-[var(--text-primary)]">Unverifiable Black-Box Outputs:</strong> Produces unstructured prose lacking specific timestamp spans or keyframe checksums.
                  </span>
                </li>
              </ul>
            </div>

            {/* Center "VS" Badge */}
            <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[var(--bg-surface)] border-2 border-[var(--border-default)] shadow-md items-center justify-center font-mono font-black text-xs text-[#6D5EF5] z-10">
              VS
            </div>

            {/* Right: VERITAS Framework Solutions (Elevated Card with Emerald Accents) */}
            <div className="rounded-[16px] border border-[#10B981]/30 bg-[var(--bg-surface)] p-6 space-y-4 shadow-md ring-1 ring-[#10B981]/20">
              <div className="flex items-center gap-2 text-[var(--text-primary)] font-mono text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                <span>The VERITAS Agentic Architecture</span>
              </div>
              <ul className="space-y-3 text-xs text-[var(--text-secondary)] leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-[#10B981] font-bold">•</span>
                  <span>
                    <strong className="text-[var(--text-primary)]">Automated Multi-Modal Scene Extraction:</strong> Combines PySceneDetect, FFmpeg keyframes, and Whisper audio transcripts into structured scene units.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#10B981] font-bold">•</span>
                  <span>
                    <strong className="text-[var(--text-primary)]">Causal Dependency Reasoning:</strong> Constructs an explicit cause-and-effect semantic graph with confidence scoring and link validation.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#10B981] font-bold">•</span>
                  <span>
                    <strong className="text-[#10B981]">Frame-Level Hallucination Defense:</strong> Rigorously validates claims against raw image evidence, purging unverified and contradicted assertions.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#10B981] font-bold">•</span>
                  <span>
                    <strong className="text-[var(--text-primary)]">Auditable Evidence Reports:</strong> Deterministically generates dual-format outputs (.json & .md) citing exact frame filenames and timestamps.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 3: VISUAL BEFORE/AFTER EVIDENCE EXPLANATION
        ========================================================================= */}
        <section className="p-6 rounded-[16px] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-3">
            <div className="space-y-0.5">
              <span className="text-xs font-mono uppercase tracking-wider text-[#6D5EF5] font-semibold">
                Visual Defense Proof
              </span>
              <h3 className="font-bold text-sm text-[var(--text-primary)]">
                Before / After Verification Audit on Sample Video (my_video.mp4)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-[var(--text-muted)]">
              Audited in Scene 003 (t=23.4s - 52.0s)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Raw Hallucinated Model Output */}
            <div className="p-4 rounded-[12px] bg-[#F43F5E]/5 border border-[#F43F5E]/25 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono font-bold text-[#F43F5E]">
                <span>RAW VLM NARRATIVE (BEFORE VERITAS)</span>
                <span>Unverified</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                "The speaker addresses the audience on stage, gestures toward presentation slides, and{' '}
                <span className="bg-[#F43F5E]/20 text-[#F43F5E] font-semibold px-1 rounded">
                  points with a handheld digital laser pointer
                </span>
                ."
              </p>
              <div className="text-[10px] font-mono text-[#F43F5E] pt-1">
                ⚠️ Hallucination Risk: Model invented a laser pointer based on generic keynote bias.
              </div>
            </div>

            {/* VERITAS Grounded Output */}
            <div className="p-4 rounded-[12px] bg-[#10B981]/5 border border-[#10B981]/25 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono font-bold text-[#10B981]">
                <span>VERITAS AUDITED NARRATIVE (AFTER DEFENSE)</span>
                <span>Supported (100% Grounded)</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                "The speaker addresses the auditorium with empty-hand gestures. Physical keyframe audit confirms speaker holds a wired microphone;{' '}
                <span className="text-[#F43F5E] line-through font-mono text-[11px]">laser pointer assertion purged</span>."
              </p>
              <div className="text-[10px] font-mono text-[#10B981] pt-1">
                ✓ Grounded in Frame Evidence: my_video_scene_003_t3.jpg. Zero unverified objects.
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 4: 6-STAGE ARCHITECTURE TABS (FIXED HEIGHT GRID / NO COLLISION)
        ========================================================================= */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-default)] pb-2">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-[#6D5EF5] font-semibold">
                System Blueprint
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] mt-1">
                6-Stage Multi-Agent Architecture
              </h2>
            </div>
            <span className="text-xs font-mono text-[var(--text-muted)]">
              Click any stage card to inspect inputs, engines, and deliverables
            </span>
          </div>

          {/* Fixed-Height Equal Card Grid for 6 Stages */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2.5">
            {pipelineStages.map((s) => {
              const isSelected = activeStage === s.stage;
              return (
                <button
                  key={s.stage}
                  type="button"
                  onClick={() => setActiveStage(s.stage)}
                  className={`h-24 p-3 rounded-[12px] border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#6D5EF5] text-white border-[#6D5EF5] shadow-md -translate-y-0.5'
                      : 'bg-[var(--bg-surface)] border-[var(--border-default)] text-[var(--text-primary)] hover:border-[#6D5EF5]/50'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="font-bold">STAGE {s.stage}</span>
                    <span className={`truncate text-[9px] ${isSelected ? 'text-white/80' : 'text-[var(--text-muted)]'}`}>
                      {s.script.replace('.py', '')}
                    </span>
                  </div>
                  <div className="text-xs font-bold line-clamp-2 leading-tight">
                    {s.title}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Stage Detail Panel (Left-to-Right Flow with Snippet) */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStageInfo.stage}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="rounded-[16px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 space-y-4 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-default)] pb-3">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full bg-[#6D5EF5] text-white font-mono text-xs font-bold">
                    STAGE {currentStageInfo.stage}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-[var(--text-primary)]">{currentStageInfo.title}</h3>
                    <p className="text-xs font-mono text-[var(--text-secondary)]">
                      Script: <strong className="text-[var(--text-primary)]">{currentStageInfo.script}</strong> · Responsible Agent: <strong className="text-[#6D5EF5]">{currentStageInfo.agent}</strong>
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                {currentStageInfo.desc}
              </p>

              {/* 3-Column Equal Height Flow: Input -> Engines -> Output */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                {/* Inputs */}
                <div className="p-4 rounded-[12px] bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-1">
                  <span className="text-[10px] font-mono uppercase text-[var(--text-muted)] font-bold block">
                    Input Artifacts
                  </span>
                  <p className="text-xs font-mono text-[var(--text-primary)] font-medium">
                    {currentStageInfo.inputs}
                  </p>
                </div>

                {/* Engines */}
                <div className="p-4 rounded-[12px] bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-[var(--text-muted)] font-bold block">
                    Underlying Engines & Tools
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {currentStageInfo.tools.map((t, idx) => (
                      <span key={idx} className="px-1.5 py-0.5 rounded bg-[var(--bg-surface)] text-[10px] font-mono text-[var(--text-primary)] border border-[var(--border-subtle)]">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Output & Deliverable */}
                <div className="p-4 rounded-[12px] bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-1">
                  <span className="text-[10px] font-mono uppercase text-[var(--text-muted)] font-bold block">
                    Output Deliverables
                  </span>
                  <p className="text-xs font-mono text-[#10B981] font-bold">
                    {currentStageInfo.outputs}
                  </p>
                </div>
              </div>

              {/* Mini Sample Payload Code Snippet */}
              <div className="rounded-[10px] bg-[#0A0A0B] p-3 text-neutral-300 font-mono text-xs overflow-x-auto border border-neutral-800">
                <span className="text-[10px] text-neutral-500 block mb-1">PAYLOAD STRUCTURE:</span>
                <code>{currentStageInfo.sampleSnippet}</code>
              </div>
            </motion.div>
          </AnimatePresence>
        </section>

        {/* =========================================================================
            SECTION 5: BENTO TECHNICAL INNOVATIONS LAYOUT
        ========================================================================= */}
        <section className="space-y-4">
          <div className="border-b border-[var(--border-default)] pb-2">
            <span className="text-xs font-mono uppercase tracking-wider text-[#6D5EF5] font-semibold">
              Technical Innovations
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] mt-1">
              VERITAS Architecture Feature Bento
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Bento Card 1: Pluggable Backend Registry (Double Column with Code) */}
            <div className="md:col-span-2 p-6 rounded-[16px] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-xs space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <IconTile icon={Cpu} variant="accent" size="sm" />
                  <h4 className="font-bold text-sm text-[var(--text-primary)]">
                    Pluggable Multi-Backend Registry Adapter
                  </h4>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Every stage utilizes a function-registry adapter pattern. Switch seamlessly between keyless local testing (<code>mock</code>), GPU accelerated inference (<code>qwen25vl</code> / <code>groq</code>), or production cloud vision models (<code>gpt4o</code>) strictly via environment variables.
                </p>
              </div>

              <div className="rounded-[10px] bg-[#0A0A0B] p-3.5 font-mono text-xs text-neutral-300 border border-neutral-800">
                <span className="text-[#8F82FF]"># .env Swappable Runtime Backend Configuration</span>
                <br />
                <span className="text-neutral-400">CAPTIONING_BACKEND=</span><span className="text-[#10B981]">"qwen25vl"</span> <span className="text-neutral-500"># or "mock", "gpt4o"</span>
                <br />
                <span className="text-neutral-400">VERIFICATION_STRICTNESS=</span><span className="text-[#10B981]">"rigorous"</span>
              </div>
            </div>

            {/* Bento Card 2: Frame-Indexed Evidence */}
            <div className="p-6 rounded-[16px] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-xs space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <IconTile icon={SearchCheck} variant="supported" size="sm" />
                  <h4 className="font-bold text-sm text-[var(--text-primary)]">
                    Frame-Indexed Auditing
                  </h4>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Eliminates unsubstantiated claims by tying every assertion to concrete visual keyframe filenames (<code className="font-mono text-xs">frame_008.jpg</code>) and timestamp ranges for human verification.
                </p>
              </div>
              <span className="text-[11px] font-mono text-[#10B981] font-semibold">
                ✓ 1024px Raw Pixel Resolution
              </span>
            </div>

            {/* Bento Card 3: Multi-Metric Benchmarking */}
            <div className="md:col-span-3 p-6 rounded-[16px] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <IconTile icon={BarChart3} variant="neutral" size="sm" />
                  <h4 className="font-bold text-sm text-[var(--text-primary)]">
                    Cross-Dataset Empirical Validation
                  </h4>
                </div>
                <p className="text-xs text-[var(--text-secondary)] max-w-2xl leading-relaxed">
                  Continuous evaluation across MSR-VTT (1,000 video split), VideoHallucer, NExT-QA, and ActivityNet Captions measuring BLEU-4, ROUGE-L, and METEOR metrics.
                </p>
              </div>
              <Link
                to="/benchmarks"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-[10px] bg-[#6D5EF5] hover:bg-[#5B4BE2] text-white text-xs font-bold transition-all shadow-xs shrink-0"
              >
                <span>Inspect All Benchmarks</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 6: INDUSTRIAL & SCIENTIFIC DEPLOYMENT SCENARIOS
        ========================================================================= */}
        <section className="space-y-4">
          <div className="border-b border-[var(--border-default)] pb-2">
            <span className="text-xs font-mono uppercase tracking-wider text-[#6D5EF5] font-semibold">
              Deployment Scenarios
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] mt-1">
              Industrial & Forensic Verification Applications
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                num: '01',
                title: 'Industrial Safety Auditing',
                desc: 'Verifying protocol compliance in manufacturing, chemical laboratories, and cleanroom environments with verifiable evidence trails.',
                example: 'Chemical spill protocol verification in research facilities.'
              },
              {
                num: '02',
                title: 'Traffic Incident Reconstruction',
                desc: 'Determining causality in multi-vehicle collisions and near-misses for legally auditable insurance reports.',
                example: 'Intersection collision causal chain verification.'
              },
              {
                num: '03',
                title: 'Automated CCTV Forensic Search',
                desc: 'Auditing hundreds of hours of surveillance footage to identify not just who was present, but what chain of actions occurred.',
                example: 'Restricted area breach sequence analysis.'
              },
              {
                num: '04',
                title: 'Accessibility Narratives',
                desc: 'Generating faithful, hallucination-free auditory descriptions for visually impaired audiences that explain the true story.',
                example: 'Film narrative audio descriptions without fictitious props.'
              }
            ].map((item) => (
              <div
                key={item.num}
                className="p-5 rounded-[16px] bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xs space-y-2 group hover:border-[#6D5EF5]/50 transition-all"
              >
                <span className="font-mono text-2xl font-black text-[var(--text-muted)] group-hover:text-[#6D5EF5] transition-colors">
                  {item.num}
                </span>
                <h4 className="font-bold text-[var(--text-primary)] text-sm">{item.title}</h4>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {item.desc}
                </p>
                <div className="pt-2 text-[10px] font-mono text-[#6D5EF5] border-t border-[var(--border-subtle)]">
                  Use Case: {item.example}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================================
            SECTION 7: CREDIBILITY (TECH STACK & BE FINAL-YEAR ATTRIBUTION)
        ========================================================================= */}
        <section className="p-6 rounded-[16px] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-default)] pb-3">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-[#6D5EF5] font-semibold">
                Engineering Stack
              </span>
              <h3 className="font-bold text-sm text-[var(--text-primary)]">
                Core Technologies & Open Source Infrastructure
              </h3>
            </div>
            <span className="text-[11px] font-mono text-[var(--text-muted)]">
              Built as a BE Final-Year Capstone Project
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {techStack.map((tech) => (
              <div
                key={tech.name}
                className="p-3 rounded-[10px] bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-0.5"
              >
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <strong className="text-[var(--text-primary)]">{tech.name}</strong>
                  <span className="text-[#6D5EF5]">{tech.badge}</span>
                </div>
                <p className="text-[11px] text-[var(--text-muted)] truncate">{tech.role}</p>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-[var(--text-secondary)]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#10B981]" />
              <span>Project: VERITAS-V · Explainable Agentic Vision-Language Framework</span>
            </div>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#6D5EF5] hover:underline inline-flex items-center gap-1"
            >
              <span>GitHub Specification</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </section>

        {/* =========================================================================
            CLOSING CTA BAND
        ========================================================================= */}
        <section className="p-8 rounded-[20px] bg-[#0A0A0B] text-white text-center space-y-4 shadow-lg">
          <span className="text-xs font-mono text-[#6D5EF5] font-bold uppercase tracking-wider">
            Ready to Verify Video Models?
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Run Your First Video Verification Analysis
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-lg mx-auto leading-relaxed">
            Upload your footage to test scene detection, causal dependency chaining, and frame-grounded hallucination elimination.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/new-analysis')}
              className="px-6 py-2.5 rounded-full bg-[#6D5EF5] hover:bg-[#5B4BE2] text-white font-bold text-xs shadow-md shadow-[#6D5EF5]/30 cursor-pointer transition-transform hover:scale-105"
            >
              Start Analysis Now
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/20 transition-colors"
            >
              View Recent Reports
            </button>
          </div>
        </section>
      </Container>
    </div>
  );
};

export default About;
