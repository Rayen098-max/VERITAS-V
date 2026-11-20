import os
import sys
import json
import glob
import time
import shutil
import logging
import threading
import subprocess
import urllib.request
import requests
from pathlib import Path
from typing import Dict, Any, List, Optional

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from fastapi import FastAPI, UploadFile, File, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from src.server.parser import build_video_analysis
from src.pipeline.stage1_captioning import run_captioning_stage
from src.pipeline.stage2_narrative import generate_narrative
from src.pipeline.stage3_causal import generate_causal_narrative
from src.pipeline.stage4_verification import generate_verification_report
from src.pipeline.stage5_explainability import generate_explainability_report

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

app = FastAPI(title="VERITAS-V Backend API", version="1.0.0")

# CORS setup for Vite frontend (typically http://localhost:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure directories exist
for d in ["media", "frames", "output", "tmp", "logs", "public/frames"]:
    os.makedirs(d, exist_ok=True)

# Mount static asset directories
app.mount("/frames", StaticFiles(directory="frames"), name="frames")
app.mount("/media", StaticFiles(directory="media"), name="media")
app.mount("/output", StaticFiles(directory="output"), name="output")

# In-memory tracking for active pipeline jobs
# Key: analysis_id -> Job metadata
ACTIVE_JOBS: Dict[str, Dict[str, Any]] = {}

DEFAULT_STAGES = [
    {
        "id": "captioning",
        "name": "Scene Detection & Keyframe Extraction",
        "status": "pending",
        "purpose": "Detect cuts with PySceneDetect, sample keyframes, transcribe audio via Whisper, and generate grounded captions.",
        "backendScript": "src/pipeline/stage1_captioning.py",
        "input": "Raw Video (.mp4)",
        "output": "_captions.json",
        "progress": 0,
    },
    {
        "id": "narrative",
        "name": "Chronological Narrative Synthesis",
        "status": "pending",
        "purpose": "Merge per-scene captions and transcripts into a continuous video narrative.",
        "backendScript": "src/pipeline/stage2_narrative.py",
        "input": "_captions.json",
        "output": "_narrative.txt",
        "progress": 0,
    },
    {
        "id": "causal",
        "name": "Causal Link Inference",
        "status": "pending",
        "purpose": "Infer cause-and-effect relationships between consecutive scenes using LLM structured reasoning.",
        "backendScript": "src/pipeline/stage3_causal.py",
        "input": "_captions.json",
        "output": "_causal.json",
        "progress": 0,
    },
    {
        "id": "verification",
        "name": "Hallucination Verification",
        "status": "pending",
        "purpose": "Check each causal claim against visual frame keyframes to detect and flag hallucinations.",
        "backendScript": "src/pipeline/stage4_verification.py",
        "input": "_causal.json + _captions.json",
        "output": "_verification.json",
        "progress": 0,
    },
    {
        "id": "explainability",
        "name": "Forensic Explainability Compilation",
        "status": "pending",
        "purpose": "Assemble structured evidence-annotated JSON and Markdown forensic reports with inline frame citations.",
        "backendScript": "src/pipeline/stage5_explainability.py",
        "input": "All earlier stage JSON artifacts",
        "output": "_explained.json & _explained.md",
        "progress": 0,
    },
]

def probe_video_duration(video_path: str) -> float:
    try:
        out = subprocess.check_output([
            "ffprobe", "-v", "error",
            "-show_entries", "format=duration",
            "-of", "json",
            video_path
        ], text=True)
        return float(json.loads(out)["format"]["duration"])
    except Exception as e:
        logging.warning(f"ffprobe duration probe failed: {e}")
        return 30.0

