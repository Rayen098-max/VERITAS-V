# Video Captioning Pipeline

This project is a Python pipeline for automatically captioning video scenes using AI, then reasoning over those captions to build a verified, evidence-annotated causal narrative of the video. It's organized as five standalone stages, each run as its own script:

1. **`captioning.py`** — Detects scenes (PySceneDetect), extracts key frames (FFmpeg), transcribes audio (Whisper), and generates a caption + keywords per scene via a pluggable captioning backend (GPT-4o, mock, or Qwen2.5-VL).
2. **`generate_narrative.py`** — Merges all per-scene captions into a single coherent narrative paragraph describing the video as a continuous story.
3. **`generate_causal_narrative.py`** — Infers plausible cause-effect links between consecutive scenes (e.g. "the man fell *because* he slipped").
4. **`generate_verification_report.py`** — Checks each causal claim against its scene's frame images to flag unsupported ("hallucinated") claims.
5. **`generate_explainability_report.py`** — Assembles the final, user-facing output: every claim annotated with its verdict, confidence, and supporting evidence (frame files + timestamp). This is a deterministic assembly step, not an LLM call — see "Pluggable Backends" below.

Each stage's core logic is pluggable via a swappable backend (function-registry pattern, see `utils/*_backends.py`), so every stage can run with a real LLM, a keyless mock, or (for captioning) a local open-source VLM — selected entirely via `.env`, no code changes required.

A separate **`load_dataset_sample.py`** script downloads a small (5-10 video) sample of a benchmark dataset (currently MSR-VTT) plus its ground-truth reference captions, for testing the pipeline against real-world video and, later, scoring pipeline output against references (BLEU/ROUGE/METEOR/CIDEr). See "Benchmark Datasets" below.

Supports the Batch APIs for GPT, with token usage tracking and cost estimation included.

---

## Features

- Automatic scene detection
- Frame extraction per scene
- Whisper transcription
- Pluggable scene captioning backend (GPT-4o, mock, or Qwen2.5-VL) via `CAPTIONING_BACKEND`
- Keyword tagging for search
- Narrative generation — merges per-scene captions into one coherent story
- Causal reasoning — infers cause-effect links between consecutive scenes
- Hallucination verification — checks causal claims against scene frame images
- Explainability report — final evidence-annotated narrative (JSON + Markdown) citing frames/timestamps per claim
- Benchmark dataset sampling — downloads a small MSR-VTT subset + ground-truth captions for testing against real video
- Evaluation — scores narrative output against ground truth (BLEU-4, ROUGE-L, METEOR; CIDEr deferred)
- Logs usage stats + estimated cost
- Works on individual videos or full folders
- Skips scenes with excessive repeated transcript text
- Falls back to treating a whole video as one scene when PySceneDetect finds no cuts (e.g. short, single-shot clips)

---

## Project Structure

