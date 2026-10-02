import type {
  VideoAnalysisResult,
  BenchmarkScoreRecord,
  BackendConfigState,
  PipelineExecutionLog
} from '../types';

export const INITIAL_CONFIG: BackendConfigState = {
  captioningBackend: 'gpt4o',
  narrativeBackend: 'mock',
  causalBackend: 'mock',
  verificationBackend: 'mock',
  explainabilityStyle: 'structured',
  pySceneDetectThreshold: 40.0,
  minSceneLength: 300,
  numFramesPerScene: 4,
  whisperModelSize: 'base',
  transcriptRepeatThreshold: 8,
  useBatchApi: true,
};

export const MOCK_VIDEOS: VideoAnalysisResult[] = [
  {
    video_id: 'sample_clip_001',
    title: 'Chemistry Lab Chemical Spill Incident',
    category: 'Workplace Safety & Incident Auditing',
    video_url: '/media/lab_incident_sample.mp4',
    duration: 24.5,
    narrative_coherence_score: 0.92,
    overall_narrative:
      'In a chemistry laboratory setting, a researcher in safety goggles is measuring liquid at a central workstation. At 00:08, the researcher loses grip on an unfastened Pyrex reagent beaker due to residual solvent on nitrile gloves. The beaker falls toward the ceramic tiled floor and shatters upon impact at 00:10, splashing inert saline solution across the aisle. Recognizing the hazard, an adjacent colleague retrieves a spill containment kit and signals the safety supervisor at 00:18, initiating standard decontamination procedures.',
    scenes: {
      scene_001: {
        start_time: 0.0,
        end_time: 7.8,
        frame_files: ['frame_001.jpg', 'frame_002.jpg', 'frame_003.jpg', 'frame_004.jpg'],
        transcript_text: 'Adding approximately forty milliliters of buffer solution to flask two.',
        caption: 'A laboratory researcher wearing blue nitrile gloves pours liquid between glassware on a clean bench.',
        keywords: ['researcher', 'flask', 'gloves', 'bench', 'saline', 'measurement']
      },
      scene_002: {
        start_time: 7.8,
        end_time: 14.2,
        frame_files: ['frame_008.jpg', 'frame_009.jpg', 'frame_010.jpg', 'frame_011.jpg'],
        transcript_text: 'Watch out, it slipped—careful on the tiles!',
        caption: 'The researcher fumbles a heavy glass beaker, which slips from the hand, falls downwards, and shatters into fragments on the floor.',
        keywords: ['beaker', 'drops', 'glass', 'shatter', 'floor', 'spill', 'tiles']
      },
      scene_003: {
        start_time: 14.2,
        end_time: 19.5,
        frame_files: ['frame_016.jpg', 'frame_017.jpg', 'frame_018.jpg', 'frame_019.jpg'],
        transcript_text: 'Grabbing the absorbent pads and neutralizing agent from cabinet C.',
        caption: 'A second laboratory worker in a white coat rushes from an adjacent bay carrying a yellow chemical spill neutralizer kit.',
        keywords: ['colleague', 'spill kit', 'yellow', 'absorbent', 'assistance', 'cabinet']
      },
      scene_004: {
        start_time: 19.5,
        end_time: 24.5,
        frame_files: ['frame_024.jpg', 'frame_025.jpg', 'frame_026.jpg', 'frame_027.jpg'],
        transcript_text: 'Floor is cordoned off with high-visibility markers. Room ventilation nominal.',
        caption: 'The perimeter of the liquid spill is marked with caution tape while the glass shards are swept into a sharps receptacle.',
        keywords: ['cordon', 'cleanup', 'hazard', 'tape', 'sharps', 'safety']
      }
    },
    causal_claims: [
      {
        scene_id: 'scene_002',
        event: 'Glass beaker falls and shatters on tile floor',
        cause_scene_id: 'scene_001',
        cause: 'Researcher lost traction on glassware surface during liquid transfer',
        causal_statement: 'The glass beaker shattered on the tiled floor because the researcher lost grip while transferring saline between flasks.',
        confidence: 0.94,
        keyword_overlap: ['flask', 'glass', 'transfer'],
        link_status: 'linked'
      },
      {
        scene_id: 'scene_003',
        event: 'Colleague retrieves chemical spill kit from cabinet C',
        cause_scene_id: 'scene_002',
        cause: 'Glass breakage created liquid containment hazard on aisle floor',
        causal_statement: 'A second worker retrieved the spill containment kit because broken glass and liquid presented an active slip and chemical hazard.',
        confidence: 0.96,
        keyword_overlap: ['spill', 'glass', 'floor'],
        link_status: 'linked'
      },
      {
        scene_id: 'scene_004',
        event: 'Caution markers deployed and broken glass swept into sharps container',
        cause_scene_id: 'scene_003',
        cause: 'Arrival of containment materials enabled systematic hazard remediation',
        causal_statement: 'Perimeter cordoning commenced because containment equipment was delivered to isolate the contaminated zone.',
        confidence: 0.91,
        keyword_overlap: ['spill kit', 'cleanup', 'hazard'],
        link_status: 'linked'
      },
      {
        scene_id: 'scene_002',
        event: 'Researcher kicked the work bench deliberately',
        cause_scene_id: 'scene_001',
        cause: 'Aggressive emotional response to failed experiment',
        causal_statement: 'The beaker fell because the operator aggressively kicked the laboratory bench leg.',
        confidence: 0.12,
        keyword_overlap: [],
        link_status: 'no_link_detected'
      }
    ],
    verification_reports: [
      {
        scene_id: 'scene_002',
        claim: 'Person drops glass → Glass falls → Glass shatters on tiled surface',
        frame_files: ['frame_008.jpg', 'frame_009.jpg', 'frame_010.jpg', 'frame_011.jpg'],
        verdict: 'verified',
        confidence: 0.94,
        reasoning: 'Consecutive visual frames 008 through 011 confirm the downward trajectory of the cylindrical glass vessel from hand height (frame_008) to high-velocity impact with shattering glass shards visible at floor level (frame_010-011).'
      },
      {
        scene_id: 'scene_003',
        claim: 'Colleague retrieves yellow chemical spill kit from wall cabinet',
        frame_files: ['frame_016.jpg', 'frame_017.jpg', 'frame_018.jpg', 'frame_019.jpg'],
        verdict: 'verified',
        confidence: 0.95,
        reasoning: 'Extracted frames 016 through 018 show a male colleague opening yellow wall-mounted Cabinet C and carrying a labeled Spill Neutralizer container toward scene 002 coordinates.'
      },
      {
        scene_id: 'scene_002',
        claim: 'Researcher aggressively kicked the laboratory bench causing glassware to dislodge',
        frame_files: ['frame_008.jpg', 'frame_009.jpg'],
        verdict: 'contradicted',
        confidence: 0.92,
        reasoning: 'HALLUCINATION DETECTED: Frame 008 shows operator stance is stationary with both feet planted on anti-fatigue matting. Movement originates entirely from wrist flexion and glove slippage; zero mechanical impact on bench structure observed.'
      },
      {
        scene_id: 'scene_004',
        claim: 'Ventilation damper was manually throttled to 200 CFM during cleanup',
        frame_files: ['frame_026.jpg', 'frame_027.jpg'],
        verdict: 'unverified',
        confidence: 0.48,
        reasoning: 'Extracted frames show wall signage and floor cordon, but HVAC damper dial is outside visual camera FOV angle. Frame files exist and are uncorrupted, but claim cannot be visually corroborated without supplementary telemetry.'
      },
      {
        scene_id: 'scene_004',
        claim: 'Infrared thermal scan showed hot solvent reaction at 85 degrees Celsius',
        frame_files: ['frame_030_missing.jpg'],
        verdict: 'unverifiable',
        confidence: 0.05,
        reasoning: 'UNVERIFIABLE: Missing frame references. Optical camera feed does not possess calibrated FLIR thermal sensors, and corresponding frame indices are unavailable in dataset.'
      }
    ],
    explainability_claims: [
      {
        scene_id: 'scene_002',
        claim: 'Person drops glass → Glass falls → Glass shatters on tiled surface',
        verdict: 'verified',
        confidence: 0.94,
        evidence_frames: ['frame_008.jpg', 'frame_009.jpg', 'frame_010.jpg', 'frame_011.jpg'],
        start_time: 7.8,
        end_time: 14.2,
        included_in_narrative: true
      },
      {
        scene_id: 'scene_003',
        claim: 'Colleague retrieves yellow chemical spill kit from wall cabinet',
        verdict: 'verified',
        confidence: 0.95,
        evidence_frames: ['frame_016.jpg', 'frame_017.jpg', 'frame_018.jpg', 'frame_019.jpg'],
        start_time: 14.2,
        end_time: 19.5,
        included_in_narrative: true
      },
      {
        scene_id: 'scene_002',
        claim: 'Researcher aggressively kicked the laboratory bench causing glassware to dislodge',
        verdict: 'contradicted',
        confidence: 0.92,
        evidence_frames: ['frame_008.jpg', 'frame_009.jpg'],
        start_time: 7.8,
        end_time: 14.2,
        included_in_narrative: false
      },
      {
        scene_id: 'scene_004',
        claim: 'Ventilation damper was manually throttled to 200 CFM during cleanup',
        verdict: 'unverified',
        confidence: 0.48,
        evidence_frames: ['frame_026.jpg', 'frame_027.jpg'],
        start_time: 19.5,
        end_time: 24.5,
        included_in_narrative: true
      },
      {
        scene_id: 'scene_004',
        claim: 'Infrared thermal scan showed hot solvent reaction at 85 degrees Celsius',
        verdict: 'unverifiable',
        confidence: 0.05,
        evidence_frames: ['frame_030_missing.jpg'],
        start_time: 19.5,
        end_time: 24.5,
        included_in_narrative: false
      }
    ],
    diarization: {
      speakers: ['SPEAKER_00 (Lead Researcher)', 'SPEAKER_01 (Safety Responder)'],
      segments: [
        {
          speaker_id: 'SPEAKER_00',
          start_time: 0.5,
          end_time: 6.2,
          text: 'Adding approximately forty milliliters of buffer solution to flask two.',
          confidence: 0.97
        },
        {
          speaker_id: 'SPEAKER_00',
          start_time: 8.1,
          end_time: 11.4,
          text: 'Watch out, it slipped—careful on the tiles!',
          confidence: 0.94
        },
        {
          speaker_id: 'SPEAKER_01',
          start_time: 14.6,
          end_time: 18.9,
          text: 'Grabbing the absorbent pads and neutralizing agent from cabinet C.',
          confidence: 0.98
        },
        {
          speaker_id: 'SPEAKER_01',
          start_time: 20.0,
          end_time: 23.8,
          text: 'Floor is cordoned off with high-visibility markers. Room ventilation nominal.',
          confidence: 0.95
        }
      ],
      repeat_filter_stats: {
        words_evaluated: 184,
        repeated_phrases_dropped: 12,
        threshold: 8,
        filter_ratio: '6.52% noise reduction'
      }
    },
    evaluation_scores: {
      bleu_4: 0.384,
      rouge_l: 0.612,
      meteor: 0.428
    },
    raw_files: {
      captions_json: `{\n  "scene_001": {\n    "start_time": 0.0,\n    "end_time": 7.8,\n    "frame_files": ["frame_001.jpg", "frame_002.jpg", "frame_003.jpg", "frame_004.jpg"],\n    "transcript_text": "Adding approximately forty milliliters of buffer solution to flask two.",\n    "caption": "A laboratory researcher wearing blue nitrile gloves pours liquid between glassware on a clean bench.",\n    "keywords": ["researcher", "flask", "gloves", "bench", "saline", "measurement"]\n  },\n  "scene_002": {\n    "start_time": 7.8,\n    "end_time": 14.2,\n    "frame_files": ["frame_008.jpg", "frame_009.jpg", "frame_010.jpg", "frame_011.jpg"],\n    "transcript_text": "Watch out, it slipped—careful on the tiles!",\n    "caption": "The researcher fumbles a heavy glass beaker, which slips from the hand, falls downwards, and shatters into fragments on the floor.",\n    "keywords": ["beaker", "drops", "glass", "shatter", "floor", "spill", "tiles"]\n  }\n}`,
      narrative_txt: `In a chemistry laboratory setting, a researcher in safety goggles is measuring liquid at a central workstation. At 00:08, the researcher loses grip on an unfastened Pyrex reagent beaker due to residual solvent on nitrile gloves. The beaker falls toward the ceramic tiled floor and shatters upon impact at 00:10, splashing inert saline solution across the aisle. Recognizing the hazard, an adjacent colleague retrieves a spill containment kit and signals the safety supervisor at 00:18, initiating standard decontamination procedures.`,
      causal_json: `[\n  {\n    "scene_id": "scene_002",\n    "event": "Glass beaker falls and shatters on tile floor",\n    "cause_scene_id": "scene_001",\n    "cause": "Researcher lost traction on glassware surface during liquid transfer",\n    "causal_statement": "The glass beaker shattered on the tiled floor because the researcher lost grip while transferring saline between flasks.",\n    "confidence": 0.94\n  }\n]`,
      verification_json: `[\n  {\n    "scene_id": "scene_002",\n    "claim": "Person drops glass → Glass falls → Glass shatters on tiled surface",\n    "frame_files": ["frame_008.jpg", "frame_009.jpg", "frame_010.jpg", "frame_011.jpg"],\n    "verdict": "verified",\n    "confidence": 0.94,\n    "reasoning": "Consecutive visual frames 008 through 011 confirm the downward trajectory of the cylindrical glass vessel from hand height (frame_008) to high-velocity impact with shattering glass shards visible at floor level (frame_010-011)."\n  }\n]`,
      explained_json: `{\n  "video_id": "sample_clip_001",\n  "status": "completed",\n  "claims": [\n    {\n      "scene_id": "scene_002",\n      "claim": "Person drops glass → Glass falls → Glass shatters on tiled surface",\n      "verdict": "verified",\n      "confidence": 0.94,\n      "evidence_frames": ["frame_008.jpg", "frame_009.jpg", "frame_010.jpg", "frame_011.jpg"],\n      "start_time": 7.8,\n      "end_time": 14.2,\n      "included_in_narrative": true\n    }\n  ]\n}`,
      explained_md: `# VERITAS Explainability Audit Report: sample_clip_001\n\n**Generated by**: VERITAS Multi-Agent Vision-Language Pipeline\n**Verdict Summary**: 2 Verified, 1 Contradicted (Hallucination Purged), 1 Unverified, 1 Unverifiable\n\n## Verified Claims\n- [00:08 - 00:11] **Glass Beaker Breakage**: *Person drops glass → Glass falls → Glass shatters on tiled surface* (Confidence: 94%)\n  - Evidence Frames: \`frame_008.jpg\`, \`frame_009.jpg\`, \`frame_010.jpg\`, \`frame_011.jpg\`\n- [00:14 - 00:19] **Spill Kit Deployment**: *Colleague retrieves yellow chemical spill kit from wall cabinet* (Confidence: 95%)\n  - Evidence Frames: \`frame_016.jpg\` - \`frame_019.jpg\`\n\n## Purged Hallucinations\n- [00:08 - 00:14] **Intentional Kick Claim**: *Researcher aggressively kicked the laboratory bench* (Verdict: CONTRADICTED, Confidence: 92%)\n  - Reason: Stance analysis confirms feet grounded on anti-fatigue mat. Claim purged from synthesized causal narrative.\n`
    }
  },
  {
    video_id: 'msrvtt_7014',
    title: 'MSR-VTT 7014: Men\'s High Jump Final Attempt',
    category: 'Benchmark Sports Dataset (MSR-VTT Test-1K)',
    video_url: '/media/msrvtt_7014.mp4',
    duration: 15.2,
    narrative_coherence_score: 0.89,
    overall_narrative:
      'An athlete wearing red athletic gear begins a curved acceleration run across the tartan track apron. Approaching the uprights at 00:06, the athlete plants their takeoff foot and arches backward over the crossbar. The athlete clips the bar slightly with their left heel, causing the crossbar to vibrate vigorously without falling off the support pegs. The athlete lands securely on the padded foam mat and celebrates as the white clearance flag is displayed.',
    scenes: {
      scene_001: {
        start_time: 0.0,
        end_time: 5.5,
        frame_files: ['msr_001.jpg', 'msr_002.jpg', 'msr_003.jpg'],
        transcript_text: 'Crowd applauds in rhythm as he initiates his approach steps.',
        caption: 'A track athlete in red uniform starts sprinting toward the high jump mat.',
        keywords: ['athlete', 'track', 'sprint', 'approach', 'stadium']
      },
      scene_002: {
        start_time: 5.5,
        end_time: 10.8,
        frame_files: ['msr_008.jpg', 'msr_009.jpg', 'msr_010.jpg'],
        transcript_text: 'Up and over—he grazed it, but it stays up!',
        caption: 'The jumper leaps backwards over the elevated horizontal bar, grazing it lightly.',
        keywords: ['leap', 'crossbar', 'heel', 'jump', 'airborne']
      },
      scene_003: {
        start_time: 10.8,
        end_time: 15.2,
        frame_files: ['msr_014.jpg', 'msr_015.jpg'],
        transcript_text: 'Clean clearance confirmed by the judges on the side!',
        caption: 'The competitor lands on the safety mat, looks at the intact bar, and clenches fist in celebration.',
        keywords: ['landing', 'mat', 'celebration', 'clearance', 'flag']
      }
    },
    causal_claims: [
      {
        scene_id: 'scene_002',
        event: 'Crossbar vibrates intensely on support pegs',
        cause_scene_id: 'scene_001',
        cause: 'Heel contact during airborne backward arch',
        causal_statement: 'The crossbar vibrated because the athlete\'s left trailing heel brushed against the top surface during clearance.',
        confidence: 0.91,
        keyword_overlap: ['crossbar', 'jump'],
        link_status: 'linked'
      },
      {
        scene_id: 'scene_003',
        event: 'Competitor celebrates on foam landing cushion',
        cause_scene_id: 'scene_002',
        cause: 'Crossbar remained intact without dislodging',
        causal_statement: 'The competitor celebrated upon landing because the grazed bar remained balanced on the pegs.',
        confidence: 0.95,
        keyword_overlap: ['crossbar', 'clearance'],
        link_status: 'linked'
      }
    ],
    verification_reports: [
      {
        scene_id: 'scene_002',
        claim: 'Crossbar remains on pegs despite trailing heel contact',
        frame_files: ['msr_009.jpg', 'msr_010.jpg'],
        verdict: 'verified',
        confidence: 0.93,
        reasoning: 'High-speed frame 010 shows vibration amplitude damping out while both ends remain supported on standard 5cm rests.'
      },
      {
        scene_id: 'scene_002',
        claim: 'Athlete performed a forward somersault dive over the bar',
        frame_files: ['msr_008.jpg', 'msr_009.jpg'],
        verdict: 'contradicted',
        confidence: 0.96,
        reasoning: 'HALLUCINATION DETECTED: Standard Fosbury flop technique observed with spine arched supine towards ground; no forward somersault rotation detected.'
      }
    ],
    explainability_claims: [
      {
        scene_id: 'scene_002',
        claim: 'Crossbar remains on pegs despite trailing heel contact',
        verdict: 'verified',
        confidence: 0.93,
        evidence_frames: ['msr_009.jpg', 'msr_010.jpg'],
        start_time: 5.5,
        end_time: 10.8,
        included_in_narrative: true
      },
      {
        scene_id: 'scene_002',
        claim: 'Athlete performed a forward somersault dive over the bar',
        verdict: 'contradicted',
        confidence: 0.96,
        evidence_frames: ['msr_008.jpg', 'msr_009.jpg'],
        start_time: 5.5,
        end_time: 10.8,
        included_in_narrative: false
      }
    ],
    diarization: {
      speakers: ['SPEAKER_00 (Announcer)'],
      segments: [
        {
          speaker_id: 'SPEAKER_00',
          start_time: 0.5,
          end_time: 5.0,
          text: 'Crowd applauds in rhythm as he initiates his approach steps.',
          confidence: 0.92
        },
        {
          speaker_id: 'SPEAKER_00',
          start_time: 5.8,
          end_time: 9.8,
          text: 'Up and over—he grazed it, but it stays up!',
          confidence: 0.96
        },
        {
          speaker_id: 'SPEAKER_00',
          start_time: 11.2,
          end_time: 14.5,
          text: 'Clean clearance confirmed by the judges on the side!',
          confidence: 0.94
        }
      ],
      repeat_filter_stats: {
        words_evaluated: 92,
        repeated_phrases_dropped: 4,
        threshold: 8,
        filter_ratio: '4.35% noise reduction'
      }
    },
    evaluation_scores: {
      bleu_4: 0.412,
      rouge_l: 0.648,
      meteor: 0.456
    },
    raw_files: {
      captions_json: `{\n  "scene_001": {\n    "start_time": 0.0,\n    "end_time": 5.5,\n    "caption": "A track athlete in red uniform starts sprinting toward the high jump mat."\n  }\n}`,
      narrative_txt: `An athlete wearing red athletic gear begins a curved acceleration run across the tartan track apron...`,
      causal_json: `[\n  {\n    "scene_id": "scene_002",\n    "event": "Crossbar vibrates intensely on support pegs",\n    "confidence": 0.91\n  }\n]`,
      verification_json: `[\n  {\n    "scene_id": "scene_002",\n    "verdict": "verified",\n    "confidence": 0.93\n  }\n]`,
      explained_json: `{\n  "video_id": "msrvtt_7014",\n  "status": "completed"\n}`,
      explained_md: `# VERITAS Audit Report: msrvtt_7014\nClean clearance confirmed.`
    }
  },
  {
    video_id: 'traffic_safety_09',
    title: 'Traffic Intersection Vehicle Near-Collision',
    category: 'Surveillance & Public Safety Auditing',
    video_url: '/media/traffic_intersection.mp4',
    duration: 18.0,
    narrative_coherence_score: 0.88,
    overall_narrative:
      'Under daylight conditions at a busy four-way suburban intersection, an eastbound silver sedan enters on a late amber signal at 00:04. Simultaneously, a northbound delivery van initiates an unprotected left turn at 00:07. The silver sedan operator applies heavy emergency braking at 00:09, causing ABS tire screeching and front suspension compression. The vehicles halt within 1.2 meters of mutual clearance without physical chassis contact, after which both drivers reverse cautiously to clear pedestrian lanes.',
    scenes: {
      scene_001: {
        start_time: 0.0,
        end_time: 6.0,
        frame_files: ['traffic_001.jpg', 'traffic_002.jpg', 'traffic_003.jpg'],
        transcript_text: '[Traffic ambient noise, engine acceleration]',
        caption: 'Silver sedan accelerates toward intersection as traffic signal cycles to amber.',
        keywords: ['sedan', 'signal', 'amber', 'intersection', 'speed']
      },
      scene_002: {
        start_time: 6.0,
        end_time: 12.0,
        frame_files: ['traffic_007.jpg', 'traffic_008.jpg', 'traffic_009.jpg'],
        transcript_text: '[Sharp brake squeal, acoustic horn beep]',
        caption: 'White delivery van turns across oncoming traffic; silver sedan executes high-rate emergency braking.',
        keywords: ['van', 'turn', 'braking', 'near-miss', 'skid']
      },
      scene_003: {
        start_time: 12.0,
        end_time: 18.0,
        frame_files: ['traffic_013.jpg', 'traffic_014.jpg'],
        transcript_text: '[Idling engines, hazard flashers engage]',
        caption: 'Both vehicles pause in intersection box with hazard indicators flashing before reversing.',
        keywords: ['hazard', 'clearance', 'reversing', 'safe']
      }
    },
    causal_claims: [
      {
        scene_id: 'scene_002',
        event: 'Silver sedan executes emergency deceleration lockup',
        cause_scene_id: 'scene_001',
        cause: 'Delivery van occupied oncoming lane trajectory during turn',
        causal_statement: 'The sedan braked abruptly because the delivery van turned across its direct line of travel without yielding right-of-way.',
        confidence: 0.97,
        keyword_overlap: ['van', 'turn', 'intersection'],
        link_status: 'linked'
      }
    ],
    verification_reports: [
      {
        scene_id: 'scene_002',
        claim: 'Silver sedan front bumper made contact with van side panel',
        frame_files: ['traffic_008.jpg', 'traffic_009.jpg'],
        verdict: 'contradicted',
        confidence: 0.94,
        reasoning: 'CONTRADICTED: Frame 009 confirms continuous daylight gap of approx 1.2m between front license plate and van quarter panel. No mechanical damage or debris present.'
      },
      {
        scene_id: 'scene_002',
        claim: 'Silver sedan ABS engaged and vehicle stopped before contact',
        frame_files: ['traffic_008.jpg', 'traffic_009.jpg'],
        verdict: 'verified',
        confidence: 0.96,
        reasoning: 'VERIFIED: Pitch attitude shows front suspension nose-dive with tire smoke consistent with rapid anti-lock deceleration.'
      }
    ],
    explainability_claims: [
      {
        scene_id: 'scene_002',
        claim: 'Silver sedan ABS engaged and vehicle stopped before contact',
        verdict: 'verified',
        confidence: 0.96,
        evidence_frames: ['traffic_008.jpg', 'traffic_009.jpg'],
        start_time: 6.0,
        end_time: 12.0,
        included_in_narrative: true
      },
      {
        scene_id: 'scene_002',
        claim: 'Silver sedan front bumper made contact with van side panel',
        verdict: 'contradicted',
        confidence: 0.94,
        evidence_frames: ['traffic_008.jpg', 'traffic_009.jpg'],
        start_time: 6.0,
        end_time: 12.0,
        included_in_narrative: false
      }
    ],
    diarization: {
      speakers: ['ENVIRONMENTAL_AUDIO'],
      segments: [
        {
          speaker_id: 'ENVIRONMENTAL_AUDIO',
          start_time: 6.2,
          end_time: 8.5,
          text: '[Acoustic signature: 3.2 kHz brake screech and twin-tone vehicle horn alert]',
          confidence: 0.91
        }
      ],
      repeat_filter_stats: {
        words_evaluated: 40,
        repeated_phrases_dropped: 0,
        threshold: 8,
        filter_ratio: '0.0% noise reduction'
      }
    },
    evaluation_scores: {
      bleu_4: 0.365,
      rouge_l: 0.589,
      meteor: 0.398
    },
    raw_files: {
      captions_json: `{\n  "scene_001": {\n    "caption": "Silver sedan enters intersection on late amber signal."\n  }\n}`,
      narrative_txt: `Under daylight conditions at a busy four-way suburban intersection...`,
      causal_json: `[]`,
      verification_json: `[]`,
      explained_json: `{}`,
      explained_md: `# Traffic Audit`
    }
  }
];