def sync_frames_to_supabase(video_stem: str):
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")
    if not supabase_url or not supabase_key:
        return
    frames_folder = os.path.join("frames", f"{video_stem}_frames")
    if not os.path.exists(frames_folder):
        frames_folder = os.path.join("public", "frames", f"{video_stem}_frames")
    if not os.path.exists(frames_folder):
        return
    
    headers = {
        "apikey": supabase_key,
        "Authorization": f"Bearer {supabase_key}",
        "x-upsert": "true"
    }
    for frame_file in os.listdir(frames_folder):
        if frame_file.lower().endswith((".jpg", ".jpeg", ".png")):
            frame_path = os.path.join(frames_folder, frame_file)
            storage_dest = f"{video_stem}_frames/{frame_file}"
            upload_url = f"{supabase_url}/storage/v1/object/frames/{storage_dest}"
            try:
                with open(frame_path, "rb") as f:
                    requests.post(upload_url, headers=headers, data=f, timeout=15)
            except Exception as e:
                logging.warning(f"Failed to sync frame {frame_file} to Supabase: {e}")

def sync_analysis_to_supabase(analysis_id: str, analysis_data: dict, video_url: Optional[str] = None):
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")
    if not supabase_url or not supabase_key:
        return
    rest_url = f"{supabase_url}/rest/v1/analyses"
    headers = {
        "apikey": supabase_key,
        "Authorization": f"Bearer {supabase_key}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates"
    }
    payload = {
        "id": analysis_id,
        "video_name": analysis_data.get("videoName"),
        "video_url": video_url or analysis_data.get("videoUrl"),
        "file_size": analysis_data.get("fileSize", "N/A"),
        "duration": analysis_data.get("duration", 0),
        "status": "completed",
        "stages": [{"id": "pipeline", "status": "completed", "progress": 100, "output_data": analysis_data}],
        "causal_graph": {"claims": analysis_data.get("causalRelations", [])},
        "verification_report": {
            "trust_score": analysis_data.get("trustScore", 85),
            "verifications": analysis_data.get("verifications", []),
            "explainability": analysis_data.get("explainability", [])
        }
    }
    try:
        r = requests.post(rest_url, headers=headers, json=payload, timeout=15)
        logging.info(f"[{analysis_id}] Synced analysis to Supabase: status {r.status_code}")
    except Exception as e:
        logging.warning(f"[{analysis_id}] Failed to sync analysis to Supabase: {e}")

def run_pipeline_worker(analysis_id: str, video_path: str, config: Dict[str, Any]):
    job = ACTIVE_JOBS.get(analysis_id)
    if not job:
        return

    stages = job["stages"]
    video_name = os.path.splitext(os.path.basename(video_path))[0]
    captions_file = os.path.join("output", f"{video_name}_captions.json")

    backend_name = config.get("backend") or os.getenv("CAPTIONING_BACKEND", "gemini")
    if backend_name in ("qwen25vl", "veritas_local"):
        backend_name = "gemini" if os.getenv("GEMINI_API_KEY") else "groq"
    threshold = float(config.get("sceneThreshold", 30.0))
    frames_per_scene = int(config.get("framesPerScene", 4))
    whisper_enabled = config.get("whisperEnabled", True)
    disable_audio = not whisper_enabled or os.getenv("DISABLE_AUDIO", "false").lower() in ("true", "1", "yes")

    def update_stage(stage_id: str, status: str, progress: int, message: Optional[str] = None):
        for s in stages:
            if s["id"] == stage_id:
                s["status"] = status
                s["progress"] = progress
                if message:
                    s["message"] = message
                    if status == "error":
                        s["errorMsg"] = message
                break

    try:
        # Stage 1: Captioning
        update_stage("captioning", "processing", 15, "Detecting scene cuts...")
        os.environ["CAPTIONING_BACKEND"] = backend_name
        logging.info(f"[{analysis_id}] Starting Stage 1 Captioning ({backend_name})...")
        run_captioning_stage(
            video_path,
            output_dir="output",
            num_frames_per_scene=frames_per_scene,
            threshold=threshold,
            backend=backend_name,
            disable_audio=disable_audio,
            progress_callback=update_stage
        )
        update_stage("captioning", "completed", 100, "Scene detection and keyframe captioning complete.")

        # Stage 2: Narrative
        update_stage("narrative", "processing", 20, "Synthesizing chronological video narrative...")
        logging.info(f"[{analysis_id}] Starting Stage 2 Narrative...")
        generate_narrative(captions_file, output_dir="output")
        update_stage("narrative", "completed", 100, "Chronological narrative generated.")

        # Stage 3: Causal
        update_stage("causal", "processing", 20, "Inferring causal relationships between scenes...")
        logging.info(f"[{analysis_id}] Starting Stage 3 Causal Inference...")
        generate_causal_narrative(captions_file, output_dir="output")
        update_stage("causal", "completed", 100, "Causal graph reasoning complete.")

        # Stage 4: Verification
        update_stage("verification", "processing", 25, "Verifying claims against visual evidence frames...")
        logging.info(f"[{analysis_id}] Starting Stage 4 Verification...")
        generate_verification_report(captions_file, output_dir="output")
        update_stage("verification", "completed", 100, "Visual hallucination verification complete.")

        # Stage 5: Explainability
        update_stage("explainability", "processing", 50, "Compiling dual-format forensic explainability reports...")
        logging.info(f"[{analysis_id}] Starting Stage 5 Explainability...")
        generate_explainability_report(captions_file, output_dir="output")
        update_stage("explainability", "completed", 100, "Forensic explainability reports generated.")

        job["status"] = "completed"
        logging.info(f"[{analysis_id}] Pipeline completed successfully!")

        # Sync frames and analysis report to Supabase
        try:
            sync_frames_to_supabase(video_name)
            analysis_obj = build_video_analysis(analysis_id, job["video_name"])
            sync_analysis_to_supabase(analysis_id, analysis_obj, video_url=config.get("video_url"))
        except Exception as sync_e:
            logging.error(f"[{analysis_id}] Supabase post-processing sync failed: {sync_e}")

    except Exception as e:
        logging.error(f"[{analysis_id}] Pipeline failed: {e}", exc_info=True)
        job["status"] = "failed"
        job["error"] = str(e)
        for s in stages:
            if s["status"] == "processing":
                s["status"] = "error"
                s["errorMsg"] = str(e)

