import React, { useState } from 'react';
import { Header } from './components/Header';
import { Navbar, ActivePage } from './components/Navbar';
import { AboutPage } from './pages/AboutPage';
import { ArchitecturePage } from './pages/ArchitecturePage';
import { NewAnalysisPage } from './pages/NewAnalysisPage';
import { AnalysisResultsHub } from './pages/AnalysisResultsHub';
import { BenchmarkPage } from './pages/BenchmarkPage';
import { ConfigInspectorPage } from './pages/ConfigInspectorPage';
import { INITIAL_CONFIG, MOCK_VIDEOS } from './data/mockData';
import { BackendConfigState, VideoAnalysisResult } from './types';
import { Eye, ShieldCheck, Github, BookOpen } from 'lucide-react';

export const App: React.FC = () => {
  const [activePage, setActivePage] = useState<ActivePage>('about');
  const [config, setConfig] = useState<BackendConfigState>(INITIAL_CONFIG);
  const [currentResult, setCurrentResult] = useState<VideoAnalysisResult>(MOCK_VIDEOS[0]);

  const handleUpdateConfig = (newConfig: Partial<BackendConfigState>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  };

  const handleCompleteAnalysis = (result: VideoAnalysisResult) => {
    setCurrentResult(result);
    setActivePage('results');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Header with Telemetry Readout */}
      <Header
        config={config}
        onUpdateBackend={(backend) => handleUpdateConfig({ captioningBackend: backend })}
        activeDataset="MSR-VTT Test 1K"
      />

      {/* Main Tabbed Navigation Bar */}
      <Navbar
        activePage={activePage}
        onSelectPage={setActivePage}
        resultsCount={MOCK_VIDEOS.length}
      />

      {/* Main Page Content */}
      <main className="flex-1 pb-16">
        {activePage === 'about' && (
          <AboutPage onNavigateToPipeline={() => setActivePage('analysis')} />
        )}
        {activePage === 'architecture' && (
          <ArchitecturePage config={config} onUpdateConfig={handleUpdateConfig} />
        )}
        {activePage === 'analysis' && (
          <NewAnalysisPage
            config={config}
            onUpdateConfig={handleUpdateConfig}
            onCompleteAnalysis={handleCompleteAnalysis}
          />
        )}
        {activePage === 'results' && (
          <AnalysisResultsHub
            currentResult={currentResult}
            onSelectVideo={setCurrentResult}
          />
        )}
        {activePage === 'benchmark' && <BenchmarkPage />}
        {activePage === 'config' && (
          <ConfigInspectorPage config={config} currentResult={currentResult} />
        )}
      </main>

      {/* Academic Project Footer */}
      <footer className="w-full border-t border-slate-900 bg-slate-950 px-4 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-indigo-400" />
            <span className="font-mono font-bold text-slate-300">VERITAS</span>
            <span>| Final Year Major Project (BE Computer Engineering)</span>
          </div>

          <div className="flex items-center gap-6 font-mono text-[11px] text-slate-400">
            <span>PySceneDetect 0.6.4</span>
            <span>•</span>
            <span>OpenAI Whisper (ASR)</span>
            <span>•</span>
            <span>Qwen2.5-VL / GPT-4o Batch</span>
            <span>•</span>
            <span className="text-emerald-400">Hallucination Verification Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
