import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Layout & Styling
import Layout from './components/Layout';
import './App.css';

// Pages
import Dashboard from './pages/Dashboard';
import NewAnalysis from './pages/NewAnalysis';
import AnalysisResults from './pages/AnalysisResults';
import PipelineDetails from './pages/PipelineDetails';
import History from './pages/History';
import About from './pages/About';
import { BenchmarkPage as Benchmark } from './pages/Benchmark';
import ConfigInspector from './pages/ConfigInspector';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="new-analysis" element={<NewAnalysis />} />
          <Route path="results/:id" element={<AnalysisResults />} />
          <Route path="history" element={<History />} />
          <Route path="pipeline" element={<PipelineDetails />} />
          <Route path="benchmarks" element={<Benchmark />} />
          <Route path="config" element={<ConfigInspector />} />
          <Route path="about" element={<About />} />
          <Route path="*" element={<Dashboard />} /> {/* Fallback route */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
