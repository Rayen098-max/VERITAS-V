import logging

# Common backend signature: (scenes: dict, **kwargs) -> list[dict], each item shaped:
#   {
#     "scene_id": str,
#     "event": str,                 # this scene's event (its caption)
#     "cause_scene_id": str|None,   # preceding scene id this event is linked to, or None
#     "cause": str|None,            # the preceding scene's event text, or None
#     "causal_statement": str,      # human-readable rendering of this link (or lack thereof)
#     "confidence": str,            # backend-specific confidence/provenance marker
#   }


def mock_causal_backend(scenes, **kwargs):
    '''Heuristically link consecutive scenes via keyword overlap. Not real reasoning — a
    deterministic stand-in that demonstrates the pipeline's shape using real signal already
    present in the captions JSON (keyword overlap), rather than a fixed placeholder string.'''

    scene_ids = sorted(scenes.keys())
    results = []

    for i, scene_id in enumerate(scene_ids):
        scene = scenes[scene_id]
        event = (scene.get("caption") or "").strip()

        if i == 0:
            results.append({
                "scene_id": scene_id,
                "event": event,
                "cause_scene_id": None,
                "cause": None,
                "causal_statement": event,
                "confidence": "no_prior_scene",
            })
            continue

        prev_id = scene_ids[i - 1]
        prev_scene = scenes[prev_id]
        overlap_keywords = set(scene.get("keywords") or []) & set(prev_scene.get("keywords") or [])
        
        cur_elements = scene.get("detected_elements", {})
        prev_elements = prev_scene.get("detected_elements", {})
        
        cur_actor = (cur_elements.get("primary_actor") or "").lower()
        prev_actor = (prev_elements.get("primary_actor") or "").lower()
        shared_actor = bool(cur_actor and cur_actor == prev_actor)
        
        overlap_objects = set(cur_elements.get("objects") or []) & set(prev_elements.get("objects") or [])
        
        if shared_actor or overlap_objects or overlap_keywords:
            cause = (prev_scene.get("caption") or "").strip()
            
            reasons = []
            if shared_actor: reasons.append(f"shared actor: {cur_actor}")
            if overlap_objects: reasons.append(f"shared objects: {sorted(overlap_objects)}")
            if overlap_keywords: reasons.append(f"shared keywords: {sorted(overlap_keywords)}")
            reason_str = ", ".join(reasons)
            
            results.append({
                "scene_id": scene_id,
                "event": event,
                "cause_scene_id": prev_id,
                "cause": cause,
                "causal_statement": f"{event}, likely because {cause.rstrip('.')} ({reason_str}).",
                "confidence": "mock-heuristic",
            })
        else:
            results.append({
                "scene_id": scene_id,
                "event": event,
                "cause_scene_id": None,
                "cause": None,
                "causal_statement": event,
                "confidence": "no_link_detected",
            })

    return results


# Real LLM causal reasoning backend — structurally complete, inference stubbed pending an API key.
#
# To make this real, will need:
#   - Provider/model selection via CAUSAL_LLM_PROVIDER (e.g. "openai" or "anthropic") and
#     CAUSAL_LLM_MODEL (e.g. "gpt-4o-mini" or "claude-...").
#   - API key env var depending on provider, e.g. OPENAI_API_KEY (already exists in this project)
#     or ANTHROPIC_API_KEY (would need to be added once that provider is used).
#   - Prompt structure: present each pair of consecutive scenes (caption + transcript_text +
#     start/end time) and ask the model to state, per pair, whether a plausible causal link
#     exists and what it is — explicitly instructed NOT to force a link where none is implied.
#     Ask for structured JSON output matching the schema documented at the top of this file so
#     it can be parsed directly into the same list[dict] shape the mock backend returns.

def llm_causal_backend(scenes, **kwargs):
    '''Infer causal links between consecutive scenes using a real LLM via Groq API.'''
    import os
    import json
    from utils.groq_client import execute_with_groq_failover
    
    model = os.getenv("LLM_MODEL", "llama-3.3-70b-versatile")

    scene_ids = sorted(scenes.keys())
    if len(scene_ids) == 1:
        cur = scenes[scene_ids[0]]
        return [{
            "scene_id": scene_ids[0],
            "event": cur.get("caption", ""),
            "cause_scene_id": None,
            "cause": None,
            "causal_statement": cur.get("caption", ""),
            "confidence": "no_prior_scene"
        }]

    pairs = []
    for i in range(1, len(scene_ids)):
        prev, cur = scenes[scene_ids[i - 1]], scenes[scene_ids[i]]
        pairs.append({
            "prev_scene_id": scene_ids[i - 1], "prev_caption": prev.get("caption", ""),
            "prev_action_summary": prev.get("action_summary", ""),
            "prev_detected_elements": prev.get("detected_elements", {}),
            "prev_transcript": prev.get("transcript_text", ""),
            "cur_scene_id": scene_ids[i], "cur_caption": cur.get("caption", ""),
            "cur_action_summary": cur.get("action_summary", ""),
            "cur_detected_elements": cur.get("detected_elements", {}),
            "cur_transcript": cur.get("transcript_text", ""),
        })
        
    prompt = (
        "For each pair of consecutive scenes below, state whether the later scene is a "
        "plausible causal consequence of the earlier one. Analyze `detected_elements` (primary_actor, objects, environment) "
        "and `action_summary` across consecutive scenes. Use shared objects and primary actors between scenes "
        "to detect stronger cause-and-effect links. Do not force a causal link where "
        "none is implied by the captions/transcript — it is fine to report no link. "
        "Return strictly a JSON object with a single key 'links' containing an array of these objects: {\"links\": [{scene_id, event, cause_scene_id, cause, "
        "causal_statement, confidence}, ...]}\n\n" + json.dumps(pairs, indent=2)
    )
    
    def _call(client):
        return client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
    
    response = execute_with_groq_failover(_call)
    
    content = response.choices[0].message.content.strip()
    
    # Try parsing directly
    try:
        data = json.loads(content)
        if isinstance(data, dict):
            # some models wrap it in a root key like 'links'
            for k in data:
                if isinstance(data[k], list):
                    return data[k]
            return [data] # Fallback
        return data
    except Exception as e:
        logging.error(f"Failed to parse Groq response: {content}")
        raise e


BACKENDS = {
    "mock": mock_causal_backend,
    "llm": llm_causal_backend,
}


def get_backend(name):
    '''Look up a causal reasoning backend function by name.'''

    if name not in BACKENDS:
        raise ValueError(f"Unknown CAUSAL_BACKEND: {name!r}. Valid options: {list(BACKENDS)}")
    return BACKENDS[name]
