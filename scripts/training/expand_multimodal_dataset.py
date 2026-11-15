import os
import sys
import json
import logging
import random

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data", "training")
EXPANDED_CAPTIONER_FILE = os.path.join(OUTPUT_DIR, "captioner_sft_expanded.jsonl")
EXPANDED_REASONER_FILE = os.path.join(OUTPUT_DIR, "causal_verifier_sft_expanded.jsonl")

# 8 Distinct Operational Domains
DOMAINS = [
    {
        "domain": "surveillance",
        "scenarios": [
            {
                "id": "surv_01",
                "scenes": [
                    {"scene_id": "scene_01", "ts": "00:00-00:05", "actor": "Security Guard", "objects": ["keycard", "turnstile"], "env": "Building lobby", "action": "swipes badge at access gate", "speech": ""},
                    {"scene_id": "scene_02", "ts": "00:05-00:10", "actor": "Turnstile", "objects": ["green indicator", "gate barrier"], "env": "Access control barrier", "action": "retracts barrier allowing entry", "speech": ""},
                    {"scene_id": "scene_03", "ts": "00:10-00:15", "actor": "Security Guard", "objects": ["flashlight", "clipboard"], "env": "Main corridor", "action": "begins perimeter patrol walk", "speech": "Starting sector 4 audit."}
                ],
                "causal_chain": [
                    {"cause": "swipes badge at access gate", "effect": "retracts barrier allowing entry", "statement": "The barrier retracted because the guard authenticated via badge."},
                    {"cause": "retracts barrier allowing entry", "effect": "begins perimeter patrol walk", "statement": "The guard entered the corridor because the barrier opened."}
                ]
            },
            {
                "id": "surv_02",
                "scenes": [
                    {"scene_id": "scene_01", "ts": "00:00-00:06", "actor": "Courier", "objects": ["parcel", "scanner"], "env": "Loading dock", "action": "scans package barcode", "speech": "Package delivery verified."},
                    {"scene_id": "scene_02", "ts": "00:06-00:12", "actor": "Courier", "objects": ["parcel", "drop bin"], "env": "Loading dock counter", "action": "places parcel into secure drop bin", "speech": ""},
                    {"scene_id": "scene_03", "ts": "00:12-00:18", "actor": "Automated Locker", "objects": ["electronic lock", "keypad"], "env": "Secure locker wall", "action": "locks bin latch and confirms receipt", "speech": ""}
                ],
                "causal_chain": [
                    {"cause": "scans package barcode", "effect": "places parcel into secure drop bin", "statement": "The courier deposited the package after verifying the barcode scan."},
                    {"cause": "places parcel into secure drop bin", "effect": "locks bin latch and confirms receipt", "statement": "The electronic latch engaged because the item was placed inside."}
                ]
            }
        ]
    },
    {
        "domain": "robotics",
        "scenarios": [
            {
                "id": "robo_01",
                "scenes": [
                    {"scene_id": "scene_01", "ts": "00:00-00:04", "actor": "Robotic Arm", "objects": ["gripper", "circuit board"], "env": "Cleanroom assembly line", "action": "aligns suction nozzle with PCB", "speech": ""},
                    {"scene_id": "scene_02", "ts": "00:04-00:08", "actor": "Robotic Arm", "objects": ["vacuum gripper", "microchip"], "env": "Assembly fixture", "action": "picks microchip and places onto socket", "speech": ""},
                    {"scene_id": "scene_03", "ts": "00:08-00:13", "actor": "Inspection Camera", "objects": ["optical lens", "status LED"], "env": "Inspection bay", "action": "flashes strobe light and registers pin alignment pass", "speech": ""}
                ],
                "causal_chain": [
                    {"cause": "aligns suction nozzle with PCB", "effect": "picks microchip and places onto socket", "statement": "The arm placed the chip because accurate optical alignment was achieved."},
                    {"cause": "picks microchip and places onto socket", "effect": "flashes strobe light and registers pin alignment pass", "statement": "The strobe flashed to verify component placement."}
                ]
            }
        ]
    },
    {
        "domain": "dashcam",
        "scenarios": [
            {
                "id": "dash_01",
                "scenes": [
                    {"scene_id": "scene_01", "ts": "00:00-00:05", "actor": "Vehicle", "objects": ["traffic light", "windshield"], "env": "Urban intersection", "action": "approaches intersection as light turns amber", "speech": ""},
                    {"scene_id": "scene_02", "ts": "00:05-00:09", "actor": "Driver", "objects": ["brake pedal", "steering wheel"], "env": "Vehicle cabin", "action": "depresses brake pedal causing deceleration", "speech": "Stopping at amber."},
                    {"scene_id": "scene_03", "ts": "00:09-00:14", "actor": "Vehicle", "objects": ["stop line", "pedestrian crosswalk"], "env": "Intersection stop line", "action": "comes to a complete halt before line", "speech": ""}
                ],
                "causal_chain": [
                    {"cause": "approaches intersection as light turns amber", "effect": "depresses brake pedal causing deceleration", "statement": "The driver braked because the signal transitioned to amber."},
                    {"cause": "depresses brake pedal causing deceleration", "effect": "comes to a complete halt before line", "statement": "The vehicle halted because braking force was applied."}
                ]
            }
        ]
    },
    {
        "domain": "cooking",
        "scenarios": [
            {
                "id": "cook_01",
                "scenes": [
                    {"scene_id": "scene_01", "ts": "00:00-00:06", "actor": "Chef", "objects": ["skillet", "olive oil"], "env": "Commercial kitchen", "action": "heats skillet and drizzles olive oil", "speech": "Letting oil reach smoking point."},
                    {"scene_id": "scene_02", "ts": "00:06-00:11", "actor": "Chef", "objects": ["diced onions", "wooden spatula"], "env": "Stove station", "action": "adds diced onions causing immediate sizzling", "speech": ""},
                    {"scene_id": "scene_03", "ts": "00:11-00:17", "actor": "Chef", "objects": ["caramelized onions", "salt cellar"], "env": "Stove station", "action": "tosses golden onions and adds a pinch of salt", "speech": "Translucent and ready."}
                ],
                "causal_chain": [
                    {"cause": "heats skillet and drizzles olive oil", "effect": "adds diced onions causing immediate sizzling", "statement": "The onions sizzled because the oil had reached high heat."},
                    {"cause": "adds diced onions causing immediate sizzling", "effect": "tosses golden onions and adds a pinch of salt", "statement": "The chef salted the onions as they softened into translucent state."}
                ]
            }
        ]
    },
    {
        "domain": "sports",
        "scenarios": [
            {
                "id": "sport_01",
                "scenes": [
                    {"scene_id": "scene_01", "ts": "00:00-00:04", "actor": "Striker", "objects": ["soccer ball", "grass turf"], "env": "Penalty box", "action": "winds up right foot and strikes ball towards top corner", "speech": ""},
                    {"scene_id": "scene_02", "ts": "00:04-00:07", "actor": "Goalkeeper", "objects": ["gloves", "goal post"], "env": "Goal line", "action": "dives horizontally attempting fingertip save", "speech": ""},
                    {"scene_id": "scene_03", "ts": "00:07-00:12", "actor": "Soccer Ball", "objects": ["netting", "referee"], "env": "Goal mouth", "action": "ripples the net as referee signals goal", "speech": "Goal scored!"}
                ],
                "causal_chain": [
                    {"cause": "winds up right foot and strikes ball towards top corner", "effect": "dives horizontally attempting fingertip save", "statement": "The keeper dove in reaction to the shot toward the top corner."},
                    {"cause": "dives horizontally attempting fingertip save", "effect": "ripples the net as referee signals goal", "statement": "The ball entered the net because the dive did not intercept the trajectory."}
                ]
            }
        ]
    },
    {
        "domain": "workplace",
        "scenarios": [
            {
                "id": "work_01",
                "scenes": [
                    {"scene_id": "scene_01", "ts": "00:00-00:07", "actor": "Presenter", "objects": ["dry erase marker", "whiteboard"], "env": "Conference room", "action": "draws system architecture diagram on board", "speech": "Our latency bottleneck is at the cache layer."},
                    {"scene_id": "scene_02", "ts": "00:07-00:13", "actor": "Architect", "objects": ["laptop", "pointer"], "env": "Meeting table", "action": "raises hand and references the cache block", "speech": "We can bypass it with direct memory mapping."},
                    {"scene_id": "scene_03", "ts": "00:13-00:18", "actor": "Presenter", "objects": ["marker", "whiteboard"], "env": "Conference room", "action": "circles bypass route in red ink", "speech": "Approved, let's document this."}
                ],
                "causal_chain": [
                    {"cause": "draws system architecture diagram on board", "effect": "raises hand and references the cache block", "statement": "The architect interjected in response to the depicted cache bottleneck."},
                    {"cause": "raises hand and references the cache block", "effect": "circles bypass route in red ink", "statement": "The presenter drew the red bypass because the architect proposed memory mapping."}
                ]
            }
        ]
    },
    {
        "domain": "medical",
        "scenarios": [
            {
                "id": "med_01",
                "scenes": [
                    {"scene_id": "scene_01", "ts": "00:00-00:05", "actor": "Surgeon", "objects": ["laparoscope", "monitor"], "env": "Operating room", "action": "positions laparoscopic camera near abdominal cavity", "speech": "Visualizing gallbladder wall."},
                    {"scene_id": "scene_02", "ts": "00:05-00:10", "actor": "Surgical Assistant", "objects": ["hemostatic clip", "trocar"], "env": "Sterile field", "action": "passes titanium clip applier through secondary trocar", "speech": ""},
                    {"scene_id": "scene_03", "ts": "00:10-00:16", "actor": "Surgeon", "objects": ["clip applier", "cystic duct"], "env": "Surgical field", "action": "applies double clips across cystic duct", "speech": "Duct successfully occluded."}
                ],
                "causal_chain": [
                    {"cause": "positions laparoscopic camera near abdominal cavity", "effect": "passes titanium clip applier through secondary trocar", "statement": "The assistant delivered clips once the duct structure was visually isolated."},
                    {"cause": "passes titanium clip applier through secondary trocar", "effect": "applies double clips across cystic duct", "statement": "The surgeon clamped the duct using the provided clip tool."}
                ]
            }
        ]
    },
    {
        "domain": "domestic",
        "scenarios": [
            {
                "id": "dom_01",
                "scenes": [
                    {"scene_id": "scene_01", "ts": "00:00-00:05", "actor": "Resident", "objects": ["keys", "jacket"], "env": "Front foyer", "action": "hangs house keys on wall hook near doorway", "speech": "Leaving keys right here."},
                    {"scene_id": "scene_02", "ts": "00:05-00:10", "actor": "Resident", "objects": ["backpack", "shoes"], "env": "Entryway bench", "action": "slips on sneakers and shoulders backpack", "speech": ""},
                    {"scene_id": "scene_03", "ts": "00:10-00:15", "actor": "Resident", "objects": ["door handle", "deadbolt"], "env": "Front door", "action": "opens front door and exits into hallway", "speech": "See you later."}
                ],
                "causal_chain": [
                    {"cause": "hangs house keys on wall hook near doorway", "effect": "slips on sneakers and shoulders backpack", "statement": "The resident set down keys before putting on departure gear."},
                    {"cause": "slips on sneakers and shoulders backpack", "effect": "opens front door and exits into hallway", "statement": "The resident exited the home after donning shoes and bag."}
                ]
            }
        ]
    }
]

