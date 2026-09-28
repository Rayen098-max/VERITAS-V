import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
import os
import json
import logging
import argparse
from dotenv import load_dotenv
from src.utils.logging_utils import setup_logger
from src.utils.verification_backends import get_backend

parser = argparse.ArgumentParser(description="Verify causal claims against scene frame images")
parser.add_argument("--input", required=True, help="Path to a <video>_captions.json file")
parser.add_argument("--output", required=False, help="Path to output directory (default: same directory as --input)")
parser.add_argument("--log", required=False, default="logs", help="Path to log directory")
args = parser.parse_args()

load_dotenv()
VERIFICATION_BACKEND = os.getenv("VERIFICATION_BACKEND", "mock")


def generate_verification_report(captions_path, output_dir=None):
    '''Load a captions JSON and its matching causal.json, and write a verification report.'''

    with open(captions_path, "r") as f:
        scenes = json.load(f)

    video_name = os.path.basename(captions_path).removesuffix("_captions.json")
    output_dir = output_dir or os.path.dirname(captions_path) or "."

    causal_path = os.path.join(output_dir, f"{video_name}_causal.json")
    if not os.path.isfile(causal_path):
        raise FileNotFoundError(
            f"Expected causal claims file not found: {causal_path} "
            f"(run generate_causal_narrative.py first)"
        )
    with open(causal_path, "r") as f:
        claims = json.load(f)

    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, f"{video_name}_verification.json")

    backend_fn = get_backend(VERIFICATION_BACKEND)
    report = backend_fn(claims, scenes)

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    logging.info(f"Verification report ({VERIFICATION_BACKEND} backend) saved to {output_path}")
    return output_path


if __name__ == "__main__":
    setup_logger(args.input, output_dir=args.log)
    logging.info(f"=== Generating verification report for: {args.input} (backend={VERIFICATION_BACKEND}) ===")
    output_path = generate_verification_report(args.input, args.output)
    logging.info("Verification complete.")
    print(f"Verification report saved to {output_path}")
