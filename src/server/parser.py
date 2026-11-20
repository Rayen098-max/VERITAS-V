import os
import json
import logging
from datetime import datetime
from typing import Dict, Any, List

def status_from_verdict(verdict: str) -> str:
    v = (verdict or "").lower()
    if v in ("supported", "verified"):
        return "supported"
    elif v in ("contradicted", "refuted", "hallucination"):
        return "unsupported"
    return "uncertain"

def confidence_to_score(conf: Any) -> int:
    if isinstance(conf, (int, float)):
        return int(conf if conf > 1 else conf * 100)
    c = str(conf).lower()
    if "high" in c:
        return 92
    elif "low" in c:
        return 38
    return 70

def build_video_analysis(video_id: str, video_name: str, output_dir: str = "output", media_dir: str = "media") -> Dict[str, Any]:
    """
    Assembles a full VideoAnalysis object from the output artifacts on disk.
    """
    clean_name = video_name.removesuffix(".mp4").removesuffix(".mov").removesuffix(".avi").removesuffix(".webm")
    clean_id = video_id.replace("analysis_", "")
    
    candidate_prefixes = [
        clean_name,
        clean_id,
        clean_name.replace(" ", "_"),
        clean_id.replace(" ", "_"),
    ]

    # Auto-resolve output_dir and matching prefix
    resolved_prefix = clean_name
    for candidate_dir in [output_dir, os.path.join("VERITAS-V", output_dir), os.path.join("..", output_dir)]:
        if os.path.exists(candidate_dir):
            found = False
            for pfx in candidate_prefixes:
                if os.path.exists(os.path.join(candidate_dir, f"{pfx}_captions.json")):
                    output_dir = candidate_dir
                    resolved_prefix = pfx
                    found = True
                    break
            if not found:
                stem_part = clean_name.replace(" ", "_").split("_")[0]
                matches = glob.glob(os.path.join(candidate_dir, f"*{stem_part}*_captions.json"))
                if matches:
                    output_dir = candidate_dir
                    resolved_prefix = os.path.basename(matches[0]).replace("_captions.json", "")
                    found = True
                    break
            if found:
                break

    for candidate_media in [media_dir, os.path.join("VERITAS-V", media_dir), os.path.join("..", media_dir)]:
        if os.path.exists(candidate_media):
            media_dir = candidate_media
            break

    captions_path = os.path.join(output_dir, f"{resolved_prefix}_captions.json")
    narrative_path = os.path.join(output_dir, f"{resolved_prefix}_narrative.txt")
    causal_path = os.path.join(output_dir, f"{resolved_prefix}_causal.json")
    verification_path = os.path.join(output_dir, f"{resolved_prefix}_verification.json")
    explained_path = os.path.join(output_dir, f"{resolved_prefix}_explained.json")
    speakers_path = os.path.join(output_dir, f"{resolved_prefix}_speakers.json")

    scenes_raw = {}
    if os.path.exists(captions_path):
        try:
            with open(captions_path, "r", encoding="utf-8") as f:
                scenes_raw = json.load(f)
        except Exception as e:
            logging.warning(f"Failed to read {captions_path}: {e}")

    narrative_text = ""
    if os.path.exists(narrative_path):
        try:
            with open(narrative_path, "r", encoding="utf-8") as f:
                narrative_text = f.read().strip()
        except Exception as e:
            logging.warning(f"Failed to read {narrative_path}: {e}")

    causal_raw = []
    if os.path.exists(causal_path):
        try:
            with open(causal_path, "r", encoding="utf-8") as f:
                causal_raw = json.load(f)
        except Exception as e:
            logging.warning(f"Failed to read {causal_path}: {e}")

    verifications_raw = []
    if os.path.exists(verification_path):
        try:
            with open(verification_path, "r", encoding="utf-8") as f:
                verifications_raw = json.load(f)
        except Exception as e:
            logging.warning(f"Failed to read {verification_path}: {e}")

    explained_raw = []
    if os.path.exists(explained_path):
        try:
            with open(explained_path, "r", encoding="utf-8") as f:
                explained_raw = json.load(f)
        except Exception as e:
            logging.warning(f"Failed to read {explained_path}: {e}")

    speakers_raw = []
    if os.path.exists(speakers_path):
        try:
            with open(speakers_path, "r", encoding="utf-8") as f:
                speakers_raw = json.load(f)
        except Exception as e:
            logging.warning(f"Failed to read {speakers_path}: {e}")

    transcript_segments_raw = []
    transcript_tmp_path = os.path.join("tmp", f"{clean_name}_transcript.json")
    if os.path.exists(transcript_tmp_path):
        try:
            with open(transcript_tmp_path, "r", encoding="utf-8") as tf:
                t_obj = json.load(tf)
                transcript_segments_raw = t_obj.get("segments", []) if isinstance(t_obj, dict) else t_obj
        except Exception as e:
            logging.warning(f"Failed to read transcript cache {transcript_tmp_path}: {e}")

    # 1. Transform Scenes and Catalog All Extracted Keyframes
    scenes_list: List[Dict[str, Any]] = []
    all_extracted_frames: List[Dict[str, Any]] = []
    total_duration = 0.0

    # Build verification lookup by scene_id
    verif_by_scene = {v.get("scene_id"): v for v in verifications_raw}

    for s_id, s_data in sorted(scenes_raw.items()):
        start = float(s_data.get("start_time", 0.0))
        end = float(s_data.get("end_time", 0.0))
        centroid = float(s_data.get("centroid_time", (start + end) / 2.0))
        total_duration = max(total_duration, end)
        
        # Ensure frame paths are browser-friendly (/frames/...)
        frames = []
        for fp in s_data.get("frame_files", []):
            normalized = fp.replace("\\", "/")
            if not normalized.startswith("/"):
                normalized = "/" + normalized
            frames.append(normalized)

        primary_frame = s_data.get("primary_frame")
        if primary_frame:
            norm_primary = primary_frame.replace("\\", "/")
            if not norm_primary.startswith("/"):
                norm_primary = "/" + norm_primary
        else:
            norm_primary = frames[0] if frames else ""

        detected_elems = s_data.get("detected_elements", {})
        scene_verif = verif_by_scene.get(s_id, {})
        scene_verdict = status_from_verdict(scene_verif.get("verdict", "supported"))

        scenes_list.append({
            "sceneId": s_id,
            "startTime": start,
            "endTime": end,
            "centroidTime": centroid,
            "caption": s_data.get("caption", ""),
            "actionSummary": s_data.get("action_summary", ""),
            "confidence": 88,
            "keywords": s_data.get("keywords", []),
            "detectedElements": detected_elems,
            "primaryFrame": norm_primary,
            "frameFiles": frames,
            "transcriptText": s_data.get("transcript_text", ""),
            "verdict": scene_verdict,
        })

        # Populate all_extracted_frames
        f_meta = s_data.get("frames_metadata", [])
        if f_meta:
            for fm in f_meta:
                f_url = fm.get("file_path", "").replace("\\", "/")
                if f_url and not f_url.startswith("/"):
                    f_url = "/" + f_url
                all_extracted_frames.append({
                    "frameId": f"{s_id}_{fm.get('tag', 'frame')}",
                    "sceneId": s_id,
                    "tag": fm.get("tag", "frame"),
                    "timestamp": fm.get("timestamp", centroid),
                    "timestampStr": fm.get("timestamp_str", f"{int(centroid//60):02d}:{int(centroid%60):02d}"),
                    "frameUrl": f_url,
                    "caption": s_data.get("caption", ""),
                    "actionSummary": s_data.get("action_summary", ""),
                    "primaryActor": detected_elems.get("primary_actor", "Actor"),
                    "objects": detected_elems.get("objects", []),
                    "environment": detected_elems.get("environment", ""),
                    "verdict": scene_verdict,
                    "isCentroid": fm.get("is_centroid", False),
                })
        else:
            for idx, fr in enumerate(frames):
                tag_name = os.path.basename(fr).split("_")[-1].replace(".jpg", "")
                all_extracted_frames.append({
                    "frameId": f"{s_id}_{tag_name}_{idx}",
                    "sceneId": s_id,
                    "tag": tag_name,
                    "timestamp": centroid,
                    "timestampStr": f"{int(centroid//60):02d}:{int(centroid%60):02d}",
                    "frameUrl": fr,
                    "caption": s_data.get("caption", ""),
                    "actionSummary": s_data.get("action_summary", ""),
                    "primaryActor": detected_elems.get("primary_actor", "Actor"),
                    "objects": detected_elems.get("objects", []),
                    "environment": detected_elems.get("environment", ""),
                    "verdict": scene_verdict,
                    "isCentroid": "centroid" in fr,
                })

    # 2. Transform Causal Relations
    causal_list: List[Dict[str, Any]] = []
    for idx, c in enumerate(causal_raw):
        s_id = c.get("scene_id", f"scene_{idx+1:03d}")
        sc_info = scenes_raw.get(s_id, {})
        start = float(sc_info.get("start_time", 0.0))
        end = float(sc_info.get("end_time", 0.0))
        conf_str = str(c.get("confidence", "heuristic"))

        causal_list.append({
            "sceneId": s_id,
            "event": c.get("event", ""),
            "causeSceneId": c.get("cause_scene_id"),
            "cause": c.get("cause"),
            "causalStatement": c.get("causal_statement", c.get("event", "")),
            "confidence": conf_str,
            "confidenceScore": confidence_to_score(conf_str),
            "startTime": start,
            "endTime": end,
        })

    # 3. Transform Verifications
    verifications_list: List[Dict[str, Any]] = []
    verified_count = 0
    hallucinations_count = 0

    for idx, v in enumerate(verifications_raw):
        s_id = v.get("scene_id", f"scene_{idx+1:03d}")
        sc_info = scenes_raw.get(s_id, {})
        start = float(sc_info.get("start_time", 0.0))
        end = float(sc_info.get("end_time", 0.0))
        
        v_status = status_from_verdict(v.get("verdict", "uncertain"))
        if v_status == "supported":
            verified_count += 1
        elif v_status == "unsupported":
            hallucinations_count += 1

        v_frames = []
        for fp in v.get("frame_files", sc_info.get("frame_files", [])):
            normalized = fp.replace("\\", "/")
            if not normalized.startswith("/"):
                normalized = "/" + normalized
            v_frames.append(normalized)

        verifications_list.append({
            "statementId": f"stmt_{s_id}_{idx+1}",
            "sceneId": s_id,
            "statement": v.get("claim", ""),
            "status": v_status,
            "confidence": confidence_to_score(v.get("confidence", "medium")),
            "evidenceFrames": v_frames,
            "timestamps": {"start": start, "end": end},
            "reasoning": v.get("reasoning", ""),
        })

    # 4. Transform Explainability
    explainability_list: List[Dict[str, Any]] = []
    for idx, exp in enumerate(explained_raw):
        s_id = exp.get("scene_id", f"scene_{idx+1:03d}")
        ev = exp.get("evidence", {})
        start = float(ev.get("start_time", 0.0))
        end = float(ev.get("end_time", 0.0))

        e_frames = []
        for fp in ev.get("frame_files", []):
            normalized = fp.replace("\\", "/")
            if not normalized.startswith("/"):
                normalized = "/" + normalized
            e_frames.append(normalized)

        explainability_list.append({
            "statementId": f"exp_{s_id}_{idx+1}",
            "sceneId": s_id,
            "statement": exp.get("claim", ""),
            "status": status_from_verdict(exp.get("verdict", "uncertain")),
            "confidence": confidence_to_score(exp.get("confidence", "medium")),
            "explanation": exp.get("reasoning") or ev.get("action_summary") or "",
            "timestamps": {"start": start, "end": end},
            "evidenceFrames": e_frames,
        })

    # 5. Transform Speakers
    speakers_list: List[Dict[str, Any]] = []
    for idx, sp in enumerate(speakers_raw):
        speakers_list.append({
            "id": f"sp_{idx+1}",
            "speakerId": sp.get("speaker", f"Speaker {idx+1}"),
            "speakerName": sp.get("speaker", f"Speaker {idx+1}"),
            "startTime": float(sp.get("start", 0.0)),
            "endTime": float(sp.get("end", 0.0)),
            "transcription": sp.get("text", ""),
        })

    # File size check
    video_file_path = os.path.join(media_dir, f"{clean_name}.mp4")
    size_str = "0 MB"
    if os.path.exists(video_file_path):
        size_mb = os.path.getsize(video_file_path) / (1024 * 1024)
        size_str = f"{size_mb:.1f} MB"

    statements_count = len(verifications_list)
    total_checks = verified_count + hallucinations_count
    if total_checks > 0:
        trust_score = int(round((verified_count / total_checks) * 100))
    else:
        trust_score = 85 if len(scenes_list) > 0 else 0

    return {
        "id": video_id or f"analysis_{clean_name}",
        "videoName": f"{clean_name}.mp4",
        "videoUrl": f"/media/{clean_name}.mp4",
        "fileSize": size_str,
        "duration": round(total_duration, 1),
        "dateAnalyzed": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "status": "completed",
        "trustScore": trust_score,
        "scenesCount": len(scenes_list),
        "statementsCount": statements_count,
        "verifiedCount": verified_count,
        "hallucinationsCount": hallucinations_count,
        "scenes": scenes_list,
        "allExtractedFrames": all_extracted_frames,
        "audioTranscripts": transcript_segments_raw,
        "causalRelations": causal_list,
        "verifications": verifications_list,
        "explainability": explainability_list,
        "speakers": speakers_list,
        "narrativeText": narrative_text,
    }

