import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  ShieldCheck,
  Layers,
  Eye,
  Sparkles,
  Database,
} from 'lucide-react';
import Container from '../components/Container';
import IconTile from '../components/IconTile';
import { usePageMeta } from '../hooks/usePageMeta';
import { fadeUpVariant, staggerContainerVariant } from '../utils/motion';

// Count-up helper component
function StatCountUp({ value, suffix = '', decimals = 0 }: { value: number; suffix?: string; decimals?: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const duration = 1600;
          const startTime = performance.now();

          const step = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            setDisplayValue(easeProgress * value);

            if (progress < 1) {
              requestAnimationFrame(step);
            } else {
              setDisplayValue(value);
            }
          };

          requestAnimationFrame(step);
        }
      },
      { threshold: 0.2 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, hasAnimated]);

  return (
    <span ref={ref} className="tabular-nums font-black text-2xl sm:text-3xl tracking-tight text-[var(--text-primary)]">
      {decimals > 0 ? displayValue.toFixed(decimals) : Math.round(displayValue)}
      {suffix}
    </span>
  );
}

export default function HeroLanding() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const [heroMode, setHeroMode] = useState<'dark' | 'light'>('dark');
  const [activeClaimIndex, setActiveClaimIndex] = useState(2); // Default to the hallucinated claim to showcase product
  const [videoLoaded, setVideoLoaded] = useState(false);

  usePageMeta({
    title: 'Explainable Agentic Video Hallucination Verification',
    description: 'Transform passive video captioning into audited causal reasoning with pixel-grounded hallucination defense.',
  });

  // Parallax scroll controls
  const { scrollY } = useScroll();
  const heroTextY = useTransform(scrollY, [0, 500], [0, 45]);
  const heroVideoBlur = useTransform(scrollY, [0, 400], ['blur(0px)', 'blur(10px)']);
  const heroVideoOpacity = useTransform(scrollY, [0, 450], [0.38, 0.08]);

  // CTA button magnetic effect
  const [btnOffset, setBtnOffset] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (shouldReduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.18;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.18;
    setBtnOffset({ x, y });
  };
  const handleMouseLeave = () => {
    setBtnOffset({ x: 0, y: 0 });
    if (videoRef.current) {
      videoRef.current.playbackRate = 1.15;
    }
  };
  const handleMouseEnter = () => {
    if (videoRef.current && !shouldReduceMotion) {
      videoRef.current.playbackRate = 1.6;
    }
  };

  // Sample Interactive Claim Data
  const sampleClaims = [
    {
      id: 'claim_1',
      claimText: 'A researcher in dark attire stands at the center of an illuminated stage.',
      verdict: 'supported' as const,
      confidence: 96,
      timestamp: '00:00 - 00:20',
      frameFile: '/frames/my_video_frames/my_video_scene_001_start.jpg',
      evidenceRationale: 'High-confidence pixel grounding: Speaker presence and stage illumination verified against keyframe 0.0s.',
      hallucinated: false,
    },
    {
      id: 'claim_2',
      claimText: 'The speaker addresses the audience while holding a metallic handheld microphone.',
      verdict: 'supported' as const,
      confidence: 94,
      timestamp: '00:20 - 00:23',
      frameFile: '/frames/my_video_frames/my_video_scene_002_t2.jpg',
      evidenceRationale: 'Extracted keyframe pixel confirmation: Metallic microphone clearly resolved in speaker\'s right hand.',
      hallucinated: false,
    },
    {
      id: 'claim_3',
      claimText: 'The speaker holds a digital laser pointer while gesturing towards a slide projection.',
      verdict: 'contradicted' as const,
      confidence: 32,
      timestamp: '00:23 - 00:52',
      frameFile: '/frames/my_video_frames/my_video_scene_003_t3.jpg',
      evidenceRationale: 'Hallucination defense alert: No digital laser pointer found in physical frame. The speaker is holding a microphone and making empty-hand gestures.',
      hallucinated: true,
    },
  ];

  const currentClaim = sampleClaims[activeClaimIndex];

  const datasetList = [
    'MSR-VTT',
    'VideoHallucer',
    'NExT-QA',
    'ActivityNet Captions',
    'Charades-STA',
    'Ego4D Forensic Benchmark',
  ];

  return (
    <div className="relative w-full flex flex-col items-center select-none overflow-x-hidden">
      {/* =========================================================================
          SECTION 1: HERO VIEWPORT (CINEMATIC DUAL-THEME SPIRAL)
      ========================================================================= */}
      <section
        className={`relative w-full min-h-[calc(100vh-96px)] flex flex-col justify-between items-center px-4 sm:px-6 py-8 overflow-hidden transition-colors duration-300 ${
          heroMode === 'dark' ? 'bg-[#0A0A0B] text-white' : 'bg-[#FAFAFB] text-black'
        }`}
      >
        {/* Optical Illusion Video Background with Scrim and Noise */}
        <motion.div
          style={{ filter: heroVideoBlur, opacity: heroVideoOpacity }}
          className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden"
        >
          {!shouldReduceMotion && (
            <video
              ref={videoRef}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster="/spiral-poster.jpg"
              onCanPlay={() => {
                setVideoLoaded(true);
                if (videoRef.current) videoRef.current.playbackRate = 1.15;
              }}
              className={`w-full h-full object-cover grayscale contrast-125 transition-opacity duration-700 ${
                videoLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <source src="/spiral.webm" type="video/webm" />
              <source src="/spiral.mp4" type="video/mp4" />
            </video>
          )}

          {/* Fallback poster if reduced motion or video loading */}
          {shouldReduceMotion && (
            <img
              src="/spiral-poster.jpg"
              alt="VERITAS-V Optical Illusion Motif"
              className="w-full h-full object-cover grayscale opacity-25"
            />
          )}

          {/* Central Radial Glow & Contrast Scrim */}
          <div
            className={`absolute inset-0 pointer-events-none ${
              heroMode === 'dark'
                ? 'bg-[radial-gradient(ellipse_at_center,rgba(109,94,245,0.18)_0%,rgba(10,10,11,0.85)_65%,#0A0A0B_100%)]'
                : 'bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.88)_0%,rgba(245,245,247,0.7)_60%,#FAFAFB_100%)]'
            }`}
          />

          {/* Subtle 2% Noise Texture to prevent gradient banding */}
          <div
            className="absolute inset-0 opacity-[0.035] pointer-events-none mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          />
        </motion.div>

        {/* Concentric Orbit Rings Motif */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <div className="w-[320px] h-[320px] rounded-full border border-white/10 dark:border-white/15" />
          <div className="w-[500px] h-[500px] rounded-full border border-white/8 dark:border-white/10" />
          <div className="w-[720px] h-[720px] rounded-full border border-white/6 dark:border-white/8" />
          <div className="w-[980px] h-[980px] rounded-full border border-white/4 dark:border-white/6" />
        </div>

        {/* Hero Theme Toggle Pill (Top Right of Hero) */}
        <div className="relative z-10 w-full max-w-5xl flex justify-end">
          <div className="inline-flex items-center gap-1 p-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-mono">
            <button
              type="button"
              onClick={() => setHeroMode('dark')}
              className={`px-2.5 py-0.5 rounded-full transition-colors cursor-pointer ${
                heroMode === 'dark' ? 'bg-[#6D5EF5] text-white font-semibold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Cinematic Dark
            </button>
            <button
              type="button"
              onClick={() => setHeroMode('light')}
              className={`px-2.5 py-0.5 rounded-full transition-colors cursor-pointer ${
                heroMode === 'light' ? 'bg-white text-black font-semibold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Editorial Light
            </button>
          </div>
        </div>

        {/* Main Center Hero Block with Smooth Motion Parallax */}
        <motion.div
          style={{ y: heroTextY }}
          variants={staggerContainerVariant}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center justify-center my-auto space-y-6 pt-4"
        >
          {/* Eyebrow Chip */}
          <motion.div variants={fadeUpVariant}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 dark:bg-white/10 backdrop-blur-md border border-white/20 text-xs font-mono tracking-wide text-neutral-300">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6D5EF5] animate-pulse" />
              <span>Multi-agent video verification · v1.0</span>
            </div>
          </motion.div>

          {/* Refined Headline */}
          <motion.h1
            variants={fadeUpVariant}
            className={`text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.12] max-w-3xl ${
              heroMode === 'dark' ? 'text-white' : 'text-neutral-900'
            }`}
          >
            Explainable Agentic <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6D5EF5] via-[#8F82FF] to-[#10B981]">
              Video Hallucination
            </span>{' '}
            Verification
          </motion.h1>

          {/* Subtitle with Guaranteed AA Contrast */}
          <motion.p
            variants={fadeUpVariant}
            className={`text-sm sm:text-base max-w-xl leading-relaxed ${
              heroMode === 'dark' ? 'text-neutral-300 font-normal' : 'text-neutral-700 font-medium'
            }`}
          >
            Auditing video foundation models with sub-second temporal perception, causal reasoning dependency graphs, and frame-grounded pixel verification.
          </motion.p>

          {/* Primary & Secondary Action CTAs */}
          <motion.div variants={fadeUpVariant} className="flex flex-row items-center justify-center gap-3 pt-2">
            <motion.button
              type="button"
              onClick={() => navigate('/new-analysis')}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onMouseEnter={handleMouseEnter}
              style={{ x: btnOffset.x, y: btnOffset.y }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="relative px-6 sm:px-7 py-3 rounded-full bg-[#6D5EF5] hover:bg-[#5B4BE2] text-white font-semibold text-xs sm:text-sm transition-all duration-200 shadow-[0_0_24px_rgba(109,94,245,0.4)] hover:shadow-[0_0_32px_rgba(109,94,245,0.65)] flex items-center justify-center gap-2 cursor-pointer group overflow-hidden"
            >
              {/* Subtle button shine */}
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <span>Verify a Video</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </motion.button>

            <button
              type="button"
              onClick={() => navigate('/pipeline')}
              className={`px-5 sm:px-6 py-3 rounded-full font-semibold text-xs sm:text-sm border transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer backdrop-blur-md ${
                heroMode === 'dark'
                  ? 'bg-white/10 hover:bg-white/15 text-white border-white/20 hover:border-white/40'
                  : 'bg-white/80 hover:bg-white text-neutral-800 border-neutral-300 hover:border-neutral-500 shadow-xs'
              }`}
            >
              <span>See the Framework</span>
            </button>
          </motion.div>

          {/* 3 Core Grounding Pillars (Clean Horizontal Glass Row) */}
          <motion.div
            variants={fadeUpVariant}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 w-full max-w-3xl"
          >
            {/* Pillar 1 */}
            <div
              className={`p-3.5 rounded-[12px] border backdrop-blur-xl text-left transition-all hover:scale-[1.02] ${
                heroMode === 'dark'
                  ? 'bg-neutral-900/60 border-white/15 text-white'
                  : 'bg-white/85 border-neutral-200 text-neutral-900 shadow-xs'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <IconTile icon={Eye} variant="accent" size="sm" />
                <span className="font-bold text-xs">Visual Grounding</span>
              </div>
              <p className={`text-[11px] leading-snug ${heroMode === 'dark' ? 'text-neutral-400' : 'text-neutral-600'}`}>
                Sub-second scene segmentation and keyframe extraction down to physical pixels.
              </p>
            </div>

            {/* Pillar 2 */}
            <div
              className={`p-3.5 rounded-[12px] border backdrop-blur-xl text-left transition-all hover:scale-[1.02] ${
                heroMode === 'dark'
                  ? 'bg-neutral-900/60 border-white/15 text-white'
                  : 'bg-white/85 border-neutral-200 text-neutral-900 shadow-xs'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <IconTile icon={Layers} variant="supported" size="sm" />
                <span className="font-bold text-xs">Causal Chains</span>
              </div>
              <p className={`text-[11px] leading-snug ${heroMode === 'dark' ? 'text-neutral-400' : 'text-neutral-600'}`}>
                Inter-scene dependency graphs tagging causal relations and disjoint events.
              </p>
            </div>

            {/* Pillar 3 */}
            <div
              className={`p-3.5 rounded-[12px] border backdrop-blur-xl text-left transition-all hover:scale-[1.02] ${
                heroMode === 'dark'
                  ? 'bg-neutral-900/60 border-white/15 text-white'
                  : 'bg-white/85 border-neutral-200 text-neutral-900 shadow-xs'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <IconTile icon={ShieldCheck} variant="contradicted" size="sm" />
                <span className="font-bold text-xs">Hallucination Defense</span>
              </div>
              <p className={`text-[11px] leading-snug ${heroMode === 'dark' ? 'text-neutral-400' : 'text-neutral-600'}`}>
                Cross-examines each causal claim against raw frame pixels to purge assertions.
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Live Animated Stats Row & Slow Infinite Dataset Marquee */}
        <div className="relative z-10 w-full max-w-5xl mx-auto pt-6 border-t border-white/10 dark:border-white/15 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center">
              <StatCountUp value={94.2} suffix="%" decimals={1} />
              <span className={`text-[11px] font-mono mt-0.5 ${heroMode === 'dark' ? 'text-neutral-400' : 'text-neutral-600'}`}>
                Hallucination Catch Rate
              </span>
            </div>
            <div className="flex flex-col items-center">
              <StatCountUp value={4} suffix=" Datasets" />
              <span className={`text-[11px] font-mono mt-0.5 ${heroMode === 'dark' ? 'text-neutral-400' : 'text-neutral-600'}`}>
                MSR-VTT · VideoHallucer · NExT-QA
              </span>
            </div>
            <div className="flex flex-col items-center">
              <StatCountUp value={0.931} decimals={3} />
              <span className={`text-[11px] font-mono mt-0.5 ${heroMode === 'dark' ? 'text-neutral-400' : 'text-neutral-600'}`}>
                Causal Graph Confidence
              </span>
            </div>
          </div>

          {/* Dataset Name Infinite Marquee */}
          <div className="relative w-full overflow-hidden py-1 border-t border-white/5 flex items-center">
            <div className="flex items-center gap-8 animate-[marquee_24s_linear_infinite] whitespace-nowrap text-xs font-mono text-neutral-400 select-none">
              {[...datasetList, ...datasetList, ...datasetList].map((name, i) => (
                <div key={i} className="inline-flex items-center gap-2">
                  <Database className="w-3 h-3 text-[#6D5EF5]" />
                  <span>{name}</span>
                  <span className="text-neutral-600">·</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: CLAIM-TO-EVIDENCE-TO-VERDICT INTERACTIVE DEMO CARD
      ========================================================================= */}
      <section className="w-full py-16 bg-[var(--bg-primary)] border-b border-[var(--border-default)]">
        <Container size="default">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#6D5EF5]/10 border border-[#6D5EF5]/20 text-[#6D5EF5] text-xs font-mono font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interactive Verification Audit</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
              From Model Claim to Physical Evidence
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2">
              Click any assertion to inspect how the multi-agent pipeline extracts raw video frames to verify truth and flag hallucinations.
            </p>
          </div>

          {/* Interactive Inspection Workspace */}
          <div className="max-w-4xl mx-auto rounded-[16px] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-md overflow-hidden grid grid-cols-1 md:grid-cols-12">
            {/* Left: Claim Sequence Selector */}
            <div className="md:col-span-7 p-6 border-b md:border-b-0 md:border-r border-[var(--border-default)] space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-[var(--text-muted)]">
                <span>AUDITED NARRATIVE SENTENCE</span>
                <span className="text-[#6D5EF5]">SAMPLE CLIP: my_video.mp4</span>
              </div>

              <div className="p-3.5 rounded-[12px] bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs sm:text-sm text-[var(--text-primary)] leading-relaxed">
                "A speaker delivers a presentation on stage, addresses the audience while holding a microphone, and{' '}
                <span className="text-[#F43F5E] line-through font-semibold bg-[#F43F5E]/10 px-1 rounded">
                  holds a digital laser pointer while gesturing towards slides
                </span>
                ."
              </div>

              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-mono text-[var(--text-muted)] uppercase tracking-wider block">
                  Select Claim To Audit:
                </span>
                {sampleClaims.map((claim, idx) => {
                  const isSelected = idx === activeClaimIndex;
                  return (
                    <button
                      key={claim.id}
                      type="button"
                      onClick={() => setActiveClaimIndex(idx)}
                      className={`w-full p-3 rounded-[10px] text-left transition-all border flex items-start justify-between gap-3 cursor-pointer ${
                        isSelected
                          ? 'bg-[var(--bg-surface)] border-[#6D5EF5] shadow-xs'
                          : 'bg-[var(--bg-secondary)] border-transparent hover:border-[var(--border-default)]'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-[var(--text-muted)]">
                            CLAIM #{idx + 1}
                          </span>
                          <span className="text-[10px] font-mono text-[var(--text-muted)]">
                            [{claim.timestamp}]
                          </span>
                        </div>
                        <p
                          className={`text-xs ${
                            claim.hallucinated
                              ? 'line-through text-[#F43F5E] font-medium'
                              : 'text-[var(--text-primary)]'
                          }`}
                        >
                          {claim.claimText}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 px-2 py-0.5 rounded-[6px] text-[10px] font-mono font-semibold uppercase tracking-wider ${
                          claim.verdict === 'supported'
                            ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30'
                            : 'bg-[#F43F5E]/15 text-[#F43F5E] border border-[#F43F5E]/30'
                        }`}
                      >
                        {claim.verdict === 'supported' ? 'Supported' : 'Contradicted'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Keyframe Evidence & Verdict Rationale */}
            <div className="md:col-span-5 p-6 bg-[var(--bg-secondary)] flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-[var(--text-muted)] mb-2">
                  <span>GROUNDING EVIDENCE</span>
                  <span className="text-[#10B981] font-semibold">1024px Raw Frame</span>
                </div>

                {/* Evidence Image Thumbnail */}
                <div className="relative rounded-[10px] overflow-hidden border border-[var(--border-default)] bg-black aspect-video flex items-center justify-center group shadow-xs">
                  <img
                    src={currentClaim.frameFile}
                    alt="Frame Evidence"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-[4px] bg-black/75 backdrop-blur-md text-white font-mono text-[10px]">
                    t = {currentClaim.timestamp}
                  </div>
                  {currentClaim.hallucinated && (
                    <div className="absolute inset-0 bg-[#F43F5E]/10 border-2 border-[#F43F5E] flex items-center justify-center">
                      <span className="px-2.5 py-1 rounded bg-[#F43F5E] text-white text-[11px] font-mono font-bold tracking-wide uppercase shadow-md">
                        Hallucination Purged
                      </span>
                    </div>
                  )}
                </div>

                {/* Verdict Explainer */}
                <div className="mt-4 p-3 rounded-[10px] bg-[var(--bg-surface)] border border-[var(--border-default)] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-[var(--text-muted)] uppercase">
                      VERDICT ANALYSIS
                    </span>
                    <span className="text-[11px] font-mono font-bold text-[#6D5EF5]">
                      Confidence: {currentClaim.confidence}%
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {currentClaim.evidenceRationale}
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)]">
                <span>VERITAS-V Deterministic Defense</span>
                <Link to="/pipeline" className="text-[#6D5EF5] hover:underline flex items-center gap-1">
                  <span>Pipeline Details</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* =========================================================================
          SECTION 3: 4-STEP "HOW IT WORKS" ROADMAP
      ========================================================================= */}
      <section className="w-full py-16 bg-[var(--bg-surface)] border-b border-[var(--border-default)]">
        <Container size="default">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono font-semibold text-[#6D5EF5] uppercase tracking-wider">
              AGENTIC PIPELINE
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight mt-1">
              How VERITAS-V Verifies Videos
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2">
              A 4-tier chain of specialized agents verifying visual veracity and causal coherence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Step 1 */}
            <div className="p-5 rounded-[16px] border border-[var(--border-default)] bg-[var(--bg-primary)] space-y-3 relative group hover:border-[#6D5EF5] transition-all">
              <div className="w-8 h-8 rounded-full bg-[#6D5EF5]/10 border border-[#6D5EF5]/30 flex items-center justify-center font-mono font-bold text-xs text-[#6D5EF5]">
                01
              </div>
              <h3 className="font-bold text-sm text-[var(--text-primary)]">
                Multi-Modal Perception
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                PySceneDetect identifies sub-second scene cuts, extracting 4 keyframes per scene, while Whisper transcribes dialogue with speaker timestamps.
              </p>
              <div className="pt-2 text-[11px] font-mono text-[var(--text-muted)]">
                Artifact: captions.json (~4.8s)
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-5 rounded-[16px] border border-[var(--border-default)] bg-[var(--bg-primary)] space-y-3 relative group hover:border-[#6D5EF5] transition-all">
              <div className="w-8 h-8 rounded-full bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-center font-mono font-bold text-xs text-[#10B981]">
                02
              </div>
              <h3 className="font-bold text-sm text-[var(--text-primary)]">
                Causal Dependency Graph
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                The causal agent infers cause-and-effect transitions across consecutive scenes, linking events into a cohesive temporal reasoning graph.
              </p>
              <div className="pt-2 text-[11px] font-mono text-[var(--text-muted)]">
                Artifact: causal.json (~1.4s)
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-5 rounded-[16px] border border-[var(--border-default)] bg-[var(--bg-primary)] space-y-3 relative group hover:border-[#6D5EF5] transition-all">
              <div className="w-8 h-8 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/30 flex items-center justify-center font-mono font-bold text-xs text-[#F59E0B]">
                03
              </div>
              <h3 className="font-bold text-sm text-[var(--text-primary)]">
                Pixel-Level Cross-Exam
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                The verification agent cross-examines each causal claim against raw frame pixels, outputting Supported, Unverified, or Contradicted verdicts.
              </p>
              <div className="pt-2 text-[11px] font-mono text-[var(--text-muted)]">
                Artifact: verification.json (~2.1s)
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-5 rounded-[16px] border border-[var(--border-default)] bg-[var(--bg-primary)] space-y-3 relative group hover:border-[#6D5EF5] transition-all">
              <div className="w-8 h-8 rounded-full bg-[#6D5EF5]/10 border border-[#6D5EF5]/30 flex items-center justify-center font-mono font-bold text-xs text-[#6D5EF5]">
                04
              </div>
              <h3 className="font-bold text-sm text-[var(--text-primary)]">
                Forensic Explainability
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Generates dual-format reports in auditable Markdown and JSON, citing exact frame paths and timestamps to guarantee mathematical reproducibility.
              </p>
              <div className="pt-2 text-[11px] font-mono text-[var(--text-muted)]">
                Artifact: explained.md (~0.5s)
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* =========================================================================
          SECTION 4: FINAL CTA BAND WITH OPTICAL MOTIF
      ========================================================================= */}
      <section className="relative w-full py-16 bg-[#0A0A0B] text-white overflow-hidden text-center select-none">
        {/* Optical Background Rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="w-[300px] h-[300px] rounded-full border border-white" />
          <div className="w-[500px] h-[500px] rounded-full border border-white" />
          <div className="w-[700px] h-[700px] rounded-full border border-white" />
        </div>

        <Container size="narrow" className="relative z-10 space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-mono text-neutral-300">
            <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Deterministic Model Audit</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Stop Guessing Video Model Hallucinations.
          </h2>

          <p className="text-xs sm:text-sm text-neutral-400 max-w-lg mx-auto leading-relaxed">
            Verify temporal reasoning, causal transitions, and physical evidence across your video generation and understanding workloads.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/new-analysis')}
              className="px-6 py-2.5 rounded-full bg-[#6D5EF5] hover:bg-[#5B4BE2] text-white font-semibold text-xs transition-transform hover:scale-105 shadow-lg shadow-[#6D5EF5]/30 cursor-pointer flex items-center gap-2"
            >
              <span>Run Verification Analysis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <Link
              to="/dashboard"
              className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-white border border-white/20 font-semibold text-xs transition-colors"
            >
              Inspect Existing Reports
            </Link>
          </div>
        </Container>
      </section>
    </div>
  );
}
