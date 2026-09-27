import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  Trash2, 
  Cpu, 
  Play, 
  CheckCircle, 
  Loader2, 
  Settings, 
  Terminal, 
  ArrowRight
} from 'lucide-react';
import { analysisService } from '../services/analysisService';
import type { PipelineStage } from '../types';

export default function NewAnalysis() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Upload state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedDetails, setUploadedDetails] = useState<{ id: string; name: string; size: string; duration: number } | null>(null);

  // Config State
  const [config, setConfig] = useState({
    sceneCaptions: true,
    narrative: true,
    causalReasoning: true,
    verifyHallucinations: true,
    explainability: true,
    diarization: true
  });

  // Processing State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>([]);
  const [activeLogs, setActiveLogs] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    };
  }, [videoPreviewUrl]);

  // Scroll logs to bottom
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeLogs]);

  // Handle Drag & Drop events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('video/')) {
        handleFileSelection(file);
      }
    }
  };

  const handleFileSelectEvent = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = async (file: File) => {
    setVideoFile(file);
    const objectUrl = URL.createObjectURL(file);
    setVideoPreviewUrl(objectUrl);
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 150);

    try {
      const details = await analysisService.uploadVideo(file);
      clearInterval(interval);
      setUploadProgress(100);
      setUploadedDetails(details);
    } catch (err) {
      console.error(err);
      alert('Upload simulation failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveVideo = () => {
    setVideoFile(null);
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    setVideoPreviewUrl(null);
    setUploadedDetails(null);
    setUploadProgress(0);
  };

  // Start analysis pipeline
  const handleStartAnalysis = async () => {
    if (!uploadedDetails) return;
    setIsAnalyzing(true);
    setAnalysisId(uploadedDetails.id);
    setActiveLogs(['[SYSTEM] Initializing Agentic Pipeline Orchestrator...']);

    try {
      await analysisService.startAnalysis(
        uploadedDetails.id,
        uploadedDetails.name,
        uploadedDetails.size,
        uploadedDetails.duration,
        config
      );

      // Start status polling
      pollPipeline(uploadedDetails.id);
    } catch (err) {
      console.error(err);
      setActiveLogs(prev => [...prev, `[ERROR] Failed to start pipeline: ${err}`]);
      setIsAnalyzing(false);
    }
  };

  // Polling pipeline progress
  const pollPipeline = (id: string) => {
    const timer = setInterval(async () => {
      try {
        const stages = await analysisService.getPipelineProgress(id);
        setPipelineStages(stages);

        // Generate logs based on stage transitions
        generateMockLogs(stages);

        const allFinished = stages.every(s => s.status === 'completed' || s.status === 'error');
        if (allFinished) {
          clearInterval(timer);
          setIsCompleted(true);
          setActiveLogs(prev => [
            ...prev,
            '[SYSTEM] Pipeline processing successfully completed.',
            '[SYSTEM] Explainable reports assembled. Output saved to memory storage.',
            '[SYSTEM] Analysis ready for visualization.'
          ]);
        }
      } catch (err) {
        console.error(err);
        clearInterval(timer);
      }
    }, 1000);
  };

  // Generate logs for presentation realism
  const generateMockLogs = (stages: PipelineStage[]) => {
    const logsToAdd: string[] = [];

    stages.forEach(stage => {
      if (stage.status === 'processing') {
        const progress = stage.progress || 0;
        if (progress < 25) {
          const logMsg = `[RUNNING] ${stage.backendScript} - Starting module: ${stage.name}`;
          if (!activeLogs.includes(logMsg)) logsToAdd.push(logMsg);
        }
        if (progress > 45 && progress < 75) {
          const logMsg = `[STAGE LOG] ${stage.backendScript} - In progress (${progress}%) - input: ${stage.input}`;
          if (!activeLogs.includes(logMsg)) logsToAdd.push(logMsg);
        }
      } else if (stage.status === 'completed') {
        const logMsg = `[SUCCESS] ${stage.backendScript} - Completed stage successfully. Output: ${stage.output}`;
        // Ensure we don't repeat the success log
        if (!activeLogs.includes(logMsg)) {
          logsToAdd.push(logMsg);
        }
      }
    });

    if (logsToAdd.length > 0) {
      setActiveLogs(prev => [...prev, ...logsToAdd]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Upload & Config Screen */}
      {!isAnalyzing && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-slate-100">Upload Video for Agentic Causal Inference</h1>
            <p className="text-xs text-slate-400">Select a video segment to trigger scene segmentation, captioning, causal linking, and hallucination checks.</p>
          </div>

          {/* Upload Area */}
          {!videoFile ? (
            <div 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 bg-[#0d1321]/30 hover:bg-indigo-500/5 rounded-2xl p-12 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[250px] group"
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelectEvent} 
                accept="video/*" 
                className="hidden" 
              />
              <div className="p-4 rounded-full bg-slate-900 border border-slate-800 text-slate-400 group-hover:text-indigo-400 group-hover:border-indigo-500/20 transition-all mb-4">
                <Upload className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-200 mb-1">Drag and drop a video here</h3>
              <p className="text-xs text-slate-500 mb-2">or browse files from your local system</p>
              <div className="text-[10px] text-slate-650 uppercase font-mono tracking-wider">
                Supported formats: MP4, AVI, MOV, WEBM (Max 100MB)
              </div>
            </div>
          ) : (
            /* Upload preview state */
            <div className="p-6 rounded-2xl glass-panel border border-slate-800 bg-slate-900/10 space-y-6">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                
                {/* Real video player preview */}
                <div className="w-full md:w-80 aspect-video rounded-lg overflow-hidden bg-slate-950 border border-slate-850 flex-shrink-0 relative">
                  {videoPreviewUrl && (
                    <video 
                      src={videoPreviewUrl} 
                      controls 
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                {/* Details & Remove */}
                <div className="flex-1 space-y-3 w-full">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-200 line-clamp-1">{videoFile.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Size: {(videoFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                    {!isUploading && (
                      <button
                        onClick={handleRemoveVideo}
                        className="p-2 rounded-lg bg-slate-900 hover:bg-red-500/10 border border-slate-800 hover:border-red-500/20 text-slate-400 hover:text-red-400 transition-all cursor-pointer"
                        title="Remove Video"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Uploading progress bar */}
                  {isUploading ? (
                    <div className="space-y-1.5 pt-2">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                          Uploading to analyzer service...
                        </span>
                        <span className="font-mono">{uploadProgress}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500 transition-all duration-150"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 px-3 py-2 rounded-lg w-max mt-2">
                      <CheckCircle className="w-4 h-4" />
                      Ready for agent pipeline analysis (Simulated duration: {uploadedDetails?.duration} seconds)
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* Configuration Settings */}
          {uploadedDetails && !isUploading && (
            <div className="p-6 rounded-2xl border border-slate-800 bg-[#0d1321]/20 space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Settings className="w-4.5 h-4.5 text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-200">Pipeline Execution Parameters</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Config 1 */}
                <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-850 bg-slate-900/10 hover:border-slate-850 hover:bg-slate-900/20 cursor-pointer transition-colors">
                  <input 
                    type="checkbox" 
                    checked={config.sceneCaptions} 
                    onChange={e => setConfig(prev => ({ ...prev, sceneCaptions: e.target.checked }))}
                    className="mt-1 rounded accent-indigo-500 border-slate-800"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Generate Scene Captions</span>
                    <span className="text-[10px] text-slate-500 mt-0.5 block">Segment clip and run Qwen2.5-VL captioning</span>
                  </div>
                </label>

                {/* Config 2 */}
                <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-850 bg-slate-900/10 hover:border-slate-850 hover:bg-slate-900/20 cursor-pointer transition-colors">
                  <input 
                    type="checkbox" 
                    checked={config.narrative} 
                    onChange={e => setConfig(prev => ({ ...prev, narrative: e.target.checked }))}
                    className="mt-1 rounded accent-indigo-500 border-slate-800"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Generate Coherent Narrative</span>
                    <span className="text-[10px] text-slate-500 mt-0.5 block">Synthesize scene descriptions into summary report</span>
                  </div>
                </label>

                {/* Config 3 */}
                <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-850 bg-slate-900/10 hover:border-slate-850 hover:bg-slate-900/20 cursor-pointer transition-colors">
                  <input 
                    type="checkbox" 
                    checked={config.causalReasoning} 
                    onChange={e => setConfig(prev => ({ ...prev, causalReasoning: e.target.checked }))}
                    className="mt-1 rounded accent-indigo-500 border-slate-800"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Infer Causal Relationships</span>
                    <span className="text-[10px] text-slate-500 mt-0.5 block">Analyze logical links between scene transitions</span>
                  </div>
                </label>

                {/* Config 4 */}
                <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-850 bg-slate-900/10 hover:border-slate-850 hover:bg-slate-900/20 cursor-pointer transition-colors">
                  <input 
                    type="checkbox" 
                    checked={config.verifyHallucinations} 
                    onChange={e => setConfig(prev => ({ ...prev, verifyHallucinations: e.target.checked }))}
                    className="mt-1 rounded accent-indigo-500 border-slate-800"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Verify Visual Hallucinations</span>
                    <span className="text-[10px] text-slate-500 mt-0.5 block">Audit claims against physical image frames</span>
                  </div>
                </label>

                {/* Config 5 */}
                <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-850 bg-slate-900/10 hover:border-slate-850 hover:bg-slate-900/20 cursor-pointer transition-colors">
                  <input 
                    type="checkbox" 
                    checked={config.explainability} 
                    onChange={e => setConfig(prev => ({ ...prev, explainability: e.target.checked }))}
                    className="mt-1 rounded accent-indigo-500 border-slate-800"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Generate Explainability Report</span>
                    <span className="text-[10px] text-slate-500 mt-0.5 block">Link verifications to specific timestamps & frames</span>
                  </div>
                </label>

                {/* Config 6 */}
                <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-850 bg-slate-900/10 hover:border-slate-850 hover:bg-slate-900/20 cursor-pointer transition-colors">
                  <input 
                    type="checkbox" 
                    checked={config.diarization} 
                    onChange={e => setConfig(prev => ({ ...prev, diarization: e.target.checked }))}
                    className="mt-1 rounded accent-indigo-500 border-slate-800"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Speaker Diarization</span>
                    <span className="text-[10px] text-slate-500 mt-0.5 block">Resolve speech tracks to speaker mappings</span>
                  </div>
                </label>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={handleStartAnalysis}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-650 hover:bg-indigo-550 text-white font-bold text-sm shadow-lg shadow-indigo-650/15 transition-all hover:scale-[1.01] cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  Start AI Analysis Pipeline
                </button>
              </div>

            </div>
          )}

        </div>
      )}

      {/* Processing Pipeline Dashboard */}
      {isAnalyzing && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Main Stage List */}
          <div className="lg:col-span-2 space-y-5">
            <div className="p-6 rounded-2xl border border-slate-800 bg-[#0d1321]/40 space-y-6">
              
              <div className="flex items-center justify-between border-b border-slate-850 pb-4">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-indigo-400 animate-spin" />
                    Agent Orchestrator Pipeline
                  </h3>
                  <p className="text-xs text-slate-400">Processing: {uploadedDetails?.name}</p>
                </div>
                {isCompleted && (
                  <span className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                    Finished
                  </span>
                )}
              </div>

              {/* Stage Progress Elements */}
              <div className="space-y-4">
                {pipelineStages.map((stage) => {
                  const isPending = stage.status === 'pending';
                  const isProcessing = stage.status === 'processing';
                  const isCompleted = stage.status === 'completed';
                  const isError = stage.status === 'error';

                  return (
                    <div 
                      key={stage.id} 
                      className={`p-4 rounded-xl border transition-all ${
                        isProcessing ? 'border-indigo-500/20 bg-indigo-500/5' :
                        isCompleted ? 'border-slate-850/60 bg-slate-900/10' :
                        'border-slate-850/40 bg-slate-950/20 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                            {stage.name}
                            <span className="text-[10px] text-slate-500 font-mono">({stage.backendScript})</span>
                          </h4>
                          <p className="text-[10px] text-slate-550">{stage.purpose}</p>
                        </div>

                        {/* Status Label */}
                        <div className="text-[10px] font-mono">
                          {isPending && <span className="text-slate-500">PENDING</span>}
                          {isProcessing && (
                            <span className="text-indigo-400 font-bold flex items-center gap-1">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              {stage.progress}%
                            </span>
                          )}
                          {isCompleted && <span className="text-emerald-400 font-semibold">SUCCESS</span>}
                          {isError && <span className="text-red-400 font-bold">ERROR</span>}
                        </div>
                      </div>

                      {/* Progress Line */}
                      {isProcessing && (
                        <div className="w-full h-1 rounded-full bg-slate-950 overflow-hidden mt-3">
                          <div 
                            className="h-full bg-indigo-500 transition-all duration-300"
                            style={{ width: `${stage.progress}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* View Results Trigger */}
              {isCompleted && (
                <div className="pt-2">
                  <button
                    onClick={() => navigate(`/results/${analysisId}`)}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-indigo-650 hover:bg-indigo-550 text-white font-bold text-sm shadow-xl shadow-indigo-650/20 transition-all cursor-pointer hover:scale-[1.01]"
                  >
                    View Detailed Results Reports
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

            </div>
          </div>

          {/* Terminal Console Logs */}
          <div className="lg:col-span-1 p-5 rounded-2xl border border-slate-800 bg-[#070a13] flex flex-col h-[500px]">
            <div className="flex items-center gap-2 border-b border-slate-850 pb-3 mb-3 flex-shrink-0">
              <Terminal className="w-4 h-4 text-slate-400" />
              <h4 className="text-xs font-bold text-slate-300">Agent Terminal Logs</h4>
            </div>

            <div className="flex-1 overflow-y-auto font-mono text-[10px] text-indigo-200/70 space-y-2.5 custom-scrollbar pr-2">
              {activeLogs.map((log, index) => {
                let colorClass = 'text-slate-400';
                if (log.startsWith('[SUCCESS]')) colorClass = 'text-emerald-400';
                if (log.startsWith('[ERROR]')) colorClass = 'text-rose-500 font-bold';
                if (log.startsWith('[SYSTEM]')) colorClass = 'text-indigo-400 font-bold';
                if (log.startsWith('[RUNNING]')) colorClass = 'text-blue-400';

                return (
                  <div key={index} className={`leading-normal border-l border-slate-850 pl-2 ${colorClass}`}>
                    {log}
                  </div>
                );
              })}
              <div ref={logEndRef} />
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
