import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
import os
import json
import logging
import argparse
from dotenv import load_dotenv
from src.utils.logging_utils import setup_logger
from src.utils.causal_backends import get_backend

load_dotenv()

def generate_causal_narrative(captions_path, output_dir=None, backend=None):
    '''Load a captions JSON file and write causal-link JSON + rendered narrative text.'''

    with open(captions_path, "r", encoding="utf-8") as f:
        scenes = json.load(f)

    video_name = os.path.basename(captions_path).removesuffix("_captions.json")
    output_dir = output_dir or os.path.dirname(captions_path) or "."
    os.makedirs(output_dir, exist_ok=True)
    json_output_path = os.path.join(output_dir, f"{video_name}_causal.json")
    text_output_path = os.path.join(output_dir, f"{video_name}_causal_narrative.txt")

    active_backend = backend or os.getenv("CAUSAL_BACKEND", "mock")
    backend_fn = get_backend(active_backend)
    causal_links = backend_fn(scenes)

    with open(json_output_path, "w", encoding="utf-8") as f:
        json.dump(causal_links, f, indent=2)

    narrative = " ".join(link["causal_statement"] for link in causal_links)
    with open(text_output_path, "w", encoding="utf-8") as f:
        f.write(narrative)

    logging.info(f"Causal links ({active_backend} backend) saved to {json_output_path}")
    logging.info(f"Causal narrative saved to {text_output_path}")
    return json_output_path, text_output_path


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Infer causal links between consecutive scenes")
    parser.add_argument("--input", required=True, help="Path to a <video>_captions.json file")
    parser.add_argument("--output", required=False, help="Path to output directory (default: same directory as --input)")
    parser.add_argument("--log", required=False, default="logs", help="Path to log directory")
    parser.add_argument("--backend", required=False, help="Causal backend (mock, groq, llm)")
    args = parser.parse_args()

    setup_logger(args.input, output_dir=args.log)
    logging.info(f"=== Generating causal narrative for: {args.input} (backend={args.backend or os.getenv('CAUSAL_BACKEND', 'mock')}) ===")
    json_output_path, text_output_path = generate_causal_narrative(args.input, args.output, backend=args.backend)
    logging.info("Causal reasoning complete.")
    print(f"Causal links saved to {json_output_path}")
    print(f"Causal narrative saved to {text_output_path}")
