import os
import sys
import json
import random
import logging
from typing import List, Dict, Any

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

# Mutation dictionaries for synthetic hallucination injection
ACTOR_MUTATIONS = {
    "man": ["woman", "robot", "child", "dog", "elderly person"],
    "woman": ["man", "athlete", "child", "dancer", "chef"],
    "person": ["animal", "statue", "vehicle", "group of people"],
    "boy": ["elderly man", "toddler", "police officer"],
    "girl": ["athlete", "mechanic", "musician"]
}

ACTION_MUTATIONS = {
    "walking": "sleeping on the floor",
    "running": "standing completely stationary",
    "talking": "playing the violin",
    "jumping": "sitting silently in a chair",
    "falling": "flying with wings",
    "dancing": "repairing a car engine",
    "cooking": "swimming underwater"
}

def perturb_claim_with_hallucination(claim: str) -> tuple[str, str, str]:
    """
    Injects a targeted semantic perturbation into a claim to synthesize a contradicted example.
    Returns: (perturbed_claim, ground_truth_verdict, explanation)
    """
    words = claim.split()
    perturbed = claim
    mutation_type = "action"

    # Try mutating action first
    for orig_act, mut_act in ACTION_MUTATIONS.items():
        if orig_act in claim.lower():
            perturbed = claim.lower().replace(orig_act, mut_act)
            return (
                perturbed.capitalize(),
                "contradicted",
                f"Contradicted by video keyframes: visual action shows '{orig_act}' rather than '{mut_act}'."
            )

    # Try mutating actor
    for orig_act, mut_list in ACTOR_MUTATIONS.items():
        if orig_act in claim.lower():
            chosen_mut = random.choice(mut_list)
            perturbed = claim.lower().replace(orig_act, chosen_mut)
            return (
                perturbed.capitalize(),
                "contradicted",
                f"Contradicted by video keyframes: subject identified is '{orig_act}', not '{chosen_mut}'."
            )

    # Fallback generic negation
    if "is " in claim:
        perturbed = claim.replace("is ", "is definitely not ")
    elif "are " in claim:
        perturbed = claim.replace("are ", "are definitely not ")
    else:
        perturbed = f"False claim that {claim[0].lower() + claim[1:]}"

    return (
        perturbed,
        "contradicted",
        "Contradicted by visual evidence: event did not occur in the referenced scene keyframes."
    )

def augment_causal_dataset(input_file: str, output_file: str, augmentation_factor: int = 2):
    """
    Augments the causal and verification SFT dataset with hard-negatives and synthetic perturbations.
    """
    if not os.path.exists(input_file):
        logging.warning(f"Input file {input_file} does not exist.")
        return

    with open(input_file, "r", encoding="utf-8") as f:
        samples = [json.loads(line) for line in f if line.strip()]

    augmented: List[Dict[str, Any]] = list(samples)
    logging.info(f"Loaded {len(samples)} baseline samples for contrastive augmentation.")

    for idx, sample in enumerate(samples):
        task_type = sample.get("task_type")
        messages = sample.get("messages", [])
        if len(messages) < 3:
            continue

        system_msg = messages[0]["content"]
        user_msg = messages[1]["content"]
        assistant_json_str = messages[2]["content"]

        try:
            assistant_obj = json.loads(assistant_json_str)
        except Exception:
            continue

        if task_type == "hallucination_verification" and assistant_obj.get("verdict") == "supported":
            # Extract claim text from user message
            if "Causal Claim: \"" in user_msg:
                orig_claim = user_msg.split("Causal Claim: \"")[1].split("\"")[0]
            elif "Audit Claim: \"" in user_msg:
                orig_claim = user_msg.split("Audit Claim: \"")[1].split("\"")[0]
            else:
                continue

            # Generate synthetic contradicted negative
            bad_claim, verdict, reasoning = perturb_claim_with_hallucination(orig_claim)
            new_user_msg = user_msg.replace(orig_claim, bad_claim)
            new_assistant_obj = {
                "verdict": verdict,
                "confidence": "high",
                "reasoning": reasoning
            }

            augmented.append({
                "id": f"{sample['id']}_synthetic_hard_negative",
                "task_type": "hallucination_verification",
                "is_synthetic_negative": True,
                "messages": [
                    {"role": "system", "content": system_msg},
                    {"role": "user", "content": new_user_msg},
                    {"role": "assistant", "content": json.dumps(new_assistant_obj, indent=2)}
                ]
            })

    with open(output_file, "w", encoding="utf-8") as f:
        for item in augmented:
            f.write(json.dumps(item) + "\n")

    logging.info(f"Augmentation complete: {len(samples)} -> {len(augmented)} samples saved to {output_file}")

if __name__ == "__main__":
    src = "data/training/causal_verifier_sft.jsonl"
    dest = "data/training/causal_verifier_augmented.jsonl"
    augment_causal_dataset(src, dest)

