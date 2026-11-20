import type { VideoAnalysis, PipelineStage } from '../types';
import { MOCK_ANALYSES, PIPELINE_STAGES } from './mockData';
import { USE_MOCK_DATA, API_BASE_URL, REQUEST_LATENCY_MS } from './api';
import { 
  supabase, 
  fetchAnalysesFromSupabase, 
  fetchAnalysisByIdFromSupabase 
} from './supabase';

// Helper to delay execution (simulate network delay)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// LocalStorage Keys
const ANALYSES_STORAGE_KEY = 'veritas_v_analyses_v4';
const ACTIVE_PIPELINES_KEY = 'veritas_v_pipelines_v4';

interface ActivePipelineProgress {
  analysisId: string;
  startTime: number;
  config: Record<string, boolean>;
  stages: PipelineStage[];
}

const getStoredAnalyses = (): VideoAnalysis[] => {
  const data = localStorage.getItem(ANALYSES_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(ANALYSES_STORAGE_KEY, JSON.stringify(MOCK_ANALYSES));
    return MOCK_ANALYSES;
  }
  try {
    const parsed: VideoAnalysis[] = JSON.parse(data);
    const existingIds = new Set(parsed.map((a) => a.id));
    const missing = MOCK_ANALYSES.filter((a) => !existingIds.has(a.id));
    if (missing.length > 0) {
      const merged = [...missing, ...parsed];
      localStorage.setItem(ANALYSES_STORAGE_KEY, JSON.stringify(merged));
      return merged;
    }
    return parsed;
  } catch {
    localStorage.setItem(ANALYSES_STORAGE_KEY, JSON.stringify(MOCK_ANALYSES));
    return MOCK_ANALYSES;
  }
};

const saveAnalyses = (analyses: VideoAnalysis[]) => {
  localStorage.setItem(ANALYSES_STORAGE_KEY, JSON.stringify(analyses));
};

const getActivePipelines = (): ActivePipelineProgress[] => {
  const data = localStorage.getItem(ACTIVE_PIPELINES_KEY);
  return data ? JSON.parse(data) : [];
};

const saveActivePipelines = (pipelines: ActivePipelineProgress[]) => {
  localStorage.setItem(ACTIVE_PIPELINES_KEY, JSON.stringify(pipelines));
};

