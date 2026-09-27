import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  RotateCcw,
  Sliders,
  Terminal,
  Upload,
  Video,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Pause,
  Download,
  Clock,
  Sparkles,
  Layers,
  ChevronDown,
} from 'lucide-react';
import {
  BackendConfigState,
  PipelineExecutionLog,
  VideoAnalysisResult
} from '../types';
import { SIMULATED_PIPELINE_LOGS, MOCK_VIDEOS } from '../data/mockData';

interface NewAnalysisPageProps {
  config: BackendConfigState;
  onUpdateConfig: (newConfig: Partial<BackendConfigState>) => void;
  onCompleteAnalysis: (result: VideoAnalysisResult) => void;
}

export const NewAnalysisPage: React.FC<NewAnalysisPageProps> = ({
  config,
  onUpdateConfig,
  onCompleteAnalysis,
}) => {
  const [selectedClip, setSelectedClip] = useState<string>('sample_clip_001');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [currentLogIndex, setCurrentLogIndex] = useState<number>(0);
  const [logs, setLogs] = useState<PipelineExecutionLog[]>([]);
  const [executionSpeed, setExecutionSpeed] = useState<number>(1);
  const [activeStageIndex, setActiveStageIndex] = useState<number>(0);
  const [configDrawerOpen, setConfigDrawerOpen] = useState<boolean>(false);

  const terminalEndRef = useRef<HTMLDivElement>(null);

  const sampleLibrary = [
    {
      id: 'sample_clip_001',
      title: 'Chemistry Lab Incident (Beaker Spill)',
      duration: '24.5s',
      category: 'Lab Safety Audit',
      badge: 'Ground-Truth Available',
    },
    {
      id: 'msrvtt_7014',
      title: 'MSR-VTT 7014: High Jump Athletics',
      duration: '15.2s',
      category: 'MSR-VTT Test 1K',
      badge: 'Benchmark Reference',
    },
    {
      id: 'traffic_safety_09',
      title: 'Traffic Intersection Near-Collision',
      duration: '18.0s',
      category: 'Surveillance & Public Safety',
      badge: 'Surveillance CCTV',
    },
  ];

  const pipelineStagesList = [
    'Scene Detection',
    'Frame Extraction',
    'Audio Transcription',
    'VLM Captioning',
    'Narrative Synthesis',
    'Causal Reasoning',
    'Hallucination Verification',
    'Explainability Assembly'
  ];

  // Auto-scroll terminal
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Log simulation timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && currentLogIndex < SIMULATED_PIPELINE_LOGS.length) {
      const delay = Math.max(250, 900 / executionSpeed);
      timer = setTimeout(() => {
        const nextLog = SIMULATED_PIPELINE_LOGS[currentLogIndex];
        setLogs((prev) => [...prev, nextLog]);
        setCurrentLogIndex((idx) => idx + 1);

        // Update active stage indicator based on log stage
        const stageIdx = pipelineStagesList.findIndex((s) => s.toLowerCase() === nextLog.stage.toLowerCase());
        if (stageIdx !== -1) {
          setActiveStageIndex(stageIdx);
        }

        if (currentLogIndex === SIMULATED_PIPELINE_LOGS.length - 1) {
          setIsRunning(false);
          setIsCompleted(true);
        }
      }, delay);
    }
    return () => clearTimeout(timer);
  }, [isRunning, currentLogIndex, executionSpeed]);

  const handleStartPipeline = () => {
    setLogs([]);
    setCurrentLogIndex(0);
    setIsRunning(true);
    setIsCompleted(false);
    setActiveStageIndex(0);
  };

  const handleResetPipeline = () => {
    setIsRunning(false);
    setIsCompleted(false);
    setLogs([]);
    setCurrentLogIndex(0);
    setActiveStageIndex(0);
  };

  const handleJumpToResults = () => {
    const targetVideo = MOCK_VIDEOS.find((v) => v.video_id === selectedClip) || MOCK_VIDEOS[0];
    onCompleteAnalysis(targetVideo);
  };

  const currentProgressPercent = Math.min(
    100,
    Math.round((logs.length / SIMULATED_PIPELINE_LOGS.length) * 100)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Page Title */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-indigo-400">
          <Terminal className="w-3.5 h-3.5" />
          <span>EXECUTION ENGINE & LIVE PIPELINE CONSOLE</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 mt-1">
          Initiate Video Causal Analysis
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Select a sample clip or upload an MP4 container, configure runtime hyperparameters, and stream live multi-agent inference logs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Selection & Configuration Drawer */}
        <div className="lg:col-span-4 space-y-6">
          {/* Sample Clip Selector */}
          <div className="p-5 rounded-lg bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Video className="w-4 h-4 text-cyan-400" />
                Select Video Clip
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                {sampleLibrary.length} clips ready
              </span>
            </div>

            <div className="space-y-2">
              {sampleLibrary.map((clip) => {
                const isSelected = selectedClip === clip.id;
                return (
                  <div
                    key={clip.id}
                    onClick={() => {
                      if (!isRunning) {
                        setSelectedClip(clip.id);
                        handleResetPipeline();
                      }
                    }}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-950/70 border-indigo-500 text-indigo-200 ring-1 ring-indigo-500/50'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-slate-100">{clip.title}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                        {clip.duration}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[11px] font-mono text-slate-500">
                      <span>{clip.category}</span>
                      <span className="text-indigo-400">{clip.badge}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Simulated File Upload Zone */}
            <div className="p-4 rounded-lg border border-dashed border-slate-700 bg-slate-950/60 text-center hover:border-indigo-500/60 transition-colors cursor-pointer group">
              <Upload className="w-5 h-5 mx-auto text-slate-500 group-hover:text-indigo-400 transition-colors" />
              <div className="mt-2 text-xs font-mono text-slate-300 font-medium">
                Upload Custom Video
              </div>
              <p className="text-[10px] text-slate-500 mt-1 font-mono">
                Supports MP4, MKV, AVI (Max 250MB)
              </p>
            </div>
          </div>

          {/* Hyperparameter Controls Accordion */}
          <div className="rounded-lg bg-slate-900 border border-slate-800 overflow-hidden">
            <button
              onClick={() => setConfigDrawerOpen(!configDrawerOpen)}
              className="w-full p-4 flex items-center justify-between text-xs font-mono font-bold text-slate-300 hover:bg-slate-850 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <span>Runtime Hyperparameters (.env)</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${configDrawerOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {configDrawerOpen && (
              <div className="p-4 border-t border-slate-800 space-y-4 bg-slate-950/60">
                {/* Scene Detect Threshold */}
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">PY_SCENE_DETECT_THRESHOLD:</span>
                    <span className="text-indigo-400 font-bold">{config.pySceneDetectThreshold}</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="65"
                    step="1"
                    value={config.pySceneDetectThreshold}
                    onChange={(e) => onUpdateConfig({ pySceneDetectThreshold: parseFloat(e.target.value) })}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500 font-mono">Lower = more scene cuts detected</span>
                </div>

                {/* Num Frames Per Scene */}
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">NUM_FRAMES_PER_SCENE:</span>
                    <span className="text-indigo-400 font-bold">{config.numFramesPerScene}</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="8"
                    step="1"
                    value={config.numFramesPerScene}
                    onChange={(e) => onUpdateConfig({ numFramesPerScene: parseInt(e.target.value) })}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500 font-mono">Representative FFmpeg keyframes</span>
                </div>

                {/* Whisper Model Size */}
                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">
                    WHISPER_MODEL_SIZE:
                  </label>
                  <select
                    value={config.whisperModelSize}
                    onChange={(e) => onUpdateConfig({ whisperModelSize: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs font-mono text-slate-200"
                  >
                    <option value="tiny">tiny (Fastest, low VRAM)</option>
                    <option value="base">base (Standard default)</option>
                    <option value="small">small (Balanced)</option>
                    <option value="medium">medium (High accuracy)</option>
                    <option value="large">large (Full multilingual)</option>
                  </select>
                </div>

                {/* Batch API Toggle */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="text-xs font-mono text-slate-400">USE_BATCH_API:</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.useBatchApi}
                      onChange={(e) => onUpdateConfig({ useBatchApi: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Multi-Agent Log Terminal */}
        <div className="lg:col-span-8 space-y-4">
          {/* Controls Bar & Stage Progress */}
          <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {!isRunning ? (
                  <button
                    onClick={handleStartPipeline}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold shadow-md cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Run Multi-Agent Pipeline</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setIsRunning(false)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded bg-amber-600 hover:bg-amber-500 text-white font-mono text-xs font-bold cursor-pointer"
                  >
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>Pause Stream</span>
                  </button>
                )}

                <button
                  onClick={handleResetPipeline}
                  disabled={logs.length === 0}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 font-mono text-xs cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>

              {/* Execution Speed Selector */}
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-slate-500">Log Speed:</span>
                {[1, 2, 4].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => setExecutionSpeed(speed)}
                    className={`px-2 py-0.5 rounded border ${
                      executionSpeed === speed
                        ? 'bg-indigo-950 border-indigo-700 text-indigo-300 font-bold'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>

            {/* Stage Stepper Progress Bar */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-slate-400">
                  Active Stage: <strong className="text-cyan-400">{pipelineStagesList[activeStageIndex]}</strong>
                </span>
                <span className="text-emerald-400 font-bold">{currentProgressPercent}% Complete</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-cyan-500 to-emerald-500 transition-all duration-300"
                  style={{ width: `${currentProgressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Terminal Window */}
          <div className="rounded-lg border border-slate-800 bg-[#030712] overflow-hidden shadow-2xl font-mono">
            {/* Terminal Header */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 text-xs text-slate-400 select-none">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block"></span>
                </div>
                <span className="text-[11px] text-slate-400 pl-2">
                  veritas-pipeline-stdout ({selectedClip})
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                <span className="text-emerald-400">ONLINE</span>
                <span>•</span>
                <span>PID 8192</span>
              </div>
            </div>

            {/* Terminal Body with Monospaced Log Stream */}
            <div className="p-4 h-[440px] overflow-y-auto space-y-1.5 text-xs text-slate-300 select-text font-mono leading-relaxed">
              {logs.length === 0 && !isRunning && (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
                  <Terminal className="w-8 h-8 text-slate-600" />
                  <p>Pipeline idle. Click "Run Multi-Agent Pipeline" to begin.</p>
                  <p className="text-[11px] text-slate-600">Simulates PySceneDetect, FFmpeg, Whisper, GPT-4o, and verification checks.</p>
                </div>
              )}

              {logs.map((log) => {
                const badgeColor =
                  log.level === 'SUCCESS'
                    ? 'text-emerald-400'
                    : log.level === 'WARN'
                    ? 'text-amber-400'
                    : log.level === 'ERROR'
                    ? 'text-rose-400 font-bold bg-rose-950/40 px-1 rounded'
                    : 'text-cyan-400';

                return (
                  <div key={log.id} className="flex items-start gap-2.5 hover:bg-slate-900/50 py-0.5 px-1 rounded">
                    <span className="text-slate-600 select-none text-[11px]">{log.timestamp}</span>
                    <span className={`text-[11px] font-bold ${badgeColor} select-none min-w-[55px]`}>
                      [{log.level}]
                    </span>
                    <span className="text-indigo-400 select-none min-w-[130px] hidden sm:inline">
                      [{log.agent}]
                    </span>
                    <span className="text-slate-200 flex-1">{log.message}</span>
                  </div>
                );
              })}

              {isRunning && (
                <div className="flex items-center gap-2 text-indigo-400 py-1 px-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
                  <span className="text-[11px] text-slate-400">Agent executing next stage...</span>
                </div>
              )}

              <div ref={terminalEndRef} />
            </div>

            {/* Terminal Footer with Output Deliverables Banner */}
            {isCompleted && (
              <div className="p-4 bg-emerald-950/40 border-t border-emerald-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-emerald-300">
                      PIPELINE EXECUTION COMPLETE (24.5s processed)
                    </div>
                    <div className="text-[11px] text-slate-300">
                      Generated: <code className="text-emerald-300">sample_clip_001_explained.json</code> and <code className="text-emerald-300">.md</code>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleJumpToResults}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold shadow-lg shadow-emerald-950 cursor-pointer transition-all"
                >
                  <span>View Analysis Results Hub</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
