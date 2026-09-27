import os
import json
import logging
import argparse
from dotenv import load_dotenv
from utils.logging_utils import setup_logger
from utils.narrative_backends import get_backend

parser = argparse.ArgumentParser(description="Merge per-scene captions into a single video narrative")
parser.add_argument("--input", required=True, help="Path to a <video>_captions.json file")
parser.add_argument("--output", required=False, help="Path to output directory (default: same directory as --input)")
parser.add_argument("--log", required=False, default="logs", help="Path to log directory")
args = parser.parse_args()

load_dotenv()
NARRATIVE_BACKEND = os.getenv("NARRATIVE_BACKEND", "mock")


def generate_narrative(captions_path, output_dir=None):
    '''Load a captions JSON file and write a single narrative text file summarizing the video.'''

    with open(captions_path, "r") as f:
        scenes = json.load(f)

    video_name = os.path.basename(captions_path).removesuffix("_captions.json")
    output_dir = output_dir or os.path.dirname(captions_path) or "."
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, f"{video_name}_narrative.txt")

    backend_fn = get_backend(NARRATIVE_BACKEND)
    narrative = backend_fn(scenes)

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(narrative)

    logging.info(f"Narrative ({NARRATIVE_BACKEND} backend) saved to {output_path}")
    return output_path


if __name__ == "__main__":
    setup_logger(args.input, output_dir=args.log)
    logging.info(f"=== Generating narrative for: {args.input} (backend={NARRATIVE_BACKEND}) ===")
    output_path = generate_narrative(args.input, args.output)
    logging.info("Narrative generation complete.")
    print(f"Narrative saved to {output_path}")
