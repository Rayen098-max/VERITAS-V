import os
import sys
import json
import glob
import logging

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

OUTPUT_DIR = "data/training"
SFT_REASONER_FILE = os.path.join(OUTPUT_DIR, "causal_verifier_sft.jsonl")

SYSTEM_CAUSAL_PROMPT = (
    "You are VERITAS-V Causal Reasoner. Given descriptions, detected actors, and objects from consecutive video scenes, "
    "infer whether the later scene is a plausible causal consequence of the earlier scene. "
    "Do not hallucinate or force a causal link if none is implied. "
    "Return strictly a JSON object: {\"links\": [{\"scene_id\": \"...\", \"event\": \"...\", \"cause_scene_id\": \"...\", \"cause\": \"...\", \"causal_statement\": \"...\", \"confidence\": \"...\"}]}"
)

SYSTEM_VERIFIER_PROMPT = (
    "You are VERITAS-V Forensic Verifier. Analyze whether a causal statement about a video scene matches "
    "what is visible in the video keyframes and extracted scene elements. "
    "Classify as 'supported', 'contradicted', or 'insufficient_evidence', and provide rigorous evidence-based reasoning. "
    "Return strictly a JSON object: {\"verdict\": \"supported|contradicted|insufficient_evidence\", \"confidence\": \"high|medium|low\", \"reasoning\": \"...\"}"
)

def build_reasoning_sft_dataset():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    records = []

    # --- PARTITION 1: CAUSAL LINKAGE SFT (from output/*_causal.json and NExT-QA) ---
    causal_files = glob.glob("output/*_causal.json")
    logging.info(f"Ingesting {len(causal_files)} causal output files for SFT formatting.")

    for c_path in causal_files:
        try:
            with open(c_path, "r", encoding="utf-8") as f:
                c_links = json.load(f)
        except Exception:
            continue

        if not isinstance(c_links, list) or not c_links:
            continue

        prompt_input = f"Evaluate temporal and causal connections for the following video scenes:\n{json.dumps(c_links, indent=2)}"
        target_output = {"links": c_links}

        record = {
            "id": f"causal_{os.path.basename(c_path).removesuffix('.json')}",
            "task_type": "causal_inference",
            "messages": [
                {"role": "system", "content": SYSTEM_CAUSAL_PROMPT},
                {"role": "user", "content": prompt_input},
                {"role": "assistant", "content": json.dumps(target_output, indent=2)}
            ]
        }
        records.append(record)

    # Ingest NExT-QA ground truth pairs
    nextqa_gt_path = "datasets/nextqa/ground_truth.json"
    if os.path.exists(nextqa_gt_path):
        try:
            with open(nextqa_gt_path, "r", encoding="utf-8") as f:
                nextqa_data = json.load(f)
            
            for vid_id, data in nextqa_data.items():
                for idx, qa in enumerate(data.get("qa_pairs", [])):
                    q_text = qa.get("question", "")
                    ans_text = qa.get("answer", "")
                    q_type = qa.get("type", "why")

                    user_msg = (
                        f"Video Segment: {vid_id}\n"
                        f"Temporal Question ({q_type.upper()}): {q_text}\n"
                        "Provide the evidence-grounded cause-effect answer and rationale."
                    )
                    assistant_msg = {
                        "question": q_text,
                        "type": q_type,
                        "causal_answer": ans_text,
                        "causal_rationale": f"Action sequence in {vid_id} confirms {ans_text} as the direct antecedent.",
                        "confidence": "high"
                    }

                    records.append({
                        "id": f"nextqa_{vid_id}_{idx}",
                        "task_type": "causal_qa",
                        "messages": [
                            {"role": "system", "content": SYSTEM_CAUSAL_PROMPT},
                            {"role": "user", "content": user_msg},
                            {"role": "assistant", "content": json.dumps(assistant_msg, indent=2)}
                        ]
                    })
        except Exception as e:
            logging.warning(f"Failed to ingest NExT-QA: {e}")

    # --- PARTITION 2: HALLUCINATION VERIFICATION SFT (from VideoHallucer and output/*_verification.json) ---
    verif_files = glob.glob("output/*_verification.json")
    logging.info(f"Ingesting {len(verif_files)} verification files for SFT formatting.")

    for v_path in verif_files:
        try:
            with open(v_path, "r", encoding="utf-8") as f:
                v_items = json.load(f)
        except Exception:
            continue

        if not isinstance(v_items, list):
            continue

        for idx, item in enumerate(v_items):
            claim = item.get("claim", "")
            verdict = item.get("verdict", "unverified")
            reasoning = item.get("reasoning", "")
            conf = item.get("confidence", "medium")

            user_msg = (
                f"Scene ID: {item.get('scene_id')}\n"
                f"Causal Claim: \"{claim}\"\n"
                f"Referenced Frames: {item.get('frame_files', [])}\n\n"
                "Verify whether this claim is factually grounded in the scene or an unsupported hallucination."
            )
            assistant_msg = {
                "verdict": verdict,
                "confidence": conf,
                "reasoning": reasoning
            }

            records.append({
                "id": f"verif_{os.path.basename(v_path).removesuffix('.json')}_{idx}",
                "task_type": "hallucination_verification",
                "messages": [
                    {"role": "system", "content": SYSTEM_VERIFIER_PROMPT},
                    {"role": "user", "content": user_msg},
                    {"role": "assistant", "content": json.dumps(assistant_msg, indent=2)}
                ]
            })

    # Ingest VideoHallucer ground truth claims
    vh_gt_path = "datasets/videohallucer/ground_truth.json"
    if os.path.exists(vh_gt_path):
        try:
            with open(vh_gt_path, "r", encoding="utf-8") as f:
                vh_data = json.load(f)

            for vid_id, data in vh_data.items():
                for idx, c in enumerate(data.get("claims", [])):
                    claim_text = c.get("text", "")
                    true_label = c.get("label", "contradicted")
                    
                    user_msg = (
                        f"Video Target: {vid_id}\n"
                        f"Audit Claim: \"{claim_text}\"\n"
                        "Verify whether this claim is supported or contradicted by the visual action."
                    )
                    assistant_msg = {
                        "verdict": true_label,
                        "confidence": "high",
                        "reasoning": f"Cross-referencing video timeline confirms the statement is {true_label}."
                    }

                    records.append({
                        "id": f"videohallucer_{vid_id}_{idx}",
                        "task_type": "hallucination_verification",
                        "messages": [
                            {"role": "system", "content": SYSTEM_VERIFIER_PROMPT},
                            {"role": "user", "content": user_msg},
                            {"role": "assistant", "content": json.dumps(assistant_msg, indent=2)}
                        ]
                    })
        except Exception as e:
            logging.warning(f"Failed to ingest VideoHallucer: {e}")

    # Write SFT JSONL dataset
    with open(SFT_REASONER_FILE, "w", encoding="utf-8") as out_f:
        for r in records:
            out_f.write(json.dumps(r) + "\n")

    logging.info(f" Successfully exported {len(records)} Causal & Verification SFT pairs to {SFT_REASONER_FILE}")
    return SFT_REASONER_FILE

if __name__ == "__main__":
    build_reasoning_sft_dataset()

