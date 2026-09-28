import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
import os
import json
import subprocess

def evaluate():
    gt_path = "datasets/videohallucer/ground_truth.json"
    if not os.path.exists(gt_path):
        print("Run load_videohallucer_sample.py first.")
        return
        
    with open(gt_path, "r", encoding="utf-8") as f:
        ground_truth = json.load(f)
        
    videos = list(ground_truth.keys())
    
    # Run Stage 4
    for vid_id in videos:
        print(f"Running verification for {vid_id}...")
        subprocess.run(["python", "src/pipeline/stage4_verification.py", "--input", f"output/{vid_id}_captions.json"], check=True)
        
    # Evaluate
    results = []
    total_tp = 0
    total_fp = 0
    total_fn = 0
    
    for vid_id in videos:
        ver_path = f"output/{vid_id}_verification.json"
        
        with open(ver_path, "r", encoding="utf-8") as f:
            ver_data = json.load(f)
            
        # Create mapping of claim -> verdict
        verdicts = {v["claim"]: v["verdict"] for v in ver_data}
        
        vid_tp, vid_fp, vid_fn = 0, 0, 0
        
        for gt_claim in ground_truth[vid_id]["claims"]:
            text = gt_claim["text"]
            true_label = gt_claim["label"].lower()
            pred_label = verdicts.get(text, "").lower()
            
            # Hallucination detection: detecting 'contradicted' (hallucinated) claims
            if true_label == "contradicted":
                if pred_label == "contradicted":
                    vid_tp += 1
                else:
                    vid_fn += 1
            elif true_label == "supported":
                if pred_label == "contradicted":
                    vid_fp += 1
                    
        prec = vid_tp / (vid_tp + vid_fp) if (vid_tp + vid_fp) > 0 else 0.0
        rec = vid_tp / (vid_tp + vid_fn) if (vid_tp + vid_fn) > 0 else 0.0
        f1 = 2 * (prec * rec) / (prec + rec) if (prec + rec) > 0 else 0.0
        
        total_tp += vid_tp
        total_fp += vid_fp
        total_fn += vid_fn
        
        results.append({
            "video_id": vid_id,
            "precision": prec,
            "recall": rec,
            "f1": f1
        })
        
    avg_prec = total_tp / (total_tp + total_fp) if (total_tp + total_fp) > 0 else 0.0
    avg_rec = total_tp / (total_tp + total_fn) if (total_tp + total_fn) > 0 else 0.0
    avg_f1 = 2 * (avg_prec * avg_rec) / (avg_prec + avg_rec) if (avg_prec + avg_rec) > 0 else 0.0
    
    md_path = "output/videohallucer_evaluation.md"
    with open(md_path, "w", encoding="utf-8") as f:
        f.write("## VideoHallucer Verification Evaluation\n\n")
        f.write("| Video ID | Precision | Recall (Catch Rate) | F1-Score |\n")
        f.write("|----------|-----------|---------------------|----------|\n")
        
        for r in results:
            f.write(f"| {r['video_id']} | {r['precision']:.4f} | {r['recall']:.4f} | {r['f1']:.4f} |\n")
            
        f.write(f"| **Overall** | **{avg_prec:.4f}** | **{avg_rec:.4f}** | **{avg_f1:.4f}** |\n")
        
    print(f"Evaluation report saved to {md_path}")

if __name__ == "__main__":
    evaluate()
