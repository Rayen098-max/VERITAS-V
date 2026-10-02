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

export interface CausalClaim {
  scene_id: string;
  event: string;
  cause_scene_id: string;
  cause: string;
  causal_statement: string;
  confidence: number;
  keyword_overlap?: string[];
  link_status?: 'linked' | 'no_link_detected';
}

export type AcademicVerificationStatus = 'verified' | 'contradicted' | 'unverified' | 'unverifiable';

export interface VerificationVerdict {
  scene_id: string;
  claim: string;
  frame_files: string[];
  verdict: AcademicVerificationStatus;
  confidence: number;
  reasoning: string;
}

export interface ExplainabilityClaim {
  scene_id: string;
  claim: string;
  verdict: AcademicVerificationStatus;
  confidence: number;
  evidence_frames: string[];
  start_time: number;
  end_time: number;
  included_in_narrative: boolean;
}

export interface DiarizationContext {
  speakers: string[];
  segments: {
    speaker_id: string;
    start_time: number;
    end_time: number;
    text: string;
    confidence: number;
  }[];
  repeat_filter_stats: {
    words_evaluated: number;
    repeated_phrases_dropped: number;
    threshold: number;
    filter_ratio: string;
  };
}

export interface VideoAnalysisResult {
  video_id: string;
  title: string;
  category: string;
  video_url: string;
  duration: number;
  overall_narrative: string;
  narrative_coherence_score: number;
  scenes: Record<string, {
    start_time: number;
    end_time: number;
    frame_files: string[];
    transcript_text: string;
    caption: string;
    keywords: string[];
  }>;
  causal_claims: CausalClaim[];
  verification_reports: VerificationVerdict[];
  explainability_claims: ExplainabilityClaim[];
  diarization: DiarizationContext;
  evaluation_scores: {
    bleu_4: number;
    rouge_l: number;
    meteor: number;
  };
  raw_files: {
    captions_json: string;
    narrative_txt: string;
    causal_json: string;
    verification_json: string;
    explained_json: string;
    explained_md: string;
  };
}

export interface BenchmarkScoreRecord {
  video_id: string;
  dataset: 'MSR-VTT' | 'ActivityNet';
  duration: number;
  ground_truth_reference: string;
  generated_narrative: string;
  bleu_4: number;
  rouge_l: number;
  meteor: number;
  hallucination_rate: number;
}

export interface BackendConfigState {
  captioningBackend: 'gpt4o' | 'mock' | 'qwen25vl';
  narrativeBackend: 'mock' | 'llm';
  causalBackend: 'mock' | 'llm';
  verificationBackend: 'mock' | 'llm';
  explainabilityStyle: 'structured' | 'narrative_llm';
  pySceneDetectThreshold: number;
  minSceneLength: number;
  numFramesPerScene: number;
  whisperModelSize: 'tiny' | 'base' | 'small' | 'medium' | 'large';
  transcriptRepeatThreshold: number;
  useBatchApi: boolean;
}

export interface PipelineExecutionLog {
  id: string;
  timestamp: string;
  stage: 'Scene Detection' | 'Frame Extraction' | 'Audio Transcription' | 'VLM Captioning' | 'Narrative Synthesis' | 'Causal Reasoning' | 'Hallucination Verification' | 'Explainability Assembly';
  agent: string;
  level: 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR' | 'METRIC';
  message: string;
  payload?: any;
}

