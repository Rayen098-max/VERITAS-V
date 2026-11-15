import type { VideoAnalysis, PipelineStage } from '../types';

// Standard pipeline stages metadata matching the backend python scripts
export const PIPELINE_STAGES: Omit<PipelineStage, 'status'>[] = [
  {
    id: 'loading',
    name: 'Video Loading',
    purpose: 'Downloads or loads the video segment from the dataset.',
    backendScript: 'load_dataset_sample.py',
    input: 'Video ID or filepath',
    output: 'Local raw video file'
  },
  {
    id: 'captioning',
    name: 'Video Captioning',
    purpose: 'Performs scene detection, extracts frames, transcribe speech, and generates scene captions using Qwen2.5-VL.',
    backendScript: 'captioning.py / generate_captions.py',
    input: 'Raw video segments',
    output: 'Per-scene captions and transcripts JSON'
  },
  {
    id: 'narrative',
    name: 'Narrative Generation',
    purpose: 'Aggregates the individual scene captions and transcriptions into a coherent global narrative document.',
    backendScript: 'generate_narrative.py',
    input: 'Scene captions JSON',
    output: 'Coherent markdown/text narrative'
  },
  {
    id: 'causal',
    name: 'Causal Reasoning',
    purpose: 'Analyzes sequence of events and infers logical cause-effect relationships between scenes.',
    backendScript: 'generate_causal_narrative.py',
    input: 'Narrative + captions JSON',
    output: 'Causal relationship graph / JSON'
  },
  {
    id: 'verification',
    name: 'Hallucination Verification',
    purpose: 'Critically verifies causal claims against extracted frame images to detect visual hallucinations.',
    backendScript: 'generate_verification_report.py',
    input: 'Causal claims + scene frame files',
    output: 'Verification report with supported/unsupported/uncertain verdicts'
  },
  {
    id: 'explainability',
    name: 'Explainability Analysis',
    purpose: 'Assembles a final annotated report linking claims to their exact timestamps, verdicts, and frame evidence.',
    backendScript: 'generate_explainability_report.py',
    input: 'Verification report + causal links + scene data',
    output: 'Annotated explainability narrative & JSON report'
  },
  {
    id: 'diarization',
    name: 'Speaker Diarization',
    purpose: 'Identifies speakers and maps timestamps to transcription segments.',
    backendScript: 'diarization.py / speaker_map.json',
    input: 'Audio track',
    output: 'Diarized speaker transcription segments'
  }
];

