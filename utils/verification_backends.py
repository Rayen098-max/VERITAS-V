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
    '''Verify claims against frame images using a real vision-capable LLM. Not yet implemented.'''

    # provider = os.getenv("VERIFICATION_LLM_PROVIDER", "openai")
    # model = os.getenv("VERIFICATION_LLM_MODEL", "gpt-4o")
    # api_key = os.getenv("OPENAI_API_KEY")  # or provider-specific key
    #
    # results = []
    # for claim in claims:
    #     scene = scenes.get(claim["scene_id"], {})
    #     frame_files = scene.get("frame_files", [])
    #     prompt = (
    #         "Does the following claim about this video scene match what is visible in the "
    #         "attached frame images, and align with the action summary and detected elements? "
    #         "Classify as 'supported', 'contradicted', or "
    #         "'insufficient_evidence', and briefly explain why. Do not assume support just "
    #         f"because the claim sounds plausible.\n\nClaim: {claim['causal_statement']}\n"
    #         f"Action Summary: {scene.get('action_summary', '')}\n"
    #         f"Detected Elements: {scene.get('detected_elements', {})}"
    #     )
    #     response = <call vision-capable chat completion API with prompt + frame images>
    #     results.append(<parsed verdict/confidence/reasoning>)
    # return results

    raise NotImplementedError(
        "LLM verification backend not yet implemented — requires a vision-capable API key (OpenAI/Anthropic/etc.), see README."
    )


BACKENDS = {
    "mock": mock_verification_backend,
    "llm": llm_verification_backend,
}


def get_backend(name):
    '''Look up a verification backend function by name.'''

    if name not in BACKENDS:
        raise ValueError(f"Unknown VERIFICATION_BACKEND: {name!r}. Valid options: {list(BACKENDS)}")
    return BACKENDS[name]
