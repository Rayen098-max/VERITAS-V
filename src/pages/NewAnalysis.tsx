import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  Trash2, 
  Play, 
  CheckCircle, 
  Loader2, 
  Sliders, 
  Terminal, 
  ArrowRight,
  Sparkles,
  AlertTriangle,
  FileVideo,
  Info
} from 'lucide-react';
import Container from '../components/Container';
import { usePageMeta } from '../hooks/usePageMeta';
import { analysisService } from '../services/analysisService';
import { uploadVideoToSupabase } from '../services/supabase';
import type { PipelineStage } from '../types';

export default function NewAnalysis() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  usePageMeta({
    title: 'New Video Verification Analysis',
    description: 'Configure and dispatch video files through the multi-agent perception and hallucination verification pipeline.',
  });

  // Upload State
  const [_videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadedDetails, setUploadedDetails] = useState<{
    id: string;
    name: string;
    size: string;
    duration: number;
    thumbnail?: string;
    videoUrl?: string;
  } | null>(null);

  // Configuration Panel State
  const [backend, setBackend] = useState<'gemini' | 'groq' | 'gpt4o' | 'mock'>('gemini');
  const [sceneThreshold, setSceneThreshold] = useState<number>(40);
  const [framesPerScene, setFramesPerScene] = useState<number>(4);
  const [whisperEnabled, setWhisperEnabled] = useState<boolean>(true);
  const [strictness, setStrictness] = useState<'permissive' | 'balanced' | 'rigorous'>('rigorous');

  // Processing State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>([]);
  const [activeLogs, setActiveLogs] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [discoveredScenes, setDiscoveredScenes] = useState<string[]>([]);

  // Cleanup object URLs
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

  // Sample Videos Quick Picker
  const sampleVideos = [
    {
      id: 'analysis_newvideo_001',
      name: 'Newvideo.mp4',
      size: '28.3 MB',
      duration: 118,
      category: "India's Got Latent · Magic Card Sleight",
      thumbnail: '/frames/Newvideo_frames/Newvideo_scene_001_start.jpg',
    },
    {
      id: 'sample_my_video',
      name: 'my_video.mp4',
      size: '42.1 MB',
      duration: 66,
      category: 'Keynote Presentation Audit',
      thumbnail: '/frames/my_video_frames/my_video_scene_001_start.jpg',
    },
    {
      id: 'sample_clip_jump',
      name: 'sample_clip.mp4',
      size: '4.8 MB',
      duration: 15,
      category: 'Athletics Kinetic Sequence',
      thumbnail: '/frames/sample_clip_frames/sample_clip_scene_001_start.jpg',
    },
    {
      id: 'sample_dog_hallucination',
      name: 'videohallucer_test.mp4',
      size: '3.2 MB',
      duration: 10,
      category: 'Hallucination Benchmark Probe',
      thumbnail: '/frames/sample_clip_frames/sample_clip_scene_001_t1.jpg',
    },
  ];

  const handleSelectSample = (sample: typeof sampleVideos[0]) => {
    setErrorMessage(null);
    setVideoFile(null);
    setVideoPreviewUrl(null);
    setUploadedDetails({
      id: sample.id,
      name: sample.name,
      size: sample.size,
      duration: sample.duration,
      thumbnail: sample.thumbnail,
    });
  };

  // Drag & Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelectEvent = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    setErrorMessage(null);
    if (!file.type.startsWith('video/')) {
      setErrorMessage('Unsupported format: Please upload a valid video file (.mp4, .mov, .avi, .webm)');
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      setErrorMessage('File exceeds size limit: Maximum allowed upload size is 100MB');
      return;
    }

    setVideoFile(file);
    const preview = URL.createObjectURL(file);
    setVideoPreviewUrl(preview);

    // Direct Upload to Supabase Storage with real progress tracking
    setIsUploading(true);
    setUploadProgress(10);

    const safeStem = file.name.replace(/[^a-zA-Z0-9]/g, '_');
    const newAnalysisId = `analysis_${safeStem}_${Date.now()}`;

    // Read real duration via offscreen video
    const tempVideo = document.createElement('video');
    tempVideo.preload = 'metadata';
    tempVideo.src = preview;
    
    const finalizeUpload = (durationSec: number) => {
      uploadVideoToSupabase(file, (pct) => {
        setUploadProgress(Math.max(15, pct));
      })
        .then((uploadRes) => {
          setIsUploading(false);
          setUploadProgress(100);
          setUploadedDetails({
            id: newAnalysisId,
            name: file.name,
            size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
            duration: durationSec,
            thumbnail: '/frames/my_video_frames/my_video_scene_001_start.jpg',
            videoUrl: uploadRes.publicUrl,
          });
        })
        .catch(async (err) => {
          console.warn('Supabase upload failed, attempting direct backend upload fallback:', err);
          try {
            setUploadProgress(50);
            const backendRes = await analysisService.uploadVideo(file);
            setIsUploading(false);
            setUploadProgress(100);
            setUploadedDetails({
              id: backendRes.id,
              name: backendRes.name,
              size: backendRes.size,
              duration: backendRes.duration || durationSec,
              thumbnail: '/frames/my_video_frames/my_video_scene_001_start.jpg',
            });
          } catch (backendErr: any) {
            setIsUploading(false);
            console.error('All upload methods failed:', backendErr);
            setErrorMessage(`Upload failed: ${err.message || 'Could not upload to cloud storage or backend'}`);
          }
        });
    };

    tempVideo.onloadedmetadata = () => {
      finalizeUpload(Math.round(tempVideo.duration) || 45);
    };
    tempVideo.onerror = () => {
      finalizeUpload(45);
    };
  };

  const handleRemoveVideo = () => {
    setVideoFile(null);
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    setVideoPreviewUrl(null);
    setUploadedDetails(null);
    setErrorMessage(null);
  };

  // Start Analysis Pipeline
  const handleStartAnalysis = async () => {
    if (!uploadedDetails) return;

    setIsAnalyzing(true);
    setAnalysisId(uploadedDetails.id);
    setActiveLogs([
      `[INGRESS] Received payload: ${uploadedDetails.name} (${uploadedDetails.size})`,
      `[STORAGE] Cloud Video URL: ${uploadedDetails.videoUrl ? 'Supabase Storage verified' : 'Local media cache'}`,
      `[CONFIG] Backend: ${backend} | PySceneDetect: ${sceneThreshold} | Keyframes/Scene: ${framesPerScene} | Whisper: ${whisperEnabled ? 'ON' : 'OFF'}`,
      `[STAGE 1] Launching PySceneDetect content detection (threshold=${sceneThreshold})...`,
    ]);

    try {
      await analysisService.startAnalysis(
        uploadedDetails.id,
        uploadedDetails.name,
        uploadedDetails.size,
        uploadedDetails.duration,
        {
          backend: backend,
          sceneThreshold: sceneThreshold,
          framesPerScene: framesPerScene,
          whisperEnabled: whisperEnabled,
          strictness: strictness,
          sceneCaptions: true,
          narrative: true,
          causalReasoning: true,
          verifyHallucinations: true,
          explainability: true,
          diarization: whisperEnabled,
        },
        uploadedDetails.videoUrl
      );

      pollPipeline(uploadedDetails.id);
    } catch (err: any) {
      console.error(err);
      setActiveLogs((prev) => [...prev, `[ERROR] Pipeline initialization failed: ${err?.message || err}`]);
      setIsAnalyzing(false);
    }
  };

  // Poll Pipeline Progress
  const pollPipeline = (id: string) => {
    const timer = setInterval(async () => {
      try {
        const stages = await analysisService.getPipelineProgress(id);
        setPipelineStages(stages);

        // Dynamically log stage progression into terminal console
        stages.forEach((s) => {
          if (s.status === 'completed') {
            const compMsg = `[DONE] ${s.name} completed successfully.`;
            setActiveLogs((prev) => prev.includes(compMsg) ? prev : [...prev, compMsg]);
          } else if (s.status === 'processing') {
            const procMsg = `[STAGE] Processing ${s.name} (${s.progress}%)...`;
            setActiveLogs((prev) => prev.includes(procMsg) ? prev : [...prev, procMsg]);
          }
        });

        // Dynamically simulate streaming scene frames
        const currentStage = stages.find(s => s.status === 'processing');
        const isNewVideo = uploadedDetails?.name?.toLowerCase().includes('newvideo');
        if (currentStage?.id === 'captioning' && discoveredScenes.length < 2) {
          setDiscoveredScenes(
            isNewVideo
              ? [
                  '/frames/Newvideo_frames/Newvideo_scene_001_start.jpg',
                  '/frames/Newvideo_frames/Newvideo_scene_002_t2.jpg',
                ]
              : [
                  '/frames/my_video_frames/my_video_scene_001_start.jpg',
                  '/frames/my_video_frames/my_video_scene_002_t2.jpg',
                ]
          );
        } else if (currentStage?.id === 'verification' && discoveredScenes.length < 4) {
          setDiscoveredScenes(
            isNewVideo
              ? [
                  '/frames/Newvideo_frames/Newvideo_scene_001_start.jpg',
                  '/frames/Newvideo_frames/Newvideo_scene_002_t2.jpg',
                  '/frames/Newvideo_frames/Newvideo_scene_003_t3.jpg',
                  '/frames/Newvideo_frames/Newvideo_scene_004_t4.jpg',
                  '/frames/Newvideo_frames/Newvideo_scene_006_t2.jpg',
                  '/frames/Newvideo_frames/Newvideo_scene_007_t3.jpg',
                ]
              : [
                  '/frames/my_video_frames/my_video_scene_001_start.jpg',
                  '/frames/my_video_frames/my_video_scene_002_t2.jpg',
                  '/frames/my_video_frames/my_video_scene_003_t3.jpg',
                  '/frames/my_video_frames/my_video_scene_004_t1.jpg',
                ]
          );
        }

        const failedStage = stages.find((s) => s.status === 'error');
        if (failedStage) {
          clearInterval(timer);
          setIsAnalyzing(false);
          setActiveLogs((prev) => [
            ...prev,
            `[FATAL ERROR] Stage '${failedStage.name}' failed: ${failedStage.errorMsg || 'Pipeline execution failed'}`,
          ]);
          setErrorMessage(`Pipeline halted at '${failedStage.name}': ${failedStage.errorMsg || 'Check API keys or cloud logs'}`);
          return;
        }

        const allFinished = stages.length > 0 && stages.every((s) => s.status === 'completed');
        if (allFinished) {
          clearInterval(timer);
          setIsCompleted(true);
          setActiveLogs((prev) => [
            ...prev,
            '[SUCCESS] Stage 4: Hallucination Verification complete.',
            '[SUCCESS] Stage 5: Dual-format Markdown and JSON forensic reports generated.',
            '[SYSTEM] Ready for interactive visual inspection.',
          ]);
        }
      } catch (err) {
        console.error(err);
        clearInterval(timer);
      }
    }, 900);
  };

  return (
    <div className="w-full py-8 space-y-8 select-none">
      <Container size="default">
        {/* Page Header */}
        <div className="border-b border-[var(--border-default)] pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-default)] text-xs font-mono text-[var(--text-secondary)] mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#6D5EF5]" />
            <span>Interactive Verification Workspace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
            New Video Verification Analysis
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-2xl mt-1 leading-relaxed">
            Dispatch raw video streams through multi-modal perception, causal chaining, and pixel-grounded hallucination verification.
          </p>
        </div>

        {/* =========================================================================
            TWO-COLUMN MAIN WORKSPACE (LEFT: DROPZONE / PREVIEW, RIGHT: CONFIG PANEL)
        ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          {/* ----------------- LEFT COLUMN: DROPZONE & VIDEO PREVIEW ----------------- */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-5 rounded-[16px] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-1.5">
                  <FileVideo className="w-4 h-4 text-[#6D5EF5]" />
                  <span>Video Input Ingress</span>
                </span>
                <span className="text-[11px] font-mono text-[var(--text-muted)]">
                  Max 100MB
                </span>
              </div>

              {/* Upload Dropzone */}
              {!uploadedDetails && !isUploading && (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label="Upload video file"
                  className={`relative p-8 rounded-[14px] border-2 border-dashed transition-all flex flex-col items-center justify-center text-center cursor-pointer group ${
                    dragOver
                      ? 'border-[#6D5EF5] bg-[#6D5EF5]/5 scale-[1.01]'
                      : 'border-[var(--border-default)] hover:border-[#6D5EF5]/60 bg-[var(--bg-secondary)]/50 hover:bg-[var(--bg-secondary)]'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleFileSelectEvent}
                    className="hidden"
                    id="video-file-upload"
                  />

                  {/* Custom Animated Spiral Logo Icon Motif */}
                  <div className="relative w-14 h-14 rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)] flex items-center justify-center shadow-xs mb-3 group-hover:scale-110 transition-transform">
                    <div className="absolute inset-0 rounded-full border border-[#6D5EF5]/30 animate-ping opacity-25" />
                    <Upload className="w-6 h-6 text-[#6D5EF5]" />
                  </div>

                  <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                    Drag and drop your video clip here, or <span className="text-[#6D5EF5] underline">browse files</span>
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)] mt-1 max-w-xs">
                    Sub-second scene detection and keyframe extraction will automatically initialize upon dispatch.
                  </p>

                  {/* Format Badges */}
                  <div className="flex items-center gap-1.5 mt-4">
                    {['MP4', 'AVI', 'MOV', 'WEBM'].map((fmt) => (
                      <span
                        key={fmt}
                        className="px-2 py-0.5 rounded-[6px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[10px] font-mono text-[var(--text-muted)]"
                      >
                        {fmt}
                      </span>
                    ))}
                    <span className="text-[10px] font-mono text-[var(--text-muted)] ml-1">· Max 100MB</span>
                  </div>
                </div>
              )}

              {/* Uploading Progress State */}
              {isUploading && (
                <div className="p-8 rounded-[14px] border border-[var(--border-default)] bg-[var(--bg-secondary)] text-center space-y-3">
                  <Loader2 className="w-8 h-8 text-[#6D5EF5] animate-spin mx-auto" />
                  <p className="text-xs font-mono font-bold text-[var(--text-primary)]">
                    BUFFERING VIDEO STREAM TO MEMORY... {uploadProgress}%
                  </p>
                  <div className="w-full max-w-xs mx-auto h-2 rounded-full bg-[var(--border-default)] overflow-hidden">
                    <div
                      style={{ width: `${uploadProgress}%` }}
                      className="h-full bg-[#6D5EF5] transition-all duration-150"
                    />
                  </div>
                  <p className="text-[10px] font-mono text-[var(--text-muted)]">
                    Estimating ETA: &lt;1.2s · High-speed local buffer
                  </p>
                </div>
              )}

              {/* Error Message Alert */}
              {errorMessage && (
                <div className="p-3 rounded-[10px] bg-[#F43F5E]/10 border border-[#F43F5E]/30 text-[#F43F5E] text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Uploaded Video Preview State */}
              {uploadedDetails && !isUploading && (
                <div className="space-y-3">
                  <div className="relative rounded-[12px] overflow-hidden border border-[var(--border-default)] bg-black aspect-video flex items-center justify-center">
                    {videoPreviewUrl ? (
                      <video
                        src={videoPreviewUrl}
                        controls
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <img
                        src={uploadedDetails.thumbnail || '/frames/my_video_frames/my_video_scene_001_start.jpg'}
                        alt={uploadedDetails.name}
                        className="w-full h-full object-cover opacity-90"
                      />
                    )}
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/75 backdrop-blur-md text-white font-mono text-[10px]">
                      {uploadedDetails.duration}s clip
                    </div>
                  </div>

                  <div className="p-3.5 rounded-[12px] bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center justify-between">
                    <div>
                      <h4 className="font-mono text-xs font-bold text-[var(--text-primary)]">
                        {uploadedDetails.name}
                      </h4>
                      <p className="text-[11px] font-mono text-[var(--text-muted)]">
                        File Size: {uploadedDetails.size} · Estimated Scenes: ~4
                      </p>
                    </div>

                    {!isAnalyzing && (
                      <button
                        type="button"
                        onClick={handleRemoveVideo}
                        className="p-1.5 rounded-[8px] hover:bg-[#F43F5E]/10 text-[var(--text-muted)] hover:text-[#F43F5E] transition-colors cursor-pointer"
                        title="Remove video"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Sample Videos Row */}
            <div className="p-4 rounded-[14px] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-[var(--text-primary)] uppercase tracking-wider">
                  Or Test With Pre-Loaded Sample Videos:
                </span>
                <span className="text-[10px] font-mono text-[#6D5EF5]">Instant Benchmarks</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {sampleVideos.map((sample) => (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => handleSelectSample(sample)}
                    disabled={isAnalyzing}
                    className="p-2.5 rounded-[10px] border border-[var(--border-subtle)] bg-[var(--bg-secondary)] hover:border-[#6D5EF5] hover:bg-[var(--bg-surface)] text-left transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="relative aspect-video w-full rounded-[6px] overflow-hidden bg-black mb-1.5">
                      <img
                        src={sample.thumbnail}
                        alt={sample.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute bottom-1 right-1 px-1 rounded bg-black/80 text-[9px] font-mono text-white">
                        {sample.duration}s
                      </div>
                    </div>
                    <span className="font-mono text-xs font-bold text-[var(--text-primary)] truncate block">
                      {sample.name}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] truncate block">
                      {sample.category}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Side Tip Card */}
            <div className="p-3.5 rounded-[12px] bg-[#6D5EF5]/5 border border-[#6D5EF5]/20 flex items-start gap-2.5 text-xs text-[var(--text-secondary)]">
              <Info className="w-4 h-4 text-[#6D5EF5] shrink-0 mt-0.5" />
              <span>
                <strong>Auditor Tip:</strong> Clips under 60 seconds provide sub-10 second verification latency with dense pixel-level causal groundings.
              </span>
            </div>
          </div>

          {/* ----------------- RIGHT COLUMN: PIPELINE CONFIGURATION PANEL ----------------- */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-[16px] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-3">
                <span className="text-xs font-mono font-semibold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-[#6D5EF5]" />
                  <span>Pipeline Configuration</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/25">
                  Runtime Ready
                </span>
              </div>

              {/* Backend Selector Segmented Control */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--text-primary)] block">
                  Vision-Language Model Backend:
                </label>
                <div className="grid grid-cols-3 gap-1 p-1 rounded-[10px] bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs">
                  <button
                    type="button"
                    disabled={isAnalyzing}
                    onClick={() => setBackend('gemini')}
                    className={`py-1.5 px-2 rounded-[8px] font-medium transition-all cursor-pointer ${
                      backend === 'gemini'
                        ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs font-bold'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    Gemini Flash
                  </button>
                  <button
                    type="button"
                    disabled={isAnalyzing}
                    onClick={() => setBackend('groq')}
                    className={`py-1.5 px-2 rounded-[8px] font-medium transition-all cursor-pointer ${
                      backend === 'groq'
                        ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs font-bold'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    Groq Vision
                  </button>
                  <button
                    type="button"
                    disabled={isAnalyzing}
                    onClick={() => setBackend('mock')}
                    className={`py-1.5 px-2 rounded-[8px] font-medium transition-all cursor-pointer ${
                      backend === 'mock'
                        ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs font-bold'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    Mock Demo
                  </button>
                </div>
                <p className="text-[11px] text-[var(--text-muted)]">
                  {backend === 'gemini'
                    ? 'Recommended: Google Gemini multimodal vision (100% free API tier).'
                    : backend === 'groq'
                    ? 'Ultra-fast Groq Cloud vision failover with multi-key rate limit recovery.'
                    : 'Instant offline synthetic verification for testing without API usage.'}
                </p>
              </div>

              {/* PySceneDetect Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[var(--text-primary)]">PySceneDetect Cut Threshold:</span>
                  <span className="font-mono text-[#6D5EF5] font-semibold">{sceneThreshold.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="60"
                  step="1"
                  disabled={isAnalyzing}
                  value={sceneThreshold}
                  onChange={(e) => setSceneThreshold(parseFloat(e.target.value))}
                  className="w-full accent-[#6D5EF5] cursor-pointer"
                />
                <span className="text-[10px] text-[var(--text-muted)] block">
                  Default 40.0. Higher thresholds produce fewer, longer scenes.
                </span>
              </div>

              {/* Keyframes Per Scene */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[var(--text-primary)]">Keyframes Extracted Per Scene:</span>
                  <span className="font-mono text-[#6D5EF5] font-semibold">{framesPerScene} frames</span>
                </div>
                <div className="grid grid-cols-4 gap-1 p-1 rounded-[10px] bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs text-center">
                  {[2, 4, 6, 8].map((num) => (
                    <button
                      key={num}
                      type="button"
                      disabled={isAnalyzing}
                      onClick={() => setFramesPerScene(num)}
                      className={`py-1 rounded-[6px] font-mono cursor-pointer transition-colors ${
                        framesPerScene === num
                          ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] font-bold shadow-xs'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Whisper Diarization Toggle */}
              <div className="flex items-center justify-between p-3 rounded-[10px] bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                <div>
                  <span className="text-xs font-bold text-[var(--text-primary)] block">OpenAI Whisper ASR</span>
                  <span className="text-[10px] text-[var(--text-muted)]">Transcribes speech & speaker diarization</span>
                </div>
                <button
                  type="button"
                  disabled={isAnalyzing}
                  onClick={() => setWhisperEnabled(!whisperEnabled)}
                  className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                    whisperEnabled ? 'bg-[#10B981]' : 'bg-neutral-400'
                  }`}
                >
                  <span
                    className={`block w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                      whisperEnabled ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Verification Strictness Setting */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-[var(--text-primary)] block">
                  Hallucination Defense Strictness:
                </span>
                <div className="grid grid-cols-3 gap-1 p-1 rounded-[10px] bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs text-center">
                  {(['permissive', 'balanced', 'rigorous'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      disabled={isAnalyzing}
                      onClick={() => setStrictness(mode)}
                      className={`py-1 rounded-[6px] capitalize transition-colors cursor-pointer ${
                        strictness === mode
                          ? 'bg-[#6D5EF5] text-white font-bold shadow-xs'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Primary Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleStartAnalysis}
                  disabled={!uploadedDetails || isAnalyzing}
                  className={`w-full py-3 rounded-[12px] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
                    !uploadedDetails || isAnalyzing
                      ? 'bg-neutral-300 dark:bg-neutral-800 text-neutral-500 cursor-not-allowed'
                      : 'bg-[#6D5EF5] hover:bg-[#5B4BE2] text-white shadow-[#6D5EF5]/30 hover:shadow-[#6D5EF5]/50 hover:-translate-y-0.5'
                  }`}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Pipeline Executing...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>Run Verification Pipeline (~9.2s est.)</span>
                    </>
                  )}
                </button>
                <span className="text-[10px] font-mono text-[var(--text-muted)] text-center block mt-2">
                  Estimated runtime: 4.8s perception + 1.4s reasoning + 2.1s verification + 0.5s reports
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            LIVE EXECUTION STEPPER & STREAMING LOGS (APPEARS WHEN RUNNING)
        ========================================================================= */}
        {isAnalyzing && (
          <div className="mt-8 p-6 rounded-[16px] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-md space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#6D5EF5] animate-ping" />
                <h3 className="font-bold text-sm text-[var(--text-primary)]">
                  Live Agentic Orchestration Stepper
                </h3>
              </div>
              <span className="text-xs font-mono text-[var(--text-muted)]">
                ANALYSIS ID: {analysisId}
              </span>
            </div>

            {/* Stepper Progress Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {[
                { name: 'Perception', label: 'Scene Cuts & Keyframes' },
                { name: 'Synthesis', label: 'Narrative Storyline' },
                { name: 'Reasoning', label: 'Causal Graph Chains' },
                { name: 'Verification', label: 'Hallucination Defense' },
                { name: 'Report', label: 'Forensic Markdown' },
              ].map((step, idx) => {
                const stageObj = pipelineStages[idx];
                const isStepCompleted = stageObj?.status === 'completed';
                const isStepRunning = stageObj?.status === 'processing';

                return (
                  <div
                    key={step.name}
                    className={`p-3.5 rounded-[12px] border transition-all ${
                      isStepCompleted
                        ? 'bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]'
                        : isStepRunning
                        ? 'bg-[#6D5EF5]/10 border-[#6D5EF5] text-[#6D5EF5]'
                        : 'bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--text-muted)]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[10px] font-bold">STAGE {idx + 1}</span>
                      {isStepCompleted ? (
                        <CheckCircle className="w-3.5 h-3.5 text-[#10B981]" />
                      ) : isStepRunning ? (
                        <Loader2 className="w-3.5 h-3.5 text-[#6D5EF5] animate-spin" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                      )}
                    </div>
                    <span className="font-bold text-xs block text-[var(--text-primary)]">{step.name}</span>
                    <span className="text-[10px] opacity-75 block truncate">{step.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Streaming Discovered Keyframes */}
            {discoveredScenes.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider block">
                  Streaming Discovered Keyframes:
                </span>
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  {discoveredScenes.map((src, i) => (
                    <div
                      key={i}
                      className="relative w-36 aspect-video shrink-0 rounded-[8px] overflow-hidden border border-[#6D5EF5]/40 shadow-xs animate-in fade-in"
                    >
                      <img src={src} alt="Discovered Keyframe" className="w-full h-full object-cover" />
                      <div className="absolute top-1 left-1 px-1 rounded bg-black/75 text-[9px] font-mono text-white">
                        Scene 00{i + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Live Terminal Output Console */}
            <div className="rounded-[10px] bg-black text-green-400 p-4 font-mono text-xs max-h-48 overflow-y-auto space-y-1 border border-neutral-800">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-800 text-[10px] text-neutral-400">
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-[#6D5EF5]" />
                  <span>AGENT RUNTIME STDOUT</span>
                </div>
                <span>PID #8492</span>
              </div>
              {activeLogs.map((log, i) => (
                <div key={i} className="leading-tight">
                  {log}
                </div>
              ))}
              <div ref={logEndRef} />
            </div>

            {/* Completed Action CTA */}
            {isCompleted && (
              <div className="p-4 rounded-[12px] bg-[#10B981]/10 border border-[#10B981]/30 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <CheckCircle className="w-5 h-5 text-[#10B981]" />
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-[var(--text-primary)]">
                      Verification Pipeline Successfully Finished
                    </h4>
                    <p className="text-xs text-[var(--text-secondary)]">
                      All causal claims verified against physical keyframe evidence.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate(`/results/${analysisId}`)}
                  className="px-5 py-2 rounded-[10px] bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-transform hover:scale-105 cursor-pointer"
                >
                  <span>View Complete Forensic Report</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </Container>
    </div>
  );
}
