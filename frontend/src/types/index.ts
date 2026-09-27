export interface SceneCaption {
  start_time: number;
  end_time: number;
  frame_files: string[];
  transcript_text: string;
  caption: string;
  keywords: string[];
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

export type VerificationStatus = 'verified' | 'contradicted' | 'unverified' | 'unverifiable';

export interface VerificationVerdict {
  scene_id: string;
  claim: string;
  frame_files: string[];
  verdict: VerificationStatus;
  confidence: number;
  reasoning: string;
}

export interface ExplainabilityClaim {
  scene_id: string;
  claim: string;
  verdict: VerificationStatus;
  confidence: number;
  evidence_frames: string[];
  start_time: number;
  end_time: number;
  included_in_narrative: boolean;
}

export interface SpeakerSegment {
  speaker_id: string;
  start_time: number;
  end_time: number;
  text: string;
  confidence: number;
}

export interface DiarizationContext {
  speakers: string[];
  segments: SpeakerSegment[];
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
  scenes: Record<string, SceneCaption>;
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
