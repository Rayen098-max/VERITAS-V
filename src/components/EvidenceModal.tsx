import { useState } from 'react';
import { X, Clock, ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react';
import type { ExplainabilityResult } from '../types';

interface EvidenceModalProps {
  evidence: ExplainabilityResult | null;
  onClose: () => void;
}

export default function EvidenceModal({ evidence, onClose }: EvidenceModalProps) {
  const [selectedFrame, setSelectedFrame] = useState<string | null>(null);

  if (!evidence) return null;

  const getStatusIcon = () => {
    switch (evidence.status) {
      case 'supported':
        return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
      case 'uncertain':
        return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      case 'unsupported':
      default:
        return <ShieldAlert className="w-5 h-5 text-rose-500" />;
    }
  };

  const getStatusClass = () => {
    switch (evidence.status) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div 
        className="w-full max-w-4xl rounded-2xl border border-slate-800 bg-[#0d1321] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-lg border ${getStatusClass()}`}>
              {getStatusIcon()}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-200">Frame Evidence Verification</h3>
              <p className="text-[10px] text-slate-400 font-mono">Statement ID: {evidence.statementId} • Scene ID: {evidence.sceneId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {/* Statement Detail */}
          <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/40 space-y-2">
            <span className="text-[10px] text-indigo-400 font-mono uppercase tracking-wider block font-bold">Generated Claim</span>
            <p className="text-sm font-semibold text-slate-100 leading-normal">"{evidence.statement}"</p>
            <div className="flex items-center gap-4 pt-1.5 text-xs">
              <span className="flex items-center gap-1 text-slate-400 font-mono">
                <Clock className="w-3.5 h-3.5" />
                {evidence.timestamps.start}s - {evidence.timestamps.end}s
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border capitalize ${getStatusClass()}`}>
                {evidence.status} ({evidence.confidence}%)
              </span>
            </div>
          </div>

          {/* Verification Explanation */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-350">Causal Verification Reasoning</h4>
            <p className="text-xs text-slate-400 leading-relaxed bg-[#0b0f19] p-4 rounded-lg border border-slate-850">
              {evidence.explanation}
            </p>
          </div>

          {/* Evidence Frames */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-350">Supporting Video Frames</h4>
            {evidence.evidenceFrames.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-lg">
                No physical frames recorded for this segment.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {evidence.evidenceFrames.map((url, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setSelectedFrame(url)}
                    className="group relative aspect-video rounded-lg overflow-hidden bg-slate-950 border border-slate-850 cursor-zoom-in hover:border-indigo-500/40 transition-colors"
                  >
                    <img 
                      src={url} 
                      alt={`Evidence frame ${idx + 1}`} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-transparent transition-colors"></div>
                    <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-slate-950/80 text-[8px] font-mono text-slate-300">
                      Frame {idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Image Magnifier Overlay */}
        {selectedFrame && (
          <div 
            className="fixed inset-0 z-60 bg-slate-950/95 flex items-center justify-center p-4 cursor-zoom-out"
            onClick={() => setSelectedFrame(null)}
          >
            <div className="absolute top-4 right-4 flex items-center gap-3">
              <span className="text-xs text-slate-400 font-mono">Click anywhere to close zoom</span>
              <button 
                onClick={() => setSelectedFrame(null)}
                className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <img 
              src={selectedFrame} 
              alt="Magnified evidence frame" 
              className="max-w-full max-h-[85vh] object-contain rounded-lg border border-slate-800 shadow-2xl"
            />
          </div>
        )}
      </div>
    </div>
  );
}