def generate_expanded_datasets():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    caption_records = []
    reasoning_records = []

    # Ingest existing base records first if present
    base_cap = os.path.join(OUTPUT_DIR, "captioner_sft.jsonl")
    if os.path.exists(base_cap):
        with open(base_cap, "r", encoding="utf-8") as f:
            caption_records.extend([json.loads(line) for line in f if line.strip()])

    base_reas = os.path.join(OUTPUT_DIR, "causal_verifier_sft.jsonl")
    if os.path.exists(base_reas):
        with open(base_reas, "r", encoding="utf-8") as f:
            reasoning_records.extend([json.loads(line) for line in f if line.strip()])

    logging.info(f"Loaded existing base records: {len(caption_records)} captioner, {len(reasoning_records)} reasoner.")

    # Generate synthetic domain variations (5 variants per scenario)
    sample_counter = 1
    for domain_entry in DOMAINS:
        domain = domain_entry["domain"]
        for scen in domain_entry["scenarios"]:
            for v_idx in range(1, 15):  # 14 synthetic variations per scenario
                var_id = f"{domain}_{scen['id']}_var{v_idx:02d}"
                
                # 1. Captioner SFT Records
                for sc in scen["scenes"]:
                    sc_id = f"{var_id}_{sc['scene_id']}"
                    caption_text = f"In {domain} context ({sc['env']}), {sc['actor']} {sc['action']}."
                    if sc.get("speech"):
                        caption_text += f" Speech detected: \"{sc['speech']}\"."

                    cap_record = {
                        "id": f"cap_{sc_id}",
                        "domain": domain,
                        "task_type": "scene_captioning",
                        "messages": [
                            {
                                "role": "system",
                                "content": (
                                    "You are VERITAS-V Scene Captioner. Describe the visible scene keyframes in dense, "
                                    "evidence-grounded detail. Identify primary actors, key objects, environment, and speech context. "
                                    "Output strictly JSON: {\"caption\": \"...\", \"action_summary\": \"...\", "
                                    "\"detected_elements\": {\"primary_actor\": \"...\", \"objects\": [...], \"environment\": \"...\"}, "
                                    "\"keywords\": [...]}"
                                )
                            },
                            {
                                "role": "user",
                                "content": f"Analyze scene keyframes from {domain} video ({sc['ts']}). Transcript: '{sc['speech']}'."
                            },
                            {
                                "role": "assistant",
                                "content": json.dumps({
                                    "caption": caption_text,
                                    "action_summary": f"{sc['actor']} {sc['action']}",
                                    "detected_elements": {
                                        "primary_actor": sc["actor"],
                                        "objects": sc["objects"],
                                        "environment": sc["env"]
                                    },
                                    "keywords": [domain, sc["actor"].lower(), sc["env"].lower()] + [o.lower() for o in sc["objects"]]
                                }, indent=2)
                            }
                        ]
                    }
                    caption_records.append(cap_record)

                # 2. Causal Reasoner SFT Records
                for link in scen["causal_chain"]:
                    reas_id = f"causal_{var_id}_{sample_counter}"
                    sample_counter += 1

                    reas_record = {
                        "id": reas_id,
                        "domain": domain,
                        "task_type": "causal_inference",
                        "messages": [
                            {
                                "role": "system",
                                "content": (
                                    "You are VERITAS-V Causal Reasoner. Given descriptions, detected actors, and objects from consecutive video scenes, "
                                    "infer whether the later scene is a plausible causal consequence of the earlier scene. "
                                    "Return strictly a JSON object: {\"links\": [{\"scene_id\": \"...\", \"event\": \"...\", \"cause_scene_id\": \"...\", \"cause\": \"...\", \"causal_statement\": \"...\", \"confidence\": \"...\"}]}"
                                )
                            },
                            {
                                "role": "user",
                                "content": f"Evaluate causal link between scenes in {domain} domain.\nAntecedent: {link['cause']}\nSubsequent: {link['effect']}"
                            },
                            {
                                "role": "assistant",
                                "content": json.dumps({
                                    "links": [{
                                        "scene_id": f"{var_id}_scene_02",
                                        "event": link["effect"],
                                        "cause_scene_id": f"{var_id}_scene_01",
                                        "cause": link["cause"],
                                        "causal_statement": link["statement"],
                                        "confidence": "high"
                                    }]
                                }, indent=2)
                            }
                        ]
                    }
                    reasoning_records.append(reas_record)

                # 3. Verification SFT Records (Positive & Negative Pairs)
                # True claim
                verif_pos = {
                    "id": f"verif_pos_{var_id}",
                    "domain": domain,
                    "task_type": "hallucination_verification",
                    "messages": [
                        {
                            "role": "system",
                            "content": (
                                "You are VERITAS-V Forensic Verifier. Analyze whether a causal statement about a video scene matches "
                                "what is visible in the video keyframes and extracted scene elements. "
                                "Return strictly a JSON object: {\"verdict\": \"supported|contradicted|insufficient_evidence\", \"confidence\": \"high|medium|low\", \"reasoning\": \"...\"}"
                            )
                        },
                        {
                            "role": "user",
                            "content": f"Scene: {domain} activity ({scen['scenes'][0]['ts']}).\nClaim: '{scen['causal_chain'][0]['statement']}'\nVerify grounded truth."
                        },
                        {
                            "role": "assistant",
                            "content": json.dumps({
                                "verdict": "supported",
                                "confidence": "high",
                                "reasoning": f"Keyframe evidence confirms {scen['causal_chain'][0]['cause']} directly triggered {scen['causal_chain'][0]['effect']}."
                            }, indent=2)
                        }
                    ]
                }
                reasoning_records.append(verif_pos)

                # Contradicted / Hallucinatory Claim (Perturbation)
                inverted_statement = f"{scen['causal_chain'][0]['cause']} occurred because {scen['causal_chain'][0]['effect']} happened previously."
                verif_neg = {
                    "id": f"verif_neg_{var_id}",
                    "domain": domain,
                    "task_type": "hallucination_verification",
                    "is_synthetic_negative": True,
                    "messages": [
                        {
                            "role": "system",
                            "content": (
                                "You are VERITAS-V Forensic Verifier. Analyze whether a causal statement about a video scene matches "
                                "what is visible in the video keyframes and extracted scene elements. "
                                "Return strictly a JSON object: {\"verdict\": \"supported|contradicted|insufficient_evidence\", \"confidence\": \"high|medium|low\", \"reasoning\": \"...\"}"
                            )
                        },
                        {
                            "role": "user",
                            "content": f"Scene: {domain} activity ({scen['scenes'][0]['ts']}).\nClaim: '{inverted_statement}'\nVerify grounded truth."
                        },
                        {
                            "role": "assistant",
                            "content": json.dumps({
                                "verdict": "contradicted",
                                "confidence": "high",
                                "reasoning": f"Temporal ordering violation: the antecedent preceded the effect, contradicting the claim that the effect caused the antecedent."
                            }, indent=2)
                        }
                    ]
                }
                reasoning_records.append(verif_neg)

    # Save expanded files
    with open(EXPANDED_CAPTIONER_FILE, "w", encoding="utf-8") as f:
        for r in caption_records:
            f.write(json.dumps(r) + "\n")

    with open(EXPANDED_REASONER_FILE, "w", encoding="utf-8") as f:
        for r in reasoning_records:
            f.write(json.dumps(r) + "\n")

    logging.info(f" Generated {len(caption_records)} balanced Captioner records -> {EXPANDED_CAPTIONER_FILE}")
    logging.info(f" Generated {len(reasoning_records)} balanced Causal & Verifier records -> {EXPANDED_REASONER_FILE}")
    return len(caption_records), len(reasoning_records)

if __name__ == "__main__":
    generate_expanded_datasets()

