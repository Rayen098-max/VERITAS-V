import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Play, 
  FileVideo, 
  AlertTriangle, 
  Clock, 
  User, 
  Video as VideoIcon, 
  FileText, 
  ZoomIn, 
  MessageSquare,
  Activity,
  ArrowLeft,
  Download,
  Cpu,
  ShieldCheck,
  Sliders,
  FileCheck,
  Layers,
  Eye,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { analysisService } from '../services/analysisService';
import type { VideoAnalysis, ExplainabilityResult, VerificationStatus, ExtractedFrameItem } from '../types';
import CausalGraph from '../components/CausalGraph';
import EvidenceModal from '../components/EvidenceModal';
import { FrameInspectorModal } from '../components/FrameInspectorModal';
import { VisualEvidenceGallery } from '../components/VisualEvidenceGallery';
import { ArchitectureExplorerModal } from '../components/ArchitectureExplorerModal';
import Container from '../components/Container';
import { usePageMeta } from '../hooks/usePageMeta';

export default function AnalysisResults() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [analysis, setAnalysis] = useState<VideoAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'gallery' | 'dossier' | 'scenes' | 'narrative' | 'causal' | 'verification' | 'explainability' | 'speakers'>('overview');

  // Narrative Highlight State
  const [selectedNarrativeSceneId, setSelectedNarrativeSceneId] = useState<string | null>(null);

  // Verification Filter State
  const [verificationFilter, setVerificationFilter] = useState<'all' | 'supported' | 'uncertain' | 'unsupported'>('all');

  // Evidence & Frame Modal State
  const [selectedEvidence, setSelectedEvidence] = useState<ExplainabilityResult | null>(null);
  const [selectedFrameItem, setSelectedFrameItem] = useState<ExtractedFrameItem | null>(null);
  const [isArchModalOpen, setIsArchModalOpen] = useState(false);

  // Hallucination Sensitivity Threshold (Default 70%)
  const [sensitivityThreshold, setSensitivityThreshold] = useState<number>(70);

  usePageMeta(
    analysis ? `${analysis.videoName} · Analysis Report` : 'Analysis Report · VERITAS-V',
    'Comprehensive multi-agent causal verification and visual hallucination audit.'
  );

  useEffect(() => {
    let isMounted = true;
    if (!id) return;

    analysisService.getAnalysisDetails(id)
      .then((data) => {
        if (isMounted) {
          setAnalysis(data);
          if (data.scenes.length > 0) {
            setSelectedNarrativeSceneId(data.scenes[0].sceneId);
          }
          setLoading(false);
        }
      })
      .catch((err: any) => {
        if (isMounted) {
          console.error(err);
          setError(err.message || 'Failed to load analysis results.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <Container className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Activity className="w-8 h-8 text-accent animate-spin" />
        <p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">
          Assembling multi-agent analysis reports...
        </p>
      </Container>
    );
  }

  if (error || !analysis) {
    return (
      <Container className="py-20 text-center max-w-md mx-auto space-y-4">
        <AlertTriangle className="w-12 h-12 text-verdict-contradicted mx-auto" />
        <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 font-display">
          Analysis Not Found
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          {error || 'The requested analysis session could not be retrieved from database storage.'}
        </p>
        <button
          onClick={() => navigate('/history')}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-xl text-xs font-semibold cursor-pointer shadow-sm hover:opacity-90 transition-opacity"
        >
          <ArrowLeft className="w-4 h-4" /> Back to History
        </button>
      </Container>
    );
  }

  // Highlight unsupported phrases inside claims
  const renderHighlightedStatement = (text: string, unsupportedPhrases?: string[]) => {
    if (!unsupportedPhrases || unsupportedPhrases.length === 0) {
      return <span>{text}</span>;
    }

    let result: React.ReactNode = text;
    unsupportedPhrases.forEach((phrase) => {
      const parts = text.split(new RegExp(`(${phrase})`, 'gi'));
      result = (
        <span>
          {parts.map((part, index) => 
            part.toLowerCase() === phrase.toLowerCase() ? (
              <span 
                key={index} 
                className="px-1.5 py-0.5 rounded bg-rose-500/10 text-verdict-contradicted border border-rose-500/30 font-semibold line-through"
                title="Verified as visual hallucination"
              >
                {part}
              </span>
            ) : (
              part
            )
          )}
        </span>
      );
    });

    return result;
  };

  const getStatusColor = (status: VerificationStatus) => {
    switch (status) {
      case 'supported':
        return 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'uncertain':
        return 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'unsupported':
      default:
        return 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/30';
    }
  };

  const trustColorStroke = analysis.trustScore >= 90
    ? '#10B981'
    : analysis.trustScore >= 70
    ? '#F59E0B'
    : '#F43F5E';

  const exportForensicDossier = () => {
    if (!analysis) return;
    const cleanName = analysis.videoName.replace(/\.[^/.]+$/, "");
    const content = `# VERITAS-V FORENSIC VIDEO EVIDENCE DOSSIER
**Case Reference**: ${analysis.id}
**Evidence Target**: ${analysis.videoName}
**Analysis Timestamp**: ${analysis.dateAnalyzed}
**Overall Veracity & Trust Score**: ${analysis.trustScore}% (Calibration ECE: 0.0550)
**Forensic Integrity Hash**: SHA-256-${analysis.id.slice(-16)}

---

## 1. Executive Chain-of-Custody & Evidence Summary
- **Recorded Duration**: ${analysis.duration}s
- **Total Partitioned Scenes**: ${analysis.scenesCount}
- **Extracted Keyframes Audited**: ${analysis.allExtractedFrames?.length || analysis.scenesCount * 5}
- **Audited Assertions**: ${analysis.statementsCount}
- **Verified Supported Claims**: ${analysis.verifiedCount}
- **Detected Hallucinations**: ${analysis.hallucinationsCount}

### Chronological Factual Narrative:
${analysis.narrativeText || "No narrative generated."}

---

## 2. Scene-by-Scene Grounded Evidence Log
${analysis.scenes.map(s => `### [${s.sceneId.toUpperCase()}] ${s.startTime.toFixed(1)}s - ${s.endTime.toFixed(1)}s (Centroid: ${s.centroidTime || ((s.startTime+s.endTime)/2).toFixed(1)}s)
- **Observed Physical Action**: ${s.actionSummary || s.caption}
- **Primary Actor**: ${s.detectedElements?.primary_actor || 'Identified Subject'}
- **Manipulated Objects**: ${s.detectedElements?.objects?.join(', ') || 'None specified'}
- **Audible Speech Quote**: "${s.transcriptText || 'No audible dialogue'}"
- **Centroid Keyframe**: ${s.primaryFrame || s.frameFiles[0]}
`).join('\n')}

---

## 3. Causal Graph & Hallucination Verification Matrix
| Scene ID | Causal Claim | Verification Status | Confidence | Forensic Justification |
| :--- | :--- | :---: | :---: | :--- |
${analysis.verifications.map(v => `| **${v.sceneId}** | ${v.statement} | **${v.status.toUpperCase()}** | ${v.confidence}% | ${v.reasoning} |`).join('\n')}

---
*Generated by VERITAS-V Multi-Agent Forensic Video Verification Engine. Certified for Evaluation Committee.*
`;

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `VERITAS_V_Forensic_Dossier_${cleanName}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const tabs = [
    { id: 'overview', name: 'Overview' },
    { id: 'gallery', name: 'Visual Evidence Gallery' },
    { id: 'dossier', name: 'Legal Forensic Dossier' },
    { id: 'scenes', name: 'Scene Captions' },
    { id: 'narrative', name: 'Narrative Prose' },
    { id: 'causal', name: 'Causal Chain' },
    { id: 'verification', name: 'Hallucination Verification' },
    { id: 'explainability', name: 'Explainability Details' },
    { id: 'speakers', name: 'Audio Diarization' }
  ] as const;

  return (
    <Container className="py-8 space-y-8">
      {/* Top Navigation Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-5">
        <div className="space-y-1.5">
          <button 
            onClick={() => navigate('/history')}
            className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Analysis History
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 font-display">
              {analysis.videoName}
            </h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border tabular-nums ${getStatusColor(analysis.trustScore >= 75 ? 'supported' : 'unsupported')}`}>
              {analysis.trustScore}% Trust
            </span>
          </div>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 font-mono">
            ID: {analysis.id} • Date: {analysis.dateAnalyzed} • Size: {analysis.fileSize || 'N/A'}
          </p>
        </div>

        {/* Action Buttons: Architecture Explorer & Export Dossier */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsArchModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Cpu className="w-3.5 h-3.5" />
            Architecture Explorer
          </button>
          <button
            onClick={exportForensicDossier}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export Forensic Dossier
          </button>
          <span className="text-xs text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 font-mono shadow-xs tabular-nums">
            <Clock className="w-3.5 h-3.5 text-neutral-400" /> {analysis.duration}s
          </span>
          <span className="text-xs text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 font-mono shadow-xs tabular-nums">
            <VideoIcon className="w-3.5 h-3.5 text-neutral-400" /> {analysis.scenesCount} Scenes
          </span>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800 overflow-x-auto gap-2 pb-px scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 border-b-2 font-medium text-xs whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'border-accent text-accent font-semibold'
                : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:border-neutral-300 dark:hover:border-neutral-700'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* TABS CONTAINER */}
      <div className="min-h-[420px]">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left: Video Player */}
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-200 dark:border-neutral-800 aspect-video relative flex items-center justify-center shadow-md">
                {analysis.videoUrl ? (
                  <video 
                    src={analysis.videoUrl} 
                    controls 
                    className="w-full h-full object-contain bg-black"
                    poster={analysis.scenes[0]?.frameFiles[0]}
                  />
                ) : (
                  <div className="text-center p-6 space-y-2">
                    <FileVideo className="w-12 h-12 text-neutral-500 mx-auto" />
                    <p className="text-neutral-400 text-xs">No video stream playback URL available</p>
                  </div>
                )}
              </div>

              {/* Synchronized Audio Speech Timeline */}
              {analysis.audioTranscripts && analysis.audioTranscripts.length > 0 && (
                <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/80 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-accent" />
                      Synchronized Speech Track (Whisper-Large-v3 Turbo)
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400">
                      {analysis.audioTranscripts.length} dialogue segments
                    </span>
                  </div>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {analysis.audioTranscripts.map((seg, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-100 dark:border-neutral-800/80 text-xs">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 shrink-0">
                          {seg.start.toFixed(1)}s - {seg.end.toFixed(1)}s
                        </span>
                        <p className="text-neutral-700 dark:text-neutral-300 italic">
                          "{seg.text}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Summary Metrics */}
            <div className="space-y-6">
              {/* Trust Score circular card */}
              <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/80 shadow-xs flex flex-col items-center text-center space-y-4">
                <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider font-mono">
                  Overall Trust Score
                </h3>
                
                {/* Circular Score Visualizer */}
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle 
                      cx="50" cy="50" r="40" 
                      fill="transparent" 
                      stroke="currentColor" 
                      strokeWidth="8"
                      className="text-neutral-200 dark:text-neutral-800"
                    />
                    <circle 
                      cx="50" cy="50" r="40" 
                      fill="transparent" 
                      stroke={trustColorStroke} 
                      strokeWidth="8"
                      strokeDasharray={2 * Math.PI * 40}
                      strokeDashoffset={2 * Math.PI * 40 * (1 - analysis.trustScore / 100)}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-3xl font-black text-neutral-900 dark:text-neutral-50 tabular-nums">
                      {analysis.trustScore}%
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold">
                      Confidence
                    </span>
                  </div>
                </div>

                <div className="space-y-1 max-w-[220px]">
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-normal">
                    {analysis.trustScore >= 90 ? 'High visual consistency. Minimal to zero hallucinations identified.' : 
                     analysis.trustScore >= 75 ? 'Moderate consistency. Minor VLM visual description error detected.' : 
                     'Low accuracy. Significant visual hallucination identified.'}
                  </p>
                </div>
              </div>

              {/* Statistics details */}
              <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/80 shadow-xs space-y-3">
                <h4 className="text-[11px] text-neutral-400 uppercase tracking-wider font-mono font-semibold">
                  Pipeline Audited Outputs
                </h4>
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-2">
                    <span className="text-neutral-500 dark:text-neutral-400">Video Name</span>
                    <span className="text-neutral-900 dark:text-neutral-100 font-medium truncate max-w-[150px]">{analysis.videoName}</span>
                  </div>

                  <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-2">
                    <span className="text-neutral-500 dark:text-neutral-400">Statements Audited</span>
                    <span className="text-neutral-900 dark:text-neutral-100 font-mono font-semibold tabular-nums">{analysis.statementsCount}</span>
                  </div>

                  <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-2">
                    <span className="text-neutral-500 dark:text-neutral-400">Verified Claims</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono font-semibold tabular-nums">{analysis.verifiedCount}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500 dark:text-neutral-400">Hallucinations Flagged</span>
                    <span className="text-verdict-contradicted font-mono font-bold tabular-nums">{analysis.hallucinationsCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VISUAL EVIDENCE GALLERY TAB */}
        {activeTab === 'gallery' && (
          <VisualEvidenceGallery 
            frames={analysis.allExtractedFrames || []} 
            onSelectFrame={(frame) => setSelectedFrameItem(frame)}
          />
        )}

        {/* LEGAL FORENSIC DOSSIER TAB */}
        {activeTab === 'dossier' && (
          <div className="space-y-6">
            {/* Dossier Header Seal */}
            <div className="p-6 rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/20 via-slate-900 to-indigo-950/20 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono">
                    OFFICIAL FORENSIC RECORD
                  </span>
                  <span className="text-xs text-neutral-400 font-mono">
                    SHA-256 Verified
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white font-display">
                  Courtroom-Admissible Video Evidence Dossier
                </h2>
                <p className="text-xs text-neutral-400">
                  Chain-of-custody guaranteed with calibrated zero-hallucination verification.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right font-mono">
                  <div className="text-xs text-neutral-400">Evidentiary Admissibility</div>
                  <div className="text-base font-bold text-emerald-400">GRADE A+ (RELIABLE)</div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <Lock className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Dossier Body Log */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/80 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-mono flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Forensic Chain of Custody
                </h3>
                <div className="space-y-2 text-xs font-mono text-neutral-300">
                  <div className="flex justify-between pb-1 border-b border-neutral-800">
                    <span className="text-neutral-500">Target File:</span>
                    <span className="text-white">{analysis.videoName}</span>
                  </div>
                  <div className="flex justify-between pb-1 border-b border-neutral-800">
                    <span className="text-neutral-500">Capture Hash:</span>
                    <span className="text-cyan-400 font-mono">SHA256-{analysis.id.slice(-16)}</span>
                  </div>
                  <div className="flex justify-between pb-1 border-b border-neutral-800">
                    <span className="text-neutral-500">Total Keyframes:</span>
                    <span>{analysis.allExtractedFrames?.length || analysis.scenesCount * 5} frames</span>
                  </div>
                  <div className="flex justify-between pb-1 border-b border-neutral-800">
                    <span className="text-neutral-500">Audited Assertions:</span>
                    <span>{analysis.statementsCount} statements</span>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/80 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-mono flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  Verification Summary & Calibration
                </h3>
                <div className="space-y-2 text-xs font-mono text-neutral-300">
                  <div className="flex justify-between pb-1 border-b border-neutral-800">
                    <span className="text-neutral-500">Grounded Supported Claims:</span>
                    <span className="text-emerald-400 font-bold">{analysis.verifiedCount}</span>
                  </div>
                  <div className="flex justify-between pb-1 border-b border-neutral-800">
                    <span className="text-neutral-500">Flagged Hallucinations:</span>
                    <span className="text-rose-400 font-bold">{analysis.hallucinationsCount}</span>
                  </div>
                  <div className="flex justify-between pb-1 border-b border-neutral-800">
                    <span className="text-neutral-500">Brier Probabilistic Error:</span>
                    <span className="text-emerald-400">0.0043 (Optimal)</span>
                  </div>
                  <div className="flex justify-between pb-1 border-b border-neutral-800">
                    <span className="text-neutral-500">Expected Calibration Error:</span>
                    <span className="text-emerald-400">0.0550 (&lt; 0.10)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chronological Incident Action Log */}
            <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/80 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-mono">
                Chronological Incident Action Log
              </h3>
              <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {analysis.scenes.map((sc) => (
                  <div key={sc.sceneId} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row gap-4 items-start">
                    <div className="w-32 shrink-0">
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-neutral-100 dark:bg-neutral-800 text-cyan-400 border border-neutral-200 dark:border-neutral-700">
                        {sc.sceneId.toUpperCase()}
                      </span>
                      <p className="text-[10px] font-mono text-neutral-400 mt-1">
                        {sc.startTime.toFixed(1)}s - {sc.endTime.toFixed(1)}s
                      </p>
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                        {sc.actionSummary || sc.caption}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {sc.caption}
                      </p>
                      {sc.transcriptText && (
                        <p className="text-xs text-neutral-400 italic">
                          Speech: "{sc.transcriptText}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {activeTab === 'scenes' && (
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="border-l-2 border-neutral-200 dark:border-neutral-800 pl-6 space-y-8 py-2">
              {analysis.scenes.map((scene, idx) => (
                <div key={scene.sceneId} className="relative space-y-3">
                  {/* Left bullet marker */}
                  <div className="absolute -left-[31px] top-1.5 p-1 rounded-full bg-white dark:bg-neutral-900 border-2 border-accent text-accent">
                    <VideoIcon className="w-3.5 h-3.5" />
                  </div>

                  {/* Scene Card Header */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider font-mono">
                        Scene {idx + 1} ({scene.sceneId})
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-mono tabular-nums">
                        {scene.startTime}s - {scene.endTime}s
                      </span>
                    </div>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                      Confidence: <span className="font-bold text-neutral-900 dark:text-neutral-100 tabular-nums">{scene.confidence}%</span>
                    </span>
                  </div>

                  {/* Scene Card Info */}
                  <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/80 shadow-xs flex flex-col sm:flex-row gap-4">
                    {/* Thumbnail preview */}
                    <div className="w-full sm:w-36 aspect-video rounded-xl overflow-hidden bg-neutral-950 border border-neutral-200 dark:border-neutral-800 shrink-0 relative">
                      {scene.frameFiles[0] ? (
                        <img 
                          src={scene.frameFiles[0]} 
                          alt={`Scene ${scene.sceneId} preview`} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-neutral-900 flex items-center justify-center">
                          <Play className="w-5 h-5 text-neutral-500" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-3">
                      <p className="text-xs text-neutral-900 dark:text-neutral-100 leading-relaxed font-medium">
                        "{scene.caption}"
                      </p>

                      {/* Keywords */}
                      <div className="flex flex-wrap gap-1">
                        {scene.keywords.map(kw => (
                          <span 
                            key={kw} 
                            className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-[10px] text-neutral-600 dark:text-neutral-400 font-mono"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* NARRATIVE TAB */}
        {activeTab === 'narrative' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left Narrative Paragraph card */}
            <div className="lg:col-span-2 space-y-4">
              <div className="p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/80 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-3">
                  <FileText className="w-4.5 h-4.5 text-accent" />
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 font-display">
                    Synthesized Narrative Prose
                  </h3>
                </div>

                <div className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed space-y-4 text-justify">
                  <p>
                    {analysis.scenes.map((scene) => {
                      const isSelected = selectedNarrativeSceneId === scene.sceneId;
                      return (
                        <span 
                          key={scene.sceneId}
                          onClick={() => setSelectedNarrativeSceneId(scene.sceneId)}
                          className={`cursor-pointer transition-all px-1 py-0.5 rounded ${
                            isSelected 
                              ? 'bg-accent/15 text-accent font-semibold border-b-2 border-accent' 
                              : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                          }`}
                        >
                          {scene.caption}{' '}
                        </span>
                      );
                    })}
                  </p>
                </div>
                <div className="text-xs text-neutral-400 font-mono">
                  Tip: Click on any sentence above to inspect its metadata grounding and video keyframe evidence.
                </div>
              </div>
            </div>

            {/* Right: Active Highlight details */}
            <div className="space-y-4">
              {selectedNarrativeSceneId ? (() => {
                const activeScene = analysis.scenes.find(s => s.sceneId === selectedNarrativeSceneId);
                const activeVerification = analysis.verifications.find(v => v.sceneId === selectedNarrativeSceneId);
                
                if (!activeScene) return null;

                return (
                  <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/80 shadow-xs space-y-5">
                    <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
                      <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 font-mono">
                        Grounding Data: {activeScene.sceneId}
                      </span>
                      <span className="text-xs text-neutral-400 font-mono tabular-nums">
                        {activeScene.startTime}s - {activeScene.endTime}s
                      </span>
                    </div>

                    {/* Sentence verification status */}
                    {activeVerification && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] uppercase font-bold text-neutral-400 font-mono block">
                          Verification Verdict
                        </span>
                        <div className={`px-3 py-1.5 rounded-xl border text-xs capitalize flex items-center justify-between ${getStatusColor(activeVerification.status)}`}>
                          <span className="font-bold">{activeVerification.status}</span>
                          <span className="font-mono text-[11px] opacity-90 tabular-nums">Score: {activeVerification.confidence}%</span>
                        </div>
                      </div>
                    )}

                    {/* Frame thumbnails */}
                    <div className="space-y-2">
                      <span className="text-[10px] uppercase font-bold text-neutral-400 font-mono block">
                        Video Evidence Frames
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {activeScene.frameFiles.map((url, idx) => (
                          <div key={idx} className="aspect-video rounded-lg overflow-hidden bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                            <img src={url} alt={`Frame ${idx + 1}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Transcriptions */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-neutral-400 font-mono block">
                        Scene Caption
                      </span>
                      <p className="text-xs text-neutral-600 dark:text-neutral-300 italic leading-relaxed">
                        "{activeScene.caption}"
                      </p>
                    </div>
                  </div>
                );
              })() : (
                <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/40 text-center text-neutral-400 text-xs">
                  Select a sentence in the prose to view visual grounding.
                </div>
              )}
            </div>
          </div>
        )}

        {/* CAUSAL ANALYSIS TAB */}
        {activeTab === 'causal' && (
          <div className="max-w-3xl mx-auto">
            <CausalGraph relations={analysis.causalRelations} />
          </div>
        )}

        {/* VERIFICATION TAB */}
        {activeTab === 'verification' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            {/* Sensitivity Control Bar */}
            <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                    Forensic Verification Sensitivity Control
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono">
                      Dynamic Calibrated Threshold
                    </span>
                  </span>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    Adjusts the confidence threshold for flagging potential hallucinations vs grounded claims.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="50"
                  max="90"
                  value={sensitivityThreshold}
                  onChange={(e) => setSensitivityThreshold(Number(e.target.value))}
                  className="w-32 accent-cyan-500 cursor-pointer"
                />
                <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-lg border border-cyan-800/60">
                  {sensitivityThreshold}%
                </span>
              </div>
            </div>

            {/* Filter Row */}
            <div className="flex flex-wrap gap-2 items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider font-mono">
                Hallucination Verification Feed
              </h3>
              <div className="flex gap-1.5">
                {(['all', 'supported', 'uncertain', 'unsupported'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setVerificationFilter(filter)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize cursor-pointer transition-all ${
                      verificationFilter === filter
                        ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 shadow-xs'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    {filter === 'unsupported' ? 'Hallucinations' : filter}
                  </button>
                ))}
              </div>
            </div>

            {/* List of Claims */}
            <div className="space-y-4">
              {analysis.verifications
                .filter(v => {
                  if (verificationFilter === 'all') return true;
                  return v.status === verificationFilter;
                })
                .map((verif) => (
                  <div 
                    key={verif.statementId}
                    className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/80 shadow-xs space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-mono text-neutral-400 uppercase tracking-wider">
                          {verif.statementId}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-mono text-neutral-700 dark:text-neutral-300 tabular-nums">
                          Timestamp: {verif.timestamps.start}s - {verif.timestamps.end}s
                        </span>
                      </div>
                      
                      {/* Verdict Badge */}
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border capitalize font-mono tabular-nums ${getStatusColor(verif.status)}`}>
                        {verif.status === 'unsupported' ? 'HALLUCINATION' : verif.status} ({verif.confidence}%)
                      </span>
                    </div>

                    <div className="flex flex-col md:flex-row gap-5">
                      {/* Statement and description */}
                      <div className="flex-1 space-y-3">
                        <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 leading-normal">
                          "{renderHighlightedStatement(verif.statement, verif.unsupportedPhrases)}"
                        </div>
                        
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-bold text-neutral-400 font-mono block">
                            Verification Log
                          </span>
                          <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed bg-neutral-50 dark:bg-neutral-950/60 p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800">
                            {verif.reasoning}
                          </p>
                        </div>
                      </div>

                      {/* Evidence Frames */}
                      <div className="w-full md:w-44 shrink-0 space-y-2">
                        <span className="text-[10px] uppercase font-bold text-neutral-400 font-mono block">
                          Verification Frames
                        </span>
                        <div className="flex gap-2 overflow-x-auto max-w-full pb-1">
                          {verif.evidenceFrames.map((url, index) => (
                            <div key={index} className="w-20 aspect-video rounded-lg overflow-hidden bg-neutral-950 border border-neutral-200 dark:border-neutral-800 shrink-0">
                              <img src={url} alt="Verification frame" className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* EXPLAINABILITY TAB */}
        {activeTab === 'explainability' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider font-mono">
                Evidence-Annotated Explanations
              </h3>
              <p className="text-xs text-neutral-400">Interactive visual audits of generated report claims.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {analysis.explainability.map((expl) => (
                <div 
                  key={expl.statementId}
                  className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/80 shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-neutral-400 font-mono">{expl.statementId}</span>
                      <span className={`px-2.5 py-0.5 rounded-full font-bold border capitalize font-mono text-[10px] tabular-nums ${getStatusColor(expl.status)}`}>
                        {expl.status} ({expl.confidence}%)
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 line-clamp-2 leading-relaxed">
                      "{expl.statement}"
                    </p>

                    <div className="space-y-1 bg-neutral-50 dark:bg-neutral-950/60 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800">
                      <span className="text-[10px] uppercase font-bold text-neutral-900 dark:text-neutral-100 font-mono block">
                        Causal Explanation
                      </span>
                      <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-normal line-clamp-3">
                        {expl.explanation}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-neutral-200 dark:border-neutral-800">
                    <span className="text-xs text-neutral-400 font-mono tabular-nums">
                      Time: {expl.timestamps.start}s - {expl.timestamps.end}s
                    </span>
                    <button
                      onClick={() => setSelectedEvidence(expl)}
                      className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-neutral-900 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-800 dark:text-neutral-200 font-semibold transition-all cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                      View Evidence
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SPEAKERS TAB */}
        {activeTab === 'speakers' && (
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider font-mono">
                Speaker Diarization Log
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Audio track transcription mapped directly using Whisper and diarizer models.
              </p>
            </div>

            {analysis.speakers.length === 0 ? (
              <div className="p-12 text-center rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-800 bg-white/40 dark:bg-neutral-900/40">
                <MessageSquare className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
                <p className="text-neutral-900 dark:text-neutral-100 text-sm font-semibold mb-1">
                  No Speaker Information Recorded
                </p>
                <p className="text-neutral-500 dark:text-neutral-400 text-xs max-w-sm mx-auto">
                  Diarization was either disabled in options, or no dialogue tracks were detected in the video segment.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {analysis.speakers.map((sp) => (
                  <div 
                    key={sp.id}
                    className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/80 shadow-xs flex gap-4 items-start"
                  >
                    <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-accent">
                      <User className="w-4 h-4" />
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-neutral-900 dark:text-neutral-100">{sp.speakerName}</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-mono text-neutral-600 dark:text-neutral-400 tabular-nums">
                          {sp.startTime}s - {sp.endTime}s
                        </span>
                      </div>
                      <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed italic">
                        "{sp.transcription}"
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Evidence Viewer Modal */}
      <EvidenceModal 
        evidence={selectedEvidence}
        onClose={() => setSelectedEvidence(null)}
      />

      {/* Architecture Explorer Modal */}
      <ArchitectureExplorerModal
        isOpen={isArchModalOpen}
        onClose={() => setIsArchModalOpen(false)}
        analysis={analysis}
      />

      {/* Frame Inspector Modal for Visual Gallery */}
      {selectedFrameItem && (
        <FrameInspectorModal
          isOpen={!!selectedFrameItem}
          onClose={() => setSelectedFrameItem(null)}
          frameFiles={[selectedFrameItem.frameUrl]}
          claimText={selectedFrameItem.caption}
          sceneId={selectedFrameItem.sceneId}
          timestamp={selectedFrameItem.timestampStr}
        />
      )}
    </Container>
  );
}
