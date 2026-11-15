import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';

// Layout & Navigation Utilities
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import RouteLoadingFallback from './components/RouteLoadingFallback';
import './App.css';

// Lazy-loaded routes for optimal chunk loading
const HeroLanding = lazy(() => import('./pages/HeroLanding'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const NewAnalysis = lazy(() => import('./pages/NewAnalysis'));
const AnalysisResults = lazy(() => import('./pages/AnalysisResults'));
const PipelineDetails = lazy(() => import('./pages/PipelineDetails').then(m => ({ default: m.PipelineDetails })));
const History = lazy(() => import('./pages/History'));
const About = lazy(() => import('./pages/About').then(m => ({ default: m.About })));
const Benchmark = lazy(() => import('./pages/Benchmark').then(m => ({ default: m.BenchmarkPage })));
const NotFound = lazy(() => import('./pages/NotFound'));

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="w-full flex-1 flex flex-col"
      >
        <Suspense fallback={<RouteLoadingFallback />}>
          <Routes location={location}>
            <Route path="/" element={<Layout />}>
              <Route index element={<HeroLanding />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="new-analysis" element={<NewAnalysis />} />
              <Route path="results/:id" element={<AnalysisResults />} />
              <Route path="history" element={<History />} />
              <Route path="pipeline" element={<PipelineDetails />} />
              <Route path="benchmarks" element={<Benchmark />} />
              <Route path="about" element={<About />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <ScrollToTop />
        <AnimatedRoutes />
      </BrowserRouter>
    </MotionConfig>
  );
}

export default App;
