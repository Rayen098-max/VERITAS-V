export type VerificationStatus = 'supported' | 'uncertain' | 'unsupported';

export interface PipelineStage {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  purpose: string;
  backendScript: string;
  input: string;
  output: string;
  progress?: number; // 0 to 100
  errorMsg?: string;
}

export interface SceneCaption {
  sceneId: string;
  startTime: number;
  endTime: number;
  caption: string;
  confidence: number; // 0 to 100
  keywords: string[];
  frameFiles: string[];
}

export interface NarrativeSentence {
  id: string;
  text: string;
  sceneId: string;
  startTime: number;
  endTime: number;
  status: VerificationStatus;
  evidenceFrames: string[];
}

export interface CausalRelation {
  sceneId: string;
  event: string;
  causeSceneId: string | null;
  cause: string | null;
  causalStatement: string;
  confidence: string; // e.g. "mock-heuristic", "high-llm", etc.
  confidenceScore: number; // 0 to 100
  startTime: number;
  endTime: number;
}

export interface VerificationResult {
  statementId: string;
  sceneId: string;
  statement: string;
  status: VerificationStatus;
  confidence: number; // 0 to 100
  evidenceFrames: string[];
  timestamps: {
    start: number;
    end: number;
  };
  unsupportedPhrases?: string[]; // Specific phrases to highlight, e.g. ["blue shirt"]
  reasoning: string;
}

export interface ExplainabilityResult {
  statementId: string;
  sceneId: string;
  statement: string;
  status: VerificationStatus;
  confidence: number; // 0 to 100
  explanation: string;
  timestamps: {
    start: number;
    end: number;
  };
  evidenceFrames: string[];
}

export interface SpeakerSegment {
  id: string;
  speakerId: string;
  speakerName: string; // Resolved from speaker_map.json
  startTime: number;
  endTime: number;
  transcription: string;
}

export interface VideoAnalysis {
  id: string;
  videoName: string;
  videoUrl?: string;
  fileSize?: string;
  duration: number; // in seconds
  dateAnalyzed: string;
  status: 'completed' | 'processing' | 'failed';
  trustScore: number; // 0 to 100
  scenesCount: number;
  statementsCount: number;
  verifiedCount: number;
  hallucinationsCount: number;
  scenes: SceneCaption[];
  causalRelations: CausalRelation[];
  verifications: VerificationResult[];
  explainability: ExplainabilityResult[];
  speakers: SpeakerSegment[];
  narrativeText?: string;
}