# --- REST Endpoints ---

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "VERITAS-V Backend"}

@app.post("/api/analysis/upload")
async def upload_video(video: UploadFile = File(...)):
    os.makedirs("media", exist_ok=True)
    filename = video.filename or "uploaded_video.mp4"
    safe_stem = Path(filename).stem.replace(" ", "_")
    target_path = os.path.join("media", f"{safe_stem}.mp4")

    with open(target_path, "wb") as f:
        shutil.copyfileobj(video.file, f)

    file_size_bytes = os.path.getsize(target_path)
    file_size_mb = f"{(file_size_bytes / (1024 * 1024)):.1f} MB"
    duration = probe_video_duration(target_path)

    analysis_id = f"analysis_{safe_stem}_{int(time.time())}"

    # Initialize job in registry
    ACTIVE_JOBS[analysis_id] = {
        "id": analysis_id,
        "video_name": f"{safe_stem}.mp4",
        "video_path": target_path,
        "file_size": file_size_mb,
        "duration": duration,
        "status": "pending",
        "stages": [dict(s) for s in DEFAULT_STAGES],
    }

    return {
        "id": analysis_id,
        "name": f"{safe_stem}.mp4",
        "size": file_size_mb,
        "duration": round(duration, 1),
    }

class StartAnalysisRequest(BaseModel):
    video_url: Optional[str] = None
    video_name: Optional[str] = None
    backend: Optional[str] = "groq"
    sceneThreshold: Optional[float] = 30.0
    framesPerScene: Optional[int] = 4
    whisperEnabled: Optional[bool] = True
    strictness: Optional[str] = "rigorous"
    sceneCaptions: Optional[bool] = True
    narrative: Optional[bool] = True
    causalReasoning: Optional[bool] = True
    verifyHallucinations: Optional[bool] = True
    explainability: Optional[bool] = True
    diarization: Optional[bool] = False

