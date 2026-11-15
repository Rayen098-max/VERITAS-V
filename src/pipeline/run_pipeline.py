import os
import sys
import argparse
import logging

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from src.pipeline.stage1_captioning import run_captioning_stage
from src.pipeline.stage2_narrative import generate_narrative
from src.pipeline.stage3_causal import generate_causal_narrative
from src.pipeline.stage4_verification import generate_verification_report
from src.pipeline.stage5_explainability import generate_explainability_report

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

def run_full_pipeline(
    video_path: str,
    output_dir: str = "output",
    caption_backend: str = "groq",
    narrative_backend: str = "groq",
    causal_backend: str = "groq",
    verification_backend: str = "groq",
    explainability_backend: str = "groq",
    threshold: float = 30.0,
    frames_per_scene: int = 4
):
    if not os.path.isabs(video_path):
        candidates = [
            video_path,
            os.path.join("media", video_path),
            os.path.join(os.path.dirname(__file__), "..", "..", video_path),
            os.path.join(os.path.dirname(__file__), "..", "..", "media", os.path.basename(video_path))
        ]
        for c in candidates:
            if os.path.exists(c):
                video_path = os.path.abspath(c)
                break
    if not os.path.isabs(output_dir):
        output_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", output_dir))
    os.makedirs(output_dir, exist_ok=True)
    video_stem = os.path.splitext(os.path.basename(video_path))[0]
    captions_file = os.path.join(output_dir, f"{video_stem}_captions.json")

    os.environ["CAPTIONING_BACKEND"] = caption_backend
    os.environ["NARRATIVE_BACKEND"] = narrative_backend
    os.environ["CAUSAL_BACKEND"] = causal_backend
    os.environ["VERIFICATION_BACKEND"] = verification_backend
    os.environ["EXPLAINABILITY_BACKEND"] = explainability_backend

    logging.info(f"=== Starting VERITAS-V End-to-End Pipeline for {video_path} ===")
    logging.info(f"Backends: Cap={caption_backend}, Narr={narrative_backend}, Caus={causal_backend}, Verif={verification_backend}")

    # Stage 1: Captioning
    logging.info("\n--- [Stage 1/5] Running Scene Captioning & Keyframe Extraction ---")
    run_captioning_stage(video_path, output_dir=output_dir, num_frames_per_scene=frames_per_scene, threshold=threshold)

    # Stage 2: Narrative
    logging.info("\n--- [Stage 2/5] Synthesizing Chronological Narrative ---")
    generate_narrative(captions_file, output_dir=output_dir)

    # Stage 3: Causal Link Inference
    logging.info("\n--- [Stage 3/5] Inferring Causal Graph Links ---")
    generate_causal_narrative(captions_file, output_dir=output_dir)

    # Stage 4: Hallucination Verification
    logging.info("\n--- [Stage 4/5] Running Forensic Hallucination Verification ---")
    generate_verification_report(captions_file, output_dir=output_dir)

    # Stage 5: Explainability
    logging.info("\n--- [Stage 5/5] Generating Forensic Explainability Audit ---")
    generate_explainability_report(captions_file, output_dir=output_dir)

    logging.info(f"\n✅ All 5 stages completed successfully for {video_stem}! Outputs saved in {output_dir}/")

def main():
    parser = argparse.ArgumentParser(description="VERITAS-V End-to-End Pipeline Runner")
    parser.add_argument("--video", required=True, help="Path to input video file (.mp4)")
    parser.add_argument("--output-dir", default="output", help="Directory for output artifacts")
    parser.add_argument("--caption-backend", default="groq", help="Captioning backend: mock, groq, gemini, veritas_local")
    parser.add_argument("--narrative-backend", default="groq", help="Narrative backend: mock, groq, gemini, veritas_local")
    parser.add_argument("--causal-backend", default="groq", help="Causal backend: mock, groq, gemini, veritas_local")
    parser.add_argument("--verification-backend", default="groq", help="Verification backend: mock, groq, gemini, veritas_local")
    parser.add_argument("--explainability-backend", default="groq", help="Explainability backend")
    parser.add_argument("--threshold", type=float, default=30.0, help="Scene cut detection threshold")
    parser.add_argument("--frames-per-scene", type=int, default=4, help="Keyframes to extract per scene")
    args = parser.parse_args()

    run_full_pipeline(
        video_path=args.video,
        output_dir=args.output_dir,
        caption_backend=args.caption_backend,
        narrative_backend=args.narrative_backend,
        causal_backend=args.causal_backend,
        verification_backend=args.verification_backend,
        explainability_backend=args.explainability_backend,
        threshold=args.threshold,
        frames_per_scene=args.frames_per_scene
    )

if __name__ == "__main__":
    main()
