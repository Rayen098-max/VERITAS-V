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
  ArrowLeft
} from 'lucide-react';
import { analysisService } from '../services/analysisService';
import type { VideoAnalysis, ExplainabilityResult, VerificationStatus } from '../types';
import CausalGraph from '../components/CausalGraph';
import EvidenceModal from '../components/EvidenceModal';

export default function AnalysisResults() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [analysis, setAnalysis] = useState<VideoAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'scenes' | 'narrative' | 'causal' | 'verification' | 'explainability' | 'speakers'>('overview');

  // Narrative Highlight State
  const [selectedNarrativeSceneId, setSelectedNarrativeSceneId] = useState<string | null>(null);

  // Verification Filter State
  const [verificationFilter, setVerificationFilter] = useState<'all' | 'supported' | 'uncertain' | 'unsupported'>('all');

  // Evidence Modal State
  const [selectedEvidence, setSelectedEvidence] = useState<ExplainabilityResult | null>(null);

  useEffect(() => {
    const loadAnalysis = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await analysisService.getAnalysisDetails(id);
        setAnalysis(data);
        // Default to first scene in narrative
        if (data.scenes.length > 0) {
          setSelectedNarrativeSceneId(data.scenes[0].sceneId);
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to load analysis results.');
      } finally {
        setLoading(false);
      }
    };
    loadAnalysis();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3">
        <Activity className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-slate-400 text-sm font-medium">Assembling multi-agent analysis reports...</p>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="p-8 text-center max-w-md mx-auto space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-base font-bold text-slate-200">Analysis Not Found</h3>
        <p className="text-xs text-slate-400">{error || 'The requested analysis session could not be retrieved.'}</p>
        <button
          onClick={() => navigate('/history')}
          className="flex items-center justify-center gap-2 mx-auto px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to History
        </button>
      </div>
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
                className="px-1 py-0.5 rounded bg-rose-500/20 text-rose-450 border border-rose-500/35 font-bold line-through"
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
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'uncertain':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'unsupported':
      default:
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Top Navigation Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="space-y-1">
          <button 
            onClick={() => navigate('/history')}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Analysis History
          </button>
          <h1 className="text-xl font-bold text-slate-200">{analysis.videoName}</h1>
          <p className="text-[10px] text-slate-500 font-mono">
            Analysis ID: {analysis.id} • Date: {analysis.dateAnalyzed} • Size: {analysis.fileSize || 'N/A'}
          </p>
        </div>

        {/* Quick status banner */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 bg-slate-900 border border-slate-850 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-mono">
            <Clock className="w-3.5 h-3.5" /> Duration: {analysis.duration}s
          </span>
          <span className="text-xs text-slate-400 bg-slate-900 border border-slate-850 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-mono">
            <VideoIcon className="w-3.5 h-3.5" /> Scenes: {analysis.scenesCount}
          </span>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-slate-800 overflow-x-auto custom-scrollbar gap-1.5 pb-px">
        {[
          { id: 'overview', name: 'Overview' },
          { id: 'scenes', name: 'Scene Captions' },
          { id: 'narrative', name: 'Narrative Document' },
          { id: 'causal', name: 'Causal Chain' },
          { id: 'verification', name: 'Hallucination Verification' },
          { id: 'explainability', name: 'Explainability Details' },
          { id: 'speakers', name: 'Speakers Transcriptions' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-3 border-b-2 font-medium text-xs whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-450 hover:text-slate-350 hover:border-slate-800'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* TABS CONTAINER */}
      <div className="min-h-[400px]">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* Left: Video Player */}
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-2xl overflow-hidden bg-slate-950 border border-slate-800/80 aspect-video relative flex items-center justify-center">
                {analysis.videoUrl ? (
                  <video 
                    src={analysis.videoUrl} 
                    controls 
                    className="w-full h-full object-cover"
                    poster={analysis.scenes[0]?.frameFiles[0]}
                  />
                ) : (
                  <div className="text-center p-6 space-y-2">
                    <FileVideo className="w-12 h-12 text-slate-650 mx-auto" />
                    <p className="text-slate-400 text-xs">No preview video file available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Summary Metrics */}
            <div className="space-y-6">
              {/* Trust Score circular card */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-[#0d1321]/40 flex flex-col items-center text-center space-y-4">
                <h3 className="text-xs font-bold text-slate-200">Overall Trust Score</h3>
                
                {/* Circular Score Visualizer */}
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {/* Background Circle */}
                    <circle 
                      cx="50" cy="50" r="40" 
                      fill="transparent" 
                      stroke="rgba(30, 41, 59, 0.6)" 
                      strokeWidth="8"
                    />
                    {/* Progress Circle */}
                    <circle 
                      cx="50" cy="50" r="40" 
                      fill="transparent" 
                      stroke={
                        analysis.trustScore >= 90 ? '#10b981' : 
                        analysis.trustScore >= 75 ? '#f59e0b' : '#ef4444'
                      } 
                      strokeWidth="8"
                      strokeDasharray={2 * Math.PI * 40}
                      strokeDashoffset={2 * Math.PI * 40 * (1 - analysis.trustScore / 100)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-3xl font-black text-slate-100">{analysis.trustScore}%</span>
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">Accuracy</span>
                  </div>
                </div>

                <div className="space-y-1 max-w-[200px]">
                  <p className="text-[11px] text-slate-400 leading-normal">
                    {analysis.trustScore >= 90 ? 'High visual consistency. Minimal to zero hallucinations identified.' : 
                     analysis.trustScore >= 75 ? 'Moderate consistency. Minor VLM visual description error detected.' : 
                     'Low accuracy. Significant visual hallucination identified.'}
                  </p>
                </div>
              </div>

              {/* Statistics details */}
              <div className="p-5 rounded-xl border border-slate-850 bg-slate-900/10 space-y-3">
                <h4 className="text-[10px] text-slate-550 font-bold uppercase tracking-wider">Pipeline Outputs</h4>
                <div className="space-y-2 text-xs">
                  
                  <div className="flex items-center justify-between border-b border-slate-850/40 pb-1.5">
                    <span className="text-slate-450">Video Name</span>
                    <span className="text-slate-300 font-semibold line-clamp-1 max-w-[150px]">{analysis.videoName}</span>
                  </div>

                  <div className="flex items-center justify-between border-b border-slate-850/40 pb-1.5">
                    <span className="text-slate-450">Statements Audited</span>
                    <span className="text-slate-300 font-mono font-semibold">{analysis.statementsCount}</span>
                  </div>

                  <div className="flex items-center justify-between border-b border-slate-850/40 pb-1.5">
                    <span className="text-slate-450">Verified Claims</span>
                    <span className="text-emerald-400 font-mono font-semibold">{analysis.verifiedCount}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-450">Hallucinations Flagged</span>
                    <span className="text-rose-500 font-mono font-semibold">{analysis.hallucinationsCount}</span>
                  </div>

                </div>
              </div>

            </div>

          </div>
        )}

        {/* SCENE CAPTIONS TAB */}
        {activeTab === 'scenes' && (
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="border-l-2 border-slate-800 pl-6 space-y-8 py-2">
              {analysis.scenes.map((scene, idx) => (
                <div key={scene.sceneId} className="relative space-y-3">
                  
                  {/* Left bullet marker */}
                  <div className="absolute -left-[31px] top-1.5 p-1 rounded-full bg-[#0d1321] border-2 border-slate-800 text-indigo-400">
                    <VideoIcon className="w-3.5 h-3.5" />
                  </div>

                  {/* Scene Card Header */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200 uppercase tracking-wider">Scene {idx + 1} ({scene.sceneId})</span>
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 font-mono">
                        {scene.startTime}s - {scene.endTime}s
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Confidence: <span className="font-bold text-indigo-400">{scene.confidence}%</span>
                    </span>
                  </div>

                  {/* Scene Card Info */}
                  <div className="p-4 rounded-xl border border-slate-850 bg-slate-900/10 flex flex-col sm:flex-row gap-4">
                    {/* Thumbnail preview */}
                    <div className="w-full sm:w-36 aspect-video rounded overflow-hidden bg-slate-950 border border-slate-850 flex-shrink-0 relative">
                      {scene.frameFiles[0] ? (
                        <img 
                          src={scene.frameFiles[0]} 
                          alt={`Scene ${scene.sceneId} preview`} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                          <Play className="w-5 h-5 text-slate-650" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-3">
                      <p className="text-xs text-slate-300 leading-relaxed font-medium">
                        "{scene.caption}"
                      </p>

                      {/* Keywords */}
                      <div className="flex flex-wrap gap-1">
                        {scene.keywords.map(kw => (
                          <span 
                            key={kw} 
                            className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-850 text-[9px] text-slate-500"
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
              <div className="p-8 rounded-2xl border border-slate-800 bg-[#0d1321]/20 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
                  <FileText className="w-4.5 h-4.5 text-indigo-400" />
                  <h3 className="text-sm font-bold text-slate-200">Explained Narrative prose</h3>
                </div>

                <div className="text-sm text-slate-350 leading-relaxed font-light font-serif space-y-4 tracking-wide text-justify">
                  <p>
                    {analysis.scenes.map((scene) => {
                      const isSelected = selectedNarrativeSceneId === scene.sceneId;
                      return (
                        <span 
                          key={scene.sceneId}
                          onClick={() => setSelectedNarrativeSceneId(scene.sceneId)}
                          className={`cursor-pointer transition-all px-0.5 rounded ${
                            isSelected 
                              ? 'bg-indigo-500/20 text-slate-100 border-b border-indigo-400 font-normal' 
                              : 'hover:bg-slate-800/40 hover:text-slate-200'
                          }`}
                        >
                          {scene.caption}{' '}
                        </span>
                      );
                    })}
                  </p>
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  💡 Tip: Click on any sentence above to inspect its metadata grounding and frames.
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
                  <div className="p-6 rounded-2xl border border-slate-800 bg-[#0d1321]/45 space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                      <span className="text-[11px] font-bold text-slate-200 font-mono">Grounding Data: {activeScene.sceneId}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{activeScene.startTime}s - {activeScene.endTime}s</span>
                    </div>

                    {/* Sentence verification status */}
                    {activeVerification && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] uppercase font-bold text-slate-500 font-mono block">Verification Verdict</span>
                        <div className={`px-3 py-1.5 rounded-lg border text-xs capitalize flex items-center justify-between ${getStatusColor(activeVerification.status)}`}>
                          <span className="font-bold">{activeVerification.status}</span>
                          <span className="font-mono text-[10px] opacity-80">Score: {activeVerification.confidence}%</span>
                        </div>
                      </div>
                    )}

                    {/* Frame thumbnails */}
                    <div className="space-y-2">
                      <span className="text-[10px] uppercase font-bold text-slate-500 font-mono block">Video Evidence Frames</span>
                      <div className="grid grid-cols-2 gap-2">
                        {activeScene.frameFiles.map((url, idx) => (
                          <div key={idx} className="aspect-video rounded overflow-hidden bg-slate-950 border border-slate-850">
                            <img src={url} alt={`Frame ${idx + 1}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Transcriptions */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-500 font-mono block">Scene Caption</span>
                      <p className="text-xs text-slate-400 italic leading-relaxed">
                        "{activeScene.caption}"
                      </p>
                    </div>

                  </div>
                );
              })() : (
                <div className="p-6 rounded-2xl border border-slate-800 text-center text-slate-500 text-xs">
                  Select a sentence to view visual grounding.
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
            {/* Filter Row */}
            <div className="flex flex-wrap gap-2 items-center justify-between border-b border-slate-850 pb-3">
              <h3 className="text-xs font-bold text-slate-200">Hallucination Verification Dashboard</h3>
              <div className="flex gap-1.5">
                {(['all', 'supported', 'uncertain', 'unsupported'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setVerificationFilter(filter)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold border capitalize cursor-pointer transition-all ${
                      verificationFilter === filter
                        ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                        : 'bg-transparent text-slate-450 border-slate-850 hover:text-slate-350 hover:border-slate-700'
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
                    className="p-5 rounded-xl border border-slate-850 bg-slate-900/10 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-850/40 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-wider">{verif.statementId}</span>
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-850 text-[10px] font-mono text-slate-400">
                          Timestamp: {verif.timestamps.start}s - {verif.timestamps.end}s
                        </span>
                      </div>
                      
                      {/* Verdict Badge */}
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border capitalize font-mono ${getStatusColor(verif.status)}`}>
                        {verif.status === 'unsupported' ? 'HALLUCINATION' : verif.status} ({verif.confidence}%)
                      </span>
                    </div>

                    <div className="flex flex-col md:flex-row gap-5">
                      {/* Statement and description */}
                      <div className="flex-1 space-y-3">
                        <div className="text-sm font-semibold text-slate-200 leading-normal">
                          "{renderHighlightedStatement(verif.statement, verif.unsupportedPhrases)}"
                        </div>
                        
                        <div className="space-y-1">
                          <span className="text-[9px] uppercase font-bold text-slate-500 font-mono block">Verification Log</span>
                          <p className="text-xs text-slate-400 leading-relaxed bg-[#0b0f19]/40 p-3 rounded-lg border border-slate-850">
                            {verif.reasoning}
                          </p>
                        </div>
                      </div>

                      {/* Evidence Frames */}
                      <div className="w-full md:w-44 flex-shrink-0 space-y-2">
                        <span className="text-[9px] uppercase font-bold text-slate-500 font-mono block">Verification Frames</span>
                        <div className="flex gap-1.5 overflow-x-auto max-w-full pb-1">
                          {verif.evidenceFrames.map((url, index) => (
                            <div key={index} className="w-20 aspect-video rounded overflow-hidden bg-slate-950 border border-slate-850 flex-shrink-0">
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
            <div className="flex items-center justify-between border-b border-slate-850 pb-3">
              <h3 className="text-xs font-bold text-slate-200">Evidence-Annotated Explanations</h3>
              <p className="text-[10px] text-slate-550">Interactive visual audits of generated report claims.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {analysis.explainability.map((expl) => (
                <div 
                  key={expl.statementId}
                  className="p-5 rounded-xl border border-slate-850 bg-slate-900/10 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-slate-500 font-mono">{expl.statementId}</span>
                      <span className={`px-2 py-0.5 rounded font-bold border capitalize font-mono text-[9px] ${getStatusColor(expl.status)}`}>
                        {expl.status} ({expl.confidence}%)
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-slate-200 line-clamp-2 leading-relaxed">
                      "{expl.statement}"
                    </p>

                    <div className="space-y-1 bg-[#0b0f19]/30 p-3 rounded border border-slate-850/60">
                      <span className="text-[9px] uppercase font-bold text-indigo-400 font-mono block">Causal Explanation</span>
                      <p className="text-[11px] text-slate-400 leading-normal line-clamp-3">
                        {expl.explanation}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-850/50">
                    <span className="text-[10px] text-slate-500 font-mono">
                      Time: {expl.timestamps.start}s - {expl.timestamps.end}s
                    </span>
                    <button
                      onClick={() => setSelectedEvidence(expl)}
                      className="px-3 py-1.5 rounded bg-indigo-500/10 hover:bg-indigo-500/25 border border-indigo-500/20 hover:border-indigo-500/40 text-xs text-indigo-300 font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
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
            <div className="border-b border-slate-850 pb-3">
              <h3 className="text-xs font-bold text-slate-200">Speaker Diarization Log</h3>
              <p className="text-[10px] text-slate-500">Audio track transcription mapped directly using diarizer models.</p>
            </div>

            {analysis.speakers.length === 0 ? (
              <div className="p-12 text-center rounded-xl border border-dashed border-slate-800 bg-slate-900/10">
                <MessageSquare className="w-10 h-10 text-slate-650 mx-auto mb-3" />
                <p className="text-slate-400 text-sm font-semibold mb-1">No Speaker Information Recorded</p>
                <p className="text-slate-500 text-xs max-w-sm mx-auto">
                  Diarization was either disabled in options, or no dialogue tracks were detected in the video segment.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {analysis.speakers.map((sp) => (
                  <div 
                    key={sp.id}
                    className="p-4 rounded-xl border border-slate-850 bg-slate-900/15 flex gap-4 items-start"
                  >
                    <div className="p-2.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                      <User className="w-4 h-4" />
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-200">{sp.speakerName}</span>
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-850 text-[10px] font-mono text-slate-500">
                          {sp.startTime}s - {sp.endTime}s
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed font-light italic">
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

    </div>
  );
}