@app.post("/api/analysis/{analysis_id}/start")
async def start_analysis(analysis_id: str, req: StartAnalysisRequest, background_tasks: BackgroundTasks):
    job = ACTIVE_JOBS.get(analysis_id)
    clean_id = analysis_id.replace("analysis_", "")
    os.makedirs("media", exist_ok=True)
    os.makedirs("output", exist_ok=True)
    os.makedirs("frames", exist_ok=True)
    target_media = os.path.join("media", f"{clean_id}.mp4")

    # 1. First, check if video is already available locally by video_name or clean_id
    if req.video_name:
        for check_dir in ["media", "public/media", "VERITAS-V/media"]:
            candidate = os.path.join(check_dir, req.video_name)
            if os.path.exists(candidate) and os.path.getsize(candidate) > 1024:
                target_media = candidate
                break

    # 2. If video_url was provided (e.g. from Supabase Storage), download it!
    if req.video_url and not os.path.exists(target_media):
        dl_url = req.video_url
        if dl_url.startswith("/"):
            dl_url = f"https://veritas-v-one.vercel.app{dl_url}"

        logging.info(f"[{analysis_id}] Fetching video from remote URL: {dl_url}")
        try:
            dl_headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
            supa_key = os.getenv("SUPABASE_KEY")
            if supa_key and "supabase.co" in dl_url:
                dl_headers["apikey"] = supa_key
                dl_headers["Authorization"] = f"Bearer {supa_key}"

            with requests.get(dl_url, headers=dl_headers, stream=True, timeout=120) as r:
                r.raise_for_status()
                content_type = r.headers.get("Content-Type", "").lower()
                if "text/html" in content_type:
                    raise ValueError(f"URL returned HTML document ({content_type}) instead of video stream")

                with open(target_media, "wb") as f:
                    for chunk in r.iter_content(chunk_size=1024 * 1024):
                        if chunk:
                            f.write(chunk)
            logging.info(f"[{analysis_id}] Video downloaded successfully ({os.path.getsize(target_media)} bytes)")
        except Exception as dl_err:
            logging.error(f"Failed to download video from {dl_url}: {dl_err}")
            if os.path.exists(target_media):
                try:
                    os.remove(target_media)
                except Exception:
                    pass
            # If target_media doesn't exist, check if there's any file in media/ matching clean_stem
            clean_stem = clean_id.split("_")[0]
            existing = [os.path.join("media", f) for f in os.listdir("media") if clean_stem.lower() in f.lower() and f.endswith((".mp4", ".mov", ".avi", ".webm"))] if os.path.exists("media") else []
            if not existing and os.path.exists("public/media"):
                existing = [os.path.join("public/media", f) for f in os.listdir("public/media") if clean_stem.lower() in f.lower() and f.endswith((".mp4", ".mov", ".avi", ".webm"))]
            if existing:
                target_media = existing[0]
                logging.info(f"Falling back to existing local media file: {target_media}")
            else:
                raise HTTPException(status_code=400, detail=f"Failed to fetch video from remote URL: {dl_err}")

    if not job:
        found_media = None
        if os.path.exists(target_media):
            found_media = target_media
        elif os.path.exists("media") and os.listdir("media"):
            clean_stem = clean_id.split("_")[0]
            candidates = [os.path.join("media", f) for f in os.listdir("media") if f.endswith((".mp4", ".mov", ".avi", ".webm")) and clean_stem.lower() in f.lower()]
            if candidates:
                found_media = candidates[0]
            else:
                found_media = os.path.join("media", os.listdir("media")[-1])

        if found_media and os.path.exists(found_media):
            dur = probe_video_duration(found_media)
            sz = f"{(os.path.getsize(found_media) / (1024 * 1024)):.1f} MB"
            job = {
                "id": analysis_id,
                "video_name": req.video_name or os.path.basename(found_media),
                "video_path": found_media,
                "file_size": sz,
                "duration": dur,
                "status": "pending",
                "stages": [dict(s) for s in DEFAULT_STAGES],
            }
            ACTIVE_JOBS[analysis_id] = job
        else:
            raise HTTPException(status_code=404, detail="Analysis job not found and no video file available")

    job["status"] = "processing"
    config_dict = req.model_dump()

    # Launch background execution thread
    threading.Thread(
        target=run_pipeline_worker,
        args=(analysis_id, job["video_path"], config_dict),
        daemon=True
    ).start()

    return {"status": "started", "analysisId": analysis_id}

