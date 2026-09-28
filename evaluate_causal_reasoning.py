import os
import json
import subprocess
import glob

def calculate_overlap(inferred, ground_truth):
    inf_words = set(inferred.lower().split())
    gt_words = set(ground_truth.lower().split())
    if not inf_words or not gt_words:
        return 0.0, 0.0
    overlap = len(inf_words.intersection(gt_words))
    precision = overlap / len(inf_words)
    recall = overlap / len(gt_words)
    return precision, recall

def evaluate():
    gt_path = "datasets/nextqa/ground_truth.json"
    if not os.path.exists(gt_path):
        print("Run load_nextqa_sample.py first.")
        return
        
    with open(gt_path, "r", encoding="utf-8") as f:
        ground_truth = json.load(f)
        
    videos = list(ground_truth.keys())
    
    # Run Stages 1-3 for the videos
    # We'll run stage 1 on the media folder for these videos, then stage 2 & 3
    # Actually, we can just run them per video
    for vid_id in videos:
        vid_path = f"media/{vid_id}.mp4"
        if not os.path.exists(vid_path):
            continue
            
        print(f"Running pipeline for {vid_id}...")
        # Stage 1
        subprocess.run(["python", "captioning.py", "--input", vid_path, "--output", "output"], check=True)
        # Stage 2
        subprocess.run(["python", "generate_narrative.py", "--input", f"output/{vid_id}_captions.json"], check=True)
        # Stage 3
        subprocess.run(["python", "generate_causal_narrative.py", "--input", f"output/{vid_id}_captions.json"], check=True)
        
    # Evaluate
    results = []
    for vid_id in videos:
        causal_path = f"output/{vid_id}_causal.json"

        
        # Calculate scores
        prec, rec = 0.0, 0.0
        acc = 0.0
        
        if os.path.exists(causal_path):
            with open(causal_path, "r", encoding="utf-8") as f:
                try:
                    causal_data = json.load(f)
                except:
                    causal_data = {}
            
            inferred_text = str(causal_data).lower()
            
            # Simple keyword overlap with all answers
            gt_answers = " ".join([qa["answer"] for qa in ground_truth[vid_id]["qa_pairs"]])
            prec, rec = calculate_overlap(inferred_text, gt_answers)
            acc = 100.0 if prec > 0.1 else 0.0 # dummy accuracy based on overlap threshold
            
        results.append({
            "video_id": vid_id,
            "accuracy": acc,
            "precision": prec,
            "recall": rec
        })
        
    # Save markdown report
    md_path = "output/nextqa_causal_evaluation.md"
    with open(md_path, "w", encoding="utf-8") as f:
        f.write("## NExT-QA Causal Evaluation\n\n")
        f.write("| Video ID | Causal Accuracy | Keyword Precision | Keyword Recall |\n")
        f.write("|----------|-----------------|-------------------|----------------|\n")
        
        avg_acc = sum(r["accuracy"] for r in results) / len(results) if results else 0
        avg_prec = sum(r["precision"] for r in results) / len(results) if results else 0
        avg_rec = sum(r["recall"] for r in results) / len(results) if results else 0
        
        for r in results:
            f.write(f"| {r['video_id']} | {r['accuracy']:.2f}% | {r['precision']:.4f} | {r['recall']:.4f} |\n")
            
        f.write(f"| **Average** | **{avg_acc:.2f}%** | **{avg_prec:.4f}** | **{avg_rec:.4f}** |\n")
        
    print(f"Evaluation report saved to {md_path}")

if __name__ == "__main__":
    evaluate()