export const BENCHMARK_SCORES: BenchmarkScoreRecord[] = [
  {
    video_id: 'video_7014',
    dataset: 'MSR-VTT',
    duration: 15.2,
    ground_truth_reference: 'A track and field athlete runs up and successfully clears a high jump bar onto a mat.',
    generated_narrative: 'An athlete wearing red athletic gear begins a curved acceleration run across the track apron, leaps backwards over the elevated horizontal bar, and lands cleanly on the foam safety mat.',
    bleu_4: 0.412,
    rouge_l: 0.648,
    meteor: 0.456,
    hallucination_rate: 0.04
  },
  {
    video_id: 'video_7015',
    dataset: 'MSR-VTT',
    duration: 12.4,
    ground_truth_reference: 'A chef slices red bell peppers on a wooden cutting board with a sharp knife.',
    generated_narrative: 'A professional cook uses a stainless steel chef knife to julienne fresh red bell peppers on an oiled hardwood chopping block before placing them in a prep bowl.',
    bleu_4: 0.395,
    rouge_l: 0.621,
    meteor: 0.441,
    hallucination_rate: 0.02
  },
  {
    video_id: 'video_7018',
    dataset: 'MSR-VTT',
    duration: 21.0,
    ground_truth_reference: 'A young woman plays an acoustic guitar and sings into a studio microphone.',
    generated_narrative: 'In a soundproof acoustic booth, a musician fingerpicks a Dreadnought acoustic guitar while performing vocals into a condenser microphone equipped with a pop filter.',
    bleu_4: 0.428,
    rouge_l: 0.665,
    meteor: 0.472,
    hallucination_rate: 0.05
  },
  {
    video_id: 'video_7020',
    dataset: 'MSR-VTT',
    duration: 28.6,
    ground_truth_reference: 'Two dogs wrestle and chase a tennis ball across a grassy park.',
    generated_narrative: 'A golden retriever and a black border collie sprint across an open park lawn, tumbling playfully while chasing a bouncing neon tennis ball thrown from off-screen.',
    bleu_4: 0.372,
    rouge_l: 0.598,
    meteor: 0.419,
    hallucination_rate: 0.08
  },
  {
    video_id: 'video_7022',
    dataset: 'MSR-VTT',
    duration: 19.8,
    ground_truth_reference: 'Mechanic removes a car tire using a pneumatic air impact wrench.',
    generated_narrative: 'Inside an auto repair bay, a mechanic loosens five lug nuts using an air impact tool, lifts the alloy wheel off the hub assembly, and rolls it to the tire balancer.',
    bleu_4: 0.403,
    rouge_l: 0.634,
    meteor: 0.450,
    hallucination_rate: 0.03
  },
  {
    video_id: 'anet_v_102',
    dataset: 'ActivityNet',
    duration: 45.0,
    ground_truth_reference: 'A group of people assemble a camping tent on a mountain clearing and pitch stakes into the ground.',
    generated_narrative: 'Three campers unroll a four-person dome tent over a level gravel pitch, thread flexible fiberglass poles through fabric sleeves, and hammer steel stakes securely into the soil.',
    bleu_4: 0.361,
    rouge_l: 0.574,
    meteor: 0.392,
    hallucination_rate: 0.06
  },
  {
    video_id: 'anet_v_109',
    dataset: 'ActivityNet',
    duration: 62.4,
    ground_truth_reference: 'A person teaches how to replace a broken phone screen step by step with heat gun and suction cup.',
    generated_narrative: 'A technician applies low-temperature heat around the phone glass bezel, attaches a suction tool to pry up the cracked digitizer, and disconnects the ribbon flex cable from the mainboard.',
    bleu_4: 0.388,
    rouge_l: 0.609,
    meteor: 0.435,
    hallucination_rate: 0.04
  }
];

