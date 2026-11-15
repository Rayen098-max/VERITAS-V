import os
import sys
import json
import random
import logging
from typing import List, Dict, Any

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

SPLITS_DIR = "data/training/splits"

def validate_and_split(
    input_path: str,
    prefix: str,
    train_ratio: float = 0.80,
    val_ratio: float = 0.10,
    seed: int = 42
):
    os.makedirs(SPLITS_DIR, exist_ok=True)
    if not os.path.exists(input_path):
        logging.warning(f"File not found: {input_path}")
        return

    valid_samples: List[Dict[str, Any]] = []
    token_lengths = []

    with open(input_path, "r", encoding="utf-8") as f:
        for line_no, line in enumerate(f, 1):
            line_str = line.strip()
            if not line_str:
                continue

            try:
                item = json.loads(line_str)
            except json.JSONDecodeError as e:
                logging.warning(f"Line {line_no}: Malformed JSON in {input_path}: {e}")
                continue

            # Validate message structure
            messages = item.get("messages", [])
            if len(messages) < 2:
                logging.warning(f"Line {line_no}: Insufficient messages ({len(messages)})")
                continue

            # Validate assistant response is valid JSON
            assistant_content = messages[-1].get("content", "")
            try:
                json.loads(assistant_content)
            except Exception:
                logging.warning(f"Line {line_no}: Assistant response not valid JSON")
                continue

            # Validate image if present
            image_path = item.get("image")
            if image_path and os.path.exists(image_path):
                from PIL import Image
                try:
                    with Image.open(image_path) as img:
                        img.verify()
                except Exception as e:
                    logging.warning(f"Line {line_no}: Corrupted image {image_path}: {e}")
                    continue

            # Token length heuristic (roughly 4 chars per token)
            total_chars = sum(len(m.get("content", "")) for m in messages)
            est_tokens = total_chars // 4
            token_lengths.append(est_tokens)

            valid_samples.append(item)

    if not valid_samples:
        logging.error(f"No valid samples found in {input_path}")
        return

    # Telemetry report
    avg_tokens = sum(token_lengths) / len(token_lengths)
    max_tokens = max(token_lengths)
    logging.info(f"[{prefix.upper()}] Valid Samples: {len(valid_samples)} | Avg Tokens: ~{avg_tokens:.0f} | Max Tokens: ~{max_tokens}")

    # Stratified grouping by task category and label
    groups: Dict[str, List[Dict[str, Any]]] = {}
    for sample in valid_samples:
        task = sample.get("task_type", "default")
        is_neg = sample.get("is_synthetic_negative", False)
        group_key = f"{task}_{is_neg}"
        groups.setdefault(group_key, []).append(sample)

    train_set, val_set, test_set = [], [], []

    for group_key, group_items in groups.items():
        random.seed(seed)
        random.shuffle(group_items)
        n_grp = len(group_items)

        n_train = max(1, int(n_grp * train_ratio)) if n_grp > 2 else 1
        n_val = max(1, int(n_grp * val_ratio)) if n_grp > 3 else (1 if n_grp > 1 else 0)

        train_set.extend(group_items[:n_train])
        val_set.extend(group_items[n_train:n_train + n_val])
        remainder = group_items[n_train + n_val:]
        if remainder:
            test_set.extend(remainder)
        else:
            test_set.extend(group_items[:max(1, len(group_items) // 2)])

    splits = {
        "train": train_set,
        "val": val_set,
        "test": test_set
    }

    for split_name, split_data in splits.items():
        out_file = os.path.join(SPLITS_DIR, f"{prefix}_{split_name}.jsonl")
        with open(out_file, "w", encoding="utf-8") as f:
            for d in split_data:
                f.write(json.dumps(d) + "\n")
        logging.info(f"  -> Exported {len(split_data)} samples to {out_file}")

def main():
    logging.info("=== Starting Data Validation & Stratified Splitting ===")
    
    # 1. Captioner Data
    captioner_raw = "data/training/captioner_sft.jsonl"
    validate_and_split(captioner_raw, prefix="captioner")

    # 2. Causal / Verifier Data (using augmented dataset)
    causal_augmented = "data/training/causal_verifier_augmented.jsonl"
    if not os.path.exists(causal_augmented):
        causal_augmented = "data/training/causal_verifier_sft.jsonl"
    validate_and_split(causal_augmented, prefix="causal_verifier")

if __name__ == "__main__":
    main()
