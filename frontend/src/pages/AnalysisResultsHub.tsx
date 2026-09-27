import React, { useState } from 'react';
import {
  FileCheck2,
  Film,
  GitCommit,
  Network,
  ShieldCheck,
  FileText,
  Volume2,
  Play,
  Pause,
  Download,
  Copy,
  Check,
  ExternalLink,
  ZoomIn,
  AlertCircle,
  HelpCircle,
  Share2,
  Clock,
  Sparkles,
  ArrowRight,
  Filter,
  User,
  Sliders,
  ChevronRight,
  Eye,
} from 'lucide-react';
import {
  VideoAnalysisResult,
  VerificationVerdict,
  VerificationStatus,
  ExplainabilityClaim,
} from '../types';
import { MOCK_VIDEOS } from '../data/mockData';
import { VerdictBadge } from '../components/Badge';
import { FrameInspectorModal } from '../components/FrameInspectorModal';

interface AnalysisResultsHubProps {
  currentResult: VideoAnalysisResult;
  onSelectVideo: (video: VideoAnalysisResult) => void;
}

export type HubTab =
  | 'overview'
  | 'scenes'
  | 'narrative'
  | 'causal'
  | 'verification'
  | 'explainability'
  | 'diarization';

export const AnalysisResultsHub: React.FC<AnalysisResultsHubProps> = ({
  currentResult,
  onSelectVideo,
}) => {
  const [activeTab, setActiveTab] = useState<HubTab>('overview');
  const [currentTime, setCurrentTime] = useState<number>(8.5);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  // Frame Inspector Modal State
  const [inspectorOpen, setInspectorOpen] = useState<boolean>(false);
  const [selectedFrames, setSelectedFrames] = useState<string[]>([]);
  const [inspectingClaim, setInspectingClaim] = useState<string>('');
  const [inspectingVerdict, setInspectingVerdict] = useState<VerificationVerdict | undefined>();
  const [inspectingScene, setInspectingScene] = useState<string>('');
  const [inspectingTime, setInspectingTime] = useState<string>('');

  // Tally counts
  const verifiedCount = currentResult.verification_reports.filter((v) => v.verdict === 'verified').length;
  const contradictedCount = currentResult.verification_reports.filter((v) => v.verdict === 'contradicted').length;
  const unverifiedCount = currentResult.verification_reports.filter((v) => v.verdict === 'unverified').length;
  const unverifiableCount = currentResult.verification_reports.filter((v) => v.verdict === 'unverifiable').length;

  const handleOpenInspector = (
    frames: string[],
    claimText: string,
    verdict?: VerificationVerdict,
    sceneId: string = 'scene_002',
    timestamp: string = '00:08 - 00:11'
  ) => {
    setSelectedFrames(frames.length > 0 ? frames : ['frame_008.jpg', 'frame_009.jpg']);
    setInspectingClaim(claimText);
    setInspectingVerdict(verdict);
    setInspectingScene(sceneId);
    setInspectingTime(timestamp);
    setInspectorOpen(true);
  };

  const handleCopy = (text: string, format: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  const handleDownload = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabs: { id: HubTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'overview', label: '1. Overview & Summary', icon: <Film className="w-4 h-4" /> },
    { id: 'scenes', label: '2. Scene Detection & Captions', icon: <LayersIcon className="w-4 h-4" /> },
    { id: 'narrative', label: '3. Narrative Synthesis', icon: <GitCommit className="w-4 h-4" /> },
    { id: 'causal', label: '4. Causal Reasoning Graph', icon: <Network className="w-4 h-4" /> },
    { id: 'verification', label: '5. Hallucination Verification', icon: <ShieldCheck className="w-4 h-4" />, badge: `${contradictedCount} Purged` },
    { id: 'explainability', label: '6. Explainability Report', icon: <FileCheck2 className="w-4 h-4" /> },
    { id: 'diarization', label: '7. Speaker Diarization', icon: <Volume2 className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Top Header: Scenario Picker & Global Meta */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-400">
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>EXPLAINABILITY AUDIT HUB</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 mt-1">
            {currentResult.title}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs font-mono text-slate-400">
            <span>ID: <strong className="text-slate-200">{currentResult.video_id}</strong></span>
            <span>•</span>
            <span>Duration: <strong className="text-slate-200">{currentResult.duration}s</strong></span>
            <span>•</span>
            <span className="text-cyan-400">{currentResult.category}</span>
          </div>
        </div>

        {/* Video Scenario Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">Select Video:</span>
          <select
            value={currentResult.video_id}
            onChange={(e) => {
              const selected = MOCK_VIDEOS.find((v) => v.video_id === e.target.value);
              if (selected) onSelectVideo(selected);
            }}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 focus:border-indigo-500 cursor-pointer"
          >
            {MOCK_VIDEOS.map((v) => (
              <option key={v.video_id} value={v.video_id}>
                {v.title} ({v.video_id})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 7 Logical Tabs Navigation Bar */}
      <div className="border-b border-slate-800 overflow-x-auto no-scrollbar">
        <div className="flex items-center space-x-1 min-w-max pb-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-t-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-slate-850 text-indigo-300 border-b-2 border-indigo-400 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-950 border border-rose-800 text-rose-300 font-bold">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW & SUMMARY */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Synchronized Simulated Video Player + Summary prose */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Video Player Component */}
            <div className="lg:col-span-7 space-y-3">
              <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl">
                {/* Simulated Player Viewport */}
                <div className="relative aspect-video bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col justify-between p-4">
                  {/* Top Overlay Badge */}
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="px-2 py-0.5 rounded bg-black/70 border border-slate-800 text-slate-300">
                      FRAME FEED: {currentTime < 7.8 ? 'scene_001' : currentTime < 14.2 ? 'scene_002' : currentTime < 19.5 ? 'scene_003' : 'scene_004'}
                    </span>
                    <span className="text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800">
                      SYNCED WITH GROUNDING MESH
                    </span>
                  </div>

                  {/* Dynamic Graphic Visual for Current Time */}
                  <div className="self-center flex flex-col items-center">
                    {currentTime >= 7.8 && currentTime <= 14.2 ? (
                      <div className="text-center p-6 border-2 border-dashed border-emerald-400/80 rounded-lg bg-emerald-950/20 backdrop-blur-xs">
                        <span className="text-[11px] font-mono font-bold text-emerald-300 block mb-1">
                          GROUNDED CLAIM VERIFIED [00:08 - 00:11]
                        </span>
                        <div className="text-sm font-bold text-slate-100 font-mono">
                          "Person drops glass → Glass falls → Glass shatters"
                        </div>
                        <button
                          onClick={() =>
                            handleOpenInspector(
                              ['frame_008.jpg', 'frame_009.jpg', 'frame_010.jpg', 'frame_011.jpg'],
                              'Person drops glass → Glass falls → Glass shatters on tiled surface',
                              currentResult.verification_reports[0],
                              'scene_002',
                              '00:08 - 00:11'
                            )
                          }
                          className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-700 hover:bg-emerald-600 text-white font-mono text-xs cursor-pointer"
                        >
                          <ZoomIn className="w-3.5 h-3.5" />
                          <span>Inspect Frame Evidence (frame_008 - frame_011)</span>
                        </button>
                      </div>
                    ) : (
                      <div className="text-center text-slate-500 font-mono text-xs">
                        <Film className="w-12 h-12 mx-auto mb-2 text-slate-700" />
                        <span>Scrub timeline below to view causal transitions</span>
                      </div>
                    )}
                  </div>

                  {/* Player Bottom Bar Overlay */}
                  <div className="flex justify-between items-center text-xs font-mono text-slate-400 bg-black/60 px-3 py-1.5 rounded">
                    <span>{currentTime.toFixed(1)}s / {currentResult.duration}s</span>
                    <span>1080p 30fps</span>
                  </div>
                </div>

                {/* Player Controls Bar */}
                <div className="p-3 bg-slate-900 border-t border-slate-800 space-y-2">
                  {/* Scrub Bar */}
                  <input
                    type="range"
                    min="0"
                    max={currentResult.duration}
                    step="0.1"
                    value={currentTime}
                    onChange={(e) => setCurrentTime(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-950 rounded"
                  />

                  {/* Scene Timeline Jump Markers */}
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                      >
                        {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                      </button>
                      <span className="text-slate-300">
                        Scene: {currentTime < 7.8 ? '001 (Intro)' : currentTime < 14.2 ? '002 (Breakage)' : currentTime < 19.5 ? '003 (Spill Kit)' : '004 (Cordon)'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {Object.entries(currentResult.scenes).map(([scId, sc]) => (
                        <button
                          key={scId}
                          onClick={() => setCurrentTime(sc.start_time)}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono border cursor-pointer ${
                            currentTime >= sc.start_time && currentTime <= sc.end_time
                              ? 'bg-indigo-950 border-indigo-700 text-indigo-300 font-bold'
                              : 'bg-slate-950 border-slate-800 text-slate-500'
                          }`}
                        >
                          {scId}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Synthesized Causal Narrative & Gauges */}
            <div className="lg:col-span-5 space-y-4">
              {/* Overall Synthesized Narrative Prose Card */}
              <div className="p-5 rounded-lg bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    Synthesized Causal Narrative
                  </span>
                  <span className="text-xs font-mono text-emerald-400 font-semibold">
                    Coherence: {(currentResult.narrative_coherence_score * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed font-sans bg-slate-950/80 p-3.5 rounded border border-slate-850">
                  {currentResult.overall_narrative}
                </p>
                <div className="text-[11px] font-mono text-slate-500">
                  Synthesized via <code className="text-indigo-300">generate_narrative.py</code> + Verified via <code className="text-emerald-300">generate_verification_report.py</code>.
                </div>
              </div>

              {/* Hallucination Verdict Tally Panel */}
              <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-3">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
                  Hallucination Audit Verdict Tally
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-2.5 rounded bg-slate-950 border border-emerald-900/60 text-center">
                    <span className="text-[10px] font-mono text-emerald-400 block font-bold">VERIFIED</span>
                    <span className="text-xl font-bold font-mono text-emerald-300">{verifiedCount}</span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-950 border border-rose-900/60 text-center">
                    <span className="text-[10px] font-mono text-rose-400 block font-bold">CONTRADICTED</span>
                    <span className="text-xl font-bold font-mono text-rose-300">{contradictedCount}</span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-950 border border-amber-900/60 text-center">
                    <span className="text-[10px] font-mono text-amber-400 block font-bold">UNVERIFIED</span>
                    <span className="text-xl font-bold font-mono text-amber-300">{unverifiedCount}</span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-center">
                    <span className="text-[10px] font-mono text-slate-400 block font-bold">UNVERIFIABLE</span>
                    <span className="text-xl font-bold font-mono text-slate-300">{unverifiableCount}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-rose-950/20 border border-rose-900/40 text-xs text-rose-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>1 Hallucination Purged:</strong> The speculative claim that researcher kicked the bench was contradicted by frame evidence and excluded from the synthesized story.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SCENE DETECTION & CAPTIONS */}
      {/* ========================================================================= */}
      {activeTab === 'scenes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-mono font-bold text-slate-300 uppercase tracking-wider">
              Segmented Scene Units & Extracted Keyframes
            </h2>
            <span className="text-xs font-mono text-slate-500">
              PySceneDetect threshold=40.0 · FFmpeg 4 frames/scene
            </span>
          </div>

          <div className="space-y-4">
            {Object.entries(currentResult.scenes).map(([sceneId, scene]) => (
              <div
                key={sceneId}
                className="p-5 rounded-lg bg-slate-900 border border-slate-800 space-y-4"
              >
                {/* Scene Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded bg-indigo-950 border border-indigo-700 font-mono text-xs font-bold text-indigo-300">
                      {sceneId.toUpperCase()}
                    </span>
                    <span className="font-mono text-xs text-slate-300">
                      {scene.start_time.toFixed(2)}s — {scene.end_time.toFixed(2)}s ({(scene.end_time - scene.start_time).toFixed(1)}s duration)
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-500">
                    {scene.frame_files.length} keyframes extracted
                  </span>
                </div>

                {/* Extracted Frame Gallery */}
                <div>
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-2">
                    Extracted Visual Keyframe Gallery:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {scene.frame_files.map((frame, idx) => (
                      <div
                        key={frame}
                        onClick={() =>
                          handleOpenInspector(
                            scene.frame_files,
                            scene.caption,
                            undefined,
                            sceneId,
                            `${scene.start_time.toFixed(1)}s - ${scene.end_time.toFixed(1)}s`
                          )
                        }
                        className="group relative rounded border border-slate-800 bg-slate-950 aspect-video overflow-hidden cursor-pointer hover:border-indigo-500 transition-colors"
                      >
                        <div className="w-full h-full flex flex-col justify-between p-2 bg-gradient-to-b from-slate-900 to-slate-950 text-slate-400 text-[10px] font-mono">
                          <div className="flex justify-between">
                            <span>#{idx + 1}</span>
                            <span className="text-cyan-400">{frame}</span>
                          </div>
                          <div className="flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="p-1 rounded bg-indigo-600 text-white shadow">
                              <ZoomIn className="w-3.5 h-3.5" />
                            </span>
                          </div>
                          <div className="text-slate-500 text-[9px] truncate">
                            {(scene.start_time + idx * 1.5).toFixed(1)}s
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Caption & Transcript Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-3 rounded bg-slate-950 border border-slate-800">
                    <span className="text-[11px] font-mono text-indigo-400 uppercase tracking-wider block mb-1">
                      Raw VLM Caption:
                    </span>
                    <p className="text-xs text-slate-200 font-sans leading-relaxed">
                      "{scene.caption}"
                    </p>
                  </div>

                  <div className="p-3 rounded bg-slate-950 border border-slate-800">
                    <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider block mb-1">
                      Whisper Audio Transcript:
                    </span>
                    <p className="text-xs text-slate-300 font-mono italic leading-relaxed">
                      "{scene.transcript_text}"
                    </p>
                  </div>
                </div>

                {/* Keywords Tags */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] font-mono text-slate-500 mr-1">Semantic Keywords:</span>
                  {scene.keywords.map((kw) => (
                    <span
                      key={kw}
                      className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 border border-slate-700 text-slate-300"
                    >
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: NARRATIVE SYNTHESIS */}
      {/* ========================================================================= */}
      {activeTab === 'narrative' && (
        <div className="space-y-6">
          <div className="p-5 rounded-lg bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider font-semibold">
                  Stage 2: Rhetorical Flow Synthesis
                </span>
                <h3 className="text-base font-bold text-slate-100 mt-1">
                  Chronological Scene Merging Workflow
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400">Coherence Score:</span>
                <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-700 font-mono text-xs font-bold text-emerald-300">
                  {(currentResult.narrative_coherence_score * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              The Narrative Synthesis Agent stitches isolated scene captions into continuous, reader-oriented prose using dynamic rhetorical transition connectors (e.g., <em>"Subsequently"</em>, <em>"Recognizing the hazard"</em>, <em>"Meanwhile"</em>) to preserve temporal fidelity.
            </p>

            {/* Step-by-Step Transition Mapping */}
            <div className="space-y-3 pt-2">
              {Object.entries(currentResult.scenes).map(([scId, sc], index, arr) => (
                <div key={scId} className="relative pl-6 border-l-2 border-indigo-700/60 space-y-1.5 pb-4 last:pb-0">
                  <span className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-indigo-900 border-2 border-indigo-400 text-[10px] font-mono font-bold flex items-center justify-center text-white">
                    {index + 1}
                  </span>
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="font-bold text-indigo-300">{scId.toUpperCase()}</span>
                    <span className="text-slate-500">[{sc.start_time.toFixed(1)}s - {sc.end_time.toFixed(1)}s]</span>
                    {index > 0 && (
                      <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-300 text-[10px]">
                        Connector: {index === 1 ? 'At 00:08 (Temporal Transition)' : index === 2 ? 'Recognizing the hazard (Causal Connector)' : 'Concurrently (Remediation)'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-200 bg-slate-950 p-2.5 rounded border border-slate-850">
                    "{sc.caption}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: CAUSAL REASONING GRAPH */}
      {/* ========================================================================= */}
      {activeTab === 'causal' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-semibold">
                Stage 3: Causal Reasoning
              </span>
              <h2 className="text-lg font-bold text-slate-100 mt-1">
                Event Causality Graph & Inter-Scene Linkages
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Evaluates keyword overlap & cause-effect hypotheses
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentResult.causal_claims.map((claim, idx) => {
              const isLinked = claim.link_status !== 'no_link_detected';

              return (
                <div
                  key={idx}
                  className={`p-5 rounded-lg border space-y-3 ${
                    isLinked
                      ? 'bg-slate-900 border-slate-800'
                      : 'bg-rose-950/20 border-rose-900/60 ring-1 ring-rose-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="px-2 py-0.5 rounded bg-indigo-950 border border-indigo-700 text-indigo-300 font-bold">
                        {claim.cause_scene_id.toUpperCase()}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-700 text-cyan-300 font-bold">
                        {claim.scene_id.toUpperCase()}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        isLinked
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}
                    >
                      {isLinked ? 'LINK DETECTED' : 'NO_LINK_DETECTED'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                      Synthesized Causal Statement:
                    </span>
                    <p className="text-xs font-medium text-slate-200 bg-slate-950 p-2.5 rounded border border-slate-850">
                      "{claim.causal_statement}"
                    </p>
                  </div>

                  <div className="text-xs space-y-1.5 pt-1">
                    <div className="flex justify-between font-mono text-[11px]">
                      <span className="text-slate-500">Antecedent Cause:</span>
                      <span className="text-slate-300">{claim.cause}</span>
                    </div>
                    <div className="flex justify-between font-mono text-[11px]">
                      <span className="text-slate-500">Consequent Event:</span>
                      <span className="text-slate-300">{claim.event}</span>
                    </div>
                    <div className="flex justify-between font-mono text-[11px]">
                      <span className="text-slate-500">Causal Confidence:</span>
                      <span className="text-indigo-400 font-bold">{(claim.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </div>

                  {claim.keyword_overlap && claim.keyword_overlap.length > 0 && (
                    <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-mono text-slate-500">Shared Keywords:</span>
                      {claim.keyword_overlap.map((kw) => (
                        <span key={kw} className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-950/60 border border-indigo-800/60 text-indigo-300">
                          #{kw}
                        </span>
                      ))}
                    </div>
                  )}

                  {!isLinked && (
                    <div className="p-2 rounded bg-rose-950/40 text-[11px] font-mono text-rose-300 border border-rose-900/60">
                      Orphan hypothesis: zero keyword overlap detected between scene pair. Flagged for verification rejection.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: HALLUCINATION VERIFICATION MATRIX */}
      {/* ========================================================================= */}
      {activeTab === 'verification' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-semibold">
                Stage 4: Hallucination Verification Agent
              </span>
              <h2 className="text-lg font-bold text-slate-100 mt-1">
                Visual Grounding Verification Matrix
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Cross-examines claims against raw extracted video frames
            </span>
          </div>

          {/* Verification Table */}
          <div className="rounded-lg border border-slate-800 bg-slate-900 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                    <th className="p-3.5">Scene</th>
                    <th className="p-3.5">Claim Text</th>
                    <th className="p-3.5">Verdict Status</th>
                    <th className="p-3.5">Confidence</th>
                    <th className="p-3.5">Frame Evidence</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-xs">
                  {currentResult.verification_reports.map((report, idx) => (
                    <tr key={idx} className="hover:bg-slate-850/60 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-indigo-300">
                        {report.scene_id}
                      </td>
                      <td className="p-3.5 text-slate-200 font-medium max-w-xs sm:max-w-md">
                        "{report.claim}"
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <VerdictBadge verdict={report.verdict} size="sm" />
                      </td>
                      <td className="p-3.5 font-mono text-emerald-400 font-bold whitespace-nowrap">
                        {(report.confidence * 100).toFixed(0)}%
                      </td>
                      <td className="p-3.5 font-mono text-slate-400 whitespace-nowrap text-[11px]">
                        {report.frame_files.length > 0 ? (
                          <span className="text-cyan-300">
                            {report.frame_files[0]} - {report.frame_files[report.frame_files.length - 1]}
                          </span>
                        ) : (
                          <span className="text-slate-600">None</span>
                        )}
                      </td>
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <button
                          onClick={() =>
                            handleOpenInspector(
                              report.frame_files,
                              report.claim,
                              report,
                              report.scene_id,
                              '00:08 - 00:11'
                            )
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-indigo-950 hover:text-indigo-300 hover:border-indigo-700 text-slate-300 border border-slate-700 text-[11px] font-mono cursor-pointer transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: EXPLAINABILITY & EVIDENCE REPORT */}
      {/* ========================================================================= */}
      {activeTab === 'explainability' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-semibold">
                Stage 5: Final Auditable Artifacts
              </span>
              <h2 className="text-lg font-bold text-slate-100 mt-1">
                Evidence-Annotated Explainability Report
              </h2>
            </div>

            {/* Export & Copy Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(currentResult.raw_files.explained_md, 'md')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-mono text-xs cursor-pointer"
              >
                {copiedFormat === 'md' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy Markdown</span>
              </button>

              <button
                onClick={() =>
                  handleDownload(
                    currentResult.raw_files.explained_json,
                    `${currentResult.video_id}_explained.json`,
                    'application/json'
                  )
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-semibold cursor-pointer shadow"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON Report</span>
              </button>
            </div>
          </div>

          {/* Interactive Claim Cards with Frame Citations & Clickable Timestamps */}
          <div className="space-y-3">
            {currentResult.explainability_claims.map((claim, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border space-y-3 ${
                  claim.included_in_narrative
                    ? 'bg-slate-900 border-slate-800'
                    : 'bg-rose-950/20 border-rose-900/50 opacity-80'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 font-mono text-xs font-bold text-slate-300">
                      {claim.scene_id}
                    </span>
                    <button
                      onClick={() => {
                        setCurrentTime(claim.start_time);
                        setActiveTab('overview');
                      }}
                      className="inline-flex items-center gap-1 text-xs font-mono text-cyan-400 hover:underline cursor-pointer"
                      title="Jump player to this timestamp"
                    >
                      <Clock className="w-3 h-3" />
                      <span>{claim.start_time.toFixed(1)}s - {claim.end_time.toFixed(1)}s</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <VerdictBadge verdict={claim.verdict} size="sm" />
                    <span className="text-xs font-mono text-emerald-400 font-bold">
                      {(claim.confidence * 100).toFixed(0)}%
                    </span>
                    {claim.included_in_narrative ? (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-300">
                        INCLUDED IN PROSE
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 border border-rose-800 text-rose-300 font-bold">
                        PURGED (HALLUCINATION)
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-sm font-medium text-slate-100">
                  "{claim.claim}"
                </p>

                {/* Evidence Citations */}
                <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-xs">
                  <span className="text-slate-500">Frame Citations:</span>
                  {claim.evidence_frames.map((frame) => (
                    <button
                      key={frame}
                      onClick={() =>
                        handleOpenInspector(
                          claim.evidence_frames,
                          claim.claim,
                          currentResult.verification_reports.find((v) => v.claim === claim.claim),
                          claim.scene_id,
                          `${claim.start_time.toFixed(1)}s - ${claim.end_time.toFixed(1)}s`
                        )
                      }
                      className="px-2 py-0.5 rounded bg-slate-950 hover:bg-indigo-950 hover:border-indigo-600 border border-slate-850 text-indigo-300 text-[11px] cursor-pointer transition-colors"
                    >
                      {frame} ↗
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Rendered Markdown Preview Block */}
          <div className="p-4 rounded-lg bg-[#030712] border border-slate-800 font-mono text-xs text-slate-300 space-y-2">
            <div className="flex justify-between items-center text-slate-500 border-b border-slate-800 pb-1">
              <span>OUTPUT PREVIEW: {currentResult.video_id}_explained.md</span>
              <span>DETERMINISTIC STAGE 5 ASSEMBLY</span>
            </div>
            <pre className="whitespace-pre-wrap leading-relaxed overflow-x-auto text-[11px] text-slate-300">
              {currentResult.raw_files.explained_md}
            </pre>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: SPEAKER DIARIZATION & AUDIO CONTEXT */}
      {/* ========================================================================= */}
      {activeTab === 'diarization' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-semibold">
                Multi-Modal Audio Telemetry
              </span>
              <h2 className="text-lg font-bold text-slate-100 mt-1">
                Whisper Transcription & Speaker Diarization
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-400">
              diarization.py · TRANSCRIPT_REPEAT_THRESHOLD=8
            </span>
          </div>

          {/* Diarization Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[11px] font-mono text-slate-500 block mb-1">
                DETECTED SPEAKERS
              </span>
              <div className="text-xl font-bold font-mono text-slate-100">
                {currentResult.diarization.speakers.length} Identified
              </div>
              <div className="text-xs font-mono text-indigo-400 mt-1">
                {currentResult.diarization.speakers.join(', ')}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[11px] font-mono text-slate-500 block mb-1">
                REPEAT FILTER RATIO
              </span>
              <div className="text-xl font-bold font-mono text-emerald-400">
                {currentResult.diarization.repeat_filter_stats.filter_ratio}
              </div>
              <div className="text-xs font-mono text-slate-400 mt-1">
                {currentResult.diarization.repeat_filter_stats.repeated_phrases_dropped} noise repetitions dropped
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[11px] font-mono text-slate-500 block mb-1">
                TOTAL WORDS EVALUATED
              </span>
              <div className="text-xl font-bold font-mono text-cyan-400">
                {currentResult.diarization.repeat_filter_stats.words_evaluated} words
              </div>
              <div className="text-xs font-mono text-slate-400 mt-1">
                Threshold cutoff: 8 repeats
              </div>
            </div>
          </div>

          {/* Diarized Timeline Utterances */}
          <div className="space-y-3">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
              Diarized Speech Segments:
            </span>

            {currentResult.diarization.segments.map((seg, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg bg-slate-900 border border-slate-800 flex items-start gap-4"
              >
                <div className="p-2 rounded bg-indigo-950 border border-indigo-700/60 text-indigo-300">
                  <User className="w-4 h-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-slate-200">{seg.speaker_id}</span>
                    <span className="text-slate-400">
                      [{seg.start_time.toFixed(1)}s - {seg.end_time.toFixed(1)}s] • ASR Conf: {(seg.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                    "{seg.text}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Frame Inspector Modal Triggered On Demand */}
      <FrameInspectorModal
        isOpen={inspectorOpen}
        onClose={() => setInspectorOpen(false)}
        frameFiles={selectedFrames}
        claimText={inspectingClaim}
        verdict={inspectingVerdict}
        sceneId={inspectingScene}
        timestamp={inspectingTime}
      />
    </div>
  );
};

function LayersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}
