import os
import sys
import json
import logging
import argparse
import subprocess
from dotenv import load_dotenv
from utils.logging_utils import setup_logger

# Supports MSR-VTT and (annotations-only, for now) ActivityNet Captions. Each loader downloads
# a small sample of videos plus a ground_truth.json mapping video_id -> reference caption(s),
# ready for later BLEU/ROUGE/METEOR scoring against our pipeline's own _captions.json output.

parser = argparse.ArgumentParser(description="Download a small sample of a benchmark dataset for pipeline testing")
parser.add_argument("--dataset", required=True, choices=["msrvtt", "activitynet"], help="Which dataset to sample")
parser.add_argument("--n", type=int, default=5, help="Number of videos to download")
parser.add_argument("--annotations", required=False, help="Path to the dataset's annotation JSON (default: datasets/<dataset>/annotations/...)")
parser.add_argument("--output", required=False, help="Output directory for videos (default: datasets/<dataset>/videos)")
parser.add_argument("--log", required=False, default="logs", help="Path to log directory")
args = parser.parse_args()

load_dotenv()

DEFAULT_ANNOTATIONS = {
    "msrvtt": "datasets/msrvtt/annotations/msrvtt_test_1k.json",
    "activitynet": "datasets/activitynet/annotations/val_1.json",
}


def download_msrvtt_clip(entry, output_path):
    '''Download the YouTube source for one MSR-VTT entry and trim it to its annotated segment.'''

    url = entry["url"]
    start = entry["start time"]
    duration = entry["end time"] - entry["start time"]

    cmd = [
        sys.executable, "-m", "yt_dlp",
        "-f", "mp4",
        "--download-sections", f"*{start}-{entry['end time']}",
        "-o", output_path,
        url,
    ]
    logging.info(f"Downloading {entry['video_id']} from {url} ({start:.1f}s-{entry['end time']:.1f}s)")
    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode != 0 or not os.path.isfile(output_path):
        logging.warning(f"Failed to download {entry['video_id']}: {result.stderr.strip()[-500:]}")
        return False
    return True


def load_msrvtt_sample(n, annotations_path, output_dir):
    '''Download the first N MSR-VTT test_1k videos that succeed, plus a ground_truth.json.'''

    with open(annotations_path, "r") as f:
        entries = json.load(f)

    os.makedirs(output_dir, exist_ok=True)
    ground_truth = {}
    downloaded = 0

    for entry in entries:
        if downloaded >= n:
            break

        video_id = entry["video_id"]
        output_path = os.path.join(output_dir, f"{video_id}.mp4")

        if os.path.isfile(output_path):
            logging.info(f"{video_id} already exists, skipping download.")
        elif not download_msrvtt_clip(entry, output_path):
            continue

        ground_truth[video_id] = {
            "captions": [entry["caption"]],
            "source_url": entry["url"],
        }
        downloaded += 1

    ground_truth_path = os.path.join(os.path.dirname(output_dir.rstrip("/\\")) or ".", "ground_truth.json")
    with open(ground_truth_path, "w") as f:
        json.dump(ground_truth, f, indent=2)

    logging.info(f"Downloaded {downloaded}/{n} requested videos. Ground truth saved to {ground_truth_path}")
    return downloaded, ground_truth_path


# TODO: ActivityNet video download. The official ActivityNet videos are distributed via a
# request form (https://docs.google.com/forms/d/e/1FAIpQLSdxhNVeeSCwB2USAfeNWCaI9saVT6i2hpiiizVYfa3MsTyamg/viewform)
# granting 7-day access to a Google/Baidu Drive folder of the full video set, because many of
# the original YouTube source videos have since been taken down. This form must be submitted
# personally (it requires name/institution/intended-use info) before real video download can be
# added here. Once access is granted, download_activitynet_clip() below should be implemented
# to pull the relevant video ID from the granted Drive folder (or attempt yt-dlp against the
# original YouTube ID as a fallback for videos still available), trimmed to the annotated
# segment(s) in `timestamps`, following the same pattern as download_msrvtt_clip() above.

def download_activitynet_clip(video_id, entry, output_path):
    '''Download one ActivityNet Captions video. Not yet implemented — see TODO above.'''

    raise NotImplementedError(
        f"ActivityNet video download not yet implemented for {video_id} — requires completing "
        "the official request form for Drive access, see TODO comment above this function."
    )


def load_activitynet_sample(n, annotations_path, output_dir):
    '''Select the first N ActivityNet Captions entries and write ground_truth.json.

    Video download is not yet implemented (see TODO above download_activitynet_clip); this
    currently only prepares the annotation-derived ground truth so scoring/loader plumbing can
    be tested once video access is available.'''

    with open(annotations_path, "r") as f:
        entries = json.load(f)

    os.makedirs(output_dir, exist_ok=True)
    ground_truth = {}
    downloaded = 0

    for video_id, entry in list(entries.items())[:n]:
        output_path = os.path.join(output_dir, f"{video_id}.mp4")
        youtube_id = video_id[2:] if video_id.startswith("v_") else video_id

        if os.path.isfile(output_path):
            logging.info(f"{video_id} already exists, skipping download.")
            downloaded += 1
        else:
            try:
                if download_activitynet_clip(video_id, entry, output_path):
                    downloaded += 1
            except NotImplementedError as e:
                logging.warning(str(e))

        ground_truth[video_id] = {
            "captions": entry["sentences"],
            "timestamps": entry["timestamps"],
            "duration": entry["duration"],
            "source_url": f"https://www.youtube.com/watch?v={youtube_id}",
        }

    ground_truth_path = os.path.join(os.path.dirname(output_dir.rstrip("/\\")) or ".", "ground_truth.json")
    with open(ground_truth_path, "w") as f:
        json.dump(ground_truth, f, indent=2)

    logging.info(
        f"Downloaded {downloaded}/{len(ground_truth)} videos (video download not yet implemented). "
        f"Ground truth saved to {ground_truth_path}"
    )
    return downloaded, ground_truth_path


LOADERS = {
    "msrvtt": load_msrvtt_sample,
    "activitynet": load_activitynet_sample,
}


if __name__ == "__main__":
    setup_logger(args.dataset, output_dir=args.log)
    annotations_path = args.annotations or DEFAULT_ANNOTATIONS[args.dataset]
    output_dir = args.output or f"datasets/{args.dataset}/videos"

    logging.info(f"=== Loading {args.n} sample videos from {args.dataset} ===")
    downloaded, ground_truth_path = LOADERS[args.dataset](args.n, annotations_path, output_dir)

    print(f"Downloaded {downloaded} videos to {output_dir}")
    print(f"Ground truth captions saved to {ground_truth_path}")
