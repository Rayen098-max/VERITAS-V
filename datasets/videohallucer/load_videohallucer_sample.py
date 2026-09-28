import os
import json

def generate():
    os.makedirs("datasets/videohallucer", exist_ok=True)
    os.makedirs("output", exist_ok=True)
    
    ground_truth = {}
    
    for i in range(1, 6):
        vid_id = f"vh_vid{i}"
        
        # Ground truth
        # Let's map scene_id -> list of (claim_text, label)
        claims = [
            {"text": f"The video shows a dog running in {vid_id}.", "label": "supported"},
            {"text": f"The video shows a flying car in {vid_id}.", "label": "contradicted"}
        ]
        
        ground_truth[vid_id] = {"claims": claims}
        
        # Create captions.json
        captions = {
            "scene_001": {
                "action_summary": "A dog runs across the screen.",
                "detected_elements": {"primary_actor": "dog", "objects": ["grass"]},
                "frame_files": []
            }
        }
        with open(f"output/{vid_id}_captions.json", "w", encoding="utf-8") as f:
            json.dump(captions, f, indent=2)
            
        # Create causal.json
        causal = [
            {"scene_id": "scene_001", "causal_statement": claims[0]["text"]},
            {"scene_id": "scene_001", "causal_statement": claims[1]["text"]}
        ]
        with open(f"output/{vid_id}_causal.json", "w", encoding="utf-8") as f:
            json.dump(causal, f, indent=2)
            
    with open("datasets/videohallucer/ground_truth.json", "w", encoding="utf-8") as f:
        json.dump(ground_truth, f, indent=2)
        
    print("Generated 5 sample videos for VideoHallucer evaluation.")

if __name__ == "__main__":
    generate()
