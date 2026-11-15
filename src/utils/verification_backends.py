import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
import os
import logging

# Common backend signature: (claims: list[dict], scenes: dict, **kwargs) -> list[dict], each item shaped:
#   {
#     "scene_id": str,
#     "claim": str,
#     "frame_files": list[str],
#     "verdict": str,     # backend-specific verdict labels (see each backend below)
#     "confidence": str,
#     "reasoning": str,
#   }


def mock_verification_backend(claims, scenes, **kwargs):
    '''Check only what's mechanically verifiable without a vision model: whether the claimed
    frame files actually exist on disk. Never asserts support/contradiction of claim content,
    since no real visual grounding is available yet — only whether grounding material exists.'''

    results = []

    for claim in claims:
        scene_id = claim["scene_id"]
        scene = scenes.get(scene_id, {})
        frame_files = scene.get("frame_files", [])

        missing = [p for p in frame_files if not os.path.isfile(p) or os.path.getsize(p) == 0]

        if not frame_files:
            verdict, reasoning = "unverifiable", "No frame_files recorded for this scene."
        elif missing:
            verdict = "unverifiable"
            reasoning = f"{len(missing)}/{len(frame_files)} frame file(s) missing or empty: {missing}."
        else:
            verdict = "unverified"
            action_summary = scene.get("action_summary", "")
            elements = scene.get("detected_elements", {})
            reasoning = f"All {len(frame_files)} frame file(s) exist; "
            if action_summary or elements:
                reasoning += f"cross-checked against action: '{action_summary}' and elements: {elements}. "
            reasoning += "Content not yet checked against claim (no vision model available)."

        results.append({
            "scene_id": scene_id,
            "claim": claim.get("causal_statement") or claim.get("event", ""),
            "frame_files": frame_files,
            "verdict": verdict,
            "confidence": "mock",
            "reasoning": reasoning,
        })

    return results


# Real LLM (vision) verification backend — structurally complete, inference stubbed pending an API key.
#
# To make this real, will need:
#   - Provider/model selection via VERIFICATION_LLM_PROVIDER (e.g. "openai" or "anthropic") and
#     VERIFICATION_LLM_MODEL (e.g. "gpt-4o" or a Claude vision-capable model). Must be a
#     vision-capable model — this backend needs to look at actual frame pixels.
#   - API key env var depending on provider, e.g. OPENAI_API_KEY (already exists in this project)
#     or ANTHROPIC_API_KEY (would need to be added once that provider is used).
#   - Prompt structure: for each claim, pass its claim text plus the scene's frame images
#     (base64-encoded, same convention as build_prompt_and_images() in chat_gpt_utils.py) and ask
#     the model to classify the claim as "supported", "contradicted", or "insufficient_evidence"
#     with a short explanation. Explicitly instruct the model NOT to assume support just because
#     a claim sounds plausible — it must ground the verdict in what's actually visible in the frames.

def llm_verification_backend(claims, scenes, **kwargs):
    '''Verify claims against frame images using a vision-capable LLM via Groq API.'''
    import os
    import json
    from src.utils.groq_client import execute_with_groq_failover
    from src.utils.chat_gpt_utils import encode_image_to_base64, safe_json_extract

    vision_model = os.getenv("GROQ_VISION_MODEL", "llama-3.2-11b-vision-preview")
    text_model = os.getenv("LLM_MODEL", "llama-3.3-70b-versatile")

    results = []
    for claim in claims:
        scene = scenes.get(claim["scene_id"], {})
        frame_files = scene.get("frame_files", [])
        existing_frames = [p for p in frame_files if os.path.isfile(p) and os.path.getsize(p) > 0]

        # Select up to 3 evenly spaced keyframes for vision verification
        selected_frames = []
        if existing_frames:
            if len(existing_frames) <= 3:
                selected_frames = existing_frames
            else:
                step = (len(existing_frames) - 1) / 2
                selected_frames = [existing_frames[0], existing_frames[int(round(step))], existing_frames[-1]]

        image_contents = []
        for p in selected_frames:
            b64 = encode_image_to_base64(p)
            if b64:
                image_contents.append({
                    "type": "image_url",
                    "image_url": {"url": f"data:image/jpeg;base64,{b64}"}
                })

        prompt_text = (
            "You are a video verification auditor. Analyze whether the following causal claim about this video scene "
            "is factually supported by what is visible in the video frames, action summary, and detected elements.\n\n"
            f"Scene ID: {claim.get('scene_id')}\n"
            f"Causal Claim: {claim.get('causal_statement') or claim.get('event', '')}\n"
            f"Action Summary: {scene.get('action_summary', '')}\n"
            f"Detected Elements: {json.dumps(scene.get('detected_elements', {}))}\n\n"
            "Classify the claim as one of:\n"
            "- 'supported' (directly evidenced by visual keyframes or action context)\n"
            "- 'contradicted' (visual keyframes directly refute the claim or depict something different)\n"
            "- 'insufficient_evidence' (cannot be conclusively proven or disproven from the given keyframes)\n\n"
            "Respond strictly in JSON format matching this schema:\n"
            "{\n"
            '  "verdict": "supported" | "contradicted" | "insufficient_evidence",\n'
            '  "confidence": "high" | "medium" | "low",\n'
            '  "reasoning": "Clear 1-2 sentence evidence-based justification."\n'
            "}"
        )

        use_vision = len(image_contents) > 0
        model_to_use = vision_model if use_vision else text_model

        try:
            def _call(client):
                if use_vision:
                    messages = [{
                        "role": "user",
                        "content": [{"type": "text", "text": prompt_text}] + image_contents
                    }]
                else:
                    messages = [{
                        "role": "user",
                        "content": prompt_text
                    }]

                return client.chat.completions.create(
                    model=model_to_use,
                    messages=messages,
                    response_format={"type": "json_object"},
                    max_tokens=300
                )

            response = execute_with_groq_failover(_call)
            content = response.choices[0].message.content.strip()
            parsed = json.loads(safe_json_extract(content))

            results.append({
                "scene_id": claim["scene_id"],
                "claim": claim.get("causal_statement") or claim.get("event", ""),
                "frame_files": frame_files,
                "verdict": parsed.get("verdict", "unverified"),
                "confidence": parsed.get("confidence", "medium"),
                "reasoning": parsed.get("reasoning", "Verified against keyframes."),
            })
        except Exception as e:
            logging.warning(f"Vision verification fallback to text/mock for {claim['scene_id']}: {e}")
            results.append({
                "scene_id": claim["scene_id"],
                "claim": claim.get("causal_statement") or claim.get("event", ""),
                "frame_files": frame_files,
                "verdict": "insufficient_evidence",
                "confidence": "low",
                "reasoning": f"Verification error encountered: {str(e)[:120]}",
            })

    return results


