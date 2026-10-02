import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle, ShieldCheck, Film, Info } from 'lucide-react';
import { VerdictBadge } from './Badge';
import type { VerificationVerdict } from '../types';

interface FrameInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  frameFiles: string[];
  initialFrameIndex?: number;
  claimText: string;
  verdict?: VerificationVerdict;
  sceneId?: string;
  timestamp?: string;
}

export const FrameInspectorModal: React.FC<FrameInspectorModalProps> = ({
  isOpen,
  onClose,
  frameFiles,
  initialFrameIndex = 0,
  claimText,
  verdict,
  sceneId = 'scene_002',
  timestamp = '00:08 - 00:11',
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialFrameIndex);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showGrid, setShowGrid] = useState(true);

  if (!isOpen || frameFiles.length === 0) return null;

  const currentFrame = frameFiles[currentIndex] || frameFiles[0];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % frameFiles.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + frameFiles.length) % frameFiles.length);
  };

  // Generate deterministic frame visual elements based on frame name
  const isBrokenGlassFrame = currentFrame.includes('010') || currentFrame.includes('011');
  const isFallingFrame = currentFrame.includes('008') || currentFrame.includes('009');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-5xl bg-slate-950 border border-slate-700 rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded bg-indigo-950/80 border border-indigo-700/60 text-indigo-400">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-slate-100">
                  FRAME EVIDENCE INSPECTOR
                </span>
                <span className="font-mono text-xs text-indigo-300 px-2 py-0.5 rounded bg-indigo-950 border border-indigo-800/70">
                  {currentFrame}
                </span>
                <span className="font-mono text-xs text-slate-400">
                  ({currentIndex + 1} of {frameFiles.length})
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Scene: <span className="text-slate-200">{sceneId}</span> | Window: <span className="text-slate-200">{timestamp}</span> | Resolution: 1920x1080 (30fps FFmpeg)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`px-2 py-1 text-xs font-mono rounded border cursor-pointer ${
                showGrid
                  ? 'bg-indigo-950 border-indigo-700 text-indigo-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
              title="Toggle optical coordinate inspection grid"
            >
              Grid Overlay
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(1, z === 1 ? 1.5 : 1))}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
              title="Zoom Frame"
            >
              {zoomLevel > 1 ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-400 border border-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Content: Side by side Frame view + Evidence report */}
        <div className="grid grid-cols-1 lg:grid-cols-12 overflow-y-auto flex-1 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
          {/* Left: Frame Display Canvas */}
          <div className="lg:col-span-7 p-4 bg-slate-950 flex flex-col items-center justify-center select-none">
            <div className="relative w-full aspect-video rounded border border-slate-800 bg-slate-900 overflow-hidden flex items-center justify-center">
              {/* Synthetic Visual Representation of the Video Frame */}
              <div
                className="w-full h-full relative transition-transform duration-200 flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900"
                style={{ transform: `scale(${zoomLevel})` }}
              >
                {/* Visual Simulation of Scene Content */}
                <div className="absolute inset-0 flex flex-col justify-between p-6">
                  {/* Scene Header Watermark */}
                  <div className="flex justify-between items-start">
                    <div className="font-mono text-[11px] text-slate-500 bg-black/60 px-2 py-1 rounded border border-slate-800">
                      RAW_KEYFRAME: {currentFrame} | PTS: {(currentIndex * 1.8 + 7.8).toFixed(2)}s
                    </div>
                    <div className="font-mono text-[11px] text-emerald-400 bg-emerald-950/80 px-2 py-1 rounded border border-emerald-800">
                      FFMPEG_EXTRACT: CRC32_OK
                    </div>
                  </div>

                  {/* Synthetic Visual Target / Object Detection Bounding Box */}
                  <div className="self-center my-auto flex flex-col items-center">
                    {isBrokenGlassFrame ? (
                      <div className="relative p-6 border-2 border-dashed border-emerald-400/80 rounded bg-emerald-950/20 backdrop-blur-xs flex flex-col items-center">
                        <span className="absolute -top-3 left-2 px-1.5 py-0.5 bg-emerald-900 border border-emerald-600 text-emerald-200 font-mono text-[10px] font-bold">
                          DETECTION: GLASS_SHATTER_FRAGMENTS (conf: 0.94)
                        </span>
                        <div className="w-24 h-16 border-b-4 border-emerald-400 flex items-end justify-center gap-1 py-1">
                          <span className="w-2 h-4 bg-emerald-300/80 transform rotate-12"></span>
                          <span className="w-3 h-2 bg-emerald-400/90 transform -rotate-45"></span>
                          <span className="w-1.5 h-3 bg-emerald-200/70 transform rotate-6"></span>
                          <span className="w-4 h-2 bg-emerald-400 transform rotate-45"></span>
                        </div>
                        <span className="text-[11px] font-mono text-emerald-300 mt-2">
                          IMPACT POINT (Z-AXIS 0.0m TILE FLOOR)
                        </span>
                      </div>
                    ) : isFallingFrame ? (
                      <div className="relative p-6 border-2 border-cyan-400/80 rounded bg-cyan-950/20 flex flex-col items-center">
                        <span className="absolute -top-3 left-2 px-1.5 py-0.5 bg-cyan-900 border border-cyan-600 text-cyan-200 font-mono text-[10px] font-bold">
                          DETECTION: REAGENT_BEAKER_TRAJECTORY (conf: 0.96)
                        </span>
                        <div className="w-16 h-20 border-2 border-cyan-300/80 rounded-sm flex items-center justify-center bg-cyan-500/10">
                          <span className="text-[10px] font-mono text-cyan-200">250ml PYREX</span>
                        </div>
                        <span className="text-[10px] font-mono text-cyan-300 mt-1">
                          VELOCITY: -2.4 m/s (DOWNWARD FREEFALL)
                        </span>
                      </div>
                    ) : (
                      <div className="relative p-6 border border-slate-700 rounded bg-slate-900/50 flex flex-col items-center">
                        <span className="font-mono text-xs text-slate-300">
                          STATIONARY WORKSTATION GEOMETRY
                        </span>
                        <span className="text-[11px] font-mono text-slate-500">
                          Optical feature track stable
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Frame Footer Overlay */}
                  <div className="flex justify-between items-end font-mono text-[10px] text-slate-400 bg-black/60 px-2 py-1 rounded">
                    <span>EXPOSURE: 1/250s | ISO 400</span>
                    <span>VERITAS VERIFICATION SUITE</span>
                  </div>
                </div>

                {/* Optional Grid Overlay */}
                {showGrid && (
                  <div
                    className="absolute inset-0 pointer-events-none opacity-25"
                    style={{
                      backgroundImage:
                        'linear-gradient(to right, #6366f1 1px, transparent 1px), linear-gradient(to bottom, #6366f1 1px, transparent 1px)',
                      backgroundSize: '40px 40px',
                    }}
                  />
                )}
              </div>
            </div>

            {/* Frame Carousel Stepper Controls */}
            <div className="w-full flex items-center justify-between mt-3 px-2">
              <button
                onClick={handlePrev}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-mono border border-slate-800 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Previous Frame
              </button>

              <div className="flex items-center gap-1.5">
                {frameFiles.map((file, idx) => (
                  <button
                    key={file}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-7 h-7 rounded text-xs font-mono flex items-center justify-center border transition-colors cursor-pointer ${
                      currentIndex === idx
                        ? 'bg-indigo-600 border-indigo-400 text-white font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-mono border border-slate-800 cursor-pointer"
              >
                Next Frame <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right: Evidence Cross-Reference Details */}
          <div className="lg:col-span-5 p-5 bg-slate-900/40 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  Target Causal Claim
                </span>
                <p className="mt-1 text-sm font-medium text-slate-100 p-2.5 rounded bg-slate-950 border border-slate-800 leading-relaxed">
                  "{claimText}"
                </p>
              </div>

              {verdict && (
                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400">Verification Verdict</span>
                    <VerdictBadge verdict={verdict.verdict} size="md" />
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Agent Confidence:</span>
                    <span className="text-emerald-400 font-bold">
                      {(verdict.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-850">
                    <span className="text-[11px] font-mono text-slate-400 block mb-1">
                      Visual Grounding Reasoning:
                    </span>
                    <p className="text-xs text-slate-300 font-sans leading-relaxed bg-slate-900/60 p-2 rounded border border-slate-800">
                      {verdict.reasoning}
                    </p>
                  </div>
                </div>
              )}

              {/* Extraction Audit Trail */}
              <div className="p-3 rounded bg-slate-950 border border-slate-800/80 font-mono text-xs space-y-1.5">
                <div className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">
                  Evidence Citation Metadata
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">Extracted Keyframe:</span>
                  <span>{currentFrame}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">Citation Range:</span>
                  <span>{frameFiles[0]} - {frameFiles[frameFiles.length - 1]}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">Hash Checksum:</span>
                  <span className="text-indigo-400">sha256:d8a9...b41c</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">Pipeline Stage:</span>
                  <span className="text-emerald-400">Stage 4 (Verification)</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={onClose}
                className="w-full py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-medium border border-slate-700 cursor-pointer"
              >
                Close Evidence Inspector
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
