import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
import os
import argparse
import subprocess

parser = argparse.ArgumentParser(description="End-to-End YouTube Custom Testing Script")
parser.add_argument("--url", required=False, help="YouTube URL to download")
parser.add_argument("--input", required=False, help="Local video file path")
args = parser.parse_args()

def main():
    if args.url:
        print(f"Downloading {args.url} to media/custom_youtube_test.mp4...")
        os.makedirs("media", exist_ok=True)
        vid_path = "media/custom_youtube_test.mp4"
        subprocess.run([
            "python", "-m", "yt_dlp",
            "-f", "mp4",
            "-o", vid_path,
            args.url
        ], check=True)
    elif args.input:
        vid_path = args.input
    else:
        print("Please provide either --url or --input")
        return

    vid_name = os.path.splitext(os.path.basename(vid_path))[0]
    captions_json = f"output/{vid_name}_captions.json"

    print(f"\n=== Running Stage 1: Captioning on {vid_path} ===")
    subprocess.run(["python", "src/pipeline/stage1_captioning.py", "--input", vid_path, "--output", "output"], check=True)

    print(f"\n=== Running Stage 2: Narrative Generation ===")
    subprocess.run(["python", "src/pipeline/stage2_narrative.py", "--input", captions_json], check=True)

    print(f"\n=== Running Stage 3: Causal Narrative Generation ===")
    subprocess.run(["python", "src/pipeline/stage3_causal.py", "--input", captions_json], check=True)

    print(f"\n=== Running Stage 4: Verification Report ===")
    subprocess.run(["python", "src/pipeline/stage4_verification.py", "--input", captions_json], check=True)

    print(f"\n=== Running Stage 5: Explainability Report ===")
    subprocess.run(["python", "src/pipeline/stage5_explainability.py", "--input", captions_json], check=True)

    print(f"\n=== Displaying Final Explained Output ===")
    md_path = f"output/{vid_name}_explained.md"
    if os.path.exists(md_path):
        with open(md_path, "r", encoding="utf-8") as f:
            print(f.read())
    else:
        print(f"Error: {md_path} not found.")

if __name__ == "__main__":
    main()