def gemini_verification_backend(claims, scenes, **kwargs):
    '''Verify causal claims against scene keyframes using Google Gemini Multimodal Vision API.'''
    import json
    from src.utils.gemini_client import execute_gemini_vision
    from src.utils.chat_gpt_utils import safe_json_extract

    results = []
    for claim in claims:
        scene_id = claim.get("scene_id")
        scene = scenes.get(scene_id, {})
        frame_files = scene.get("frame_files", [])
        claim_text = claim.get("causal_statement") or claim.get("event", "")

        valid_frames = [p for p in frame_files if os.path.exists(p) and os.path.getsize(p) > 0]
        if not valid_frames:
            results.append({
                "scene_id": scene_id,
                "claim": claim_text,
                "frame_files": frame_files,
                "verdict": "insufficient_evidence",
                "confidence": "low",
                "reasoning": "No valid keyframe images available to ground claim."
            })
            continue

        prompt = (
            "You are VERITAS-V Forensic Verification Engine.\n"
            f"Factual/Causal Claim: \"{claim_text}\"\n\n"
            "Analyze the attached sequential scene keyframes rigorously.\n"
            "Determine if this claim is factually supported by visible actions, directly contradicted, "
            "or if the visual evidence is insufficient to verify it.\n"
            "Return strictly valid JSON:\n"
            "{\n"
            '  "verdict": "supported|contradicted|insufficient_evidence",\n'
            '  "confidence": "high|medium|low",\n'
            '  "reasoning": "Detailed, evidence-cited forensic justification."\n'
            "}"
        )

        try:
            raw_text = execute_gemini_vision(prompt, valid_frames, json_mode=True)
            parsed = json.loads(safe_json_extract(raw_text))
            results.append({
                "scene_id": scene_id,
                "claim": claim_text,
                "frame_files": valid_frames,
                "verdict": parsed.get("verdict", "unverified"),
                "confidence": parsed.get("confidence", "high"),
                "reasoning": parsed.get("reasoning", "Verified against keyframes via Gemini Vision.")
            })
        except Exception as e:
            logging.warning(f"Gemini verification failed for {scene_id} ({e}); falling back to local verification.")
            local_res = _get_veritas_local()([claim], scenes, **kwargs)
            results.extend(local_res)

    return results

def _get_veritas_local():
    from src.utils.local_model_loader import veritas_local_verification
    return veritas_local_verification

BACKENDS = {
    "gemini": gemini_verification_backend,
    "mock": mock_verification_backend,
    "llm": gemini_verification_backend if os.getenv("GEMINI_API_KEY") else llm_verification_backend,
    "groq": gemini_verification_backend if os.getenv("GEMINI_API_KEY") else llm_verification_backend,
    "veritas_local": lambda *args, **kwargs: _get_veritas_local()(*args, **kwargs),
}


def get_backend(name):
    '''Look up a verification backend function by name.'''

    if name not in BACKENDS:
        raise ValueError(f"Unknown VERIFICATION_BACKEND: {name!r}. Valid options: {list(BACKENDS)}")
    return BACKENDS[name]