export const MOCK_ANALYSES: VideoAnalysis[] = [
  {
      "id": "analysis_newvideo_001",
      "videoName": "Newvideo.mp4",
      "videoUrl": "/Newvideo.mp4",
      "fileSize": "28.3 MB",
      "duration": 118,
      "dateAnalyzed": "2026-10-02 22:31",
      "status": "completed",
      "trustScore": 85,
      "scenesCount": 8,
      "statementsCount": 5,
      "verifiedCount": 5,
      "hallucinationsCount": 0,
      "scenes": [
          {
              "sceneId": "scene_001",
              "startTime": 0.0,
              "endTime": 12.5,
              "caption": "A woman in a white top holding a microphone and a man in a white t-shirt are seated behind a table for the show 'India's Laughter', accompanied by a caption text about flirting. The table is cluttered with water bottles and glasses, positioned in front of a dark background with a black panel.",
              "confidence": 95,
              "keywords": [
                  "India's Laughter",
                  "panel",
                  "flirting",
                  "show"
              ],
              "frameFiles": [
                  "/frames/Newvideo_frames/Newvideo_scene_001_start.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_001_end.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_001_t1.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_001_t2.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_001_t3.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_001_t4.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_001_t5.jpg"
              ]
          },
          {
              "sceneId": "scene_002",
              "startTime": 12.5,
              "endTime": 26.0,
              "caption": "A woman with long dark hair, wearing a dark brown belted top and blue jeans, looks down at a playing card held by another person's hand in a dark room lit by a white ring light.",
              "confidence": 95,
              "keywords": [
                  "card trick",
                  "streaming",
                  "jeans",
                  "card",
                  "ring light"
              ],
              "frameFiles": [
                  "/frames/Newvideo_frames/Newvideo_scene_002_start.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_002_end.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_002_t1.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_002_t2.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_002_t3.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_002_t4.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_002_t5.jpg"
              ]
          },
          {
              "sceneId": "scene_003",
              "startTime": 26.0,
              "endTime": 40.0,
              "caption": "A woman with long dark hair wearing a brown top and jeans stands on a stage with a black background, smiling while holding and folding a card in her hands.",
              "confidence": 95,
              "keywords": [
                  "stage",
                  "card",
                  "folding",
                  "woman",
                  "jeans",
                  "event"
              ],
              "frameFiles": [
                  "/frames/Newvideo_frames/Newvideo_scene_003_start.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_003_end.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_003_t1.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_003_t2.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_003_t3.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_003_t4.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_003_t5.jpg"
              ]
          },
          {
              "sceneId": "scene_004",
              "startTime": 40.0,
              "endTime": 56.5,
              "caption": "A young woman with long dark hair, wearing a brown tie-front top and blue jeans, stands with a distressed and crying facial expression while biting a small white object (likely a folded card) held up to her mouth by a person's hand from the left side of the frame. The background is dark, with a faint circle of light visible on the left and another person partially seen on the right.",
              "confidence": 95,
              "keywords": [
                  "crying",
                  "bitter",
                  "card",
                  "performance",
                  "distress"
              ],
              "frameFiles": [
                  "/frames/Newvideo_frames/Newvideo_scene_004_start.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_004_end.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_004_t1.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_004_t2.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_004_t3.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_004_t4.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_004_t5.jpg"
              ]
          },
          {
              "sceneId": "scene_005",
              "startTime": 56.5,
              "endTime": 75.0,
              "caption": "A curly-haired man in a dark blue polo shirt stands against a black background while speaking or performing, with another person partially visible behind him to the left.",
              "confidence": 95,
              "keywords": [
                  "man",
                  "beard",
                  "curly hair",
                  "polo shirt",
                  "stage",
                  "dark background",
                  "performance"
              ],
              "frameFiles": [
                  "/frames/Newvideo_frames/Newvideo_scene_005_start.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_005_end.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_005_t1.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_005_t2.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_005_t3.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_005_t4.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_005_t5.jpg"
              ]
          },
          {
              "sceneId": "scene_006",
              "startTime": 75.0,
              "endTime": 94.0,
              "caption": "A medium shot of a stage performance featuring a man in a dark blue shirt extending his arm to hold the wrist of a woman in a brown top and jeans, with another man standing behind them and spectators visible in the foreground.",
              "confidence": 95,
              "keywords": [
                  "stage",
                  "performance",
                  "posing",
                  "audience",
                  "theater"
              ],
              "frameFiles": [
                  "/frames/Newvideo_frames/Newvideo_scene_006_start.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_006_end.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_006_t1.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_006_t2.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_006_t3.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_006_t4.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_006_t5.jpg"
              ]
          },
          {
              "sceneId": "scene_007",
              "startTime": 94.0,
              "endTime": 107.0,
              "caption": "A female celebrity with long brown hair smiles warmly while holding a small, white object, possibly a signed card. She is wearing a dark sleeveless dress accessorized with a large gold watch and a belt with a brown buckle, set against a dark background featuring a brightly lit circular logo.",
              "confidence": 95,
              "keywords": [
                  "celebrity",
                  "smiling",
                  "gold watch",
                  "interview"
              ],
              "frameFiles": [
                  "/frames/Newvideo_frames/Newvideo_scene_007_start.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_007_end.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_007_t1.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_007_t2.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_007_t3.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_007_t4.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_007_t5.jpg"
              ]
          },
          {
              "sceneId": "scene_008",
              "startTime": 107.0,
              "endTime": 118.375329,
              "caption": "A man with a dark shirt and curly hair holds a small white object towards a woman in a black tank top and blue jeans on a stage. Behind them is a black curtain with a large white circle and letter 'H' logo.",
              "confidence": 95,
              "keywords": [
                  "stage",
                  "gift",
                  "souvenir",
                  "conversation",
                  "presentation"
              ],
              "frameFiles": [
                  "/frames/Newvideo_frames/Newvideo_scene_008_start.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_008_end.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_008_t1.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_008_t2.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_008_t3.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_008_t4.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_008_t5.jpg"
              ]
          }
      ],
      "causalRelations": [
          {
              "sceneId": "scene_002",
              "event": "Woman receiving a card",
              "causeSceneId": "scene_001",
              "cause": "Panel discussion with flirtation question",
              "causalStatement": "The woman, after engaging in the discussion, receives a card to participate in a card trick demonstration",
              "confidence": "groq-qwen-deductive",
              "confidenceScore": 85,
              "startTime": 12.5,
              "endTime": 26.0
          },
          {
              "sceneId": "scene_003",
              "event": "Woman folding a card",
              "causeSceneId": "scene_002",
              "cause": "Woman receiving a card",
              "causalStatement": "Having received the card, she proceeds to fold it as part of the demonstration",
              "confidence": "groq-qwen-deductive",
              "confidenceScore": 90,
              "startTime": 26.0,
              "endTime": 40.0
          },
          {
              "sceneId": "scene_006",
              "event": "Man directing woman's posture",
              "causeSceneId": "scene_005",
              "cause": "Man speaking on stage",
              "causalStatement": "The speaker instructs the woman to position herself, following his earlier verbal directions",
              "confidence": "groq-qwen-deductive",
              "confidenceScore": 90,
              "startTime": 75.0,
              "endTime": 94.0
          },
          {
              "sceneId": "scene_007",
              "event": "Celebrity holding signed card",
              "causeSceneId": "scene_006",
              "cause": "Man directing woman's posture",
              "causalStatement": "After the man guides her, she holds the signed card to show to the audience",
              "confidence": "groq-qwen-deductive",
              "confidenceScore": 80,
              "startTime": 94.0,
              "endTime": 107.0
          },
          {
              "sceneId": "scene_008",
              "event": "Man offering object to woman",
              "causeSceneId": "scene_007",
              "cause": "Celebrity holding signed card",
              "causalStatement": "The woman, having displayed the card, is then presented the card as a souvenir by the man",
              "confidence": "groq-qwen-deductive",
              "confidenceScore": 90,
              "startTime": 107.0,
              "endTime": 118.375329
          }
      ],
      "verifications": [
          {
              "statementId": "claim_nv_001",
              "sceneId": "scene_002",
              "statement": "The woman, after engaging in the discussion, receives a card to participate in a card trick demonstration",
              "status": "uncertain",
              "confidence": 86,
              "evidenceFrames": [
                  "/frames/Newvideo_frames/Newvideo_scene_002_start.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_002_end.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_002_t1.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_002_t2.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_002_t3.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_002_t4.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_002_t5.jpg"
              ],
              "timestamps": {
                  "start": 12.5,
                  "end": 26.0
              },
              "reasoning": "The detected elements confirm that a woman receives a playing card, which aligns with the action summary. However, there is no visual evidence indicating that she was engaged in a discussion before receiving the card or that the card is for a card\u2011trick demonstration. Without such context, the claim cannot be fully supported or contradicted based on the available data."
          },
          {
              "statementId": "claim_nv_002",
              "sceneId": "scene_003",
              "statement": "Having received the card, she proceeds to fold it as part of the demonstration",
              "status": "uncertain",
              "confidence": 86,
              "evidenceFrames": [
                  "/frames/Newvideo_frames/Newvideo_scene_003_start.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_003_end.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_003_t1.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_003_t2.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_003_t3.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_003_t4.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_003_t5.jpg"
              ],
              "timestamps": {
                  "start": 26.0,
                  "end": 40.0
              },
              "reasoning": "The action summary confirms that the woman is folding a card, which aligns with the claim\u2019s final action. However, the summary and detected elements provide no explicit indication that she had just received the card before folding. Without visual evidence of a prior receipt action in the frame images, the claim about receiving the card cannot be confirmed. Therefore, there is insufficient evidence to fully support or contradict the claim."
          },
          {
              "statementId": "claim_nv_003",
              "sceneId": "scene_006",
              "statement": "The speaker instructs the woman to position herself, following his earlier verbal directions",
              "status": "supported",
              "confidence": 94,
              "evidenceFrames": [
                  "/frames/Newvideo_frames/Newvideo_scene_006_start.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_006_end.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_006_t1.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_006_t2.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_006_t3.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_006_t4.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_006_t5.jpg"
              ],
              "timestamps": {
                  "start": 75.0,
                  "end": 94.0
              },
              "reasoning": "The action summary indicates that the man is directing the woman\u2019s posture, which directly supports the claim that the speaker instructs her to position herself following earlier verbal directions. No evidence in the detected elements or scene contradicts this. Therefore the claim is considered supported."
          },
          {
              "statementId": "claim_nv_004",
              "sceneId": "scene_007",
              "statement": "After the man guides her, she holds the signed card to show to the audience",
              "status": "uncertain",
              "confidence": 86,
              "evidenceFrames": [
                  "/frames/Newvideo_frames/Newvideo_scene_007_start.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_007_end.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_007_t1.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_007_t2.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_007_t3.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_007_t4.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_007_t5.jpg"
              ],
              "timestamps": {
                  "start": 94.0,
                  "end": 107.0
              },
              "reasoning": "The detected elements confirm the presence of a female with a white card, matching the action summary of a celebrity holding a signed card. However, there is no evidence in the detected elements (nor in the provided summary) of a male figure guiding her or an audience present to show the card to. Without visual confirmation of the man\u2019s guiding action or the audience, we cannot confirm or refute the claim that she holds the card to show to the audience after being guided."
          },
          {
              "statementId": "claim_nv_005",
              "sceneId": "scene_008",
              "statement": "The woman, having displayed the card, is then presented the card as a souvenir by the man",
              "status": "uncertain",
              "confidence": 72,
              "evidenceFrames": [
                  "/frames/Newvideo_frames/Newvideo_scene_008_start.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_008_end.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_008_t1.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_008_t2.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_008_t3.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_008_t4.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_008_t5.jpg"
              ],
              "timestamps": {
                  "start": 107.0,
                  "end": 118.375329
              },
              "reasoning": "The detected elements list mentions a white object, microphone, and bracelet but does not include a card. Without any explicit evidence of a card being displayed or handed to the woman in the frame, the claim cannot be verified. The available information neither supports nor contradicts the specific action of the man presenting a card to the woman, so the evidence is insufficient to make a determination."
          }
      ],
      "explainability": [
          {
              "statementId": "claim_nv_001",
              "sceneId": "scene_002",
              "statement": "The woman, after engaging in the discussion, receives a card to participate in a card trick demonstration",
              "status": "uncertain",
              "confidence": 86,
              "explanation": "",
              "timestamps": {
                  "start": 12.5,
                  "end": 26.0
              },
              "evidenceFrames": [
                  "/frames/Newvideo_frames/Newvideo_scene_002_start.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_002_end.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_002_t1.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_002_t2.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_002_t3.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_002_t4.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_002_t5.jpg"
              ]
          },
          {
              "statementId": "claim_nv_002",
              "sceneId": "scene_003",
              "statement": "Having received the card, she proceeds to fold it as part of the demonstration",
              "status": "uncertain",
              "confidence": 86,
              "explanation": "",
              "timestamps": {
                  "start": 26.0,
                  "end": 40.0
              },
              "evidenceFrames": [
                  "/frames/Newvideo_frames/Newvideo_scene_003_start.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_003_end.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_003_t1.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_003_t2.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_003_t3.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_003_t4.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_003_t5.jpg"
              ]
          },
          {
              "statementId": "claim_nv_003",
              "sceneId": "scene_006",
              "statement": "The speaker instructs the woman to position herself, following his earlier verbal directions",
              "status": "supported",
              "confidence": 94,
              "explanation": "",
              "timestamps": {
                  "start": 75.0,
                  "end": 94.0
              },
              "evidenceFrames": [
                  "/frames/Newvideo_frames/Newvideo_scene_006_start.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_006_end.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_006_t1.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_006_t2.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_006_t3.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_006_t4.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_006_t5.jpg"
              ]
          },
          {
              "statementId": "claim_nv_004",
              "sceneId": "scene_007",
              "statement": "After the man guides her, she holds the signed card to show to the audience",
              "status": "uncertain",
              "confidence": 86,
              "explanation": "",
              "timestamps": {
                  "start": 94.0,
                  "end": 107.0
              },
              "evidenceFrames": [
                  "/frames/Newvideo_frames/Newvideo_scene_007_start.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_007_end.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_007_t1.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_007_t2.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_007_t3.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_007_t4.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_007_t5.jpg"
              ]
          },
          {
              "statementId": "claim_nv_005",
              "sceneId": "scene_008",
              "statement": "The woman, having displayed the card, is then presented the card as a souvenir by the man",
              "status": "uncertain",
              "confidence": 72,
              "explanation": "",
              "timestamps": {
                  "start": 107.0,
                  "end": 118.375329
              },
              "evidenceFrames": [
                  "/frames/Newvideo_frames/Newvideo_scene_008_start.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_008_end.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_008_t1.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_008_t2.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_008_t3.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_008_t4.jpg",
                  "/frames/Newvideo_frames/Newvideo_scene_008_t5.jpg"
              ]
          }
      ],
      "speakers": [
          {
              "id": "spk_1",
              "speakerId": "SPEAKER_01",
              "speakerName": "Kabir Sharma (Magician / Contestant)",
              "startTime": 0.0,
              "endTime": 118.0,
              "transcription": "One strength I have is I flirt a lot... Do you want to see a magic trick? Pick any card, Sharon. Touch any card. Two of hearts. Sign your name on it... Take your signed card, fold it twice, bite on it... I actually have your card over here. And check what do you have: My signed card!"
          },
          {
              "id": "spk_2",
              "speakerId": "SPEAKER_02",
              "speakerName": "Sharon (Panel Volunteer)",
              "startTime": 4.9,
              "endTime": 116.0,
              "transcription": "Alright... Two of hearts. (Signs card and shows it to camera). That's cool ya! Thank you."
          },
          {
              "id": "spk_3",
              "speakerId": "SPEAKER_03",
              "speakerName": "Samay Raina & Panel Judges",
              "startTime": 2.9,
              "endTime": 98.0,
              "transcription": "Try flirt with Sharon for a minute. Sharon, give the permission... Sharon blinked twice, she needs help! This is a crime happening in front of us!"
          }
      ],
      "narrativeText": "The video opens on a dark\u2011lit stage where a woman in a white top and a man in a white T\u2011shirt sit behind a cluttered table for the show \u201cIndia\u2019s Laughter,\u201d and the host launches a panel discussion about flirtation, joking that \u201cone of my strengths is I flirt a lot\u201d and inviting Sharon to flirt for a minute while encouraging the audience to \u201ccome join me on stream.\u201d  The tone shifts as the host transitions to a live card trick: a woman with long dark hair in a brown top and blue jeans is handed a playing card, instructed to pick any card and sign her name\u2014she selects the Two of Hearts and signs it\u2014before the host tells her to fold it twice and then bite it, a dramatic cue that has the crowd laughing as she nervously clutches the card.  A curly\u2011haired man in a dark blue polo then steps into the frame, holding up a signed King of Diamonds and explaining the trick while the host watches her \u201cstand straight\u201d and \u201cput your hands like this,\u201d with the audience\u2019s reaction captured in the foreground.  The man continues to demonstrate the card\u2019s manipulation, folding it up and emphasizing the theatricality of the moment, before offering the signed card back to Sharon as a souvenir, her gratitude echoing as the host says, \u201cThank you, Sharon,\u201d and the video closes on a close\u2011up of the small white card held proudly against a black backdrop with a glowing logo."
  },
  {
    id: 'analysis_real_001',
    videoName: 'my_video.mp4',
    videoUrl: '',
    fileSize: '42.1 MB',
    duration: 66,
    dateAnalyzed: '2026-09-28 16:45',
    status: 'completed',
    trustScore: 75, // 3 of 4 supported (75%)
    scenesCount: 4,
    statementsCount: 4,
    verifiedCount: 3,
    hallucinationsCount: 1,
    scenes: [
      {
        sceneId: 'scene_001',
        startTime: 0,
        endTime: 20.5,
        caption: 'A speaker wearing dark attire stands at the center of a stage under lighting.',
        confidence: 96,
        keywords: ['speaker', 'stage', 'presentation', 'lighting'],
        frameFiles: [
          '/frames/my_video_frames/my_video_scene_001_start.jpg',
          '/frames/my_video_frames/my_video_scene_001_t1.jpg'
        ]
      },
      {
        sceneId: 'scene_002',
        startTime: 20.5,
        endTime: 23.4,
        caption: 'The speaker addresses the audience while holding a handheld microphone on the illuminated stage.',
        confidence: 94,
        keywords: ['man', 'microphone', 'wristwatch', 'indoor stage'],
        frameFiles: [
          '/frames/my_video_frames/my_video_scene_002_start.jpg',
          '/frames/my_video_frames/my_video_scene_002_t2.jpg'
        ]
      },
      {
        sceneId: 'scene_003',
        startTime: 23.4,
        endTime: 52.0,
        caption: 'The bearded speaker continues addressing the auditorium with hand gestures against a blue backdrop.',
        confidence: 92,
        keywords: ['bearded man', 'microphone', 'cable', 'watch', 'stage'],
        frameFiles: [
          '/frames/my_video_frames/my_video_scene_003_start.jpg',
          '/frames/my_video_frames/my_video_scene_003_t3.jpg'
        ]
      },
      {
        sceneId: 'scene_004',
        startTime: 52.0,
        endTime: 66.5,
        caption: 'The speaker emphasizes a concluding technical point while maintaining eye contact with attendees.',
        confidence: 89,
        keywords: ['speaker', 'gestures', 'auditorium', 'conclusion'],
        frameFiles: [
          '/frames/my_video_frames/my_video_scene_004_start.jpg',
          '/frames/my_video_frames/my_video_scene_004_t1.jpg'
        ]
      }
    ],
    causalRelations: [
      {
        sceneId: 'scene_001',
        event: 'The speaker takes the stage and addresses the audience.',
        causeSceneId: null,
        cause: null,
        causalStatement: 'The speaker takes the stage and addresses the audience.',
        confidence: 'no_prior_scene',
        confidenceScore: 100,
        startTime: 0,
        endTime: 20.5
      },
      {
        sceneId: 'scene_002',
        event: 'The speaker holds the microphone to begin the speech.',
        causeSceneId: 'scene_001',
        cause: 'The speaker takes the stage and addresses the audience.',
        causalStatement: 'The earlier scene shows the speaker delivering a speech on stage, which plausibly leads to the continuation speaking into the handheld microphone.',
        confidence: 'vlm-deductive',
        confidenceScore: 92,
        startTime: 20.5,
        endTime: 23.4
      },
      {
        sceneId: 'scene_003',
        event: 'The speaker engages the audience with explanatory hand gestures.',
        causeSceneId: 'scene_002',
        cause: 'The speaker holds the microphone to begin the speech.',
        causalStatement: 'Continuing the address, the speaker introduces hand gestures against the blue backdrop, forming a continuous physical causal narrative.',
        confidence: 'vlm-deductive',
        confidenceScore: 88,
        startTime: 23.4,
        endTime: 52.0
      },
      {
        sceneId: 'scene_004',
        event: 'The speaker delivers concluding remarks to the auditorium.',
        causeSceneId: 'scene_003',
        cause: 'The speaker engages the audience with explanatory hand gestures.',
        causalStatement: 'Following the detailed presentation points, the speaker transitions into closing remarks.',
        confidence: 'vlm-deductive',
        confidenceScore: 90,
        startTime: 52.0,
        endTime: 66.5
      }
    ],
    verifications: [
      {
        statementId: 'claim_001',
        sceneId: 'scene_001',
        statement: 'A speaker wearing dark attire stands at the center of a stage under lighting.',
        status: 'supported',
        confidence: 96,
        evidenceFrames: [
          '/frames/my_video_frames/my_video_scene_001_start.jpg',
          '/frames/my_video_frames/my_video_scene_001_t1.jpg'
        ],
        timestamps: { start: 0, end: 20.5 },
        reasoning: 'Visual inspection confirms the speaker standing centrally on an illuminated dark stage platform.'
      },
      {
        statementId: 'claim_002',
        sceneId: 'scene_002',
        statement: 'The speaker addresses the audience while holding a handheld microphone on the illuminated stage.',
        status: 'supported',
        confidence: 94,
        evidenceFrames: [
          '/frames/my_video_frames/my_video_scene_002_start.jpg',
          '/frames/my_video_frames/my_video_scene_002_t2.jpg'
        ],
        timestamps: { start: 20.5, end: 23.4 },
        reasoning: 'Extracted keyframes verify a metallic handheld microphone in the speaker\'s hand and a wristwatch on the wrist.'
      },
      {
        statementId: 'claim_003',
        sceneId: 'scene_003',
        statement: 'The speaker holds a digital laser pointer while gesturing towards a slide projection.',
        status: 'unsupported',
        confidence: 32,
        evidenceFrames: [
          '/frames/my_video_frames/my_video_scene_003_start.jpg',
          '/frames/my_video_frames/my_video_scene_003_t3.jpg'
        ],
        timestamps: { start: 23.4, end: 52.0 },
        unsupportedPhrases: ['digital laser pointer'],
        reasoning: 'Hallucination defense flagged: The speaker is holding a microphone and making empty-hand gestures; no laser pointer is visible in the physical frame evidence.'
      },
      {
        statementId: 'claim_004',
        sceneId: 'scene_004',
        statement: 'The speaker concludes the segment facing the auditorium.',
        status: 'supported',
        confidence: 93,
        evidenceFrames: [
          '/frames/my_video_frames/my_video_scene_004_start.jpg',
          '/frames/my_video_frames/my_video_scene_004_t1.jpg'
        ],
        timestamps: { start: 52.0, end: 66.5 },
        reasoning: 'Visual frame verification confirms continued speaker presence, stage lighting, and audience orientation.'
      }
    ],
    explainability: [
      {
        statementId: 'claim_001',
        sceneId: 'scene_001',
        statement: 'A speaker wearing dark attire stands at the center of a stage under lighting.',
        status: 'supported',
        confidence: 96,
        explanation: 'Initial scene establishing the speaker and environment. Grounded in frames 0.0s to 20.5s.',
        timestamps: { start: 0, end: 20.5 },
        evidenceFrames: [
          '/frames/my_video_frames/my_video_scene_001_start.jpg',
          '/frames/my_video_frames/my_video_scene_001_t1.jpg'
        ]
      },
      {
        statementId: 'claim_002',
        sceneId: 'scene_002',
        statement: 'The speaker addresses the audience while holding a handheld microphone on the illuminated stage.',
        status: 'supported',
        confidence: 94,
        explanation: 'Direct causal progression of the address. Grounded in frames 20.5s to 23.4s.',
        timestamps: { start: 20.5, end: 23.4 },
        evidenceFrames: [
          '/frames/my_video_frames/my_video_scene_002_start.jpg',
          '/frames/my_video_frames/my_video_scene_002_t2.jpg'
        ]
      },
      {
        statementId: 'claim_003',
        sceneId: 'scene_003',
        statement: 'The speaker holds a digital laser pointer while gesturing towards a slide projection.',
        status: 'unsupported',
        confidence: 32,
        explanation: 'Hallucination defense alert: Unsubstantiated object assertion purged. Grounded evidence confirms microphone only.',
        timestamps: { start: 23.4, end: 52.0 },
        evidenceFrames: [
          '/frames/my_video_frames/my_video_scene_003_start.jpg',
          '/frames/my_video_frames/my_video_scene_003_t3.jpg'
        ]
      },
      {
        statementId: 'claim_004',
        sceneId: 'scene_004',
        statement: 'The speaker concludes the segment facing the auditorium.',
        status: 'supported',
        confidence: 93,
        explanation: 'Presentation culmination grounded in scene keyframes from 52.0s to 66.5s.',
        timestamps: { start: 52.0, end: 66.5 },
        evidenceFrames: [
          '/frames/my_video_frames/my_video_scene_004_start.jpg',
          '/frames/my_video_frames/my_video_scene_004_t1.jpg'
        ]
      }
    ],
    speakers: [
      {
        id: 'sp_01',
        speakerId: 'SPEAKER_00',
        speakerName: 'Speaker (Stage)',
        startTime: 1.5,
        endTime: 64.0,
        transcription: 'Thank you everyone. In this presentation we demonstrate the operational reliability of multimodal verification.'
      }
    ],
    narrativeText: 'A speaker stands at the center of an auditorium stage. The speaker delivers a presentation into a handheld microphone, using hand gestures to emphasize key technical insights before concluding the segment.'
  },
  {
    id: 'analysis_real_002',
    videoName: 'sample_clip.mp4',
    videoUrl: '',
    fileSize: '4.8 MB',
    duration: 15,
    dateAnalyzed: '2026-09-28 17:10',
    status: 'completed',
    trustScore: 100, // 3 of 3 supported (100%)
    scenesCount: 3,
    statementsCount: 3,
    verifiedCount: 3,
    hallucinationsCount: 0,
    scenes: [
      {
        sceneId: 'scene_001',
        startTime: 0,
        endTime: 5.0,
        caption: 'A high-jump athlete prepares and initiates an acceleration run towards the bar.',
        confidence: 95,
        keywords: ['athlete', 'track', 'high jump', 'run'],
        frameFiles: [
          '/frames/sample_clip_frames/sample_clip_scene_001_start.jpg',
          '/frames/sample_clip_frames/sample_clip_scene_001_t1.jpg'
        ]
      },
      {
        sceneId: 'scene_002',
        startTime: 5.0,
        endTime: 10.0,
        caption: 'The athlete arches over the elevated crossbar clearing the obstruction.',
        confidence: 93,
        keywords: ['athlete', 'crossbar', 'jump', 'clear'],
        frameFiles: [
          '/frames/sample_clip_frames/sample_clip_scene_001_t2.jpg',
          '/frames/sample_clip_frames/sample_clip_scene_001_t3.jpg'
        ]
      },
      {
        sceneId: 'scene_003',
        startTime: 10.0,
        endTime: 15.0,
        caption: 'The athlete lands cleanly on the foam safety mat.',
        confidence: 96,
        keywords: ['athlete', 'safety mat', 'landing', 'foam'],
        frameFiles: [
          '/frames/sample_clip_frames/sample_clip_scene_001_t4.jpg',
          '/frames/sample_clip_frames/sample_clip_scene_001_end.jpg'
        ]
      }
    ],
    causalRelations: [
      {
        sceneId: 'scene_001',
        event: 'The athlete initiates the acceleration run.',
        causeSceneId: null,
        cause: null,
        causalStatement: 'The athlete initiates the acceleration run.',
        confidence: 'no_prior_scene',
        confidenceScore: 100,
        startTime: 0,
        endTime: 5.0
      },
      {
        sceneId: 'scene_002',
        event: 'The athlete clears the high-jump bar.',
        causeSceneId: 'scene_001',
        cause: 'The athlete initiates the acceleration run.',
        causalStatement: 'The curved acceleration run generates vertical momentum enabling clearance of the crossbar.',
        confidence: 'physical-dynamics',
        confidenceScore: 94,
        startTime: 5.0,
        endTime: 10.0
      },
      {
        sceneId: 'scene_003',
        event: 'The athlete lands on the foam safety mat.',
        causeSceneId: 'scene_002',
        cause: 'The athlete clears the high-jump bar.',
        causalStatement: 'Gravity decelerates the airborne athlete onto the designated safety padding.',
        confidence: 'physical-dynamics',
        confidenceScore: 97,
        startTime: 10.0,
        endTime: 15.0
      }
    ],
    verifications: [
      {
        statementId: 'claim_001',
        sceneId: 'scene_001',
        statement: 'The athlete initiates the curved acceleration run on the track.',
        status: 'supported',
        confidence: 96,
        evidenceFrames: ['/frames/sample_clip_frames/sample_clip_scene_001_start.jpg'],
        timestamps: { start: 0, end: 5.0 },
        reasoning: 'Grounded in track approach frames showing rapid forward stride.'
      },
      {
        statementId: 'claim_002',
        sceneId: 'scene_002',
        statement: 'The athlete clears the elevated crossbar without dislodging it.',
        status: 'supported',
        confidence: 94,
        evidenceFrames: ['/frames/sample_clip_frames/sample_clip_scene_001_t2.jpg'],
        timestamps: { start: 5.0, end: 10.0 },
        reasoning: 'Keyframe confirms clearance with crossbar intact on upright pegs.'
      },
      {
        statementId: 'claim_003',
        sceneId: 'scene_003',
        statement: 'The athlete lands safely on the blue foam landing mat.',
        status: 'supported',
        confidence: 97,
        evidenceFrames: ['/frames/sample_clip_frames/sample_clip_scene_001_end.jpg'],
        timestamps: { start: 10.0, end: 15.0 },
        reasoning: 'Physical frame evidence captures impact onto safety padding.'
      }
    ],
    explainability: [
      {
        statementId: 'claim_001',
        sceneId: 'scene_001',
        statement: 'The athlete initiates the curved acceleration run on the track.',
        status: 'supported',
        confidence: 96,
        explanation: 'Initial kinetic setup verified in frames 0s to 5s.',
        timestamps: { start: 0, end: 5.0 },
        evidenceFrames: ['/frames/sample_clip_frames/sample_clip_scene_001_start.jpg']
      },
      {
        statementId: 'claim_002',
        sceneId: 'scene_002',
        statement: 'The athlete clears the elevated crossbar without dislodging it.',
        status: 'supported',
        confidence: 94,
        explanation: 'Causal consequence of momentum transfer verified in peak trajectory frames 5s to 10s.',
        timestamps: { start: 5.0, end: 10.0 },
        evidenceFrames: ['/frames/sample_clip_frames/sample_clip_scene_001_t2.jpg']
      },
      {
        statementId: 'claim_003',
        sceneId: 'scene_003',
        statement: 'The athlete lands safely on the blue foam landing mat.',
        status: 'supported',
        confidence: 97,
        explanation: 'Final state resolution verified in landing frames 10s to 15s.',
        timestamps: { start: 10.0, end: 15.0 },
        evidenceFrames: ['/frames/sample_clip_frames/sample_clip_scene_001_end.jpg']
      }
    ],
    speakers: [],
    narrativeText: 'An athlete accelerates down the track apron, leaps backward over the elevated crossbar, and lands safely on the foam padding.'
  },
  {
    id: 'analysis_real_003',
    videoName: 'multi_scene.mp4',
    videoUrl: '',
    fileSize: '6.5 MB',
    duration: 12,
    dateAnalyzed: '2026-09-28 17:35',
    status: 'completed',
    trustScore: 100, // 2 of 2 supported (100%)
    scenesCount: 2,
    statementsCount: 2,
    verifiedCount: 2,
    hallucinationsCount: 0,
    scenes: [
      {
        sceneId: 'scene_001',
        startTime: 0,
        endTime: 4.0,
        caption: 'A person walks briskly along an indoor hallway with a wet floor surface.',
        confidence: 92,
        keywords: ['person', 'walk', 'hallway', 'wet floor'],
        frameFiles: ['/frames/sample_clip_frames/sample_clip_scene_001_start.jpg']
      },
      {
        sceneId: 'scene_002',
        startTime: 4.0,
        endTime: 8.0,
        caption: 'The slip on the wet floor caused the person to lose balance, leading to a fall.',
        confidence: 95,
        keywords: ['fall', 'slip', 'ankle', 'ground'],
        frameFiles: ['/frames/sample_clip_frames/sample_clip_scene_001_end.jpg']
      }
    ],
    causalRelations: [
      {
        sceneId: 'scene_001',
        event: 'Person walks across slick surface.',
        causeSceneId: null,
        cause: null,
        causalStatement: 'Person walks across slick surface.',
        confidence: 'no_prior_scene',
        confidenceScore: 100,
        startTime: 0,
        endTime: 4.0
      },
      {
        sceneId: 'scene_002',
        event: 'Person slips and falls.',
        causeSceneId: 'scene_001',
        cause: 'Person walks across slick surface.',
        causalStatement: 'The slip on the wet floor caused the person to lose balance, leading to a fall onto the ground.',
        confidence: 'physical-dynamics',
        confidenceScore: 95,
        startTime: 4.0,
        endTime: 8.0
      }
    ],
    verifications: [
      {
        statementId: 'claim_001',
        sceneId: 'scene_001',
        statement: 'A person walks briskly along an indoor hallway with a wet floor surface.',
        status: 'supported',
        confidence: 92,
        evidenceFrames: ['/frames/sample_clip_frames/sample_clip_scene_001_start.jpg'],
        timestamps: { start: 0, end: 4.0 },
        reasoning: 'Grounded in hallway footage showing pedestrian stride and surface reflections.'
      },
      {
        statementId: 'claim_002',
        sceneId: 'scene_002',
        statement: 'The slip on the wet floor caused the person to lose balance, leading to a fall.',
        status: 'supported',
        confidence: 95,
        evidenceFrames: ['/frames/sample_clip_frames/sample_clip_scene_001_end.jpg'],
        timestamps: { start: 4.0, end: 8.0 },
        reasoning: 'Loss of traction and resulting ground impact verified across consecutive frames.'
      }
    ],
    explainability: [
      {
        statementId: 'claim_001',
        sceneId: 'scene_001',
        statement: 'A person walks briskly along an indoor hallway with a wet floor surface.',
        status: 'supported',
        confidence: 92,
        explanation: 'Initial hazard interaction grounded in frames 0s to 4s.',
        timestamps: { start: 0, end: 4.0 },
        evidenceFrames: ['/frames/sample_clip_frames/sample_clip_scene_001_start.jpg']
      },
      {
        statementId: 'claim_002',
        sceneId: 'scene_002',
        statement: 'The slip on the wet floor caused the person to lose balance, leading to a fall.',
        status: 'supported',
        confidence: 95,
        explanation: 'Direct causal consequence verified: friction loss causing sudden equilibrium loss at 4s to 8s.',
        timestamps: { start: 4.0, end: 8.0 },
        evidenceFrames: ['/frames/sample_clip_frames/sample_clip_scene_001_end.jpg']
      }
    ],
    speakers: [],
    narrativeText: 'A pedestrian walks along a slick corridor, experiences a sudden traction failure on the wet surface, and loses balance before falling.'
  },
  {
    id: 'analysis_real_004',
    videoName: 'videohallucer_test.mp4',
    videoUrl: '',
    fileSize: '3.2 MB',
    duration: 10,
    dateAnalyzed: '2026-09-28 18:02',
    status: 'completed',
    trustScore: 50, // 1 of 2 supported (50%)
    scenesCount: 2,
    statementsCount: 2,
    verifiedCount: 1,
    hallucinationsCount: 1,
    scenes: [
      {
        sceneId: 'scene_001',
        startTime: 0,
        endTime: 5.0,
        caption: 'A dog sprints rapidly across an open grass field chasing a tennis ball.',
        confidence: 97,
        keywords: ['dog', 'running', 'grass', 'field'],
        frameFiles: ['/frames/sample_clip_frames/sample_clip_scene_001_t1.jpg']
      },
      {
        sceneId: 'scene_002',
        startTime: 5.0,
        endTime: 10.0,
        caption: 'The dog retrieves the ball as a futuristic flying vehicle hovers above the park.',
        confidence: 42,
        keywords: ['dog', 'retrieves', 'flying vehicle', 'hallucination'],
        frameFiles: ['/frames/sample_clip_frames/sample_clip_scene_001_t2.jpg']
      }
    ],
    causalRelations: [
      {
        sceneId: 'scene_001',
        event: 'Dog runs across grass.',
        causeSceneId: null,
        cause: null,
        causalStatement: 'Dog runs across grass.',
        confidence: 'no_prior_scene',
        confidenceScore: 100,
        startTime: 0,
        endTime: 5.0
      },
      {
        sceneId: 'scene_002',
        event: 'Dog retrieves ball in park.',
        causeSceneId: 'scene_001',
        cause: 'Dog runs across grass.',
        causalStatement: 'The sprint across the lawn allows the dog to intercept the ball.',
        confidence: 'biological-action',
        confidenceScore: 96,
        startTime: 5.0,
        endTime: 10.0
      }
    ],
    verifications: [
      {
        statementId: 'claim_001',
        sceneId: 'scene_001',
        statement: 'A dog runs across the grassy field in vh_vid1.',
        status: 'supported',
        confidence: 98,
        evidenceFrames: ['/frames/sample_clip_frames/sample_clip_scene_001_t1.jpg'],
        timestamps: { start: 0, end: 5.0 },
        reasoning: 'Grounded: Canine motion in outdoor turf setting is visibly verified.'
      },
      {
        statementId: 'claim_002',
        sceneId: 'scene_002',
        statement: 'A flying car hovers above the park in vh_vid1.',
        status: 'contradicted',
        confidence: 12,
        evidenceFrames: ['/frames/sample_clip_frames/sample_clip_scene_001_t2.jpg'],
        timestamps: { start: 5.0, end: 10.0 },
        unsupportedPhrases: ['flying car'],
        reasoning: 'VideoHallucer benchmark trigger caught: No aerial or flying vehicle exists in physical pixel evidence. Contradicted assertion purged.'
      }
    ],
    explainability: [
      {
        statementId: 'claim_001',
        sceneId: 'scene_001',
        statement: 'A dog runs across the grassy field in vh_vid1.',
        status: 'supported',
        confidence: 98,
        explanation: 'Factual premise confirmed by frame inspection at 0s to 5s.',
        timestamps: { start: 0, end: 5.0 },
        evidenceFrames: ['/frames/sample_clip_frames/sample_clip_scene_001_t1.jpg']
      },
      {
        statementId: 'claim_002',
        sceneId: 'scene_002',
        statement: 'A flying car hovers above the park in vh_vid1.',
        status: 'contradicted',
        confidence: 12,
        explanation: 'Hallucination Defense: Zero aerial pixels detected; contradicted assertion eliminated from narrative.',
        timestamps: { start: 5.0, end: 10.0 },
        evidenceFrames: ['/frames/sample_clip_frames/sample_clip_scene_001_t2.jpg']
      }
    ],
    speakers: [],
    narrativeText: 'A dog sprints across an open lawn and successfully retrieves a ball in the grass.'
  }
];
