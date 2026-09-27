import { Fragment } from 'react';
import type { CausalRelation } from '../types';
import { ArrowDown, Link as LinkIcon, Compass } from 'lucide-react';

interface CausalGraphProps {
  relations: CausalRelation[];
}

export default function CausalGraph({ relations }: CausalGraphProps) {
  return (
    <div className="space-y-8">
      {/* Schematic Overview Title */}
      <div className="flex items-center justify-between border-b border-slate-850 pb-3">
        <div>
          <h3 className="text-xs font-bold text-slate-200">Causal Chain Sequence</h3>
          <p className="text-[10px] text-slate-400">Flow mapping inferred logical linkages between scene actions.</p>
        </div>
        <div className="flex gap-4 text-[9px] font-mono uppercase text-slate-500">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span> Initial State
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> Inferred Cause
          </div>
        </div>
      </div>

      {/* Visual Sequence */}
      <div className="flex flex-col items-center gap-4 max-w-2xl mx-auto py-4">
        {relations.map((relation) => {
          const isInitial = !relation.causeSceneId;
          
          return (
            <Fragment key={relation.sceneId}>
              {/* Connector Arrow */}
              {!isInitial && (
                <div className="flex flex-col items-center gap-1 my-1">
                  <div className="h-6 w-[2px] bg-gradient-to-b from-indigo-500/20 to-indigo-500"></div>
                  <div className="px-2 py-0.5 rounded bg-indigo-950 border border-indigo-800 text-[8px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1">
                    <LinkIcon className="w-2.5 h-2.5" />
                    Causes
                  </div>
                  <ArrowDown className="w-4 h-4 text-indigo-500" />
                </div>
              )}

              {/* Event Node */}
              <div 
                className={`w-full p-4 rounded-xl border transition-all ${
                  isInitial 
                    ? 'border-slate-805 bg-slate-900/20 shadow-md' 
                    : 'border-indigo-500/20 bg-indigo-500/5 shadow-lg shadow-indigo-950/20 hover:border-indigo-500/40'
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-2">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider ${
                    isInitial 
                      ? 'bg-slate-800 text-slate-300 border border-slate-700/50' 
                      : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                  }`}>
                    {relation.sceneId} ({relation.startTime}s - {relation.endTime}s)
                  </span>

                  <div className="flex items-center gap-1 text-[9px] font-mono text-slate-500">
                    <Compass className="w-3 h-3 text-slate-650" />
                    <span>Inference: {relation.confidence}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {/* If there is a cause statement */}
                  {!isInitial && (
                    <div className="p-2.5 rounded bg-slate-950/50 border border-slate-850/50 text-[11px] text-slate-400 leading-normal">
                      <span className="font-bold text-indigo-400 block mb-0.5">Preceding Cause:</span>
                      "{relation.cause}"
                    </div>
                  )}

                  {/* Current Event Statement */}
                  <div className="text-xs font-semibold text-slate-100 leading-relaxed">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mb-0.5">
                      {isInitial ? 'Initial Event State' : 'Effect / Consequence'}
                    </span>
                    "{relation.event}"
                  </div>
                </div>
              </div>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