export const analysisService = {
  // Get all analyses in history (combines Supabase Cloud DB, live backend, and local fallback)
  async getHistory(): Promise<VideoAnalysis[]> {
    // 1. Try Supabase Cloud Database first
    try {
      const cloudAnalyses = await fetchAnalysesFromSupabase();
      if (cloudAnalyses.length > 0) {
        return cloudAnalyses;
      }
    } catch (e) {
      console.warn('Supabase getHistory fallback:', e);
    }

    // 2. Try live FastAPI backend
    if (!USE_MOCK_DATA) {
      try {
        const response = await fetch(`${API_BASE_URL}/analysis/history`);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) return data;
        }
      } catch (err) {
        console.warn('Backend server unreachable; falling back to offline storage mode.', err);
      }
    }

    await delay(REQUEST_LATENCY_MS);
    await this.updateActivePipelines();
    return getStoredAnalyses();
  },

  // Get specific analysis details
  async getAnalysisDetails(id: string): Promise<VideoAnalysis> {
    // 1. Try Supabase Cloud Database first
    try {
      const cloudRecord = await fetchAnalysisByIdFromSupabase(id);
      if (cloudRecord) return cloudRecord;
    } catch (e) {
      console.warn('Supabase getAnalysisDetails fallback:', e);
    }

    // 2. Try live FastAPI backend
    if (!USE_MOCK_DATA) {
      try {
        const response = await fetch(`${API_BASE_URL}/analysis/${id}`);
        if (response.ok) return await response.json();
      } catch (err) {
        console.warn(`Backend server unreachable for ${id}; checking local storage.`, err);
      }
    }

    await delay(REQUEST_LATENCY_MS);
    await this.updateActivePipelines();
    const analyses = getStoredAnalyses();
    const analysis = analyses.find(a => a.id === id);
    if (!analysis) throw new Error('Analysis not found');
    return analysis;
  },

  // Upload video via backend (optional fallback when not uploading directly to Supabase)
  async uploadVideo(file: File): Promise<{ id: string; name: string; size: string; duration: number }> {
    if (!USE_MOCK_DATA) {
      try {
        const formData = new FormData();
        formData.append('video', file);
        const response = await fetch(`${API_BASE_URL}/analysis/upload`, {
          method: 'POST',
          body: formData
        });
        if (response.ok) return await response.json();
      } catch (err) {
        console.warn('Backend server upload failed; falling back to mock upload.', err);
      }
    }

    await delay(1200);
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    const randomDuration = Math.floor(Math.random() * 15) + 10;
    const mockId = `analysis_${Date.now()}`;
    return {
      id: mockId,
      name: file.name,
      size: `${sizeMB} MB`,
      duration: randomDuration
    };
  },

  // Start Pipeline Analysis
  async startAnalysis(
    id: string,
    videoName: string,
    fileSize: string,
    duration: number,
    config: Record<string, any>,
    videoUrl?: string
  ): Promise<void> {
    // 1. Dispatch to live FastAPI backend with remote video URL
    if (!USE_MOCK_DATA) {
      try {
        const payload = {
          ...config,
          video_url: videoUrl || null,
          video_name: videoName,
        };
        const response = await fetch(`${API_BASE_URL}/analysis/${id}/start`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          // Mirror active state into Supabase
          try {
            await supabase.from('analyses').upsert({
              id,
              video_name: videoName,
              video_url: videoUrl || null,
              file_size: fileSize,
              duration,
              status: 'processing',
              stages: PIPELINE_STAGES.map(s => ({ ...s, status: 'pending', progress: 0 })),
            });
          } catch (supaErr) {
            console.warn('Could not mirror analysis to Supabase:', supaErr);
          }
          return;
        } else {
          const errDetail = await response.text();
          console.error(`Backend returned status ${response.status}: ${errDetail}`);
          throw new Error(`Server returned status ${response.status}: ${errDetail}`);
        }
      } catch (err) {
        console.error('Backend startAnalysis error:', err);
        throw err;
      }
    }

    await delay(REQUEST_LATENCY_MS);

    // Create a local active pipeline record for offline/demo simulation
    const newAnalysis: VideoAnalysis = {
      id,
      videoName,
      videoUrl,
      fileSize,
      duration,
      dateAnalyzed: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'processing',
      trustScore: 0,
      scenesCount: 0,
      statementsCount: 0,
      verifiedCount: 0,
      hallucinationsCount: 0,
      scenes: [],
      causalRelations: [],
      verifications: [],
      explainability: [],
      speakers: []
    };

    const analyses = getStoredAnalyses();
    saveAnalyses([newAnalysis, ...analyses]);

    const stages: PipelineStage[] = PIPELINE_STAGES.map(stage => {
      if (stage.id === 'diarization' && !config.diarization) {
        return {
          ...stage,
          status: 'completed',
          progress: 100
        };
      }
      return {
        ...stage,
        status: 'pending',
        progress: 0
      };
    });

    const activePipelines = getActivePipelines();
    activePipelines.push({
      analysisId: id,
      startTime: Date.now(),
      config,
      stages
    });
    saveActivePipelines(activePipelines);
  },

  // Get active pipeline progress
  async getPipelineProgress(id: string): Promise<PipelineStage[]> {
    // 1. Check live backend status
    if (!USE_MOCK_DATA) {
      try {
        const response = await fetch(`${API_BASE_URL}/analysis/${id}/status`);
        if (response.ok) {
          const data = await response.json();
          return data.stages;
        }
      } catch (err) {
        console.warn('Polling status from backend failed; checking Supabase fallback.', err);
      }
    }

    // 2. Check Supabase database status
    try {
      const cloudRecord = await fetchAnalysisByIdFromSupabase(id);
      if (cloudRecord && cloudRecord.status === 'completed' && cloudRecord.scenes.length > 0) {
        return PIPELINE_STAGES.map(s => ({ ...s, status: 'completed', progress: 100 }));
      }
    } catch (e) {
      // ignore
    }

    // 3. Fallback to local simulated progress
    await this.updateActivePipelines();
    const activePipelines = getActivePipelines();
    const pipeline = activePipelines.find(p => p.analysisId === id);

    if (!pipeline) {
      const analyses = getStoredAnalyses();
      const analysis = analyses.find(a => a.id === id);
      if (analysis && analysis.status === 'completed') {
        return PIPELINE_STAGES.map(stage => ({
          ...stage,
          status: 'completed',
          progress: 100
        }));
      }
      return PIPELINE_STAGES;
    }

    return pipeline.stages;
  },

  // Background progress simulation for offline fallback
  async updateActivePipelines(): Promise<void> {
    const activePipelines = getActivePipelines();
    if (activePipelines.length === 0) return;

    const now = Date.now();
    const remainingPipelines: ActivePipelineProgress[] = [];
    const analyses = getStoredAnalyses();

    for (const pipeline of activePipelines) {
      const elapsedSeconds = (now - pipeline.startTime) / 1000;
      let allDone = true;

      const updatedStages = pipeline.stages.map((stage, idx) => {
        const stageStart = idx * 2.5;
        const stageDuration = 2.5;

        if (stage.status === 'completed' && stage.progress === 100) return stage;

        if (elapsedSeconds < stageStart) {
          allDone = false;
          return { ...stage, status: 'pending' as const, progress: 0 };
        } else if (elapsedSeconds < stageStart + stageDuration) {
          allDone = false;
          const stageElapsed = elapsedSeconds - stageStart;
          const progress = Math.min(99, Math.floor((stageElapsed / stageDuration) * 100));
          return { ...stage, status: 'processing' as const, progress };
        } else {
          return { ...stage, status: 'completed' as const, progress: 100 };
        }
      });

      pipeline.stages = updatedStages;

      if (allDone) {
        const targetIndex = analyses.findIndex(a => a.id === pipeline.analysisId);
        if (targetIndex !== -1) {
          const sample = MOCK_ANALYSES[0];
          analyses[targetIndex] = {
            ...analyses[targetIndex],
            status: 'completed',
            trustScore: sample.trustScore,
            scenesCount: sample.scenesCount,
            statementsCount: sample.statementsCount,
            verifiedCount: sample.verifiedCount,
            hallucinationsCount: sample.hallucinationsCount,
            scenes: sample.scenes,
            causalRelations: sample.causalRelations,
            verifications: sample.verifications,
            explainability: sample.explainability,
            speakers: sample.speakers
          };
        }
      } else {
        remainingPipelines.push(pipeline);
      }
    }

    saveAnalyses(analyses);
    saveActivePipelines(remainingPipelines);
  },

  // Delete analysis
  async deleteAnalysis(id: string): Promise<void> {
    // 1. Delete from Supabase
    try {
      await supabase.from('analyses').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase delete warning:', e);
    }

    // 2. Delete from live backend
    if (!USE_MOCK_DATA) {
      try {
        await fetch(`${API_BASE_URL}/analysis/${id}`, { method: 'DELETE' });
      } catch (err) {
        console.warn('Backend deleteAnalysis failed:', err);
      }
    }

    // 3. Delete from localStorage
    const analyses = getStoredAnalyses().filter(a => a.id !== id);
    saveAnalyses(analyses);

    const activePipelines = getActivePipelines().filter(p => p.analysisId !== id);
    saveActivePipelines(activePipelines);
  }
};