```
video-extraction-pipeline/
├── src/                                  # Core pipeline modules & utilities
│   ├── pipeline/                         # 5-Stage execution logic (stages 1-5)
│   │   ├── stage1_captioning.py
│   │   ├── stage2_narrative.py
│   │   ├── stage3_causal.py
│   │   ├── stage4_verification.py
│   │   └── stage5_explainability.py
│   └── utils/                            # Client wrappers & backend helpers
│       ├── groq_client.py
│       ├── captioning_backends.py
│       ├── causal_backends.py
│       ├── verification_backends.py
│       ├── explainability_styles.py
│       ├── chat_gpt_utils.py
│       ├── batch_utils.py
│       ├── whisper_utils.py
│       ├── extract_utils.py
│       └── logging_utils.py
├── scripts/                              # Runners & evaluation scripts
│   ├── run_youtube_test.py
│   ├── evaluate_causal_reasoning.py
│   ├── evaluate_hallucination_verification.py
│   └── evaluate_llm_judge.py
├── datasets/                             # Benchmark dataset loaders & annotations
│   ├── nextqa/
│   └── videohallucer/
├── media/                                # Input video files
├── output/                               # Generated json/md report artifacts
├── .env
├── requirements.txt
└── README.md
```

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/SelinaMangaroo/video-captioning-pipeline.git
cd video-captioning-pipeline
```

### 2. Set up environment

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3. Set up `.env`

## Environment Variables

The project uses a `.env` file for configuration. Create a `.env` file. Below is a description of each variable:

| Variable                     | Example Value          | Description                                                                  |
|------------------------------|------------------------|------------------------------------------------------------------------------|
| `HUGGINGFACE_TOKEN`          | `hf_....`              | Token for accessing Hugging Face models (used by Whisper or other models).   |
| `VIDEO_PATH`                 | `video/media.mp4`      | Path to a single video file or directory of videos to process.               |
| `PY_SCENE_DETECT_THRESHOLD`  | `40.0`                 | Sensitivity threshold for PySceneDetect content detection. Lower = more cuts. If no cuts are detected at all, the whole video is treated as one scene rather than producing zero scenes. |
| `MIN_SCENE_LENGTH`           | `300`                  | Minimum scene length in frames (prevents over-segmentation).                 |
| `NUM_FRAMES_PER_SCENE`       | `4`                    | Number of frames extracted per scene (not including start & end).            |
| `OPENAI_API_KEY`             | `sk-...`               | API key for OpenAI models.                                                   |
| `CHAT_GPT_MODEL`             | `gpt-4o-mini`          | ChatGPT model to use for captioning.                                         |
| `CHAT_GPT_RETRIES`           | `10`                   | Number of retries on rate limit or transient errors.                         |
| `USE_BATCH_API`              | `true`                 | Whether to use the OpenAI Batch API (cheaper & asynchronous). Only applies when `CAPTIONING_BACKEND=gpt4o`. |
| `CAPTIONING_BACKEND`         | `gpt4o`                | Which captioning backend to use: `gpt4o`, `mock`, or `qwen25vl` (stubbed — see below). |
| `MOCK_CAPTIONING`            | `true`                 | Backward-compatible alias — if `true`, forces `CAPTIONING_BACKEND` to `mock` regardless of the setting above. |
| `INCLUDE_TRANSCRIPT_IN_GPT`  | `true`                 | If `true`, transcripts are included in GPT prompts for more context.         |
| `TRANSCRIPT_REPEAT_THRESHOLD`| `8`                    | Filter threshold for repeated transcript words/phrases (to avoid noise).     |
| `TRANSCRIPT_CACHE_DIR`       | `transcripts`          | Directory for cached Whisper transcripts.                                    |
| `WHISPER_MODEL_SIZE`         | `base`                 | Whisper model size (`tiny`, `base`, `small`, `medium`, `large`).             |
| `LOGS_DIR`                   | `logs`                 | Directory for logs.                                                          |
| `CAPTIONS_DIR`               | `captions`             | Directory where caption JSON files will be saved.                            |
| `NARRATIVE_BACKEND`          | `mock`                 | Narrative generation backend: `mock` or `llm` (stubbed — see below).         |
| `CAUSAL_BACKEND`             | `mock`                 | Causal reasoning backend: `mock` or `llm` (stubbed — see below).             |
| `VERIFICATION_BACKEND`       | `mock`                 | Hallucination verification backend: `mock` or `llm` (stubbed — see below).   |
| `EXPLAINABILITY_STYLE`       | `structured`           | Final report style: `structured` (deterministic, default) or `narrative_llm` (stubbed — see below). |

---

## Usage

### Quickstart Evaluation Test

To run the full end-to-end multi-modal pipeline on a custom video:
```bash
python scripts/run_youtube_test.py --input media/my_video.mp4
```

### Full pipeline (run in order)

Alternatively, each stage can be executed independently:

```bash
python src/pipeline/stage1_captioning.py --input ./media/my_video.mp4 --output output
python src/pipeline/stage2_narrative.py --input output/my_video_captions.json
python src/pipeline/stage3_causal.py --input output/my_video_captions.json
python src/pipeline/stage4_verification.py --input output/my_video_captions.json
python src/pipeline/stage5_explainability.py --input output/my_video_captions.json
```

Each downstream stage reads directly from the artifacts generated by the earlier stages in the `output/` directory.

### Process all videos in a folder (stage 1 only)

```bash
python src/pipeline/stage1_captioning.py --input ./media --output output
```

Optional CLI args (all five scripts):

- `--input` → path to a video/directory (`stage1_captioning.py`) or a `<video>_captions.json` file (the other four scripts)
- `--output` → output folder (default: `output/`, or same directory as `--input` for stages 2-5)
- `--log` → log output folder (default: `logs/`)

---

## Output

Each processed video creates:

- A JSON file in `captions/`:
Example:
```json
"scene_001": {
  "start_time": 0.0,
  "end_time": 12.53,
  "frame_files": [...],
  "transcript_text": "She walks into the room and smiles.",
  "caption": "A woman enters with a warm smile.",
  "keywords": ["woman", "entrance", "smile", "scene intro"]
}
```

- A `.log` file in `logs/` with:
  - Scene count and timing
  - Token usage breakdown
  - Total runtime
  - Total cost

- A directory of frames collected from the video in `frames/`

Running the downstream stages adds, per video, to `captions/`:

- `<video>_narrative.txt` — a single narrative paragraph merging all scene captions (from `generate_narrative.py`)
- `<video>_causal.json` + `<video>_causal_narrative.txt` — structured list of `{scene_id, event, cause_scene_id, cause, causal_statement, confidence}` per scene, plus a rendered prose version (from `generate_causal_narrative.py`)
- `<video>_verification.json` — a verdict per causal claim: `{scene_id, claim, frame_files, verdict, confidence, reasoning}` (from `generate_verification_report.py`)
- `<video>_explained.json` + `<video>_explained.md` — the final report: each claim with its verdict, confidence, evidence (`frame_files`, `start_time`, `end_time`), and `included_in_narrative` flag, plus a Markdown narrative with inline citations (from `generate_explainability_report.py`)

---

## Pluggable Backends

Every stage's core logic is swappable via a function-registry pattern in `utils/*_backends.py` — no code changes needed, just a `.env` variable:

| Stage | Env var | Backends |
|---|---|---|
| Captioning | `CAPTIONING_BACKEND` | `gpt4o` (default, real) · `mock` · `qwen25vl` (stubbed) |
| Narrative | `NARRATIVE_BACKEND` | `mock` (default) · `llm` (stubbed) |
| Causal reasoning | `CAUSAL_BACKEND` | `mock` (default) · `llm` (stubbed) |
| Verification | `VERIFICATION_BACKEND` | `mock` (default) · `llm` (stubbed) |
| Explainability | `EXPLAINABILITY_STYLE` | `structured` (default, deterministic — no LLM needed) · `narrative_llm` (stubbed) |

**Captioning** (`utils/captioning_backends.py`):
- **`gpt4o`** — real OpenAI GPT-4o captioning, supports both sync and Batch API modes (`USE_BATCH_API`).
- **`mock`** — deterministic fake captions/keywords for testing the pipeline without any API calls or costs. Also triggered by setting `MOCK_CAPTIONING=true`.
- **`qwen25vl`** — open-source Qwen2.5-VL backend for local/self-hosted captioning. **Stubbed**: raises `NotImplementedError`, requires a GPU environment not yet set up.

**Narrative generation** (`utils/narrative_backends.py`):
- **`mock`** (default) — deterministically stitches each scene's caption and a transcript snippet together in order with rotating connector phrases, so scene ordering/content is inspectable without pretending to be real prose.
- **`llm`** — **stubbed**: raises `NotImplementedError`, requires `NARRATIVE_LLM_PROVIDER`/`NARRATIVE_LLM_MODEL` and a provider API key.

**Causal reasoning** (`utils/causal_backends.py`):
- **`mock`** (default) — links consecutive scenes via real keyword overlap from the captions JSON (not a fixed placeholder), explicitly reporting `no_link_detected` when scenes share no keywords.
- **`llm`** — **stubbed**: raises `NotImplementedError`, requires `CAUSAL_LLM_PROVIDER`/`CAUSAL_LLM_MODEL` and a provider API key.

**Hallucination verification** (`utils/verification_backends.py`):
- **`mock`** (default) — checks only what's mechanically verifiable without a vision model: whether each claim's frame files exist and are non-empty. Verdicts are limited to `unverified` (frames exist, content unchecked) or `unverifiable` (frames missing) — it never asserts a claim is actually supported or contradicted.
- **`llm`** — **stubbed**: raises `NotImplementedError`, requires a vision-capable model via `VERIFICATION_LLM_PROVIDER`/`VERIFICATION_LLM_MODEL` and a provider API key.

**Explainability report** (`utils/explainability_styles.py`) — unlike the other three stages, this one is fundamentally a deterministic assembly step (joining captions + causal + verification JSON by `scene_id`), not a reasoning task, so it doesn't force an LLM/mock split:
- **`structured`** (default) — pure formatting, always available, no API key needed. Every claim is kept and visibly flagged with its verdict/confidence; a claim is only marked `included_in_narrative: false` if verdicted `contradicted` (unsupported/unverified claims are always shown, never silently dropped, since the hallucination-catch-rate metric depends on being able to see what got flagged).
- **`narrative_llm`** — optional future enhancement where an LLM rewrites the surviving claims into smoother prose while still citing evidence per sentence. **Stubbed**: raises `NotImplementedError`, requires `EXPLAINABILITY_LLM_PROVIDER`/`EXPLAINABILITY_LLM_MODEL` and a provider API key.

Each stubbed `llm`/`qwen25vl`/`narrative_llm` backend has commented scaffolding in its source file showing exactly what a real implementation needs (prompt structure, packages, env vars).

---

## Benchmark Datasets

`load_dataset_sample.py` downloads a small sample of a benchmark video-captioning dataset for testing the pipeline against real-world video (rather than only our own hand-picked sample clip), and for later scoring pipeline output against ground-truth references.

```bash
python3 load_dataset_sample.py --dataset msrvtt --n 5
```

**MSR-VTT:**
```bash
python3 load_dataset_sample.py --dataset msrvtt --n 5
```
- Reads the official `test_1k` annotation split (`datasets/msrvtt/annotations/msrvtt_test_1k.json`, ~1000 video/caption pairs, tracked in git — it's small and text-only).
- Downloads each sampled video from its source YouTube URL via `yt-dlp`, trimmed to its annotated segment, into `datasets/msrvtt/videos/` (**gitignored** — video files are never committed).
- Writes `datasets/msrvtt/ground_truth.json`, mapping each `video_id` to its reference caption(s) and source URL.

Note: `test_1k.json` provides one reference caption per video. MSR-VTT's full ~20-captions-per-video annotations live in a larger `MSRVTT_data.json` file (not yet downloaded) if multi-reference scoring is needed later.

**ActivityNet Captions (annotations-only for now):**
```bash
python3 load_dataset_sample.py --dataset activitynet --n 5
```
- Reads the official `val_1` annotation split (`datasets/activitynet/annotations/val_1.json`, downloaded from the [Dense-Captioning Events in Videos](https://cs.stanford.edu/people/ranjaykrishna/densevid/) release, tracked in git). Each entry provides multiple timestamped sentences per video.
- Writes `datasets/activitynet/ground_truth.json` (captions, timestamps, duration, derived YouTube URL) for the sampled video IDs.
- **Video download is not yet implemented.** ActivityNet's videos are distributed via an official request form granting temporary (7-day) access to a Google/Baidu Drive folder of the full video set, since many original YouTube source videos have since been taken down. **This form must be submitted personally** (it requires name/institution/intended-use info) — see the `TODO` above `download_activitynet_clip()` in `load_dataset_sample.py` for the form link and next steps once access is granted.

---

## Evaluation

`evaluate_captions.py` scores each video's **merged narrative** (`<video>_narrative.txt`, from `generate_narrative.py`) against its dataset ground-truth reference caption(s):

```bash
python3 evaluate_captions.py --dataset msrvtt
```

Computes **BLEU-4**, **ROUGE-L**, and **METEOR** (via `nltk` and `rouge-score`) per video plus dataset-wide averages, writing `datasets/<dataset>/<dataset>_evaluation.json` (per-video + averages) and a human-readable `<dataset>_evaluation.md` summary table. Both are regenerated per run and **not tracked in git**.

**In mock mode, scores will be near-zero** — narratives are placeholder text (`"Mock caption for scene_001..."`), not real captions, so there's nothing meaningful to match against real references yet. This is expected: the point of building the harness now is to have it tested and working before real captioning (GPT-4o or Qwen2.5-VL) is wired in, not to produce meaningful scores today.

**CIDEr is deferred (TODO in `evaluate_captions.py`)**: the standard implementation (`pycocoevalcap`) requires a Java-based Stanford CoreNLP tokenizer, which isn't confirmed available in this environment. Per project decision, we will **not** substitute a non-standard pure-Python CIDEr reimplementation — our proposal names CIDEr specifically, so the standard implementation should be used once Java availability is confirmed (e.g. in a Colab environment, which typically ships with Java preinstalled).

---

## Batch API Mode

If `USE_BATCH_API=true`, all scenes are submitted in one OpenAI batch job (cheaper, async).

> **Batch mode costs ~50% less** than real-time GPT API calls

You can toggle between batch and sync modes with the `.env` setting.

---

## Token Usage & Cost Tracking

The system logs:

- Prompt + completion token count
- Total tokens used
- Estimated total OpenAI cost

---

Kono daigaku o moyase.