export const MODEL_BENCHMARK_COMPARISON = [
  {
    backend: 'Mock Backend (Baseline)',
    bleu_4: 0.182,
    rouge_l: 0.324,
    meteor: 0.215,
    hallucination_catch_rate: 0.42,
    avg_latency_sec: 1.2,
    cost_per_video: '$0.00'
  },
  {
    backend: 'Qwen2.5-VL (Local VLM)',
    bleu_4: 0.364,
    rouge_l: 0.582,
    meteor: 0.418,
    hallucination_catch_rate: 0.81,
    avg_latency_sec: 14.8,
    cost_per_video: '$0.00 (GPU)'
  },
  {
    backend: 'GPT-4o + VERITAS (Multi-Agent)',
    bleu_4: 0.418,
    rouge_l: 0.652,
    meteor: 0.468,
    hallucination_catch_rate: 0.94,
    avg_latency_sec: 6.5,
    cost_per_video: '$0.038'
  }
];

export const ENV_SPECS = [
  { key: 'HUGGINGFACE_TOKEN', type: 'string', sample: 'hf_xxxxxxxxxxxx', desc: 'Authentication token for downloading Hugging Face checkpoints (Whisper, etc.)' },
  { key: 'VIDEO_PATH', type: 'path', sample: 'media/sample_clip.mp4', desc: 'Path to target video file or batch directory for processing' },
  { key: 'PY_SCENE_DETECT_THRESHOLD', type: 'float', sample: '40.0', desc: 'Sensitivity cutoff for PySceneDetect content detection (lower = more scenes)' },
  { key: 'MIN_SCENE_LENGTH', type: 'int', sample: '300', desc: 'Minimum scene length in video frames to prevent micro-segmentation' },
  { key: 'NUM_FRAMES_PER_SCENE', type: 'int', sample: '4', desc: 'Number of representative frames extracted via FFmpeg per scene' },
  { key: 'OPENAI_API_KEY', type: 'secret', sample: 'sk-proj-...', desc: 'OpenAI API key used for GPT-4o captioning & LLM reasoning stages' },
  { key: 'CHAT_GPT_MODEL', type: 'string', sample: 'gpt-4o-mini', desc: 'ChatGPT model identifier used in captioning prompts' },
  { key: 'CHAT_GPT_RETRIES', type: 'int', sample: '10', desc: 'Exponential backoff retry limit on API rate-limits or transient timeouts' },
  { key: 'USE_BATCH_API', type: 'boolean', sample: 'true', desc: 'Toggles OpenAI 24hr Batch API for 50% discount and high-volume queuing' },
  { key: 'CAPTIONING_BACKEND', type: 'enum', sample: 'gpt4o', desc: 'Active captioning backend: gpt4o | mock | qwen25vl' },
  { key: 'MOCK_CAPTIONING', type: 'boolean', sample: 'false', desc: 'Legacy override: if true forces CAPTIONING_BACKEND=mock' },
  { key: 'INCLUDE_TRANSCRIPT_IN_GPT', type: 'boolean', sample: 'true', desc: 'Feeds Whisper transcribed dialogue into VLM captioning prompt' },
  { key: 'TRANSCRIPT_REPEAT_THRESHOLD', type: 'int', sample: '8', desc: 'Frequency threshold to filter hallucinated repeated speech phrases' },
  { key: 'TRANSCRIPT_CACHE_DIR', type: 'path', sample: 'transcripts', desc: 'Local directory caching Whisper transcription JSONs' },
  { key: 'WHISPER_MODEL_SIZE', type: 'enum', sample: 'base', desc: 'Whisper architecture size: tiny | base | small | medium | large' },
  { key: 'LOGS_DIR', type: 'path', sample: 'logs', desc: 'Directory where structured execution and cost logs are stored' },
  { key: 'CAPTIONS_DIR', type: 'path', sample: 'captions', desc: 'Target directory where JSON artifacts and Markdown reports are saved' },
  { key: 'NARRATIVE_BACKEND', type: 'enum', sample: 'mock', desc: 'Narrative synthesis agent backend: mock | llm' },
  { key: 'CAUSAL_BACKEND', type: 'enum', sample: 'mock', desc: 'Causal reasoning agent backend: mock | llm' },
  { key: 'VERIFICATION_BACKEND', type: 'enum', sample: 'mock', desc: 'Hallucination verification agent backend: mock | llm' },
  { key: 'EXPLAINABILITY_STYLE', type: 'enum', sample: 'structured', desc: 'Final report assembly style: structured | narrative_llm' }
];

