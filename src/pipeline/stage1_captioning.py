import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
import time
import json
import subprocess
import logging
import argparse
from datetime import timedelta
from dotenv import load_dotenv

from src.utils.logging_utils import setup_logger
from src.utils.captioning_backends import get_backend
from src.utils.extract_utils import extract_frame_with_ffmpeg

load_dotenv()

def get_video_duration(video_path):
    out = subprocess.check_output([
        "ffprobe", "-v", "error",
        "-show_entries", "format=duration",
        "-of", "json",
        video_path
    ], text=True)
    return float(json.loads(out)["format"]["duration"])

def run_captioning_stage(video_path, output_dir="output", num_frames_per_scene=5, threshold=None, backend=None):
    os.makedirs(output_dir, exist_ok=True)
    video_name = os.path.splitext(os.path.basename(video_path))[0]
    output_path = os.path.join(output_dir, f"{video_name}_captions.json")
    frames_dir = os.path.join("frames", f"{video_name}_frames")
    public_frames_dir = os.path.join("public", "frames", f"{video_name}_frames")
    os.makedirs(frames_dir, exist_ok=True)
    os.makedirs(public_frames_dir, exist_ok=True)

    total_duration = get_video_duration(video_path)
    logging.info(f"Video {video_path} duration: {total_duration:.2f}s")

    scene_threshold = threshold if threshold is not None else float(os.getenv("PY_SCENE_DETECT_THRESHOLD", "30.0"))

    # Automated scene boundary detection via PySceneDetect with fallback
    scenes_def = []
    try:
        from scenedetect import open_video, SceneManager
        from scenedetect.detectors import ContentDetector
        vid = open_video(video_path)
        sm = SceneManager()
        sm.auto_downscale = True
        sm.add_detector(ContentDetector(threshold=scene_threshold, min_scene_len=45))
        sm.detect_scenes(vid)
        detected = sm.get_scene_list()
        if detected:
            scenes_def = [
                {"scene_number": i + 1, "start_time": s.get_seconds(), "end_time": min(e.get_seconds(), total_duration - 0.2)}
                for i, (s, e) in enumerate(detected[:12])
            ]
    except Exception as e:
        logging.warning(f"Scene detection fallback: {e}")

    if not scenes_def:
        num_chunks = 4 if total_duration >= 20 else max(1, int(total_duration // 5))
        chunk_len = total_duration / num_chunks
        scenes_def = [
            {"scene_number": i + 1, "start_time": round(i * chunk_len, 2), "end_time": round(min((i + 1) * chunk_len, total_duration - 0.1), 2)}
            for i in range(num_chunks)
        ]

    active_backend = backend or os.getenv("CAPTIONING_BACKEND", "groq")
    backend_fn = get_backend(active_backend)
    captions = {}
    if os.path.exists(output_path):
        try:
            with open(output_path, "r", encoding="utf-8") as f:
                captions = json.load(f)
        except Exception:
            captions = {}

    transcript_segments = []
    transcript_cache = os.path.join("tmp", f"{video_name}_transcript.json")
    disable_audio = os.getenv("DISABLE_AUDIO", "false").lower() in ("true", "1", "yes")

    if os.path.exists(transcript_cache):
        try:
            with open(transcript_cache, "r", encoding="utf-8") as tf:
                tdata = json.load(tf)
                transcript_segments = tdata.get("segments", []) if isinstance(tdata, dict) else tdata
        except Exception as e:
            logging.warning(f"Could not load transcript cache: {e}")
    elif not disable_audio:
        groq_success = False
        if os.getenv("GROQ_API_KEY") or os.getenv("GROQ_API_KEY_1"):
            try:
                from src.utils.groq_client import execute_with_groq_failover
                def _call_groq_whisper(client):
                    with open(video_path, "rb") as vf:
                        return client.audio.transcriptions.create(
                            file=(os.path.basename(video_path), vf.read()),
                            model="whisper-large-v3-turbo",
                            response_format="verbose_json"
                        )
                g_res = execute_with_groq_failover(_call_groq_whisper)
                segments = getattr(g_res, "segments", []) or []
                transcript_segments = []
                for s in segments:
                    s_start = getattr(s, "start", s.get("start", 0) if isinstance(s, dict) else 0)
                    s_end = getattr(s, "end", s.get("end", 0) if isinstance(s, dict) else 0)
                    s_text = getattr(s, "text", s.get("text", "") if isinstance(s, dict) else "")
                    transcript_segments.append({"start": float(s_start), "end": float(s_end), "text": str(s_text).strip()})
                os.makedirs("tmp", exist_ok=True)
                with open(transcript_cache, "w", encoding="utf-8") as tf:
                    json.dump({"segments": transcript_segments}, tf, indent=2)
                logging.info(f"Groq Whisper turbo extracted {len(transcript_segments)} speech segments in cloud.")
                groq_success = True
            except Exception as ge:
                logging.warning(f"Groq Whisper failed ({ge}); attempting local Whisper...")

        if not groq_success:
            try:
                from src.utils.whisper_utils import transcribe_video_with_whisper
                cache_dir = os.getenv("TRANSCRIPT_CACHE_DIR", "tmp")
                model_size = os.getenv("WHISPER_MODEL_SIZE", "tiny")
                raw_segments = transcribe_video_with_whisper(video_path, cache_dir, model_size)
                transcript_segments = raw_segments.get("segments", []) if isinstance(raw_segments, dict) else raw_segments
                os.makedirs("tmp", exist_ok=True)
                with open(transcript_cache, "w", encoding="utf-8") as tf:
                    json.dump({"segments": transcript_segments}, tf, indent=2)
            except Exception as e:
                logging.warning(f"Whisper transcription skipped: {e}")

    speaker_segments = []
    hf_token = os.getenv("HUGGINGFACE_TOKEN")
    if hf_token and not disable_audio and transcript_segments:
        try:
            from src.utils.extract_utils import extract_audio
            from src.utils.diarization_utils import run_diarization
            from src.utils.speaker_utils import load_speaker_map, match_speakers
            audio_tmp = os.path.join("tmp", f"{video_name}_audio.wav")
            extract_audio(video_path, audio_tmp)
            diar = run_diarization(audio_tmp, hf_token)
            if diar:
                smap = load_speaker_map()
                speaker_segments = match_speakers(transcript_segments, diar, smap)
        except Exception as e:
            logging.warning(f"Diarization skipped: {e}")

    for sc in scenes_def:
        num = sc["scene_number"]
        scene_id = f"scene_{num:03d}"
        start_sec = sc["start_time"]
        end_sec = sc["end_time"]

        centroid_sec = round((start_sec + end_sec) / 2.0, 2)
        times = {"start": start_sec, "centroid": centroid_sec, "end": end_sec}
        step = (end_sec - start_sec) / (num_frames_per_scene + 1)
        for j in range(num_frames_per_scene):
            times[f"t{j+1}"] = round(start_sec + (j + 1) * step, 2)

        frame_paths = {}
        frames_meta = []
        for tag, t in times.items():
            t_clamped = max(0.0, min(t, total_duration - 0.2))
            filename = f"{video_name}_scene_{num:03d}_{tag}.jpg"
            filepath = os.path.join(frames_dir, filename)
            pub_path = os.path.join(public_frames_dir, filename)
            if not os.path.exists(filepath):
                extract_frame_with_ffmpeg(video_path, t_clamped, filepath)
            if os.path.exists(filepath) and not os.path.exists(pub_path):
                import shutil
                shutil.copyfile(filepath, pub_path)
            frame_paths[tag] = filepath
            frames_meta.append({
                "tag": tag,
                "timestamp": round(t_clamped, 2),
                "timestamp_str": f"{int(t_clamped // 60):02d}:{int(t_clamped % 60):02d}",
                "file_path": f"frames/{video_name}_frames/{filename}",
                "is_centroid": (tag == "centroid")
            })

        if scene_id in captions and captions[scene_id].get("caption"):
            logging.info(f"{scene_id} already captioned, reusing cached result.")
            continue

        scene_text = " ".join(
            seg.get("text", "").strip()
            for seg in transcript_segments
            if seg.get("end", 0) >= start_sec and seg.get("start", 0) <= end_sec
        ).strip()

        logging.info(f"Extracting captions for {scene_id} ({start_sec:.1f}s - {end_sec:.1f}s, centroid: {centroid_sec:.1f}s)...")
        result = backend_fn(frame_paths, scene_text)
        time.sleep(0.5)
        
        captions[scene_id] = {
            "start_time": start_sec,
            "end_time": end_sec,
            "centroid_time": centroid_sec,
            "primary_frame": f"frames/{video_name}_frames/{video_name}_scene_{num:03d}_centroid.jpg",
            "frame_files": [f"frames/{video_name}_frames/{video_name}_scene_{num:03d}_{tag}.jpg" for tag in times],
            "frames_metadata": frames_meta,
            "transcript_text": scene_text,
            **result
        }

        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(captions, f, indent=2)

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(captions, f, indent=2)

    if speaker_segments:
        speaker_output = os.path.join(output_dir, f"{video_name}_speakers.json")
        with open(speaker_output, "w", encoding="utf-8") as f:
            json.dump(speaker_segments, f, indent=2)
        logging.info(f"Speaker diarization saved to {speaker_output}")

    logging.info(f"Stage 1 captions saved to {output_path}")
    return output_path

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Stage 1: Video scene detection, frame extraction and captioning")
    parser.add_argument("--input", required=True, help="Path to video file")
    parser.add_argument("--output", required=False, default="output", help="Path to output directory")
    parser.add_argument("--log", required=False, default="logs", help="Path to log directory")
    parser.add_argument("--num-frames", required=False, type=int, default=5, help="Number of intermediate frames per scene")
    parser.add_argument("--threshold", required=False, type=float, default=None, help="Scene detection threshold (default from env or 30.0)")
    parser.add_argument("--backend", required=False, help="Captioning backend (groq, mock, gpt4o, qwen25vl)")
    args, _ = parser.parse_known_args()

    setup_logger(args.input, output_dir=args.log)
    run_captioning_stage(args.input, args.output, args.num_frames, threshold=args.threshold, backend=args.backend)
