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
        return <ShieldCheck className="w-5 h-5 text-emerald-500" />;
      case 'uncertain':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'unsupported':
      default:
        return <ShieldAlert className="w-5 h-5 text-rose-500" />;
    }
  };

  const getStatusClass = () => {
    switch (evidence.status) {
      case 'supported':
        return 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'uncertain':
        return 'text-amber-700 dark:text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'unsupported':
      default:
        return 'text-rose-700 dark:text-rose-400 bg-rose-500/10 border-rose-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/50">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${getStatusClass()}`}>
              {getStatusIcon()}
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-50 font-display">
                Frame Evidence Verification
              </h3>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono mt-0.5">
                Statement ID: {evidence.statementId} • Scene ID: {evidence.sceneId}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Statement Detail */}
          <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-950/60 space-y-2.5">
            <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-mono uppercase tracking-wider block font-bold">
              Audited Model Claim
            </span>
            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 leading-relaxed">
              "{evidence.statement}"
            </p>
            <div className="flex items-center gap-3 pt-1 text-xs">
              <span className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400 font-mono tabular-nums">
                <Clock className="w-3.5 h-3.5" />
                {evidence.timestamps.start}s - {evidence.timestamps.end}s
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border capitalize font-mono ${getStatusClass()}`}>
                {evidence.status} ({evidence.confidence}%)
              </span>
            </div>
          </div>

          {/* Verification Explanation */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-200 uppercase tracking-wider">
              Causal Verification Reasoning
            </h4>
            <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed bg-neutral-50/60 dark:bg-neutral-950/40 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 font-sans">
              {evidence.explanation}
            </p>
          </div>

          {/* Evidence Frames */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-200 uppercase tracking-wider">
              Supporting Video Frames
            </h4>
            {evidence.evidenceFrames.length === 0 ? (
              <div className="p-8 text-center text-neutral-400 text-xs border border-dashed border-neutral-300 dark:border-neutral-800 rounded-xl bg-neutral-50/50 dark:bg-neutral-950/50">
                No physical frames recorded for this segment.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {evidence.evidenceFrames.map((url, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setSelectedFrame(url)}
                    className="group relative aspect-video rounded-xl overflow-hidden bg-neutral-950 border border-neutral-200 dark:border-neutral-800 cursor-zoom-in hover:border-accent transition-all shadow-sm"
                  >
                    <img 
                      src={url} 
                      alt={`Evidence frame ${idx + 1}`} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-neutral-950/20 group-hover:bg-transparent transition-colors" />
                    <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md bg-neutral-950/80 backdrop-blur-xs text-[10px] font-mono text-neutral-200">
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
            className="fixed inset-0 z-60 bg-black/95 flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-200"
            onClick={() => setSelectedFrame(null)}
          >
            <div className="absolute top-4 right-4 flex items-center gap-3">
              <span className="text-xs text-neutral-400 font-mono">Click anywhere to close zoom</span>
              <button 
                onClick={() => setSelectedFrame(null)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img 
              src={selectedFrame} 
              alt="Magnified evidence frame" 
              className="max-w-full max-h-[85vh] object-contain rounded-2xl border border-neutral-700 shadow-2xl"
            />
          </div>
        )}
      </div>
    </div>
  );
}
