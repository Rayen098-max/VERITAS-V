import os
import json
import logging
import argparse
from dotenv import load_dotenv
from utils.logging_utils import setup_logger
from utils.explainability_styles import get_style

parser = argparse.ArgumentParser(description="Assemble the final evidence-annotated explained narrative")
parser.add_argument("--input", required=True, help="Path to a <video>_captions.json file")
parser.add_argument("--output", required=False, help="Path to output directory (default: same directory as --input)")
parser.add_argument("--log", required=False, default="logs", help="Path to log directory")
args = parser.parse_args()

load_dotenv()
EXPLAINABILITY_STYLE = os.getenv("EXPLAINABILITY_STYLE", "structured")


def _load_required(path, label):
    if not os.path.isfile(path):
        raise FileNotFoundError(f"Expected {label} file not found: {path}")
    with open(path, "r") as f:
        return json.load(f)


def generate_explainability_report(captions_path, output_dir=None):
    '''Join captions.json + causal.json + verification.json into the final annotated report.'''

    video_name = os.path.basename(captions_path).removesuffix("_captions.json")
    output_dir = output_dir or os.path.dirname(captions_path) or "."

    scenes = _load_required(captions_path, "captions")
    causal_claims = _load_required(os.path.join(output_dir, f"{video_name}_causal.json"), "causal claims")
    verifications = _load_required(os.path.join(output_dir, f"{video_name}_verification.json"), "verification report")
    verifications_by_scene = {v["scene_id"]: v for v in verifications}

    records = []
    for claim in causal_claims:
        scene_id = claim["scene_id"]
        scene = scenes.get(scene_id, {})
        verification = verifications_by_scene.get(scene_id, {})

        records.append({
            "scene_id": scene_id,
            "claim": claim.get("causal_statement") or claim.get("event", ""),
            "verdict": verification.get("verdict", "unverified"),
            "confidence": verification.get("confidence", "unknown"),
            "reasoning": verification.get("reasoning", ""),
            "evidence": {
                "frame_files": scene.get("frame_files", []),
                "start_time": scene.get("start_time"),
                "end_time": scene.get("end_time"),
                "action_summary": scene.get("action_summary", ""),
                "detected_elements": scene.get("detected_elements", {}),
            },
        })

    style_fn = get_style(EXPLAINABILITY_STYLE)
    json_records, markdown = style_fn(records)

    os.makedirs(output_dir, exist_ok=True)
    json_output_path = os.path.join(output_dir, f"{video_name}_explained.json")
    md_output_path = os.path.join(output_dir, f"{video_name}_explained.md")

    with open(json_output_path, "w", encoding="utf-8") as f:
        json.dump(json_records, f, indent=2)
    with open(md_output_path, "w", encoding="utf-8") as f:
        f.write(markdown)

    logging.info(f"Explained report ({EXPLAINABILITY_STYLE} style) saved to {json_output_path} and {md_output_path}")
    return json_output_path, md_output_path


if __name__ == "__main__":
    setup_logger(args.input, output_dir=args.log)
    logging.info(f"=== Generating explainability report for: {args.input} (style={EXPLAINABILITY_STYLE}) ===")
    json_output_path, md_output_path = generate_explainability_report(args.input, args.output)
    logging.info("Explainability report complete.")
    print(f"Explained JSON saved to {json_output_path}")
    print(f"Explained narrative (Markdown) saved to {md_output_path}")
