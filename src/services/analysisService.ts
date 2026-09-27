import type { VideoAnalysis, PipelineStage } from '../types';
import { MOCK_ANALYSES, PIPELINE_STAGES } from './mockData';
import { USE_MOCK_DATA, API_BASE_URL, REQUEST_LATENCY_MS } from './api';

// Helper to delay execution (simulate network delay)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// LocalStorage Keys
const ANALYSES_STORAGE_KEY = 'agentic_vision_analyses';
const ACTIVE_PIPELINES_KEY = 'agentic_vision_pipelines';

interface ActivePipelineProgress {
  analysisId: string;
  startTime: number;
  config: Record<string, boolean>;
  stages: PipelineStage[];
}

// Initial storage setup
const getStoredAnalyses = (): VideoAnalysis[] => {
  const data = localStorage.getItem(ANALYSES_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(ANALYSES_STORAGE_KEY, JSON.stringify(MOCK_ANALYSES));
    return MOCK_ANALYSES;
  }
  return JSON.parse(data);
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
  // Get all analyses in history
  async getHistory(): Promise<VideoAnalysis[]> {
    if (USE_MOCK_DATA) {
      await delay(REQUEST_LATENCY_MS);
      // Trigger status check/updates on all active processing pipelines
      await this.updateActivePipelines();
      return getStoredAnalyses();
    }

    const response = await fetch(`${API_BASE_URL}/analysis/history`);
    if (!response.ok) throw new Error('Failed to fetch history');
    return response.json();
  },

  // Get specific analysis details
  async getAnalysisDetails(id: string): Promise<VideoAnalysis> {
    if (USE_MOCK_DATA) {
      await delay(REQUEST_LATENCY_MS);
      await this.updateActivePipelines();
      const analyses = getStoredAnalyses();
      const analysis = analyses.find(a => a.id === id);
      if (!analysis) throw new Error('Analysis not found');
      return analysis;
    }

    const response = await fetch(`${API_BASE_URL}/analysis/${id}`);
    if (!response.ok) throw new Error('Failed to fetch analysis details');
    return response.json();
  },

  // Upload video
  async uploadVideo(file: File): Promise<{ id: string; name: string; size: string; duration: number }> {
    if (USE_MOCK_DATA) {
      await delay(1200); // Higher delay for mock uploading
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      const randomDuration = Math.floor(Math.random() * 15) + 10; // 10s - 25s
      const mockId = `analysis_${Date.now()}`;
      return {
        id: mockId,
        name: file.name,
        size: `${sizeMB} MB`,
        duration: randomDuration
      };
    }

    const formData = new FormData();
    formData.append('video', file);
    const response = await fetch(`${API_BASE_URL}/analysis/upload`, {
      method: 'POST',
      body: formData
    });
    if (!response.ok) throw new Error('Failed to upload video');
    return response.json();
  },

  // Start Pipeline Analysis
  async startAnalysis(
    id: string,
    videoName: string,
    fileSize: string,
    duration: number,
    config: Record<string, boolean>
  ): Promise<void> {
    if (USE_MOCK_DATA) {
      await delay(REQUEST_LATENCY_MS);

      // Create a temporary "processing" analysis record
      const newAnalysis: VideoAnalysis = {
        id,
        videoName,
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

      // Initialize stages list for this pipeline
      const stages: PipelineStage[] = PIPELINE_STAGES.map(stage => {
        // Skip speaker diarization if not enabled in config
        if (stage.id === 'diarization' && !config.diarization) {
          return {
            ...stage,
            status: 'completed', // auto skip
            progress: 100
          };
        }
        return {
          ...stage,
          status: 'pending',
          progress: 0
        };
      });

      // Save pipeline details
      const activePipelines = getActivePipelines();
      activePipelines.push({
        analysisId: id,
        startTime: Date.now(),
        config,
        stages
      });
      saveActivePipelines(activePipelines);
      return;
    }

    const response = await fetch(`${API_BASE_URL}/analysis/${id}/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    if (!response.ok) throw new Error('Failed to start analysis');
  },

  // Get active pipeline progress
  async getPipelineProgress(id: string): Promise<PipelineStage[]> {
    if (USE_MOCK_DATA) {
      await delay(200);
      await this.updateActivePipelines();
      const activePipelines = getActivePipelines();
      const pipeline = activePipelines.find(p => p.analysisId === id);
      if (!pipeline) {
        // If not found in active pipelines, it might already be completed.
        // In that case, return all completed stages
        return PIPELINE_STAGES.map(s => ({
          ...s,
          status: 'completed' as const,
          progress: 100
        }));
      }
      return pipeline.stages;
    }

    const response = await fetch(`${API_BASE_URL}/analysis/${id}/status`);
    if (!response.ok) throw new Error('Failed to fetch pipeline status');
    const data = await response.json();
    return data.stages;
  },

  // Delete analysis
  async deleteAnalysis(id: string): Promise<void> {
    if (USE_MOCK_DATA) {
      await delay(REQUEST_LATENCY_MS);
      const analyses = getStoredAnalyses().filter(a => a.id !== id);
      saveAnalyses(analyses);

      const activePipelines = getActivePipelines().filter(p => p.analysisId !== id);
      saveActivePipelines(activePipelines);
      return;
    }

    const response = await fetch(`${API_BASE_URL}/analysis/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete analysis');
  },

  // Internal helper to update simulation status based on elapsed time
  async updateActivePipelines(): Promise<void> {
    const activePipelines = getActivePipelines();
    if (activePipelines.length === 0) return;

    const currentTimestamp = Date.now();
    const analyses = getStoredAnalyses();
    const updatedPipelines: ActivePipelineProgress[] = [];

    const STAGE_DURATION_MS = 2500; // Each stage takes 2.5 seconds to process in demo mode

    for (const pipeline of activePipelines) {
      const elapsed = currentTimestamp - pipeline.startTime;
      let allDone = true;

      // Filter active (enabled) stages
      const activeStages = pipeline.stages.filter(s => {
        if (s.id === 'diarization') return !!pipeline.config.diarization;
        return true;
      });

      const updatedStages = pipeline.stages.map(stage => {
        // Handle skipped diarization
        if (stage.id === 'diarization' && !pipeline.config.diarization) {
          return stage;
        }

        // Find index of this stage in the sequence
        const stageIndex = activeStages.findIndex(s => s.id === stage.id);
        const stageStartTime = stageIndex * STAGE_DURATION_MS;
        const stageEndTime = stageStartTime + STAGE_DURATION_MS;

        if (elapsed >= stageEndTime) {
          return { ...stage, status: 'completed' as const, progress: 100 };
        } else if (elapsed >= stageStartTime) {
          allDone = false;
          const stageElapsed = elapsed - stageStartTime;
          const pct = Math.min(Math.floor((stageElapsed / STAGE_DURATION_MS) * 100), 99);
          return { ...stage, status: 'processing' as const, progress: pct };
        } else {
          allDone = false;
          return { ...stage, status: 'pending' as const, progress: 0 };
        }
      });

      if (allDone) {
        // Complete the analysis and populate the results!
        const analysisIndex = analyses.findIndex(a => a.id === pipeline.analysisId);
        if (analysisIndex !== -1) {
          // Clone a mock template to populate
          // If diarization is selected, use laboratory template (which has speakers),
          // otherwise use either laboratory or security corridor.
          // Let's alternate or use laboratory as default, updating names
          const template = pipeline.config.diarization ? MOCK_ANALYSES[0] : MOCK_ANALYSES[1];
          const newDur = analyses[analysisIndex].duration;

          // Adjust scene times based on duration
          const numScenes = template.scenes.length;
          const durationPerScene = newDur / numScenes;

          const updatedScenes = template.scenes.map((s, idx) => ({
            ...s,
            startTime: Number((idx * durationPerScene).toFixed(1)),
            endTime: Number(((idx + 1) * durationPerScene).toFixed(1))
          }));

          const updatedCausal = template.causalRelations.map((cr, idx) => ({
            ...cr,
            startTime: Number((idx * durationPerScene).toFixed(1)),
            endTime: Number(((idx + 1) * durationPerScene).toFixed(1))
          }));

          const updatedVerif = template.verifications.map((v, idx) => ({
            ...v,
            timestamps: {
              start: Number((idx * durationPerScene).toFixed(1)),
              end: Number(((idx + 1) * durationPerScene).toFixed(1))
            }
          }));

          const updatedExplain = template.explainability.map((e, idx) => ({
            ...e,
            timestamps: {
              start: Number((idx * durationPerScene).toFixed(1)),
              end: Number(((idx + 1) * durationPerScene).toFixed(1))
            }
          }));

          // Speakers segment scaling
          const updatedSpeakers = template.speakers.map(s => {
            const scale = newDur / template.duration;
            return {
              ...s,
              startTime: Number((s.startTime * scale).toFixed(1)),
              endTime: Number((s.endTime * scale).toFixed(1))
            };
          });

          analyses[analysisIndex] = {
            ...analyses[analysisIndex],
            status: 'completed',
            trustScore: template.trustScore,
            scenesCount: template.scenesCount,
            statementsCount: template.statementsCount,
            verifiedCount: template.verifiedCount,
            hallucinationsCount: template.hallucinationsCount,
            scenes: updatedScenes,
            causalRelations: updatedCausal,
            verifications: updatedVerif,
            explainability: updatedExplain,
            speakers: pipeline.config.diarization ? updatedSpeakers : [],
            narrativeText: template.narrativeText
          };
          saveAnalyses(analyses);
        }
      } else {
        pipeline.stages = updatedStages;
        updatedPipelines.push(pipeline);
      }
    }

    saveActivePipelines(updatedPipelines);
  }
};
