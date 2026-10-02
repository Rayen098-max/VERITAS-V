import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import {
  BarChart3,
  Award,
  Database,
  Search,
  BookOpen,
  Filter,
  CheckCircle2,
  TrendingUp,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { BENCHMARK_SCORES, MODEL_BENCHMARK_COMPARISON } from '../data/mockData';

export const BenchmarkPage: React.FC = () => {
  const [selectedDataset, setSelectedDataset] = useState<'MSR-VTT' | 'ActivityNet'>('MSR-VTT');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredScores = BENCHMARK_SCORES.filter(
    (record) =>
      record.dataset === selectedDataset &&
      (record.video_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.ground_truth_reference.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Calculate dataset averages
  const avgBleu = (
    filteredScores.reduce((acc, curr) => acc + curr.bleu_4, 0) / (filteredScores.length || 1)
  ).toFixed(3);
  const avgRouge = (
    filteredScores.reduce((acc, curr) => acc + curr.rouge_l, 0) / (filteredScores.length || 1)
  ).toFixed(3);
  const avgMeteor = (
    filteredScores.reduce((acc, curr) => acc + curr.meteor, 0) / (filteredScores.length || 1)
  ).toFixed(3);

  // Radar Chart Data format
  const radarData = [
    { metric: 'BLEU-4', Mock: 0.18, Qwen: 0.36, 'GPT-4o': 0.42 },
    { metric: 'ROUGE-L', Mock: 0.32, Qwen: 0.58, 'GPT-4o': 0.65 },
    { metric: 'METEOR', Mock: 0.22, Qwen: 0.42, 'GPT-4o': 0.47 },
    { metric: 'Hallucination Catch', Mock: 0.42, Qwen: 0.81, 'GPT-4o': 0.94 },
    { metric: 'Causal Grounding', Mock: 0.35, Qwen: 0.72, 'GPT-4o': 0.91 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-indigo-400">
          <BarChart3 className="w-3.5 h-3.5" />
          <span>BENCHMARK EVALUATION ENGINE (evaluate_captions.py)</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 mt-1">
          Quantitative Vision-Language Benchmarking
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Evaluating VERITAS causal narratives against ground-truth references from MSR-VTT Test-1K and ActivityNet Captions.
        </p>
      </div>

      {/* Dataset Selector Tabs & Summary Gauges */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono text-slate-400 mr-1">Active Dataset:</span>
          <button
            onClick={() => setSelectedDataset('MSR-VTT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              selectedDataset === 'MSR-VTT'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
            }`}
          >
            MSR-VTT (Test 1K Split)
          </button>
          <button
            onClick={() => setSelectedDataset('ActivityNet')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              selectedDataset === 'ActivityNet'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
            }`}
          >
            ActivityNet Captions
          </button>
        </div>

        {/* Dataset Aggregate Scores Readout */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded bg-slate-900 border border-slate-800 text-xs font-mono">
            <span className="text-slate-500">Mean BLEU-4: </span>
            <strong className="text-indigo-400">{avgBleu}</strong>
          </div>
          <div className="px-3 py-1.5 rounded bg-slate-900 border border-slate-800 text-xs font-mono">
            <span className="text-slate-500">Mean ROUGE-L: </span>
            <strong className="text-cyan-400">{avgRouge}</strong>
          </div>
          <div className="px-3 py-1.5 rounded bg-slate-900 border border-slate-800 text-xs font-mono">
            <span className="text-slate-500">Mean METEOR: </span>
            <strong className="text-emerald-400">{avgMeteor}</strong>
          </div>
        </div>
      </div>

      {/* Visual Charts Grid: Bar Chart + Radar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Backend Model Comparison Bar Chart */}
        <div className="lg:col-span-7 p-5 rounded-lg bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
              Metric Scores by Pluggable Backend
            </span>
            <span className="text-[11px] font-mono text-slate-500">Higher is better</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={MODEL_BENCHMARK_COMPARISON}
                margin={{ top: 10, right: 20, left: -10, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="backend"
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  interval={0}
                  angle={-10}
                  textAnchor="end"
                />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 0.8]} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#030712',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontFamily: 'JetBrains Mono',
                    fontSize: '11px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'JetBrains Mono' }} />
                <Bar dataKey="bleu_4" name="BLEU-4" fill="#6366f1" radius={[3, 3, 0, 0]} />
                <Bar dataKey="rouge_l" name="ROUGE-L" fill="#06b6d4" radius={[3, 3, 0, 0]} />
                <Bar dataKey="meteor" name="METEOR" fill="#10b981" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Multi-Dimensional Radar Chart */}
        <div className="lg:col-span-5 p-5 rounded-lg bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
              Multi-Agent Capability Radar
            </span>
            <span className="text-[11px] font-mono text-slate-500">Normalized [0 - 1.0]</span>
          </div>

          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart outerRadius={90} data={radarData}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="metric" stroke="#94a3b8" fontSize={10} />
                <PolarRadiusAxis angle={30} domain={[0, 1]} stroke="#475569" fontSize={9} />
                <Radar name="Mock" dataKey="Mock" stroke="#64748b" fill="#64748b" fillOpacity={0.2} />
                <Radar name="Qwen2.5-VL" dataKey="Qwen" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} />
                <Radar name="GPT-4o + VERITAS" dataKey="GPT-4o" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
                <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'JetBrains Mono' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Ground Truth Comparison Table */}
      <section className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-base font-bold text-slate-200 font-mono flex items-center gap-2">
            <span>Per-Video Reference Evaluation Log</span>
            <span className="text-xs text-slate-500">({filteredScores.length} clips)</span>
          </h2>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search by video ID or caption..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-md pl-9 pr-3 py-1.5 text-xs font-mono text-slate-200 w-64 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-900 overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                  <th className="p-3">Video ID</th>
                  <th className="p-3">Ground Truth Reference</th>
                  <th className="p-3">VERITAS Synthesized Narrative</th>
                  <th className="p-3 text-center">BLEU-4</th>
                  <th className="p-3 text-center">ROUGE-L</th>
                  <th className="p-3 text-center">METEOR</th>
                  <th className="p-3 text-center">Hallucination</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-xs font-mono">
                {filteredScores.map((row) => (
                  <tr key={row.video_id} className="hover:bg-slate-850/60 transition-colors">
                    <td className="p-3 font-bold text-indigo-300 whitespace-nowrap">
                      {row.video_id}
                    </td>
                    <td className="p-3 text-slate-400 font-sans max-w-xs">
                      "{row.ground_truth_reference}"
                    </td>
                    <td className="p-3 text-slate-200 font-sans max-w-sm">
                      "{row.generated_narrative}"
                    </td>
                    <td className="p-3 text-center font-bold text-indigo-400">
                      {row.bleu_4.toFixed(3)}
                    </td>
                    <td className="p-3 text-center font-bold text-cyan-400">
                      {row.rouge_l.toFixed(3)}
                    </td>
                    <td className="p-3 text-center font-bold text-emerald-400">
                      {row.meteor.toFixed(3)}
                    </td>
                    <td className="p-3 text-center text-slate-300">
                      {(row.hallucination_rate * 100).toFixed(0)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Academic Metric Definitions Reference Box */}
      <section className="p-5 rounded-lg border border-slate-800 bg-slate-900/40 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <h4 className="font-bold text-slate-200 text-xs font-mono mb-1 text-indigo-400">
            BLEU-4 (Bilingual Evaluation Understudy)
          </h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Measures modified 4-gram precision between generated narrative and human references, penalizing candidate strings that are too short via exponential brevity penalty (BP).
          </p>
        </div>

        <div>
          <h4 className="font-bold text-slate-200 text-xs font-mono mb-1 text-cyan-400">
            ROUGE-L (Recall-Oriented Understudy)
          </h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Calculates Longest Common Subsequence (LCS) statistics to reward sentence-level word-order preservation and temporal story progression.
          </p>
        </div>

        <div>
          <h4 className="font-bold text-slate-200 text-xs font-mono mb-1 text-emerald-400">
            METEOR (Explicit Word Alignment)
          </h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Harmonic mean of unigram precision and recall using exact, stem, and WordNet synonym matches, incorporating fragmentation penalty for chunk order.
          </p>
        </div>
      </section>
    </div>
  );
};
