import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Plus, 
  FileVideo, 
  CheckCircle, 
  Clock, 
  ArrowRight,
  TrendingUp,
  Activity,
  Flame,
  Search,
  ArrowUpDown,
  LayoutGrid,
  Table as TableIcon
} from 'lucide-react';
import Container from '../components/Container';
import IconTile from '../components/IconTile';
import { usePageMeta } from '../hooks/usePageMeta';
import { analysisService } from '../services/analysisService';
import type { VideoAnalysis } from '../types';

export default function Dashboard() {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState<VideoAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filtering State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVerdict, setFilterVerdict] = useState<'all' | 'verified' | 'flagged'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'trust' | 'duration'>('date');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  usePageMeta({
    title: 'Operational Video Audit Dashboard',
    description: 'Real-time telemetry of processed video streams, causal inferences, and frame-grounded hallucination verification.',
  });

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await analysisService.getHistory();
        setAnalyses(history);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // Compute metrics from history
  const totalAnalyzed = analyses.length;
  const totalStatements = analyses.reduce((sum, a) => sum + (a.statementsCount || 0), 0);
  const totalVerified = analyses.reduce((sum, a) => sum + (a.verifiedCount || 0), 0);
  const totalHallucinations = analyses.reduce((sum, a) => sum + (a.hallucinationsCount || 0), 0);

  // Filter and sort items
  const filteredAnalyses = useMemo(() => {
    return analyses
      .filter((item) => {
        const matchesSearch = item.videoName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.id.toLowerCase().includes(searchQuery.toLowerCase());
        if (!matchesSearch) return false;

        if (filterVerdict === 'verified') return (item.hallucinationsCount || 0) === 0;
        if (filterVerdict === 'flagged') return (item.hallucinationsCount || 0) > 0;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'trust') return (b.trustScore || 0) - (a.trustScore || 0);
        if (sortBy === 'duration') return b.duration - a.duration;
        // Default date
        return new Date(b.dateAnalyzed).getTime() - new Date(a.dateAnalyzed).getTime();
      });
  }, [analyses, searchQuery, filterVerdict, sortBy]);

  // Relative time helper
  const getRelativeTime = (dateStr: string) => {
    try {
      const now = new Date();
      const past = new Date(dateStr);
      const diffMs = now.getTime() - past.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays > 0) return `${diffDays}d ago`;
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours > 0) return `${diffHours}h ago`;
      return 'Just now';
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <Container size="default" className="py-24 flex flex-col items-center justify-center gap-3">
        <Activity className="w-8 h-8 text-[#6D5EF5] animate-spin" />
        <p className="text-[var(--text-secondary)] text-xs font-mono tracking-wider animate-pulse">
          CALIBRATING DASHBOARD TELEMETRY...
        </p>
      </Container>
    );
  }

  return (
    <div className="w-full py-8 space-y-8 select-none">
      <Container size="default">
        {/* =========================================================================
            FLAT HEADER (NO CARD-IN-CARD BOX)
        ========================================================================= */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--border-default)] pb-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-default)] text-xs font-mono text-[var(--text-secondary)]">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span>Multi-Agent Operational Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
              Operational Video Analytics
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-2xl leading-relaxed">
              Real-time audit log of processed video streams, causal inferences, and cross-examined frame verifications.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/new-analysis')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[12px] bg-[#6D5EF5] hover:bg-[#5B4BE2] text-white font-semibold text-xs shadow-md shadow-[#6D5EF5]/20 hover:shadow-lg hover:shadow-[#6D5EF5]/30 transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Video Analysis</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            KPI CARDS ROW (HOVER LIFT + SEMANTIC ICONS + DELTAS)
        ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {/* Card 1: Videos Analyzed */}
          <div className="p-4 rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-xs flex items-start justify-between transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-[#6D5EF5]/40">
            <div className="space-y-1">
              <span className="text-xs font-medium text-[var(--text-secondary)]">Videos Analyzed</span>
              <p className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tabular-nums">{totalAnalyzed}</p>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#10B981]">
                <TrendingUp className="w-3 h-3" />
                <span>+2 this session</span>
              </span>
            </div>
            <IconTile icon={FileVideo} variant="neutral" size="md" />
          </div>

          {/* Card 2: Statements Generated */}
          <div className="p-4 rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-xs flex items-start justify-between transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-[#6D5EF5]/40">
            <div className="space-y-1">
              <span className="text-xs font-medium text-[var(--text-secondary)]">Statements Generated</span>
              <p className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tabular-nums">{totalStatements}</p>
              <span className="text-[11px] font-mono text-[var(--text-muted)]">
                Avg {totalAnalyzed > 0 ? (totalStatements / totalAnalyzed).toFixed(1) : 0} per clip
              </span>
            </div>
            <IconTile icon={Activity} variant="accent" size="md" />
          </div>

          {/* Card 3: Verified Statements (Emerald) */}
          <div className="p-4 rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-xs flex items-start justify-between transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-[#10B981]/40">
            <div className="space-y-1">
              <span className="text-xs font-medium text-[var(--text-secondary)]">Verified Ground Truth</span>
              <p className="text-2xl sm:text-3xl font-black text-[#10B981] tabular-nums">{totalVerified}</p>
              <span className="text-[11px] font-mono text-[#10B981] font-semibold">
                {totalStatements > 0 ? Math.round((totalVerified / totalStatements) * 100) : 0}% supported
              </span>
            </div>
            <IconTile icon={CheckCircle} variant="supported" size="md" />
          </div>

          {/* Card 4: Hallucinations Flagged (Rose) */}
          <div className="p-4 rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-xs flex items-start justify-between transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-[#F43F5E]/40">
            <div className="space-y-1">
              <span className="text-xs font-medium text-[var(--text-secondary)]">Hallucinations Flagged</span>
              <p className="text-2xl sm:text-3xl font-black text-[#F43F5E] tabular-nums">{totalHallucinations}</p>
              <span className="text-[11px] font-mono text-[#F43F5E] font-semibold">
                {totalStatements > 0 ? Math.round((totalHallucinations / totalStatements) * 100) : 0}% error rate
              </span>
            </div>
            <IconTile icon={Flame} variant="contradicted" size="md" />
          </div>
        </div>

        {/* =========================================================================
            TOOLBAR: SEARCH, FILTER, SORT, VIEW TOGGLE
        ========================================================================= */}
        <div className="mt-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-[12px] bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xs">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reports by filename or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-[8px] bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#6D5EF5]"
            />
          </div>

          {/* Filter & Sort Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Verdict Filter */}
            <div className="inline-flex items-center gap-1 p-0.5 rounded-[8px] bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs">
              <button
                type="button"
                onClick={() => setFilterVerdict('all')}
                className={`px-2.5 py-1 rounded-[6px] font-medium transition-colors cursor-pointer ${
                  filterVerdict === 'all'
                    ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setFilterVerdict('verified')}
                className={`px-2.5 py-1 rounded-[6px] font-medium transition-colors cursor-pointer ${
                  filterVerdict === 'verified'
                    ? 'bg-[var(--bg-surface)] text-[#10B981] shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[#10B981]'
                }`}
              >
                100% Clean
              </button>
              <button
                type="button"
                onClick={() => setFilterVerdict('flagged')}
                className={`px-2.5 py-1 rounded-[6px] font-medium transition-colors cursor-pointer ${
                  filterVerdict === 'flagged'
                    ? 'bg-[var(--bg-surface)] text-[#F43F5E] shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[#F43F5E]'
                }`}
              >
                Hallucinated
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent border-none text-xs text-[var(--text-primary)] focus:outline-none cursor-pointer"
              >
                <option value="date" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">Newest First</option>
                <option value="trust" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">Trust Score</option>
                <option value="duration" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">Duration</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="inline-flex items-center p-0.5 rounded-[8px] bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
                className={`p-1 rounded-[6px] transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                aria-label="Table view"
                className={`p-1 rounded-[6px] transition-colors cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* =========================================================================
            REPORTS DISPLAY: BALANCED GRID OR DATA TABLE
        ========================================================================= */}
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider">
              SHOWING {filteredAnalyses.length} OF {analyses.length} AUDITED RUNS
            </span>
            <Link
              to="/history"
              className="text-xs font-semibold text-[#6D5EF5] hover:underline inline-flex items-center gap-1"
            >
              <span>View Full History Table</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {filteredAnalyses.length === 0 ? (
            <div className="p-12 text-center rounded-[16px] border border-dashed border-[var(--border-default)] bg-[var(--bg-surface)]">
              <FileVideo className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2 opacity-50" />
              <p className="text-sm font-bold text-[var(--text-primary)]">No matching audit records</p>
              <p className="text-xs text-[var(--text-secondary)] mt-1 mb-4">
                No analyses match the current filter criteria "{searchQuery || filterVerdict}".
              </p>
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setFilterVerdict('all'); }}
                className="px-4 py-2 rounded-full bg-[var(--bg-secondary)] text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--border-default)]"
              >
                Reset Filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            /* Responsive 4-Column Balanced Grid with Equal Heights */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredAnalyses.map((analysis) => {
                const thumbnail =
                  analysis.scenes[0]?.frameFiles[0] ||
                  '/frames/my_video_frames/my_video_scene_001_start.jpg';

                // Determine Trust Score Badge Styling
                const trust = analysis.trustScore ?? 0;
                const trustVariant =
                  trust >= 90 ? 'supported' : trust >= 70 ? 'unverified' : 'contradicted';

                const backendName = analysis.videoName.includes('Newvideo')
                  ? 'Groq Qwen3.8-27B'
                  : analysis.videoName.includes('my_video')
                  ? 'Qwen2.5-VL'
                  : analysis.videoName.includes('sample')
                  ? 'Mock Heuristic'
                  : 'GPT-4o Vision';

                const supportedCount = analysis.verifiedCount || 0;
                const totalCount = analysis.statementsCount || 1;
                const hallucinatedCount = analysis.hallucinationsCount || 0;

                return (
                  <div
                    key={analysis.id}
                    onClick={() => navigate(`/results/${analysis.id}`)}
                    className="group rounded-[14px] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-xs hover:shadow-md hover:border-[#6D5EF5]/50 overflow-hidden flex flex-col justify-between cursor-pointer transition-all duration-200 hover:-translate-y-1"
                  >
                    {/* Thumbnail with Gradient Scrim and Badges */}
                    <div className="relative aspect-video w-full bg-neutral-900 overflow-hidden">
                      <img
                        src={thumbnail}
                        alt={analysis.videoName}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                      />

                      {/* Dark Gradient Overlay for duration chip readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                      {/* Backend Badge (Top Left) */}
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-[6px] bg-black/75 backdrop-blur-md text-neutral-300 font-mono text-[9px] border border-white/10">
                        {backendName}
                      </div>

                      {/* Trust Score Gauge Chip (Top Right) with Tooltip */}
                      <div
                        title={`Trust Score ${trust}%: Calculated as ${supportedCount} supported of ${totalCount} total claims.`}
                        className={`absolute top-2 right-2 px-2 py-0.5 rounded-full flex items-center gap-1.5 backdrop-blur-md border shadow-xs ${
                          trustVariant === 'supported'
                            ? 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/40'
                            : trustVariant === 'unverified'
                            ? 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/40'
                            : 'bg-[#F43F5E]/20 text-[#F43F5E] border-[#F43F5E]/40'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        <span className="text-[10px] font-mono font-bold">{trust}% Trust</span>
                      </div>

                      {/* Duration & Relative Time (Bottom) */}
                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] font-mono text-white">
                        <span className="flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5 opacity-80" />
                          <span>{analysis.duration}s</span>
                        </span>
                        <span className="text-neutral-300" title={analysis.dateAnalyzed}>
                          {getRelativeTime(analysis.dateAnalyzed)}
                        </span>
                      </div>
                    </div>

                    {/* Card Content Area */}
                    <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h3
                          title={analysis.videoName}
                          className="font-mono text-xs font-bold text-[var(--text-primary)] truncate group-hover:text-[#6D5EF5] transition-colors"
                        >
                          {analysis.videoName}
                        </h3>
                        <p className="text-[11px] text-[var(--text-muted)] line-clamp-1 mt-0.5">
                          {analysis.scenesCount} scenes · {totalCount} claims cross-examined
                        </p>
                      </div>

                      {/* Segmented Mini Progress Bar: Proportion Supported / Contradicted */}
                      <div className="space-y-1.5 pt-1 border-t border-[var(--border-subtle)]">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-[var(--text-secondary)] font-medium">
                            {supportedCount} of {totalCount} supported
                          </span>
                          {hallucinatedCount > 0 && (
                            <span className="text-[#F43F5E] font-mono text-[10px] font-semibold">
                              {hallucinatedCount} hallucination
                            </span>
                          )}
                        </div>

                        {/* Segmented Bar */}
                        <div className="w-full h-1.5 rounded-full bg-[var(--bg-secondary)] overflow-hidden flex">
                          <div
                            style={{ width: `${(supportedCount / totalCount) * 100}%` }}
                            className="h-full bg-[#10B981]"
                          />
                          {hallucinatedCount > 0 && (
                            <div
                              style={{ width: `${(hallucinatedCount / totalCount) * 100}%` }}
                              className="h-full bg-[#F43F5E]"
                            />
                          )}
                        </div>
                      </div>

                      {/* Bottom Action Footer */}
                      <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)] text-[11px]">
                        <span className="text-[var(--text-muted)] font-mono text-[10px]">
                          {analysis.id.slice(0, 14)}
                        </span>
                        <span className="text-[var(--text-primary)] font-semibold inline-flex items-center gap-1 group-hover:text-[#6D5EF5] transition-colors">
                          <span>Audit Report</span>
                          <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Table View */
            <div className="rounded-[14px] border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[var(--bg-secondary)] border-b border-[var(--border-default)] text-[11px] font-mono text-[var(--text-muted)]">
                    <tr>
                      <th className="py-3 px-4">Video Filename</th>
                      <th className="py-3 px-3">Backend</th>
                      <th className="py-3 px-3">Duration</th>
                      <th className="py-3 px-3">Verdicts</th>
                      <th className="py-3 px-3">Trust Score</th>
                      <th className="py-3 px-3">Date</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                    {filteredAnalyses.map((item) => {
                      const trust = item.trustScore ?? 0;
                      return (
                        <tr
                          key={item.id}
                          onClick={() => navigate(`/results/${item.id}`)}
                          className="hover:bg-[var(--bg-secondary)]/50 cursor-pointer transition-colors"
                        >
                          <td className="py-3 px-4 font-mono font-bold text-[var(--text-primary)]">
                            {item.videoName}
                          </td>
                          <td className="py-3 px-3 text-[var(--text-secondary)] font-mono">
                            {item.videoName.includes('Newvideo') ? 'Groq Qwen3.8-27B' : item.videoName.includes('my_video') ? 'Qwen2.5-VL' : 'GPT-4o'}
                          </td>
                          <td className="py-3 px-3 font-mono">{item.duration}s</td>
                          <td className="py-3 px-3">
                            <span className="text-[#10B981] font-semibold">{item.verifiedCount} supported</span>
                            {item.hallucinationsCount ? (
                              <span className="text-[#F43F5E] ml-1.5 font-semibold">· {item.hallucinationsCount} caught</span>
                            ) : null}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                                trust >= 90
                                  ? 'bg-[#10B981]/15 text-[#10B981]'
                                  : trust >= 70
                                  ? 'bg-[#F59E0B]/15 text-[#F59E0B]'
                                  : 'bg-[#F43F5E]/15 text-[#F43F5E]'
                              }`}
                            >
                              {trust}%
                            </span>
                          </td>
                          <td className="py-3 px-3 text-[var(--text-muted)] font-mono">
                            {item.dateAnalyzed}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="text-[#6D5EF5] font-semibold hover:underline inline-flex items-center gap-1">
                              <span>Open</span>
                              <ArrowRight className="w-3 h-3" />
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* =========================================================================
            BOTTOM: LOGICAL VERIFICATION PIPELINE STRIP (CLICKABLE STAGES)
        ========================================================================= */}
        <div className="mt-10 p-5 rounded-[16px] border border-[var(--border-default)] bg-[var(--bg-surface)] flex flex-col md:flex-row items-center justify-between gap-5 shadow-xs">
          <div className="space-y-1 text-left">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs sm:text-sm text-[var(--text-primary)]">
                Logical Multi-Agent Architecture
              </span>
              <span className="px-2 py-0.2 rounded-full bg-[#6D5EF5]/10 text-[#6D5EF5] font-mono text-[10px]">
                6 Stages
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] max-w-xl leading-relaxed">
              Cross-examines multimodal narrative assertions against physical video frame observations to catch generative hallucinations.
            </p>
          </div>

          {/* Clickable Stages Navigation */}
          <div className="flex items-center gap-1.5 text-xs font-mono flex-wrap">
            <Link
              to="/pipeline"
              className="px-3 py-1.5 rounded-[8px] bg-[var(--bg-secondary)] hover:bg-[#6D5EF5]/15 hover:text-[#6D5EF5] border border-[var(--border-subtle)] text-[var(--text-primary)] font-bold transition-colors"
            >
              1. PERCEPTION
            </Link>
            <span className="text-[var(--text-muted)]">→</span>
            <Link
              to="/pipeline"
              className="px-3 py-1.5 rounded-[8px] bg-[var(--bg-secondary)] hover:bg-[#6D5EF5]/15 hover:text-[#6D5EF5] border border-[var(--border-subtle)] text-[var(--text-primary)] font-bold transition-colors"
            >
              2. SYNTHESIS
            </Link>
            <span className="text-[var(--text-muted)]">→</span>
            <Link
              to="/pipeline"
              className="px-3 py-1.5 rounded-[8px] bg-[var(--bg-secondary)] hover:bg-[#6D5EF5]/15 hover:text-[#6D5EF5] border border-[var(--border-subtle)] text-[var(--text-primary)] font-bold transition-colors"
            >
              3. REASON
            </Link>
            <span className="text-[var(--text-muted)]">→</span>
            <Link
              to="/pipeline"
              className="px-3 py-1.5 rounded-[8px] bg-[#6D5EF5] text-white font-bold shadow-xs hover:bg-[#5B4BE2] transition-colors"
            >
              4. VERIFY
            </Link>
            <span className="text-[var(--text-muted)]">→</span>
            <Link
              to="/pipeline"
              className="px-3 py-1.5 rounded-[8px] bg-[var(--bg-secondary)] hover:bg-[#6D5EF5]/15 hover:text-[#6D5EF5] border border-[var(--border-subtle)] text-[var(--text-primary)] font-bold transition-colors"
            >
              5. EXPLAIN
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
