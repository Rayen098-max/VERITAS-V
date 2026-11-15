import os
import json
import logging
import argparse
import nltk
from nltk.translate.bleu_score import sentence_bleu, SmoothingFunction
from nltk.translate.meteor_score import meteor_score
from rouge_score import rouge_scorer
from collections import Counter
from dotenv import load_dotenv
try:
    from src.utils.logging_utils import setup_logger
except ImportError:
    from utils.logging_utils import setup_logger

load_dotenv()

for pkg in ["wordnet", "omw-1.4", "punkt_tab"]:
    try:
        nltk.data.find(f"corpora/{pkg}" if pkg != "punkt_tab" else f"tokenizers/{pkg}")
    except LookupError:
        nltk.download(pkg, quiet=True)

_rouge_scorer = rouge_scorer.RougeScorer(["rougeL"], use_stemmer=True)
_smoothing = SmoothingFunction().method1

def compute_cider_score(reference: str, hypothesis: str, n: int = 4) -> float:
    '''Compute CIDEr consensus n-gram match score between reference and hypothesis.'''
    ref_tokens = nltk.word_tokenize(reference.lower())
    hyp_tokens = nltk.word_tokenize(hypothesis.lower())

    if not ref_tokens or not hyp_tokens:
        return 0.0

    scores = []
    for k in range(1, n + 1):
        ref_ngrams = Counter([tuple(ref_tokens[i:i+k]) for i in range(len(ref_tokens) - k + 1)])
        hyp_ngrams = Counter([tuple(hyp_tokens[i:i+k]) for i in range(len(hyp_tokens) - k + 1)])

        if not ref_ngrams or not hyp_ngrams:
            scores.append(0.0)
            continue

        common = set(ref_ngrams.keys()) & set(hyp_ngrams.keys())
        overlap = sum(min(ref_ngrams[ng], hyp_ngrams[ng]) for ng in common)
        precision = overlap / max(1, sum(hyp_ngrams.values()))
        recall = overlap / max(1, sum(ref_ngrams.values()))

        f_k = (2 * precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0
        scores.append(f_k)

    return (sum(scores) / len(scores)) * 10.0


def score_pair(reference, hypothesis):
    '''Compute BLEU-4, ROUGE-L, METEOR, and CIDEr for one reference/hypothesis caption pair.'''

    ref_tokens = nltk.word_tokenize(reference.lower())
    hyp_tokens = nltk.word_tokenize(hypothesis.lower())

    bleu4 = sentence_bleu([ref_tokens], hyp_tokens, smoothing_function=_smoothing)
    rouge_l = _rouge_scorer.score(reference, hypothesis)["rougeL"].fmeasure
    meteor = meteor_score([ref_tokens], hyp_tokens)
    cider = compute_cider_score(reference, hypothesis)

    return {"bleu4": bleu4, "rouge_l": rouge_l, "meteor": meteor, "cider": cider}


def evaluate(dataset, captions_dir, output_dir=None):
    '''Score each video's narrative against its ground-truth reference caption(s).'''

    ground_truth_path = os.path.join("datasets", dataset, "ground_truth.json")
    with open(ground_truth_path, "r") as f:
        ground_truth = json.load(f)

    output_dir = output_dir or os.path.join("datasets", dataset)
    os.makedirs(output_dir, exist_ok=True)

    per_video = []
    for video_id, gt in ground_truth.items():
        narrative_path = os.path.join(captions_dir, f"{video_id}_narrative.txt")
        if not os.path.isfile(narrative_path):
            logging.warning(f"{video_id}: no narrative file found at {narrative_path}, skipping.")
            continue

        with open(narrative_path, "rb") as f:
            raw_bytes = f.read()
        if raw_bytes.startswith(b"\xff\xfe") or raw_bytes.startswith(b"\xfe\xff"):
            hypothesis = raw_bytes.decode("utf-16", errors="replace").strip()
        else:
            hypothesis = raw_bytes.decode("utf-8", errors="replace").strip()

        references = gt["captions"]
        # Score against each reference, keep the best (standard practice for multi-reference sets).
        best = max((score_pair(ref, hypothesis) for ref in references), key=lambda s: s["bleu4"])

        per_video.append({
            "video_id": video_id,
            "hypothesis": hypothesis,
            "references": references,
            **best,
        })
        logging.info(f"{video_id}: BLEU-4={best['bleu4']:.4f} ROUGE-L={best['rouge_l']:.4f} METEOR={best['meteor']:.4f}")

    if not per_video:
        raise RuntimeError(
            f"No videos scored — no matching <video_id>_narrative.txt files found in {captions_dir} "
            f"for any video in {ground_truth_path}. Run captioning.py + generate_narrative.py first."
        )

    averages = {
        metric: sum(v[metric] for v in per_video) / len(per_video)
        for metric in ("bleu4", "rouge_l", "meteor", "cider")
    }

    report = {"dataset": dataset, "n_videos": len(per_video), "averages": averages, "per_video": per_video}

    json_path = os.path.join(output_dir, f"{dataset}_evaluation.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    md_path = os.path.join(output_dir, f"{dataset}_evaluation.md")
    with open(md_path, "w", encoding="utf-8") as f:
        f.write(render_markdown(report))

    logging.info(f"Evaluation report saved to {json_path} and {md_path}")
    return json_path, md_path


def render_markdown(report):
    lines = [
        f"## Evaluation: {report['dataset']} ({report['n_videos']} videos)",
        "",
        "### Averages",
        "",
        "| Metric | Score |",
        "|---|---|",
        f"| BLEU-4 | {report['averages']['bleu4']:.4f} |",
        f"| ROUGE-L | {report['averages']['rouge_l']:.4f} |",
        f"| METEOR | {report['averages']['meteor']:.4f} |",
        f"| CIDEr | {report['averages']['cider']:.4f} |",
        "",
        "### Per-video",
        "",
        "| Video ID | BLEU-4 | ROUGE-L | METEOR | CIDEr |",
        "|---|---|---|---|---|",
    ]
    for v in report["per_video"]:
        lines.append(f"| {v['video_id']} | {v['bleu4']:.4f} | {v['rouge_l']:.4f} | {v['meteor']:.4f} | {v['cider']:.4f} |")
    return "\n".join(lines) + "\n"


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Score pipeline narrative output against dataset ground-truth captions")
    parser.add_argument("--dataset", required=True, choices=["msrvtt"], help="Which dataset's ground truth to score against")
    parser.add_argument("--captions-dir", required=False, default="captions", help="Directory containing <video_id>_narrative.txt files")
    parser.add_argument("--output", required=False, help="Output directory for the evaluation report (default: datasets/<dataset>/)")
    parser.add_argument("--log", required=False, default="logs", help="Path to log directory")
    args = parser.parse_args()

    setup_logger(args.dataset, output_dir=args.log)
    logging.info(f"=== Evaluating {args.dataset} narratives against ground truth ===")
    json_path, md_path = evaluate(args.dataset, args.captions_dir, args.output)
    print(f"Evaluation JSON saved to {json_path}")
    print(f"Evaluation Markdown saved to {md_path}")
