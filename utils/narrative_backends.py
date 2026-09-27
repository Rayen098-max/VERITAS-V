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
    '''Generate a narrative using a real LLM. Not yet implemented — requires an API key.'''

    # provider = os.getenv("NARRATIVE_LLM_PROVIDER", "openai")
    # model = os.getenv("NARRATIVE_LLM_MODEL", "gpt-4o-mini")
    # api_key = os.getenv("OPENAI_API_KEY")  # or provider-specific key
    #
    # scene_lines = []
    # for scene_id in sorted(scenes.keys()):
    #     scene = scenes[scene_id]
    #     scene_lines.append(
    #         f"[{scene_id} {scene['start_time']:.1f}-{scene['end_time']:.1f}s] "
    #         f"Caption: {scene['caption']} | Action Summary: {scene.get('action_summary', '')} | Transcript: {scene.get('transcript_text', '')}"
    #     )
    # prompt = (
    #     "Merge the following per-scene descriptions of a video into a single coherent "
    #     "narrative paragraph describing the video as a continuous story:\n\n"
    #     + "\n".join(scene_lines)
    # )
    # response = <call provider chat completion API with prompt>
    # return response.strip()

    raise NotImplementedError(
        "LLM narrative backend not yet implemented — requires an API key (OpenAI/Anthropic/etc.), see README."
    )


BACKENDS = {
    "mock": mock_narrative_backend,
    "llm": llm_narrative_backend,
}


def get_backend(name):
    '''Look up a narrative backend function by name.'''

    if name not in BACKENDS:
        raise ValueError(f"Unknown NARRATIVE_BACKEND: {name!r}. Valid options: {list(BACKENDS)}")
    return BACKENDS[name]
