import { Fragment } from 'react';
import type { CausalRelation } from '../types';
import { ArrowDown, Link as LinkIcon, Compass } from 'lucide-react';

interface CausalGraphProps {
  relations: CausalRelation[];
}

export default function CausalGraph({ relations }: CausalGraphProps) {
  return (
    <div className="space-y-8 select-none">
      {/* Schematic Overview Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <div>
          <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
            Causal Chain Sequence
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Flow mapping inferred causal dependencies and chronological linkages between scene actions.
          </p>
        </div>
        <div className="flex gap-4 text-xs font-mono uppercase text-neutral-500 dark:text-neutral-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-neutral-400 dark:bg-neutral-600" />
            <span>Initial State</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-accent" />
            <span>Inferred Cause</span>
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
                  <div className="h-6 w-[2px] bg-accent/60" />
                  <div className="px-2.5 py-0.5 rounded-full bg-accent text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 shadow-xs">
                    <LinkIcon className="w-2.5 h-2.5" />
                    Causes
                  </div>
                  <ArrowDown className="w-4 h-4 text-accent" />
                </div>
              )}

              {/* Event Node */}
              <div 
                className={`w-full p-5 rounded-2xl border transition-all ${
                  isInitial 
                    ? 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/80 shadow-sm' 
                    : 'border-accent/40 bg-white dark:bg-neutral-900/90 shadow-md hover:shadow-lg'
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-2.5">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                    isInitial 
                      ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700' 
                      : 'bg-accent text-white'
                  }`}>
                    {relation.sceneId} ({relation.startTime}s - {relation.endTime}s)
                  </span>

                  <div className="flex items-center gap-1 text-xs font-mono text-neutral-500 dark:text-neutral-400">
                    <Compass className="w-3.5 h-3.5 text-accent" />
                    <span className="tabular-nums">Inference: {relation.confidence}</span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {/* If there is a cause statement */}
                  {!isInitial && (
                    <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-300 leading-normal">
                      <span className="font-bold text-neutral-900 dark:text-neutral-100 block mb-0.5">Preceding Cause:</span>
                      "{relation.cause}"
                    </div>
                  )}

                  {/* Current Event Statement */}
                  <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 leading-relaxed">
                    <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block mb-0.5">
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
