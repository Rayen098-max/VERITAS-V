import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  History as HistoryIcon,
  Search, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  AlertTriangle, 
  FileVideo,
  Database,
  Loader2,
  RefreshCw,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { analysisService } from '../services/analysisService';
import { resolveMediaUrl } from '../services/api';
import type { VideoAnalysis } from '../types';
import Container from '../components/Container';
import IconTile from '../components/IconTile';
import { usePageMeta } from '../hooks/usePageMeta';

export default function History() {
  usePageMeta('History · VERITAS-V', 'Audit trail of past multi-agent video hallucination analyses and verification reports.');
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState<VideoAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'processing' | 'failed'>('all');

  useEffect(() => {
    let isMounted = true;
    analysisService.getHistory()
      .then((history) => {
        if (isMounted) {
          setAnalyses(history);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Failed to load history', err);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const history = await analysisService.getHistory();
      setAnalyses(history);
    } catch (err) {
      console.error('Failed to refresh history', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this analysis report from storage?')) {
      try {
        await analysisService.deleteAnalysis(id);
        setAnalyses(prev => prev.filter(a => a.id !== id));
      } catch (err) {
        console.error('Failed to delete report', err);
        alert('Failed to delete report.');
      }
    }
  };

  // Filter & Search logic
  const filteredAnalyses = analyses.filter(a => {
    const matchesSearch = a.videoName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Container className="py-8 space-y-8">
      {/* Header and Sync Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-5">
        <div className="flex items-center gap-3.5">
          <IconTile icon={HistoryIcon} size="lg" tone="accent" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 font-display">
                Analysis History Log
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 tabular-nums">
                {analyses.length} total
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Audit trail and persistent ledger of multi-agent causal reports and visual verification runs.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/new-analysis')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent text-white hover:bg-accent/90 text-xs font-semibold cursor-pointer shadow-sm transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            New Analysis
          </button>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-xs text-neutral-700 dark:text-neutral-300 font-medium cursor-pointer shadow-sm transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-neutral-900/80 p-3.5 sm:p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm backdrop-blur-sm">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-neutral-400" />
          <input 
            type="text"
            placeholder="Search by video filename..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 focus:border-accent dark:focus:border-accent text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none transition-colors"
          />
        </div>

        {/* Status Filters */}
        <div className="flex gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {(['all', 'completed', 'processing', 'failed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize cursor-pointer transition-all ${
                statusFilter === status
                  ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-semibold shadow-sm'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Main Registry */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
          <p className="text-neutral-500 dark:text-neutral-400 text-xs">Syncing database registry...</p>
        </div>
      ) : filteredAnalyses.length === 0 ? (
        <div className="p-16 text-center rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-800 bg-white/40 dark:bg-neutral-900/40">
          <FileVideo className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-1">No analysis records match</h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto mb-4">
            Try adjusting your search query, clearing filters, or trigger a new verification session.
          </p>
          <button
            onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
            className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-medium text-neutral-800 dark:text-neutral-200 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/90 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-950/60 text-neutral-500 dark:text-neutral-400 text-[11px] font-medium uppercase tracking-wider">
                  <th className="p-4">Video Source</th>
                  <th className="p-4">Date Analyzed</th>
                  <th className="p-4">Duration</th>
                  <th className="p-4">Pipeline Status</th>
                  <th className="p-4 text-center">Trust Score</th>
                  <th className="p-4 text-center">Verified Claims</th>
                  <th className="p-4 text-center">Hallucinations</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {filteredAnalyses.map((item) => {
                  const hasThumbnail = item.scenes[0]?.frameFiles[0];
                  const thumbnail = resolveMediaUrl(hasThumbnail) || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&q=80';

                  const trustColor = item.trustScore >= 90
                    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                    : item.trustScore >= 70
                    ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30'
                    : 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/30';

                  return (
                    <tr 
                      key={item.id}
                      onClick={() => navigate(`/results/${item.id}`)}
                      className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 cursor-pointer transition-colors group"
                    >
                      {/* Video name + details */}
                      <td className="p-4 max-w-[240px]">
                        <div className="flex items-center gap-3">
                          <div className="w-16 aspect-video bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden shrink-0">
                            <img src={thumbnail} alt={item.videoName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          </div>
                          <div className="min-w-0">
                            <span className="font-semibold text-neutral-900 dark:text-neutral-100 block truncate group-hover:text-accent transition-colors">
                              {item.videoName}
                            </span>
                            <span className="text-[11px] text-neutral-400 dark:text-neutral-500 font-mono mt-0.5 block">
                              {item.fileSize || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="p-4 text-neutral-600 dark:text-neutral-400 tabular-nums">
                        {item.dateAnalyzed}
                      </td>

                      {/* Duration */}
                      <td className="p-4 text-neutral-600 dark:text-neutral-400 tabular-nums">
                        {item.duration}s
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        {item.status === 'processing' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Processing
                          </span>
                        ) : item.status === 'failed' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                            <AlertTriangle className="w-3 h-3" />
                            Failed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            Completed
                          </span>
                        )}
                      </td>

                      {/* Trust Score */}
                      <td className="p-4 text-center">
                        {item.status === 'completed' ? (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border tabular-nums ${trustColor}`}>
                            {item.trustScore}%
                          </span>
                        ) : (
                          <span className="text-neutral-400 dark:text-neutral-600">—</span>
                        )}
                      </td>

                      {/* Verified count */}
                      <td className="p-4 text-center text-neutral-700 dark:text-neutral-300 tabular-nums font-semibold">
                        {item.status === 'completed' ? item.verifiedCount : '—'}
                      </td>

                      {/* Hallucination count */}
                      <td className="p-4 text-center tabular-nums">
                        {item.status === 'completed' ? (
                          <span className={item.hallucinationsCount > 0 ? 'text-verdict-contradicted font-bold' : 'text-neutral-400'}>
                            {item.hallucinationsCount}
                          </span>
                        ) : '—'}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => navigate(`/results/${item.id}`)}
                            className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors cursor-pointer"
                            title="View Reports"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(item.id, e)}
                            className="p-1.5 rounded-lg hover:bg-rose-500/10 text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <ArrowRight className="w-4 h-4 text-neutral-300 dark:text-neutral-600 group-hover:text-accent group-hover:translate-x-0.5 transition-all ml-1" />
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Memory Database size badge */}
      <div className="flex items-center gap-1.5 text-xs text-neutral-400 dark:text-neutral-500 font-mono justify-end">
        <Database className="w-3.5 h-3.5" />
        <span>Persistence Engine: LocalBrowser Sandbox Database ({analyses.length} active records)</span>
      </div>
    </Container>
  );
}