@app.get("/api/analysis/{analysis_id}/status")
def get_pipeline_status(analysis_id: str):
    job = ACTIVE_JOBS.get(analysis_id)
    if job:
        return {"stages": job["stages"], "status": job["status"]}

    # Check if completed on disk
    clean_stem = analysis_id.replace("analysis_", "")
    explained_candidates = glob.glob(f"output/*{clean_stem}*_explained.json") + glob.glob(f"VERITAS-V/output/*{clean_stem}*_explained.json")
    if explained_candidates:
        completed_stages = [
            {**s, "status": "completed", "progress": 100}
            for s in DEFAULT_STAGES
        ]
        return {"stages": completed_stages, "status": "completed"}

    # Check Supabase database fallback
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")
    if supabase_url and supabase_key:
        try:
            r = requests.get(
                f"{supabase_url}/rest/v1/analyses?id=eq.{analysis_id}&select=status,stages",
                headers={"apikey": supabase_key, "Authorization": f"Bearer {supabase_key}"},
                timeout=5
            )
            if r.ok and r.json():
                row = r.json()[0]
                return {"stages": row.get("stages", DEFAULT_STAGES), "status": row.get("status", "completed")}
        except Exception:
            pass

    raise HTTPException(status_code=404, detail="Analysis ID not found")

@app.get("/api/analysis/history")
def get_analysis_history():
    history: List[Dict[str, Any]] = []
    seen_videos = set()

    # 1. Check all output/*_explained.json files
    explained_files = glob.glob("output/*_explained.json") + glob.glob("VERITAS-V/output/*_explained.json")
    for exp_path in explained_files:
        video_stem = os.path.basename(exp_path).removesuffix("_explained.json")
        if video_stem in seen_videos:
            continue
        seen_videos.add(video_stem)

        analysis_obj = build_video_analysis(f"analysis_{video_stem}", f"{video_stem}.mp4")
        history.append(analysis_obj)

    # 2. Add any active jobs not yet finished
    for a_id, job in ACTIVE_JOBS.items():
        v_stem = os.path.splitext(job["video_name"])[0]
        if v_stem not in seen_videos:
            history.append({
                "id": a_id,
                "videoName": job["video_name"],
                "videoUrl": f"/media/{job['video_name']}",
                "fileSize": job.get("file_size", "0 MB"),
                "duration": round(job.get("duration", 0), 1),
                "dateAnalyzed": "Just now",
                "status": job.get("status", "processing"),
                "trustScore": 0,
                "scenesCount": 0,
                "statementsCount": 0,
                "verifiedCount": 0,
                "hallucinationsCount": 0,
                "scenes": [],
                "causalRelations": [],
                "verifications": [],
                "explainability": [],
                "speakers": [],
                "narrativeText": "",
            })

    return history

@app.get("/api/analysis/{analysis_id}")
def get_analysis_details(analysis_id: str):
    # Determine video name
    job = ACTIVE_JOBS.get(analysis_id)
    video_name = job["video_name"] if job else None

    if not video_name:
        clean_stem = analysis_id.replace("analysis_", "")
        # Look for matching explained file
        matches = glob.glob(f"output/*{clean_stem}*_explained.json")
        if matches:
            video_name = os.path.basename(matches[0]).removesuffix("_explained.json") + ".mp4"
        else:
            # Fallback to direct name
            video_name = f"{clean_stem}.mp4"

    return build_video_analysis(analysis_id, video_name)

@app.delete("/api/analysis/{analysis_id}")
def delete_analysis(analysis_id: str):
    if analysis_id in ACTIVE_JOBS:
        del ACTIVE_JOBS[analysis_id]

    clean_stem = analysis_id.replace("analysis_", "")
    # Remove outputs
    for f in glob.glob(f"output/{clean_stem}*"):
        try:
            os.remove(f)
        except Exception:
            pass

    return {"deleted": True, "analysisId": analysis_id}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.server.app:app", host="127.0.0.1", port=8000, reload=True)