export const SIMULATED_PIPELINE_LOGS: PipelineExecutionLog[] = [
  {
    id: 'log-1',
    timestamp: '14:22:01.104',
    stage: 'Scene Detection',
    agent: 'PySceneDetect Agent',
    level: 'INFO',
    message: 'Analyzing sample_clip_001.mp4 (24.50s, 1920x1080 @ 30fps)...'
  },
  {
    id: 'log-2',
    timestamp: '14:22:02.430',
    stage: 'Scene Detection',
    agent: 'PySceneDetect Agent',
    level: 'SUCCESS',
    message: 'Detected 4 distinct scenes (threshold=40.0, min_len=300). Boundaries: [0.0-7.8s, 7.8-14.2s, 14.2-19.5s, 19.5-24.5s].'
  },
  {
    id: 'log-3',
    timestamp: '14:22:03.118',
    stage: 'Frame Extraction',
    agent: 'FFmpeg Worker',
    level: 'INFO',
    message: 'Extracting 4 keyframes per scene into frames/sample_clip_001/... Total 16 frames written.'
  },
  {
    id: 'log-4',
    timestamp: '14:22:04.225',
    stage: 'Audio Transcription',
    agent: 'Whisper Base Engine',
    level: 'INFO',
    message: 'Extracting audio stream (16kHz mono PCM). Running VAD and speech decoding...'
  },
  {
    id: 'log-5',
    timestamp: '14:22:05.890',
    stage: 'Audio Transcription',
    agent: 'Whisper Base Engine',
    level: 'SUCCESS',
    message: 'Transcribed 4 dialogue segments. Applied repeat filter (threshold=8, dropped 12 noise tokens).'
  },
  {
    id: 'log-6',
    timestamp: '14:22:06.310',
    stage: 'VLM Captioning',
    agent: 'GPT-4o Vision Adapter',
    level: 'INFO',
    message: 'Batching 4 scene frame sets + transcript context. Prompting GPT-4o with structured JSON schema...'
  },
  {
    id: 'log-7',
    timestamp: '14:22:09.640',
    stage: 'VLM Captioning',
    agent: 'GPT-4o Vision Adapter',
    level: 'SUCCESS',
    message: 'Received 4 scene captions & 22 keyword tags. Token usage: prompt=2,840, completion=312. Est cost: $0.018.'
  },
  {
    id: 'log-8',
    timestamp: '14:22:10.120',
    stage: 'Narrative Synthesis',
    agent: 'Narrative Synthesis Agent',
    level: 'INFO',
    message: 'Merging scene captions with chronological rhetorical connectors into continuous story...'
  },
  {
    id: 'log-9',
    timestamp: '14:22:10.840',
    stage: 'Narrative Synthesis',
    agent: 'Narrative Synthesis Agent',
    level: 'SUCCESS',
    message: 'Synthesized 98-word narrative prose. Computed narrative coherence score = 0.92.'
  },
  {
    id: 'log-10',
    timestamp: '14:22:11.450',
    stage: 'Causal Reasoning',
    agent: 'Causal Reasoning Agent',
    level: 'INFO',
    message: 'Evaluating inter-scene event transitions. Computing keyword overlap graph between scene pairs...'
  },
  {
    id: 'log-11',
    timestamp: '14:22:12.780',
    stage: 'Causal Reasoning',
    agent: 'Causal Reasoning Agent',
    level: 'SUCCESS',
    message: 'Inferred 3 valid cause-effect relationships. Flagged 1 orphan claim with no_link_detected (keyword overlap=0).'
  },
  {
    id: 'log-12',
    timestamp: '14:22:13.200',
    stage: 'Hallucination Verification',
    agent: 'Hallucination Verification Agent',
    level: 'WARN',
    message: 'Cross-referencing claim "Researcher kicked bench" against frame_008.jpg and frame_009.jpg...'
  },
  {
    id: 'log-13',
    timestamp: '14:22:14.650',
    stage: 'Hallucination Verification',
    agent: 'Hallucination Verification Agent',
    level: 'ERROR',
    message: 'HALLUCINATION DETECTED: Claim "deliberate bench kick" contradicted by frame visual evidence. Verdict: CONTRADICTED (conf=0.92).'
  },
  {
    id: 'log-14',
    timestamp: '14:22:15.110',
    stage: 'Hallucination Verification',
    agent: 'Hallucination Verification Agent',
    level: 'SUCCESS',
    message: 'Claim "Person drops glass → Glass falls → Glass shatters" VERIFIED across frames 008-011 (conf=0.94).'
  },
  {
    id: 'log-15',
    timestamp: '14:22:15.900',
    stage: 'Explainability Assembly',
    agent: 'Deterministic Assembler',
    level: 'SUCCESS',
    message: 'Generated captions/sample_clip_001_explained.json and explained.md. All evidence citations verified.'
  }
];
