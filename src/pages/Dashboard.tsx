import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Play, 
  Plus, 
  FileVideo, 
  CheckCircle, 
  AlertTriangle, 
  Flame, 
  Clock, 
  ArrowRight,
  TrendingUp,
  Activity,
  Cpu
} from 'lucide-react';
import { analysisService } from '../services/analysisService';
import type { VideoAnalysis } from '../types';

export default function Dashboard() {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState<VideoAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

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


  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3">
        <Activity className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-slate-400 text-sm font-medium">Assembling dashboard metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="p-8 rounded-2xl glass-panel relative overflow-hidden border border-slate-800/80">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-violet-500/5 rounded-full blur-2xl -ml-20 -mb-20"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
              <Cpu className="w-3.5 h-3.5" /> Final Year BE Computer Engineering Project
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight leading-tight">
              Explainable Agentic Vision-Language Framework
            </h1>
            <p className="text-sm md:text-base text-slate-400 max-w-2xl font-light">
              Causal Video Understanding with Hallucination Verification against visual evidence.
            </p>
          </div>
          <button
            onClick={() => navigate('/new-analysis')}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/20 hover:shadow-indigo-500/30 transition-all hover:-translate-y-0.5 flex-shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Video Analysis
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Metric 1 */}
        <div className="p-6 rounded-xl glass-card-no-hover flex items-start justify-between border border-slate-850 bg-slate-900/40">
          <div className="space-y-1">
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Videos Analyzed</p>
            <p className="text-3xl font-bold text-slate-100">{totalAnalyzed}</p>
            <p className="text-[10px] text-slate-500 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-indigo-400" /> System dataset history
            </p>
          </div>
          <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <FileVideo className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-6 rounded-xl glass-card-no-hover flex items-start justify-between border border-slate-850 bg-slate-900/40">
          <div className="space-y-1">
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Statements Generated</p>
            <p className="text-3xl font-bold text-slate-100">{totalStatements}</p>
            <p className="text-[10px] text-slate-500 flex items-center gap-1">
              Average {totalAnalyzed > 0 ? Math.round(totalStatements / totalAnalyzed) : 0} per video
            </p>
          </div>
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-6 rounded-xl glass-card-no-hover flex items-start justify-between border border-slate-850 bg-slate-900/40">
          <div className="space-y-1">
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Verified Statements</p>
            <p className="text-3xl font-bold text-emerald-400">{totalVerified}</p>
            <p className="text-[10px] text-slate-500 flex items-center gap-1">
              {totalStatements > 0 ? Math.round((totalVerified / totalStatements) * 100) : 0}% verification rate
            </p>
          </div>
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-6 rounded-xl glass-card-no-hover flex items-start justify-between border border-slate-850 bg-slate-900/40">
          <div className="space-y-1">
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Hallucinations Flagged</p>
            <p className="text-3xl font-bold text-rose-500">{totalHallucinations}</p>
            <p className="text-[10px] text-slate-500 flex items-center gap-1">
              {totalStatements > 0 ? Math.round((totalHallucinations / totalStatements) * 100) : 0}% visual error rate
            </p>
          </div>
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500">
            <Flame className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Grid: Recent Analyses & CTA Card */}
      <div className="space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
          <h2 className="text-lg font-bold text-slate-200">Recent Pipeline Reports</h2>
          <Link to="/history" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
            View All History <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {analyses.length === 0 ? (
          <div className="p-12 text-center rounded-xl border border-dashed border-slate-800 bg-slate-900/10">
            <FileVideo className="w-10 h-10 text-slate-650 mx-auto mb-3" />
            <p className="text-slate-400 text-sm font-semibold mb-1">No analysis records yet</p>
            <p className="text-slate-500 text-xs mb-4 max-w-sm mx-auto">Upload a video to run the agentic vision-language and hallucination verification pipeline.</p>
            <button
              onClick={() => navigate('/new-analysis')}
              className="px-4 py-2 bg-indigo-650/40 hover:bg-indigo-650/60 border border-indigo-500/30 rounded-lg text-xs text-indigo-300 font-semibold cursor-pointer"
            >
              Analyze Your First Video
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Quick Upload CTA Box */}
            <div 
              onClick={() => navigate('/new-analysis')}
              className="p-6 rounded-xl border border-dashed border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 flex flex-col justify-between items-start cursor-pointer hover:border-indigo-500/40 transition-all min-h-[220px]"
            >
              <div className="p-3 rounded-lg bg-indigo-500/15 border border-indigo-500/20 text-indigo-300">
                <Plus className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-200">Analyze New Video</h3>
                <p className="text-xs text-slate-400 leading-normal">
                  Upload another video clip, configure agent tasks, and watch the verification pipeline execute step-by-step.
                </p>
              </div>
              <span className="text-xs text-indigo-400 font-semibold flex items-center gap-1">
                Get started <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Render top recent reports */}
            {analyses.slice(0, 5).map(analysis => {
              const showPlaceholder = !analysis.scenes[0]?.frameFiles[0];
              const thumbnail = showPlaceholder 
                ? 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80'
                : analysis.scenes[0].frameFiles[0];

              return (
                <div 
                  key={analysis.id}
                  onClick={() => navigate(`/results/${analysis.id}`)}
                  className="rounded-xl border border-slate-800/80 bg-slate-900/35 overflow-hidden flex flex-col cursor-pointer hover:border-indigo-500/30 transition-all hover:translate-y-[-2px] group"
                >
                  {/* Card Thumbnail Area */}
                  <div className="relative aspect-video w-full bg-slate-950 overflow-hidden border-b border-slate-800">
                    <img 
                      src={thumbnail} 
                      alt={analysis.videoName} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300 opacity-70 group-hover:opacity-85"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>
                    
                    {/* Duration Badge */}
                    <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-slate-950/80 text-[10px] text-slate-300 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {analysis.duration}s
                    </div>

                    {/* Trust Score circular overlay (only when completed) */}
                    {analysis.status === 'completed' && (
                      <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-slate-950/85 border border-slate-800 flex items-center gap-1.5 shadow-lg">
                        <span className="text-[10px] font-bold text-slate-400">Trust:</span>
                        <span className={`text-xs font-black ${
                          analysis.trustScore >= 90 ? 'text-emerald-400' :
                          analysis.trustScore >= 75 ? 'text-amber-400' : 'text-rose-500'
                        }`}>
                          {analysis.trustScore}%
                        </span>
                      </div>
                    )}

                    <div className="absolute top-3 left-3 p-1.5 rounded-full bg-slate-950/80 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-4.5 h-4.5 fill-indigo-400/20" />
                    </div>
                  </div>

                  {/* Card Content Area */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <h4 className="text-sm font-bold text-slate-200 group-hover:text-indigo-300 transition-colors line-clamp-1">
                        {analysis.videoName}
                      </h4>
                      <p className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5 text-slate-650" />
                        Analyzed: {analysis.dateAnalyzed}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-850/60 pt-3 text-[11px]">
                      {/* Status Marker */}
                      {analysis.status === 'processing' ? (
                        <span className="flex items-center gap-1 text-blue-400 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full pulse-blue"></span>
                          Processing...
                        </span>
                      ) : analysis.status === 'failed' ? (
                        <span className="flex items-center gap-1 text-rose-500 font-semibold">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Failed
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-slate-400">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500/80" />
                          Verified ({analysis.verifiedCount}/{analysis.statementsCount})
                        </span>
                      )}

                      <span className="text-indigo-400 font-semibold group-hover:underline inline-flex items-center gap-0.5">
                        Details <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>

                </div>
              );
            })}

          </div>
        )}
      </div>

      {/* Concept Diagram Card */}
      <div className="p-6 rounded-xl border border-slate-800 bg-[#0d1321]/30 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-left">
          <h3 className="text-sm font-bold text-slate-200">Framework Verification Engine</h3>
          <p className="text-xs text-slate-400 max-w-xl">
            This system runs multiple logical agents to detect VLMs contradictions. If the generated narrative makes claims that do not correspond to physical frames, the verification module highlights the discrepancy immediately.
          </p>
        </div>
        <div className="flex items-center gap-1 md:gap-3 text-xs font-mono text-slate-400">
          <div className="px-3 py-1.5 rounded bg-slate-900 border border-slate-850 text-indigo-400 font-bold">1. CAPTION</div>
          <span>→</span>
          <div className="px-3 py-1.5 rounded bg-slate-900 border border-slate-850 text-blue-400 font-bold">2. REASON</div>
          <span>→</span>
          <div className="px-3 py-1.5 rounded bg-slate-900 border border-slate-850 text-emerald-400 font-bold">3. VERIFY</div>
          <span>→</span>
          <div className="px-3 py-1.5 rounded bg-slate-900 border border-slate-850 text-violet-400 font-bold">4. EXPLAIN</div>
        </div>
      </div>

    </div>
  );
}
