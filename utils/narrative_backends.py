import logging

# Common backend signature: (scenes: dict, **kwargs) -> narrative: str

CONNECTORS = ["In the first scene,", "Next,", "Then,", "After that,", "Following that,", "Later,", "Finally,"]
TRANSCRIPT_SNIPPET_LEN = 100


def mock_narrative_backend(scenes, **kwargs):
    '''Deterministically stitch per-scene captions/transcripts into one paragraph, in scene order.'''

    scene_ids = sorted(scenes.keys())
    sentences = []

    for i, scene_id in enumerate(scene_ids):
        scene = scenes[scene_id]
        is_last = i == len(scene_ids) - 1
        if is_last and i != 0:
            connector = CONNECTORS[-1]
        else:
            connector = CONNECTORS[min(i, len(CONNECTORS) - 2)]

        caption = (scene.get("caption") or "").strip()
        action_summary = (scene.get("action_summary") or "").strip()
        transcript = (scene.get("transcript_text") or "").strip()

        sentence = f"{connector} {caption}"
        if action_summary:
            sentence += f" (Action: {action_summary})"
        if transcript:
            snippet = transcript[:TRANSCRIPT_SNIPPET_LEN]
            if len(transcript) > TRANSCRIPT_SNIPPET_LEN:
                snippet += "..."
            sentence += f' ("{snippet}")'
        sentences.append(sentence + ".")

    return " ".join(sentences)


# Real LLM narrative backend — structurally complete, inference stubbed pending an API key.
#
# To make this real, will need:
#   - Provider/model selection via NARRATIVE_LLM_PROVIDER (e.g. "openai" or "anthropic") and
#     NARRATIVE_LLM_MODEL (e.g. "gpt-4o-mini" or "claude-...").
#   - API key env var depending on provider, e.g. OPENAI_API_KEY (already exists in this project)
#     or ANTHROPIC_API_KEY (would need to be added once that provider is used).
#   - Prompt structure: a single prompt listing each scene in order with its start/end time,
#     caption, and transcript_text, asking the model to weave them into one coherent narrative
#     paragraph for the whole video (not a scene-by-scene list) — similar in spirit to
#     build_prompt_and_images() in chat_gpt_utils.py, but text-only (no images needed here).

def llm_narrative_backend(scenes, **kwargs):
    '''Generate a narrative using a real LLM via Groq API.'''
    import os
    from openai import OpenAI

    api_key = os.getenv("GROQ_API_KEY")
    model = os.getenv("LLM_MODEL", "llama-3.3-70b-versatile")
    if not api_key:
        raise ValueError("GROQ_API_KEY is not set.")
    
    client = OpenAI(api_key=api_key, base_url="https://api.groq.com/openai/v1")

    scene_lines = []
    for scene_id in sorted(scenes.keys()):
        scene = scenes[scene_id]
        scene_lines.append(
            f"[{scene_id} {scene['start_time']:.1f}-{scene['end_time']:.1f}s] "
            f"Caption: {scene.get('caption', '')} | Action Summary: {scene.get('action_summary', '')} | Transcript: {scene.get('transcript_text', '')}"
        )
    prompt = (
        "Merge the following per-scene descriptions of a video into a single coherent "
        "narrative paragraph describing the video as a continuous story:\n\n"
        + "\n".join(scene_lines)
    )
    
    response = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content.strip()


BACKENDS = {
    "mock": mock_narrative_backend,
    "llm": llm_narrative_backend,
}


def get_backend(name):
    '''Look up a narrative backend function by name.'''

    if name not in BACKENDS:
        raise ValueError(f"Unknown NARRATIVE_BACKEND: {name!r}. Valid options: {list(BACKENDS)}")
    return BACKENDS[name]
