import os
import json

def generate_sample_data():
    os.makedirs("datasets/nextqa", exist_ok=True)
    os.makedirs("media", exist_ok=True)
    
    # We assume sample_clip.mp4 exists in media. We'll duplicate it for nextqa
    src_video = "media/sample_clip.mp4"
    ground_truth = {}
    
    for i in range(1, 6):
        vid_id = f"nextqa_vid{i}"
        dest_video = f"media/{vid_id}.mp4"
        
        # Copy video if source exists
        if os.path.exists(src_video) and not os.path.exists(dest_video):
            import shutil
            shutil.copy(src_video, dest_video)
            
        ground_truth[vid_id] = {
            "qa_pairs": [
                {"type": "why", "question": f"Why does the person fall in {vid_id}?", "answer": "slippery floor warning"},
                {"type": "how", "question": f"How does the scene start in {vid_id}?", "answer": "caption reading mock action"}
            ]
        }
        
    gt_path = "datasets/nextqa/ground_truth.json"
    with open(gt_path, "w", encoding="utf-8") as f:
        json.dump(ground_truth, f, indent=2)
        
    print(f"Generated 5 sample videos and ground truth at {gt_path}")

if __name__ == "__main__":
    generate_sample_data()
