import React, { useState, useMemo } from 'react';
import type { ExtractedFrameItem } from '../types';
import { Search, Filter, ShieldCheck, AlertTriangle, Eye, Clock, Tag } from 'lucide-react';

interface VisualEvidenceGalleryProps {
  frames: ExtractedFrameItem[];
  onSelectFrame: (frame: ExtractedFrameItem) => void;
}

export const VisualEvidenceGallery: React.FC<VisualEvidenceGalleryProps> = ({ frames, onSelectFrame }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'centroid' | 'supported' | 'unsupported'>('all');
  const [selectedScene, setSelectedScene] = useState<string>('all');

  const uniqueScenes = useMemo(() => {
    const s = new Set<string>();
    frames.forEach(f => s.add(f.sceneId));
    return Array.from(s).sort();
  }, [frames]);

  const filteredFrames = useMemo(() => {
    return frames.filter(f => {
      // Search
      const matchesSearch =
        f.caption.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.actionSummary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.primaryActor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.objects.some(obj => obj.toLowerCase().includes(searchTerm.toLowerCase())) ||
        f.sceneId.toLowerCase().includes(searchTerm.toLowerCase());

      // Scene filter
      const matchesScene = selectedScene === 'all' || f.sceneId === selectedScene;

      // Status filter
      if (selectedFilter === 'centroid' && !f.isCentroid) return false;
      if (selectedFilter === 'supported' && f.verdict !== 'supported') return false;
      if (selectedFilter === 'unsupported' && f.verdict !== 'unsupported') return false;

      return matchesSearch && matchesScene;
    });
  }, [frames, searchTerm, selectedFilter, selectedScene]);

  return (
    <div className="space-y-4">
      {/* Top Controls Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by object, actor, scene, or action keyword..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950/70 border border-slate-700/60 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Scene Selector */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedScene}
            onChange={e => setSelectedScene(e.target.value)}
            className="px-3 py-2 bg-slate-950/70 border border-slate-700/60 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
          >
            <option value="all">All Scenes ({uniqueScenes.length})</option>
            {uniqueScenes.map(sc => (
              <option key={sc} value={sc}>{sc.toUpperCase()}</option>
            ))}
          </select>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedFilter === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 bg-slate-800/40 border border-transparent'
            }`}
          >
            All ({frames.length})
          </button>
          <button
            onClick={() => setSelectedFilter('centroid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedFilter === 'centroid'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm shadow-indigo-500/20'
                : 'text-slate-400 hover:text-slate-200 bg-slate-800/40 border border-transparent'
            }`}
          >
            Centroids Only
          </button>
          <button
            onClick={() => setSelectedFilter('supported')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
              selectedFilter === 'supported'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 bg-slate-800/40 border border-transparent'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified
          </button>
          <button
            onClick={() => setSelectedFilter('unsupported')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
              selectedFilter === 'unsupported'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm shadow-rose-500/20'
                : 'text-slate-400 hover:text-slate-200 bg-slate-800/40 border border-transparent'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Hallucinations
          </button>
        </div>

      </div>

      {/* Frame Grid */}
      {filteredFrames.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-slate-900/40 border border-slate-800">
          <p className="text-slate-400 text-sm">No extracted keyframes match your active filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredFrames.map(f => (
            <div
              key={f.frameId}
              onClick={() => onSelectFrame(f)}
              className="group cursor-pointer rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-cyan-500/60 overflow-hidden shadow-lg transition-all duration-300 hover:scale-[1.02] flex flex-col"
            >
              {/* Frame Image Container */}
              <div className="relative aspect-video bg-black/60 overflow-hidden">
                <img
                  src={f.frameUrl}
                  alt={f.caption}
                  onError={(e) => {
                    // Fallback to placeholder if frame image not found
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Badges Overlay */}
                <div className="absolute top-2 left-2 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-950/80 text-cyan-400 border border-cyan-500/30 backdrop-blur-md">
                    {f.sceneId.toUpperCase()}
                  </span>
                  {f.isCentroid && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/80 text-white backdrop-blur-md">
                      CENTROID
                    </span>
                  )}
                </div>

                <div className="absolute top-2 right-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-black/70 text-slate-300 backdrop-blur-md flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5 text-slate-400" />
                    {f.timestampStr}
                  </span>
                </div>

                {/* Hover Inspect Pill */}
                <div className="absolute inset-0 bg-cyan-950/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                  <span className="px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/40">
                    <Eye className="w-3.5 h-3.5" />
                    Inspect Forensic Frame
                  </span>
                </div>
              </div>

              {/* Card Meta Content */}
              <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-semibold text-slate-300 line-clamp-1">
                      {f.actionSummary || f.primaryActor}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                      f.verdict === 'supported'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : f.verdict === 'unsupported'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {f.verdict === 'supported' ? 'VERIFIED' : f.verdict === 'unsupported' ? 'HALLUCINATION' : 'UNCERTAIN'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {f.caption}
                  </p>
                </div>

                {/* Object Tags */}
                {f.objects && f.objects.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1 border-t border-slate-800/60">
                    {f.objects.slice(0, 3).map((obj, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-slate-800/80 text-slate-300">
                        <Tag className="w-2.5 h-2.5 text-cyan-400" />
                        {obj}
                      </span>
                    ))}
                    {f.objects.length > 3 && (
                      <span className="text-[10px] text-slate-500 self-center">
                        +{f.objects.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};
