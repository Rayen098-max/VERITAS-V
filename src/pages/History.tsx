import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  History as HistoryIcon,
  Search, 
  Trash2, 
  Eye, 
  CheckCircle, 
  AlertTriangle, 
  FileVideo,
  Database,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { analysisService } from '../services/analysisService';
import type { VideoAnalysis } from '../types';

export default function History() {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState<VideoAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'processing' | 'failed'>('all');

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const history = await analysisService.getHistory();
      setAnalyses(history);
    } catch (err) {
      console.error('Failed to load history', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

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
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header and Sync Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <HistoryIcon className="w-5 h-5 text-indigo-400" />
            Analysis History Log
          </h1>
          <p className="text-xs text-slate-400">View and manage previous multi-agent causal reports and hallucinations audits.</p>
        </div>

        <button
          onClick={fetchHistory}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-900 border border-slate-850 hover:bg-slate-800 text-xs text-slate-350 cursor-pointer transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Registry
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#0d1321]/20 p-4 rounded-xl border border-slate-800/80">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-650" />
          <input 
            type="text"
            placeholder="Search by video filename..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#0b0f19] border border-slate-850 focus:border-indigo-500/50 text-xs text-slate-200"
          />
        </div>

        {/* Status Filters */}
        <div className="flex gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {(['all', 'completed', 'processing', 'failed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border capitalize cursor-pointer transition-all ${
                statusFilter === status
                  ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                  : 'bg-transparent text-slate-450 border-slate-850 hover:text-slate-350 hover:border-slate-700'
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
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-slate-550 text-xs font-mono">Syncing database registry...</p>
        </div>
      ) : filteredAnalyses.length === 0 ? (
        <div className="p-16 text-center rounded-2xl border border-slate-850 bg-slate-900/5">
          <FileVideo className="w-10 h-10 text-slate-650 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-300 mb-1">No analysis records match</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">Try clearing your filters, adjusting search queries, or trigger a new video analysis session.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-800 bg-[#0d1321]/30 overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/30 text-slate-450 font-bold">
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
              <tbody className="divide-y divide-slate-850/60">
                {filteredAnalyses.map((item) => {
                  const hasThumbnail = item.scenes[0]?.frameFiles[0];
                  const thumbnail = hasThumbnail || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&q=80';

                  return (
                    <tr 
                      key={item.id}
                      onClick={() => navigate(`/results/${item.id}`)}
                      className="hover:bg-slate-800/10 cursor-pointer transition-colors group"
                    >
                      {/* Video name + details */}
                      <td className="p-4 max-w-[200px]">
                        <div className="flex items-center gap-3">
                          <div className="w-16 aspect-video bg-slate-950 rounded border border-slate-850 overflow-hidden flex-shrink-0">
                            <img src={thumbnail} alt={item.videoName} className="w-full h-full object-cover opacity-80" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-200 block line-clamp-1 group-hover:text-indigo-300 transition-colors">{item.videoName}</span>
                            <span className="text-[9px] text-slate-500 font-mono mt-0.5 block">{item.fileSize || 'N/A'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="p-4 text-slate-400 font-mono">
                        {item.dateAnalyzed}
                      </td>

                      {/* Duration */}
                      <td className="p-4 text-slate-400 font-mono">
                        {item.duration}s
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        {item.status === 'processing' ? (
                          <span className="flex items-center gap-1.5 text-blue-400 font-semibold font-mono text-[10px]">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            PROCESSING
                          </span>
                        ) : item.status === 'failed' ? (
                          <span className="flex items-center gap-1.5 text-rose-500 font-semibold font-mono text-[10px]">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            FAILED
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold font-mono text-[10px]">
                            <CheckCircle className="w-3.5 h-3.5" />
                            COMPLETED
                          </span>
                        )}
                      </td>

                      {/* Trust Score */}
                      <td className="p-4 text-center font-bold">
                        {item.status === 'completed' ? (
                          <span className={`${
                            item.trustScore >= 90 ? 'text-emerald-400' :
                            item.trustScore >= 75 ? 'text-amber-400' : 'text-rose-500'
                          }`}>
                            {item.trustScore}%
                          </span>
                        ) : (
                          <span className="text-slate-550 font-mono">—</span>
                        )}
                      </td>

                      {/* Verified count */}
                      <td className="p-4 text-center text-slate-350 font-mono font-semibold">
                        {item.status === 'completed' ? item.verifiedCount : '—'}
                      </td>

                      {/* Hallucination count */}
                      <td className="p-4 text-center font-mono font-semibold">
                        {item.status === 'completed' ? (
                          <span className={item.hallucinationsCount > 0 ? 'text-rose-500' : 'text-slate-350'}>
                            {item.hallucinationsCount}
                          </span>
                        ) : '—'}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => navigate(`/results/${item.id}`)}
                            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-indigo-400 transition-colors"
                            title="View Reports"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(item.id, e)}
                            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-red-400 transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
      <div className="flex items-center gap-1.5 text-[10px] text-slate-550 font-mono justify-end">
        <Database className="w-3.5 h-3.5" />
        <span>Persistence Engine: LocalBrowser Sandbox Database ({analyses.length} active documents)</span>
      </div>

    </div>
  );
}
