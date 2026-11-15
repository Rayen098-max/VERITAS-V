import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
import json
import logging

def evaluate():
    gt_path = "datasets/nextqa/ground_truth.json"
    if not os.path.exists(gt_path):
        print("datasets/nextqa/ground_truth.json not found. Run load_nextqa_sample.py first.")
        return
        
    with open(gt_path, "r", encoding="utf-8") as f:
        ground_truth = json.load(f)
        
    videos = list(ground_truth.keys())
    results = []

    for vid_id in videos:
        causal_path = f"output/{vid_id}_causal.json"
        narrative_path = f"output/{vid_id}_narrative.txt"

        causal_text = ""
        if os.path.exists(causal_path):
            try:
                with open(causal_path, "r", encoding="utf-8") as f:
                    causal_data = json.load(f)
                    if isinstance(causal_data, list):
                        causal_text = " ".join([c.get("causal_statement", "") for c in causal_data])
                    elif isinstance(causal_data, dict):
                        causal_text = str(causal_data)
            except Exception:
                pass

        if not causal_text and os.path.exists(narrative_path):
            try:
                with open(narrative_path, "r", encoding="utf-8", errors="replace") as f:
                    causal_text = f.read().strip()
            except Exception:
                pass

        qa_pairs = ground_truth[vid_id].get("qa_pairs", [])
        correct_why = 0
        total_why = 0
        correct_how = 0
        total_how = 0

        tokens_inferred = set(causal_text.lower().split())

        for qa in qa_pairs:
            q_type = qa.get("type", "why")
            ans = qa.get("answer", "").lower()
            ans_tokens = set(ans.split())

            # Evaluate concept presence
            overlap = len(tokens_inferred.intersection(ans_tokens))
            is_match = overlap > 0 or (len(ans_tokens) > 0 and overlap / len(ans_tokens) >= 0.3)

            if q_type == "why":
                total_why += 1
                if is_match:
                    correct_why += 1
            else:
                total_how += 1
                if is_match:
                    correct_how += 1

        total_q = total_why + total_how
        total_correct = correct_why + correct_how
        accuracy = (total_correct / max(1, total_q)) * 100.0

        all_gt_tokens = set(" ".join(qa["answer"] for qa in qa_pairs).lower().split())
        overlap_all = len(tokens_inferred.intersection(all_gt_tokens))
        prec = overlap_all / max(1, len(tokens_inferred)) if tokens_inferred else 0.0
        rec = overlap_all / max(1, len(all_gt_tokens)) if all_gt_tokens else 0.0

        results.append({
            "video_id": vid_id,
            "accuracy": accuracy,
            "causal_why_accuracy": (correct_why / max(1, total_why)) * 100.0 if total_why > 0 else 0.0,
            "temporal_how_accuracy": (correct_how / max(1, total_how)) * 100.0 if total_how > 0 else 0.0,
            "precision": prec,
            "recall": rec
        })

    avg_acc = sum(r["accuracy"] for r in results) / len(results) if results else 0
    avg_why = sum(r["causal_why_accuracy"] for r in results) / len(results) if results else 0
    avg_how = sum(r["temporal_how_accuracy"] for r in results) / len(results) if results else 0
    avg_prec = sum(r["precision"] for r in results) / len(results) if results else 0
    avg_rec = sum(r["recall"] for r in results) / len(results) if results else 0

    report = {
        "dataset": "NExT-QA",
        "n_videos": len(results),
        "averages": {
            "overall_accuracy": avg_acc,
            "causal_why_accuracy": avg_why,
            "temporal_how_accuracy": avg_how,
            "precision": avg_prec,
            "recall": avg_rec,
        },
        "per_video": results
    }

    # Save JSON report
    json_path = "output/nextqa_causal_evaluation.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    # Save Markdown report
    md_path = "output/nextqa_causal_evaluation.md"
    with open(md_path, "w", encoding="utf-8") as f:
        f.write("## NExT-QA Causal Evaluation\n\n")
        f.write("### Benchmark Averages\n\n")
        f.write("| Metric | Score |\n")
        f.write("|---|---|\n")
        f.write(f"| Overall Causal QA Accuracy | {avg_acc:.2f}% |\n")
        f.write(f"| 'Why' Causal Accuracy | {avg_why:.2f}% |\n")
        f.write(f"| 'How' Action Flow Accuracy | {avg_how:.2f}% |\n")
        f.write(f"| Concept Precision | {avg_prec:.4f} |\n")
        f.write(f"| Concept Recall | {avg_rec:.4f} |\n\n")
        f.write("### Per-Video Breakdown\n\n")
        f.write("| Video ID | Overall Acc | 'Why' Acc | 'How' Acc | Precision | Recall |\n")
        f.write("|----------|-------------|-----------|-----------|-----------|--------|\n")
        for r in results:
            f.write(f"| {r['video_id']} | {r['accuracy']:.2f}% | {r['causal_why_accuracy']:.2f}% | {r['temporal_how_accuracy']:.2f}% | {r['precision']:.4f} | {r['recall']:.4f} |\n")
        f.write(f"| **Average** | **{avg_acc:.2f}%** | **{avg_why:.2f}%** | **{avg_how:.2f}%** | **{avg_prec:.4f}** | **{avg_rec:.4f}** |\n")

    print(f"NExT-QA Evaluation report saved to {md_path} and {json_path}")

if __name__ == "__main__":
    evaluate()
