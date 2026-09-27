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
    id: 'analysis_001',
    videoName: 'laboratory_experiment.mp4',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    fileSize: '18.4 MB',
    duration: 20,
    dateAnalyzed: '2026-08-28 14:32',
    status: 'completed',
    trustScore: 87,
    scenesCount: 4,
    statementsCount: 4,
    verifiedCount: 3,
    hallucinationsCount: 1,
    scenes: [
      {
        sceneId: 'scene_01',
        startTime: 0,
        endTime: 5,
        caption: 'A person enters the laboratory and walks towards the equipment desk.',
        confidence: 94,
        keywords: ['person', 'laboratory', 'desk', 'walk'],
        frameFiles: [
          'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=300&q=80',
          'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300&q=80'
        ]
      },
      {
        sceneId: 'scene_02',
        startTime: 5,
        endTime: 10,
        caption: 'The person, wearing a blue shirt, picks up a chemical beaker from the shelf.',
        confidence: 82,
        keywords: ['person', 'beaker', 'shelf', 'blue shirt'],
        frameFiles: [
          'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=300&q=80',
          'https://images.unsplash.com/photo-1579154204601-01588f351167?w=300&q=80'
        ]
      },
      {
        sceneId: 'scene_03',
        startTime: 10,
        endTime: 15,
        caption: 'The person carefully pours the liquid from the beaker into a glass flask.',
        confidence: 89,
        keywords: ['pour', 'beaker', 'liquid', 'flask'],
        frameFiles: [
          'https://images.unsplash.com/photo-1532187643603-ba119ca4109e?w=300&q=80',
          'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=300&q=80'
        ]
      },
      {
        sceneId: 'scene_04',
        startTime: 15,
        endTime: 20,
        caption: 'The mixture changes color from clear to deep purple, releasing minor vapor.',
        confidence: 96,
        keywords: ['color change', 'purple', 'vapor', 'reaction'],
        frameFiles: [
          'https://images.unsplash.com/photo-1527018601619-a508a2be00cd?w=300&q=80',
          'https://images.unsplash.com/photo-1617155093730-a8bf47be792d?w=300&q=80'
        ]
      }
    ],
    causalRelations: [
      {
        sceneId: 'scene_01',
        event: 'A person enters the laboratory and walks towards the equipment desk.',
        causeSceneId: null,
        cause: null,
        causalStatement: 'A person enters the laboratory and walks towards the equipment desk.',
        confidence: 'no_prior_scene',
        confidenceScore: 100,
        startTime: 0,
        endTime: 5
      },
      {
        sceneId: 'scene_02',
        event: 'The person picks up a chemical beaker from the shelf.',
        causeSceneId: 'scene_01',
        cause: 'A person enters the laboratory and walks towards the equipment desk.',
        causalStatement: 'The person picks up a chemical beaker from the shelf, likely because they walked towards the equipment desk.',
        confidence: 'mock-heuristic',
        confidenceScore: 78,
        startTime: 5,
        endTime: 10
      },
      {
        sceneId: 'scene_03',
        event: 'The person carefully pours the liquid from the beaker into a glass flask.',
        causeSceneId: 'scene_02',
        cause: 'The person picks up a chemical beaker from the shelf.',
        causalStatement: 'The person carefully pours the liquid from the beaker into a glass flask, likely because they picked up the chemical beaker.',
        confidence: 'mock-heuristic',
        confidenceScore: 88,
        startTime: 10,
        endTime: 15
      },
      {
        sceneId: 'scene_04',
        event: 'The mixture changes color from clear to deep purple.',
        causeSceneId: 'scene_03',
        cause: 'The person carefully pours the liquid from the beaker into a glass flask.',
        causalStatement: 'The mixture changes color from clear to deep purple, likely because they poured the liquid from the beaker into the glass flask.',
        confidence: 'mock-heuristic',
        confidenceScore: 94,
        startTime: 15,
        endTime: 20
      }
    ],
    verifications: [
      {
        statementId: 'claim_001',
        sceneId: 'scene_01',
        statement: 'The person enters the laboratory and walks towards the equipment desk.',
        status: 'supported',
        confidence: 95,
        evidenceFrames: [
          'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=600&q=80',
          'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80'
        ],
        timestamps: { start: 0, end: 5 },
        reasoning: 'Visual inspection confirms the presence of a researcher walking into a laboratory setup towards a work bench.'
      },
      {
        statementId: 'claim_002',
        sceneId: 'scene_02',
        statement: 'The person, wearing a blue shirt, picks up a chemical beaker from the shelf.',
        status: 'unsupported',
        confidence: 45,
        evidenceFrames: [
          'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&q=80',
          'https://images.unsplash.com/photo-1579154204601-01588f351167?w=600&q=80'
        ],
        timestamps: { start: 5, end: 10 },
        unsupportedPhrases: ['blue shirt'],
        reasoning: 'Visual verification error detected. The researcher is wearing a dark gray protective jacket/shirt, NOT a blue shirt. The claim of a "blue shirt" is a visual hallucination.'
      },
      {
        statementId: 'claim_003',
        sceneId: 'scene_03',
        statement: 'The person carefully pours the liquid from the beaker into a glass flask.',
        status: 'supported',
        confidence: 91,
        evidenceFrames: [
          'https://images.unsplash.com/photo-1532187643603-ba119ca4109e?w=600&q=80',
          'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=600&q=80'
        ],
        timestamps: { start: 10, end: 15 },
        reasoning: 'Visual data confirms pouring action. A clear fluid stream is visible moving from a graduated beaker into an Erlenmeyer flask.'
      },
      {
        statementId: 'claim_004',
        sceneId: 'scene_04',
        statement: 'The mixture changes color from clear to deep purple, releasing minor vapor.',
        status: 'supported',
        confidence: 97,
        evidenceFrames: [
          'https://images.unsplash.com/photo-1527018601619-a508a2be00cd?w=600&q=80',
          'https://images.unsplash.com/photo-1617155093730-a8bf47be792d?w=600&q=80'
        ],
        timestamps: { start: 15, end: 20 },
        reasoning: 'Chromatic change is verified. The fluid inside the flask changes color to purple. Light vapor is visible escaping from the neck.'
      }
    ],
    explainability: [
      {
        statementId: 'claim_001',
        sceneId: 'scene_01',
        statement: 'The person enters the laboratory and walks towards the equipment desk.',
        status: 'supported',
        confidence: 95,
        explanation: 'The researcher entering the laboratory acts as the prerequisite action. Grounded in initial frames at 00:00 - 00:05.',
        timestamps: { start: 0, end: 5 },
        evidenceFrames: [
          'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=600&q=80',
          'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80'
        ]
      },
      {
        statementId: 'claim_002',
        sceneId: 'scene_02',
        statement: 'The person, wearing a blue shirt, picks up a chemical beaker from the shelf.',
        status: 'unsupported',
        confidence: 45,
        explanation: 'Hallucination alert. The subject is wearing a gray shirt, disproving the VLM generated description of a blue shirt. The action of picking up a beaker is verified, but the descriptive color tag is incorrect.',
        timestamps: { start: 5, end: 10 },
        evidenceFrames: [
          'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&q=80',
          'https://images.unsplash.com/photo-1579154204601-01588f351167?w=600&q=80'
        ]
      },
      {
        statementId: 'claim_003',
        sceneId: 'scene_03',
        statement: 'The person carefully pours the liquid from the beaker into a glass flask.',
        status: 'supported',
        confidence: 91,
        explanation: 'This action is causal. Transferring the reactive fluid initiates chemical contact. Grounded in frames 10s to 15s.',
        timestamps: { start: 10, end: 15 },
        evidenceFrames: [
          'https://images.unsplash.com/photo-1532187643603-ba119ca4109e?w=600&q=80',
          'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=600&q=80'
        ]
      },
      {
        statementId: 'claim_004',
        sceneId: 'scene_04',
        statement: 'The mixture changes color from clear to deep purple, releasing minor vapor.',
        status: 'supported',
        confidence: 97,
        explanation: 'This reaction is the direct consequence of the chemical transfer in scene 03. Grounded in chromatic shift frames at 15s to 20s.',
        timestamps: { start: 15, end: 20 },
        evidenceFrames: [
          'https://images.unsplash.com/photo-1527018601619-a508a2be00cd?w=600&q=80',
          'https://images.unsplash.com/photo-1617155093730-a8bf47be792d?w=600&q=80'
        ]
      }
    ],
    speakers: [
      {
        id: 'sp_01',
        speakerId: 'SPEAKER_00',
        speakerName: 'Man 1',
        startTime: 1.5,
        endTime: 4.8,
        transcription: 'I will now prepare the catalyst sample for the color change demonstration.'
      },
      {
        id: 'sp_02',
        speakerId: 'SPEAKER_01',
        speakerName: 'Man 2',
        startTime: 5.2,
        endTime: 9.5,
        transcription: 'Make sure you record the timestamp for the exact moment of chemical reaction.'
      },
      {
        id: 'sp_03',
        speakerId: 'SPEAKER_00',
        speakerName: 'Man 1',
        startTime: 10.5,
        endTime: 16.0,
        transcription: 'Starting the fluid transfer now... yes, the color transition is starting to occur as expected.'
      }
    ],
    narrativeText: 'A person enters the laboratory and walks towards the equipment desk. The person picks up a chemical beaker from the shelf. The person carefully pours the liquid from the beaker into a glass flask. The mixture changes color from clear to deep purple, releasing minor vapor.'
  },
  {
    id: 'analysis_002',
    videoName: 'security_corridor_incident.mp4',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    fileSize: '12.1 MB',
    duration: 15,
    dateAnalyzed: '2026-08-28 11:15',
    status: 'completed',
    trustScore: 94,
    scenesCount: 3,
    statementsCount: 3,
    verifiedCount: 3,
    hallucinationsCount: 0,
    scenes: [
      {
        sceneId: 'scene_01',
        startTime: 0,
        endTime: 5,
        caption: 'A cardboard box is sitting on the floor in the middle of a hallway corridor.',
        confidence: 96,
        keywords: ['box', 'corridor', 'floor', 'hallway'],
        frameFiles: [
          'https://images.unsplash.com/photo-1595246140625-573b715d11dc?w=300&q=80'
        ]
      },
      {
        sceneId: 'scene_02',
        startTime: 5,
        endTime: 10,
        caption: 'A person walking down the corridor accidentally trips over the cardboard box.',
        confidence: 91,
        keywords: ['person', 'trip', 'box', 'fall'],
        frameFiles: [
          'https://images.unsplash.com/photo-1508847154043-be12a62861c1?w=300&q=80'
        ]
      },
      {
        sceneId: 'scene_03',
        startTime: 10,
        endTime: 15,
        caption: 'The cardboard box slides across the floor and items spill out from it.',
        confidence: 95,
        keywords: ['box', 'slide', 'items', 'spill'],
        frameFiles: [
          'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=300&q=80'
        ]
      }
    ],
    causalRelations: [
      {
        sceneId: 'scene_01',
        event: 'A cardboard box is sitting on the floor in the middle of a hallway corridor.',
        causeSceneId: null,
        cause: null,
        causalStatement: 'A cardboard box is sitting on the floor in the middle of a hallway corridor.',
        confidence: 'no_prior_scene',
        confidenceScore: 100,
        startTime: 0,
        endTime: 5
      },
      {
        sceneId: 'scene_02',
        event: 'A person walking down the corridor accidentally trips over the cardboard box.',
        causeSceneId: 'scene_01',
        cause: 'A cardboard box is sitting on the floor in the middle of a hallway corridor.',
        causalStatement: 'A person walking down the corridor accidentally trips over the cardboard box, likely because the cardboard box was sitting on the floor.',
        confidence: 'mock-heuristic',
        confidenceScore: 92,
        startTime: 5,
        endTime: 10
      },
      {
        sceneId: 'scene_03',
        event: 'The cardboard box slides across the floor and items spill out from it.',
        causeSceneId: 'scene_02',
        cause: 'A person walking down the corridor accidentally trips over the cardboard box.',
        causalStatement: 'The cardboard box slides across the floor and items spill out, likely because the person tripped over it.',
        confidence: 'mock-heuristic',
        confidenceScore: 95,
        startTime: 10,
        endTime: 15
      }
    ],
    verifications: [
      {
        statementId: 'claim_001',
        sceneId: 'scene_01',
        statement: 'A cardboard box is sitting on the floor in the middle of a hallway corridor.',
        status: 'supported',
        confidence: 98,
        evidenceFrames: [
          'https://images.unsplash.com/photo-1595246140625-573b715d11dc?w=600&q=80'
        ],
        timestamps: { start: 0, end: 5 },
        reasoning: 'Cardboard package positioning in the center pathway is visible and confirmed.'
      },
      {
        statementId: 'claim_002',
        sceneId: 'scene_02',
        statement: 'A person walking down the corridor accidentally trips over the cardboard box.',
        status: 'supported',
        confidence: 93,
        evidenceFrames: [
          'https://images.unsplash.com/photo-1508847154043-be12a62861c1?w=600&q=80'
        ],
        timestamps: { start: 5, end: 10 },
        reasoning: 'Visual action verification indicates the foot contact with the box resulting in loss of balance.'
      },
      {
        statementId: 'claim_003',
        sceneId: 'scene_03',
        statement: 'The cardboard box slides across the floor and items spill out from it.',
        status: 'supported',
        confidence: 96,
        evidenceFrames: [
          'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&q=80'
        ],
        timestamps: { start: 10, end: 15 },
        reasoning: 'Box displacement and subsequent contents scatter are visually present.'
      }
    ],
    explainability: [
      {
        statementId: 'claim_001',
        sceneId: 'scene_01',
        statement: 'A cardboard box is sitting on the floor in the middle of a hallway corridor.',
        status: 'supported',
        confidence: 98,
        explanation: 'Initial state setting the spatial hazard in the hallway. Grounded in frames 0s to 5s.',
        timestamps: { start: 0, end: 5 },
        evidenceFrames: [
          'https://images.unsplash.com/photo-1595246140625-573b715d11dc?w=600&q=80'
        ]
      },
      {
        statementId: 'claim_002',
        sceneId: 'scene_02',
        statement: 'A person walking down the corridor accidentally trips over the cardboard box.',
        status: 'supported',
        confidence: 93,
        explanation: 'The spatial hazard (box) from scene 01 causes the physical collision as the subject walks. Grounded in collision frames from 5s to 10s.',
        timestamps: { start: 5, end: 10 },
        evidenceFrames: [
          'https://images.unsplash.com/photo-1508847154043-be12a62861c1?w=600&q=80'
        ]
      },
      {
        statementId: 'claim_003',
        sceneId: 'scene_03',
        statement: 'The cardboard box slides across the floor and items spill out from it.',
        status: 'supported',
        confidence: 96,
        explanation: 'The physical force of the collision in scene 02 transfers kinetic energy to the box, causing displacement and spilling contents. Grounded in final frames from 10s to 15s.',
        timestamps: { start: 10, end: 15 },
        evidenceFrames: [
          'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&q=80'
        ]
      }
    ],
    speakers: [], // No speaker information (tests empty speaker states)
    narrativeText: 'A cardboard box is sitting on the floor in the middle of a hallway corridor. A person walking down the corridor accidentally trips over the cardboard box. The cardboard box slides across the floor and items spill out from it.'
  }
];
